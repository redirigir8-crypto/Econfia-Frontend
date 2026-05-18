import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import fingerprintWatermark from "../assets/eidentidad-fingerprint-light.png";

const API_URL = process.env.REACT_APP_API_URL;

const ESTADO_CFG = {
  VIGENTE:   { cls: "text-green-400 bg-green-500/15 border-green-500/30", dot: "bg-green-400", glow: "shadow-green-500/30" },
  CANCELADO: { cls: "text-red-400 bg-red-500/15 border-red-500/30",       dot: "bg-red-400",   glow: "shadow-red-500/30"   },
  ANULADO:   { cls: "text-red-400 bg-red-500/15 border-red-500/30",       dot: "bg-red-400",   glow: "shadow-red-500/30"   },
};

function estadoCfg(val) {
  return ESTADO_CFG[(val || "").toUpperCase()] || { cls: "text-white/50 bg-white/5 border-white/15", dot: "bg-white/30", glow: "" };
}

function getIniciales(nombre) {
  if (!nombre) return "?";
  const p = nombre.trim().split(/\s+/);
  return (p[0]?.[0] + (p[p.length - 1]?.[0] || "")).toUpperCase();
}

function Avatar({ nombre, size = "lg" }) {
  const ini = getIniciales(nombre);
  const sz = size === "lg" ? "w-16 h-16 text-xl" : "w-7 h-7 text-[10px]";
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 border-2 border-cyan-400/40 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20 font-black text-white`}>
      {ini}
    </div>
  );
}

function FingerprintWatermark() {
  return (
    <img
      src={fingerprintWatermark}
      alt=""
      aria-hidden="true"
      className="absolute -bottom-10 -right-8 w-56 sm:w-72 opacity-[0.14] pointer-events-none select-none"
    />
  );
}

function Campo({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold">{label}</span>
      <span className="text-[12.5px] text-white/85 font-semibold leading-snug">
        {value || <span className="text-white/20 italic text-xs">—</span>}
      </span>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
      <svg className="animate-spin w-7 h-7 text-cyan-400" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
      <span className="text-white/40 text-xs">Cargando datos...</span>
    </div>
  );
}

export default function EIdentidadLoteModal({ consultaciones, initialId, onClose }) {
  const [seleccionado, setSeleccionado] = useState(initialId || consultaciones[0]?.id);
  const [cache, setCache]               = useState({});
  const [loading, setLoading]           = useState(false);
  const [descargando, setDescargando]   = useState(false);
  const [search, setSearch]             = useState("");

  const fetchDatos = useCallback(async (id) => {
    if (cache[id]) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${API_URL}/api/e-identidad/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const json = await res.json();
      if (!json.error) setCache((prev) => ({ ...prev, [id]: json }));
    } catch {}
    finally { setLoading(false); }
  }, [cache]);

  useEffect(() => { if (seleccionado) fetchDatos(seleccionado); }, [seleccionado, fetchDatos]);

  const current = cache[seleccionado];
  const d       = current?.datos;

  const idx  = consultaciones.findIndex((c) => c.id === seleccionado);
  const prev = consultaciones[idx - 1];
  const next = consultaciones[idx + 1];

  const lista = search
    ? consultaciones.filter((c) =>
        (c.cedula || "").includes(search) ||
        (c.nombre || "").toLowerCase().includes(search.toLowerCase())
      )
    : consultaciones;

  const handlePDF = async () => {
    setDescargando(true);
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${API_URL}/api/e-identidad-pdf/${seleccionado}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `e-identidad-${d?.cedula || seleccionado}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { alert("No se pudo generar el PDF."); }
    finally { setDescargando(false); }
  };

  const estado  = (d?.estado_cedula || "").toUpperCase();
  const cfg     = estadoCfg(estado);
  const nombre  = d ? [d.nombre, d.apellido].filter(Boolean).join(" ") : "";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md px-3 py-4">
      <div
        className="relative flex h-[min(92vh,860px)] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,rgba(3,10,18,.98),rgba(13,23,37,.96),rgba(7,13,23,.98))] shadow-[0_24px_100px_rgba(2,8,23,0.55)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra degradé superior */}
        <div className="h-[3px] w-full bg-gradient-to-r from-cyan-200 via-sky-400 to-blue-500 flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 flex-shrink-0 bg-white/[0.025]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-100/10 to-blue-100/5 border border-sky-200/15 flex items-center justify-center shadow-[inset_0_0_12px_rgba(255,255,255,0.05)]">
              <svg className="w-4 h-4 text-sky-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0M9 14h6m-6 3h3" />
              </svg>
            </div>
            <div>
              <h2 className="text-white font-bold text-sm tracking-[0.01em]">E-Identidad — Lote de consultas</h2>
              <p className="text-white/35 text-[10.5px]">
                {consultaciones.length} {consultaciones.length === 1 ? "cédula consultada" : "cédulas consultadas"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/75 transition-colors p-1.5 rounded-lg hover:bg-white/5">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="grid flex-1 min-h-0 overflow-hidden xl:grid-cols-[280px_minmax(0,1fr)]">

          {/* ── Sidebar ── */}
          <div className="border-r border-white/10 flex flex-col bg-black/10 min-h-0">
            <div className="p-3 border-b border-white/10">
              <input
                type="text"
                placeholder="Buscar cédula o nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white/85 placeholder:text-white/25 text-[11px] focus:outline-none focus:border-sky-200/35 focus:bg-white/[0.06] transition-all"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {lista.map((c) => {
                const cachedItem = cache[c.id];
                const itemEstado = (cachedItem?.datos?.estado_cedula || "").toUpperCase();
                const itemCfg   = estadoCfg(itemEstado);
                const isActive  = c.id === seleccionado;
                const itemNombre = cachedItem?.datos
                  ? `${cachedItem.datos.nombre || ""} ${cachedItem.datos.apellido || ""}`.trim() || "Sin nombre"
                  : c.nombre || "Sin nombre";
                return (
                  <button
                    key={c.id}
                    onClick={() => setSeleccionado(c.id)}
                    className={`w-full text-left px-3 py-2.5 border-b border-white/[0.04] transition-all ${
                      isActive
                        ? "bg-sky-300/10 border-l-2 border-l-sky-200"
                        : "hover:bg-white/4 border-l-2 border-l-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] text-white/25 font-mono">#{c.id}</span>
                      {itemEstado && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ml-auto ${itemCfg.dot}`} />}
                    </div>
                    <p className="text-[11px] text-white/80 font-semibold truncate">{itemNombre}</p>
                    <p className="text-[10px] text-white/30 font-mono mt-0.5">{c.cedula || "—"}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Detalle ── */}
          <div className="flex min-h-0 flex-col overflow-hidden relative">
            {loading && !d ? (
              <Spinner />
            ) : d ? (
              <>
                {/* Scroll area */}
                <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 space-y-4">

                  {/* ── Hero card ── */}
                  <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,.94),rgba(17,24,39,.92),rgba(7,13,23,.96))] shadow-[0_24px_55px_rgba(2,8,23,0.35)]">
                    {/* Línea degradé superior */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-sky-100/80 via-sky-300 to-blue-500" />
                    {/* Glow fondo */}
                    <div className="absolute top-0 right-0 w-44 h-44 bg-sky-100/5 rounded-full blur-3xl" />
                    <FingerprintWatermark />

                    <div className="relative flex flex-col gap-5 p-5 lg:flex-row lg:items-center">
                      {/* Avatar */}
                      <Avatar nombre={nombre} size="lg" />

                      {/* Datos principales */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] text-sky-200/70 uppercase tracking-[3.2px] font-bold mb-1">
                          Ciudadano verificado
                        </p>
                        <h3 className="text-[clamp(1.5rem,2vw,2rem)] font-black text-white leading-tight tracking-tight break-words">
                          {nombre || "Sin nombre"}
                        </h3>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-200/85 bg-white/[0.05] border border-white/10 rounded-md px-2 py-0.5 font-mono tracking-wider">
                            {d.tipo_doc}
                          </span>
                          <span className="text-white/25">·</span>
                          <span className="text-[11px] text-white/55 font-mono tracking-[0.08em]">{d.cedula}</span>
                        </div>
                      </div>

                      {/* Estado badge */}
                      <div className={`flex-shrink-0 flex w-full max-w-[170px] flex-col items-center gap-1.5 rounded-2xl border px-4 py-3.5 lg:w-auto ${cfg.cls}`}>
                        <span className={`w-2.5 h-2.5 rounded-full shadow-lg ${cfg.dot} ${cfg.glow}`} />
                        <span className="text-[9px] font-bold uppercase tracking-[2.5px] text-white/40">Estado</span>
                        <span className="text-sm font-black tracking-[0.16em]">{estado || "—"}</span>
                      </div>
                    </div>

                    {/* Meta footer */}
                    <div className="border-t border-white/5 px-5 py-2.5 flex items-center gap-3 bg-black/10">
                      <svg className="w-3 h-3 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-[10px] text-white/30">
                        Consulta #{seleccionado} — {current?.fecha ? new Date(current.fecha).toLocaleString("es-CO") : ""}
                      </span>
                    </div>
                  </div>

                  {/* ── Sección: Documento ── */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-px flex-1 bg-white/5" />
                      <span className="text-[9px] text-sky-200/60 font-bold uppercase tracking-[3px]">Información del documento</span>
                      <div className="h-px flex-1 bg-white/5" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {[
                        ["Tipo de documento",       d.tipo_doc],
                        ["Número de documento",     d.cedula],
                        ["Fecha de expedición",     d.fecha_expedicion],
                        ["Estado del documento",    d.estado_cedula],
                        ["Departamento",            d.departamento_expedicion],
                        ["Municipio",               d.municipio_expedicion],
                      ].map(([label, value]) => (
                        <div key={label} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl px-4 py-3 hover:bg-white/[0.05] transition-colors">
                          <Campo label={label} value={value} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Sección: Datos personales ── */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-px flex-1 bg-white/5" />
                      <span className="text-[9px] text-sky-200/60 font-bold uppercase tracking-[3px]">Datos personales</span>
                      <div className="h-px flex-1 bg-white/5" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {[
                        ["Fecha de nacimiento",  d.fecha_nacimiento],
                        ["Tipo de persona",      d.tipo_persona],
                        ["Sexo",                 d.sexo],
                        d.estatura ? ["Estatura", d.estatura] : null,
                      ].filter(Boolean).map(([label, value]) => (
                        <div key={label} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl px-4 py-3 hover:bg-white/[0.05] transition-colors">
                          <Campo label={label} value={value} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── Footer acciones ── */}
                <div className="flex-shrink-0 border-t border-white/[0.07] px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-black/10">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => prev && setSeleccionado(prev.id)}
                      disabled={!prev}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-white/55 border border-white/10 hover:bg-white/5 hover:text-white/75 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Anterior
                    </button>
                    <span className="text-white/25 text-xs font-mono">{idx + 1} / {consultaciones.length}</span>
                    <button
                      onClick={() => next && setSeleccionado(next.id)}
                      disabled={!next}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-white/55 border border-white/10 hover:bg-white/5 hover:text-white/75 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                    >
                      Siguiente
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  <button
                    onClick={handlePDF}
                    disabled={descargando}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-400 hover:to-blue-500 disabled:opacity-50 shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30 transition-all hover:scale-[1.02] min-w-[180px]"
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
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-white/20 text-sm">Selecciona una cédula del listado</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
