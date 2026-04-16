import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const ESTADO_LABEL = {
  pendiente: { text: "Pendiente", color: "text-yellow-300", dot: "bg-yellow-400" },
  en_proceso: { text: "En proceso", color: "text-cyan-300", dot: "bg-cyan-400 animate-pulse" },
  completado: { text: "Completado", color: "text-green-400", dot: "bg-green-400" },
  finalizado: { text: "Finalizado", color: "text-green-400", dot: "bg-green-400" },
  error: { text: "Error", color: "text-red-400", dot: "bg-red-400" },
  validado: { text: "Completado", color: "text-green-400", dot: "bg-green-400" },
  offline: { text: "Error", color: "text-red-400", dot: "bg-red-400" },
};

function getEstadoInfo(estado) {
  return ESTADO_LABEL[(estado || "").toLowerCase()] || { text: estado, color: "text-white/60", dot: "bg-white/40" };
}

/**
 * Modal de consulta en vivo.
 * Props:
 *  - consultaId: number|null — mientras sea null el modal no aparece
 *  - onClose: () => void — solo se llama cuando el usuario hace clic en "Ver resultados" o "Cerrar"
 */
export default function LiveQueryModal({ consultaId, onClose, onFinished }) {
  const [resultados, setResultados] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [totalFuentes, setTotalFuentes] = useState(0);
  const [completados, setCompletados] = useState(0);
  const [done, setDone] = useState(false);
  const intervalRef = useRef(null);
  const rotateRef = useRef(null);
  const closeTimeoutRef = useRef(null);
  const API_URL = process.env.REACT_APP_API_URL;

  // Polling cada 1.5 s mientras la consulta está activa
  useEffect(() => {
    if (!consultaId) return;

    setResultados([]);
    setActiveIdx(0);
    setDone(false);
    clearTimeout(closeTimeoutRef.current);

    const poll = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/resultados-live/${consultaId}/`, {
          headers: { Authorization: `Token ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();

        if (Array.isArray(data)) {
          setResultados(data);
          setTotalFuentes(data.length);

          const terminados = data.filter((r) =>
            ["completado", "finalizado", "error", "validado", "offline"].includes((r.estado || "").toLowerCase())
          ).length;
          setCompletados(terminados);

          const allDone =
            data.length > 0 &&
            data.every((r) =>
              ["completado", "finalizado", "error", "validado", "offline"].includes((r.estado || "").toLowerCase())
            );

          if (allDone) {
            setDone(true);
            clearInterval(intervalRef.current);
          }
          return;
        }

        const resultadosPayload = Array.isArray(data?.resultados) ? data.resultados : [];
        setResultados(resultadosPayload);
        setTotalFuentes(Number(data?.total_fuentes) || 0);
        setCompletados(Number(data?.completados) || 0);

        if (data?.done) {
          setDone(true);
          clearInterval(intervalRef.current);
        } else {
          setDone(false);
        }
      } catch (_) {}
    };

    poll();
    intervalRef.current = setInterval(poll, 1500);
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(closeTimeoutRef.current);
    };
  }, [consultaId, API_URL]);

  const resultadosVisibles = resultados.filter((resultado) =>
    ["completado", "finalizado", "error", "validado", "offline"].includes((resultado.estado || "").toLowerCase())
  );

  // Rotar tarjeta activa cada 2 s
  useEffect(() => {
    if (resultadosVisibles.length === 0) return;
    clearInterval(rotateRef.current);
    rotateRef.current = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % resultadosVisibles.length);
    }, 2000);
    return () => clearInterval(rotateRef.current);
  }, [resultadosVisibles.length]);

  useEffect(() => {
    if (resultadosVisibles.length === 0) {
      setActiveIdx(0);
      return;
    }
    if (activeIdx > resultadosVisibles.length - 1) {
      setActiveIdx(0);
    }
  }, [activeIdx, resultadosVisibles.length]);

  useEffect(() => {
    clearTimeout(closeTimeoutRef.current);
    if (!done) return;

    closeTimeoutRef.current = setTimeout(() => {
      onFinished?.();
    }, 1200);

    return () => clearTimeout(closeTimeoutRef.current);
  }, [done, onFinished]);

  if (!consultaId) return null;

  const active = resultadosVisibles[activeIdx] || null;
  const progress = totalFuentes > 0 ? Math.round((completados / totalFuentes) * 100) : 0;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-md rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900/98 via-blue-950/60 to-slate-900/98 shadow-2xl shadow-cyan-500/20 overflow-hidden">

        {/* Cabecera */}
        <div className="px-6 pt-5 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${done ? "bg-green-400" : "bg-cyan-400 animate-ping"}`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${done ? "bg-green-500" : "bg-cyan-500"}`} />
            </span>
            <span className="text-xs font-semibold text-cyan-300 uppercase tracking-widest">
              {done ? "Consulta completada" : "Procesando consulta"}
            </span>
          </div>
          <h3 className="text-lg font-black text-white">
            Resultados en tiempo real
          </h3>
        </div>

        {/* Cuerpo */}
        <div className="px-6 py-5 space-y-4">

          {/* Barra de progreso */}
          <div>
            <div className="flex justify-between text-xs text-white/50 mb-1.5">
              <span>{completados} de {totalFuentes} fuentes procesadas</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${done ? "bg-green-500" : "bg-gradient-to-r from-cyan-500 to-blue-500"}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Tarjeta de fuente activa */}
          {active ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 min-h-[90px] transition-all duration-500">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Fuente consultada</p>
                  <p className="text-sm font-semibold text-white truncate">
                    {active.fuente || active.fuente_nombre || "—"}
                  </p>
                  {active.mensaje && (
                    <p className="text-xs text-white/50 mt-1 line-clamp-2">{active.mensaje}</p>
                  )}
                </div>
                <div className="flex-shrink-0 flex items-center gap-1.5 mt-0.5">
                  {(() => {
                    const info = getEstadoInfo(active.estado);
                    return (
                      <>
                        <span className={`inline-block w-2 h-2 rounded-full ${info.dot}`} />
                        <span className={`text-xs font-medium ${info.color}`}>{info.text}</span>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 min-h-[90px] flex items-center justify-center">
              <span className="text-white/40 text-sm">Esperando primeras fuentes procesadas...</span>
            </div>
          )}

          {/* Mini lista de 4 fuentes rotando según la activa */}
          {resultadosVisibles.length > 0 && (
            <div className="space-y-1.5 max-h-[140px] overflow-hidden">
              {(() => {
                // Calcula la ventana de 4 fuentes a mostrar, centrada en activeIdx
                const total = resultadosVisibles.length;
                const windowSize = 4;
                let start = activeIdx;
                // Si quedan menos de 4 al final, ajusta para mostrar siempre 4 si es posible
                if (start > total - windowSize) start = Math.max(0, total - windowSize);
                const window = resultadosVisibles.slice(start, start + windowSize);
                return window.map((r, i) => {
                  const info = getEstadoInfo(r.estado);
                  // Marca la fuente activa
                  const isActive = start + i === activeIdx;
                  return (
                    <div
                      key={r.id || i}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 ${isActive ? "bg-white/8 border border-white/10" : "bg-transparent"}`}
                    >
                      <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${info.dot}`} />
                      <span className="flex-1 text-xs text-white/70 truncate">{r.fuente || r.fuente_nombre || "—"}</span>
                      <span className={`text-[10px] font-medium ${info.color}`}>{info.text}</span>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm font-semibold transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
