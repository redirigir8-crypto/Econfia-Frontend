import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Terminos from "../components/Terminos";

export default function ConsultaEmpresa() {
  const [tipoDoc] = useState("NIT");
  const [nit, setNit] = useState("");
  const [acepta, setAcepta] = useState(false);
  const [consentimiento, setConsentimiento] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [resultadoEmpresa, setResultadoEmpresa] = useState(null);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nit) {
      setToast({ type: "error", message: "Ingresa el NIT de la empresa." });
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
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/consultar-empresa-rues/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ nit }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({ type: "error", message: data.error || `Error HTTP: ${res.status}` });
        setLoading(false);
        return;
      }
      // Mostrar resultado directamente en pantalla
      setResultadoEmpresa({
        nombre: data.nombre,
        nit: data.nit,
        estado: data.estado,
        camara_comercio: data.camara_comercio,
        matricula: data.matricula,
        captura_principal: data.captura_principal,
        fuente: "RUES",
      });
    } catch (error) {
      setToast({ type: "error", message: "Ocurrió un error en la consulta" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-slate-900/95 to-blue-900/95 p-8 rounded-2xl shadow-2xl border border-white/10 mt-10">
      <h2 className="text-2xl font-bold text-cyan-400 mb-6 text-center">Consulta de Empresa</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-cyan-200 font-semibold mb-2">Tipo de documento</label>
          <select className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white" value={tipoDoc} disabled>
            <option value="NIT">NIT</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-cyan-200 font-semibold mb-2">NIT de la empresa</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white"
            placeholder="Ej: 900214565-3"
            value={nit}
            onChange={e => setNit(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="mb-2 flex items-center">
          <input type="checkbox" id="acepta" checked={acepta} onChange={e => setAcepta(e.target.checked)} className="mr-2" />
          <label htmlFor="acepta" className="text-white text-sm">Acepto los <Terminos inline />.</label>
        </div>
        <div className="mb-4 flex items-center">
          <input type="checkbox" id="consentimiento" checked={consentimiento} onChange={e => setConsentimiento(e.target.checked)} className="mr-2" />
          <label htmlFor="consentimiento" className="text-white text-sm">Confirmo consentimiento del titular.</label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold hover:from-cyan-400 hover:to-blue-400 transition-all"
        >
          {loading ? "Consultando..." : "Consultar Empresa"}
        </button>
        {toast && <div className={`mt-4 text-center text-sm ${toast.type === "error" ? "text-red-400" : "text-green-400"}`}>{toast.message}</div>}
      </form>

      {/* Mostrar resultado empresa si existe */}
      {resultadoEmpresa && (
        <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-slate-800/80 to-blue-900/80 border border-cyan-500/30 shadow-lg">
          <h3 className="text-xl font-bold text-cyan-300 mb-4 text-center">Resultado de la Empresa</h3>
          <div className="space-y-2">
            <div><span className="font-semibold text-cyan-200">NIT:</span> <span className="text-white">{resultadoEmpresa.nit}</span></div>
            <div><span className="font-semibold text-cyan-200">Nombre:</span> <span className="text-white">{resultadoEmpresa.nombre}</span></div>
            <div><span className="font-semibold text-cyan-200">Estado:</span> <span className="text-white">{resultadoEmpresa.estado}</span></div>
            <div><span className="font-semibold text-cyan-200">Cámara de Comercio:</span> <span className="text-white">{resultadoEmpresa.camara_comercio}</span></div>
            <div><span className="font-semibold text-cyan-200">Matrícula:</span> <span className="text-white">{resultadoEmpresa.matricula}</span></div>
            {resultadoEmpresa.captura_principal && (
              <div className="mt-4">
                <span className="font-semibold text-cyan-200">Captura:</span><br />
                <img src={resultadoEmpresa.captura_principal} alt="Captura" className="max-w-full rounded-lg border border-cyan-500/20 shadow" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
