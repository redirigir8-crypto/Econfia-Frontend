import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

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

export default function ConsultaHistoriaCredito() {
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  const [tipoIdentificacion, setTipoIdentificacion] = useState("");
  const [numeroIdentificacion, setNumeroIdentificacion] = useState("");
  const [apellidoRazonSocial, setApellidoRazonSocial] = useState("");
  const [forzarConsulta, setForzarConsulta] = useState(false);
  const [acepta, setAcepta] = useState(false);
  const [consentimiento, setConsentimiento] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [done, setDone] = useState(false);

  const fieldConfig = useMemo(() => getExperianSubjectField(tipoIdentificacion), [tipoIdentificacion]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!tipoIdentificacion) return setToast({ type: "error", message: "Selecciona el tipo de documento." });
    if (!numeroIdentificacion.trim()) return setToast({ type: "error", message: "Ingresa el número de documento." });
    if (!apellidoRazonSocial.trim()) return setToast({ type: "error", message: `Ingresa ${fieldConfig.label.toLowerCase()}.` });
    if (!acepta) return setToast({ type: "error", message: "Debes aceptar los términos y condiciones." });
    if (!consentimiento) return setToast({ type: "error", message: "Debes confirmar el consentimiento del titular." });

    setLoading(true);

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

      setDone(true);
      setTimeout(() => navigate("/d3b7f1e9"), 1200);
    } catch (_error) {
      setToast({ type: "error", message: "Ocurrió un error al consultar Econfia Credit Report." });
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
      {loading &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="relative w-full max-w-md rounded-2xl border border-cyan-400/20 bg-slate-950/85 p-10 text-center shadow-2xl shadow-cyan-500/20 backdrop-blur-md">
              <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-t-4 border-cyan-400" />
              <p className="animate-pulse text-lg font-semibold text-white">Consultando Econfia Credit Report...</p>
            </div>
          </div>,
          document.body
        )}

      {!loading &&
        done &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="w-full max-w-xl rounded-3xl border border-cyan-400/20 bg-slate-950/88 p-8 text-center shadow-[0_20px_80px_rgba(8,145,178,0.22)] backdrop-blur-xl">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-300">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="bg-gradient-to-r from-white via-cyan-100 to-blue-300 bg-clip-text text-2xl font-black text-transparent">
                Consulta completada
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                El resultado quedó almacenado. Te llevamos al panel de resultados para ver el detalle.
              </p>
            </div>
          </div>,
          document.body
        )}

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <section className="relative min-h-screen overflow-hidden bg-transparent pb-32 pt-24">
        <div className="absolute right-20 top-20 h-72 w-72 animate-pulse rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-20 left-20 h-96 w-96 animate-pulse rounded-full bg-blue-500/10 blur-3xl" style={{ animationDelay: "1s" }} />

        <div className="relative z-10 mx-auto grid max-w-5xl grid-cols-1 items-center gap-6 px-4 md:grid-cols-2">
          <div className="space-y-5 text-center md:text-left">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-3 py-1">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
                </span>
                <span className="text-xs font-medium text-cyan-300">Econfia Credit Report</span>
              </div>
              <h1 className="bg-gradient-to-r from-white via-cyan-100 to-blue-300 bg-clip-text text-3xl font-black leading-tight tracking-tight text-transparent md:text-4xl">
                Econfia Credit Report
              </h1>
            </div>

            <p className="text-sm leading-relaxed text-white/70">
              Consulta el comportamiento crediticio del titular y obtén información relevante para fortalecer tus procesos de evaluación.
            </p>

            <p className="pt-2 text-xs leading-6 text-red-300/85">
              Al realizar esta consulta, declara y certifica que cuenta con la autorización válida y expresa del
              titular del documento consultado.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div className="group relative w-full rounded-[20px] border border-white/10 bg-gradient-to-br from-slate-900/80 via-blue-900/20 to-slate-900/80 p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
              <div className="relative z-10">
                <div className="mb-4 flex items-center justify-center">
                  <img src="/img/logo-econfia-1.png" alt="Econfia" className="h-16 w-16 object-contain" />
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
                    {loading ? "Consultando..." : "Consultar Econfia Credit Report"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
