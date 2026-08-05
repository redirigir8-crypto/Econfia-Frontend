// src/components/Register.jsx
import React, { useState } from "react";
import Toast from "../components/Toast";
import loginVideo from "../assets/login.mp4";
import { Navigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const NATURAL_TYPE = "persona_natural";
const COMPANY_TYPE = "empresa";
const authInputClass =
  "w-full rounded-lg border border-line/15 bg-surface-2/85 px-3 py-2.5 text-sm text-content outline-none backdrop-blur-sm transition-all duration-300 placeholder:text-muted/60 focus:border-brand/60 focus:bg-surface focus:shadow-lg focus:shadow-cyan-500/10";

export default function Register() {
  const [form, setForm] = useState({
    registration_type: NATURAL_TYPE,
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    company_name: "",
    nit: "",
    password: "",
  });
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [redirect, setRedirect] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL;
  const isCompany = form.registration_type === COMPANY_TYPE;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTypeChange = (registrationType) => {
    setForm((prev) => ({
      ...prev,
      registration_type: registrationType,
      email: "",
      company_name: registrationType === COMPANY_TYPE ? prev.company_name : "",
      nit: registrationType === COMPANY_TYPE ? prev.nit : "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!form.password || !confirm || form.password !== confirm) {
      setToast({
        type: "error",
        message: "Las contraseñas no coinciden.",
      });
      return;
    }

    const payload = {
      registration_type: form.registration_type,
      username: form.username,
      first_name: form.first_name,
      last_name: form.last_name,
      password: form.password,
      confirm_password: confirm,
    };

    if (isCompany) {
      payload.company_name = form.company_name;
      payload.nit = form.nit;
      payload.email = form.email;
    } else {
      payload.email = form.email;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("[Register 400]", data);
        // DRF devuelve arrays por campo: { username: ["msg"], email: ["msg"] }
        const pick = (val) => (Array.isArray(val) ? val[0] : val);
        let mensajeError = "Error al registrarse";
        if (data.username) mensajeError = `Usuario: ${pick(data.username)}`;
        else if (data.email) mensajeError = `Email: ${pick(data.email)}`;
        else if (data.password) mensajeError = `Contraseña: ${pick(data.password)}`;
        else if (data.confirm_password) mensajeError = pick(data.confirm_password);
        else if (data.company_name) mensajeError = `Empresa: ${pick(data.company_name)}`;
        else if (data.nit) mensajeError = `NIT: ${pick(data.nit)}`;
        else if (data.first_name) mensajeError = `Nombre: ${pick(data.first_name)}`;
        else if (data.last_name) mensajeError = `Apellido: ${pick(data.last_name)}`;
        else if (data.non_field_errors) mensajeError = pick(data.non_field_errors);
        else if (data.error) mensajeError = data.error;
        else if (data.detail) mensajeError = data.detail;

        setToast({ type: "error", message: mensajeError });
      } else {
        setToast({
          type: "success",
          message: "Cuenta creada con éxito. Espera activación.",
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-transparent p-6 text-content md:p-10">
      <div className="absolute right-20 top-20 h-72 w-72 animate-pulse rounded-full bg-brand/10 blur-3xl" />
      <div
        className="absolute bottom-20 left-20 h-96 w-96 animate-pulse rounded-full bg-violet-500/10 blur-3xl"
        style={{ animationDelay: "1s" }}
      />

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 text-white">
            <Loader2 className="w-10 h-10 animate-spin" />
            <span className="text-sm">Creando tu cuenta...</span>
          </div>
        </div>
      )}

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

      <div className="group relative flex h-[80vh] w-[80vw] overflow-hidden rounded-[32px] border border-line/15 bg-surface/90 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-0 rounded-[32px] bg-gradient-to-r from-brand/10 via-transparent to-brand-2/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="relative z-10 flex w-1/2 flex-col items-start justify-center overflow-y-auto px-8">
          <div className="pointer-events-none absolute inset-0">
            <div
              className="econfia-grid-wave absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(0deg, transparent 24%, rgb(var(--th-brand) / 0.10) 25%, rgb(var(--th-brand) / 0.10) 26%, transparent 27%, transparent 74%, rgb(var(--th-brand) / 0.10) 75%, rgb(var(--th-brand) / 0.10) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgb(var(--th-brand) / 0.10) 25%, rgb(var(--th-brand) / 0.10) 26%, transparent 27%, transparent 74%, rgb(var(--th-brand) / 0.10) 75%, rgb(var(--th-brand) / 0.10) 76%, transparent 77%, transparent)",
                backgroundSize: "56px 56px",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-brand-2/10" />
          </div>
          <div className="space-y-1 mb-5">
            <div className="inline-block">
              <div className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 mb-3 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                </span>
                <span className="text-xs font-bold text-brand">Únete a nuestra comunidad</span>
              </div>
            </div>
            <h1
              className="bg-clip-text text-4xl font-black leading-tight tracking-tight text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgb(var(--th-content)), rgb(var(--th-brand)), rgb(var(--th-brand-2)))",
              }}
            >
              Crear tu cuenta
            </h1>
            <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-muted">
              Regístrate y elige si tu acceso será como persona natural o empresa.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-3 mt-4">
            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-line/15 bg-surface-2/80 p-1 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => handleTypeChange(NATURAL_TYPE)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                  !isCompany
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20"
                    : "text-muted hover:bg-brand/10 hover:text-brand"
                }`}
              >
                Persona natural
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange(COMPANY_TYPE)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                  isCompany
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20"
                    : "text-muted hover:bg-brand/10 hover:text-brand"
                }`}
              >
                Empresa
              </button>
            </div>

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
                className={authInputClass}
              />

              {isCompany ? (
                <input
                  type="text"
                  name="company_name"
                  placeholder="Nombre empresa"
                  value={form.company_name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  autoComplete="organization"
                  className={authInputClass}
                />
              ) : (
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  autoComplete="email"
                  className={authInputClass}
                />
              )}

              <input
                type="text"
                name="first_name"
                placeholder="Nombre"
                value={form.first_name}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="given-name"
                className={authInputClass}
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
                className={authInputClass}
              />

              {isCompany && (
                <>
                  <input
                    type="text"
                    name="nit"
                    placeholder="NIT"
                    value={form.nit}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    autoComplete="off"
                    className={authInputClass}
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Correo corporativo"
                    value={form.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    autoComplete="email"
                    className={authInputClass}
                  />
                </>
              )}

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
                  className={`${authInputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-brand"
                  aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                  tabIndex={0}
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

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
                  className={`${authInputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-brand"
                  aria-label={showConfirm ? "Ocultar confirmación" : "Mostrar confirmación"}
                  tabIndex={0}
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 px-6 py-3 font-semibold text-white shadow-lg hover:shadow-cyan-500/50 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed transition-all transform hover:scale-105 duration-300"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Registrando..." : "Crear cuenta"}
            </button>
          </form>

          <p className="mt-4 text-xs font-medium text-muted">
            ¿Ya tienes una cuenta?{" "}
            <a
              href="/login"
              className="font-bold text-brand underline-offset-4 transition-colors hover:underline hover:opacity-80"
            >
              Inicia sesión
            </a>
          </p>
        </div>

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
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgb(var(--th-surface) / 0.95), rgb(var(--th-surface) / 0.50), transparent)",
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand/25 to-brand-2/20 mix-blend-multiply dark:mix-blend-screen" />
        </div>
      </div>
    </div>
  );
}
