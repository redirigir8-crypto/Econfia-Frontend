import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

function badgeClasses(estado) {
  const e = String(estado || "").toLowerCase();
  const msg = e;
  if (e === "verificado" || msg.includes("no tiene") || msg.includes("no registra"))
    return "bg-green-500/15 text-green-300 border-green-500/30";
  if (e === "rechazado") return "bg-red-500/15 text-red-300 border-red-500/30";
  if (e === "pendiente") return "bg-amber-500/15 text-amber-300 border-amber-500/30";
  return "bg-white/10 text-slate-300 border-white/15";
}

export default function WalletPublico() {
  const { token } = useParams();
  const [estado, setEstado] = useState("cargando"); // cargando | ok | expirado | error
  const [data, setData] = useState(null);

  const cargar = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/wallet/publico/${token}/`);
      if (res.status === 410) return setEstado("expirado");
      if (!res.ok) return setEstado("error");
      const json = await res.json();
      setData(json);
      setEstado("ok");
    } catch {
      setEstado("error");
    }
  }, [token]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020115] via-[#011a31] to-[#05021f] text-slate-100 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-emerald-400 font-black text-xl">Econfia<span className="text-white">Wallet</span></span>
          <span className="text-xs text-slate-400 ml-auto">Pase temporal</span>
        </div>

        {estado === "cargando" && (
          <div className="text-center py-20 text-slate-400">Cargando…</div>
        )}

        {estado === "expirado" && (
          <Aviso titulo="Pase no disponible"
            texto="Este código QR expiró o fue reemplazado. Pídele a la persona que genere uno nuevo." />
        )}
        {estado === "error" && (
          <Aviso titulo="No se pudo cargar" texto="Ocurrió un problema al abrir el pase." />
        )}

        {estado === "ok" && data && (
          <div className="space-y-6">
            {/* Persona */}
            {data.persona && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="text-[11px] uppercase tracking-wide text-slate-400">Titular</p>
                <p className="text-lg font-bold">{data.persona.nombre || "—"}</p>
                <p className="text-sm text-slate-300">{data.persona.documento}</p>
              </div>
            )}

            {/* Antecedentes */}
            {data.antecedentes && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h2 className="font-bold mb-3">Antecedentes</h2>
                {!data.antecedentes.completada && (
                  <p className="text-amber-300 text-xs mb-3">La consulta aún está en proceso.</p>
                )}
                <div className="space-y-2">
                  {data.antecedentes.resultados.map((r) => (
                    <div key={r.label} className="flex items-center justify-between gap-3 rounded-xl bg-black/20 border border-white/5 px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{r.label}</p>
                        <p className="text-[11px] text-slate-400 truncate">{r.mensaje || "—"}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {r.evidencia_url && (
                          <a href={r.evidencia_url} target="_blank" rel="noreferrer"
                            className="text-emerald-300 hover:text-emerald-200 text-[11px] underline underline-offset-2">
                            Evidencia
                          </a>
                        )}
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badgeClasses(r.estado)}`}>
                          {r.estado}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documentos */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h2 className="font-bold mb-3">Documentos</h2>
              {(!data.documentos || data.documentos.length === 0) ? (
                <p className="text-slate-400 text-xs">Sin documentos.</p>
              ) : (
                <ul className="space-y-2">
                  {data.documentos.map((d, i) => (
                    <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-black/20 border border-white/5 px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{d.tipo_label}</p>
                        {d.archivo_url ? (
                          <a href={d.archivo_url} target="_blank" rel="noreferrer"
                            className="text-emerald-300 hover:text-emerald-200 text-[11px] underline underline-offset-2 truncate block">
                            {d.nombre_original || "Ver documento"}
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-400">{d.nombre_original}</span>
                        )}
                      </div>
                      <span className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badgeClasses(d.estado_verificacion)}`}>
                        {d.estado_label}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <p className="text-center text-[11px] text-slate-500">
              Este pase es temporal y dejará de funcionar automáticamente.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Aviso({ titulo, texto }) {
  return (
    <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl px-6">
      <div className="w-14 h-14 mx-auto rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3l9 16H3L12 3z" />
        </svg>
      </div>
      <p className="text-lg font-bold">{titulo}</p>
      <p className="text-sm text-slate-400 mt-1">{texto}</p>
    </div>
  );
}
