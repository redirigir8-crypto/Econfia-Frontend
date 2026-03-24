import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import CardDni from "../components/CardDni";
import Terminos from "../components/Terminos";

function ModalConsultaMedida({ isOpen, onClose, data }) {
  const [fuentes, setFuentes] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(""); // filtro de texto
  const [toast, setToast] = useState(null); // NUEVO: para mostrar errores
  const API_URL = process.env.REACT_APP_API_URL;

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

  // Filtrado local por nombre / nombre_pila
  const filteredFuentes = fuentes.filter((f) => {
    const texto = `${f?.nombre ?? ""} ${f?.nombre_pila ?? ""}`.toLowerCase();
    return texto.includes(query.toLowerCase());
  });

  const handleCheckbox = (nombre) => {
    setSeleccionadas((prev) =>
      prev.includes(nombre) ? prev.filter((n) => n !== nombre) : [...prev, nombre]
    );
  };

  const handleConsultar = async () => {
    if (!data) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token"); // Obtener token
      const res = await fetch(`${API_URL}/api/consultar/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`, // Cabecera de autorización
        },
        body: JSON.stringify({
          cedula: data.cedula,
          tipo_doc: data.tipo_doc,
          tipo_consulta: "ecorefull",
          lista_nombres: seleccionadas,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setToast({
          type: "error",
          message: result.error || `Error HTTP: ${res.status}`,
        });
        return;
      }
      onClose(); // Cierra el modal o maneja resultados
    } catch (err) {
      console.error("Error consultando:", err);
      setToast({ type: "error", message: "Ocurrió un error en la consulta" });
    } finally {
      setLoading(false);
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
          sound="sounds/error-011-352286.mp3"
        />
      )}
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
        <div className="bg-gradient-to-br from-slate-900/95 to-blue-900/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl shadow-cyan-500/20 max-w-2xl w-full p-6 relative">
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-cyan-400 text-2xl font-bold transition-colors"
            aria-label="Cerrar"
          >
            ✕
          </button>

          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent mb-4 text-center">
            Consulta a la Medida
          </h2>

          {/* Filtro */}
          <div className="mb-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar fuente..."
              className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 focus:shadow-lg focus:shadow-cyan-500/10 transition-all backdrop-blur-sm"
            />
            <p className="text-xs text-white/60 mt-1">
              {filteredFuentes.length} fuente{filteredFuentes.length === 1 ? "" : "s"} encontrada{filteredFuentes.length === 1 ? "" : "s"}
            </p>
          </div>

          {/* Lista de fuentes */}
          <div className="max-h-64 overflow-y-auto space-y-2 mb-4 pr-2">
            {filteredFuentes.length > 0 ? (
              filteredFuentes.map((fuente) => (
                <label
                  key={fuente.id}
                  className="flex items-center gap-3 bg-white/5 hover:bg-white/10 p-3 rounded-lg border border-white/10 hover:border-cyan-500/30 cursor-pointer transition-all"
                >
                  <input
                    type="checkbox"
                    className="accent-cyan-500 w-4 h-4 cursor-pointer"
                    checked={seleccionadas.includes(fuente.nombre)}
                    onChange={() => handleCheckbox(fuente.nombre)}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium text-white">{fuente.nombre_pila || fuente.nombre}</span>
                    {fuente.nombre && (
                      <span className="text-xs text-white/50">{fuente.nombre}</span>
                    )}
                  </div>
                </label>
              ))
            ) : (
              <p className="text-white/60 text-center text-sm py-4">
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
            className={`w-full px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
              loading || seleccionadas.length === 0
                ? "bg-white/10 text-white/40 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 hover:shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105"
            }`}
          >
            {loading ? "Consultando..." : "Consultar Fuentes"}
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}

/* ===============
   Página: Consulta
   =============== */
export default function Consulta() {
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
  const [open, setOpen] = useState(false); // Estado para el modal de Términos
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;
  const [showConsultaMedida, setShowConsultaMedida] = useState(false);

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
      tipo_consulta: "ecorefull",
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

      setTimeout(() => {
        navigate("/d3b7f1e9");
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
          sound="sounds/error-011-352286.mp3"
        />
      )}

      {/* Formulario */}
      <div className="h-screen flex items-center justify-center px-4 py-4 md:py-6 pb-20 md:pb-24 relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950">
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center max-w-5xl w-full relative z-10">
          {/* Lado izquierdo: Información */}
          <div className="text-center md:text-left space-y-3">
            <div>
              <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-cyan-100 to-blue-300 bg-clip-text text-transparent leading-tight tracking-tight">
                Econfia Core Full 
              </h1>
              <p className="mt-2 text-sm text-white/70 leading-relaxed">
                Verifica antecedentes de manera rápida, segura y confiable.
              </p>
            </div>

            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg p-3">
              <p className="text-xs text-white/80 leading-relaxed">
                <span className="text-cyan-400 font-semibold">⚠️ Declaración:</span> Al realizar esta consulta, declara y certifica que cuenta con la autorización válida del titular.
              </p>
            </div>
          </div>

          {/* Lado derecho: Formulario */}
          <div className="relative w-full max-w-sm mx-auto">
            <div className="relative w-full bg-gradient-to-br from-slate-900/80 via-blue-900/20 to-slate-900/80 backdrop-blur-xl rounded-[20px] border border-white/10 shadow-2xl shadow-cyan-500/10 p-6 group">
              {/* Glow effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[20px] bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none" />

              <div className="relative z-10">
                <div className="mb-4 text-center">
                  <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 mb-2 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                    <span className="text-cyan-300 text-xs font-medium">Verificación segura</span>
                  </div>
                  <h2 className="text-xl font-bold text-white">Verificar Ahora</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-2">
                  {/* Select Tipo de Documento */}
                  <div>
                    <label className="text-xs font-semibold text-white/70 mb-1 block">Tipo de Documento *</label>
                    <select
                      required
                      value={tipoDoc}
                      onChange={(e) => setTipoDoc(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-white/40 text-xs focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 focus:shadow-lg focus:shadow-cyan-500/10 transition-all backdrop-blur-sm appearance-none cursor-pointer"
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

                  {/* Input Cédula */}
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

                  {/* Input Fecha */}
                  <div>
                    <label className="text-xs font-semibold text-white/70 mb-1 block">Fecha de Expedición (Opcional)</label>
                    <input
                      type="date"
                      value={fechaExpedicion}
                      onChange={(e) => setFechaExpedicion(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 focus:shadow-lg focus:shadow-cyan-500/10 transition-all backdrop-blur-sm"
                    />
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
                        Acepto los
                        <button
                          type="button"
                          onClick={() => setOpen(true)} // Abre el modal de términos
                          className="text-cyan-400 hover:text-cyan-300 underline font-medium"
                        >
                          términos y condiciones
                        </button>
                      </span>
                    </label>

                                          <Terminos isOpen={open} onClose={() => setOpen(false)}> 
                                          <h2 className="text-xl font-bold">Términos y Condiciones</h2>
                                          <p
                                            className="mt-4 text-sm"
                                            style={{
                                              textAlign: "justify",
                                              lineHeight: "1.7",
                                              whiteSpace: "pre-line",
                                              padding: "1.5rem",
                                              borderRadius: "12px",
                                              background: "rgba(255,255,255,0.97)",
                                              color: "#222",
                                              maxHeight: "60vh",
                                              overflowY: "auto",
                                              fontSize: "1rem",
                                              boxShadow: "0 2px 16px 0 rgba(0,0,0,0.08)",
                                              margin: "0.5rem 0"
                                            }}
                                          >                       Aplicativo ECONFIA
                                    1. Objeto
                                    Los presentes Términos y Condiciones regulan el acceso, uso y consulta de
                                    información a través del aplicativo ECONFIA, destinado a la verificación de
                                    personas naturales y jurídicas en listas restrictivas, vinculantes, informativas y
                                    bases de datos públicas y privadas, con fines de debida diligencia, conocimiento
                                    de contrapartes, gestión del riesgo y cumplimiento normativo.
                                    2. Marco normativo aplicable
                                    El uso del aplicativo ECONFIA se rige, entre otras, por las siguientes disposiciones
                                    legales y regulatorias vigentes en la República de Colombia:
                                     Constitución Política de Colombia, artículo 15 (derecho al habeas data).
                                     Ley 1581 de 2012 y sus decretos reglamentarios (protección de datos
                                    personales).
                                     Ley 1266 de 2008 (hábeas data financiero, crediticio, comercial y de
                                    servicios).
                                     Decreto 1377 de 2013.
                                     Normas relacionadas con SARLAFT, SAGRILAFT, SIPLAFT,
                                    LA/FT/FPADM, según el sector aplicable.
                                     Circulares y lineamientos expedidos por la Superintendencia Financiera de
                                    Colombia, Superintendencia de Sociedades y demás autoridades
                                    competentes.
                                    3. Naturaleza de la información
                                    La información consultada a través de ECONFIA:
                                     Proviene de fuentes públicas, abiertas, oficiales o de terceros legalmente
                                    autorizados.
                                     Tiene carácter referencial, informativo y de apoyo para los procesos
                                    internos de análisis de riesgo.
                                     No constituye por sí sola prueba concluyente, sanción, acusación o
                                    declaración de responsabilidad sobre las personas consultadas.
                    
                                    4. Finalidad del tratamiento de datos
                                    El tratamiento de los datos personales consultados mediante ECONFIA tiene
                                    como finalidades principales:
                                     Cumplir obligaciones legales y regulatorias en materia de prevención de
                                    riesgos.
                                     Realizar procesos de debida diligencia y conocimiento de clientes,
                                    proveedores, contratistas, aliados o empleados.
                                     Prevenir riesgos legales, reputacionales, financieros y operativos.
                                    En ningún caso la información será utilizada para fines distintos a los aquí
                                    establecidos.
                                    5. Responsabilidad del usuario
                                    El usuario del aplicativo ECONFIA se obliga a:
                                     Utilizar la información consultada únicamente para fines lícitos y
                                    autorizados por la ley.
                                     Garantizar que cuenta con la base legal correspondiente para realizar las
                                    consultas.
                                     Interpretar los resultados como un insumo de análisis, complementándolos
                                    con otros mecanismos de verificación.
                                     Abstenerse de divulgar, comercializar o reutilizar la información de manera
                                    no autorizada.
                                    6. Limitación de responsabilidad
                                    ECONFIA no garantiza que la información consultada se encuentre libre de
                                    errores, actualizada en tiempo real o completa en todos los casos, dado que
                                    depende de la actualización de las fuentes de origen.
                                    En consecuencia, ECONFIA no será responsable por decisiones tomadas
                                    exclusivamente con base en los resultados de las consultas.
                                    7. Protección de datos personales
                                    ECONFIA actúa como encargado del tratamiento, conforme a la Ley 1581 de
                                    2012, y adopta medidas técnicas, administrativas y organizacionales razonables
                                    para proteger la información contra acceso no autorizado, pérdida o uso indebido.
                                    Los titulares de los datos podrán ejercer sus derechos de conocimiento,
                                    actualización, rectificación y supresión, conforme a la política de tratamiento de
                                    datos personales vigente.
                                    8. Confidencialidad
                    
                                    La información obtenida a través del aplicativo ECONFIA es confidencial y de uso
                                    restringido. El usuario se compromete a no divulgarla a terceros no autorizados ni
                                    a utilizarla de forma contraria a la ley.
                                    9. Aceptación de los términos
                                    El acceso y uso del aplicativo ECONFIA implica la aceptación expresa e
                                    irrevocable de los presentes Términos y Condiciones. En caso de no estar de
                                    acuerdo, el usuario deberá abstenerse de utilizar la plataforma.
                                    10. Modificaciones
                                    ECONFIA se reserva el derecho de modificar los presentes Términos y
                                    Condiciones en cualquier momento, en atención a cambios normativos, operativos
                                    o tecnológicos. Las modificaciones serán aplicables desde su publicación.
                    
                                    POLÍTICA DE TRATAMIENTO DE DATOS PERSONALES
                                    Aplicativo ECONFIA
                                    1. Identificación del responsable del tratamiento
                                    El aplicativo ECONFIA actúa como Responsable y/o Encargado del
                                    Tratamiento de Datos Personales, según corresponda, en los términos definidos
                                    por la Ley 1581 de 2012 y sus decretos reglamentarios, para la información
                                    tratada en el marco de la consulta de listas restrictivas y bases de datos.
                                    2. Marco legal
                                    La presente Política se rige principalmente por:
                                     Artículo 15 de la Constitución Política de Colombia.
                                     Ley 1581 de 2012 – Régimen General de Protección de Datos Personales.
                                     Decreto 1377 de 2013.
                                     Decreto 1074 de 2015.
                                     Ley 1266 de 2008 (cuando aplique).
                                     Circulares de la Superintendencia de Industria y Comercio (SIC).
                                    3. Definiciones
                                    Para efectos de la presente Política, se adoptan las definiciones previstas en la
                                    Ley 1581 de 2012, entre ellas:
                                     Dato personal
                    
                                     Dato público
                                     Dato sensible
                                     Titular
                                     Tratamiento
                                     Responsable del tratamiento
                                     Encargado del tratamiento
                                    4. Principios aplicables
                                    ECONFIA garantiza que el tratamiento de los datos personales se realizará bajo
                                    los principios de:
                                     Legalidad
                                     Finalidad
                                     Libertad
                                     Veracidad o calidad
                                     Transparencia
                                     Acceso y circulación restringida
                                     Seguridad
                                     Confidencialidad
                                    5. Tipo de datos tratados
                                    En desarrollo de su objeto, ECONFIA podrá tratar:
                                     Datos de identificación de personas naturales y jurídicas.
                                     Datos de contacto.
                                     Información contenida en listas restrictivas, sancionatorias, vinculantes
                                    o informativas.
                                     Datos públicos provenientes de fuentes abiertas, oficiales o legalmente
                                    habilitadas.
                                    ECONFIA no recolecta ni trata datos sensibles, salvo cuando la ley lo autorice
                                    expresamente o sea estrictamente necesario para el cumplimiento de obligaciones
                                    legales.
                                    6. Finalidades del tratamiento
                                    Los datos personales tratados a través del aplicativo ECONFIA serán utilizados
                                    para:
                                     Realizar consultas en listas restrictivas y bases de datos.
                                     Cumplir obligaciones legales y regulatorias en materia de prevención de
                                    riesgos.
                                     Apoyar procesos de debida diligencia, conocimiento de contrapartes y
                                    análisis de riesgo.
                    
                                     Prevenir riesgos legales, reputacionales, financieros y operativos.
                                     Atender requerimientos de autoridades competentes.
                                    En ningún caso los datos serán utilizados con fines distintos a los aquí descritos.
                                    7. Autorización del titular
                                    El tratamiento de los datos personales se realizará previa autorización expresa,
                                    previa e informada del titular, salvo las excepciones previstas en la ley,
                                    especialmente cuando se trate de datos públicos.
                                    El usuario del aplicativo declara que cuenta con la autorización correspondiente
                                    para realizar las consultas a través de ECONFIA.
                                    8. Derechos de los titulares
                                    De conformidad con el artículo 8 de la Ley 1581 de 2012, los titulares tienen
                                    derecho a:
                                     Conocer, actualizar y rectificar sus datos personales.
                                     Solicitar prueba de la autorización otorgada.
                                     Ser informados sobre el uso dado a sus datos.
                                     Presentar quejas ante la Superintendencia de Industria y Comercio.
                                     Revocar la autorización y/o solicitar la supresión del dato, cuando sea
                                    procedente.
                                     Acceder de forma gratuita a sus datos personales.
                                    9. Procedimiento para el ejercicio de derechos
                                    Las consultas, reclamos o solicitudes relacionadas con datos personales deberán
                                    realizarse a través de los canales definidos por ECONFIA, indicando:
                                     Identificación del titular.
                                     Descripción clara de la solicitud.
                                     Documentos que la soporten, si aplica.
                                    Los plazos de atención se ajustarán a lo establecido en la Ley 1581 de 2012 y
                                    normas concordantes.
                                    10. Deberes de ECONFIA
                                    ECONFIA se compromete a:
                                     Garantizar al titular el pleno y efectivo ejercicio de sus derechos.
                                     Conservar la información bajo condiciones de seguridad adecuadas.
                                     Actualizar y rectificar la información cuando sea necesario.
                    
                                     Tramitar consultas y reclamos conforme a la ley.
                                     Adoptar medidas técnicas, administrativas y organizacionales para proteger
                                    los datos.
                                    11. Seguridad de la información
                                    ECONFIA implementa medidas razonables de seguridad para evitar la
                                    adulteración, pérdida, consulta, uso o acceso no autorizado de los datos
                                    personales.
                                    12. Transferencia y transmisión de datos
                                    Los datos personales podrán ser transmitidos o transferidos a terceros únicamente
                                    cuando:
                                     Sea necesario para el cumplimiento de la finalidad del servicio.
                                     Exista autorización legal o contractual.
                                     Se garantice el cumplimiento de los estándares de protección exigidos por
                                    la ley colombiana.
                                    13. Vigencia
                                    La presente Política de Tratamiento de Datos Personales rige a partir de su
                                    publicación y permanecerá vigente mientras ECONFIA desarrolle las actividades
                                    descritas.
                    
                                    Los datos personales serán conservados durante el tiempo necesario para cumplir
                                    la finalidad del tratamiento y las obligaciones legales.
                                    </p>
                                          </Terminos>
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

                  {/* Botón principal */}
                  <button
                    type="submit"
                    disabled={!tipoDoc || !cedula || !acepta || !consentimiento || loading}
                    className={`w-full mt-3 px-6 py-2 rounded-lg font-semibold text-xs transition-all duration-300 ${
                      !tipoDoc || !cedula || !acepta || !consentimiento || loading
                        ? "bg-white/10 text-white/40 cursor-not-allowed"
                        : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 hover:shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105"
                    }`}
                  >
                    {loading ? "Procesando..." : "Consultar Ahora"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Consulta a la Medida */}
      <ModalConsultaMedida
        isOpen={showConsultaMedida}
        onClose={() => setShowConsultaMedida(false)}
        data={datos}
      />
    </>
  );
}
