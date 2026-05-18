import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import fingerprintWatermark from "../assets/eidentidad-fingerprint-light.png";

const API_URL = process.env.REACT_APP_API_URL;

const ESTADO_STYLE = {
  VIGENTE:   "bg-green-500/20 text-green-300 border-green-400/40",
  CANCELADO: "bg-red-500/20 text-red-300 border-red-400/40",
  ANULADO:   "bg-red-500/20 text-red-300 border-red-400/40",
};

function EstadoBadge({ valor }) {
  const upper = (valor || "").toUpperCase();
  const cls = ESTADO_STYLE[upper] || "bg-white/10 text-white/60 border-white/20";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${cls}`}>
      <span className={`w-2 h-2 rounded-full ${upper === "VIGENTE" ? "bg-green-400" : upper.startsWith("C") || upper.startsWith("A") ? "bg-red-400" : "bg-white/40"}`} />
      {upper || "—"}
    </span>
  );
}

function Campo({ label, value, wide }) {
  return (
    <div className={`flex flex-col gap-0.5 ${wide ? "col-span-2" : ""}`}>
      <span className="text-[10px] uppercase tracking-widest text-white/35 font-semibold">{label}</span>
      <span className="text-sm text-white/85 font-medium">{value || <span className="text-white/25 italic text-xs">No disponible</span>}</span>
    </div>
  );
}

function FingerprintWatermark() {
  return (
    <img
      src={fingerprintWatermark}
      alt=""
      aria-hidden="true"
      className="absolute -bottom-8 -right-8 w-52 sm:w-64 opacity-[0.14] pointer-events-none select-none"
    />
  );
}

export default function EIdentidadDetalleModal({ consultaId, onClose }) {
  const [datos, setDatos]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [descargando, setDescargando] = useState(false);

  useEffect(() => {
    if (!consultaId) return;
    const token = localStorage.getItem("token");
    setLoading(true);
    setError(null);

    fetch(`${API_URL}/api/e-identidad/${consultaId}/`, {
      headers: { Authorization: `Token ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setDatos(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [consultaId]);

  const handleDescargarPDF = async () => {
    setDescargando(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/e-identidad-pdf/${consultaId}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!res.ok) throw new Error("Error al generar el PDF");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `e-identidad-${datos?.datos?.cedula || consultaId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("No se pudo descargar el PDF: " + e.message);
    } finally {
      setDescargando(false);
    }
  };

  const d = datos?.datos;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4" onClick={onClose}>
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(140deg,rgba(9,15,25,.98),rgba(15,23,42,.96),rgba(7,13,23,.98))] shadow-[0_24px_80px_rgba(2,8,23,0.55)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra superior decorativa */}
        <div className="h-1 w-full bg-gradient-to-r from-sky-100 via-sky-400 to-blue-500" />

        {/* Encabezado */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100/10 border border-sky-100/15 flex items-center justify-center">
              <svg className="w-5 h-5 text-sky-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-white font-bold text-sm leading-tight">E-Identidad</h2>
              <p className="text-white/40 text-[11px]">Consulta #{consultaId}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors p-1 rounded-lg hover:bg-white/5">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <div className="relative px-6 py-5">
          <FingerprintWatermark />
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <svg className="animate-spin w-8 h-8 text-cyan-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <span className="text-white/50 text-sm">Cargando datos...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-10 text-red-400 text-sm">{error}</div>
          )}

          {!loading && !error && d && (
            <>
              {/* Nombre + Estado */}
              <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5 p-5 rounded-[24px] bg-[linear-gradient(140deg,rgba(255,255,255,.06),rgba(255,255,255,.03))] border border-white/10 shadow-[0_18px_40px_rgba(2,8,23,0.28)]">
                <div className="min-w-0">
                  <p className="text-[10px] text-sky-100/65 uppercase tracking-[0.28em] mb-1 font-bold">Ciudadano verificado</p>
                  <p className="text-[clamp(1.35rem,2vw,1.9rem)] font-black text-white break-words leading-tight">
                    {[d.nombre, d.apellido].filter(Boolean).join(" ") || "Sin nombre"}
                  </p>
                  <p className="text-white/55 text-xs mt-1 font-mono tracking-[0.14em]">{d.tipo_doc} · {d.cedula}</p>
                </div>
                <EstadoBadge valor={d.estado_cedula} />
              </div>

              {/* Grid de datos */}
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <Campo label="Fecha de expedición"        value={d.fecha_expedicion} />
                <Campo label="Fecha de nacimiento"        value={d.fecha_nacimiento} />
                <Campo label="Departamento de expedición" value={d.departamento_expedicion} />
                <Campo label="Municipio de expedición"    value={d.municipio_expedicion} />
                <Campo label="Tipo de persona"            value={d.tipo_persona} />
                <Campo label="Sexo"                       value={d.sexo} />
                {d.estatura && <Campo label="Estatura" value={d.estatura} />}
              </div>
            </>
          )}
        </div>

        {/* Footer con botones */}
        {!loading && !error && (
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-white/10 bg-white/2">
            <p className="text-white/25 text-[10px]">
              {datos?.fecha ? new Date(datos.fecha).toLocaleString("es-CO") : ""}
            </p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg text-xs text-white/50 border border-white/10 hover:bg-white/5 transition-all"
              >
                Cerrar
              </button>
              <button
                onClick={handleDescargarPDF}
                disabled={descargando}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 transition-all"
              >
                {descargando ? (
                  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a1 1 0 001 1h16a1 1 0 001-1v-3" />
                  </svg>
                )}
                Descargar PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
