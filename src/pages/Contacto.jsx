// src/pages/Contacto.jsx
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import Toast from "../components/Toast";
import Header from "../components/Header"
/* ==== Robot Avatar (compacto + responsive) ==== */
function Robot({ look = "center", talking = false, className = "" }) {
  const map = {
    center: { x: 0, y: 0 },
    nombre: { x: -5, y: -4 },
    email: { x: 6, y: -1 },
    asunto: { x: 6, y: -4 },
    mensaje: { x: 0, y: 6 },
  };
  const p = map[look] || map.center;

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ scale: 0.96 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 140, damping: 12 }}
    >
      {/* casco */}
      <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-cyan-400/25 via-blue-500/20 to-fuchsia-500/20 border border-cyan-400/50 backdrop-blur" />
      {/* cara */}
      <div className="absolute inset-2 rounded-[16px] bg-white" />
      {/* antena */}
      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-1.5 h-3.5 bg-gradient-to-b from-fuchsia-400 to-cyan-400 rounded-full" />
      <div className="absolute -top-[12px] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,.75)]" />
      {/* ojos */}
      <div className="absolute left-[28%] top-[45%] w-[1.4rem] h-[1.4rem] rounded-full bg-white border border-gray-300 grid place-items-center">
        <div
          className="w-[0.55rem] h-[0.55rem] rounded-full bg-gray-900 transition-transform"
          style={{ transform: `translate(${p.x}px, ${p.y}px)` }}
        />
      </div>
      <div className="absolute right-[28%] top-[45%] w-[1.4rem] h-[1.4rem] rounded-full bg-white border border-gray-300 grid place-items-center">
        <div
          className="w-[0.55rem] h-[0.55rem] rounded-full bg-gray-900 transition-transform"
          style={{ transform: `translate(${p.x}px, ${p.y}px)` }}
        />
      </div>
      {/* boca */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-4 w-[3rem] rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 transition-all"
        style={{ height: talking ? 12 : 6 }}
      />
    </motion.div>
  );
}

export default function Contacto() {
  const API_URL = process.env.REACT_APP_API_URL;

  const [form, setForm] = useState({ nombre: "", email: "", asunto: "", mensaje: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Robot
  const [look, setLook] = useState("center");
  const [talking, setTalking] = useState(false);
  const typingTimer = useRef(null);

  // Sonido
  const [soundOn, setSoundOn] = useState(false);
  const audioCtxRef = useRef(null);

  const ensureAudio = () => {
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtxRef.current = new Ctx();
    }
    return audioCtxRef.current;
  };

  const blip = () => {
    if (!soundOn) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "square";
    o.frequency.value = 520;
    g.gain.value = 0.06;
    o.connect(g).connect(ctx.destination);
    o.start();
    setTimeout(() => { o.stop(); o.disconnect(); }, 60);
  };

  const speak = (text) => {
    if (!soundOn) return;
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "es-ES"; u.rate = 1.05; u.pitch = 1;
    synth.speak(u);
  };

  const handleType = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setTalking(true);
    blip();
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setTalking(false), 180);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (API_URL) {
        await fetch(`${API_URL}api/contacto/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        console.log("Contacto DEMO:", form);
      }
      setToast({ type: "success", msg: "¡Mensaje enviado! Te responderemos pronto." });
      speak("¡Gracias! Recibimos tu mensaje.");
      setForm({ nombre: "", email: "", asunto: "", mensaje: "" });
    } catch {
      setToast({ type: "error", msg: "Hubo un error al enviar. Intenta de nuevo." });
      speak("Algo salió mal. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 3500);
    }
  };

  return (
    <main className="min-h-[calc(100vh-64px)] pt-[88px] md:pt-[96px] text-white overflow-x-hidden">
      {toast && <Toast type={toast.type} message={toast.msg} />}
      <Header />
      {/* Contenido centrado con columnas: izquierda formulario, derecha robot */}
      <section className="mx-auto max-w-[1100px] px-5 md:px-6 py-6 md:py-8">
        <div className="grid gap-10 md:gap-12 md:grid-cols-[minmax(0,1fr)_360px] items-start">
          {/* IZQUIERDA: Título + Form */}
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-center md:text-left">
              Hablemos <span className="text-cyan-400">hoy</span>
            </h1>
            <p className="text-white/80 max-w-xl mt-2 text-center md:text-left mx-auto md:mx-0">
              ¿Tienes preguntas sobre planes, integraciones o cumplimiento?
              Escríbenos y un especialista te contactará.
            </p>

            <form onSubmit={onSubmit} className="mt-7 space-y-4 max-w-xl">
              <div>
                <label className="block text-sm text-white/70 mb-1">Nombre</label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleType}
                  onFocus={() => { setLook("nombre"); speak("Escribe tu nombre"); }}
                  onBlur={() => setLook("center")}
                  required
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 outline-none focus:border-cyan-400"
                  placeholder="Tu nombre"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/70 mb-1">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleType}
                    onFocus={() => { setLook("email"); speak("Tu correo"); }}
                    onBlur={() => setLook("center")}
                    required
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 outline-none focus:border-cyan-400"
                    placeholder="tu@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Asunto</label>
                  <input
                    name="asunto"
                    value={form.asunto}
                    onChange={handleType}
                    onFocus={() => { setLook("asunto"); speak("Asunto"); }}
                    onBlur={() => setLook("center")}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 outline-none focus:border-cyan-400"
                    placeholder="Consulta sobre eConfia"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-1">Mensaje</label>
                <textarea
                  name="mensaje"
                  value={form.mensaje}
                  onChange={handleType}
                  onFocus={() => { setLook("mensaje"); speak("Cuéntanos tu caso"); }}
                  onBlur={() => setLook("center")}
                  rows={4}
                  required
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 outline-none focus:border-cyan-400"
                  placeholder="Cuéntanos tu caso…"
                />
              </div>

              <div className="flex justify-center md:justify-start">
                <button
                  disabled={loading}
                  className="rounded-full bg-cyan-500/20 border border-cyan-400 px-7 py-2.5 hover:bg-cyan-500/30 disabled:opacity-60"
                >
                  {loading ? "Enviando…" : "Enviar mensaje"}
                </button>
              </div>
            </form>
          </div>

          {/* DERECHA: Robot dentro de la "tarjeta de información" */}
          <aside className="rounded-2xl border border-white/10 bg-white/5 p-6 w-full max-w-[360px] mx-auto overflow-hidden">
            <div className="flex flex-col items-center text-center">
              {/* Robot compacto */}
              <Robot
                look={look}
                talking={talking}
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28"
              />
              <button
                onClick={() => { setSoundOn((s) => !s); if (!soundOn) ensureAudio(); }}
                className={`mt-3 text-xs px-3 py-1 rounded-full border ${
                  soundOn
                    ? "border-cyan-400 text-cyan-300 bg-cyan-500/10"
                    : "border-white/20 text-white/70 hover:border-cyan-400"
                }`}
                title="Activar/Desactivar sonido"
              >
                {soundOn ? "🔊 Sonido ON" : "🔇 Sonido OFF"}
              </button>

              <p className="text-white/75 text-sm mt-4">
                Soy <span className="text-cyan-300 font-semibold">eBot</span>.  
                Sigo tu escritura y puedo guiarte con voz si activas el sonido.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
