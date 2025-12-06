// DetalleResultados.jsx
import { useEffect, useState } from "react";
import { RefreshCw, Eye, Download } from "lucide-react";
import { jsPDF } from "jspdf";

export default function DetalleResultados({ consultaId }) {
  const [detalle, setDetalle] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ids marcados localmente como "revalidando" tras click en offline
  const [pendingRevalIds, setPendingRevalIds] = useState(() => new Set());

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    fuente: "",
    tipo_fuente: "",
    estado: "",
    score: "",
  });
  const [pagina, setPagina] = useState(1);
  const [inputPage, setInputPage] = useState("");
  const porPagina = 6;

  const API_URL = process.env.REACT_APP_API_URL;

  const buildMediaUrl = (rawPath) =>
    `${API_URL}/media/${(rawPath || "").replace(/^.*?media[\\/]/, "")}`;

  // ---------- Helpers descarga ----------
  const blobToDataURL = async (blob) => {
    const mime = blob.type.toLowerCase();
    if (!mime.includes("webp")) {
      return await new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result);
        fr.onerror = reject;
        fr.readAsDataURL(blob);
      });
    }
    const tmpUrl = URL.createObjectURL(blob);
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = tmpUrl;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(tmpUrl);
    return canvas.toDataURL("image/jpeg", 0.95);
  };

  const downloadEvidenceAsPdf = async (archivo, nombreBase = "evidencia") => {
    const url = buildMediaUrl(archivo);
    const token = localStorage.getItem("token");

    const res = await fetch(url, {
      headers: token ? { Authorization: `Token ${token}` } : undefined,
    });
    if (!res.ok) throw new Error(`No se pudo obtener el archivo (${res.status})`);

    const blob = await res.blob();
    const mime = blob.type.toLowerCase();

    if (mime.includes("pdf")) {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${nombreBase}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
      return;
    }

    if (mime.startsWith("image/")) {
      const dataUrl = await blobToDataURL(blob);
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = dataUrl;
      });

      const isLandscape = img.width > img.height;
      const pdf = new jsPDF({
        orientation: isLandscape ? "l" : "p",
        unit: "pt",
        format: "a4",
      });

      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 24;
      const maxW = pageW - margin * 2;
      const maxH = pageH - margin * 2;

      let w = img.width;
      let h = img.height;
      const ratio = Math.min(maxW / w, maxH / h);
      w *= ratio;
      h *= ratio;

      const x = (pageW - w) / 2;
      const y = (pageH - h) / 2;
      const imgType = dataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";
      pdf.addImage(dataUrl, imgType, x, y, w, h);
      pdf.save(`${nombreBase}.pdf`);
      return;
    }

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${nombreBase}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  };
  // --------------------------------------

  useEffect(() => {
    setPagina(1);
  }, [search, filters]);

  // 🔄 Obtener resultados
  const fetchDetalle = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/resultados/${consultaId}/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      const json = await res.json();
      setDetalle(json);

      // Reconciliar overlay local con lo que venga del backend
      setPendingRevalIds((prev) => {
        const next = new Set(prev);
        for (const it of json) {
          const est = (it.estado || "").toLowerCase();
          if (next.has(it.id)) {
            // Si el backend ya pasó a un estado final (ni offline ni revalidando),
            // quitamos el overlay local.
            if (est !== "offline" && est !== "revalidando") {
              next.delete(it.id);
            }
            // Si el backend YA muestra "revalidando", podemos quitar el overlay y
            // dejar que el servidor gobierne la UI.
            if (est === "revalidando") {
              next.delete(it.id);
            }
          }
        }
        return next;
      });
    } catch (error) {
      console.error("Error al obtener detalle:", error);
    } finally {
      setLoading(false);
    }
  };

  // 📌 Al montar + refresco automático cada 5s
  useEffect(() => {
    fetchDetalle();
    const interval = setInterval(fetchDetalle, 5000);
    return () => clearInterval(interval);
  }, [consultaId]);

  // 🚀 Reintentar consulta (offline → revalidando UI inmediata)
  const reintentarConsulta = async (id) => {
    try {
      // Marcar localmente como "revalidando" para que NO parpadee a offline
      setPendingRevalIds((prev) => new Set(prev).add(id));

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/relanzar_bot/${id}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });
      if (!res.ok) throw new Error("Error al relanzar bot");
      await res.json();

      // No quitamos el overlay aquí: lo quitará fetchDetalle cuando el backend cambie de estado
      // (a "revalidando" o a un estado final).
      // Forzamos un refresh ahora para acelerar el reflejo visual.
      fetchDetalle();
    } catch (err) {
      console.error("❌ Error:", err);
      // Si falló el POST, devolvemos el id a su estado normal
      setPendingRevalIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-cyan-400 animate-spin shadow-[0_0_20px_rgba(6,182,212,0.5)]" />
        <p className="text-slate-300 text-sm font-semibold">Cargando detalles...</p>
      </div>
    );
  }

  // 🔍 Filtros
  const datosFiltrados = detalle.filter((item) => {
    const globalMatch = Object.values(item)
      .join(" ")
      .toLowerCase()
      .includes((search || "").toLowerCase());

    const filtersMatch =
      (filters.fuente === "" ||
        (item.fuente || "").toLowerCase().includes(filters.fuente.toLowerCase())) &&
      (filters.tipo_fuente === "" ||
        (item.tipo_fuente || "")
          .toLowerCase()
          .includes(filters.tipo_fuente.toLowerCase())) &&
      (filters.estado === "" ||
        (item.estado || "").toLowerCase().includes(filters.estado.toLowerCase())) &&
      (filters.score === "" ||
        String(item.score || "")
          .toLowerCase()
          .includes(filters.score.toLowerCase()));

    return globalMatch && filtersMatch;
  });

  // 📑 Paginación
  const totalPaginas = Math.ceil(datosFiltrados.length / porPagina);
  const startIndex = (pagina - 1) * porPagina;
  const datosPagina = datosFiltrados.slice(startIndex, startIndex + porPagina);

  const getPages = () => {
    let pages = [];
    let start = Math.max(1, pagina - 2);
    let end = Math.min(totalPaginas, pagina + 2);

    if (start > 1) pages.push(1, "...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPaginas) pages.push("...", totalPaginas);

    return pages;
  };

  // 🎛️ Estado UI con badges elegantes
  const EstadoCell = ({ item }) => {
    const estado = (item.estado || "").toLowerCase();
    const showRevalidandoUI =
      estado === "revalidando" || pendingRevalIds.has(item.id);

    if (showRevalidandoUI) {
      return (
        <span
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-slate-600/20 to-slate-700/20 border border-slate-500/30 text-slate-300 font-semibold text-xs"
          title="Revalidando..."
        >
          <RefreshCw size={14} className="animate-spin" />
          Revalidando
        </span>
      );
    }

    if (estado === "offline") {
      return (
        <button
          onClick={() => reintentarConsulta(item.id)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 hover:border-amber-400/50 text-amber-300 hover:text-amber-200 font-semibold text-xs transition-all duration-300 hover:scale-105 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]"
          title="Reintentar"
        >
          <RefreshCw size={14} />
          Offline
        </button>
      );
    }

    if (estado === "validado") {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-semibold text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Validado
        </span>
      );
    }

    if (estado === "error") {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 text-red-400 font-semibold text-xs shadow-[0_0_15px_rgba(239,68,68,0.3)]">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          Error
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 text-xs font-medium">
        {item.estado || "—"}
      </span>
    );
  };

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-3 md:py-4 h-full flex flex-col">
      {/* Header elegante */}
      <div className="mb-3 md:mb-4">
        <div className="inline-block px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 mb-1.5">
          <span className="text-cyan-300 text-[10px] md:text-xs font-medium">Consulta #{consultaId}</span>
        </div>
        <h2 className="text-xl md:text-2xl lg:text-3xl font-black bg-gradient-to-r from-white via-cyan-100 to-blue-300 bg-clip-text text-transparent">
          Detalles de Resultados
        </h2>
      </div>

      {/* 🔍 Barra de búsqueda y filtros elegantes */}
      <div className="flex flex-wrap gap-1.5 md:gap-2 mb-2 md:mb-3">
        <input
          type="text"
          placeholder="🔍 Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[150px] px-2 md:px-3 py-1.5 md:py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-sm text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
        />
        <input
          type="text"
          placeholder="Fuente"
          value={filters.fuente}
          onChange={(e) => setFilters({ ...filters, fuente: e.target.value })}
          className="w-24 md:w-28 px-2 md:px-3 py-1.5 md:py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-xs md:text-sm text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
        />
        <input
          type="text"
          placeholder="Tipo"
          value={filters.tipo_fuente}
          onChange={(e) => setFilters({ ...filters, tipo_fuente: e.target.value })}
          className="w-20 md:w-24 px-2 md:px-3 py-1.5 md:py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-xs md:text-sm text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
        />
        <select
          value={filters.estado}
          onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
          className="w-28 md:w-32 px-2 md:px-3 py-1.5 md:py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-xs md:text-sm text-white focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all appearance-none cursor-pointer"
        >
          <option className="bg-slate-900" value="">Todos</option>
          <option className="bg-slate-900" value="validado">Validado</option>
          <option className="bg-slate-900" value="offline">Offline</option>
          <option className="bg-slate-900" value="error">Error</option>
          <option className="bg-slate-900" value="revalidando">Revalidando</option>
        </select>
        <input
          type="text"
          placeholder="Score"
          value={filters.score}
          onChange={(e) => setFilters({ ...filters, score: e.target.value })}
          className="w-16 md:w-20 px-2 md:px-3 py-1.5 md:py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-xs md:text-sm text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
        />

        <button
          onClick={() =>
            setFilters({ fuente: "", tipo_fuente: "", estado: "", score: "" })
          }
          className="inline-flex items-center px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-white text-xs md:text-sm font-semibold bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300"
        >
          Limpiar
        </button>
      </div>

      {/* Contenedor con scroll para la tabla */}
      <div className="flex-1 overflow-auto backdrop-blur-xl bg-gradient-to-br from-slate-900/50 via-blue-950/30 to-slate-900/50 border border-cyan-500/20 shadow-[0_8px_32px_rgba(6,182,212,0.15)] rounded-xl md:rounded-2xl mb-3 md:mb-4">
        <table className="table-auto text-left text-sm min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-b border-cyan-500/20">
              <th className="px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-bold text-cyan-400 uppercase tracking-wider">Fuente</th>
              <th className="px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-bold text-cyan-400 uppercase tracking-wider">Tipo</th>
              <th className="px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-bold text-cyan-400 uppercase tracking-wider">Estado</th>
              <th className="px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-bold text-cyan-400 uppercase tracking-wider">Score</th>
              <th className="px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-bold text-cyan-400 uppercase tracking-wider text-center">Evidencia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyan-500/10">
            {datosPagina.length > 0 ? (
              datosPagina.map((item) => (
                <tr
                  key={item.id}
                  className="group hover:bg-gradient-to-r hover:from-cyan-500/5 hover:to-blue-500/5 transition-all duration-300"
                >
                  <td className="px-2 md:px-3 py-1.5 md:py-2 text-slate-200 font-semibold text-xs md:text-sm">{item.fuente}</td>
                  <td className="px-2 md:px-3 py-1.5 md:py-2 text-slate-300 text-xs md:text-sm">{item.tipo_fuente}</td>
                  <td className="px-2 md:px-3 py-1.5 md:py-2">
                    <EstadoCell item={item} />
                  </td>
                  <td className="px-2 md:px-3 py-1.5 md:py-2">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 md:py-1 rounded-lg bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-cyan-500/20 text-cyan-300 font-bold text-xs md:text-sm">
                      {item.score}
                    </span>
                  </td>
                  <td className="px-2 md:px-3 py-1.5 md:py-2">
                    {item.archivo ? (
                      <div className="flex items-center justify-center gap-1">
                        <a
                          href={buildMediaUrl(item.archivo)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-lg text-white 
                                     bg-gradient-to-r from-blue-500 to-blue-600 
                                     hover:from-blue-400 hover:to-blue-500
                                     shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]
                                     transition-all duration-300
                                     hover:scale-110 active:scale-95"
                          title="Ver evidencia"
                          aria-label="Ver evidencia"
                        >
                          <Eye size={14} className="md:w-4 md:h-4" />
                        </a>
                        <button
                          onClick={() =>
                            downloadEvidenceAsPdf(
                              item.archivo,
                              `${(item.fuente || "evidencia")
                                .replace(/\s+/g, "_")
                                .toLowerCase()}_${consultaId}_${item.id}`
                            )
                          }
                          className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-lg text-white 
                                     bg-gradient-to-r from-cyan-500 to-blue-500 
                                     hover:from-cyan-400 hover:to-blue-400
                                     shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]
                                     transition-all duration-300
                                     hover:scale-110 active:scale-95"
                          title="Descargar como PDF"
                          aria-label="Descargar como PDF"
                        >
                          <Download size={14} className="md:w-4 md:h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-xs italic text-center block">Sin archivo</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-cyan-500/20 flex items-center justify-center">
                      <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-slate-400 text-sm italic">No se encontraron resultados</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 📑 Paginación elegante - Fija en la parte inferior */}
      <div className="flex flex-wrap justify-center items-center gap-2 pb-1">
        <button
          onClick={() => setPagina((prev) => Math.max(prev - 1, 1))}
          disabled={pagina === 1}
          className="px-3 py-1.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/30 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed text-cyan-300 font-semibold transition-all duration-300 flex items-center gap-1.5 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Anterior
        </button>

        <div className="flex items-center gap-2">
          {getPages().map((p, i) =>
            p === "..." ? (
              <span key={i} className="px-2 text-slate-500">...</span>
            ) : (
              <button
                key={i}
                onClick={() => setPagina(p)}
                className={`w-9 h-9 rounded-lg font-semibold transition-all duration-300 text-sm ${
                  p === pagina
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] scale-110"
                    : "bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-cyan-500/20 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300"
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        <button
          onClick={() => setPagina((prev) => Math.min(prev + 1, totalPaginas))}
          disabled={pagina === totalPaginas || totalPaginas === 0}
          className="px-3 py-1.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/30 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed text-cyan-300 font-semibold transition-all duration-300 flex items-center gap-1.5 text-sm"
        >
          Siguiente
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Ir a página */}
        <div className="flex items-center gap-2 ml-4">
          <input
            type="number"
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value)}
            placeholder="Pág."
            className="w-16 px-3 py-2 rounded-lg bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-cyan-500/20 text-center text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all text-sm"
          />
          <button
            onClick={() => {
              const num = parseInt(inputPage, 10);
              if (num >= 1 && num <= totalPaginas) {
                setPagina(num);
                setInputPage("");
              }
            }}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg font-semibold transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:scale-105 text-sm"
          >
            Ir
          </button>
        </div>
      </div>
    </div>
  );
}
