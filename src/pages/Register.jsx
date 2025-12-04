// src/components/Register.jsx
import React, { useState } from "react";
import Toast from "../components/Toast";
import loginVideo from "../assets/login.mp4";
import { Navigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [redirect, setRedirect] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Validación simple de contraseñas
    if (!form.password || !confirm || form.password !== confirm) {
      setToast({
        type: "error",
        message: "Las contraseñas no coinciden.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        // Solo envía lo que el backend espera (sin 'confirm')
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        let mensajeError = "Error al registrarse";
        if (data.username) mensajeError = `Usuario: ${data.username}`;
        else if (data.email) mensajeError = `Email: ${data.email}`;
        else if (data.error) mensajeError = data.error;

        setToast({ type: "error", message: mensajeError });
      } else {
        setToast({
          type: "success",
          message: "Cuenta creada con éxito. Revisa tu correo para activarla.",
        });
        setTimeout(() => setRedirect(true), 2500);
      }
    } catch (err) {
      setToast({
        type: "error",
        message: "Error de conexión con el servidor",
      });
    } finally {
      setLoading(false);
    }
  };

  if (redirect) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 md:p-10 relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Overlay de carga global */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-white">
            <Loader2 className="w-10 h-10 animate-spin" />
            <span className="text-sm">Creando tu cuenta…</span>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
          sound={
            toast.type === "error"
              ? "/sounds/error-011-352286.mp3"
              : "/sounds/error-011-352286.mp3"
          }
        />
      )}

      <div className="relative w-[80vw] h-[80vh] bg-gradient-to-br from-slate-900/80 via-blue-900/20 to-slate-900/80 backdrop-blur-xl rounded-[32px] border border-white/10 shadow-2xl shadow-cyan-500/10 flex overflow-hidden group">
        {/* Glow effect en hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[32px] bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none" />

        {/* Lado izquierdo: formulario */}
        <div className="w-1/2 flex flex-col justify-center items-start px-8 z-10 relative overflow-y-auto">
          <div className="space-y-1 mb-5">
            <div className="inline-block">
              <div className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 mb-3 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span className="text-cyan-300 text-xs font-medium">Únete a nuestra comunidad</span>
              </div>
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-white via-cyan-100 to-blue-300 bg-clip-text text-transparent leading-tight tracking-tight">
              Crear tu cuenta
            </h1>
            <p className="mt-2 text-sm text-white/70 leading-relaxed max-w-md">
              Regístrate ahora y comienza a verificar antecedentes
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-2 mt-4">
            {/* Grid 2 columnas */}
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                name="username"
                placeholder="Usuario"
                value={form.username}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="username"
                className="w-full rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-white/40 px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 focus:shadow-lg focus:shadow-cyan-500/10 transition-all duration-300 backdrop-blur-sm"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="email"
                className="w-full rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-white/40 px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 focus:shadow-lg focus:shadow-cyan-500/10 transition-all duration-300 backdrop-blur-sm"
              />
              <input
                type="text"
                name="first_name"
                placeholder="Nombre"
                value={form.first_name}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="given-name"
                className="w-full rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-white/40 px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 focus:shadow-lg focus:shadow-cyan-500/10 transition-all duration-300 backdrop-blur-sm"
              />
              <input
                type="text"
                name="last_name"
                placeholder="Apellido"
                value={form.last_name}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="family-name"
                className="w-full rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-white/40 px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 focus:shadow-lg focus:shadow-cyan-500/10 transition-all duration-300 backdrop-blur-sm"
              />

              {/* Password */}
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder="Contraseña"
                  value={form.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                  className="w-full rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-white/40 px-3 py-2.5 pr-12 text-sm focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 focus:shadow-lg focus:shadow-cyan-500/10 transition-all duration-300 backdrop-blur-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                  aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                  tabIndex={0}
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="password_confirm"
                  placeholder="Confirmar"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                  className="w-full rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-white/40 px-3 py-2.5 pr-12 text-sm focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 focus:shadow-lg focus:shadow-cyan-500/10 transition-all duration-300 backdrop-blur-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                  aria-label={showConfirm ? "Ocultar confirmación" : "Mostrar confirmación"}
                  tabIndex={0}
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 px-6 py-3 font-semibold text-white shadow-lg hover:shadow-cyan-500/50 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed transition-all transform hover:scale-105 duration-300"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Registrando..." : "Crear cuenta"}
            </button>
          </form>

          <p className="mt-4 text-xs text-white/70">
            ¿Ya tienes una cuenta?{" "}
            <a
              href="/login"
              className="font-medium text-cyan-400 hover:text-cyan-300 underline-offset-4 hover:underline transition-colors"
            >
              Inicia sesión
            </a>
          </p>
        </div>

        {/* Lado derecho: video */}
        <div className="w-1/2 h-full relative overflow-hidden">
          <video
            className="w-full h-full object-cover"
            src={loginVideo}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
          {/* Gradiente elegante de izquierda a derecha */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/40 to-transparent pointer-events-none" />
          {/* Overlay sutil con mix blend */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 to-blue-900/20 mix-blend-screen pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
