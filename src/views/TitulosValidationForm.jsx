import React, { useState } from 'react';
import axios from 'axios';
import { createPortal } from "react-dom";
import Toast from "../components/Toast";

const PROFESIONES = [
  "Abogado/a",
  "Economista",
  "Psicólogo/a",
  "Bacteriólogo/a",
  "Biólogo/a",
  "Químico/a",
  "Ingeniero/a Químico/a",
  "Ingeniero/a de Petróleos",
  "Topógrafo/a",
  "Arquitecto/a",
  "Tecnólogo/a en Electricidad/Electrónica/Electromecánica",
  "Técnico/a Electricista",
  "Ingeniero/a Eléctrico/Mecánico/Electrónico/Telecom/Metalúrgico/Aeronáutico/Nuclear/Electromecánico",
  "Ingeniero/a",
  "Administrador/a de Empresas/Negocios",
  "Administrador/a Ambiental",
  "Contador/a"
];

const UNIVERSIDADES = [
  "Universidad Nacional",
  "Universidad de los Andes",
  "Universidad Javeriana",
  "Universidad del Rosario",
  "Universidad de Antioquia",
  "Universidad del Valle",
  "Universidad EAFIT",
  "Universidad Externado",
  "sena",
  "Universidad Cooperativa de Colombia",
  "Otra"
];

const TitulosValidationForm = () => {

  const [cedula, setCedula] = useState("");
  const [profesion, setProfesion] = useState("");
  const [universidad, setUniversidad] = useState("");
  const [codigoVerificacion, setCodigoVerificacion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);
  const [showResultados, setShowResultados] = useState(false);

  // Validación simple para habilitar botón
  const canSubmit = cedula.trim() && profesion && universidad && (
    universidad !== "Universidad de los Andes" || codigoVerificacion.trim()
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      setToast({ type: "error", message: "Completa todos los campos obligatorios." });
      return;
    }
    setLoading(true);
    setResult(null);
    setShowResultados(false);
    setToast(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        'http://127.0.0.1:8000/api/validar_titulos/',
        { cedula, profesion, universidad, codigoVerificacion },
        token ? { headers: { Authorization: `Token ${token}` } } : {}
      );
      setResult(response.data);
      setShowResultados(true);
    } catch (err) {
      setToast({ type: "error", message: "Error al consultar la validación de títulos." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center py-8 bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950">
      {/* HERO */}
      <div className="w-full max-w-2xl mx-auto text-center mb-8">
        <div className="flex flex-col items-center gap-2">
          <img src="/img/logo-econfia-rojo.png" alt="Econfía" className="h-12 w-auto mb-2 animate-fade-in" />
          <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-cyan-100 to-blue-300 bg-clip-text text-transparent leading-tight tracking-tight animate-fade-in">
            Validación de Títulos Profesionales
          </h1>
          <p className="text-white/80 text-sm md:text-base max-w-xl mt-2 animate-fade-in delay-100">
            Consulta y valida la autenticidad de títulos profesionales de manera rápida, segura y confiable. <br />
            <span className="text-cyan-300 font-semibold">Privacidad y confianza garantizadas.</span>
          </p>
        </div>
      </div>

      {/* Loader modal */}
      {loading && createPortal(
        <div className="fixed inset-0 z-50 grid place-items-center bg-white/60 backdrop-blur-md">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center w-full max-w-sm">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 mx-auto mb-4" />
            <p className="text-slate-700 font-medium">Procesando tu consulta…</p>
            <p className="text-slate-500 text-sm mt-1">Esto tomará solo unos segundos</p>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de resultados */}
      {!loading && showResultados && result && createPortal(
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/10 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-8 w-full max-w-2xl text-center">
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Consulta enviada</h2>
            <p className="text-slate-600 mb-6">
              Estamos preparando tus resultados. Te notificaremos cuando estén listos.
            </p>
            <div className="bg-slate-100 rounded-lg p-4 text-left text-xs text-slate-700 max-h-60 overflow-auto">
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
            <button
              className="mt-6 px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:from-cyan-400 hover:to-blue-400 transition"
              onClick={() => setShowResultados(false)}
            >
              Cerrar
            </button>
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

      {/* FORMULARIO */}
      <div className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8 animate-fade-in-up">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-white/70">Cédula *</label>
            <input
              type="text"
              value={cedula}
              onChange={e => setCedula(e.target.value)}
              placeholder="Ingrese número de cédula"
              required
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-white/40 text-xs focus:outline-none focus:border-cyan-400/70 focus:bg-white/10 focus:shadow-lg focus:shadow-cyan-500/10 transition-all backdrop-blur-sm focus:scale-105"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-white/70">Profesión *</label>
            <select
              value={profesion}
              onChange={e => setProfesion(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400/70 focus:bg-white/10 focus:shadow-lg focus:shadow-cyan-500/10 transition-all backdrop-blur-sm appearance-none cursor-pointer focus:scale-105"
            >
              <option value="" className="bg-slate-900 text-white">Seleccione profesión</option>
              {PROFESIONES.map(p => (
                <option key={p} value={p} className="bg-slate-900 text-white">{p}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-white/70">Universidad *</label>
            <select
              value={universidad}
              onChange={e => setUniversidad(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400/70 focus:bg-white/10 focus:shadow-lg focus:shadow-cyan-500/10 transition-all backdrop-blur-sm appearance-none cursor-pointer focus:scale-105"
            >
              <option value="" className="bg-slate-900 text-white">Seleccione universidad</option>
              {UNIVERSIDADES.map(u => (
                <option key={u} value={u} className="bg-slate-900 text-white">{u}</option>
              ))}
            </select>
          </div>
          {universidad === "Universidad de los Andes" && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-white/70">Código de Verificación *</label>
              <input
                type="text"
                value={codigoVerificacion}
                onChange={e => setCodigoVerificacion(e.target.value)}
                placeholder="Ejemplo: 041B7-74BBE-F95F7"
                required={universidad === "Universidad de los Andes"}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-white/40 text-xs focus:outline-none focus:border-cyan-400/70 focus:bg-white/10 focus:shadow-lg focus:shadow-cyan-500/10 transition-all backdrop-blur-sm focus:scale-105"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={loading || !canSubmit}
            className={`w-full mt-3 px-6 py-2 rounded-lg font-semibold text-xs transition-all duration-300
              ${loading || !canSubmit
                ? "bg-white/10 text-white/40 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 hover:shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105"}
            `}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 border-2 border-t-cyan-400 border-white rounded-full animate-spin"></span>
                Consultando...
              </span>
            ) : "Validar Título"}
          </button>
        </form>
        <p className="text-[10px] text-white/60 text-center mt-3">
          Tus datos son tratados con estricta confidencialidad y solo para fines de validación profesional.
        </p>
      </div>

      {/* Animaciones CSS */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both; }
        .animate-fade-in-up { animation: fade-in 1s cubic-bezier(.4,0,.2,1) both; }
      `}</style>
    </section>
  );
};

export default TitulosValidationForm;
