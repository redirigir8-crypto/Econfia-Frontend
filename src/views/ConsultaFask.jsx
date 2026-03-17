import { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import CardDni from "../components/CardDni";
import Terminos from "../components/Terminos";
import { FaCogs } from "react-icons/fa";

export default function ConsultaBasicElemnt() {
  const [tipoDoc, setTipoDoc] = useState("");
  const [cedula, setCedula] = useState("");
  const [fechaExpedicion, setFechaExpedicion] = useState("");
  const [acepta, setAcepta] = useState(false);
  const [consentimiento, setConsentimiento] = useState(false);
  const [loading, setLoading] = useState(false);
  const [datos, setDatos] = useState(null);
  const [toast, setToast] = useState(null);
  const [showResultados, setShowResultados] = useState(false);
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
      tipo_consulta: "basic-elemnt",
    };
    if (fechaExpedicion) {
      bodyData.fecha_expedicion = fechaExpedicion;
    }
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
        setToast({
          type: "error",
          message: data.error || `Error HTTP: ${res.status}`,
        });
        return;
      }
      setDatos(data.datos || data);
      setShowResultados(true);
      setTimeout(() => {
        navigate("/d3b7f1e9");
      }, 2000);
    } catch (error) {
      setToast({ type: "error", message: "Ocurrió un error en la consulta" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative h-screen flex items-center justify-center py-4 md:py-6 pb-20 md:pb-24 overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950">
      {/* Icono y título */}
      <div className="absolute top-10 left-10 flex items-center gap-3 z-20">
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center max-w-5xl w-full px-4 relative z-10">
        <div className="text-center md:text-left space-y-3">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 mb-3 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="text-cyan-300 text-xs font-medium">Consulta Especial</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-cyan-100 to-blue-300 bg-clip-text text-transparent leading-tight tracking-tight">
              Econfia Fast
            </h1>
          </div>
          <p className="text-sm text-white/70 leading-relaxed">
            Realice consultas rapidas con nuestra integración Econfia Fast, diseñada para ofrecer resultados inmediatos y precisos. Ideal para validaciones rápidas y verificaciones instantáneas, esta consulta es perfecta para situaciones donde el tiempo es esencial. Con Econfia Fast, obtenga la información que necesita al instante, sin comprometer la calidad ni la seguridad de los datos.
          </p>
        </div>
        <div className="relative w-full max-w-sm mx-auto">
          <div className="relative w-full bg-gradient-to-br from-slate-900/80 via-blue-900/20 to-slate-900/80 backdrop-blur-xl rounded-[20px] border border-white/10 shadow-2xl shadow-cyan-500/10 p-6 group">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[20px] bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-4">
                <img src="/img/logo-econfia-rojo.png" alt="Econfía" className="max-h-10 w-auto" />
              </div>  
              <form onSubmit={handleSubmit} className="space-y-2">
                <div className="space-y-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-white/70">Tipo de documento *</label>
                    <select
                      required
                      value={tipoDoc}
                      onChange={(e) => setTipoDoc(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 focus:shadow-lg focus:shadow-cyan-500/10 transition-all backdrop-blur-sm appearance-none cursor-pointer"
                    >
                      <option className="bg-slate-900 text-white" value="">
                        Seleccione tipo de documento
                      </option>
                      <option className="bg-slate-900 text-white" value="CC">
                        Cédula de Ciudadanía (CC)
                      </option>
                      <option className="bg-slate-900 text-white" value="TI">
                        Tarjeta de Identidad (TI)
                      </option>
                      <option className="bg-slate-900 text-white" value="CE">
                        Cédula de Extranjería (CE)
                      </option>
                      <option className="bg-slate-900 text-white" value="PPT">
                        Permiso de Protección Temporal (PPT)
                      </option>
                      <option className="bg-slate-900 text-white" value="PEP">
                        Permiso Especial de Permanencia (PEP)
                      </option>
                      <option className="bg-slate-900 text-white" value="NIT">
                        NIT
                      </option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-white/70">Número de documento *</label>
                    <input
                      required
                      type="text"
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value)}
                      placeholder="Ingrese número de documento"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-white/40 text-xs focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 focus:shadow-lg focus:shadow-cyan-500/10 transition-all backdrop-blur-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-white/70">Fecha de expedición (Opcional)</label>
                    <input
                      type="date"
                      value={fechaExpedicion}
                      onChange={(e) => setFechaExpedicion(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 focus:shadow-lg focus:shadow-cyan-500/10 transition-all backdrop-blur-sm"
                    />
                  </div>
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
                      Acepto los <a href="#" className="text-cyan-400 hover:text-cyan-300 underline font-medium">términos y condiciones</a>
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={consentimiento}
                      onChange={(e) => setConsentimiento(e.target.checked)}
                      className="accent-cyan-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs text-white/80 group-hover:text-white/100 transition-colors">
                      Confirmo consentimiento del titular
                    </span>
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={!tipoDoc || !cedula || !acepta || !consentimiento || loading}
                  className={`mt-3 w-full px-4 py-2 rounded-lg font-semibold text-xs transition-all duration-300
                    ${!tipoDoc || !cedula || !acepta || !consentimiento || loading
                      ? "bg-white/10 text-white/40 cursor-not-allowed"
                      : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 hover:shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105"
                    }`}
                >
                  {loading ? "Consultando..." : "Consultar EconfiaFast"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
          sound="sounds/error-011-352286.mp3"
        />
      )}
      {/* Modal de resultados */}
      {!loading && showResultados && datos && createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="p-8 shadow-2xl max-w-2xl w-full mx-4 text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">Consulta enviada</h2>
            <p className="text-white/80 mb-6">La consulta ha sido enviada a procesamiento y en unos segundos estará lista.</p>
            <CardDni data={datos} />
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
