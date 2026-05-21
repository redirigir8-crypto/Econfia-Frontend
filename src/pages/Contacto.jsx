// src/pages/Contacto.jsx
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import Toast from "../components/Toast";
import Header from "../components/Header";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedin, FaTwitter, FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";

// Estilos de animación personalizados
const animationStyles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeInLeft {
    from { opacity: 0; transform: translateX(-30px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes fadeInRight {
    from { opacity: 0; transform: translateX(30px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .animate-fade-in-up    { animation: fadeInUp    0.6s ease both; }
  .animate-fade-in-left  { animation: fadeInLeft  0.6s ease both; }
  .animate-fade-in-right { animation: fadeInRight 0.6s ease both; }
  .animation-delay-100   { animation-delay: 0.1s; }
  .animation-delay-200   { animation-delay: 0.2s; }
  .animation-delay-300   { animation-delay: 0.3s; }
`;

function AnimStyles() {
  return <style>{animationStyles}</style>;
}

/* ==== Avatar mascota oso polar ==== */
function ChatAvatar({ talking = false, className = "" }) {

  return (
    <motion.div
      className={`relative flex items-end justify-center ${className}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 160, damping: 15 }}
      style={{ height: "220px", width: "180px" }}
    >
      <style>{`
        @keyframes oso-float {
          0%,100% { transform: translateY(0px)   rotate(-1.5deg); }
          50%      { transform: translateY(-12px) rotate(1.5deg);  }
        }
        @keyframes oso-talk {
          0%,100% { transform: translateY(0px)  rotate(-1deg)  scale(1);    }
          50%      { transform: translateY(-5px) rotate(0.5deg) scale(1.03); }
        }
        @keyframes oso-glow-pulse {
          0%,100% { opacity: 0.45; transform: scale(1);    }
          50%      { opacity: 0.85; transform: scale(1.08); }
        }
        @keyframes oso-shadow {
          0%,100% { transform: scaleX(1)   translateY(0);   opacity: 0.35; }
          50%      { transform: scaleX(0.8) translateY(4px); opacity: 0.2;  }
        }
        @keyframes oso-mouth-open {
          0%,100% { transform: scaleY(1);   }
          50%      { transform: scaleY(1.7); }
        }
        .oso-svg        { animation: oso-float 3.2s ease-in-out infinite; transform-origin: center bottom; }
        .oso-svg-talk   { animation: oso-talk  0.45s ease-in-out infinite; transform-origin: center bottom; }
        .oso-glow       { animation: oso-glow-pulse 2.8s ease-in-out infinite; }
        .oso-shadow-el  { animation: oso-shadow 3.2s ease-in-out infinite; transform-origin: center; }
        .oso-mouth-anim { animation: oso-mouth-open 0.35s ease-in-out infinite; transform-origin: 64px 94px; }
      `}</style>

      {/* Glow detrás */}
      <div
        className="oso-glow absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 60%, rgba(34,211,238,0.22) 0%, rgba(99,102,241,0.1) 50%, transparent 75%)",
        }}
      />

      {/* SVG inline — permite controlar ojos y boca con React */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 128 128"
        className={talking ? "oso-svg-talk" : "oso-svg"}
        style={{
          width: "100%",
          height: "100%",
          filter: talking
            ? "drop-shadow(0 0 18px rgba(34,211,238,0.75)) drop-shadow(0 0 6px rgba(99,102,241,0.5))"
            : "drop-shadow(0 0 10px rgba(34,211,238,0.45)) drop-shadow(0 0 3px rgba(99,102,241,0.3))",
        }}
      >
        <defs>
          <linearGradient id="ctFur" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#dbeafe" />
          </linearGradient>
          <linearGradient id="ctShadow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0ea5e9" stopOpacity="0.25" />
            <stop offset="1" stopColor="#1d4ed8" stopOpacity="0.18" />
          </linearGradient>
        </defs>

        {/* fondo glow */}
        <circle cx="64" cy="64" r="58" fill="url(#ctShadow)" />
        {/* cabeza */}
        <circle cx="64" cy="68" r="44" fill="url(#ctFur)" />
        {/* orejas */}
        <circle cx="32" cy="40" r="14" fill="url(#ctFur)" />
        <circle cx="96" cy="40" r="14" fill="url(#ctFur)" />
        <circle cx="32" cy="40" r="7"  fill="#c7d2fe" opacity="0.45" />
        <circle cx="96" cy="40" r="7"  fill="#c7d2fe" opacity="0.45" />
        {/* hocico */}
        <ellipse cx="64" cy="84" rx="26" ry="20" fill="#eef2ff" />
        {/* nariz */}
        <path d="M64 74c-7 0-12 5-12 10 0 5 5 9 12 9s12-4 12-9c0-5-5-10-12-10z" fill="#0f172a" />
        {/* mejillas */}
        <circle cx="38" cy="84" r="9" fill="#38bdf8" opacity="0.10" />
        <circle cx="90" cy="84" r="9" fill="#38bdf8" opacity="0.10" />

        {/* ojos */}
        <circle cx="48" cy="66" r="5" fill="#0f172a" />
        <circle cx="80" cy="66" r="5" fill="#0f172a" />
        {/* reflejo blanco estático */}
        <circle cx="46" cy="64" r="2" fill="#ffffff" opacity="0.9" />
        <circle cx="78" cy="64" r="2" fill="#ffffff" opacity="0.9" />

        {/* boca: sonrisa o abierta al hablar */}
        {talking ? (
          <>
            <ellipse cx="64" cy="94" rx="7" ry="4" fill="#0f172a" className="oso-mouth-anim" />
            <path
              d="M52 103 Q58 109 64 103 Q70 97 76 103"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.7"
            >
              <animate attributeName="opacity" values="0.7;0.1;0.7" dur="0.4s" repeatCount="indefinite" />
            </path>
          </>
        ) : (
          <path
            d="M56 92c3 5 9 8 8 8s5-3 8-8"
            fill="none"
            stroke="#0f172a"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
        )}
      </svg>

      {/* Sombra suelo */}
      <div
        className="oso-shadow-el absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: "65%",
          height: "12px",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(34,211,238,0.35) 0%, transparent 70%)",
          filter: "blur(4px)",
        }}
      />

      {/* Punto verde hablando */}
      {talking && (
        <span
          className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.9)]"
          style={{ animation: "oso-glow-pulse 0.5s ease-in-out infinite" }}
        />
      )}
    </motion.div>
  );
}

export default function Contacto() {
  let API_URL = process.env.REACT_APP_API_URL;
  if (!API_URL) {
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      API_URL = "http://localhost:8000/";
    } else {
      API_URL = "https://www.econfia.co/";
    }
  }
  if (!API_URL.endsWith("/")) API_URL += "/";

  const [form, setForm] = useState({ nombre: "", email: "", asunto: "", mensaje: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Avatar
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
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 600 + Math.random() * 200;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch (_) {}
  };

  const speak = (text) => {
    if (!soundOn) return;
    if ("speechSynthesis" in window) {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "es-CO";
      utter.rate = 1.1;
      utter.volume = 0.7;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    }
  };

  const handleType = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setTalking(true);
    blip();
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setTalking(false), 800);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}api/contacto/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setToast({ message: "¡Mensaje enviado! Te contactaremos pronto.", type: "success" });
        setForm({ nombre: "", email: "", asunto: "", mensaje: "" });
        speak("Mensaje enviado con éxito");
      } else {
        setToast({ message: "Hubo un error al enviar. Intenta de nuevo.", type: "error" });
      }
    } catch (_) {
      setToast({ message: "No se pudo conectar con el servidor.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#020b18] text-white overflow-x-hidden">
      <AnimStyles />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <Header />

      <section className="relative pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Decorado de fondo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/[0.03] rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Encabezado */}
          <div className="text-center mb-16 animate-fade-in-up">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-cyan-100 to-blue-200 bg-clip-text text-transparent">
                Cómo nos
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
                contactamos
              </span>
            </h1>
            <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              ¿Tienes preguntas sobre{" "}
              <span className="text-cyan-300 font-semibold">planes, integraciones o cumplimiento</span>?
              {" "}Escríbenos y un especialista te contactará pronto.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

            {/* IZQUIERDA: Formulario */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 md:p-10 shadow-[0_0_40px_rgba(34,211,238,0.08)] backdrop-blur-sm animate-fade-in-left">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
                  ✉
                </span>
                Envíanos un mensaje
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs">1</span>
                    Nombre completo
                  </label>
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleType}
                    onFocus={() => { setLook("nombre"); speak("Tu nombre"); }}
                    onBlur={() => setLook("center")}
                    required
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-cyan-400 focus:bg-white/10 transition-all text-white placeholder:text-white/40"
                    placeholder="Tu nombre completo"
                  />
                </div>

                {/* Email + Asunto */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs">2</span>
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleType}
                      onFocus={() => { setLook("email"); speak("Tu correo"); }}
                      onBlur={() => setLook("center")}
                      required
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-cyan-400 focus:bg-white/10 transition-all text-white placeholder:text-white/40"
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs">3</span>
                      Asunto
                    </label>
                    <input
                      name="asunto"
                      value={form.asunto}
                      onChange={handleType}
                      onFocus={() => { setLook("asunto"); speak("Asunto"); }}
                      onBlur={() => setLook("center")}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-cyan-400 focus:bg-white/10 transition-all text-white placeholder:text-white/40"
                      placeholder="Consulta sobre eConfia"
                    />
                  </div>
                </div>

                {/* Mensaje */}
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs">4</span>
                    Mensaje
                  </label>
                  <textarea
                    name="mensaje"
                    value={form.mensaje}
                    onChange={handleType}
                    onFocus={() => { setLook("mensaje"); speak("Cuéntanos tu caso"); }}
                    onBlur={() => setLook("center")}
                    rows={5}
                    required
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-cyan-400 focus:bg-white/10 transition-all text-white placeholder:text-white/40 resize-none"
                    placeholder="Cuéntanos más sobre tu consulta..."
                  />
                </div>

                {/* Botón enviar */}
                <div className="flex justify-center md:justify-start pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="relative group px-8 py-4 rounded-xl font-bold text-white overflow-hidden transition-all hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                    style={{
                      background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
                      boxShadow: "0 0 30px rgba(6,182,212,0.4)",
                    }}
                  >
                    <span className="relative flex items-center gap-2">
                      {loading ? (
                        <>
                          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Enviando...
                        </>
                      ) : (
                        <>✉ Enviar mensaje →</>
                      )}
                    </span>
                  </button>
                </div>
              </form>
            </div>

            {/* DERECHA: Avatar + Info de contacto */}
            <div className="space-y-6 animate-fade-in-right animation-delay-200">

              {/* Card del oso */}
              <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 md:p-8 shadow-[0_0_30px_rgba(34,211,238,0.1)] backdrop-blur-sm">
                <div className="flex flex-col items-center text-center">
                  <ChatAvatar
                    talking={talking}
                    className="mb-4"
                  />

                  <button
                    onClick={() => { setSoundOn((s) => !s); if (!soundOn) ensureAudio(); }}
                    className={`text-sm px-5 py-2 rounded-full border transition-all ${
                      soundOn
                        ? "border-cyan-400 text-cyan-300 bg-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                        : "border-white/20 text-white/70 hover:border-cyan-400 hover:bg-cyan-500/10"
                    }`}
                    title="Activar/Desactivar sonido"
                  >
                    {soundOn ? "🔊 Sonido activado" : "🔇 Activar sonido"}
                  </button>

                  <p className="text-white/80 text-sm mt-5 leading-relaxed">
                    Soy <span className="text-cyan-300 font-bold">eBot</span>, tu asistente virtual.{" "}
                    Sigo tu escritura en tiempo real y puedo guiarte con voz si activas el sonido. 🤖
                  </p>
                </div>
              </div>

              {/* Card de información */}
              <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5 p-6 shadow-[0_0_25px_rgba(168,85,247,0.1)] backdrop-blur-sm">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">📞</span>
                  Información de contacto
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 group cursor-pointer hover:translate-x-1 transition-transform">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0 group-hover:bg-cyan-500/30 transition-all">
                      <FaEnvelope />
                    </div>
                    <div>
                      <p className="text-white/60 text-xs">Email</p>
                      <p className="text-white font-medium group-hover:text-cyan-300 transition-colors">
                        coordinaciondesarrollo@solutionsgroupcol.com
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 group cursor-pointer hover:translate-x-1 transition-transform">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0 group-hover:bg-cyan-500/30 transition-all">
                      <FaPhone />
                    </div>
                    <div>
                      <p className="text-white/60 text-xs">Teléfono</p>
                      <p className="text-white font-medium group-hover:text-cyan-300 transition-colors">
                        +57 305 422 6582
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 group cursor-pointer hover:translate-x-1 transition-transform">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0 group-hover:bg-cyan-500/30 transition-all">
                      <FaMapMarkerAlt />
                    </div>
                    <div>
                      <p className="text-white/60 text-xs">Ubicación</p>
                      <p className="text-white font-medium group-hover:text-cyan-300 transition-colors">
                        Bogotá, Colombia
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-white/60 text-xs mb-3">Redes Sociales</p>
                  <div className="flex gap-3">
                    <a href="#" target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 flex items-center justify-center text-cyan-400 hover:text-cyan-300 transition-all hover:scale-110">
                      <FaLinkedin size={18} />
                    </a>
                    <a href="#" target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 flex items-center justify-center text-cyan-400 hover:text-cyan-300 transition-all hover:scale-110">
                      <FaTwitter size={18} />
                    </a>
                    <a
                      href="https://www.facebook.com/profile.php?id=61589746611008&locale=es_LA"
                      target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 flex items-center justify-center text-blue-400 hover:text-blue-300 transition-all hover:scale-110">
                      <FaFacebook size={18} />
                    </a>
                    <a
                      href="https://www.instagram.com/econfia_oficial"
                      target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 flex items-center justify-center text-pink-400 hover:text-pink-300 transition-all hover:scale-110">
                      <FaInstagram size={18} />
                    </a>
                    <a
                      href="https://wa.me/573054226582"
                      target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-green-500/20 hover:bg-green-500/30 flex items-center justify-center text-green-400 hover:text-green-300 transition-all hover:scale-110">
                      <FaWhatsapp size={18} />
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
