import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import CardDni from "../components/CardDni";
import Terminos from "../components/Terminos";
import ConsultaMasivaModal from "../components/ConsultaMasivaModal";


function ModalConsultaMedida({ isOpen, onClose, data, onSuccess }) {
  const [fuentes, setFuentes] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(""); // filtro de texto
  const [toast, setToast] = useState(null); // NUEVO: para mostrar errores
  const [panelMin, setPanelMin] = useState(false); // panel de seleccionadas minimizado
  const API_URL = process.env.REACT_APP_API_URL;

  // Nombre amigable de una fuente a partir de su "nombre" técnico
  const nombreToDisplay = (nombre) => {
    const f = fuentes.find((x) => x.nombre === nombre);
    return f?.nombre_pila || f?.nombre || nombre;
  };

  // Cargar fuentes al abrir modal
  useEffect(() => {
    if (!isOpen) return;

    const fetchFuentes = async () => {
      try {
        const token = localStorage.getItem("token"); // Obtener token
        const res = await fetch(`${API_URL}/api/fuentes/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`, // Cabecera de autorización
          },
        });
        const json = await res.json();
        setFuentes(Array.isArray(json) ? json : []); // seguridad
      } catch (err) {
        console.error("Error cargando fuentes:", err);
        setFuentes([]);
      }
    };

    fetchFuentes();
  }, [isOpen, API_URL]);

  const FUENTES_EDUCATIVAS = new Set([
    "biologia_consulta", "biologia_validacion_certificados",
    "colpsic_validar_documento", "colpsic_verificacion_tarjetas",
    "cnb_carnet_afiliacion", "cnb_consulta_matriculados",
    "conalpe_certificado", "conalpe_consulta_inscritos",
    "conaltel_consulta_matriculados",
    "conpucol_certificados", "conpucol_verificacion_colegiados",
    "conte_consulta_matricula", "conte_consulta_vigencia",
    "copnia_certificado",
    "cp_certificado_busqueda", "cp_validar_certificado", "cp_validar_matricula",
    "cpaa_generar_certificado",
    "cpae_certificado", "cpae_verify_certification", "cpae_verify_licensure",
    "cpip_verif_matricula",
    "cpiq_certificado_vigencia", "cpiq_validacion_certificado_vigencia",
    "cpiq_validacion_matricula", "cpiq_validacion_tarjeta",
    "cpnaa_certificado_vigencia", "cpnaa_matricula_arquitecto",
    "cpnt_consulta_licencia", "cpnt_vigencia_externa_form", "cpnt_vigenciapdf",
    "cpqcol_antecedentes", "cpqcol_verificar",
    "cndj_antecedentes_disciplinarios",
    "rama_abogado_certificado",
    "rethus", "rethus_identificacion",
    "pruebas_icfes",
    "tnem_certificados",
    "sideap_comprobante",
    "mintransporte_capacitaciones",
    "colelectro_directorio",
    "cpae_certificado", "cpnaa_certificado_vigencia",
  ]);

  // Filtrado local por nombre / nombre_pila (excluyendo colegios/universidades)
  const filteredFuentes = fuentes.filter((f) => {
    if (FUENTES_EDUCATIVAS.has(f?.nombre)) return false;
    const texto = `${f?.nombre ?? ""} ${f?.nombre_pila ?? ""}`.toLowerCase();
    return texto.includes(query.toLowerCase());
  });

  const handleCheckbox = (nombre) => {
    setSeleccionadas((prev) => {
      if (prev.includes(nombre)) {
        return prev.filter((n) => n !== nombre);
      }
      return [...prev, nombre];
    });
  };

  const handleConsultar = async () => {
    if (!data) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token"); // Obtener token
      const bodyPayload = {
        cedula: data.cedula,
        tipo_doc: data.tipo_doc,
        tipo_consulta: "essencial",
        lista_nombres: seleccionadas,
      };
      if (data.fecha_expedicion) {
        bodyPayload.fecha_expedicion = data.fecha_expedicion;
      }
      const res = await fetch(`${API_URL}/api/consultar/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(bodyPayload),
      });
      const result = await res.json();
      if (!res.ok) {
        setToast({
          type: "error",
          message: result.error || `Error HTTP: ${res.status}`,
        });
        return;
      }
      // Notifica al padre para mostrar resultados y redirigir
      if (onSuccess) onSuccess(result.datos || result);
      onClose();
    } catch (err) {
      console.error("Error consultando:", err);
      setToast({ type: "error", message: "Ocurrió un error en la consulta" });
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar/deseleccionar todas las fuentes (máximo 45)
  const allSelected = filteredFuentes.length > 0 && filteredFuentes.every(f => seleccionadas.includes(f.nombre));
  const handleToggleAll = () => {
    if (allSelected) {
      setSeleccionadas([]);
    } else {
      setSeleccionadas(filteredFuentes.map(f => f.nombre));
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
          sound="/sounds/error-011-352286.mp3"
        />
      )}
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative bg-gradient-to-br from-slate-900/90 via-blue-900/30 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[20px] shadow-2xl shadow-cyan-500/20 max-w-3xl w-full p-6 text-white">
          {/* Glow effect */}
          <div className="absolute inset-0 opacity-50 rounded-[20px] bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none" />

          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white/60 hover:text-red-400 text-xl font-bold transition-colors z-10"
            aria-label="Cerrar"
          >
            ✕
          </button>

          <div className="relative z-10">
            <div className="text-center mb-4">
              <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 mb-2">
                <span className="text-cyan-300 text-xs font-medium">Personaliza tu consulta</span>
              </div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-white via-cyan-100 to-blue-300 bg-clip-text text-transparent">
                Consulta a la Medida
              </h2>
            </div>

            {/* Filtro */}
            <div className="mb-3 flex flex-col md:flex-row md:items-center md:gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrar fuentes por nombre..."
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 focus:shadow-lg focus:shadow-cyan-500/10 transition-all backdrop-blur-sm"
              />
              <button
                type="button"
                onClick={handleToggleAll}
                className={`mt-2 md:mt-0 md:ml-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 border border-cyan-400/40 ${
                  allSelected
                    ? "bg-cyan-500/80 text-white hover:bg-cyan-400"
                    : "bg-white/10 text-cyan-300 hover:bg-cyan-500/20"
                }`}
              >
                {allSelected ? "Deseleccionar todas" : "Seleccionar todas"}
              </button>
            </div>

            {/* Panel colapsable de fuentes seleccionadas */}
            <div className="mb-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
              <button
                type="button"
                onClick={() => setPanelMin((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-2 text-left"
              >
                <span className="text-cyan-300 font-semibold text-sm flex items-center gap-2">
                  <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-cyan-500/30 text-cyan-100 text-xs font-bold">
                    {seleccionadas.length}
                  </span>
                  Fuentes seleccionadas
                </span>
                <span className="flex items-center gap-3">
                  {seleccionadas.length > 0 && (
                    <span
                      role="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSeleccionadas([]);
                      }}
                      className="text-[11px] text-white/50 hover:text-red-300 transition-colors"
                    >
                      Limpiar
                    </span>
                  )}
                  <svg
                    className={`w-4 h-4 text-cyan-300 transition-transform duration-300 ${panelMin ? "" : "rotate-180"}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </button>

              {!panelMin && (
                <div className="px-3 pb-3">
                  {seleccionadas.length === 0 ? (
                    <p className="text-xs text-white/40">Aún no has seleccionado fuentes.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto custom-scrollbar">
                      {seleccionadas.map((nombre) => (
                        <span
                          key={nombre}
                          className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-full bg-gradient-to-r from-cyan-500/25 to-blue-500/25 border border-cyan-400/30 text-cyan-100 text-[11px] font-semibold"
                        >
                          <span className="truncate max-w-[220px]">{nombreToDisplay(nombre)}</span>
                          <button
                            type="button"
                            onClick={() => handleCheckbox(nombre)}
                            className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-red-500/50 text-cyan-200 hover:text-white transition-colors text-[10px]"
                            aria-label={`Quitar ${nombreToDisplay(nombre)}`}
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Lista de fuentes */}
            <div className="max-h-72 overflow-y-auto space-y-2 mb-4 pr-2 custom-scrollbar">
              {filteredFuentes.length > 0 ? (
                filteredFuentes.map((fuente) => {
                  const isDisabled = false;
                  return (
                  <label
                    key={fuente.id}
                    className={`flex items-center gap-3 bg-white/5 hover:bg-white/10 p-3 rounded-lg border border-white/10 transition-all hover:shadow-md hover:shadow-cyan-500/10 group ${
                      isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className={`accent-cyan-500 w-4 h-4 ${
                        isDisabled ? "cursor-not-allowed" : "cursor-pointer"
                      }`}
                      checked={seleccionadas.includes(fuente.nombre)}
                      onChange={() => handleCheckbox(fuente.nombre)}
                      disabled={isDisabled}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium text-white group-hover:text-cyan-300 transition-colors">{fuente.nombre_pila || fuente.nombre}</span>
                    </div>
                  </label>
                  );
                })
              ) : (
                <p className="text-white/60 text-center py-4">
                  {fuentes.length === 0
                    ? "No hay fuentes disponibles."
                    : "No hay coincidencias con el filtro."}
                </p>
              )}
            </div>

            {/* Botón consultar */}
            <button
              onClick={handleConsultar}
              disabled={loading || seleccionadas.length === 0}
              className={`w-full px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                loading || seleccionadas.length === 0
                  ? "bg-white/10 text-white/40 cursor-not-allowed"
                  : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 hover:shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105"
              }`}
            >
              {loading ? "Consultando..." : "Consultar"}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

/* ===============
   Página: Consulta
   =============== */
export default function ConsultaMedida() {
  const [puedeUsarMasivas, setPuedeUsarMasivas] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    const API = process.env.REACT_APP_API_URL;
    fetch(`${API}/api/profile/`, { headers: { Authorization: `Token ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        const ids = data.perfil?.planes_masivas_ids || [];
        const planes = data.perfil?.planes || [];
        const planActual = planes.find((p) => p.nombre === "essential");
        setPuedeUsarMasivas(planActual ? ids.includes(planActual.id) : false);
      })
      .catch(() => {});
  }, []);
  const [tipoDoc, setTipoDoc] = useState("");
  const [cedula, setCedula] = useState("");
  const [fechaExpedicion, setFechaExpedicion] = useState("");
  const [acepta, setAcepta] = useState(false);
  const [consentimiento, setConsentimiento] = useState(false);
  const [loading, setLoading] = useState(false);
  const [datos, setDatos] = useState(null);
  const [toast, setToast] = useState(null);
  const [showResultados, setShowResultados] = useState(false);
  const [showHorarioAviso, setShowHorarioAviso] = useState(false);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;
  const [showConsultaMedida, setShowConsultaMedida] = useState(false);
  const [showMasiva, setShowMasiva] = useState(false);
  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 11 && hour < 22) {
      setShowHorarioAviso(true);

      const timeout = setTimeout(() => setShowHorarioAviso(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación manual de campos requeridos
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
      tipo_consulta: "essential",
    };

    if (fechaExpedicion) {
      bodyData.fecha_expedicion = fechaExpedicion;
    }

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
      console.log("Respuesta API:", data);

      if (!res.ok) {
        setToast({
          type: "error",
          message: data.error || `Error HTTP: ${res.status}`,
        });
        return;
      }

      setDatos(data.datos || data);
      setShowResultados(true);
      setTimeout(() => navigate("/d3b7f1e9"), 10000);
    } catch (error) {
      console.error("Error en la consulta:", error);
      setToast({ type: "error", message: "Ocurrió un error en la consulta" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Modal de carga */}
      {loading &&
        createPortal(
          <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
            {/* Video de fondo */}
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            >
              <source src="/videos/load.mp4" type="video/mp4" />
              Tu navegador no soporta videos.
            </video>

            {/* Música */}
            <audio autoPlay loop>
              <source src="/sounds/suspend-sound-113941.mp3" type="audio/mp3" />
              Tu navegador no soporta audio.
            </audio>

            {/* Contenido del modal */}
            <div className="relative bg-white/10 border border-white/30 rounded-2xl p-10 shadow-2xl text-center max-w-md w-full mx-4 backdrop-blur-md">
              {/* Icono cargando */}
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-cyan-400 mx-auto mb-6"></div>

              {/* Texto animado */}
              <p className="text-white text-lg font-semibold animate-pulse">
                Cargando datos del candidato para la consulta...
              </p>
            </div>
          </div>,
          document.body
        )}

      {/* Modal de resultados */}
      {!loading &&
        showResultados &&
        datos &&
        createPortal(
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
            <div className="p-8 shadow-2xl max-w-2xl w-full mx-4 text-center">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Consulta enviada
              </h2>
              <p className="text-white/80 mb-6">
                La consulta ha sido enviada a procesamiento y en unos segundos
                estará lista.
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
          sound="/sounds/error-011-352286.mp3"
        />
      )}

      {/* Formulario con fondo elegante */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-32 md:pb-36 overflow-hidden bg-transparent">
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Logo — esquina superior izquierda */}
        <div className="hidden md:flex absolute md:top-6 md:left-6 z-20 items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-red-500/30 blur-xl scale-125 group-hover:bg-red-500/50 transition-all duration-500" />
            <div className="relative w-14 h-14 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center shadow-[0_0_24px_rgba(220,38,38,0.3)] group-hover:shadow-[0_0_36px_rgba(220,38,38,0.5)] transition-all duration-500 group-hover:scale-105">
              <img src="/img/logo-econfia-1.png" alt="Econfía" className="w-9 h-9 object-contain drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
            </div>
          </div>
          <div>
            <p className="text-transparent bg-clip-text font-black text-base tracking-[0.3em] uppercase" style={{backgroundImage:"linear-gradient(to right, #ffffff, #bae6fd, #38bdf8, #0ea5e9)", filter:"drop-shadow(0 0 8px rgba(56,189,248,0.9)) drop-shadow(0 0 18px rgba(56,189,248,0.5))"}}>Econfia</p>
            <p className="text-white/40 text-[9px] tracking-[0.2em] uppercase font-light mt-0.5">Una marca de Grupo Soluciones</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center max-w-5xl w-full px-4 relative z-10">
          <div className="text-center md:text-left space-y-5">
            <div>
              <div className="inline-flex px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 mb-3 items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span className="text-cyan-300 text-xs font-medium">Consulta Personalizada</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-cyan-100 to-blue-300 bg-clip-text text-transparent leading-tight tracking-tight">
                Econfia Essential
              </h1>
            </div>

            <p className="text-sm text-white/70 leading-relaxed">
              Seleccione el tipo de documento e ingrese el número. Luego elija las fuentes específicas que desea consultar.
            </p>

            <div className="space-y-2 pt-2">
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-cyan-500 flex-shrink-0" />
                <span className="text-xs text-white/80">Personaliza completamente tu búsqueda.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                <span className="text-xs text-white/80">Selecciona solo las fuentes que necesitas.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-purple-500 flex-shrink-0" />
                <span className="text-xs text-white/80">Resultados precisos y eficientes.</span>
              </div>
            </div>

            <p className="text-[10px] text-red-400/70 leading-snug pt-2">
              Al realizar esta consulta, declara y certifica que cuenta con la autorización válida y expresa del titular del documento objeto de verificación.
            </p>
          </div>

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

                <form onSubmit={handleSubmit} className="space-y-2">
                {/* Inputs */}
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


                {/* Botón: Consulta a la Medida */}
                {/** Botón: Consulta a la Medida (solo habilitado si todos los campos requeridos están completos) */}
                <button
                  type="button"
                  onClick={() => {
                    setDatos({
                      tipo_doc: tipoDoc,
                      cedula,
                      fecha_expedicion: fechaExpedicion || null,
                    });
                    setShowConsultaMedida(true);
                  }}
                  disabled={
                    !tipoDoc || !cedula || !acepta || !consentimiento
                  }
                  className={`mt-3 w-full px-4 py-2 rounded-lg font-semibold text-xs transition-all duration-300
                    ${
                      !tipoDoc || !cedula || !acepta || !consentimiento
                        ? "bg-white/10 text-white/40 cursor-not-allowed"
                        : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 hover:shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105"
                    }`}
                >
                  Consulta a la medida
                </button>

                {/* Botón consulta masiva — solo si el admin lo habilitó */}
                {puedeUsarMasivas && (
                  <button
                    type="button"
                    onClick={() => setShowMasiva(true)}
                    className="mt-1.5 w-full px-4 py-2 rounded-lg font-semibold text-xs border border-purple-500/40 text-purple-300 hover:bg-purple-500/15 hover:border-purple-400/60 transition-all duration-300"
                  >
                    Consulta Masiva (hasta 50 documentos)
                  </button>
                )}
                </form>
              </div>
            </div>
            {/* Nota de privacidad */}
            <p className="text-[10px] text-white/60 text-center mt-2">
              Cumplimiento normativo y uso responsable de la información.
            </p>
          </div>
        </div>
      </section>

      {/* Modal: Consulta a la Medida */}
      <ModalConsultaMedida
        isOpen={showConsultaMedida}
        onClose={() => setShowConsultaMedida(false)}
        data={datos}
        onSuccess={(datosConsulta) => {
          setDatos(datosConsulta);
          setShowResultados(true);
          setTimeout(() => navigate("/d3b7f1e9"), 2000);
        }}
      />

      {/* Modal: Consulta Masiva */}
      <ConsultaMasivaModal
        isOpen={showMasiva}
        onClose={() => setShowMasiva(false)}
        tipoConsulta="essencial"
      />
    </>
  );
}
