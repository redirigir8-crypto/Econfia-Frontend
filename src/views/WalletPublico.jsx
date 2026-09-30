import { DatosEmpresaCompartidos, DocumentosEmpresa } from "../components/WalletEmpresaContenido";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

/* ── helpers ─────────────────────────────────────────────── */
function estadoKind(estado) {
  const e = String(estado || "").toLowerCase();
  if (e === "verificado" || e.includes("no tiene") || e.includes("no registra") || e.includes("complet"))
    return "ok";
  if (e === "rechazado") return "bad";
  if (e === "pendiente" || e.includes("proceso")) return "wait";
  return "neutral";
}

function badgeClasses(estado) {
  switch (estadoKind(estado)) {
    case "ok": return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    case "bad": return "bg-red-500/15 text-red-300 border-red-500/30";
    case "wait": return "bg-amber-500/15 text-amber-300 border-amber-500/30";
    default: return "bg-white/10 text-slate-300 border-white/15";
  }
}

function iniciales(nombre) {
  const parts = String(nombre || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "•";
  return ((parts[0][0] || "") + (parts[parts.length - 1][0] || "")).toUpperCase();
}

function extDe(archivoUrl, nombre) {
  const s = String(archivoUrl || nombre || "").split("?")[0];
  const m = s.match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toLowerCase() : "";
}

function esImagen(ext) {
  return ["jpg", "jpeg", "png", "webp", "gif", "bmp", "heic"].includes(ext);
}

function fmtFecha(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("es-CO", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return ""; }
}

/* ── íconos ──────────────────────────────────────────────── */
const Icono = {
  check: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 6 9 17l-5-5" /></svg>),
  x: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 6 6 18M6 6l12 12" /></svg>),
  reloj: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>),
  imagen: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="1.6" /><path d="m21 15-5-5L5 21" /></svg>),
  pdf: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>),
  escudo: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3 4 6v6c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V6z" /><path d="m9 12 2 2 4-4" /></svg>),
  candado: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>),
};

function StatusBadge({ estado, label }) {
  const kind = estadoKind(estado);
  const IcoComp = kind === "ok" ? Icono.check : kind === "bad" ? Icono.x : kind === "wait" ? Icono.reloj : null;
  return (
    <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${badgeClasses(estado)}`}>
      {IcoComp && <IcoComp width="12" height="12" />}
      {label || estado}
    </span>
  );
}

/* ── componente principal ────────────────────────────────── */
export default function WalletPublico() {
  const { token } = useParams();
  const [estado, setEstado] = useState("cargando"); // cargando | ok | expirado | error
  const [data, setData] = useState(null);

  const cargar = useCallback(async () => {
    setEstado("cargando");
    setData(null);
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

  useEffect(() => { cargar(); }, [cargar]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020115] via-[#011a31] to-[#05021f] text-slate-100 px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <span className="font-black text-xl tracking-tight">
            <span className="text-emerald-400">Econfia</span><span className="text-white">Wallet</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-3 py-1">
            <Icono.reloj width="12" height="12" /> Pase temporal
          </span>
        </div>

        {estado === "cargando" && (
          <div className="space-y-4 animate-pulse">
            <div className="h-32 rounded-3xl bg-white/5 border border-white/10" />
            <div className="h-48 rounded-3xl bg-white/5 border border-white/10" />
          </div>
        )}

        {estado === "expirado" && (
          <Aviso titulo="Pase no disponible"
            texto="Este pase expiró, fue revocado o agotó sus consultas. Solicita un nuevo pase a su titular." />
        )}
        {estado === "error" && (
          <Aviso titulo="No se pudo cargar" texto="Ocurrió un problema al abrir el pase." />
        )}

        {estado === "ok" && data && (
          <div className="space-y-5">
            {/* Empresa */}
            {data.es_empresa && data.empresa && (
              <Seccion titulo="Datos de la empresa">
                <DatosEmpresaCompartidos empresa={data.empresa} publico />
              </Seccion>
            )}
            {data.es_empresa && data.representante && (
              <Seccion titulo="Representante legal">
                <p className="text-sm break-words font-semibold">{data.representante.nombre || "—"}</p>
                {data.representante.num_doc && (
                  <p className="text-sm text-slate-400">{data.representante.tipo_doc} {data.representante.num_doc}</p>
                )}
              </Seccion>
            )}

            {/* Titular (persona natural) — tarjeta de identidad */}
            {data.persona && (
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 via-white/[0.04] to-teal-500/10 p-6">
                <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl" />
                <div className="relative flex items-center gap-4">
                  <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-[#04121a] font-black text-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    {iniciales(data.persona.nombre)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-widest text-emerald-300/80">Titular</p>
                    <p className="text-xl sm:text-2xl font-bold leading-tight break-words">{data.persona.nombre || "—"}</p>
                    <p className="text-sm text-slate-300 mt-0.5">{data.persona.documento}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Antecedentes */}
            {data.antecedentes && (
              <Seccion
                titulo="Antecedentes"
                icono={<Icono.escudo width="18" height="18" className="text-emerald-300" />}
                extra={
                  <StatusBadge
                    estado={data.antecedentes.completada ? "verificado" : "pendiente"}
                    label={data.antecedentes.completada ? "Completado" : "En proceso"}
                  />
                }
              >
                {!data.antecedentes.completada && (
                  <p className="text-amber-300/90 text-xs mb-3">La consulta aún está en proceso.</p>
                )}
                <div className="space-y-2">
                  {data.antecedentes.resultados.map((r) => (
                    <div key={r.label} className="flex items-center justify-between gap-3 rounded-xl bg-black/25 border border-white/5 px-4 py-3 hover:border-white/10 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{r.label}</p>
                        <p className="text-[11px] text-slate-400 truncate">{r.mensaje || "—"}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {r.evidencia_url && (
                          <a href={r.evidencia_url} target="_blank" rel="noreferrer"
                            className="text-emerald-300 hover:text-emerald-200 text-[11px] font-semibold underline underline-offset-2">
                            Evidencia
                          </a>
                        )}
                        <StatusBadge estado={r.estado} />
                      </div>
                    </div>
                  ))}
                </div>
              </Seccion>
            )}

            {/* Documentos */}
            {data.atributos?.includes("documentos") && (
              <Seccion titulo={data.es_empresa ? "Documentos de la empresa" : "Documentos"}>
                {data.es_empresa ? (
                  <DocumentosEmpresa documentos={data.documentos || []} publico />
                ) : (!data.documentos || data.documentos.length === 0) ? (
                  <p className="text-slate-400 text-xs">Sin documentos.</p>
                ) : (
                  <ul className="space-y-2">
                    {data.documentos.map((d, i) => {
                      const ext = extDe(d.archivo_url, d.nombre_original);
                      const IcoFile = esImagen(ext) ? Icono.imagen : Icono.pdf;
                      return (
                        <li key={i} className="flex items-center gap-3 rounded-xl bg-black/25 border border-white/5 px-4 py-3 hover:border-white/10 transition-colors">
                          <span className="shrink-0 w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                            <IcoFile width="18" height="18" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold">{d.tipo_label}</p>
                            {d.archivo_url ? (
                              <a href={d.archivo_url} target="_blank" rel="noreferrer"
                                className="text-emerald-300 hover:text-emerald-200 text-[11px] underline underline-offset-2 truncate block">
                                {d.nombre_original || "Ver documento"}
                              </a>
                            ) : (
                              <span className="text-[11px] text-slate-400 truncate block">{d.nombre_original}</span>
                            )}
                          </div>
                          <StatusBadge estado={d.estado_verificacion} label={d.estado_label} />
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Seccion>
            )}

            {/* Pie */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-2">
              <Icono.candado width="13" height="13" />
              <span>
                Pase temporal y seguro
                {data.expires_at ? ` · válido hasta ${fmtFecha(data.expires_at)}` : ""}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Seccion({ titulo, icono, extra, children }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        {icono}
        <h2 className="font-bold">{titulo}</h2>
        {extra && <span className="ml-auto">{extra}</span>}
      </div>
      {children}
    </div>
  );
}

function Aviso({ titulo, texto }) {
  return (
    <div className="text-center py-16 bg-white/5 border border-white/10 rounded-3xl px-6">
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
