// src/pages/ResetPassword.jsx
import { useMemo, useState } from "react";
import Toast from "../components/Toast";

export default function ResetPassword() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const uid = params.get("uid");
  const token = params.get("token");
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [toast, setToast] = useState(null);
  const [done, setDone] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;

  const submit = async (e) => {
    e.preventDefault();
    setToast(null);

    if (!uid || !token) {
      setToast({ type: "error", message: "Enlace inválido." });
      return;
    }
    if (pw1 !== pw2) {
      setToast({ type: "error", message: "Las contraseñas no coinciden." });
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/auth/password-reset/confirm/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ uid, token, new_password: pw1 }),
      });
      if (res.ok) {
        setDone(true);
        setToast({ type: "success", message: "¡Listo! Contraseña actualizada." });
      } else {
        const data = await res.json().catch(() => ({}));
        setToast({ type: "error", message: data?.detail || "No se pudo actualizar la contraseña." });
      }
    } catch (err) {
      setToast({ type: "error", message: "Error de conexión con el servidor" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 md:p-10">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
          sound={"/sounds/error-011-352286.mp3"}
        />
      )}

      <div className="w-[80vw] max-w-xl bg-gradient-to-br from-[#0a0f1a] to-[#1b1f3a] rounded-[28px] shadow-xl p-8 text-slate-100">
        <h1 className="text-3xl font-extrabold">Nueva contraseña</h1>
        {!uid || !token ? (
          <p className="mt-4 text-red-300">El enlace es inválido o está incompleto.</p>
        ) : done ? (
          <div className="mt-6">
            <p className="text-green-300">Contraseña actualizada correctamente.</p>
            <a href="/login" className="mt-4 inline-block text-sm text-blue-400 hover:underline">
              Ir a iniciar sesión
            </a>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={pw1}
              onChange={(e) => setPw1(e.target.value)}
              className="w-full rounded-2xl bg-white text-slate-800 placeholder:text-slate-400 px-4 py-3 shadow-inner ring-1 ring-slate-200/80 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <input
              type="password"
              placeholder="Repite la nueva contraseña"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              className="w-full rounded-2xl bg-white text-slate-800 placeholder:text-slate-400 px-4 py-3 shadow-inner ring-1 ring-slate-200/80 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-blue-500 to-blue-700 px-6 py-3 font-semibold text-white shadow-lg hover:to-blue-800 focus:outline-none"
            >
              Guardar contraseña
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
