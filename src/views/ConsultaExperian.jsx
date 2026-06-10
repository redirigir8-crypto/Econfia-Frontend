import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

import Terminos from "../components/Terminos";
import Toast from "../components/Toast";
import {
  EXPERIAN_DOCUMENT_OPTIONS,
  getExperianSubjectField,
} from "../utils/experian";

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

export default function ConsultaExperian() {
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  const [tipoIdentificacion, setTipoIdentificacion] = useState("");
  const [numeroIdentificacion, setNumeroIdentificacion] = useState("");
  const [apellidoRazonSocial, setApellidoRazonSocial] = useState("");
  const [acepta, setAcepta] = useState(false);
  const [consentimiento, setConsentimiento] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [resultado, setResultado] = useState(null);

  const fieldConfig = useMemo(
    () => getExperianSubjectField(tipoIdentificacion),
    [tipoIdentificacion]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!tipoIdentificacion) {
      setToast({ type: "error", message: "Selecciona el tipo de documento." });
      return;
    }
    if (!numeroIdentificacion.trim()) {
      setToast({ type: "error", message: "Ingresa el número de documento." });
      return;
    }
    if (!apellidoRazonSocial.trim()) {
      setToast({ type: "error", message: `Ingresa ${fieldConfig.label.toLowerCase()}.` });
      return;
    }
    if (!acepta) {
      setToast({ type: "error", message: "Debes aceptar los términos y condiciones." });
      return;
    }
    if (!consentimiento) {
      setToast({ type: "error", message: "Debes confirmar el consentimiento del titular." });
      return;
    }

    setLoading(true);
    setResultado(null);

    try {
      const token = localStorage.getItem("token");
      const payload = {
        tipoIdentificacion,
        numeroIdentificacion: numeroIdentificacion.trim(),
        apellidoRazonSocial: apellidoRazonSocial.trim(),
        autorizacion: {
          nombre_autorizado: buildAuthorizedName(),
          tipo_identificacion: tipoIdentificacion,
          numero_identificacion: numeroIdentificacion.trim(),
          fecha_autorizacion: todayIsoDate(),
          autorizado: true,
        },
      };

      const response = await fetch(`${API_URL}/api/experian/consultar/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        setToast({
          type: "error",
          message: data.error || `Error HTTP: ${response.status}`,
        });
        return;
      }

      setResultado(data.consulta || data);
      setTimeout(() => navigate("/d3b7f1e9"), 1200);
    } catch (_error) {
      setToast({ type: "error", message: "Ocurrió un error al consultar Experian." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="relative w-full max-w-md rounded-2xl border border-cyan-400/20 bg-slate-950/85 p-10 text-center shadow-2xl shadow-cyan-500/20 backdrop-blur-md">
              <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-t-4 border-cyan-400" />
              <p className="animate-pulse text-lg font-semibold text-white">
                Consultando MiDecisor en Experian...
              </p>
            </div>
          </div>,
          document.body
        )}

      {!loading &&
        resultado &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="w-full max-w-xl rounded-3xl border border-cyan-400/20 bg-slate-950/88 p-8 text-center shadow-[0_20px_80px_rgba(8,145,178,0.22)] backdrop-blur-xl">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-300">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="bg-gradient-to-r from-white via-cyan-100 to-blue-300 bg-clip-text text-2xl font-black text-transparent">
                Consulta Experian completada
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                El resultado ya quedó almacenado y te enviaremos al panel de resultados para revisar el detalle.
              </p>
            </div>
          </div>,
          document.body
        )}

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
          sound="/sounds/error-011-352286.mp3"
        />
      )}

      <section className="relative min-h-screen overflow-hidden bg-transparent pb-32 pt-24">
        <div className="absolute right-20 top-20 h-72 w-72 animate-pulse rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-20 left-20 h-96 w-96 animate-pulse rounded-full bg-blue-500/10 blur-3xl" style={{ animationDelay: "1s" }} />

        <div className="hidden items-center gap-3 absolute left-6 top-6 z-20 md:flex group">
          <div className="relative">
            <div className="absolute inset-0 scale-125 rounded-full bg-red-500/30 blur-xl transition-all duration-500 group-hover:bg-red-500/50" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-[0_0_24px_rgba(220,38,38,0.3)] backdrop-blur-md transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_0_36px_rgba(220,38,38,0.5)]">
              <img src="/img/logo-econfia-1.png" alt="Econfia" className="h-9 w-9 object-contain drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
            </div>
          </div>
          <div>
            <p
              className="bg-clip-text text-base font-black uppercase tracking-[0.3em] text-transparent"
              style={{
                backgroundImage: "linear-gradient(to right, #ffffff, #bae6fd, #38bdf8, #0ea5e9)",
                filter: "drop-shadow(0 0 8px rgba(56,189,248,0.9))",
              }}
            >
              Econfia
            </p>
            <p className="mt-0.5 text-[9px] font-light uppercase tracking-[0.2em] text-white/40">
              Una marca de Grupo Soluciones
            </p>
          </div>
        </div>

        <div className="relative z-10 mx-auto grid max-w-5xl grid-cols-1 items-center gap-6 px-4 md:grid-cols-2">
          <div className="space-y-5 text-center md:text-left">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-3 py-1">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
                </span>
                <span className="text-xs font-medium text-cyan-300">MiDecisor Experian</span>
              </div>
              <h1 className="bg-gradient-to-r from-white via-cyan-100 to-blue-300 bg-clip-text text-3xl font-black leading-tight tracking-tight text-transparent md:text-4xl">
                Central de riesgo Experian
              </h1>
            </div>

            <p className="text-sm leading-relaxed text-white/70">
              Consulta perfil crediticio y validación en una sola operación. Si seleccionas NIT, el sistema lo tratará como persona jurídica; los demás documentos se procesan como persona natural.
            </p>

            <ul className="space-y-2 text-xs text-white/55">
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />Score, viabilidad y alertas relevantes</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />Detección automática de PN o PJ según el documento</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />Detalle completo disponible luego en el panel de resultados</li>
            </ul>

            <p className="pt-4 text-xs leading-6 text-red-300/85">
              Al realizar esta consulta, declara y certifica que cuenta con la autorización válida y expresa del titular del documento o de la empresa consultada.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div className="group relative w-full rounded-[20px] border border-white/10 bg-gradient-to-br from-slate-900/80 via-blue-900/20 to-slate-900/80 p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
              <div className="pointer-events-none absolute inset-0 rounded-[20px] bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
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
                      onChange={(event) => setTipoIdentificacion(event.target.value)}
                      className="w-full cursor-pointer appearance-none rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white backdrop-blur-sm transition-all focus:border-cyan-400/50 focus:bg-white/10 focus:outline-none"
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
                      onChange={(event) => setNumeroIdentificacion(event.target.value)}
                      placeholder="Ingrese número de documento"
                      className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/40 backdrop-blur-sm transition-all focus:border-cyan-400/50 focus:bg-white/10 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-white/70">{fieldConfig.label} *</label>
                    <input
                      required
                      type="text"
                      value={apellidoRazonSocial}
                      onChange={(event) => setApellidoRazonSocial(event.target.value)}
                      placeholder={fieldConfig.placeholder}
                      className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/40 backdrop-blur-sm transition-all focus:border-cyan-400/50 focus:bg-white/10 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 pt-1">
                    <label className="group flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={acepta}
                        onChange={(event) => setAcepta(event.target.checked)}
                        className="h-4 w-4 cursor-pointer accent-cyan-500"
                      />
                      <span className="text-xs text-white/80 transition-colors group-hover:text-white">
                        Acepto los{" "}
                        <Terminos
                          inline
                          triggerClassName="font-medium text-cyan-400 underline underline-offset-4 transition-colors hover:text-cyan-300"
                        />
                      </span>
                    </label>
                    <label className="group flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={consentimiento}
                        onChange={(event) => setConsentimiento(event.target.checked)}
                        className="h-4 w-4 cursor-pointer accent-cyan-500"
                      />
                      <span className="text-xs text-white/80 transition-colors group-hover:text-white">
                        Confirmo consentimiento del titular
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      loading ||
                      !tipoIdentificacion ||
                      !numeroIdentificacion.trim() ||
                      !apellidoRazonSocial.trim() ||
                      !acepta ||
                      !consentimiento
                    }
                    className={`mt-2 w-full rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-300 ${
                      loading ||
                      !tipoIdentificacion ||
                      !numeroIdentificacion.trim() ||
                      !apellidoRazonSocial.trim() ||
                      !acepta ||
                      !consentimiento
                        ? "cursor-not-allowed bg-white/10 text-white/40"
                        : "transform bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:scale-105 hover:from-cyan-400 hover:to-blue-400 hover:shadow-lg hover:shadow-cyan-500/50"
                    }`}
                  >
                    Consultar Experian
                  </button>
                </form>

                <p className="mt-6 text-center text-[11px] leading-5 text-white/45">
                  Cumplimiento normativo y uso responsable de la información.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
