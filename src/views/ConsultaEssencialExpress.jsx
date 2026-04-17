import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import CardDni from "../components/CardDni";
import Terminos from "../components/Terminos";
import ConsultaMasivaModal from "../components/ConsultaMasivaModal";


function ModalEssencialExpress({ isOpen, onClose, data, onSuccess }) {
  const [fuentes, setFuentes] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!isOpen) return;
    const fetchFuentes = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/fuentes/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        });
        const json = await res.json();
        setFuentes(Array.isArray(json) ? json : []);
      } catch (err) {
        setFuentes([]);
      }
    };
    fetchFuentes();
  }, [isOpen, API_URL]);

  const filteredFuentes = fuentes.filter((f) => {
    const texto = `${f?.nombre ?? ""} ${f?.nombre_pila ?? ""}`.toLowerCase();
    return texto.includes(query.toLowerCase());
  });

  const handleCheckbox = (nombre) => {
    setSeleccionadas((prev) => {
      if (prev.includes(nombre)) {
        return prev.filter((n) => n !== nombre);
      }
      // Si ya hay 45 seleccionadas, no agregar más
      if (prev.length >= 45) {
        return prev;
      }
      return [...prev, nombre];
    });
  };

  const handleConsultar = async () => {
    if (!data) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const bodyPayload = {
        cedula: data.cedula,
        tipo_doc: data.tipo_doc,
        lista_nombres: seleccionadas,
        tipo_consulta: "essencial-express",
      };
      if (data.fecha_expedicion) {
        bodyPayload.fecha_expedicion = data.fecha_expedicion;
      }
      // Cambia el endpoint aquí
      const res = await fetch(`${API_URL}/api/consultar-sin-captura-express/`, {
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
      if (onSuccess) onSuccess(result.datos || result);
      onClose();
    } catch (err) {
      setToast({ type: "error", message: "Ocurrió un error en la consulta" });
    } finally {
      setLoading(false);
    }
  };

  const allSelected = filteredFuentes.length > 0 && filteredFuentes.every(f => seleccionadas.includes(f.nombre));
  const handleToggleAll = () => {
    if (allSelected) {
      setSeleccionadas([]);
    } else {
      const nuevas = filteredFuentes.map(f => f.nombre);
      setSeleccionadas(nuevas.slice(0, 45));
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
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
        <div className="absolute top-20 right-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="relative bg-gradient-to-br from-slate-900/90 via-blue-900/30 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[20px] shadow-2xl shadow-cyan-500/20 max-w-3xl w-full p-6 text-white">
          <div className="absolute inset-0 opacity-50 rounded-[20px] bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none" />
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
                <span className="text-cyan-300 text-xs font-medium">Personaliza tu consulta Express</span>
              </div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-white via-cyan-100 to-blue-300 bg-clip-text text-transparent">
                Econfia Essential Express
              </h2>
            </div>
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
            {/* Contador de fuentes seleccionadas */}
            <div className="mb-2 flex items-center justify-between">
              <span className="text-cyan-300 font-semibold text-sm">
                {`Fuentes seleccionadas: ${seleccionadas.length} / 45`}
              </span>
              {seleccionadas.length >= 45 && (
                <span className="text-xs text-orange-400 font-medium">⚠️ Límite máximo</span>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto space-y-2 mb-4 pr-2 custom-scrollbar">
              {filteredFuentes.length > 0 ? (
                filteredFuentes.map((fuente) => {
                  const isDisabled = seleccionadas.length >= 45 && !seleccionadas.includes(fuente.nombre);
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
            <button
              onClick={handleConsultar}
              disabled={loading || seleccionadas.length === 0}
              className={`w-full px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                loading || seleccionadas.length === 0
                  ? "bg-white/10 text-white/40 cursor-not-allowed"
                  : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 hover:shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105"
              }`}
            >
              {loading ? "Consultando..." : "Consultar Express"}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

export default function ConsultaEssencialExpress() {
  const [puedeUsarMasivas, setPuedeUsarMasivas] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    const API = process.env.REACT_APP_API_URL;
    fetch(`${API}/api/profile/`, { headers: { Authorization: `Token ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        const ids = data.perfil?.planes_masivas_ids || [];
        const planes = data.perfil?.planes || [];
        const planActual = planes.find((p) => p.nombre === "essencial-express");
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
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;
  const [showEssencialExpress, setShowEssencialExpress] = useState(false);
  const [showMasiva, setShowMasiva] = useState(false);

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
    };
    if (fechaExpedicion) {
      bodyData.fecha_expedicion = fechaExpedicion;
    }
    setDatos(bodyData);
    setShowEssencialExpress(true);
    setLoading(false);
  };

  return (
    <>
      {loading &&
        createPortal(
          <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
            <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-40">
              <source src="/videos/load.mp4" type="video/mp4" />
              Tu navegador no soporta videos.
            </video>
            <audio autoPlay loop>
              <source src="/sounds/suspend-sound-113941.mp3" type="audio/mp3" />
              Tu navegador no soporta audio.
            </audio>
            <div className="relative bg-white/10 border border-white/30 rounded-2xl p-10 shadow-2xl text-center max-w-md w-full mx-4 backdrop-blur-md">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-cyan-400 mx-auto mb-6"></div>
              <p className="text-white text-lg font-semibold animate-pulse">
                Cargando datos del candidato para la consulta...
              </p>
            </div>
          </div>,
          document.body
        )}
      {!loading && showResultados && datos && createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="p-8 shadow-2xl max-w-2xl w-full mx-4 text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Consulta enviada
            </h2>
            <p className="text-white/80 mb-6">
              La consulta ha sido enviada a procesamiento y en unos segundos estará lista.
            </p>
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
      <section className="relative h-screen flex items-center justify-center py-4 md:py-6 pb-20 md:pb-24 overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950">
        <div className="absolute top-20 right-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        {/* Logo — esquina superior izquierda */}
        <div className="hidden md:block absolute md:top-6 md:left-6 z-20" style={{ perspective: "800px" }}>
          <img
            src="/1-e9a7e544.ico"
            alt="Econfía"
            className="w-20 h-20 md:w-28 md:h-28 object-contain drop-shadow-[0_0_20px_rgba(239,68,68,0.7)]"
            style={{ animation: "flipY 2.5s linear infinite", transformStyle: "preserve-3d" }}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center max-w-5xl w-full px-4 relative z-10">
          <div className="text-center md:text-left space-y-5">
            <div>
              <div className="inline-flex px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 mb-3 items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span className="text-cyan-300 text-xs font-medium">Consulta Express</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-cyan-100 to-blue-300 bg-clip-text text-transparent leading-tight tracking-tight">
                Econfia Essencial Express
              </h1>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              Seleccione el tipo de documento e ingrese el número. Luego elija las fuentes específicas que desea consultar (solo bots sin captura).
            </p>
            <div className="space-y-2 pt-2">
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-cyan-500 flex-shrink-0" />
                <span className="text-xs text-white/80">Consulta rápida y eficiente.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                <span className="text-xs text-white/80">Solo bots sin captura.</span>
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
                        <option className="bg-slate-900 text-white" value="CC">Cédula de Ciudadanía (CC)</option>
                        <option className="bg-slate-900 text-white" value="TI">Tarjeta de Identidad (TI)</option>
                        <option className="bg-slate-900 text-white" value="CE">Cédula de Extranjería (CE)</option>
                        <option className="bg-slate-900 text-white" value="PPT">Permiso de Protección Temporal (PPT)</option>
                        <option className="bg-slate-900 text-white" value="PEP">Permiso Especial de Permanencia (PEP)</option>
                        <option className="bg-slate-900 text-white" value="NIT">NIT</option>
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
                        Acepto los {" "}
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
                  <button
                    type="submit"
                    disabled={!tipoDoc || !cedula || !acepta || !consentimiento}
                    className={`mt-3 w-full px-4 py-2 rounded-lg font-semibold text-xs transition-all duration-300 ${
                      !tipoDoc || !cedula || !acepta || !consentimiento
                        ? "bg-white/10 text-white/40 cursor-not-allowed"
                        : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 hover:shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105"
                    }`}
                  >
                    Consulta Essencial Express
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
            <p className="text-[10px] text-white/60 text-center mt-2">
              Cumplimiento normativo y uso responsable de la información.
            </p>
          </div>
        </div>
      </section>
      <ModalEssencialExpress
        isOpen={showEssencialExpress}
        onClose={() => setShowEssencialExpress(false)}
        data={datos}
        onSuccess={(datosConsulta) => {
          setDatos(datosConsulta);
          setShowResultados(true);
          setTimeout(() => navigate("/d3b7f1e9"), 6500);
        }}
      />

      {/* Modal: Consulta Masiva */}
      <ConsultaMasivaModal
        isOpen={showMasiva}
        onClose={() => setShowMasiva(false)}
        tipoConsulta="essencial-express"
      />
    </>
  );
}
