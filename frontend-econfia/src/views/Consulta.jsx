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
          lista_nombres: seleccionadas,
        }),
      });
      await res.json();
      onClose(); // Cierra el modal o maneja resultados
    } catch (err) {
      console.error("Error consultando:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    // Fondo BLANCO al abrir el modal
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-3xl w-full p-6 relative text-slate-900">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-500 hover:text-red-500 text-xl font-bold"
          aria-label="Cerrar"
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold mb-4 text-center">
          Consulta a la Medida
        </h2>

        {/* Filtro */}
        <div className="mb-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtrar fuentes por nombre..."
            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-slate-500 mt-1">
            {filteredFuentes.length} fuente{filteredFuentes.length === 1 ? "" : "s"} encontradas
          </p>
        </div>

        {/* Lista de fuentes */}
        <div className="max-h-72 overflow-y-auto space-y-2 mb-4">
          {filteredFuentes.length > 0 ? (
            filteredFuentes.map((fuente) => (
              <label
                key={fuente.id}
                className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 p-3 rounded-lg border border-slate-200"
              >
                <input
                  type="checkbox"
                  className="accent-blue-600 w-4 h-4"
                  checked={seleccionadas.includes(fuente.nombre)}
                  onChange={() => handleCheckbox(fuente.nombre)}
                />
                <div className="flex flex-col">
                  <span className="font-medium">{fuente.nombre_pila || fuente.nombre}</span>
                  {fuente.nombre && (
                    <span className="text-xs text-slate-500">{fuente.nombre}</span>
                  )}
                </div>
              </label>
            ))
          ) : (
            <p className="text-slate-500 text-center">
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
          className={`w-full px-4 py-2 rounded-full font-medium text-sm transition-all ${
            loading || seleccionadas.length === 0
              ? "bg-slate-300 text-slate-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg"
          }`}
        >
          {loading ? "Consultando..." : "Consultar"}
        </button>
      </div>
    </div>,
    document.body
  );
}

/* ===============
   Página: Consulta
   =============== */
export default function Consulta() {
  const [tipoDoc, setTipoDoc] = useState("");
  const [open, setOpen] = useState(false);
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

    if (!acepta) {
      alert("Debes aceptar los términos y condiciones.");
      return;
    }
    if (!consentimiento) {
      alert("Debes confirmar que cuentas con el consentimiento del titular.");
      return;
    }

    setLoading(true);
    setDatos(null);
    setShowResultados(false);

    const bodyData = {
      tipo_doc: tipoDoc,
      cedula,
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
      <div className="flex justify-center mt-8 px-4 rounded-3xl w-full max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-5xl w-full">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 ">
              Consulta lista dinamica de adversos
            </h1>
            <p className="text-lg text-white/70 leading-relaxed text-justify">
              Seleccione el tipo de documento e ingrese el cupo númerico y
              acceda a los resultados de manera rápida, segura y confiable.
            </p>

            <p className="mt-4 text-[10px] text-red-400/80 leading-snug text-justify">
              Al realizar esta consulta, declara y certifica que cuenta con la
              autorización válida y expresa del titular del tipo de documento
              objeto de verificación, y que la información será utilizada de
              forma responsable, conforme a la normatividad vigente en Colombia.
            </p>
          </div>

          <div className="relative w-full max-w-md mx-auto border border-white/30 rounded-2xl shadow-xl">
            <div className="absolute inset-0 bg-white/5 blur-[4px] border rounded-2xl"></div>

            <div className="relative p-8">
              <h2 className="text-2xl font-semibold text-white mb-6 text-center">
                <img
                  src="/img/logo-econfia-rojo.png"
                  alt="Mi Imagen"
                  className="mx-auto max-h-16 w-auto"
                />
              </h2>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {/* Inputs */}
                <div className="flex flex-col gap-2">
                  <select
                    value={tipoDoc}
                    onChange={(e) => setTipoDoc(e.target.value)}
                    className="w-full px-2 py-1 rounded-md bg-white/10 text-sm border border-white/20 focus:outline-none focus:ring-1 focus:ring-blue-400 text-white"
                  >
                    <option className="bg-black/50 text-white" value="">
                      Seleccione tipo de documento
                    </option>
                    <option className="bg-black/50 text-white" value="CC">
                      Cédula de Ciudadanía (CC)
                    </option>
                    <option className="bg-black/50 text-white" value="TI">
                      Tarjeta de Identidad (TI)
                    </option>
                    <option className="bg-black/50 text-white" value="CE">
                      Cédula de Extranjería (CE)
                    </option>
                    <option className="bg-black/50 text-white" value="PPT">
                      Permiso de Protección Temporal (PPT)
                    </option>
                    <option className="bg-black/50 text-white" value="PEP">
                      Permiso Especial de Permanencia (PEP)
                    </option>
                    <option className="bg-black/50 text-white" value="NIT">
                      NIT
                    </option>
                  </select>

                  <input
                    type="text"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    placeholder="Ingrese cupo de númerico"
                    className="w-full px-2 py-1 rounded-md bg-white/10 text-white text-sm placeholder-white/50 border border-white/20 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />

                  <div className="w-full">
                    <label className="text-xs text-white/80 mb-1 block">
                      Fecha de Expedición
                    </label>
                    <input
                      type="date"
                      value={fechaExpedicion}
                      onChange={(e) => setFechaExpedicion(e.target.value)}
                      className="w-full px-2 py-1 rounded-md bg-white/10 text-white text-sm border border-white/20 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="flex flex-col gap-2 mt-2 text-sm">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={acepta}
                      onChange={(e) => setAcepta(e.target.checked)}
                      className="accent-blue-500 w-3 h-3"
                    />
                    <span className="text-white/80">
                      Acepto los{" "}
                      <a
                        href="#"
                        onClick={() => setOpen(true)}
                        className="text-blue-400 underline"
                      >
                        términos y condiciones
                      </a>
                    </span>
                  </div>

                  <Terminos isOpen={open} onClose={() => setOpen(false)}>
                    <h2 className="text-xl font-bold mb-4">
                      Términos y Condiciones
                    </h2>
                    <p>
                      Aviso Legal y Declaración de Cumplimiento Normativo...
                    </p>
                  </Terminos>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={consentimiento}
                      onChange={(e) => setConsentimiento(e.target.checked)}
                      className="accent-green-500 w-3 h-3"
                    />
                    <span className="text-white/80">
                      Confirmo que cuento con el consentimiento del titular del
                      documento
                    </span>
                  </div>
                </div>

                {/* Botón principal */}
                <button
                  type="submit"
                  disabled={!acepta || !consentimiento}
                  className={`mt-2 px-4 py-1 rounded-full font-medium text-sm transition-all duration-300 ease-in-out 
                    ${
                      !acepta || !consentimiento
                        ? "bg-gray-500 cursor-not-allowed text-white/70"
                        : "bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105 hover:shadow-lg"
                    }`}
                >
                  Consultar
                </button>

              </form>
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
