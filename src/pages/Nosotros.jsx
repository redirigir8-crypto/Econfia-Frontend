// src/pages/Nosotros.jsx
import { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import { FaRocket, FaEye, FaHeart, FaShieldAlt, FaBolt, FaUsers } from "react-icons/fa";

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
      transform: translateY(-30px);
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
  
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
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
  
  .animate-scale-in {
    animation: scaleIn 0.8s ease-out forwards;
  }
  
  .animation-delay-100 { animation-delay: 0.1s; opacity: 0; }
  .animation-delay-200 { animation-delay: 0.2s; opacity: 0; }
  .animation-delay-300 { animation-delay: 0.3s; opacity: 0; }
  .animation-delay-400 { animation-delay: 0.4s; opacity: 0; }
  .animation-delay-500 { animation-delay: 0.5s; opacity: 0; }
  .animation-delay-600 { animation-delay: 0.6s; opacity: 0; }
`;

if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = animationStyles;
  if (!document.head.querySelector('style[data-nosotros-animations]')) {
    styleTag.setAttribute('data-nosotros-animations', 'true');
    document.head.appendChild(styleTag);
  }
}

/* ------- UI helpers ------- */
const Chip = ({ children }) => (
  <span className="text-xs px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all cursor-default hover:scale-105">
    {children}
  </span>
);

const Stat = ({ n, l }) => (
  <div className="group rounded-2xl p-6 border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] hover:from-white/10 hover:to-white/5 hover:border-cyan-400/50 hover:shadow-[0_0_25px_rgba(34,211,238,0.2)] transition-all duration-500 cursor-pointer transform hover:scale-105">
    <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:to-blue-400 transition-all">{n}</div>
    <div className="text-white/70 mt-2 group-hover:text-white/90 transition-colors">{l}</div>
  </div>
);

function Valor({ titulo, resumen, detalle, icon }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 hover:border-cyan-400/50 hover:shadow-[0_0_25px_rgba(34,211,238,0.15)] hover:from-white/10 hover:to-white/5 transition-all duration-500 transform hover:scale-105">
      <div className="flex items-start gap-4 mb-3">
        <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xl group-hover:bg-cyan-500/30 group-hover:scale-110 transition-all flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-white group-hover:text-cyan-300 transition-colors">{titulo}</h4>
        </div>
      </div>
      
      <p className="text-white/75 group-hover:text-white/90 transition-colors leading-relaxed">
        {open ? detalle : resumen}
      </p>
      
      <button
        onClick={() => setOpen(!open)}
        className="mt-4 text-xs px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all"
      >
        {open ? "Ver menos ↑" : "Ver más ↓"}
      </button>
    </div>
  );
}

/* ------- Página con carrusel horizontal ------- */
export default function Nosotros() {
  const scrollerRef = useRef(null);
  const [page, setPage] = useState(0); // 0..2

  // Convierte el scroll vertical del mouse/trackpad en desplazamiento horizontal
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      // Si el gesto es mayormente vertical, lo usamos para mover horizontal
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollBy({ left: e.deltaY, behavior: "smooth" });
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Actualiza page al hacer scroll (para dots/flechas)
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const handler = () => {
      const w = el.clientWidth;
      const p = Math.round(el.scrollLeft / w);
      setPage(p);
    };
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, []);

  const go = (idx) => {
    const el = scrollerRef.current;
    if (!el) return;
    const w = el.clientWidth;
    el.scrollTo({ left: w * idx, behavior: "smooth" });
  };

  const next = () => go(Math.min(page + 1, 2));
  const prev = () => go(Math.max(page - 1, 0));

  return (
    <main className="min-h-[calc(100vh-64px)] pt-16 text-white overflow-hidden">
      <Header />
      {/* Contenedor horizontal a pantalla (menos header): sin overflow-y */}
      <section
        ref={scrollerRef}
        className="
          h-[calc(100vh-64px)]
          snap-x snap-mandatory
          overflow-x-auto overflow-y-hidden
          flex
          scroll-smooth
        "
      >
        {/* ===== Slide 1: Hero + Servicios ===== */}
        <div className="snap-start shrink-0 w-full h-full overflow-y-auto">
          <div className="mx-auto max-w-[1200px] px-6 py-6 md:py-8">
            <header className="grid place-items-start gap-4 animate-fade-in-down">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span className="text-cyan-300 text-sm font-medium">Conoce más sobre nosotros</span>
              </div>
              
              <h1
                className="text-[clamp(2.5rem,4vw,4rem)] font-extrabold leading-tight tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent"
                style={{ fontFamily: "poppins, sans-serif" }}
              >
                Sobre eConfia
              </h1>
              
              <p className="text-white/90 max-w-3xl text-[1.05rem] leading-relaxed">
                eConfia es una <span className="text-cyan-300 font-semibold">plataforma líder de verificación</span> y listas restrictivas que
                automatiza consultas en fuentes nacionales e internacionales para
                reducir riesgo operativo y de cumplimiento. Cumple normativa, guarda
                evidencia y genera reportes claros para <span className="text-cyan-300 font-semibold">decisiones ágiles y seguras</span>.
              </p>
            </header>

            <section className="mt-8 animate-fade-in-up animation-delay-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <FaRocket className="text-white text-xl" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">Nuestros Servicios</h2>
              </div>
              
              <p className="text-white/90 max-w-3xl mt-4 leading-relaxed">
                Ofrecemos servicios de calidad para complementar tus procesos y{" "}
                <span className="text-cyan-300 font-semibold">prevenir proactivamente irregularidades</span>{" "}
                que afecten la imagen de tu empresa. Contamos con un equipo
                multidisciplinario y metodologías de cumplimiento para que tomes
                decisiones con confianza.
              </p>

              <div className="max-w-3xl">
                <div className="flex flex-wrap gap-2.5 mt-6 justify-start items-start content-start">
                  {[
                    "Psicólogos",
                    "Criminalística",
                    "Grafología",
                    "Dactiloscopía",
                    "Ingeniería",
                    "Trabajo Social",
                    "Auditoría integral",
                    "Gestión de riesgos",
                    "Selección",
                    "SGSST",
                    "SARLAFT",
                    "Bienestar",
                  ].map((t, idx) => (
                    <div key={t} className="animate-scale-in" style={{ animationDelay: `${0.3 + idx * 0.05}s`, opacity: 0 }}>
                      <Chip>{t}</Chip>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* ===== Slide 2: Misión / Visión + Métricas ===== */}
        <div className="snap-start shrink-0 w-full h-full overflow-y-auto">
          <div className="mx-auto max-w-[1200px] px-6 py-6 md:py-8">
            {/* Misión / Visión */}
            <section className="mt-2 animate-fade-in-up">
              <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 md:p-7 shadow-[0_0_30px_rgba(34,211,238,0.1)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                  <article className="group h-full min-h-[240px] rounded-2xl p-6 border border-white/10 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 hover:border-cyan-400/50 hover:shadow-[0_0_25px_rgba(34,211,238,0.2)] transition-all duration-500 flex flex-col transform hover:scale-105">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-cyan-500/30 flex items-center justify-center group-hover:bg-cyan-500/40 transition-all">
                        <FaRocket className="text-cyan-300 text-2xl group-hover:scale-110 transition-transform" />
                      </div>
                      <h3 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">Misión</h3>
                    </div>
                    <p className="text-white/85 leading-relaxed group-hover:text-white transition-colors">
                      Proveer soluciones óptimas mediante información, verificación e
                      investigación para garantizar personal apto, idóneo y honesto. Con
                      altos estándares de confidencialidad y tecnología de última
                      generación, generamos valor de forma efectiva y proactiva.
                    </p>
                  </article>

                  <article className="group h-full min-h-[240px] rounded-2xl p-6 border border-white/10 bg-gradient-to-br from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 hover:border-purple-400/50 hover:shadow-[0_0_25px_rgba(168,85,247,0.2)] transition-all duration-500 flex flex-col transform hover:scale-105">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/30 flex items-center justify-center group-hover:bg-purple-500/40 transition-all">
                        <FaEye className="text-purple-300 text-2xl group-hover:scale-110 transition-transform" />
                      </div>
                      <h3 className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">Visión</h3>
                    </div>
                    <p className="text-white/85 leading-relaxed group-hover:text-white transition-colors">
                      Para 2030, GRUPO SOLUCIONES será referente en asesoría de
                      confiabilidad y selección, con infraestructura sólida, gestión
                      moderna orientada a valor y tecnología de punta.
                    </p>
                  </article>
                </div>
              </div>
            </section>

            {/* Métricas */}
            <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8 animate-fade-in-up animation-delay-200">
              <Stat n="150+" l="Fuentes integradas" />
              <Stat n="60s" l="Tiempo promedio por consulta" />
              <Stat n="99.9%" l="Disponibilidad" />
              <Stat n="AES-256" l="Cifrado de datos" />
            </section>
          </div>
        </div>

        {/* ===== Slide 3: Valores ===== */}
        <div className="snap-start shrink-0 w-full h-full overflow-y-auto">
          <div className="mx-auto max-w-[1200px] px-6 py-6 md:py-8">
            <section className="mt-2 pb-6">
              <div className="flex items-center gap-3 mb-6 animate-fade-in-down">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <FaHeart className="text-white text-2xl" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">Valores Corporativos</h2>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                <div className="animate-fade-in-up animation-delay-100">
                  <Valor
                    titulo="Calidad"
                    icon={<FaBolt />}
                    resumen="Ejecutamos con mejora continua en cada servicio."
                    detalle="Todas nuestras actividades se realizan bajo mejora continua, midiendo, aprendiendo y optimizando procesos para resultados predecibles."
                  />
                </div>
                <div className="animate-fade-in-up animation-delay-200">
                  <Valor
                    titulo="Confidencialidad y control"
                    icon={<FaShieldAlt />}
                    resumen="Protegemos datos y hallazgos con controles estrictos."
                    detalle="Compromiso total con la confidencialidad: controles de acceso, trazabilidad, manejo seguro de evidencias y cumplimiento de privacidad."
                  />
                </div>
                <div className="animate-fade-in-up animation-delay-300">
                  <Valor
                    titulo="Competitividad"
                    icon={<FaRocket />}
                    resumen="Calidad y eficiencia a precios competitivos."
                    detalle="Servicios y productos de calidad con eficiencia y eficacia, optimizando costos sin sacrificar el estándar de cumplimiento."
                  />
                </div>
                <div className="animate-fade-in-up animation-delay-400">
                  <Valor
                    titulo="Honestidad"
                    icon={<FaHeart />}
                    resumen="Actuamos con honradez, equidad y claridad."
                    detalle="Relaciones basadas en dignidad, transparencia y responsabilidad profesional."
                  />
                </div>
                <div className="animate-fade-in-up animation-delay-500">
                  <Valor
                    titulo="Oportunidad"
                    icon={<FaBolt />}
                    resumen="Agilidad con cumplimiento estricto."
                    detalle="Respondemos rápido y dentro del marco normativo para ajustarnos a las necesidades del cliente y del mercado."
                  />
                </div>
                <div className="animate-fade-in-up animation-delay-600">
                  <Valor
                    titulo="Servicio y satisfacción"
                    icon={<FaUsers />}
                    resumen="Atención respetuosa orientada a expectativas."
                    detalle="Escuchamos, entendemos y nos alineamos a lo que necesitas. Meta: superar expectativas con soluciones claras."
                  />
                </div>
                <div className="animate-fade-in-up animation-delay-100">
                  <Valor
                    titulo="Transparencia"
                    icon={<FaEye />}
                    resumen="Comunicación clara y actualizaciones permanentes."
                    detalle="Informamos avances y hallazgos. Evidencias y enlaces disponibles para auditoría y trazabilidad."
                  />
                </div>
                <div className="animate-fade-in-up animation-delay-200">
                  <Valor
                    titulo="Adaptabilidad"
                    icon={<FaRocket />}
                    resumen="Formación continua ante el cambio."
                    detalle="Actualizamos procesos, tecnología y habilidades del equipo para mantener y elevar la calidad del servicio."
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>

      {/* Controles (flechas + dots) */}
      <div className="pointer-events-none fixed bottom-8 left-0 right-0 flex items-center justify-center gap-3 z-50">
        <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-black/40 border border-cyan-500/30 backdrop-blur-xl px-4 py-2 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
          <button
            onClick={prev}
            className="px-4 py-2 text-sm rounded-full hover:bg-cyan-500/20 text-white hover:text-cyan-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed font-medium"
            disabled={page === 0}
          >
            ← Anterior
          </button>
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className={`transition-all duration-300 rounded-full ${
                  page === i 
                    ? "w-8 h-3 bg-gradient-to-r from-cyan-400 to-blue-500" 
                    : "w-3 h-3 bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="px-4 py-2 text-sm rounded-full hover:bg-cyan-500/20 text-white hover:text-cyan-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed font-medium"
            disabled={page === 2}
          >
            Siguiente →
          </button>
        </div>
      </div>
    </main>
  );
}
