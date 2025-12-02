// src/components/Login.jsx
import React, { useState, useEffect } from "react";
import Toast from "../components/Toast";
import loginVideo from "../assets/login.mp4";
import { Navigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function Login() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

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
    <div className="min-h-screen flex items-center justify-center p-6 md:p-10 relative">
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
      // Solo reproducir si existe el sonido
      const soundPath = toast.type === "error"
        ? "/sounds/error-011-352286.mp3"
        : undefined; // aquí podrías poner otro sonido si quieres

      if (soundPath) {
        const audio = new Audio(soundPath);
        audio.play().catch((err) => {
          console.warn("No se pudo reproducir el sonido:", err);
        });
      }
    }}
  />
)}

      <div className="relative w-[80vw] h-[80vh] bg-gradient-to-br from-[#0a0f1a] to-[#1b1f3a] rounded-[28px] shadow-xl flex overflow-hidden">
        {/* Lado izquierdo: formulario */}
        <div className="w-1/2 flex flex-col justify-center items-start px-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-100">
            Iniciar sesión
          </h1>
          <p className="mt-3 text-lg text-slate-100">
            Ingresa tus credenciales para continuar
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4 w-full max-w-sm">
            {/* Usuario */}
            <input
              type="text"
              placeholder="Usuario"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              disabled={loading}
              className="w-full rounded-2xl bg-white text-slate-800 placeholder:text-slate-400 px-4 py-3 shadow-inner ring-1 ring-slate-200/80 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-70"
              autoComplete="username"
            />

            {/* Contraseña con ojito */}
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full rounded-2xl bg-white text-slate-800 placeholder:text-slate-400 px-4 py-3 pr-12 shadow-inner ring-1 ring-slate-200/80 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-70"
                autoComplete="current-password"
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

            {/* Botón enviar */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-blue-500 to-blue-700 px-6 py-3 font-semibold text-white shadow-lg hover:to-blue-800 focus:outline-none disabled:opacity-70"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Iniciar sesión
            </button>
          </form>

          {/* Acciones secundarias */}
          <div className="mt-8 flex flex-col gap-2">
            <p className="text-sm text-slate-100">
              ¿No tienes una cuenta?{" "}
              <a
                href="/register"
                className="font-semibold text-blue-400 hover:text-blue-300 underline-offset-4 hover:underline"
              >
                Regístrate
              </a>
            </p>
            <a
              href="/forgot"
              className="text-sm text-blue-300 hover:text-blue-200 underline underline-offset-4 w-fit"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
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
