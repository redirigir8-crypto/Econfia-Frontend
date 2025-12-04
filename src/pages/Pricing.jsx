// src/pages/Pricing.jsx
import React, { useState } from "react";
import Header from "../components/Header";
import FullPageSlider from "../components/FullPageSlider";
import { FaDatabase, FaBolt, FaShieldAlt, FaHeadset } from "react-icons/fa";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// Agregar estilos de animación
const animationStyles = `
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
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in-down {
    animation: fadeInDown 0.8s ease-out forwards;
  }
  
  .animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
  }
  
  .animation-delay-100 { animation-delay: 0.1s; opacity: 0; }
  .animation-delay-200 { animation-delay: 0.2s; opacity: 0; }
`;

if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = animationStyles;
  if (!document.head.querySelector('style[data-pricing-animations]')) {
    styleTag.setAttribute('data-pricing-animations', 'true');
    document.head.appendChild(styleTag);
  }
}

const LOGO = "/img/logo-econfia-1.png";
/* --- Tarjeta de plan --- */
/* --- Tarjeta de plan --- */
const PlanCard = ({
  title,
  subtitle,
  badge,
  features = [],
  cta = "Empezar",
  highlight = false,
}) => {
  return (
    <div
      className={[
        "relative rounded-2xl border bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10",
        "p-6 md:p-7 shadow-3xl transition-all duration-500",
        "hover:shadow-[0_0_35px_rgba(34,211,238,0.3)] hover:border-cyan-300/50 hover:scale-105 hover:from-white/10 hover:to-white/5",
        highlight ? "outline outline-2 outline-cyan-400/50 shadow-[0_0_25px_rgba(34,211,238,0.25)]" : "",
        "m-0 h-full group cursor-pointer",
      ].join(" ")}
    >
      {badge && (
        <div className="absolute -top-3 right-4 px-4 py-1.5 text-xs rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold shadow-lg animate-pulse">
          {badge}
        </div>
      )}

      <div className="flex flex-col h-full m-0">
        {/* Logo + Título */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/30 transition-all group-hover:scale-110">
            <img
              src={LOGO}
              alt="Econfia Logo"
              className="w-6 h-6 object-contain"
            />
          </div>

          <h3
            className="text-[clamp(1.25rem,1.7vw,1.55rem)] font-bold leading-tight m-0 group-hover:text-cyan-300 transition-colors"
            style={{ fontFamily: "poppins, sans-serif" }}
          >
            {title}
          </h3>
        </div>

        <p className="text-gray-300 group-hover:text-gray-200 mt-1.5 m-0 text-[1rem] leading-relaxed transition-colors">{subtitle}</p>

        {/* Bullets */}
        <ul className="mt-5 mb-6 space-y-3 text-gray-200 text-[1rem] leading-[1.65] m-0 flex-grow">
          {features.map((f, idx) => (
            <li key={f} className="flex items-start gap-3 m-0 group/item hover:translate-x-1 transition-transform" style={{ animationDelay: `${idx * 50}ms` }}>
              <span className="w-5 h-5 mt-0.5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shrink-0 flex items-center justify-center group-hover/item:scale-125 transition-transform">
                <span className="text-white text-xs font-bold">✓</span>
              </span>
              <span className="m-0 group-hover/item:text-white transition-colors">{f}</span>
            </li>
          ))}
        </ul>

        {/* Botón */}
        <button
          className="mt-auto self-center px-8 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold border-2 border-transparent hover:from-transparent hover:to-transparent hover:border-cyan-400 hover:text-cyan-400 transition-all shadow-lg hover:shadow-cyan-400/50 transform hover:scale-105"
          style={{ fontFamily: "poppins, sans-serif" }}
        >
          {cta}
        </button>
      </div>
    </div>
  );
};


/* --- Datos de planes (4 en total) --- */
const PLANS = [
  {
    title: "E-Unity",
    subtitle: "Paga solo lo que usas. Ideal para validaciones puntuales.",
    features: [
      "1 validación = 1 consulta",
      "Acceso a + 100 fuentes",
      "Resultados en segundos",
      "Reporte en PDF",
    ],
    cta: "Comprar consulta",
    highlight: false,
  },
  {
    title: "E-ssential",
    subtitle: "Uso mensual ilimitado para equipos y empresas.",
    badge: "Popular",
    features: [
      "Consultas ilimitadas",
      "Acceso a +100 fuentes",
      "Reportes y auditoría",
      "Soporte prioritario",
    ],
    cta: "Empezar ahora",
    highlight: true,
  },
  {
    title: "E-nhance",
    subtitle: "Para equipos en crecimiento con necesidades regulares.",
    features: [
      "Hasta 5.000 consultas / mes",
      "Acceso a +200 fuentes",
      "Soporte estándar",
    ],
    cta: "Solicitar demo",
    highlight: false,
  },
  {
    title: "E-nterprise",
    subtitle: "Alto volumen, seguridad avanzada y soporte dedicado.",
    badge: "Nuevo",
    features: [
      "Consultas y usuarios a medida",
      "SLAs y auditoría avanzada",
      "API dedicada y SSO",
      "Soporte premium 24/7",
    ],
    cta: "Hablar con ventas",
    highlight: true,
  },
];

/* --- Slide de precios con navegación --- */
function PricingSlide() {
  const perPage = 2;
  const [page, setPage] = useState(0);
  const [dir, setDir] = useState(1); // 1→ derecha, -1→ izquierda
  const totalPages = Math.ceil(PLANS.length / perPage);

  const sliceStart = page * perPage;
  const current = PLANS.slice(sliceStart, sliceStart + perPage);

  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  const goPrev = () => {
    if (!canPrev) return;
    setDir(-1);
    setPage((p) => p - 1);
  };
  const goNext = () => {
    if (!canNext) return;
    setDir(1);
    setPage((p) => p + 1);
  };

  return (
    <section className="w-screen h-full text-white flex-1 flex justify-center">
      <style>{`.pricing, .pricing * { margin: 0 !important; }`}</style>

      <div
        className="
          pricing mx-auto max-w-[1200px] px-6
          h-[calc(100vh-80px)]
          grid grid-rows-[auto_auto_1fr]
          gap-5 pt-24 pb-4 overflow-visible
        "
      >
        {/* Título + copy */}
        <header className="m-0 grid place-items-center">
          <div className="w-full max-w-[880px] text-center">
            <h1
              className="text-[clamp(2rem,3.5vw,3rem)] font-bold leading-tight tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent animate-fade-in-down"
              style={{ fontFamily: "poppins, sans-serif" }}
            >
              Elige el plan perfecto para ti
            </h1>

            <p className="text-gray-300 mt-4 text-[1.05rem] leading-relaxed animate-fade-in-up animation-delay-100">
              Accede a más de{" "}
              <span className="text-cyan-300 font-semibold">200 fuentes oficiales</span> en
              tiempo real. Reportes profesionales, cumplimiento garantizado y 
              <span className="text-cyan-300 font-semibold"> resultados instantáneos</span>.
            </p>
          </div>
        </header>

        {/* Ventajas compactas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 m-0 animate-fade-in-up animation-delay-200">
          <div className="group rounded-xl border border-white/10 bg-white/5 p-3 shadow-3xl hover:border-cyan-300/40 hover:shadow-[0_0_22px_rgba(34,211,238,0.20)] hover:bg-white/10 transition-all cursor-pointer transform hover:scale-105">
            <div className="flex items-center gap-3">
              <FaDatabase className="text-cyan-400 text-xl group-hover:text-cyan-300 transition-colors" />
              <div>
                <div className="font-semibold group-hover:text-cyan-300 transition-colors">200+ fuentes</div>
                <div className="text-gray-300 text-sm">Listas restrictivas y más.</div>
              </div>
            </div>
          </div>

          <div className="group rounded-xl border border-white/10 bg-white/5 p-3 shadow-3xl hover:border-cyan-300/40 hover:shadow-[0_0_22px_rgba(34,211,238,0.20)] hover:bg-white/10 transition-all cursor-pointer transform hover:scale-105">
            <div className="flex items-center gap-3">
              <FaBolt className="text-cyan-400 text-xl group-hover:text-cyan-300 transition-colors" />
              <div>
                <div className="font-semibold group-hover:text-cyan-300 transition-colors">Tiempo real</div>
                <div className="text-gray-300 text-sm">Resultados en segundos.</div>
              </div>
            </div>
          </div>

          <div className="group rounded-xl border border-white/10 bg-white/5 p-3 shadow-3xl hover:border-cyan-300/40 hover:shadow-[0_0_22px_rgba(34,211,238,0.20)] hover:bg-white/10 transition-all cursor-pointer transform hover:scale-105">
            <div className="flex items-center gap-3">
              <FaShieldAlt className="text-cyan-400 text-xl group-hover:text-cyan-300 transition-colors" />
              <div>
                <div className="font-semibold group-hover:text-cyan-300 transition-colors">Cumplimiento</div>
                <div className="text-gray-300 text-sm">Soporte a normativas.</div>
              </div>
            </div>
          </div>

          <div className="group rounded-xl border border-white/10 bg-white/5 p-3 shadow-3xl hover:border-cyan-300/40 hover:shadow-[0_0_22px_rgba(34,211,238,0.20)] hover:bg-white/10 transition-all cursor-pointer transform hover:scale-105">
            <div className="flex items-center gap-3">
              <FaHeadset className="text-cyan-400 text-xl group-hover:text-cyan-300 transition-colors" />
              <div>
                <div className="font-semibold group-hover:text-cyan-300 transition-colors">Soporte</div>
                <div className="text-gray-300 text-sm">Acompañamiento experto.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Planes + flechas */}
          <div className="relative min-h-0 overflow-visible">
            {/* Flecha izquierda */}
            <button
              onClick={goPrev}
              disabled={!canPrev}
              className={[
                "hidden md:flex absolute -left-12 lg:-left-16 top-1/2 -translate-y-1/2",
                "z-20 items-center justify-center h-11 w-11 rounded-full border",
                "backdrop-blur bg-white/5 border-white/15",
                "hover:border-cyan-300/40 hover:bg-white/10",
                !canPrev ? "opacity-30 cursor-not-allowed" : "",
              ].join(" ")}
            >
              <ChevronLeft className="text-white" size={18} />
            </button>

            {/* Flecha derecha */}
            <button
              onClick={goNext}
              disabled={!canNext}
              className={[
                "hidden md:flex absolute -right-12 lg:-right-16 top-1/2 -translate-y-1/2",
                "z-20 items-center justify-center h-11 w-11 rounded-full border",
                "backdrop-blur bg-white/5 border-white/15",
                "hover:border-cyan-300/40 hover:bg-white/10",
                !canNext ? "opacity-30 cursor-not-allowed" : "",
              ].join(" ")}
            >
              <ChevronRight className="text-white" size={18} />
            </button>

          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.div
              key={page}
              custom={dir}
              initial={{ opacity: 0, x: dir === 1 ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir === 1 ? -20 : 20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch content-start m-0"
            >
              {current.map((p) => (
                <PlanCard key={p.title} {...p} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export default function Pricing() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="">
        <FullPageSlider>
          <PricingSlide />
        </FullPageSlider>
      </div>
    </div>
  );
}
