import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import CardDni from "../components/CardDni";
import Terminos from "../components/Terminos";

const isValidEmail = (s) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").trim());

export default function ConsultaContratista() {
  const [tipoDoc, setTipoDoc] = useState("");
  const [cedula, setCedula] = useState("");
  const [fechaExpedicion, setFechaExpedicion] = useState("");
  const [profesion, setProfesion] = useState("");
  const [email, setEmail] = useState("");
  const [acepta, setAcepta] = useState(false);
  const [consentimiento, setConsentimiento] = useState(false);

  const [loading, setLoading] = useState(false);
  const [datos, setDatos] = useState(null);
  const [toast, setToast] = useState(null);
  const [showResultados, setShowResultados] = useState(false);
  const [showHorarioAviso, setShowHorarioAviso] = useState(false);

  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    if (hour >= 11 && hour < 22) {
      setShowHorarioAviso(true);
      const timeout = setTimeout(() => setShowHorarioAviso(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, []);

  // ✅ Habilita botón solo si TODO está correcto
  const canSubmit = useMemo(() => {
    return (
      tipoDoc &&
      String(cedula || "").trim().length > 0 &&
      profesion &&
      isValidEmail(email) &&
      acepta &&
      consentimiento
    );
  }, [tipoDoc, cedula, profesion, email, acepta, consentimiento]);

  const handleConsultarContratista = async (e) => {
    e.preventDefault();

    // Validaciones de seguridad (además del disabled)
    if (!tipoDoc) {
      setToast({ type: "error", message: "Selecciona el tipo de documento." });
      return;
    }
    if (!String(cedula || "").trim()) {
      setToast({ type: "error", message: "Ingresa el número de documento." });
      return;
    }
    if (!profesion) {
      setToast({ type: "error", message: "Selecciona la profesión." });
      return;
    }
    if (!isValidEmail(email)) {
      setToast({ type: "error", message: "Ingresa un correo válido." });
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
    setDatos(null);
    setShowResultados(false);

    const bodyData = {
      tipo_doc: tipoDoc,
      cedula: String(cedula).trim(),
      fecha_expedicion: fechaExpedicion || undefined, // opcional
      profesion,                                      // ✅ requerido para activar contratista
      email: String(email).trim().toLowerCase(),      // ✅ requerido para activar contratista
    };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/consultar/`, {
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
        navigate("/resultados");
      }, 2000);
    } catch (error) {
      console.error("Error en la consulta:", error);
      setToast({ type: "error", message: "Ocurrió un error en la consulta" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Loader claro tipo frosted-glass */}
      {loading &&
        createPortal(
          <div className="fixed inset-0 z-50 grid place-items-center bg-white/60 backdrop-blur-md">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center w-full max-w-sm">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 mx-auto mb-4" />
              <p className="text-slate-700 font-medium">Procesando tu consulta…</p>
              <p className="text-slate-500 text-sm mt-1">Esto tomará solo unos segundos</p>
            </div>
          </div>,
          document.body
        )}

      {/* Modal de resultados claro */}
      {!loading &&
        showResultados &&
        datos &&
        createPortal(
          <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/10 backdrop-blur-sm">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-8 w-full max-w-2xl text-center">
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">Consulta enviada</h2>
              <p className="text-slate-600 mb-6">
                Estamos preparando tus resultados. Te redirigiremos automáticamente.
              </p>
              <CardDni data={datos} />
            </div>
          </div>,
          document.body
        )}

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
          sound="sounds/error-011-352286.mp3"
        />
      )}

      {/* Home - Tema oscuro con hero + formulario elegante */}
      <section className="relative h-screen flex items-center justify-center py-4 md:py-6 pb-20 md:pb-24 overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950">
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="max-w-5xl mx-auto px-4 w-full relative z-10">
          <div className="grid md:grid-cols-2 gap-4 items-center">
            {/* Hero copy (izquierda) */}
            <div className="text-center md:text-left space-y-3">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 mb-3 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                  <span className="text-cyan-300 text-xs font-medium">Consulta Premium</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-cyan-100 to-blue-300 bg-clip-text text-transparent leading-tight tracking-tight">
                  Consulta de Contratistas
                </h1>
              </div>

              <p className="text-sm text-white/70 leading-relaxed">
                Verifica experiencia profesional y antecedentes de forma segura y veloz. Una experiencia clara, minimalista y centrada en la confiabilidad.
              </p>

              <div className="space-y-2 pt-2">
                <div className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-cyan-500 flex-shrink-0" />
                  <span className="text-xs text-white/80">Interfaz moderna y accesible, optimizada para velocidad.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <span className="text-xs text-white/80">Resultados consistentes con tu flujo actual.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-purple-500 flex-shrink-0" />
                  <span className="text-xs text-white/80">Privacidad respetada en cada paso.</span>
                </div>
              </div>
            </div>

            {/* Tarjeta del formulario (derecha) */}
            <div className="relative w-full max-w-sm mx-auto">
              <div className="relative w-full bg-gradient-to-br from-slate-900/80 via-blue-900/20 to-slate-900/80 backdrop-blur-xl rounded-[20px] border border-white/10 shadow-2xl shadow-cyan-500/10 p-6 group">
                {/* Glow effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[20px] bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-4">
                    <img
                      src="/img/logo-econfia-rojo.png"
                      alt="Econfía"
                      className="max-h-10 w-auto"
                    />
                  </div>

                  {/* Formulario */}
                  <form onSubmit={handleConsultarContratista} className="space-y-2">
                    {/* Tipo de documento */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-white/70">Tipo de documento</label>
                      <select
                        required
                        value={tipoDoc}
                        onChange={(e) => setTipoDoc(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 focus:shadow-lg focus:shadow-cyan-500/10 transition-all backdrop-blur-sm appearance-none cursor-pointer"
                      >
                        <option className="bg-slate-900 text-white" value="">
                          Seleccione tipo de documento
                        </option>
                        <option className="bg-slate-900 text-white" value="CC">Cédula de Ciudadanía (CC)</option>
                        <option className="bg-slate-900 text-white" value="TI">Tarjeta de Identidad (TI)</option>
                        <option className="bg-slate-900 text-white" value="CE">Cédula de Extranjería (CE)</option>
                        <option className="bg-slate-900 text-white" value="PPT">Permiso de Protección Temporal (PPT)</option>
                        <option className="bg-slate-900 text-white" value="PEP">Permiso Especial de Permanencia (PEP)</option>
                        <option className="bg-slate-900 text-white" value="NIT">NIT</option>
                      </select>
                    </div>

                    {/* Número */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-white/70">Número</label>
                      <input
                        required
                        type="text"
                        value={cedula}
                        onChange={(e) => setCedula(e.target.value)}
                        placeholder="Ingrese número"
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-white/40 text-xs focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 focus:shadow-lg focus:shadow-cyan-500/10 transition-all backdrop-blur-sm"
                      />
                    </div>

                    {/* Fecha expedición (opcional) */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-white/70">Fecha de expedición (Opcional)</label>
                      <input
                        type="date"
                        value={fechaExpedicion}
                        onChange={(e) => setFechaExpedicion(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 focus:shadow-lg focus:shadow-cyan-500/10 transition-all backdrop-blur-sm"
                      />
                    </div>

                    {/* Profesión */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-white/70">Profesión</label>
                      <select
                        required
                        value={profesion}
                        onChange={(e) => setProfesion(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 focus:shadow-lg focus:shadow-cyan-500/10 transition-all backdrop-blur-sm appearance-none cursor-pointer"
                      >
                        <option className="bg-slate-900 text-white" value="">
                          Seleccione profesión
                        </option>
                        <option className="bg-slate-900 text-white" value="Abogado/a">Abogado/a</option>
                        <option className="bg-slate-900 text-white" value="Economista">Economista</option>
                        <option className="bg-slate-900 text-white" value="Psicólogo/a">Psicólogo/a</option>
                        <option className="bg-slate-900 text-white" value="Bacteriólogo/a">Bacteriólogo/a</option>
                        <option className="bg-slate-900 text-white" value="Biólogo/a">Biólogo/a</option>
                        <option className="bg-slate-900 text-white" value="Químico/a">Químico/a</option>
                        <option className="bg-slate-900 text-white" value="Ingeniero/a Químico/a">Ingeniero/a Químico/a</option>
                        <option className="bg-slate-900 text-white" value="Ingeniero/a de Petróleos">Ingeniero/a de Petróleos</option>
                        <option className="bg-slate-900 text-white" value="Topógrafo/a">Topógrafo/a</option>
                        <option className="bg-slate-900 text-white" value="Arquitecto/a">Arquitecto/a</option>
                        <option className="bg-slate-900 text-white" value="Tecnólogo/a en Electricidad/Electrónica/Electromecánica">Tecnólogo/a en Electricidad/Electrónica/Electromecánica</option>
                        <option className="bg-slate-900 text-white" value="Técnico/a Electricista">Técnico/a Electricista</option>
                        <option className="bg-slate-900 text-white" value="Ingeniero/a Eléctrico/Mecánico/Electrónico/Telecom/Metalúrgico/Aeronáutico/Nuclear/Electromecánico">Ingeniero/a Eléctrico/Mecánico/Electrónico/Telecom/Metalúrgico/Aeronáutico/Nuclear/Electromecánico</option>
                        <option className="bg-slate-900 text-white" value="Ingeniero/a">Ingeniero/a</option>
                        <option className="bg-slate-900 text-white" value="Administrador/a de Empresas/Negocios">Administrador/a de Empresas/Negocios</option>
                        <option className="bg-slate-900 text-white" value="Administrador/a Ambiental">Administrador/a Ambiental</option>
                        <option className="bg-slate-900 text-white" value="Contador/a">Contador/a</option>
                      </select>
                    </div>

                    {/* Correo */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-white/70">Correo electrónico</label>
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ejemplo@correo.com"
                        pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                        className={`w-full px-3 py-2 rounded-lg bg-white/5 text-white text-xs placeholder-white/40 border transition-all backdrop-blur-sm focus:outline-none focus:shadow-lg focus:shadow-cyan-500/10
                          ${email && !isValidEmail(email) ? "border-red-400/50 focus:border-red-400 focus:ring-1 focus:ring-red-400/30" : "border-white/15 focus:border-cyan-400/50 focus:bg-white/10"}`}
                      />
                      {email && !isValidEmail(email) && (
                        <span className="text-xs text-red-400">Formato de correo no válido</span>
                      )}
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-1 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={acepta}
                          onChange={(e) => setAcepta(e.target.checked)}
                          className="accent-cyan-500 w-4 h-4 cursor-pointer"
                        />
                        <span className="text-xs text-white/80 group-hover:text-white/100 transition-colors">
                          Acepto los{" "}
                          <a href="#" onClick={(e)=>{e.preventDefault();}} className="text-cyan-400 hover:text-cyan-300 underline font-medium">
                            términos y condiciones
                          </a>
                        </span>
                      </label>

                      <Terminos isOpen={false} onClose={()=>{}} />

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

                    {/* Botón */}
                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className={`mt-3 w-full px-4 py-2 rounded-lg font-semibold text-xs transition-all duration-300
                        ${!canSubmit
                          ? "bg-white/10 text-white/40 cursor-not-allowed"
                          : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 hover:shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105"
                        }`}
                    >
                      Consultar Contratista
                    </button>
                  </form>
                </div>
              </div>
              {/* Nota de privacidad pequeña */}
              <p className="text-[10px] text-white/60 text-center mt-2">
                Al continuar, certificas contar con autorización válida y cumplir la normatividad vigente.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
