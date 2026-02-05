import { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import CardDni from "../components/CardDni";
import Terminos from "../components/Terminos";

export default function ConsultaFask() {
  const [tipoDoc, setTipoDoc] = useState("");
  const [cedula, setCedula] = useState("");
  const [fechaExpedicion, setFechaExpedicion] = useState("");
  const [acepta, setAcepta] = useState(false);
  const [consentimiento, setConsentimiento] = useState(false);
  const [loading, setLoading] = useState(false);
  const [datos, setDatos] = useState(null);
  const [toast, setToast] = useState(null);
  const [showResultados, setShowResultados] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tipoDoc) {
      setToast({ type: "error", message: "Selecciona el tipo de documento." });
      return;
    }
    if (!cedula) {
      setToast({ type: "error", message: "Ingresa el número de documento." });
      return;
    }
    if (!acepta) {
      setToast({ type: "error", message: "Debes aceptar los términos y condiciones." });
      return;
    }
    if (!consentimiento) {
      setToast({ type: "error", message: "Debes confirmar que cuentas con el consentimiento del titular." });
      return;
    }
    setLoading(true);
    setDatos(null);
    setShowResultados(false);
    const bodyData = {
      tipo_doc: tipoDoc,
      cedula,
      fecha_expedicion: fechaExpedicion,
    };
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/econfia_fask/consulta/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(bodyData),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({ type: "error", message: data.error || `Error HTTP: ${res.status}` });
        return;
      }
      setDatos(data);
      setShowResultados(true);
      setTimeout(() => {
        navigate("/resultados");
      }, 2000);
    } catch (error) {
      setToast({ type: "error", message: "Ocurrió un error en la consulta" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading &&
        createPortal(
          <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
            <div className="relative bg-white/10 border border-white/30 rounded-2xl p-10 shadow-2xl text-center max-w-md w-full mx-4 backdrop-blur-md">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-400 mx-auto mb-6"></div>
              <p className="text-white text-lg font-semibold animate-pulse">
                Procesando consulta EconfiaFask...
              </p>
            </div>
          </div>,
          document.body
        )}
      {!loading && showResultados && datos && createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="p-8 shadow-2xl max-w-2xl w-full mx-4 text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">Consulta enviada</h2>
            <p className="text-white/80 mb-6">La consulta EconfiaFask ha sido procesada.</p>
            <CardDni data={datos} />
          </div>
        </div>,
        document.body
      )}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
          sound="sounds/error-011-352286.mp3"
        />
      )}
      <div className="h-screen flex items-center justify-center px-4 py-4 md:py-6 pb-20 md:pb-24 relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950">
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center max-w-5xl w-full relative z-10">
          <div className="text-center md:text-left space-y-3">
            <div>
              <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-cyan-100 to-blue-300 bg-clip-text text-transparent leading-tight tracking-tight">
                Consulta EconfiaFask
              </h1>
              <p className="mt-2 text-sm text-white/70 leading-relaxed">
                Consulta rápida y sin capturas, solo el resumen en PDF.
              </p>
            </div>
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg p-3">
              <p className="text-xs text-white/80 leading-relaxed">
                <span className="text-blue-400 font-semibold">⚡ Declaración:</span> Al realizar esta consulta, certifica que cuenta con la autorización válida del titular.
              </p>
            </div>
          </div>
          <div className="relative w-full max-w-sm mx-auto">
            <div className="relative w-full bg-gradient-to-br from-slate-900/80 via-blue-900/20 to-slate-900/80 backdrop-blur-xl rounded-[20px] border border-white/10 shadow-2xl shadow-cyan-500/10 p-6 group">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[20px] bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none" />
              <div className="relative z-10">
                <form onSubmit={handleSubmit} className="space-y-2">
                  <div>
                    <label className="text-xs font-semibold text-white/70 mb-1 block">Tipo de Documento *</label>
                    <select
                      required
                      value={tipoDoc}
                      onChange={(e) => setTipoDoc(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-white/40 text-xs focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 focus:shadow-lg focus:shadow-cyan-500/10 transition-all backdrop-blur-sm appearance-none cursor-pointer"
                    >
                      <option className="bg-slate-900 text-white" value="">Seleccione tipo de documento</option>
                      <option className="bg-slate-900 text-white" value="CC">Cédula de Ciudadanía (CC)</option>
                      <option className="bg-slate-900 text-white" value="TI">Tarjeta de Identidad (TI)</option>
                      <option className="bg-slate-900 text-white" value="CE">Cédula de Extranjería (CE)</option>
                      <option className="bg-slate-900 text-white" value="PPT">Permiso de Protección Temporal (PPT)</option>
                      <option className="bg-slate-900 text-white" value="PEP">Permiso Especial de Permanencia (PEP)</option>
                      <option className="bg-slate-900 text-white" value="NIT">NIT</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-white/70 mb-1 block">Número de Documento *</label>
                    <input
                      required
                      type="text"
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value)}
                      placeholder="Ej: 1234567890"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-white/40 text-xs focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 focus:shadow-lg focus:shadow-cyan-500/10 transition-all backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-white/70 mb-1 block">Fecha de Expedición (Opcional)</label>
                    <input
                      type="date"
                      value={fechaExpedicion}
                      onChange={(e) => setFechaExpedicion(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 focus:shadow-lg focus:shadow-cyan-500/10 transition-all backdrop-blur-sm"
                    />
                  </div>
                  <div className="space-y-1 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={acepta}
                        onChange={(e) => setAcepta(e.target.checked)}
                        className="accent-cyan-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs text-white/80 group-hover:text-white/100 transition-colors">
                        Acepto los
                        <button
                          type="button"
                          onClick={() => setOpen(true)}
                          className="text-cyan-400 hover:text-cyan-300 underline font-medium"
                        >
                          términos y condiciones
                        </button>
                      </span>
                    </label>
                    <Terminos isOpen={open} onClose={() => setOpen(false)} />
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={consentimiento}
                        onChange={(e) => setConsentimiento(e.target.checked)}
                        className="accent-cyan-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs text-white/80 group-hover:text-white/100 transition-colors">
                        Confirmo tener consentimiento del titular
                      </span>
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={!tipoDoc || !cedula || !acepta || !consentimiento || loading}
                    className={`w-full mt-3 px-6 py-2 rounded-lg font-semibold text-xs transition-all duration-300 ${
                      !tipoDoc || !cedula || !acepta || !consentimiento || loading
                        ? "bg-white/10 text-white/40 cursor-not-allowed"
                        : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 hover:shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105"
                    }`}
                  >
                    {loading ? "Procesando..." : "Consultar EconfiaFask"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
