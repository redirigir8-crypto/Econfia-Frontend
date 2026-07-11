import { useCallback, useEffect, useMemo, useState } from "react";

import Terminos from "../components/Terminos";
import Toast from "../components/Toast";
import { EXPERIAN_DOCUMENT_OPTIONS, getExperianSubjectField } from "../utils/experian";

function buildAuthorizedName() {
  try {
    const raw = JSON.parse(localStorage.getItem("user") || "{}");
    const fromNames = [raw.first_name, raw.last_name].filter(Boolean).join(" ").trim();
    const fromPerfil = [raw?.perfil?.nombre, raw?.perfil?.apellido].filter(Boolean).join(" ").trim();
    return fromNames || fromPerfil || raw.username || "Usuario Econfia";
  } catch (_error) {
    return "Usuario Econfia";
  }
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

// Visor genérico de JSON (mientras se conoce el formato real de la respuesta).
function JsonTree({ data, level = 0 }) {
  if (data === null || data === undefined) {
    return <span className="text-slate-500">—</span>;
  }
  if (typeof data !== "object") {
    return <span className="text-cyan-200">{String(data)}</span>;
  }

  const entries = Array.isArray(data)
    ? data.map((v, i) => [i, v])
    : Object.entries(data);

  if (!entries.length) {
    return <span className="text-slate-500">{Array.isArray(data) ? "[ ]" : "{ }"}</span>;
  }

  return (
    <div className={level === 0 ? "" : "ml-4 border-l border-white/10 pl-3"}>
      {entries.map(([key, value]) => {
        const isObj = value && typeof value === "object";
        return (
          <div key={key} className="py-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {String(key)}
            </span>
            {isObj ? (
              <JsonTree data={value} level={level + 1} />
            ) : (
              <span className="ml-2 text-sm text-slate-100">{String(value)}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ConsultaHistoriaCredito() {
  const API_URL = process.env.REACT_APP_API_URL;

  const [tipoIdentificacion, setTipoIdentificacion] = useState("");
  const [numeroIdentificacion, setNumeroIdentificacion] = useState("");
  const [apellidoRazonSocial, setApellidoRazonSocial] = useState("");
  const [forzarConsulta, setForzarConsulta] = useState(false);
  const [acepta, setAcepta] = useState(false);
  const [consentimiento, setConsentimiento] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [historial, setHistorial] = useState([]);

  const fieldConfig = useMemo(
    () => getExperianSubjectField(tipoIdentificacion),
    [tipoIdentificacion]
  );

  const cargarHistorial = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/hdc/consultas/?limit=15`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!response.ok) return;
      const data = await response.json();
      setHistorial(data.consultas || []);
    } catch (_error) {
      /* silencioso */
    }
  }, [API_URL]);

  useEffect(() => {
    cargarHistorial();
  }, [cargarHistorial]);

  const verDetalle = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/hdc/consultas/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await response.json();
      if (response.ok) setResultado(data);
    } catch (_error) {
      setToast({ type: "error", message: "No se pudo cargar el detalle." });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!tipoIdentificacion) return setToast({ type: "error", message: "Selecciona el tipo de documento." });
    if (!numeroIdentificacion.trim()) return setToast({ type: "error", message: "Ingresa el número de documento." });
    if (!apellidoRazonSocial.trim()) return setToast({ type: "error", message: `Ingresa ${fieldConfig.label.toLowerCase()}.` });
    if (!acepta) return setToast({ type: "error", message: "Debes aceptar los términos y condiciones." });
    if (!consentimiento) return setToast({ type: "error", message: "Debes confirmar el consentimiento del titular." });

    setLoading(true);
    setResultado(null);

    try {
      const token = localStorage.getItem("token");
      const payload = {
        tipoIdentificacion,
        numeroIdentificacion: numeroIdentificacion.trim(),
        apellidoRazonSocial: apellidoRazonSocial.trim(),
        forzarConsulta,
        autorizacion: {
          nombre_autorizado: buildAuthorizedName(),
          tipo_identificacion: tipoIdentificacion,
          numero_identificacion: numeroIdentificacion.trim(),
          fecha_autorizacion: todayIsoDate(),
          autorizado: true,
        },
      };

      const response = await fetch(`${API_URL}/api/hdc/consultar/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        setToast({ type: "error", message: data.error || `Error HTTP: ${response.status}` });
        return;
      }

      setResultado(data.consulta || data);
      setToast({ type: "success", message: "Consulta de Historia de Crédito completada." });
      cargarHistorial();
    } catch (_error) {
      setToast({ type: "error", message: "Ocurrió un error al consultar Historia de Crédito." });
    } finally {
      setLoading(false);
    }
  };

  const disabled =
    loading ||
    !tipoIdentificacion ||
    !numeroIdentificacion.trim() ||
    !apellidoRazonSocial.trim() ||
    !acepta ||
    !consentimiento;

  return (
    <>
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      <section className="relative min-h-screen overflow-hidden bg-transparent pb-32 pt-24">
        <div className="absolute right-20 top-20 h-72 w-72 animate-pulse rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-20 left-20 h-96 w-96 animate-pulse rounded-full bg-blue-500/10 blur-3xl" style={{ animationDelay: "1s" }} />

        <div className="relative z-10 mx-auto grid max-w-5xl grid-cols-1 items-start gap-6 px-4 md:grid-cols-2">
          {/* Info + formulario */}
          <div className="space-y-5 text-center md:text-left">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-3 py-1">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
                </span>
                <span className="text-xs font-medium text-cyan-300">Historia de Crédito</span>
              </div>
              <h1 className="bg-gradient-to-r from-white via-cyan-100 to-blue-300 bg-clip-text text-3xl font-black leading-tight tracking-tight text-transparent md:text-4xl">
                Historia de Crédito (HDC+)
              </h1>
            </div>

            <p className="text-sm leading-relaxed text-white/70">
              Consulta la historia de crédito del titular directamente en la central de riesgo.
            </p>

            <p className="pt-2 text-xs leading-6 text-red-300/85">
              Al realizar esta consulta, declara y certifica que cuenta con la autorización válida y
              expresa del titular del documento consultado.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div className="group relative w-full rounded-[20px] border border-white/10 bg-gradient-to-br from-slate-900/80 via-blue-900/20 to-slate-900/80 p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
              <div className="relative z-10">
                <div className="mb-4 flex items-center justify-center">
                  <img src="/img/logo-econfia-rojo.png" alt="Econfia" className="max-h-10 w-auto" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-white/70">Tipo de documento *</label>
                    <select
                      required
                      value={tipoIdentificacion}
                      onChange={(e) => setTipoIdentificacion(e.target.value)}
                      className="w-full cursor-pointer appearance-none rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white transition-all focus:border-cyan-400/50 focus:bg-white/10 focus:outline-none"
                    >
                      <option className="bg-slate-900" value="">Seleccione tipo de documento</option>
                      {EXPERIAN_DOCUMENT_OPTIONS.map((option) => (
                        <option key={option.value} className="bg-slate-900" value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-white/70">Número de documento *</label>
                    <input
                      required
                      type="text"
                      value={numeroIdentificacion}
                      onChange={(e) => setNumeroIdentificacion(e.target.value)}
                      placeholder="Ingrese número de documento"
                      className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/40 transition-all focus:border-cyan-400/50 focus:bg-white/10 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-white/70">{fieldConfig.label} *</label>
                    <input
                      required
                      type="text"
                      value={apellidoRazonSocial}
                      onChange={(e) => setApellidoRazonSocial(e.target.value)}
                      placeholder={fieldConfig.placeholder}
                      className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/40 transition-all focus:border-cyan-400/50 focus:bg-white/10 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 pt-1">
                    <label className="group flex cursor-pointer items-center gap-2">
                      <input type="checkbox" checked={forzarConsulta} onChange={(e) => setForzarConsulta(e.target.checked)} className="h-4 w-4 cursor-pointer accent-cyan-500" />
                      <span className="text-xs text-white/80">Forzar consulta nueva</span>
                    </label>
                    <label className="group flex cursor-pointer items-center gap-2">
                      <input type="checkbox" checked={acepta} onChange={(e) => setAcepta(e.target.checked)} className="h-4 w-4 cursor-pointer accent-cyan-500" />
                      <span className="text-xs text-white/80">
                        Acepto los{" "}
                        <Terminos inline triggerClassName="font-medium text-cyan-400 underline underline-offset-4 hover:text-cyan-300" />
                      </span>
                    </label>
                    <label className="group flex cursor-pointer items-center gap-2">
                      <input type="checkbox" checked={consentimiento} onChange={(e) => setConsentimiento(e.target.checked)} className="h-4 w-4 cursor-pointer accent-cyan-500" />
                      <span className="text-xs text-white/80">Confirmo consentimiento del titular</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={disabled}
                    className={`mt-2 w-full rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-300 ${
                      disabled
                        ? "cursor-not-allowed bg-white/10 text-white/40"
                        : "transform bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:scale-105 hover:from-cyan-400 hover:to-blue-400 hover:shadow-lg hover:shadow-cyan-500/50"
                    }`}
                  >
                    {loading ? "Consultando..." : "Consultar Historia de Crédito"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Resultado */}
        {resultado && (
          <div className="relative z-10 mx-auto mt-8 max-w-5xl px-4">
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 backdrop-blur-xl">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-bold text-white">
                  {(resultado.resumen_json?.nombre_completo || resultado.apellido_razon_social) ?? "Resultado"}
                </h2>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  resultado.estado === "completado"
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-rose-500/15 text-rose-300"
                }`}>
                  {resultado.estado} · HTTP {resultado.codigo_http ?? "—"}
                </span>
                <span className="text-xs text-slate-400">
                  Doc: {resultado.tipo_identificacion} {resultado.numero_identificacion}
                </span>
              </div>

              {resultado.mensaje && (
                <p className="mb-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  {resultado.mensaje}
                </p>
              )}

              <div className="rounded-xl border border-white/10 bg-[#02040a] p-4">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Respuesta completa
                </div>
                <div className="max-h-[28rem] overflow-auto">
                  <JsonTree data={resultado.respuesta_json} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Historial */}
        {historial.length > 0 && (
          <div className="relative z-10 mx-auto mt-8 max-w-5xl px-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Historial de consultas
            </h3>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-[11px] uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Documento</th>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {historial.map((item) => (
                    <tr key={item.id} className="border-t border-white/5 hover:bg-white/5">
                      <td className="px-4 py-3 text-slate-200">{item.tipo_identificacion} {item.numero_identificacion}</td>
                      <td className="px-4 py-3 text-slate-200">{item.nombre_mostrado || item.apellido_razon_social}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          item.estado === "completado" ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"
                        }`}>
                          {item.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {item.created_at ? new Date(item.created_at).toLocaleString("es-CO") : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => verDetalle(item.id)}
                          className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-1.5 text-xs font-semibold text-white hover:from-cyan-400 hover:to-blue-400"
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
