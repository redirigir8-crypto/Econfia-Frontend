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

      {/* Home - Tema claro con hero + formulario */}
      <section className="relative min-h-screen flex items-start justify-center pt-0 pb-10">
        <div className="max-w-5xl mx-auto px-4 w-full">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Hero copy (izquierda) */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-black">
                Nuevo diseño
              </span>
              <h1 className="mt-4 text-3xl md:  text-4xl font-bold tracking-tight text-white">
                Consulta inteligente de candidatos con experiencia premium
              </h1>

              <p className="mt-3 text-base leading-relaxed text-white">
                Verifica documentos y obtén resultados de forma segura y veloz.
                Una experiencia clara, minimalista y centrada en la confiabilidad.
              </p>

              <ul className="mt-4 space-y-2 text-white">
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
                  Interfaz ligera y accesible, optimizada para foco y velocidad.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-violet-600" />
                  Resultados consistentes con tu flujo actual, sin cambiar lógica.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-600" />
                  Privacidad respetada y control granular en cada paso.
                </li>
              </ul>
            </div>

            {/* Tarjeta del formulario (derecha) */}
            <div className="relative w-full max-w-xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl shadow-black/50">
                <div className="p-4">
                  <div className="flex items-center justify-center mb-1">
                    <img
                      src="/img/logo-econfia-rojo.png"
                      alt="Econfía"
                      className="max-h-12 w-auto"
                    />
                  </div>

                  {/* Formulario */}
                  <form onSubmit={handleConsultarContratista} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Tipo de documento */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-white">Tipo de documento</label>
                      <select
                        required
                        value={tipoDoc}
                        onChange={(e) => setTipoDoc(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-md bg-white/10 text-sm text-white border border-white/20 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option className="bg-black/90 text-white" value="">
                          Seleccione tipo de documento
                        </option>
                        <option className="bg-black/90 text-white" value="CC">Cédula de Ciudadanía (CC)</option>
                        <option className="bg-black/90 text-white" value="TI">Tarjeta de Identidad (TI)</option>
                        <option className="bg-black/90 text-white" value="CE">Cédula de Extranjería (CE)</option>
                        <option className="bg-black/90 text-white" value="PPT">Permiso de Protección Temporal (PPT)</option>
                        <option className="bg-black/90 text-white" value="PEP">Permiso Especial de Permanencia (PEP)</option>
                        <option className="bg-black/90 text-white" value="NIT">NIT</option>
                      </select>
                    </div>

                    {/* Número */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-white">Número</label>
                      <input
                        required
                        type="text"
                        value={cedula}
                        onChange={(e) => setCedula(e.target.value)}
                        placeholder="Ingrese número"
                        className="w-full px-3 py-1.5 rounded-md bg-white/10 text-white text-sm placeholder-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Fecha expedición (opcional) */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-white">Fecha de expedición (opcional)</label>
                      <input
                        type="date"
                        value={fechaExpedicion}
                        onChange={(e) => setFechaExpedicion(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-md bg-white/10 text-white text-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Profesión */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-white">Profesión</label>
                      <select
                        required
                        value={profesion}
                        onChange={(e) => setProfesion(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-md bg-white/10 text-sm text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option className="bg-black/90 text-white" value="">
                          Seleccione profesión
                        </option>
                        {/* ...existing options, solo cambiando clases a light... */}
                        <option className="bg-black/90 text-white" value="Abogado/a">Abogado/a</option>
                        <option className="bg-black/90 text-white" value="Economista">Economista</option>
                        <option className="bg-black/90 text-white" value="Psicólogo/a">Psicólogo/a</option>
                        <option className="bg-black/90 text-white" value="Bacteriólogo/a">Bacteriólogo/a</option>
                        <option className="bg-black/90 text-white" value="Biólogo/a">Biólogo/a</option>
                        <option className="bg-black/90 text-white" value="Químico/a">Químico/a</option>
                        <option className="bg-black/90 text-white" value="Ingeniero/a Químico/a">Ingeniero/a Químico/a</option>
                        <option className="bg-black/90 text-white" value="Ingeniero/a de Petróleos">Ingeniero/a de Petróleos</option>
                        <option className="bg-black/90 text-white" value="Topógrafo/a">Topógrafo/a</option>
                        <option className="bg-black/90 text-white" value="Arquitecto/a">Arquitecto/a</option>
                        <option className="bg-black/90 text-white" value="Tecnólogo/a en Electricidad/Electrónica/Electromecánica">Tecnólogo/a en Electricidad/Electrónica/Electromecánica</option>
                        <option className="bg-black/90 text-white" value="Técnico/a Electricista">Técnico/a Electricista</option>
                        <option className="bg-black/90 text-white" value="Ingeniero/a Eléctrico/Mecánico/Electrónico/Telecom/Metalúrgico/Aeronáutico/Nuclear/Electromecánico">Ingeniero/a Eléctrico/Mecánico/Electrónico/Telecom/Metalúrgico/Aeronáutico/Nuclear/Electromecánico</option>
                        <option className="bg-black/90 text-white" value="Ingeniero/a">Ingeniero/a</option>
                        <option className="bg-black/90 text-white" value="Administrador/a de Empresas/Negocios">Administrador/a de Empresas/Negocios</option>
                        <option className="bg-black/90 text-white" value="Administrador/a Ambiental">Administrador/a Ambiental</option>
                        <option className="bg-black/90 text-white" value="Contador/a">Contador/a</option>
                      </select>
                    </div>

                    {/* Correo */}
                    <div className="md:col-span-2 flex flex-col gap-2">
                      <label className="text-xs font-medium text-white">Correo electrónico</label>
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ejemplo@correo.com"
                        pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                        className={`w-full px-3 py-1.5 rounded-md bg-white/10 text-white text-sm placeholder-white/50 border
                          ${email && !isValidEmail(email) ? "border-red-400 focus:ring-2 focus:ring-red-400" : "border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"}`}
                      />
                      {email && !isValidEmail(email) && (
                        <span className="text-xs text-red-600">Formato de correo no válido</span>
                      )}
                    </div>

                    {/* Checkboxes */}
                    <div className="md:col-span-2 flex flex-col gap-2 mt-2 text-sm">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={acepta}
                          onChange={(e) => setAcepta(e.target.checked)}
                          className="accent-blue-600 w-4 h-4"
                        />
                        <span className="text-white">
                          Acepto los{" "}
                          <a href="#" onClick={(e)=>{e.preventDefault();}} className="text-blue-400 underline">
                            términos y condiciones
                          </a>
                        </span>
                      </div>

                      <Terminos isOpen={false} onClose={()=>{}} />

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={consentimiento}
                          onChange={(e) => setConsentimiento(e.target.checked)}
                          className="accent-emerald-600 w-4 h-4"
                        />
                        <span className="text-white">
                          Confirmo que cuento con el consentimiento del titular del documento
                        </span>
                      </div>
                    </div>

                    {/* Botón */}
                    <div className="md:col-span-2">
                      <button
                        type="submit"
                        disabled={!canSubmit}
                        className={`mt-2 w-full px-4 py-2 rounded-xl font-medium text-sm transition-all
                          ${!canSubmit
                            ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md active:scale-[0.98]"
                          }`}
                      >
                        Consultar contratista
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              {/* Nota de privacidad pequeña */}
              <p className="text-[10px] text-white/70 text-center mt-2">
                Al continuar, certificas contar con autorización válida del titular y cumplir la normatividad vigente.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
