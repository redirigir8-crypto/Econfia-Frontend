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

/* ===== Barra neón (sin tiempo) ===== */
function NeonProgressBar({ percent = 0, showLabel = true, className = "" }) {
  const pct = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div className={`w-full ${className}`}>
      <div className="w-full h-2 rounded-full bg-white/10 border border-white/10 overflow-hidden relative">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 shadow-[0_0_12px_rgba(34,211,238,0.6)]"
          style={{ width: `${pct}%`, transition: "width 0.8s linear" }}
        />
        <div className="pointer-events-none absolute inset-0 shadow-[0_0_20px_rgba(59,130,246,0.35)_inset]" />
      </div>
      {showLabel && (
        <div className="mt-1 text-[10px] text-cyan-300 font-mono text-right">
          {pct}%
        </div>
      )}
    </div>
  );
}
function NeonCard({ children, className = "" }) {
  return (
    <div
      className={[
        "px-3 py-2 rounded-xl border text-gray-100",
        "bg-[radial-gradient(120%_80%_at_0%_0%,rgba(34,211,238,0.10),transparent_60%),radial-gradient(120%_80%_at_100%_0%,rgba(217,70,239,0.08),transparent_60%)]",
        "border-cyan-400/30 hover:border-cyan-300/50 transition",
        "shadow-[0_0_12px_rgba(34,211,238,0.25)]",
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
      <div className="backdrop-blur-md bg-black/60 border border-white/10 rounded-2xl shadow-2xl w-[300px]">
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
          <div className="flex items-center gap-2 text-gray-100">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
            <span className="text-xs font-semibold tracking-wide">
              {items.length > 0
                ? `Procesando ${items.length} ${items.length === 1 ? "caso" : "casos"}`
                : "Sin procesos en curso"}
            </span>
          </div>
          <button
            onClick={() => setOpen(v => !v)}
            className="text-[11px] px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-gray-100 border border-white/10 transition"
          >
            {open ? "Minimizar" : "Expandir"}
          </button>
        </div>

        {open && items.length > 0 && (
          <div className="px-3 pb-3 pt-2 max-h-[50vh] overflow-auto">
            <div className="flex flex-col gap-2">
              {items.map(card => {
                const start = startsRef.current.get(card.id) ?? now;
                const percent = percentFrom(start, now);
                return (
                  <NeonCard key={`${card.id}-${card.persona}`} className="gap-2">
                    <div className="flex items-center gap-3">
                      {/* loader circular (solo en CARD) */}
                      <span className="inline-block w-4 h-4 rounded-full border-2 border-white/20 border-t-cyan-400 animate-spin shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold line-clamp-1">{card.persona}</div>
                        <div className="text-[10px] text-gray-300">
                          {card.cedula ? `CC ${card.cedula}` : ""}
                          {card.fecha ? ` · ${new Date(card.fecha).toLocaleTimeString()}` : ""}
                        </div>
                      </div>
                    </div>
                    <NeonProgressBar percent={percent} />
                  </NeonCard>
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

      <div className="backdrop-blur-md bg-white/5 border border-white/10 shadow-lg rounded-2xl p-4 text-gray-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/10 border-b border-white/20">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Cédula</th>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Acción</th>
            </tr>
          </thead>
          <tbody>
            {datosPagina.map(item => {
              const estado = (item.estado || "").toLowerCase();
              const isProcessing = estado === "en_proceso";
              const isDone = estado === "completado";
              const start = startsRef.current.get(item.id) ?? now;
              const percent = percentFrom(start, now);

              return (
                <tr key={item.id} className="border-b border-white/10 hover:bg-white/5 transition align-top">
                  <td className="px-4 py-2">{item.id}</td>
                  <td className="px-4 py-2">{item.cedula}</td>
                  <td className="px-4 py-2">{item.nombre || "—"}</td>

                  {/* ESTADO: solo barra + % */}
                  <td className="px-4 py-2">
                    {isProcessing ? (
                      <NeonProgressBar percent={percent} />
                    ) : isDone ? (
                      <span className="text-green-400 font-semibold">Completado</span>
                    ) : (
                      <span className="text-gray-300">{item.estado || "—"}</span>
                    )}
                  </td>

                  <td className="px-4 py-2">
                    {item.fecha ? new Date(item.fecha).toLocaleString() : "—"}
                  </td>

                  <td className="px-4 py-2">
                    {isDone ? (
                      <button
                        onClick={() => onVerResultados?.(item.id)}
                        className="px-3 py-1 bg-blue-600/80 text-white rounded-lg hover:bg-blue-500 transition shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                      >
                        Ver resultados
                      </button>
                    ) : (
                      <span className="text-cyan-300">Procesando…</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Paginación */}
        <div className="flex justify-between items-center mt-4 text-gray-300">
          <button
            onClick={() => setPagina(prev => Math.max(prev - 1, 1))}
            disabled={pagina === 1}
            className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg disabled:opacity-40 hover:bg-white/20 transition"
          >
            Anterior
          </button>
          <span> Página {pagina} de {totalPaginas || 1} </span>
          <button
            onClick={() => setPagina(prev => Math.min(prev + 1, totalPaginas || 1))}
            disabled={pagina === totalPaginas || totalPaginas === 0}
            className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg disabled:opacity-40 hover:bg-white/20 transition"
          >
            Siguiente
          </button>
        </div>
      </div>
    </>
  );
}
