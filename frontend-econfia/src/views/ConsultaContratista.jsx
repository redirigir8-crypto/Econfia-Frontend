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
      <section className="relative pt-16 pb-10 md:pt-24 md:pb-16 bg-gradient-to-b from-white via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Hero copy (izquierda) */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                Nuevo diseño
              </span>
              <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
                Consulta inteligente de candidatos con experiencia premium
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">
                Verifica documentos y obtén resultados de forma segura y veloz.
                Una experiencia clara, minimalista y centrada en la confiabilidad.
              </p>

              <ul className="mt-6 space-y-2 text-slate-600">
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
            <div className="relative w-full max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
                <div className="p-8">
                  <div className="flex items-center justify-center mb-6">
                    <img
                      src="/img/logo-econfia-rojo.png"
                      alt="Econfía"
                      className="max-h-14 w-auto"
                    />
                  </div>

                  {/* Aviso de horario (si aplica) */}
                  {/* ...existing code (showHorarioAviso state)... */}
                  {/* Renderizamos un aviso claro si está activo */}
                  {/* Nota: solo UI, sin cambiar la lógica existente */}
                  {/* */}
                  {showResultados === false && (
                    <div className="sr-only" />
                  )}
                  {/**/}
                  {/* showHorarioAviso */}
                  {/* */}
                  {/* En lugar de sr-only, mostramos si es true */}
                  {/* */}
                  {/* eslint-disable-next-line */}
                  {showHorarioAviso && (
                    <div className="mb-4 rounded-xl border border-amber-100 bg-amber-50 text-amber-800 px-3 py-2 text-sm">
                      Alta demanda entre 11:00 y 22:00. Los tiempos pueden variar levemente.
                    </div>
                  )}

                  {/* Formulario */}
                  <form onSubmit={handleConsultarContratista} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tipo de documento */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-slate-700">Tipo de documento</label>
                      <select
                        required
                        value={tipoDoc}
                        onChange={(e) => setTipoDoc(e.target.value)}
                        className="w-full px-3 py-2 rounded-md bg-white text-sm text-slate-900 border border-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option className="bg-white text-slate-900" value="">
                          Seleccione tipo de documento
                        </option>
                        <option className="bg-white text-slate-900" value="CC">Cédula de Ciudadanía (CC)</option>
                        <option className="bg-white text-slate-900" value="TI">Tarjeta de Identidad (TI)</option>
                        <option className="bg-white text-slate-900" value="CE">Cédula de Extranjería (CE)</option>
                        <option className="bg-white text-slate-900" value="PPT">Permiso de Protección Temporal (PPT)</option>
                        <option className="bg-white text-slate-900" value="PEP">Permiso Especial de Permanencia (PEP)</option>
                        <option className="bg-white text-slate-900" value="NIT">NIT</option>
                      </select>
                    </div>

                    {/* Número */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-slate-700">Número</label>
                      <input
                        required
                        type="text"
                        value={cedula}
                        onChange={(e) => setCedula(e.target.value)}
                        placeholder="Ingrese número"
                        className="w-full px-3 py-2 rounded-md bg-white text-slate-900 text-sm placeholder-slate-400 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Fecha expedición (opcional) */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-slate-700">Fecha de expedición (opcional)</label>
                      <input
                        type="date"
                        value={fechaExpedicion}
                        onChange={(e) => setFechaExpedicion(e.target.value)}
                        className="w-full px-3 py-2 rounded-md bg-white text-slate-900 text-sm border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Profesión */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-slate-700">Profesión</label>
                      <select
                        required
                        value={profesion}
                        onChange={(e) => setProfesion(e.target.value)}
                        className="w-full px-3 py-2 rounded-md bg-white text-sm text-slate-900 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option className="bg-white text-slate-900" value="">
                          Seleccione profesión
                        </option>
                        {/* ...existing options, solo cambiando clases a light... */}
                        <option className="bg-white text-slate-900" value="Abogado/a">Abogado/a</option>
                        <option className="bg-white text-slate-900" value="Economista">Economista</option>
                        <option className="bg-white text-slate-900" value="Psicólogo/a">Psicólogo/a</option>
                        <option className="bg-white text-slate-900" value="Bacteriólogo/a">Bacteriólogo/a</option>
                        <option className="bg-white text-slate-900" value="Biólogo/a">Biólogo/a</option>
                        <option className="bg-white text-slate-900" value="Químico/a">Químico/a</option>
                        <option className="bg-white text-slate-900" value="Ingeniero/a Químico/a">Ingeniero/a Químico/a</option>
                        <option className="bg-white text-slate-900" value="Ingeniero/a de Petróleos">Ingeniero/a de Petróleos</option>
                        <option className="bg-white text-slate-900" value="Topógrafo/a">Topógrafo/a</option>
                        <option className="bg-white text-slate-900" value="Arquitecto/a">Arquitecto/a</option>
                        <option className="bg-white text-slate-900" value="Tecnólogo/a en Electricidad/Electrónica/Electromecánica">Tecnólogo/a en Electricidad/Electrónica/Electromecánica</option>
                        <option className="bg-white text-slate-900" value="Técnico/a Electricista">Técnico/a Electricista</option>
                        <option className="bg-white text-slate-900" value="Ingeniero/a Eléctrico/Mecánico/Electrónico/Telecom/Metalúrgico/Aeronáutico/Nuclear/Electromecánico">Ingeniero/a Eléctrico/Mecánico/Electrónico/Telecom/Metalúrgico/Aeronáutico/Nuclear/Electromecánico</option>
                        <option className="bg-white text-slate-900" value="Ingeniero/a">Ingeniero/a</option>
                        <option className="bg-white text-slate-900" value="Administrador/a de Empresas/Negocios">Administrador/a de Empresas/Negocios</option>
                        <option className="bg-white text-slate-900" value="Administrador/a Ambiental">Administrador/a Ambiental</option>
                        <option className="bg-white text-slate-900" value="Contador/a">Contador/a</option>
                      </select>
                    </div>

                    {/* Correo */}
                    <div className="md:col-span-2 flex flex-col gap-2">
                      <label className="text-xs font-medium text-slate-700">Correo electrónico</label>
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ejemplo@correo.com"
                        pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                        className={`w-full px-3 py-2 rounded-md bg-white text-slate-900 text-sm placeholder-slate-400 border
                          ${email && !isValidEmail(email) ? "border-red-400 focus:ring-2 focus:ring-red-400" : "border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"}`}
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
                        <span className="text-slate-700">
                          Acepto los{" "}
                          <a href="#" onClick={(e)=>{e.preventDefault();}} className="text-blue-600 underline">
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
                        <span className="text-slate-700">
                          Confirmo que cuento con el consentimiento del titular del documento
                        </span>
                      </div>
                    </div>

                    {/* Botón */}
                    <div className="md:col-span-2">
                      <button
                        type="submit"
                        disabled={!canSubmit}
                        className={`mt-2 w-full px-4 py-3 rounded-xl font-medium text-sm transition-all
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
              <p className="text-[11px] text-slate-500 text-center mt-3">
                Al continuar, certificas contar con autorización válida del titular y cumplir la normatividad vigente.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
