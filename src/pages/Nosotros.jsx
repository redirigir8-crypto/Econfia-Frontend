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
  <span className="cursor-default rounded-full border border-brand/30 bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand transition-all hover:scale-105 hover:border-brand/50 hover:bg-brand/15">
    {children}
  </span>
);

const Stat = ({ n, l }) => (
  <div className="group cursor-pointer rounded-2xl border border-line/15 bg-surface/85 p-6 shadow-[0_16px_42px_rgba(15,23,42,0.10)] backdrop-blur-xl transition-all duration-500 hover:scale-105 hover:border-brand/45 hover:bg-surface hover:shadow-cyan-500/15">
    <div className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-4xl font-black text-transparent transition-all group-hover:from-cyan-300 group-hover:to-blue-400">{n}</div>
    <div className="mt-2 font-medium text-muted transition-colors group-hover:text-content">{l}</div>
  </div>
);

function Valor({ titulo, resumen, detalle, icon }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="group rounded-2xl border border-line/15 bg-surface/85 p-6 shadow-[0_16px_42px_rgba(15,23,42,0.10)] backdrop-blur-xl transition-all duration-500 hover:scale-105 hover:border-brand/45 hover:bg-surface hover:shadow-cyan-500/15">
      <div className="flex items-start gap-4 mb-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand/15 text-xl text-brand transition-all group-hover:scale-110 group-hover:bg-brand/25">
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-black text-content transition-colors group-hover:text-brand">{titulo}</h4>
        </div>
      </div>
      
      <p className="leading-relaxed text-muted transition-colors group-hover:text-content">
        {open ? detalle : resumen}
      </p>
      
      <button
        onClick={() => setOpen(!open)}
        className="mt-4 rounded-full border border-brand/30 bg-brand/10 px-4 py-2 text-xs font-bold text-brand transition-all hover:border-brand/50 hover:bg-brand/15"
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
    <main className="min-h-[calc(100vh-64px)] overflow-hidden pt-16 text-content">
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
              <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-2 shadow-[0_10px_28px_rgba(15,23,42,0.08)] backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span className="text-sm font-bold text-brand">Conoce más sobre nosotros</span>
              </div>
              
              <h1
                className="bg-clip-text text-[clamp(2.5rem,4vw,4rem)] font-extrabold leading-tight tracking-tight text-transparent"
                style={{
                  fontFamily: "poppins, sans-serif",
                  backgroundImage:
                    "linear-gradient(90deg, rgb(var(--th-content)), rgb(var(--th-brand)), rgb(var(--th-brand-2)))",
                }}
              >
                Sobre eConfia
              </h1>
              
              <p className="max-w-3xl text-[1.05rem] font-medium leading-relaxed text-muted">
                eConfia es una <span className="font-black text-brand">plataforma líder de verificación</span> y listas restrictivas que
                automatiza consultas en fuentes nacionales e internacionales para
                reducir riesgo operativo y de cumplimiento. Cumple normativa, guarda
                evidencia y genera reportes claros para <span className="font-black text-brand">decisiones ágiles y seguras</span>.
              </p>
            </header>

            <section className="mt-8 animate-fade-in-up animation-delay-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/20">
                  <FaRocket className="text-white text-xl" />
                </div>
                <h2
                  className="bg-clip-text text-3xl font-black text-transparent md:text-4xl"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, rgb(var(--th-content)), rgb(var(--th-brand)))",
                  }}
                >
                  Nuestros Servicios
                </h2>
              </div>
              
              <p className="mt-4 max-w-3xl font-medium leading-relaxed text-muted">
                Ofrecemos servicios de calidad para complementar tus procesos y{" "}
                <span className="font-black text-brand">prevenir proactivamente irregularidades</span>{" "}
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
              <div className="rounded-3xl border border-line/15 bg-surface/80 p-6 shadow-[0_22px_65px_rgba(15,23,42,0.12)] backdrop-blur-xl md:p-7">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                  <article className="group flex h-full min-h-[240px] flex-col rounded-2xl border border-brand/20 bg-brand/10 p-6 transition-all duration-500 hover:scale-105 hover:border-brand/45 hover:bg-brand/15 hover:shadow-cyan-500/15">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/20 transition-all group-hover:bg-brand/30">
                        <FaRocket className="text-cyan-300 text-2xl group-hover:scale-110 transition-transform" />
                      </div>
                      <h3 className="text-2xl font-black text-content transition-colors group-hover:text-brand">Misión</h3>
                    </div>
                    <p className="leading-relaxed text-muted transition-colors group-hover:text-content">
                      Proveer soluciones óptimas mediante información, verificación e
                      investigación para garantizar personal apto, idóneo y honesto. Con
                      altos estándares de confidencialidad y tecnología de última
                      generación, generamos valor de forma efectiva y proactiva.
                    </p>
                  </article>

                  <article className="group flex h-full min-h-[240px] flex-col rounded-2xl border border-violet-400/25 bg-violet-500/10 p-6 transition-all duration-500 hover:scale-105 hover:border-violet-400/45 hover:bg-violet-500/15 hover:shadow-violet-500/15">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/20 transition-all group-hover:bg-violet-500/30">
                        <FaEye className="text-purple-300 text-2xl group-hover:scale-110 transition-transform" />
                      </div>
                      <h3 className="text-2xl font-black text-content transition-colors group-hover:text-violet-300">Visión</h3>
                    </div>
                    <p className="leading-relaxed text-muted transition-colors group-hover:text-content">
                      Para 2030, eConfia será referente en asesoría de
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
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/20">
                  <FaHeart className="text-white text-2xl" />
                </div>
                <h2
                  className="bg-clip-text text-3xl font-black text-transparent md:text-4xl"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, rgb(var(--th-content)), rgb(var(--th-brand)))",
                  }}
                >
                  Valores Corporativos
                </h2>
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
        <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-line/20 bg-surface/90 px-4 py-2 shadow-[0_16px_42px_rgba(15,23,42,0.16)] backdrop-blur-xl">
          <button
            onClick={prev}
            className="rounded-full px-4 py-2 text-sm font-bold text-muted transition-all hover:bg-brand/10 hover:text-brand disabled:cursor-not-allowed disabled:opacity-30"
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
                    : "w-3 h-3 bg-muted/35 hover:bg-brand/45"
                }`}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="rounded-full px-4 py-2 text-sm font-bold text-content transition-all hover:bg-brand/10 hover:text-brand disabled:cursor-not-allowed disabled:opacity-30"
            disabled={page === 2}
          >
            Siguiente →
          </button>
        </div>
      </div>
    </main>
  );
}
