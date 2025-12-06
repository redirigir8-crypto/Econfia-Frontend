import { useMemo, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/* ===== Progreso simulado (5 min por ítem) ===== */
const DURATION_MS = 5 * 60 * 1000;

function useStartTimes(items, getId, getFecha) {
  const startsRef = useRef(new Map());
  useEffect(() => {
    for (const it of items) {
      const id = getId(it);
      if (id == null) continue;
      if (!startsRef.current.has(id)) {
        const fecha = getFecha(it);
        const start = fecha ? new Date(fecha).getTime() : Date.now();
        startsRef.current.set(id, start);
      }
    }
  }, [items, getId, getFecha]);
  return startsRef;
}
function useTicker(ms = 1000) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), ms);
    return () => clearInterval(t);
  }, [ms]);
}
function percentFrom(startTs, nowTs, duration = DURATION_MS) {
  const elapsed = Math.max(0, nowTs - startTs);
  const pct = Math.min(1, elapsed / duration);
  return Math.round(pct * 100);
}

/* ===== Barra elegante con gradiente cyan-blue ===== */
function ElegantProgressBar({ percent = 0, showLabel = true, className = "" }) {
  const pct = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div className={`w-full ${className}`}>
      <div className="w-full h-2.5 rounded-full bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-cyan-500/20 overflow-hidden relative backdrop-blur-sm">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.7)]"
          style={{ width: `${pct}%`, transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/10" />
      </div>
      {showLabel && (
        <div className="mt-1.5 text-[11px] text-cyan-400 font-semibold tracking-wide text-right">
          {pct}%
        </div>
      )}
    </div>
  );
}
function ElegantCard({ children, className = "" }) {
  return (
    <div
      className={[
        "px-4 py-3 rounded-xl border text-gray-100",
        "bg-gradient-to-br from-slate-800/40 via-slate-900/30 to-slate-800/40",
        "border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300",
        "shadow-[0_4px_20px_rgba(6,182,212,0.15)] hover:shadow-[0_6px_25px_rgba(6,182,212,0.25)]",
        "backdrop-blur-xl hover:scale-[1.02] transform",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

/* ===== DOCK: ahora con loader circular + barra ===== */
function ProcessDockPortal({ items }) {
  const [container, setContainer] = useState(null);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const el = document.createElement("div");
    el.setAttribute("id", "econfia-process-dock");
    document.body.appendChild(el);
    setContainer(el);
    return () => {
      document.body.removeChild(el);
    };
  }, []);

  const startsRef = useStartTimes(items, it => it.id, it => it.fecha);
  useTicker(1000);

  if (!container) return null;
  const now = Date.now();
  return createPortal(
    <div className="fixed top-4 right-4 z-[9999]">
      <div className="backdrop-blur-xl bg-gradient-to-br from-slate-900/90 via-blue-950/80 to-slate-900/90 border border-cyan-500/30 rounded-2xl shadow-[0_8px_32px_rgba(6,182,212,0.3)] w-[320px]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-3 text-gray-100">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
            <span className="text-sm font-bold tracking-wide bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              {items.length > 0
                ? `Procesando ${items.length} ${items.length === 1 ? "caso" : "casos"}`
                : "Sin procesos en curso"}
            </span>
          </div>
          <button
            onClick={() => setOpen(v => !v)}
            className="text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 border border-cyan-500/30 transition-all duration-300"
          >
            {open ? "Minimizar" : "Expandir"}
          </button>
        </div>

        {open && items.length > 0 && (
          <div className="px-4 pb-4 pt-3 max-h-[50vh] overflow-auto scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent">
            <div className="flex flex-col gap-3">
              {items.map(card => {
                const start = startsRef.current.get(card.id) ?? now;
                const percent = percentFrom(start, now);
                return (
                  <ElegantCard key={`${card.id}-${card.persona}`} className="gap-2">
                    <div className="flex items-center gap-3 mb-2">
                      {/* loader circular elegante */}
                      <span className="inline-block w-5 h-5 rounded-full border-2 border-slate-700/50 border-t-cyan-400 animate-spin shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-cyan-100 line-clamp-1">{card.persona}</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {card.cedula ? `CC ${card.cedula}` : ""}
                          {card.fecha ? ` · ${new Date(card.fecha).toLocaleTimeString()}` : ""}
                        </div>
                      </div>
                    </div>
                    <ElegantProgressBar percent={percent} />
                  </ElegantCard>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>,
    container
  );
}

/* ===== TABLA: Estado = solo barra + % (sin loader ni texto) ===== */
export default function TablaResultados({ data = [], onVerResultados }) {
  const [pagina, setPagina] = useState(1);
  const porPagina = 4;

  const totalPaginas = Math.ceil(data.length / porPagina);
  const startIndex = (pagina - 1) * porPagina;
  const datosPagina = data.slice(startIndex, startIndex + porPagina);

  const enProcesoCards = useMemo(() => {
    const enProceso = data.filter(i => (i.estado || "").toLowerCase() === "en_proceso");
    const map = new Map();
    for (const it of enProceso) {
      const persona =
        (it.nombre && String(it.nombre).trim()) ||
        (it.candidato_nombre && String(it.candidato_nombre).trim()) ||
        (it.candidato && String(it.candidato).trim()) ||
        "Persona en proceso";
      const key = persona;
      if (!map.has(key)) {
        map.set(key, { persona, id: it.id, cedula: it.cedula, fecha: it.fecha });
      }
    }
    return Array.from(map.values());
  }, [data]);

  const startsRef = useStartTimes(data, it => it.id, it => it.fecha);
  useTicker(1000);
  const now = Date.now();

  return (
    <>
      <ProcessDockPortal items={enProcesoCards} />

      <div className="backdrop-blur-xl bg-gradient-to-br from-slate-900/50 via-blue-950/30 to-slate-900/50 border border-cyan-500/20 shadow-[0_8px_32px_rgba(6,182,212,0.15)] rounded-xl md:rounded-2xl overflow-hidden">
        {/* Header elegante */}
        <div className="px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-cyan-500/20">
          <h3 className="text-sm md:text-base font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-1.5 md:gap-2">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Historial de Consultas
          </h3>
        </div>

        {/* Tabla con scroll */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
            <tr className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-b border-cyan-500/20">
              <th className="px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-bold text-cyan-400 uppercase tracking-wider">ID</th>
              <th className="px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-bold text-cyan-400 uppercase tracking-wider">Cédula</th>
              <th className="px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-bold text-cyan-400 uppercase tracking-wider">Nombre</th>
              <th className="px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-bold text-cyan-400 uppercase tracking-wider">Estado</th>
              <th className="px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-bold text-cyan-400 uppercase tracking-wider">Fecha</th>
              <th className="px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-bold text-cyan-400 uppercase tracking-wider">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/10">
              {datosPagina.map((item, idx) => {
                const estado = (item.estado || "").toLowerCase();
                const isProcessing = estado === "en_proceso";
                const isDone = estado === "completado";
                const start = startsRef.current.get(item.id) ?? now;
                const percent = percentFrom(start, now);

                return (
                  <tr 
                    key={item.id} 
                    className="group hover:bg-gradient-to-r hover:from-cyan-500/5 hover:to-blue-500/5 transition-all duration-300 align-top"
                  >
                    <td className="px-2 md:px-3 py-1.5 md:py-2 text-slate-300 font-mono text-[10px] md:text-xs">
                      <span className="inline-flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-cyan-500/20 group-hover:border-cyan-500/40 transition-colors text-[10px] md:text-xs">
                        {item.id}
                      </span>
                    </td>
                    <td className="px-2 md:px-3 py-1.5 md:py-2 text-slate-200 font-semibold text-xs md:text-sm">{item.cedula}</td>
                    <td className="px-2 md:px-3 py-1.5 md:py-2 text-slate-100 font-medium text-xs md:text-sm">{item.nombre || "—"}</td>

                    {/* ESTADO con badges elegantes */}
                    <td className="px-2 md:px-3 py-1.5 md:py-2">
                      {isProcessing ? (
                        <div className="max-w-[140px]">
                          <ElegantProgressBar percent={percent} />
                        </div>
                      ) : isDone ? (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-semibold text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Completado
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 text-xs">
                          {item.estado || "—"}
                        </span>
                      )}
                    </td>

                    <td className="px-2 md:px-3 py-1.5 md:py-2 text-slate-300 text-[10px] md:text-xs">
                      {item.fecha ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-cyan-300 font-semibold">
                            {new Date(item.fecha).toLocaleDateString()}
                          </span>
                          <span className="text-slate-500">
                            {new Date(item.fecha).toLocaleTimeString()}
                          </span>
                        </div>
                      ) : "—"}
                    </td>

                    <td className="px-2 md:px-3 py-1.5 md:py-2">
                      {isDone ? (
                        <button
                          onClick={() => onVerResultados?.(item.id)}
                          className="px-2 md:px-3 py-1 md:py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] hover:scale-105 transform text-[10px] md:text-xs"
                        >
                          Ver resultados
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-cyan-400 text-[10px] md:text-xs">
                          <span className="inline-block w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                          Procesando…
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Paginación elegante */}
        <div className="flex justify-between items-center px-2 md:px-3 py-1.5 md:py-2 mb-0.5 md:mb-1 bg-gradient-to-r from-slate-800/30 to-slate-900/30 border-t border-cyan-500/20">
          <button
            onClick={() => setPagina(prev => Math.max(prev - 1, 1))}
            disabled={pagina === 1}
            className="px-2 md:px-3 py-1 md:py-1.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/30 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed text-cyan-300 font-semibold transition-all duration-300 flex items-center gap-1 text-[10px] md:text-xs"
          >
            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Anterior
          </button>
          
          <span className="text-slate-300 font-semibold text-[10px] md:text-xs">
            Página <span className="text-cyan-400">{pagina}</span> de <span className="text-cyan-400">{totalPaginas || 1}</span>
          </span>
          
          <button
            onClick={() => setPagina(prev => Math.min(prev + 1, totalPaginas || 1))}
            disabled={pagina === totalPaginas || totalPaginas === 0}
            className="px-2 md:px-3 py-1 md:py-1.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/30 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed text-cyan-300 font-semibold transition-all duration-300 flex items-center gap-1 text-[10px] md:text-xs"
          >
            Siguiente
            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
