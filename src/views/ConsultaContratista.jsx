
import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import CardDni from "../components/CardDni";
import Terminos from "../components/Terminos";
import ConsultaMasivaModal from "../components/ConsultaMasivaModal";


// Lista de profesiones alineada con backend (PROFESION_BOT_MAP)
const PROFESIONES = [
  "Ingeniero/a",
  "Profesional afin a la ingeniería",
  "Tecnólogo/a en áreas de ingeniería",
  "Técnico profesional en áreas de ingeniería",
  "Abogado/a",
  "Médico/a",
  "Enfermero/a",
  "Odontólogo/a",
  "Psicólogo/a",
  "Bacteriólogo/a",
  "Fisioterapeuta",
  "Terapeuta ocupacional",
  "Instrumentador/a quirúrgico/a",
  "Nutricionista dietista",
  "Fonoaudiólogo/a",
  "Químico/a farmacéutico/a",
  "Optómetra",
  "Terapeuta respiratorio/a",
  "Regente de farmacia",
  "Auxiliar en salud",
  "Arquitecto/a",
  "Profesional auxiliar de arquitectura",
  "Tecnólogo/a en arquitectura",
  "Técnico profesional delineante de arquitectura",
  "Técnico profesional en diseño arquitectónico",
  "Técnico profesional en decoración de interiores",
  "Técnico profesional en dibujo arquitectónico",
  "Contador/a público/a",
  "Administrador/a ambiental",
  "Administrador/a del medio ambiente",
  "Administrador/a ambiental y de los recursos naturales",
  "Administrador/a de empresas",
  "Administrador/a",
  "Administración de empresas",
  "Químico/a",
  "Biólogo/a",
  "Economista",
];

const isValidEmail = (s) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").trim());

export default function ConsultaContratista() {
  const [puedeUsarMasivas, setPuedeUsarMasivas] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    const API = process.env.REACT_APP_API_URL;
    fetch(`${API}/api/profile/`, { headers: { Authorization: `Token ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        const ids = data.perfil?.planes_masivas_ids || [];
        const planes = data.perfil?.planes || [];
        const planActual = planes.find((p) => p.nombre === "contratista");
        setPuedeUsarMasivas(planActual ? ids.includes(planActual.id) : false);
      })
      .catch(() => {});
  }, []);
  const [tipoDoc, setTipoDoc] = useState("");
  const [cedula, setCedula] = useState("");
  const [fechaExpedicion, setFechaExpedicion] = useState("");
  const [profesion, setProfesion] = useState("");
  const [profesionFocus, setProfesionFocus] = useState(false);
  const [profesionInput, setProfesionInput] = useState("");
  const profesionRef = useRef(null);
    // Filtrar profesiones según lo que escribe el usuario
    const profesionesFiltradas = useMemo(() => {
      if (!profesionInput) return PROFESIONES;
      return PROFESIONES.filter((p) =>
        p.toLowerCase().includes(profesionInput.toLowerCase())
      );
    }, [profesionInput]);
  const [email, setEmail] = useState("");
  const [acepta, setAcepta] = useState(false);
  const [consentimiento, setConsentimiento] = useState(false);
  // Estado para el modal de Términos
  const [profesionSugerencias, setProfesionSugerencias] = useState([]);
  const [showSugerencias, setShowSugerencias] = useState(false);
  const [profesionLoading, setProfesionLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [datos, setDatos] = useState(null);
  const [toast, setToast] = useState(null);
  const [showResultados, setShowResultados] = useState(false);
  const [showHorarioAviso, setShowHorarioAviso] = useState(false);
  const [showMasiva, setShowMasiva] = useState(false);

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
    // Autocompletado de profesión
    useEffect(() => {
      if (!profesion || profesion.length < 2) {
        setProfesionSugerencias([]);
        setShowSugerencias(false);
        return;
      }
      setProfesionLoading(true);
      fetch(`${API_URL}/api/autocomplete_profesiones/?q=${encodeURIComponent(profesion)}`)
        .then((res) => res.json())
        .then((data) => {
          setProfesionSugerencias(data.profesiones || []);
          setShowSugerencias((data.profesiones || []).length > 0);
        })
        .catch(() => setProfesionSugerencias([]))
        .finally(() => setProfesionLoading(false));
    }, [profesion, API_URL]);
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
      setToast({ type: "error", message: "Ingresa la profesión." });
      return;
    }
    if (!isValidEmail(email)) {
      setToast({ type: "error", message: "Ingresa un correo válido." });
      return;
    }
    if (!acepta) {
      setToast({
        type: "error",
        message: "Debes aceptar los términos y condiciones.",
      });
      return;
    }
    if (!consentimiento) {
      setToast({
        type: "error",
        message: "Debes confirmar el consentimiento del titular.",
      });
      return;
    }

    setLoading(true);
    setDatos(null);
    setShowResultados(false);

    // Normaliza la profesión para que coincida con el backend
    function normalizarProfesion(prof) {
       if (!prof) return "";
       let p = prof.toLowerCase();
       // Elimina tildes
       p = p.replace(/[áàäâ]/g, "a")
         .replace(/[éèëê]/g, "e")
         .replace(/[íìïî]/g, "i")
         .replace(/[óòöô]/g, "o")
         .replace(/[úùüû]/g, "u");
       // Normaliza todos los casos de /a, /o, /a/o, /o/a al masculino
       // Ejemplo: "enfermero/a" -> "enfermero", "ingeniero/a" -> "ingeniero"
       p = p.replace(/([a-z]+)\/(a|o)(?:\/o|\/a)?\b/g, "$1o");
       // Para casos compuestos: químico/a farmacéutico/a -> quimico farmacéutico
       // Reemplaza todos los "palabra/a" o "palabra/o" por "palabrao" y luego corrige duplicados
       p = p.replace(/([a-z]+)\/a/g, "$1o");
       p = p.replace(/([a-z]+)\/o/g, "$1o");
       // Corrige duplicados tipo "enfermeroo" -> "enfermero"
       p = p.replace(/([a-z]+)oo\b/g, "$1o");
       // Corrige casos como "quimico farmacéutico" (ya normalizado)
       // Elimina conectores ' y ' y dobles espacios
       p = p.replace(/\s+y\s+/g, " ");
       // Elimina caracteres especiales y dobles espacios
       p = p.replace(/[^a-z\s]/g, "").replace(/\s+/g, " ").trim();
       // Log para depuración
       console.log("[NORMALIZAR] Profesión original:", prof, "| Normalizada:", p);
       return p;
    }

    const profesionNormalizada = normalizarProfesion(profesion);
    // Log antes de enviar la consulta
    console.log("[ENVIAR] Profesión normalizada enviada:", profesionNormalizada);
    const bodyData = {
      tipo_doc: tipoDoc,
      cedula: String(cedula).trim(),
      fecha_expedicion: fechaExpedicion || undefined, // opcional
      profesion: [profesionNormalizada], // ✅ requerido para activar contratista (array)
      email: String(email).trim().toLowerCase(), // ✅ requerido para activar contratista
      tipo_consulta: "contratista",
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
      setTimeout(() => navigate("/d3b7f1e9"), 6500);
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
              <p className="text-slate-700 font-medium">
                Procesando tu consulta…
              </p>
              <p className="text-slate-500 text-sm mt-1">
                Esto tomará solo unos segundos
              </p>
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
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                Consulta enviada
              </h2>
              <p className="text-slate-600 mb-6">
                Estamos preparando tus resultados. Te redirigiremos
                automáticamente.
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
        <div
          className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />

        {/* Logo hero circular grande — esquina superior izquierda */}
        <div className="hidden md:block absolute md:top-6 md:left-6 z-20">
          <div className="relative">
            <div className="absolute -inset-2 md:-inset-4 rounded-full bg-gradient-to-br from-cyan-500/25 via-blue-600/15 to-transparent animate-pulse blur-2xl" />
            <div className="absolute -inset-1 md:-inset-2 rounded-full border border-cyan-400/15" />
            <div className="absolute -inset-2 md:-inset-4 rounded-full border border-cyan-300/8" />
            <div className="relative flex items-center justify-center w-20 h-20 sm:w-28 sm:h-28 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-slate-800 via-slate-850 to-slate-950 border border-white/10 shadow-[0_0_60px_rgba(6,182,212,0.2)]">
              <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/[0.02] to-white/[0.06]" />
              <img src="/1-e9a7e544.ico" alt="Econfía" className="w-14 sm:w-20 md:w-20 h-auto relative z-10 drop-shadow-[0_0_20px_rgba(239,68,68,0.7)]" />
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 w-full relative z-10">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            {/* Hero copy (izquierda) */}
            <div className="text-center md:text-left space-y-5">
              <div>
                <div className="inline-flex px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 mb-3 items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                  <span className="text-cyan-300 text-xs font-medium">
                    Consulta Contratista
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-cyan-100 to-blue-300 bg-clip-text text-transparent leading-tight tracking-tight">
                  Econfia Contratista
                </h1>
              </div>

              <p className="text-sm text-white/70 leading-relaxed">
                Verifica experiencia profesional y antecedentes de forma segura y
                veloz. Una experiencia clara, minimalista y centrada en la
                confiabilidad.
              </p>

              <div className="space-y-2 pt-2">
                <div className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-cyan-500 flex-shrink-0" />
                  <span className="text-xs text-white/80">
                    Interfaz moderna y accesible, optimizada para velocidad.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <span className="text-xs text-white/80">
                    Resultados consistentes con tu flujo actual.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-purple-500 flex-shrink-0" />
                  <span className="text-xs text-white/80">
                    Privacidad respetada en cada paso.
                  </span>
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
                  <form
                    onSubmit={handleConsultarContratista}
                    className="space-y-2"
                  >
                    {/* Tipo de documento */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-white/70">
                        Tipo de documento *
                      </label>
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

                    {/* Número */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-white/70">
                        Número de documento *
                      </label>
                      <input
                        required
                        type="text"
                        value={cedula}
                        onChange={(e) => setCedula(e.target.value)}
                        placeholder="Ingrese número de documento"
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-white/40 text-xs focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 focus:shadow-lg focus:shadow-cyan-500/10 transition-all backdrop-blur-sm"
                      />
                    </div>

                    {/* Fecha expedición (opcional) */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-white/70">
                        Fecha de expedición (Opcional)
                      </label>
                      <input
                        type="date"
                        value={fechaExpedicion}
                        onChange={(e) => setFechaExpedicion(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 focus:shadow-lg focus:shadow-cyan-500/10 transition-all backdrop-blur-sm"
                      />
                    </div>

                    {/* Profesión */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-white/70">
                        Profesión *
                      </label>
                      <input
                        required
                        type="text"
                        value={profesion}
                        onChange={(e) => {
                          setProfesion(e.target.value);
                          setShowSugerencias(profesionSugerencias.length > 0);
                        }}
                        placeholder="Escribe tu profesión"
                        autoComplete="off"
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-white/40 text-xs focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 focus:shadow-lg focus:shadow-cyan-500/10 transition-all backdrop-blur-sm"
                        onFocus={() => setShowSugerencias(profesionSugerencias.length > 0)}
                        onBlur={() => setTimeout(() => setShowSugerencias(false), 150)}
                      />
                      {showSugerencias && (
                        <div style={{ position: "relative" }}>
                          <ul
                            style={{
                              position: "absolute",
                              top: "100%",
                              left: 0,
                              width: "100%",
                              marginTop: "4px",
                              zIndex: 30,
                            }}
                            className="bg-slate-900 border border-cyan-500/20 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                          >
                            {profesionLoading && (
                              <li className="px-3 py-2 text-xs text-white/60">Cargando…</li>
                            )}
                            {profesionSugerencias.map((sug) => (
                              <li
                                key={sug.nombre}
                                className="px-3 py-2 text-xs text-white hover:bg-cyan-500/20 cursor-pointer"
                                onMouseDown={() => {
                                  setProfesion(sug.nombre);
                                  setShowSugerencias(false);
                                }}
                              >
                                {sug.nombre} {sug.entidad_reguladora && `(${sug.entidad_reguladora})`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Correo */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-white/70">
                        Correo electrónico *
                      </label>
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ejemplo@correo.com"
                        pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                        className={`w-full px-3 py-2 rounded-lg bg-white/5 text-white text-xs placeholder-white/40 border transition-all backdrop-blur-sm focus:outline-none focus:shadow-lg focus:shadow-cyan-500/10
                          ${
                            email && !isValidEmail(email)
                              ? "border-red-400/50 focus:border-red-400 focus:ring-1 focus:ring-red-400/30"
                              : "border-white/15 focus:border-cyan-400/50 focus:bg-white/10"
                          }`}
                      />
                      {email && !isValidEmail(email) && (
                        <span className="text-xs text-red-400">
                          Formato de correo no válido
                        </span>
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
                          <Terminos
                            inline
                            triggerClassName="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 font-medium transition-colors"
                          />
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

                    {/* Botón */}
                    <button
                      type="submit"
                      disabled={!canSubmit || loading}
                      className={`w-full mt-3 px-6 py-2 rounded-lg font-semibold text-xs transition-all duration-300
                          ${
                            !canSubmit || loading
                              ? "bg-white/10 text-white/40 cursor-not-allowed"
                              : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 hover:shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105"
                          }
                        `}
                    >
                      {loading ? "Procesando..." : "Consultar Contratista"}
                    </button>

                    {/* Botón consulta masiva — solo si el admin lo habilitó */}
                    {puedeUsarMasivas && (
                      <button
                        type="button"
                        onClick={() => setShowMasiva(true)}
                        className="mt-1.5 w-full px-6 py-2 rounded-lg font-semibold text-xs border border-purple-500/40 text-purple-300 hover:bg-purple-500/15 hover:border-purple-400/60 transition-all duration-300"
                      >
                        Consulta Masiva (hasta 50 documentos)
                      </button>
                    )}
                  </form>
                </div>
              </div>

              {/* Nota de privacidad pequeña */}
              <p className="text-[10px] text-white/60 text-center mt-2">
                Al continuar, certificas contar con autorización válida y cumplir la
                normatividad vigente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modal: Consulta Masiva */}
      <ConsultaMasivaModal
        isOpen={showMasiva}
        onClose={() => setShowMasiva(false)}
        tipoConsulta="ecorefull"
      />
    </>
  );
}