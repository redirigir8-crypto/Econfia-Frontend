// DetalleResultados.jsx
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  RefreshCw,
  Eye,
  Download,
  X,
  Database,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { jsPDF } from "jspdf";

export default function DetalleResultados({ consultaId }) {
  const [detalle, setDetalle] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resultadoModal, setResultadoModal] = useState(null);
  const [procesosModal, setProcesosModal] = useState(null);
  const [garantiasModal, setGarantiasModal] = useState(null);
  const [modalAnimating, setModalAnimating] = useState(false);
  const [modalOrigin, setModalOrigin] = useState({ x: 0, y: 0 });
  const [modalVector, setModalVector] = useState({ x: 0, y: 0 });

  const modalCardRef = useRef(null);
  const closeTimerRef = useRef(null);
  const openRafRef = useRef(null);
  const openRaf2Ref = useRef(null);
  const MODAL_ANIMATION_MS = 8000;

  

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

  const hasEvidenceFile = (archivo) => {
    if (typeof archivo !== "string") return false;
    return archivo.trim().length > 0;
  };

  const getNumericScore = (scoreValue) => {
    const parsed = Number(scoreValue);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const isPositiveResult = (item) => {
    const numericScore = getNumericScore(item?.score);
    if (numericScore !== null) return numericScore >= 3;
    const estado = (item?.estado || "").toLowerCase();
    return estado === "validado" || estado === "completado";
  };

  const normalizeMensaje = (mensaje) => {
    if (mensaje == null) return "Sin mensaje disponible.";
    if (typeof mensaje !== "string") {
      try {
        return JSON.stringify(mensaje, null, 2);
      } catch {
        return String(mensaje);
      }
    }

    const cleaned = mensaje.trim();
    if (!cleaned) return "Sin mensaje disponible.";

    const looksLikeJson = cleaned.startsWith("{") || cleaned.startsWith("[");
    if (looksLikeJson) {
      try {
        const parsed = JSON.parse(cleaned);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return cleaned;
      }
    }

    return cleaned;
  };

  const toTitleCase = (value) => {
    if (!value) return "Sin estado";
    const txt = String(value).trim();
    if (!txt) return "Sin estado";
    return txt.charAt(0).toUpperCase() + txt.slice(1);
  };

  const getModalVisualState = (item) => {
    const rawScore = getNumericScore(item?.score);
    const alerta = isPositiveResult(item);

    let normalizedScore;
    if (rawScore === null) {
      normalizedScore = alerta ? 3 : 1;
    } else {
      normalizedScore = Math.min(5, Math.max(0, rawScore));
    }

    const circumference = 2 * Math.PI * 45;
    const dashOffset = circumference * (1 - normalizedScore / 5);

    if (normalizedScore >= 4) {
      return {
        scoreText: rawScore !== null ? String(rawScore) : "N/A",
        statusLabel: "Riesgo Alto",
        ringColor: "#fb7185",
        dotClass: "bg-rose-400",
        scoreTone: "text-rose-300",
        statusTone: "text-rose-300 border-rose-400/30 bg-rose-500/10",
        bannerTone:
          "border-rose-400/30 bg-gradient-to-r from-rose-500/12 to-red-500/12",
        bannerTitle: "Análisis completado",
        bannerText: "Resultado con alerta",
        badgeGlow: "shadow-[0_0_12px_rgba(251,113,133,0.55)]",
        dashOffset,
      };
    }

    if (normalizedScore >= 3 || alerta) {
      return {
        scoreText: rawScore !== null ? String(rawScore) : "N/A",
        statusLabel: "Riesgo Medio",
        ringColor: "#f59e0b",
        dotClass: "bg-amber-400",
        scoreTone: "text-amber-300",
        statusTone: "text-amber-300 border-amber-400/30 bg-amber-500/10",
        bannerTone:
          "border-amber-400/30 bg-gradient-to-r from-amber-500/12 to-orange-500/12",
        bannerTitle: "Análisis completado",
        bannerText: "Requiere revisión adicional",
        badgeGlow: "shadow-[0_0_12px_rgba(245,158,11,0.55)]",
        dashOffset,
      };
    }

    if (normalizedScore > 0) {
      return {
        scoreText: rawScore !== null ? String(rawScore) : "N/A",
        statusLabel: "Riesgo Mínimo",
        ringColor: "#10b981",
        dotClass: "bg-emerald-400",
        scoreTone: "text-emerald-300",
        statusTone: "text-emerald-300 border-emerald-400/30 bg-emerald-500/10",
        bannerTone:
          "border-emerald-400/30 bg-gradient-to-r from-emerald-500/12 to-cyan-500/12",
        bannerTitle: "Análisis completado",
        bannerText: "Sin hallazgo relevante",
        badgeGlow: "shadow-[0_0_12px_rgba(16,185,129,0.55)]",
        dashOffset,
      };
    }

    return {
      scoreText: rawScore !== null ? String(rawScore) : "N/A",
      statusLabel: "Sin Clasificar",
      ringColor: "#38bdf8",
      dotClass: "bg-cyan-400",
      scoreTone: "text-cyan-300",
      statusTone: "text-cyan-300 border-cyan-400/30 bg-cyan-500/10",
      bannerTone:
        "border-cyan-400/30 bg-gradient-to-r from-cyan-500/12 to-blue-500/12",
      bannerTitle: "Análisis completado",
      bannerText: "Información parcial disponible",
      badgeGlow: "shadow-[0_0_12px_rgba(56,189,248,0.55)]",
      dashOffset,
    };
  };

  const openResultadoModal = (item, event) => {
    const rect = event?.currentTarget?.getBoundingClientRect?.();
    const fallbackX = typeof window !== "undefined" ? window.innerWidth / 2 : 0;
    const fallbackY = typeof window !== "undefined" ? window.innerHeight / 2 : 0;

    setModalOrigin(
      rect
        ? {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          }
        : { x: fallbackX, y: fallbackY }
    );

    setResultadoModal(item);
  };

  const closeResultadoModal = () => {
    setModalAnimating(false);

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = setTimeout(() => {
      setResultadoModal(null);
      closeTimerRef.current = null;
    }, MODAL_ANIMATION_MS);
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

  useEffect(() => {
    if (!resultadoModal) {
      setModalAnimating(false);
      setModalVector({ x: 0, y: 0 });
      return;
    }

    setModalAnimating(false);

    openRafRef.current = requestAnimationFrame(() => {
      const modalEl = modalCardRef.current;

      if (modalEl) {
        const rect = modalEl.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        setModalVector({
          x: modalOrigin.x - centerX,
          y: modalOrigin.y - centerY,
        });
      } else {
        setModalVector({ x: 0, y: 0 });
      }

      openRaf2Ref.current = requestAnimationFrame(() => {
        setModalAnimating(true);
      });
    });

    return () => {
      if (openRafRef.current) {
        cancelAnimationFrame(openRafRef.current);
      }
      if (openRaf2Ref.current) {
        cancelAnimationFrame(openRaf2Ref.current);
      }
    };
  }, [resultadoModal, modalOrigin.x, modalOrigin.y]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
      if (openRafRef.current) {
        cancelAnimationFrame(openRafRef.current);
      }
      if (openRaf2Ref.current) {
        cancelAnimationFrame(openRaf2Ref.current);
      }
    };
  }, []);

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
    const estadoRaw = item.estado || "";
    const estado = estadoRaw.toLowerCase();
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

    // Accept 'Validado', 'Validada' (any case)
    if (["validado", "validada"].includes(estado)) {
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
                    {hasEvidenceFile(item.archivo) ? (
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
                    ) : item.mensaje || item.score != null ? (
                      <div className="flex items-center justify-center">
                        {isPositiveResult(item) ? (
                          <button
                            onClick={(e) => openResultadoModal(item, e)}
                            className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-white
                                       bg-gradient-to-r from-red-500/80 to-rose-500/80
                                       hover:from-red-400 hover:to-rose-400
                                       shadow-[0_0_15px_rgba(239,68,68,0.25)] hover:shadow-[0_0_20px_rgba(239,68,68,0.45)]
                                       transition-all duration-300
                                       hover:scale-105 active:scale-95 text-xs font-semibold"
                            title="Ver resultado con alerta"
                            aria-label="Ver resultado con alerta"
                          >
                            Ver resultado
                          </button>
                        ) : (
                          <button
                            onClick={(e) => openResultadoModal(item, e)}
                            className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-slate-300
                                       bg-gradient-to-r from-slate-600/50 to-slate-700/50
                                       hover:from-slate-500/60 hover:to-slate-600/60
                                       border border-slate-500/30
                                       transition-all duration-300
                                       hover:scale-105 active:scale-95 text-xs font-semibold"
                            title="Ver detalle"
                            aria-label="Ver detalle"
                          >
                            Ver detalle
                          </button>
                        )}
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

      {resultadoModal &&
        (() => {
          const visual = getModalVisualState(resultadoModal);

          return createPortal(
            <div
              className={`fixed inset-0 z-[12000] overflow-y-auto p-4 sm:p-8 bg-[radial-gradient(circle_at_center,#0f172a_0%,#020617_100%)] transition-opacity duration-300 ease-out ${
                modalAnimating ? "opacity-100" : "opacity-0"
              }`}
              onClick={closeResultadoModal}
            >
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(0deg,transparent_24%,rgba(59,130,246,0.05)_25%,rgba(59,130,246,0.05)_26%,transparent_27%,transparent_74%,rgba(59,130,246,0.05)_75%,rgba(59,130,246,0.05)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(59,130,246,0.05)_25%,rgba(59,130,246,0.05)_26%,transparent_27%,transparent_74%,rgba(59,130,246,0.05)_75%,rgba(59,130,246,0.05)_76%,transparent_77%,transparent)] bg-[length:50px_50px] opacity-40" />
              <div className="absolute top-1/4 -left-20 w-64 h-64 rounded-full blur-[100px] bg-cyan-500/10 animate-pulse" />
              <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full blur-[100px] bg-emerald-500/10 animate-pulse" />

              <div
                ref={modalCardRef}
                className={`relative mx-auto w-full max-w-4xl rounded-[2rem] overflow-hidden backdrop-blur-xl bg-white/[0.03] border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(255,255,255,0.02)] transform-gpu will-change-transform transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  modalAnimating ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  transform: modalAnimating
                    ? "translate3d(0,0,0) scale(1)"
                    : `translate3d(${modalVector.x}px, ${modalVector.y}px, 0) scale(0.08)`,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />

                <header className="flex items-center justify-between px-6 sm:px-8 py-5 sm:py-6 border-b border-white/5 relative z-10">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-1 text-cyan-300">
                      Security Audit
                    </p>
                    <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                      Análisis de Integridad de Datos - Resultado
                    </h3>
                  </div>
                  <button
                    onClick={closeResultadoModal}
                    className="group inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300 border border-white/5"
                    aria-label="Cerrar modal"
                  >
                    <span>Cerrar</span>
                    <X size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                </header>

                <main className="p-6 sm:p-8 space-y-7 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-5 flex justify-center">
                      <div className="relative w-48 h-48 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border border-white/5 animate-[spin_8s_linear_infinite]" />
                        <div className="absolute inset-2 rounded-full border border-dashed border-cyan-300/20" />

                        {(() => {
                          const radius = 45;
                          const circumference = 2 * Math.PI * radius;
                          const arc = circumference * 0.22;
                          const gap = circumference - arc;

                          return (
                            <div className="w-full h-full">
                              <svg className="w-full h-full" viewBox="0 0 100 100" aria-hidden="true">
                                <circle
                                  cx="50"
                                  cy="50"
                                  r={radius}
                                  fill="none"
                                  stroke="rgba(255,255,255,0.08)"
                                  strokeWidth="6"
                                />
                                <circle
                                  cx="50"
                                  cy="50"
                                  r={radius}
                                  fill="none"
                                  stroke={visual.ringColor}
                                  strokeWidth="5"
                                  opacity="0.05"
                                  className="transition-colors duration-500"
                                />
                                <circle
                                  cx="50"
                                  cy="50"
                                  r={radius}
                                  fill="none"
                                  stroke={visual.ringColor}
                                  strokeWidth="6"
                                  strokeLinecap="round"
                                  strokeDasharray={`${arc} ${gap}`}
                                  className="transition-colors duration-500"
                                  transform="rotate(-90 50 50)"
                                >
                                  <animateTransform
                                    attributeName="transform"
                                    type="rotate"
                                    from="-90 50 50"
                                    to="270 50 50"
                                    dur="1.5s"
                                    repeatCount="indefinite"
                                  />
                                </circle>
                              </svg>
                            </div>
                          );
                        })()}

                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Score
                          </span>
                          <span className={`text-6xl font-black text-white ${visual.badgeGlow}`}>
                            {visual.scoreText}
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${visual.scoreTone}`}>
                            {visual.statusLabel}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-7 space-y-4">
                      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-300/30 transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Estado de Validación
                          </span>
                          <span className={`h-2.5 w-2.5 rounded-full ${visual.dotClass} ${visual.badgeGlow}`} />
                        </div>
                        <p className="text-2xl font-semibold text-white capitalize">
                          {toTitleCase(resultadoModal.estado)}
                        </p>
                      </div>

                      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all duration-300">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">
                          Fuente de Datos
                        </span>
                        <div className="flex items-center gap-3">
                          <Database size={18} className="text-cyan-300" />
                          <p className="text-white font-medium leading-snug">
                            {resultadoModal.fuente || "Sin fuente"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <section className="relative">
                    <div className="absolute -inset-0.5 rounded-2xl blur opacity-40 bg-gradient-to-r from-cyan-400/20 to-emerald-400/20" />
                    <div
                      className={`relative border rounded-2xl p-5 sm:p-6 overflow-hidden ${visual.bannerTone}`}
                    >
                      <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 translate-x-10 pointer-events-none" />
                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                          {isPositiveResult(resultadoModal) ? (
                            <ShieldAlert size={28} className="text-rose-300" />
                          ) : (
                            <ShieldCheck size={28} className="text-emerald-300" />
                          )}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 mb-1">
                            {visual.bannerTitle}
                          </p>
                          <p className="text-lg sm:text-xl font-bold text-white">
                            {visual.bannerText}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Detalle Técnico del Registro
                      </h4>
                      <span className="text-[9px] text-white/30 font-mono">
                        CODE: RES_{resultadoModal.id || "N/A"}
                      </span>
                    </div>

                    <div className="w-full p-5 rounded-2xl bg-black/40 border border-white/10 font-mono relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-300/40" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 pl-3">
                        <div className="text-xs">
                          <p className="text-slate-400 uppercase tracking-wider mb-1">Tipo</p>
                          <p className="text-slate-100 font-semibold">
                            {resultadoModal.tipo_fuente || "Sin categoría"}
                          </p>
                        </div>
                        <div className="text-xs sm:text-right">
                          <p className="text-slate-400 uppercase tracking-wider mb-1">Score registrado</p>
                          <p className={`font-bold ${visual.scoreTone}`}>
                            {resultadoModal.score ?? "N/A"}
                          </p>
                        </div>
                      </div>

                      <pre className="pl-3 text-xs md:text-sm text-cyan-100/90 whitespace-pre-wrap break-words max-h-[32vh] overflow-auto leading-relaxed">
                        {normalizeMensaje(resultadoModal.mensaje)}
                      </pre>
                    </div>
                  </section>

                  {/* Garantías Mobiliarias — lista de garantías */}
                  {resultadoModal.datos_extra?.procesos?.length > 0 &&
                  (resultadoModal.fuente_nombre || "").includes("garantias_mobiliarias") ? (
                    <section className="space-y-2">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-amber-400 px-1">
                        Garantías Registradas ({resultadoModal.datos_extra.procesos.length})
                      </h4>
                      {resultadoModal.datos_extra.procesos.map((proc, i) => (
                        <div key={i} className="flex items-center justify-between rounded-xl border border-amber-500/25 bg-amber-950/20 px-4 py-3">
                          <div className="space-y-0.5">
                            <p className="text-amber-300 font-mono text-xs font-bold">{proc.radicado || "Sin folio"}</p>
                            <p className="text-slate-400 text-[11px]">Acreedor: {proc.despacho || "—"}</p>
                            <p className="text-slate-500 text-[10px]">{proc.fecha_radicacion || ""}{proc.ultima_actuacion ? ` · ${proc.ultima_actuacion}` : ""}</p>
                          </div>
                          <button
                            onClick={() => setGarantiasModal(proc)}
                            className="ml-3 flex-shrink-0 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all"
                          >
                            Ver garantía
                          </button>
                        </div>
                      ))}
                    </section>
                  ) : resultadoModal.datos_extra?.procesos?.length > 0 ? (
                    /* Procesos Rama Judicial — lista compacta con botón Ver */
                    <section className="space-y-2">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">
                        Procesos encontrados ({resultadoModal.datos_extra.procesos.length})
                      </h4>
                      {resultadoModal.datos_extra.procesos.map((proc, i) => (
                        <div key={i} className="flex items-center justify-between rounded-xl border border-cyan-500/20 bg-black/30 px-4 py-3">
                          <div className="space-y-0.5">
                            <p className="text-cyan-300 font-mono text-xs font-bold">{proc.radicado || "Sin radicado"}</p>
                            <p className="text-slate-400 text-[11px]">{proc.despacho || "—"}</p>
                            <p className="text-slate-500 text-[10px]">{proc.fecha_radicacion || ""}{proc.ultima_actuacion ? ` · Últ. act: ${proc.ultima_actuacion}` : ""}</p>
                          </div>
                          <button
                            onClick={() => setProcesosModal(proc)}
                            className="ml-3 flex-shrink-0 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all"
                          >
                            Ver detalle
                          </button>
                        </div>
                      ))}
                    </section>
                  ) : null}
                </main>

                <footer className="px-6 sm:px-8 py-4 bg-white/5 border-t border-white/5 flex items-center justify-between relative z-10">
                  <div className="flex gap-2">
                    <span className="w-1 h-3 bg-cyan-300/60 rounded-full" />
                    <span className="w-1 h-3 bg-cyan-300/35 rounded-full" />
                    <span className="w-1 h-3 bg-cyan-300/15 rounded-full" />
                  </div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-[0.22em] font-medium italic opacity-80">
                    Engineered for Integrity
                  </p>
                </footer>
              </div>
            </div>,
            document.body
          );
        })()}

      {/* ===== MODAL: Detalle de Garantía Mobiliaria ===== */}
      {garantiasModal && createPortal(
        <div className="fixed inset-0 z-[13000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setGarantiasModal(null)} />
          <div className="relative z-10 w-full max-w-2xl max-h-[92vh] overflow-auto rounded-3xl bg-gradient-to-br from-amber-950/90 via-slate-900 to-slate-900 border border-amber-500/30 shadow-[0_0_60px_rgba(245,158,11,0.15)]">

            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-slate-900/90 border-b border-amber-500/20 backdrop-blur">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-amber-400/70 mb-1">Registro de Garantías Mobiliarias</p>
                <p className="text-amber-300 font-mono font-bold text-sm tracking-wider">{garantiasModal.radicado}</p>
              </div>
              <button
                onClick={() => setGarantiasModal(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-amber-500/20 flex items-center justify-center text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-5">

              {/* Tarjetas resumen */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-black/30 border border-amber-500/15 p-4">
                  <span className="text-[10px] uppercase tracking-wider text-amber-400/60 block mb-1">Folio Electrónico</span>
                  <span className="text-amber-200 font-mono font-bold text-sm">{garantiasModal.radicado || "—"}</span>
                </div>
                <div className="rounded-2xl bg-black/30 border border-amber-500/15 p-4">
                  <span className="text-[10px] uppercase tracking-wider text-amber-400/60 block mb-1">Acreedor Principal</span>
                  <span className="text-white font-semibold text-sm">{garantiasModal.despacho || "—"}</span>
                </div>
                <div className="rounded-2xl bg-black/30 border border-amber-500/15 p-4">
                  <span className="text-[10px] uppercase tracking-wider text-amber-400/60 block mb-1">Fecha de Inscripción</span>
                  <span className="text-white text-sm">{garantiasModal.fecha_radicacion || "—"}</span>
                </div>
                <div className="rounded-2xl bg-black/30 border border-amber-500/15 p-4">
                  <span className="text-[10px] uppercase tracking-wider text-amber-400/60 block mb-1">Tipo de Formulario</span>
                  <span className="text-white text-sm">{garantiasModal.ultima_actuacion || "—"}</span>
                </div>
              </div>

              {/* Datos completos del proceso */}
              {garantiasModal.datos_proceso && Object.keys(garantiasModal.datos_proceso).length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-amber-400/70 font-bold mb-2">Datos del Registro</p>
                  <div className="rounded-2xl bg-black/30 border border-amber-500/15 divide-y divide-white/5 overflow-hidden">
                    {Object.entries(garantiasModal.datos_proceso)
                      .filter(([, v]) => v && String(v).trim())
                      .map(([k, v]) => (
                        <div key={k} className="flex gap-3 px-4 py-2.5 text-xs hover:bg-amber-500/5 transition-colors">
                          <span className="text-amber-300/60 min-w-[200px] shrink-0">{k}</span>
                          <span className="text-white/90 break-words">{v}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Partes involucradas */}
              {garantiasModal.sujetos_procesales && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-amber-400/70 font-bold mb-2">Partes Involucradas</p>
                  <pre className="rounded-2xl bg-black/30 border border-amber-500/15 p-4 text-xs text-amber-100/75 whitespace-pre-wrap leading-relaxed font-mono">
                    {garantiasModal.sujetos_procesales}
                  </pre>
                </div>
              )}

              {/* Historial de operaciones (si existe) */}
              {garantiasModal.actuaciones?.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-amber-400/70 font-bold mb-2">
                    Historial de Operaciones ({garantiasModal.actuaciones.length})
                  </p>
                  <div className="rounded-2xl bg-black/30 border border-amber-500/15 divide-y divide-white/5">
                    {garantiasModal.actuaciones.map((a, j) => (
                      <div key={j} className="px-4 py-3 space-y-1">
                        <div className="flex gap-3 text-xs">
                          <span className="text-amber-300/60 min-w-[90px]">{a.fecha}</span>
                          <span className="text-white font-medium">{a.actuacion}</span>
                        </div>
                        {a.anotacion && (
                          <p className="text-amber-100/60 text-xs pl-[102px] italic">{a.anotacion}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-amber-500/15 bg-black/20 flex items-center justify-between">
              <span className="text-[10px] text-amber-400/40 uppercase tracking-widest font-mono">RGM · Confecámaras</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Consulta Oficial</span>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ===== MODAL INDEPENDIENTE: Detalle de proceso ===== */}
      {procesosModal && createPortal(
        <div className="fixed inset-0 z-[13000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setProcesosModal(null)} />
          <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-auto rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-cyan-500/30 shadow-[0_0_60px_rgba(6,182,212,0.2)]">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-slate-900/90 border-b border-white/10 backdrop-blur">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Detalle del Proceso</p>
                <p className="text-cyan-300 font-mono font-bold text-sm">{procesosModal.radicado}</p>
              </div>
              <button onClick={() => setProcesosModal(null)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Info básica */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-slate-400 block mb-0.5">Fecha radicación</span><span className="text-white">{procesosModal.fecha_radicacion || "—"}</span></div>
                <div><span className="text-slate-400 block mb-0.5">Última actuación</span><span className="text-white">{procesosModal.ultima_actuacion || "—"}</span></div>
                <div className="col-span-2"><span className="text-slate-400 block mb-0.5">Despacho</span><span className="text-white">{procesosModal.despacho || "—"}</span></div>
              </div>

              {/* Datos del proceso */}
              {procesosModal.datos_proceso && Object.keys(procesosModal.datos_proceso).length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">Datos del Proceso</p>
                  <div className="rounded-xl bg-black/30 border border-white/10 p-4 space-y-2">
                    {Object.entries(procesosModal.datos_proceso).map(([k, v]) => (
                      <div key={k} className="flex gap-2 text-xs">
                        <span className="text-slate-400 min-w-[180px]">{k}:</span>
                        <span className="text-white">{v || "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sujetos procesales */}
              {procesosModal.sujetos_procesales && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">Sujetos Procesales</p>
                  <pre className="rounded-xl bg-black/30 border border-white/10 p-4 text-xs text-cyan-100/80 whitespace-pre-wrap">{procesosModal.sujetos_procesales}</pre>
                </div>
              )}

              {/* Actuaciones */}
              {procesosModal.actuaciones?.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">
                    Actuaciones ({procesosModal.actuaciones.length})
                  </p>
                  <div className="rounded-xl bg-black/30 border border-white/10 divide-y divide-white/5">
                    {procesosModal.actuaciones.map((a, j) => (
                      <div key={j} className="px-4 py-3 space-y-1">
                        <div className="flex gap-3 text-xs">
                          <span className="text-slate-400 min-w-[90px]">{a.fecha}</span>
                          <span className="text-white font-medium">{a.actuacion}</span>
                        </div>
                        {a.anotacion && (
                          <p className="text-cyan-100/70 text-xs pl-[102px] italic">{a.anotacion}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}