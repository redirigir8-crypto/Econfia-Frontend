import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";

export default function Consulta() {
  const [tipoDoc, setTipoDoc] = useState("CC");
  const [cedula, setCedula] = useState("");
  const [acepta, setAcepta] = useState(false);
  const [consentimiento, setConsentimiento] = useState(false);
  const [toast, setToast] = useState(null);
  const [consultaId, setConsultaId] = useState(null);
  const [estado, setEstado] = useState(null);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  // 🔄 Polling para revisar resultados
  useEffect(() => {
    if (!consultaId) return;

    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/resultados/${consultaId}/`, {
          headers: { Authorization: `Token ${token}` },
        });
        const data = await res.json();

        console.log("Estado resultado:", data);

        if (data.estado) {
          setEstado(data.estado);

          // ✅ Si ya terminó, paramos el polling
          if (data.estado === "completado") {
            clearInterval(interval);
            setToast({
              type: "success",
              message: `Consulta de ${data.nombre || cedula} completada`,
              persist: true, // no se cierra solo
              action: {
                text: "Ver resultados",
                onClick: () => navigate("/resultados"),
              },
            });
          }
        }
      } catch (err) {
        console.error("Error consultando estado:", err);
      }
    }, 4000); // cada 4s

    return () => clearInterval(interval);
  }, [consultaId, API_URL, navigate, cedula]);

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

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/consultar/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ tipo_doc: tipoDoc, cedula }),
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

      // Guardamos el id de la consulta
      setConsultaId(data.id);
      setEstado("pendiente");

      // Mostramos el toast de carga
      setToast({
        type: "loading",
        message: `Consulta de ${data.nombre || cedula} en proceso...`,
        persist: true, // no se cierra hasta que cambie estado
      });
    } catch (error) {
      console.error("Error en la consulta:", error);
      setToast({ type: "error", message: "Ocurrió un error en la consulta" });
    }
  };

  return (
    <>
      {/* Toast flotante */}
      {toast &&
        createPortal(
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => !toast.persist && setToast(null)}
            action={toast.action}
          />,
          document.body
        )}

      {/* Formulario */}
      <div className="flex justify-center mt-16 px-4 rounded-3xl w-full max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-5xl w-full">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Consulta lista de adversos
            </h1>
            <p className="text-lg text-white/70 leading-relaxed">
              Ingresa número de cédula y accede a los resultados de manera rápida, segura y confiable.
            </p>

            <p className="mt-4 text-sm text-red-400/80 leading-snug">
              Al ejecutar la consulta, declaras que cuentas con la plena autorización del titular de la cédula y que la información será utilizada de manera responsable y conforme a la ley.
            </p>
          </div>

          <div className="relative w-full max-w-md mx-auto border border-white/30 rounded-2xl shadow-xl">
            <div className="absolute inset-0 bg-white/5 blur-[4px] border rounded-2xl"></div>

            <div className="relative p-8">
              <h2 className="text-2xl font-semibold text-white mb-6 text-center">
                Consultar Cédula
              </h2>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="text-sm text-white/80 mb-1 block">
                    Tipo de Documento
                  </label>
                  <select
                    value={tipoDoc}
                    onChange={(e) => setTipoDoc(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 text-black placeholder-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="CC">Cédula de Ciudadanía (CC)</option>
                    <option value="TI">Tarjeta de Identidad (TI)</option>
                    <option value="CE">Cédula de Extranjería (CE)</option>
                    <option value="PPT">Permiso de Protección Temporal (PPT)</option>
                    <option value="PEP">Permiso Especial de Permanencia (PEP)</option>
                    <option value="NIT">NIT</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-white/80 mb-1 block">
                    Número de Cédula
                  </label>
                  <input
                    type="text"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Ej: 123456789"
                  />
                </div>

                {/* Checkbox términos */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={acepta}
                    onChange={(e) => setAcepta(e.target.checked)}
                    className="accent-blue-500 w-4 h-4"
                  />
                  <span className="text-sm text-white/80">
                    Acepto los{" "}
                    <a href="#" className="text-blue-400 underline">
                      términos y condiciones
                    </a>
                  </span>
                </div>

                {/* Checkbox consentimiento */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={consentimiento}
                    onChange={(e) => setConsentimiento(e.target.checked)}
                    className="accent-green-500 w-4 h-4"
                  />
                  <span className="text-sm text-white/80">
                    Confirmo que cuento con el consentimiento del titular del documento
                  </span>
                </div>

                {/* Botón */}
                <button
                  type="submit"
                  disabled={!acepta || !consentimiento}
                  className={`mt-2 px-6 py-2 rounded-full font-medium mx-16 transition-all duration-300 ease-in-out 
                    ${!acepta || !consentimiento 
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
    </>
  );
}