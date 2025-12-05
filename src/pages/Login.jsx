// src/components/Login.jsx
import React, { useState, useEffect } from "react";
import Toast from "../components/Toast";
import loginVideo from "../assets/login.mp4";
import { Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";

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
  if (token) {
    return <Navigate to="/profile" replace />;
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
        setToast({
          type: "success",
          message: `Bienvenido ${data.user.username}!`,
        });
        // Navegación dura para refrescar estado global (si aplica)
        window.location.href = "/profile";
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
    <div className="min-h-screen flex items-center justify-center p-6 md:p-10 relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Botón retorno */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-cyan-400/50 transition-all group backdrop-blur-sm"
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
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
    playSound={() => {
      const soundPath = toast.type === "error"
        ? "/sounds/error-011-352286.mp3"
        : undefined;

      if (soundPath) {
        const audio = new Audio(soundPath);
        audio.play().catch((err) => {
          console.warn("No se pudo reproducir el sonido:", err);
        });
      }
    }}
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
                <span className="text-cyan-300 text-xs font-medium">Bienvenido de vuelta</span>
              </div>
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-white via-cyan-100 to-blue-300 bg-clip-text text-transparent leading-tight tracking-tight">
              Iniciar sesión
            </h1>
            <p className="mt-2 text-sm text-white/70 leading-relaxed max-w-md">
              Accede a tu cuenta para gestionar tus verificaciones
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-2 mt-4">
            {/* Usuario */}
            <div>
              <label className="text-xs font-semibold text-white/70 mb-2 block">Usuario o Email</label>
              <input
                type="text"
                placeholder="tu_usuario"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                disabled={loading}
                autoComplete="username"
                className="w-full rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-white/40 px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 focus:shadow-lg focus:shadow-cyan-500/10 transition-all duration-300 backdrop-blur-sm"
              />
            </div>

            {/* Contraseña */}
            <div>
              <label className="text-xs font-semibold text-white/70 mb-2 block">Contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
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
            <p className="text-xs text-white/70">
              ¿No tienes una cuenta?{" "}
              <a
                href="/register"
                className="font-medium text-cyan-400 hover:text-cyan-300 underline-offset-4 hover:underline transition-colors"
              >
                Regístrate aquí
              </a>
            </p>
            <a
              href="/forgot"
              className="text-xs text-cyan-300/80 hover:text-cyan-200 underline underline-offset-4 inline-block transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </a>
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
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/40 to-transparent pointer-events-none" />
          {/* Overlay sutil con mix blend */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 to-blue-900/20 mix-blend-screen pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
