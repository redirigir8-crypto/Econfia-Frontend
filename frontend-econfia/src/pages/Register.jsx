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
    <div className="min-h-screen flex items-center justify-center p-6 md:p-10 relative">
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

      <div className="relative w-[80vw] h-[80vh] bg-gradient-to-br from-[#0a0f1a] to-[#1b1f3a] rounded-[28px] shadow-xl flex overflow-hidden">
        {/* Lado izquierdo: formulario */}
        <div className="w-1/2 flex flex-col justify-center items-start px-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-100">
            Crear cuenta
          </h1>
          <p className="mt-3 text-lg text-slate-100">
            Regístrate para comenzar tu experiencia
          </p>

          <form onSubmit={handleSubmit} className="mt-8 w-full max-w-xl">
            {/* Grid 2 columnas desde md, 1 en móvil */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="username"
                placeholder="Usuario"
                value={form.username}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="username"
                className="w-full rounded-2xl bg-white text-slate-800 placeholder:text-slate-400 px-4 py-3 shadow-inner ring-1 ring-slate-200/80 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-70"
              />
              <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                value={form.email}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="email"
                className="w-full rounded-2xl bg-white text-slate-800 placeholder:text-slate-400 px-4 py-3 shadow-inner ring-1 ring-slate-200/80 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-70"
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
                className="w-full rounded-2xl bg-white text-slate-800 placeholder:text-slate-400 px-4 py-3 shadow-inner ring-1 ring-slate-200/80 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-70"
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
                className="w-full rounded-2xl bg-white text-slate-800 placeholder:text-slate-400 px-4 py-3 shadow-inner ring-1 ring-slate-200/80 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-70"
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
                  className="w-full rounded-2xl bg-white text-slate-800 placeholder:text-slate-400 px-4 py-3 pr-12 shadow-inner ring-1 ring-slate-200/80 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-70"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
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
                  placeholder="Confirmar contraseña"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                  className="w-full rounded-2xl bg-white text-slate-800 placeholder:text-slate-400 px-4 py-3 pr-12 shadow-inner ring-1 ring-slate-200/80 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-70"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  aria-label={showConfirm ? "Ocultar confirmación" : "Mostrar confirmación"}
                  tabIndex={0}
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Botón: ocupa 2 columnas en md+ */}
            <button
              type="submit"
              disabled={loading}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-blue-500 to-blue-700 px-6 py-3 font-semibold text-white shadow-lg hover:to-blue-800 focus:outline-none disabled:opacity-70 w-full md:w-auto md:col-span-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Registrarse
            </button>
          </form>

          <p className="mt-8 text-sm text-slate-100">
            ¿Ya tienes una cuenta?{" "}
            <a
              href="/login"
              className="font-medium text-blue-400 hover:text-blue-300 underline-offset-4 hover:underline"
            >
              Inicia sesión
            </a>
          </p>
        </div>

        {/* Lado derecho: video */}
        <div className="w-1/2 h-full relative">
          <video
            className="w-full h-full object-cover"
            src={loginVideo}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
          <div className="absolute inset-0 bg-blue-900/40 mix-blend-multiply pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
