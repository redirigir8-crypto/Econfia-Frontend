// src/pages/Pricing.jsx
import React, { useState } from "react";
import Header from "../components/Header";
import FullPageSlider from "../components/FullPageSlider";
import { FaDatabase, FaBolt, FaShieldAlt, FaHeadset } from "react-icons/fa";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

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
        "relative rounded-2xl border bg-white/5 border-white/10",
        "p-5 md:p-6 shadow-3xl transition-all duration-300",
        "hover:shadow-[0_0_28px_rgba(34,211,238,0.22)] hover:border-cyan-300/40",
        highlight ? "outline outline-1 outline-cyan-400/40" : "",
        "m-0 h-full",
      ].join(" ")}
    >
      {badge && (
        <div className="absolute -top-3 right-4 px-3 py-1 text-xs rounded-full bg-cyan-500 text-black font-semibold">
          {badge}
        </div>
      )}

      <div className="flex flex-col h-full m-0">
        {/* Logo + Título */}
        <div className="flex items-center gap-3">
          <img
            src={LOGO} // 👈 ahora sí usa la constante
            alt="Econfia Logo"
            className="w-7 h-7 object-contain"
          />

          <h3
            className="text-[clamp(1.15rem,1.6vw,1.45rem)] font-bold leading-tight m-0"
            style={{ fontFamily: "poppins, sans-serif" }}
          >
            {title}
          </h3>
        </div>

        <p className="text-gray-300 mt-1.5 m-0 text-[0.95rem]">{subtitle}</p>

        {/* Bullets */}
        <ul className="mt-4 mb-5 space-y-2.5 text-gray-200 text-[0.98rem] leading-[1.6] m-0">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-3 m-0">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0" />
              <span className="m-0">{f}</span>
            </li>
          ))}
        </ul>

        {/* Botón */}
        <button
          className="mt-3 self-center px-7 py-2.5 rounded-full bg-cyan-500 text-black border border-transparent hover:bg-transparent hover:border-white hover:text-white transition"
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
              className="text-[clamp(2rem,3.5vw,3rem)] font-bold leading-tight tracking-tight"
              style={{ fontFamily: "poppins, sans-serif" }}
            >
              Planes y <span className="text-cyan-400">Precios</span>
            </h1>

            <p className="text-gray-300 mt-2 text-[0.98rem]">
              Consultamos más de{" "}
              <span className="text-cyan-300 font-semibold">200 fuentes</span> en
              tiempo real. Reportes claros, cumplimiento normativo y tiempos de
              respuesta consistentes.
            </p>
          </div>
        </header>

        {/* Ventajas compactas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 m-0">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 shadow-3xl hover:border-cyan-300/40 hover:shadow-[0_0_22px_rgba(34,211,238,0.20)] transition">
            <div className="flex items-center gap-3">
              <FaDatabase className="text-cyan-400 text-xl" />
              <div>
                <div className="font-semibold">200+ fuentes</div>
                <div className="text-gray-300 text-sm">Listas restrictivas y más.</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3 shadow-3xl hover:border-cyan-300/40 hover:shadow-[0_0_22px_rgba(34,211,238,0.20)] transition">
            <div className="flex items-center gap-3">
              <FaBolt className="text-cyan-400 text-xl" />
              <div>
                <div className="font-semibold">Tiempo real</div>
                <div className="text-gray-300 text-sm">Resultados en segundos.</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3 shadow-3xl hover:border-cyan-300/40 hover:shadow-[0_0_22px_rgba(34,211,238,0.20)] transition">
            <div className="flex items-center gap-3">
              <FaShieldAlt className="text-cyan-400 text-xl" />
              <div>
                <div className="font-semibold">Cumplimiento</div>
                <div className="text-gray-300 text-sm">Soporte a normativas.</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3 shadow-3xl hover:border-cyan-300/40 hover:shadow-[0_0_22px_rgba(34,211,238,0.20)] transition">
            <div className="flex items-center gap-3">
              <FaHeadset className="text-cyan-400 text-xl" />
              <div>
                <div className="font-semibold">Soporte</div>
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
