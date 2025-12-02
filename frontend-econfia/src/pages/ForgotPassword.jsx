// src/pages/ForgotPassword.jsx
import { useState } from "react";
import Toast from "../components/Toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [toast, setToast] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL;

  const submit = async (e) => {
    e.preventDefault();
    setToast(null);
    try {
      const res = await fetch(`${API_URL}/api/auth/password-reset/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Siempre 200 aunque el correo no exista: UX consistente
      if (res.ok) {
        setSent(true);
        setToast({ type: "success", message: "Si el correo existe, te enviamos instrucciones." });
      } else {
        setToast({ type: "error", message: "No se pudo procesar la solicitud." });
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
        <h1 className="text-3xl font-extrabold">Recuperar contraseña</h1>
        <p className="mt-2 text-slate-200/80">
          Escribe tu correo y te enviaremos un enlace para restablecerla.
        </p>

        {sent ? (
          <div className="mt-6 text-green-300">
            Revisa tu correo. Si no lo ves, mira en Spam.
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <input
              type="email"
              placeholder="Tu correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl bg-white text-slate-800 placeholder:text-slate-400 px-4 py-3 shadow-inner ring-1 ring-slate-200/80 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-blue-500 to-blue-700 px-6 py-3 font-semibold text-white shadow-lg hover:to-blue-800 focus:outline-none"
            >
              Enviar enlace
            </button>
          </form>
        )}

        <div className="mt-6">
          <a href="/login" className="text-sm text-blue-400 hover:underline">Volver a iniciar sesión</a>
        </div>
      </div>
    </div>
  );
}
