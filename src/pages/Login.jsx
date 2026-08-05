// src/components/Login.jsx
import React, { useState, useEffect } from "react";
import Toast from "../components/Toast";
import loginVideo from "../assets/login.mp4";
import { Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { clearSession, isInactive, touchActivity } from "../utils/session";

const authInputClass =
  "w-full rounded-lg border border-line/15 bg-surface-2/85 px-3 py-2.5 text-sm text-content outline-none backdrop-blur-sm transition-all duration-300 placeholder:text-muted/60 focus:border-brand/60 focus:bg-surface focus:shadow-lg focus:shadow-cyan-500/10";

export default function Login() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
  console.log("API URL cargada desde .env:", process.env.REACT_APP_API_URL);
}, []);

    console.log("username:", user);
    console.log("password:", password);
    console.log("API_URL:", API_URL);
    console.log("Login URL:", `${API_URL}/api/login/`);


  // si ya hay sesión, redirige a /profile
  if (token && isInactive()) {
    clearSession();
  }

  if (localStorage.getItem("token")) {
    return <Navigate to="/e9c4b2f7" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    


    try {
      const res = await fetch(`${API_URL}/api/login/`, {
 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          username: user,
          password: password

        }),
      });
        console.log("DEBUG -> username:", user)
        console.log("DEBUG -> password:", password)

      let data = null;
      try{
        data = await res.json();
      } catch (err) {
        data = null;
      }

  console.log("Código HTTP:", res.status);          // 400
  console.log("Status text:", res.statusText);     // "Bad Request"
  console.log("OK?", res.ok);                      // false
  console.log("Headers:", [...res.headers]);       // Array de headers devueltos

   //   const data = await res.json().catch ((err) => null);
      console.log("Body devuelto(JSON)", data);


      if (!res.ok) {
        let mensajeError = "Error al iniciar sesión";
        if (data.error === "Invalid username or password") {
          mensajeError = "Usuario o contraseña incorrectos";
        } else if (data.error) {
          mensajeError = data.error;
        }
        setToast({ type: "error", message: mensajeError });
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        touchActivity();
        // El SoundManager reproducirá el sonido de "login" tras la recarga.
        sessionStorage.setItem("econfia_play_login", "1");
        setToast({
          type: "success",
          message: `Bienvenido ${data.user.username}!`,
        });
        // Navegación dura para refrescar estado global (si aplica)
        window.location.href = "/e9c4b2f7";
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

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-transparent p-6 text-content md:p-10">
      {/* Elementos decorativos de fondo */}
      <div className="absolute right-20 top-20 h-72 w-72 animate-pulse rounded-full bg-brand/10 blur-3xl" />
      <div className="absolute bottom-20 left-20 h-96 w-96 animate-pulse rounded-full bg-violet-500/10 blur-3xl" style={{ animationDelay: '1s' }} />

      {/* Botón retorno */}
      <button
        onClick={() => navigate("/")}
        className="group fixed left-6 top-6 z-50 flex items-center gap-2 rounded-lg border border-line/20 bg-surface/85 px-4 py-2 text-content shadow-[0_12px_32px_rgba(15,23,42,0.12)] backdrop-blur-sm transition-all hover:border-brand/50 hover:bg-surface"
        title="Volver al inicio"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="hidden sm:inline text-sm font-medium">Atrás</span>
      </button>

      {/* Logo */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        aria-label="Ir al inicio"
      >
        <img 
          src="/img/logo.png" 
          alt="Econfia Logo" 
          className="h-10 md:h-12"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      </button>

      {/* Overlay de carga global */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 text-white">
            <Loader2 className="w-10 h-10 animate-spin" />
            <span className="text-sm">Validando credenciales…</span>
          </div>
        </div>
      )}

{/* Toast */}
{toast && (
  <Toast
    type={toast.type}
    message={toast.message}
    onClose={() => setToast(null)}
    sound={toast.type === "error" ? "/sounds/error-011-352286.mp3" : undefined}
  />
)}

      <div className="group relative flex h-[80vh] w-[80vw] overflow-hidden rounded-[32px] border border-line/15 bg-surface/90 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
        {/* Glow effect en hover */}
        <div className="pointer-events-none absolute inset-0 rounded-[32px] bg-gradient-to-r from-brand/10 via-transparent to-brand-2/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Lado izquierdo: formulario */}
        <div className="relative z-10 flex w-1/2 flex-col items-start justify-center overflow-y-auto px-8">
          {/* Cuadrícula sutil de fondo */}
          <div className="absolute inset-0 pointer-events-none">
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

          <div className="relative z-10 w-full">
            <div className="space-y-1 mb-5">
            <div className="inline-block">
              <div className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 mb-3 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span className="text-xs font-bold text-brand">Bienvenido de vuelta</span>
              </div>
            </div>
            <h1
              className="bg-clip-text text-4xl font-black leading-tight tracking-tight text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgb(var(--th-content)), rgb(var(--th-brand)), rgb(var(--th-brand-2)))",
              }}
            >
              Iniciar sesión
            </h1>
            <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-muted">
              Accede a tu cuenta para gestionar tus verificaciones
            </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full max-w-md space-y-2 mt-4">
            {/* Usuario */}
            <div>
              <label className="mb-2 block text-xs font-bold text-content">Usuario o Email</label>
              <input
                type="text"
                placeholder="tu_usuario"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                disabled={loading}
                autoComplete="username"
                className={authInputClass}
              />
            </div>

            {/* Contraseña */}
            <div>
              <label className="mb-2 block text-xs font-bold text-content">Contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
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
            </div>

            {/* Botón enviar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 px-6 py-3 font-semibold text-white shadow-lg hover:shadow-cyan-500/50 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed transition-all transform hover:scale-105 duration-300"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Validando..." : "Iniciar sesión"}
            </button>
            </form>

            {/* Acciones secundarias */}
            <div className="mt-6 space-y-3 w-full">
            <p className="text-xs font-medium text-muted">
              ¿No tienes una cuenta?{" "}
              <a
                href="/register"
                className="font-bold text-brand underline-offset-4 transition-colors hover:underline hover:opacity-80"
              >
                Regístrate aquí
              </a>
            </p>
            <a
              href="/forgot"
              className="inline-block text-xs font-semibold text-brand underline underline-offset-4 transition-colors hover:opacity-80"
            >
              ¿Olvidaste tu contraseña?
            </a>
            </div>
          </div>
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
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgb(var(--th-surface) / 0.95), rgb(var(--th-surface) / 0.50), transparent)",
              }}
            />
          {/* Overlay sutil con mix blend */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand/25 to-brand-2/20 mix-blend-multiply dark:mix-blend-screen" />
        </div>
      </div>
    </div>
  );
}
