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
    return <p className="text-center text-gray-300 text-sm">Cargando detalle...</p>;
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

  // 🎛️ Estado UI
  const EstadoCell = ({ item }) => {
    const estado = (item.estado || "").toLowerCase();
    const showRevalidandoUI =
      estado === "revalidando" || pendingRevalIds.has(item.id);

    if (showRevalidandoUI) {
      return (
        <button
          disabled
          aria-busy
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-white text-[10px] bg-gray-500 cursor-not-allowed"
          title="Revalidando..."
        >
          Revalidando...
          <RefreshCw size={12} className="animate-spin" />
        </button>
      );
    }

    if (estado === "offline") {
      return (
        <button
          onClick={() => reintentarConsulta(item.id)}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-white text-[10px] bg-yellow-600/80 hover:bg-yellow-500 transition"
          title="Reintentar"
        >
          offline
          <RefreshCw size={12} />
        </button>
      );
    }

    const color =
      estado === "validado"
        ? "text-green-400"
        : estado === "error"
        ? "text-red-400"
        : "text-gray-300";

    return <span className={`font-medium ${color}`}>{item.estado}</span>;
  };

  return (
    <div className="mt-16 w-full text-xs pr-32 pl-16">
      <h2 className="text-lg font-semibold mb-2 text-white">
        Resultados de la consulta #{consultaId}
      </h2>

      {/* 🔍 Barra de búsqueda y filtros */}
      <div className="flex flex-wrap gap-2 mb-3">
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-2 py-1 rounded bg-white/10 border border-white/20 text-gray-200 text-xs"
        />
        <input
          type="text"
          placeholder="Fuente"
          value={filters.fuente}
          onChange={(e) => setFilters({ ...filters, fuente: e.target.value })}
          className="px-2 py-1 rounded bg-white/10 border border-white/20 text-gray-200 text-xs"
        />
        <input
          type="text"
          placeholder="Tipo de Fuente"
          value={filters.tipo_fuente}
          onChange={(e) => setFilters({ ...filters, tipo_fuente: e.target.value })}
          className="px-2 py-1 rounded bg-white/10 border border-white/20 text-gray-200 text-xs"
        />
        <select
          value={filters.estado}
          onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
          className="px-2 py-1 rounded bg-white/10 border border-white/20 text-gray-200 text-xs"
        >
          <option value="">Todos los estados</option>
          <option value="validado">validado</option>
          <option value="offline">offline</option>
          <option value="error">error</option>
          <option value="revalidando">revalidando</option>
        </select>
        <input
          type="text"
          placeholder="Score"
          value={filters.score}
          onChange={(e) => setFilters({ ...filters, score: e.target.value })}
          className="px-2 py-1 rounded bg-white/10 border border-white/20 text-gray-200 text-xs"
        />

        <button
          onClick={() =>
            setFilters({ fuente: "", tipo_fuente: "", estado: "", score: "" })
          }
          className="inline-flex items-center px-3 py-1 rounded-lg text-white text-xs
                     bg-gradient-to-r from-blue-500 to-blue-700
                     hover:brightness-110 active:scale-[0.98] transition
                     focus:outline-none focus:ring-2 focus:ring-blue-400/60"
        >
          Limpiar
        </button>
      </div>

      <div className="backdrop-blur-md bg-white/5 border border-white/10 shadow-md rounded-xl p-2 text-gray-200 overflow-x-auto">
        <table className="table-auto text-left text-xs min-w-full w-1/2">
          <thead className="bg-white/10 border-b border-white/20">
            <tr>
              <th className="px-2 py-1">Fuente</th>
              <th className="px-2 py-1">Tipo de Fuente</th>
              <th className="px-2 py-1">Estado</th>
              <th className="px-2 py-1">Score</th>
              <th className="px-2 py-1">Evidencia</th>
            </tr>
          </thead>
          <tbody>
            {datosPagina.length > 0 ? (
              datosPagina.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-white/10 hover:bg-white/5 transition"
                >
                  <td className="px-2 py-1">{item.fuente}</td>
                  <td className="px-2 py-1">{item.tipo_fuente}</td>
                  <td className="px-2 py-1">
                    <EstadoCell item={item} />
                  </td>
                  <td className="px-2 py-1">{item.score}</td>
                  <td className="px-2 py-1">
                    {item.archivo ? (
                      <div className="flex items-center gap-2">
                        <a
                          href={buildMediaUrl(item.archivo)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white 
                                     bg-gradient-to-r from-blue-500 to-blue-700 
                                     shadow-sm hover:shadow transition 
                                     hover:scale-[1.03] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-400/60"
                          title="Ver evidencia"
                          aria-label="Ver evidencia"
                        >
                          <Eye size={16} />
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
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white 
                                     bg-gradient-to-r from-cyan-400 to-blue-500 
                                     shadow-sm hover:shadow transition 
                                     hover:scale-[1.03] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
                          title="Descargar como PDF"
                          aria-label="Descargar como PDF"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-[10px]">Sin archivo</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-2 italic">
                  No se encontraron resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 📑 Paginación */}
      <div className="flex justify-center items-center gap-2 mt-2 text-gray-300 text-xs pl-[15rem] pr-[15rem]">
        <button
          onClick={() => setPagina((prev) => Math.max(prev - 1, 1))}
          disabled={pagina === 1}
          className="px-2 py-0.5 bg-white/10 border border-white/20 rounded disabled:opacity-40 hover:bg-white/20 transition text-[11px]"
        >
          ←
        </button>

        {getPages().map((p, i) =>
          p === "..." ? (
            <span key={i} className="px-2">...</span>
          ) : (
            <button
              key={i}
              onClick={() => setPagina(p)}
              className={`px-2 py-0.5 rounded ${
                p === pagina
                  ? "bg-blue-500 text-white"
                  : "bg-white/10 border border-white/20 hover:bg-white/20"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => setPagina((prev) => Math.min(prev + 1, totalPaginas))}
          disabled={pagina === totalPaginas || totalPaginas === 0}
          className="px-2 py-0.5 bg-white/10 border border-white/20 rounded disabled:opacity-40 hover:bg-white/20 transition text-[11px]"
        >
          →
        </button>

        {/* Ir a página */}
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value)}
            className="w-10 px-1 py-0.5 rounded bg-white/10 border border-white/20 text-center text-gray-200 text-[11px]"
          />
          <button
            onClick={() => {
              const num = parseInt(inputPage, 10);
              if (num >= 1 && num <= totalPaginas) {
                setPagina(num);
                setInputPage("");
              }
            }}
            className="px-2 py-0.5 bg-blue-600 text-white rounded hover:bg-blue-500 text-[11px]"
          >
            Go
          </button>
        </div>
      </div>
    </div>
  );
}
