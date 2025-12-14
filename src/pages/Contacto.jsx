// src/pages/Contacto.jsx
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import Toast from "../components/Toast";
import Header from "../components/Header";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedin, FaTwitter, FaFacebook } from "react-icons/fa";

// Estilos de animación
const animationStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeInLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes fadeInRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  .animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
  }
  
  .animate-fade-in-down {
    animation: fadeInDown 0.8s ease-out forwards;
  }
  
  .animate-fade-in-left {
    animation: fadeInLeft 0.8s ease-out forwards;
  }
  
  .animate-fade-in-right {
    animation: fadeInRight 0.8s ease-out forwards;
  }
  
  .animation-delay-100 { animation-delay: 0.1s; opacity: 0; }
  .animation-delay-200 { animation-delay: 0.2s; opacity: 0; }
  .animation-delay-300 { animation-delay: 0.3s; opacity: 0; }
  .animation-delay-400 { animation-delay: 0.4s; opacity: 0; }
`;

if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = animationStyles;
  if (!document.head.querySelector('style[data-contacto-animations]')) {
    styleTag.setAttribute('data-contacto-animations', 'true');
    document.head.appendChild(styleTag);
  }
}
/* ==== Avatar de chat moderno y elegante ==== */
function ChatAvatar({ look = "center", talking = false, className = "" }) {
  const map = {
    center: { x: 0, y: 0 },
    nombre: { x: -3, y: -3 },
    email: { x: 4, y: -2 },
    asunto: { x: 4, y: -3 },
    mensaje: { x: 0, y: 4 },
  };
  const p = map[look] || map.center;

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 160, damping: 15 }}
    >
      {/* Círculo exterior con gradiente animado */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 animate-pulse shadow-[0_0_40px_rgba(34,211,238,0.6)]" />
      
      {/* Círculo medio */}
      <div className="absolute inset-1 rounded-full bg-gradient-to-br from-gray-900 to-gray-800" />
      
      {/* Círculo interior (cara) */}
      <div className="absolute inset-3 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
        {/* Partículas decorativas */}
        <div className="absolute top-4 right-4 w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
        <div className="absolute bottom-6 left-5 w-1 h-1 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-6 left-6 w-1 h-1 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Contenedor de la cara */}
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          {/* Ojos modernos */}
          <div className="flex gap-4 mb-3">
            {/* Ojo izquierdo */}
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
              <div className="absolute inset-1 rounded-full bg-gray-900" />
              <div
                className="absolute top-1/2 left-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-cyan-300 to-blue-400 transition-transform duration-300"
                style={{ transform: `translate(calc(-50% + ${p.x}px), calc(-50% + ${p.y}px))` }}
              />
            </div>
            
            {/* Ojo derecho */}
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
              <div className="absolute inset-1 rounded-full bg-gray-900" />
              <div
                className="absolute top-1/2 left-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-cyan-300 to-blue-400 transition-transform duration-300"
                style={{ transform: `translate(calc(-50% + ${p.x}px), calc(-50% + ${p.y}px))` }}
              />
            </div>
          </div>
          
          {/* Boca moderna con onda de sonido */}
          <div className="relative">
            <div className={`h-1 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 transition-all duration-200 shadow-[0_0_10px_rgba(34,211,238,0.5)]`}
                 style={{ width: talking ? '48px' : '32px' }}
            />
            {talking && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                <div className="w-1 bg-cyan-400/50 rounded-full animate-pulse" style={{ height: '4px', animationDelay: '0s' }} />
                <div className="w-1 bg-cyan-400/50 rounded-full animate-pulse" style={{ height: '6px', animationDelay: '0.1s' }} />
                <div className="w-1 bg-cyan-400/50 rounded-full animate-pulse" style={{ height: '4px', animationDelay: '0.2s' }} />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Indicador de estado (pulso cuando habla) */}
      {talking && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
      )}
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
    <main className="min-h-screen pt-20 md:pt-24 text-white overflow-x-hidden relative">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      {toast && <Toast type={toast.type} message={toast.msg} />}
      <Header />
      
      {/* Contenido principal */}
      <section className="relative z-10 mx-auto max-w-[1200px] px-5 md:px-6 py-8 md:py-12">
        {/* Header de la página */}
        <div className="text-center mb-12 animate-fade-in-down">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-cyan-300 text-sm font-medium">Estamos aquí para ayudarte</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent mb-4">
            Conversemos
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto leading-relaxed">
            ¿Tienes preguntas sobre <span className="text-cyan-300 font-semibold">planes, integraciones o cumplimiento</span>?
            Escríbenos y un especialista te contactará pronto.
          </p>
        </div>

        <div className="grid gap-8 lg:gap-12 lg:grid-cols-[1.2fr_1fr] items-start">
          {/* IZQUIERDA: Formulario */}
          <div className="animate-fade-in-left animation-delay-100">
            <form onSubmit={onSubmit} className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 md:p-8 shadow-[0_0_30px_rgba(34,211,238,0.1)] backdrop-blur-sm">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs">1</span>
                    Nombre completo
                  </label>
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleType}
                    onFocus={() => { setLook("nombre"); speak("Escribe tu nombre"); }}
                    onBlur={() => setLook("center")}
                    required
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-cyan-400 focus:bg-white/10 transition-all text-white placeholder:text-white/40"
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-5">
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

                <div className="flex justify-center md:justify-start pt-2">
                  <button
                    disabled={loading}
                    className="group px-8 py-3.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold border-2 border-transparent hover:from-transparent hover:to-transparent hover:border-cyan-400 hover:text-cyan-400 transition-all shadow-lg hover:shadow-cyan-400/50 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <FaEnvelope />
                        Enviar mensaje
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* DERECHA: Robot + Info de contacto */}
          <div className="space-y-6 animate-fade-in-right animation-delay-200">
            {/* Card del Robot */}
            <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 md:p-8 shadow-[0_0_30px_rgba(34,211,238,0.1)] backdrop-blur-sm">
              <div className="flex flex-col items-center text-center">
                {/* Avatar moderno */}
                <ChatAvatar
                  look={look}
                  talking={talking}
                  className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 mb-4"
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
                  Soy <span className="text-cyan-300 font-bold">eBot</span>, tu asistente virtual.  
                  Sigo tu escritura en tiempo real y puedo guiarte con voz si activas el sonido. 🤖
                </p>
              </div>
            </div>

            {/* Card de información de contacto */}
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
                    <p className="text-white font-medium group-hover:text-cyan-300 transition-colors">contacto@econfia.co</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 group cursor-pointer hover:translate-x-1 transition-transform">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0 group-hover:bg-cyan-500/30 transition-all">
                    <FaPhone />
                  </div>
                  <div>
                    <p className="text-white/60 text-xs">Teléfono</p>
                    <p className="text-white font-medium group-hover:text-cyan-300 transition-colors">+57 (601) 234 5678</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 group cursor-pointer hover:translate-x-1 transition-transform">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0 group-hover:bg-cyan-500/30 transition-all">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <p className="text-white/60 text-xs">Ubicación</p>
                    <p className="text-white font-medium group-hover:text-cyan-300 transition-colors">Bogotá, Colombia</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-white/60 text-xs mb-3">Redese Sociales</p>
                <div className="flex gap-3">
                  <a href="#" className="w-10 h-10 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 flex items-center justify-center text-cyan-400 hover:text-cyan-300 transition-all hover:scale-110">
                    <FaLinkedin size={18} />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 flex items-center justify-center text-cyan-400 hover:text-cyan-300 transition-all hover:scale-110">
                    <FaTwitter size={18} />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 flex items-center justify-center text-cyan-400 hover:text-cyan-300 transition-all hover:scale-110">
                    <FaFacebook size={18} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
