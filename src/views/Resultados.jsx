import TablaResultados from "../components/TablaResultados";
import LiveQueryModal from "../components/LiveQueryModal";
import CardDni from "../components/CardDni";
import DetalleResultados from "../components/DetalleResultados";
import RadarRiesgo from "../components/RadarRiesgo";
import MapaCalorResultados from "../components/MapaCalorResultados";
import ModalDescargaIndividual from "../modals/ModalDescargaIndividual";
import ConsultaSlide from "../components/ConsultaSlide";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, FileDown, FileText, Images } from "lucide-react";

/** --- BOTONES FLOTANTES (portal) --- */
function FloatingActionsPortal({
  apiUrl,
  consultaId,
  consultaTipo,
  onBack,
  onOpenIndividual, // abre tu ModalDescargaIndividual
}) {
  const [el, setEl] = useState(null);
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false); // NUEVO: loading para descarga
  const menuRef = useRef(null);

  useEffect(() => {
    const node = document.createElement("div");
    node.id = "econfia-resultados-actions";
    document.body.appendChild(node);
    setEl(node);
    return () => document.body.removeChild(node);
  }, []);

  // cerrar al hacer click fuera o con ESC
  useEffect(() => {
    const handleClick = (e) => {
      if (open && menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    const handleKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const goBack = () => (typeof onBack === "function" ? onBack() : window.history.back());

  const tipoConsultaNormalizado = (consultaTipo || "").toLowerCase();
  const isEconfiafast = tipoConsultaNormalizado === "econfiafast";

  const downloadPdf = async (tipo) => {
    setDownloading(true);
    try {
      const token = localStorage.getItem("token");

      if (tipo === 3 && isEconfiafast) {
        const url = `${apiUrl}/api/descargar_pdf_fast/${consultaId}/`;
        const res = await fetch(url, {
          method: "GET",
          headers: token ? { Authorization: `Token ${token}` } : {},
        });

        if (!res.ok) {
          throw new Error(`Error al descargar PDF FAST: ${res.status}`);
        }

        const blob = await res.blob();
        const disposition = res.headers.get("content-disposition") || "";
        const match = disposition.match(/filename\*?=(?:UTF-8''|"?)([^";]+)/i);
        const filename = match?.[1]
          ? decodeURIComponent(match[1])
          : `resumen_fast_${consultaId}.pdf`;

        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(link.href);
        setOpen(false);
        return;
      }

      let url;
      // Solo para el PDF resumen (tipo === 3)
      if (tipo === 3) {
        url = `${apiUrl}/api/generar_consolidado_full/${consultaId}/3/`;
      } else {
        url = `${apiUrl}/api/generar_consolidado_full/${consultaId}/${tipo}/`;
      }
      window.open(url, "_blank", "noopener,noreferrer");
      setOpen(false);
    } catch (error) {
      console.error("Error al descargar PDF:", error);
      alert("No se pudo descargar el PDF solicitado");
    } finally {
      setDownloading(false);
    }
  };

  if (!el) return null;

  return createPortal(
    <div className="fixed top-4 left-4 z-[10000]">
      <div className="flex items-start gap-2">
        {/* Regresar */}
        <button
          onClick={goBack}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-slate-900/90 to-slate-800/90 hover:from-slate-800/90 hover:to-slate-700/90
                     text-white border border-white/20 backdrop-blur-xl shadow-lg shadow-black/20 transition-all hover:shadow-cyan-500/20 hover:border-cyan-500/30 group"
          title="Regresar"
        >
          <ArrowLeft size={16} className="group-hover:text-cyan-400 transition-colors" />
          <span className="text-sm font-semibold">Regresar</span>
        </button>

        {/* PDF + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400
                       text-white border border-white/20 backdrop-blur-xl shadow-lg shadow-cyan-500/30 transition-all hover:shadow-cyan-500/50 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
            title="Descargar PDF"
            disabled={downloading}
          >
            {downloading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-cyan-400 rounded-full animate-spin" />
            ) : (
              <FileDown size={16} />
            )}
            <span className="text-sm font-semibold">PDF</span>
          </button>

          {open && (
            <div className="absolute left-0 mt-2 w-56 rounded-lg overflow-hidden border border-white/20
                            bg-gradient-to-br from-slate-900/95 via-blue-900/40 to-slate-900/95 backdrop-blur-xl shadow-2xl shadow-cyan-500/20 animate-in fade-in duration-200">
              {isEconfiafast ? (
                <button
                  onClick={() => downloadPdf(3)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white hover:bg-blue-500/20 transition-all group disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={downloading}
                >
                  <Images size={16} className="group-hover:text-blue-400 transition-colors" />
                  <span className="group-hover:text-blue-300">Descargar PDF</span>
                  {downloading && <span className="ml-2 w-4 h-4 border-2 border-white border-t-cyan-400 rounded-full animate-spin" />}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => downloadPdf(1)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white hover:bg-cyan-500/20 transition-all border-b border-white/10 group disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={downloading}
                  >
                    <FileText size={16} className="group-hover:text-cyan-400 transition-colors" />
                    <span className="group-hover:text-cyan-300">Descargar PDF Completo</span>
                    {downloading && <span className="ml-2 w-4 h-4 border-2 border-white border-t-cyan-400 rounded-full animate-spin" />}
                  </button>
                  <button
                    onClick={() => downloadPdf(3)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white hover:bg-blue-500/20 transition-all border-b border-white/10 group disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={downloading}
                  >
                    <Images size={16} className="group-hover:text-blue-400 transition-colors" />
                    <span className="group-hover:text-blue-300">Descargar PDF Resumen</span>
                    {downloading && <span className="ml-2 w-4 h-4 border-2 border-white border-t-cyan-400 rounded-full animate-spin" />}
                  </button>
                  <button
                    onClick={() => { setOpen(false); onOpenIndividual?.(); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white hover:bg-purple-500/20 transition-all group"
                  >
                    <FileText size={16} className="group-hover:text-purple-400 transition-colors" />
                    <span className="group-hover:text-purple-300">Descarga individual</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    el
  );
}

function ExportBatchModal({
  isOpen,
  format = "excel",
  totalCount = 0,
  initialCount = 0,
  isSubmitting = false,
  onClose,
  onConfirm,
}) {
  const [requestedCount, setRequestedCount] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const safeInitial = Math.max(1, Math.min(totalCount || 1, initialCount || totalCount || 1));
    setRequestedCount(String(safeInitial));
  }, [isOpen, totalCount, initialCount, format]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isSubmitting) {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const normalizedCount = Math.max(
    1,
    Math.min(totalCount || 1, Number.parseInt(requestedCount, 10) || 1)
  );
  const formatLabel = format === "pdf" ? "PDF" : "Excel";
  const quickOptions = Array.from(
    new Set([25, 50, 100, totalCount].filter((value) => value > 0 && value <= totalCount))
  );

  return createPortal(
    <div className="fixed inset-0 z-[11000] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-slate-900/95 via-blue-950/75 to-slate-900/95 shadow-[0_20px_60px_rgba(2,8,23,0.55)] overflow-hidden">
        <div className="border-b border-cyan-400/15 px-5 py-4">
          <div className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
            Configuracion de exportacion
          </div>
          <h3 className="mt-3 text-lg font-bold text-white">
            Tamaño del lote de exportación
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Define el volumen de registros completados que se incluirá en el archivo {formatLabel} con los filtros actuales.
            Se priorizan las consultas más
             recientes.
          </p>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Registros disponibles
            </div>
            <div className="mt-2 flex items-end justify-between gap-3">
              <div className="text-3xl font-black text-cyan-200">{totalCount}</div>
              <div className="text-right text-xs text-slate-400">
                Archivo objetivo
                <div className="mt-1 text-sm font-semibold text-white">{formatLabel}</div>
              </div>
            </div>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Cantidad a incluir
            </span>
            <input
              type="number"
              min="1"
              max={totalCount}
              value={requestedCount}
              onChange={(event) => setRequestedCount(event.target.value)}
              className="w-full rounded-xl border border-cyan-400/20 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-400/20"
            />
          </label>

          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Lotes sugeridos
            </div>
            <div className="flex flex-wrap gap-2">
              {quickOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRequestedCount(String(option))}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    normalizedCount === option
                      ? "border-cyan-300/60 bg-cyan-400/20 text-cyan-100"
                      : "border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/30 hover:text-cyan-100"
                  }`}
                >
                  {option === totalCount ? `Todo (${option})` : option}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-white/10 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm?.(normalizedCount)}
            disabled={isSubmitting || totalCount <= 0}
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/30 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 px-4 py-2 text-sm font-semibold text-white transition hover:from-cyan-500/40 hover:to-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting && (
              <span className="inline-block h-4 w-4 rounded-full border-2 border-white/25 border-t-white animate-spin" />
            )}
            {isSubmitting ? `Generando ${formatLabel}...` : `Generar ${formatLabel}`}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function Resultados() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [consultaSeleccionada, setConsultaSeleccionada] = useState(null);
  const [riesgo, setRiesgo] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ estado: "", fecha: "" });
  const [showModalIndividual, setShowModalIndividual] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportModal, setExportModal] = useState({ open: false, format: "excel" });
  const [liveConsultaId, setLiveConsultaId] = useState(null);
  const [dismissedLiveConsultaId, setDismissedLiveConsultaId] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL;
    // Limpiar liveConsultaId cuando la consulta deje de estar en proceso
  useEffect(() => {
    if (!liveConsultaId) return;
    const sigueEnProceso = data.some(
      (item) => item.id === liveConsultaId && (item.estado || "").toLowerCase() === "en_proceso"
    );
    if (!sigueEnProceso) {
      setLiveConsultaId(null);
      setDismissedLiveConsultaId(null);
    }
  }, [data, liveConsultaId]);
  // ---- Obtener todas las consultas ----
  const fetchResultados = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log(API_URL)
      const res = await fetch(`${API_URL}/api/consultas/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Error al obtener resultados:", error);
    } finally {
      setLoading(false);
    }
  };

  // ---- Obtener riesgo de la consulta seleccionada ----
  const fetchRiesgo = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/api/calcular_riesgo/${id}/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      const json = await res.json();
      setRiesgo(json);
    } catch (error) {
      console.error("Error al obtener riesgo:", error);
    }
  };

  // ---- Al seleccionar consulta, cargo su riesgo ----
  useEffect(() => {
    if (consultaSeleccionada) {
      fetchRiesgo(consultaSeleccionada);
    }
  }, [consultaSeleccionada]);

  // ---- Cargar consultas periódicamente ----
  useEffect(() => {
    fetchResultados();
    const interval = setInterval(fetchResultados, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return <p className="text-center text-gray-300">Cargando...</p>;

  // ---- Filtrar datos ----
  const filteredData = data.filter((item) => {
    const matchSearch =
      search === "" ||
      item.id.toString().includes(search) ||
      item.cedula?.toString().includes(search) ||
      item.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      item.estado?.toLowerCase().includes(search.toLowerCase());

    const matchEstado =
      filters.estado === "" || item.estado === filters.estado;

    const matchFecha =
      filters.fecha === "" || item.fecha?.startsWith(filters.fecha);

    return matchSearch && matchEstado && matchFecha;
  });
  const exportableData = [...filteredData]
    .filter((item) => (item.estado || "").toLowerCase() === "completado")
    .sort((left, right) => {
      const leftTime = left.fecha ? new Date(left.fecha).getTime() : 0;
      const rightTime = right.fecha ? new Date(right.fecha).getTime() : 0;
      return rightTime - leftTime;
    });

  const openExportModal = (format) => {
    if (!exportableData.length) return;
    setExportModal({ open: true, format });
  };

  const closeExportModal = () => {
    if (exportingExcel || exportingPdf) return;
    setExportModal((prev) => ({ ...prev, open: false }));
  };

  const downloadExport = async (format, consultaIds) => {
    if (!consultaIds.length) return false;

    const isPdf = format === "pdf";
    const setExporting = isPdf ? setExportingPdf : setExportingExcel;
    const endpoint = isPdf ? "exportar-pdf" : "exportar-excel";
    const defaultExtension = isPdf ? "pdf" : "xlsx";
    const exportLabel = isPdf ? "PDF" : "Excel";

    setExporting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/consultas/${endpoint}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          consulta_ids: consultaIds,
        }),
      });

      if (!res.ok) {
        let message = `No se pudo generar el informe ${exportLabel}.`;
        try {
          const errorData = await res.json();
          message = errorData?.detail || errorData?.error || message;
        } catch (_error) {
          // Si el backend no respondio JSON, dejamos el mensaje por defecto.
        }
        throw new Error(message);
      }

      const blob = await res.blob();
      const disposition = res.headers.get("content-disposition") || "";
      const match = disposition.match(/filename\*?=(?:UTF-8''|"?)([^";]+)/i);
      const filename = match?.[1]
        ? decodeURIComponent(match[1])
        : `control_informes_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.${defaultExtension}`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error(`Error al exportar el informe ${exportLabel}:`, error);
      alert(error.message || `No se pudo generar el informe ${exportLabel}.`);
      return false;
    } finally {
      setExporting(false);
    }
  };

  const handleConfirmExport = async (requestedCount) => {
    const selectedIds = exportableData
      .slice(0, requestedCount)
      .map((item) => item.id);

    const wasSuccessful = await downloadExport(exportModal.format, selectedIds);
    if (wasSuccessful) {
      setExportModal((prev) => ({ ...prev, open: false }));
    }
  };

  const handleExportExcel = async () => {
    if (!exportableData.length) return;

    setExportingExcel(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/consultas/exportar-excel/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          consulta_ids: exportableData.map((item) => item.id),
        }),
      });

      if (!res.ok) {
        let message = "No se pudo generar el informe Excel.";
        try {
          const errorData = await res.json();
          message = errorData?.detail || errorData?.error || message;
        } catch (_error) {
          // Si el backend no respondió JSON, dejamos el mensaje por defecto.
        }
        throw new Error(message);
      }

      const blob = await res.blob();
      const disposition = res.headers.get("content-disposition") || "";
      const match = disposition.match(/filename\*?=(?:UTF-8''|"?)([^";]+)/i);
      const filename = match?.[1]
        ? decodeURIComponent(match[1])
        : `control_informes_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.xlsx`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al exportar el informe Excel:", error);
      alert(error.message || "No se pudo generar el informe Excel.");
    } finally {
      setExportingExcel(false);
    }
  };

  const handleExportPdf = async () => {
    if (!exportableData.length) return;

    setExportingPdf(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/consultas/exportar-pdf/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          consulta_ids: exportableData.map((item) => item.id),
        }),
      });

      if (!res.ok) {
        let message = "No se pudo generar el informe PDF.";
        try {
          const errorData = await res.json();
          message = errorData?.detail || errorData?.error || message;
        } catch (_error) {
          // Si el backend no respondió JSON, dejamos el mensaje por defecto.
        }
        throw new Error(message);
      }

      const blob = await res.blob();
      const disposition = res.headers.get("content-disposition") || "";
      const match = disposition.match(/filename\*?=(?:UTF-8''|"?)([^";]+)/i);
      const filename = match?.[1]
        ? decodeURIComponent(match[1])
        : `control_informes_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.pdf`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al exportar el informe PDF:", error);
      alert(error.message || "No se pudo generar el informe PDF.");
    } finally {
      setExportingPdf(false);
    }
  };

  void handleExportExcel;
  void handleExportPdf;

  const consultaActual = data.find((c) => c.id === consultaSeleccionada) || null;
  const consultaTipoActual =
    consultaActual?.tipo_consulta ||
    consultaActual?.tipo ||
    (consultaActual?.es_econfiafask ? "econfiafask" : "");

  return (
    <section className="relative min-h-screen py-4 md:py-6 pb-32 md:pb-36 overflow-hidden bg-transparent">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="w-full px-4 relative z-10">
        {!consultaSeleccionada ? (
          <div className="w-full max-w-7xl mx-auto">
            {/* Título */}
            <div className="mb-3 md:mb-4">
              <div className="inline-block px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 mb-2">
                <span className="text-cyan-300 text-[10px] md:text-xs font-medium">Panel de resultados</span>
              </div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-black bg-gradient-to-r from-white via-cyan-100 to-blue-300 bg-clip-text text-transparent">
                Resultados de Consultas
              </h1>
            </div>

            {/* Barra de búsqueda y filtros */}
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center mb-3 md:mb-4 gap-2 md:gap-3">
              <input
                type="text"
                placeholder="Buscar por ID, Cédula, Nombre o Estado..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-1/2 px-3 py-1.5 md:py-2 rounded-lg bg-white/5 border border-white/15 text-sm text-white placeholder-white/40 focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 focus:shadow-lg focus:shadow-cyan-500/20 transition-all backdrop-blur-sm"
              />

              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={filters.estado}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, estado: e.target.value }))
                  }
                  className="w-full sm:w-auto px-3 py-1.5 md:py-2 rounded-lg bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-blue-400/50 focus:bg-white/10 focus:shadow-lg focus:shadow-blue-500/20 transition-all backdrop-blur-sm appearance-none cursor-pointer"
                >
                  <option className="bg-slate-900 text-white" value="">Todos los estados</option>
                  <option className="bg-slate-900 text-white" value="en_proceso">En proceso</option>
                  <option className="bg-slate-900 text-white" value="finalizado">Finalizado</option>
                  <option className="bg-slate-900 text-white" value="error">Error</option>
                </select>

                <input
                  type="date"
                  value={filters.fecha}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, fecha: e.target.value }))
                  }
                  className="w-full sm:w-auto px-3 py-1.5 md:py-2 rounded-lg bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-purple-400/50 focus:bg-white/10 focus:shadow-lg focus:shadow-purple-500/20 transition-all backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Tabla de resultados */}
            <TablaResultados
              data={filteredData}
              onVerResultados={setConsultaSeleccionada}
              onOpenLive={setLiveConsultaId}
              onExportExcel={() => openExportModal("excel")}
              onExportPdf={() => openExportModal("pdf")}
              exportingExcel={exportingExcel}
              exportingPdf={exportingPdf}
              exportDisabled={!exportableData.length}
              exportCount={exportableData.length}
            />
                {/* Modal de fuentes en vivo */}
      <LiveQueryModal
        consultaId={liveConsultaId}
        onClose={() => {
          if (liveConsultaId) {
            setDismissedLiveConsultaId(liveConsultaId);
          }
          setLiveConsultaId(null);
        }}
        onFinished={() => {
          setLiveConsultaId(null);
          setDismissedLiveConsultaId(null);
        }}
      />
          </div>
        ) : (
        <div className="w-full max-w-7xl mx-auto h-[75vh]">
          <FloatingActionsPortal
            apiUrl={API_URL}
            consultaId={consultaSeleccionada}
            consultaTipo={consultaTipoActual}
            onBack={() => setConsultaSeleccionada(null)}
            onOpenIndividual={() => setShowModalIndividual(true)}
          />
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={20}
            slidesPerView={1}
            pagination={{ clickable: true }}
            navigation
            className="h-full swiper-custom-nav"
          >
          <style jsx global>{`
            .swiper-custom-nav .swiper-button-next,
            .swiper-custom-nav .swiper-button-prev {
              color: #06b6d4;
              background: rgba(6, 182, 212, 0.1);
              backdrop-filter: blur(10px);
              width: 40px;
              height: 40px;
              border-radius: 50%;
              border: 1px solid rgba(6, 182, 212, 0.3);
              transition: all 0.3s;
            }
            .swiper-custom-nav .swiper-button-next:hover,
            .swiper-custom-nav .swiper-button-prev:hover {
              background: rgba(6, 182, 212, 0.2);
              border-color: rgba(6, 182, 212, 0.5);
              transform: scale(1.1);
            }
            .swiper-custom-nav .swiper-button-next::after,
            .swiper-custom-nav .swiper-button-prev::after {
              font-size: 16px;
              font-weight: bold;
            }
          `}</style>

            {/* Slide 2: Detalles con botones abajo */}
            <SwiperSlide className="flex flex-col">
              {/* 🔹 Detalle primero */}
              <div className="flex-1">
                <DetalleResultados consultaId={consultaSeleccionada} />
              </div>

            </SwiperSlide>

            <SwiperSlide className="flex flex-row h-full">
            <ConsultaSlide consultaId={consultaSeleccionada} />
            </SwiperSlide>
            {/* Slide 3 */}
          </Swiper>

          {/* Modal fuera del Swiper */}
          <ModalDescargaIndividual
            isOpen={showModalIndividual}
            onClose={() => setShowModalIndividual(false)}
            data={{ consultaId: consultaSeleccionada }}
          />
        </div>
      )}
      </div>
      <ExportBatchModal
        isOpen={exportModal.open}
        format={exportModal.format}
        totalCount={exportableData.length}
        initialCount={Math.min(exportableData.length, 50)}
        isSubmitting={exportingExcel || exportingPdf}
        onClose={closeExportModal}
        onConfirm={handleConfirmExport}
      />
    </section>
  );
}
