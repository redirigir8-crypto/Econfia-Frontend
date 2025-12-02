// src/views/Ayuda.jsx
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HelpCircle, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

/** Zonas seguras (arriba mínimo; abajo amplio por taskbar) */
const SAFE_TOP = "pt-2 md:pt-3"; // antes: pt-3 md:pt-4
const SAFE_BOTTOM = "pb-64";

const faqs = [
  { q: "¿Qué es ECONFIA?", a: "Herramienta de validación contra listas restrictivas y fuentes OSINT/privadas, con reportes claros y trazables." },
  { q: "¿Cuántas fuentes consultan?", a: "Más de 200 fuentes en tiempo real: sanciones, PEP, listas restrictivas, medios internacionales y más." },
  { q: "¿Cuánto tardan los resultados?", a: "Generalmente segundos; puede variar levemente según la disponibilidad de ciertas fuentes." },
  { q: "¿Qué datos mínimos necesito para una validación?", a: "Nombre completo y, si es posible, un identificador (documento, país, fecha de nacimiento o razón social)." },
  { q: "¿Puedo exportar el reporte?", a: "Sí. Dependiendo del plan, puedes exportar en PDF o JSON." },
  { q: "¿Diferencia entre plan por consulta e ilimitado?", a: "Por consulta: pagas por validación. Ilimitado: consultas ilimitadas para equipos/empresas al mes." },
  { q: "¿Qué hago si veo una coincidencia que no aplica?", a: "Márcala como no relevante y contáctanos si deseas ajustar criterios de búsqueda o scoring." },
  { q: "¿Cómo contacto a soporte?", a: "Desde el menú ‘Contacto’, o vía soporte@econfia.com indicando el ID de la consulta." },
];

function FaqItem({ q, a, idx }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={[
        "w-full",
        "relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-[2px]",
        open ? "ring-1 ring-cyan-400/30 shadow-[0_0_20px_rgba(34,211,238,0.18)]" : "shadow-3xl",
        "overflow-hidden",
      ].join(" ")}
    >
      {/* Cabecera */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="relative w-full h-16 md:h-[72px] pl-5 pr-14 flex items-center justify-start text-left select-none"
      >
        <div className="flex items-center gap-4">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300">
            {idx + 1}
          </span>
          <span className="font-semibold leading-snug text-white">{q}</span>
        </div>

        <ChevronDown
          className={`absolute right-6 top-1/2 -translate-y-1/2 size-5 transition-transform ${
            open ? "rotate-180 text-cyan-300" : "text-gray-300"
          }`}
        />
      </button>

      {/* Contenido con alto máximo + scroll interno */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="px-5 pb-4 text-gray-300 text-[0.95rem] leading-relaxed overflow-hidden"
          >
            <div className="max-h-40 md:max-h-48 overflow-y-auto pr-1">{a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Ayuda() {
  const perPage = 4;
  const totalPages = Math.ceil(faqs.length / perPage); // = 2
  const [page, setPage] = useState(0);
  const [dir, setDir] = useState(1); // 1 -> derecha, -1 -> izquierda

  const start = page * perPage;
  const items = faqs.slice(start, start + perPage);

  const next = () => {
    if (page < totalPages - 1) {
      setDir(1);
      setPage((p) => p + 1);
    }
  };
  const prev = () => {
    if (page > 0) {
      setDir(-1);
      setPage((p) => p - 1);
    }
  };

  return (
<section className="w-screen h-[80vh] text-white flex items-center justify-center overflow-hidden p-12">
  <div
    className={[
      "ayuda max-w-[1200px] w-full px-6",
      "grid grid-rows-[auto_auto_1fr] gap-6", // separaciones un poco más grandes
      SAFE_TOP,
      SAFE_BOTTOM,
    ].join(" ")}
  >
    {/* Encabezado */}
    <div className="grid grid-cols-1 md:grid-cols-2 items-center text-center md:text-left gap-4">
      <p className="text-gray-300">
        Resuelve dudas frecuentes. Toca una pregunta para ver la respuesta.
      </p>
      <div className="flex items-center justify-center md:justify-end gap-3">
        <HelpCircle className="text-cyan-400" size={28} />
        <h1
          className="text-[clamp(1.8rem,2.8vw,2.4rem)] font-bold leading-tight"
          style={{ fontFamily: "poppins, sans-serif" }}
        >
          Centro de ayuda
        </h1>
      </div>
    </div>

    {/* Controles de paginación */}
    <div className="flex items-center justify-center gap-3">
      <button
        onClick={prev}
        disabled={page === 0}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${
          page === 0
            ? "border-white/10 text-white/30 cursor-not-allowed"
            : "border-white/20 text-white hover:border-cyan-300/50"
        }`}
      >
        <ChevronLeft className="size-4" /> Anterior
      </button>

      <div className="flex items-center gap-2">
        {Array.from({ length: totalPages }).map((_, i) => (
          <span
            key={i}
            className={["h-2.5 w-2.5 rounded-full", i === page ? "bg-cyan-400" : "bg-white/25"].join(" ")}
          />
        ))}
      </div>

      <button
        onClick={next}
        disabled={page === totalPages - 1}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${
          page === totalPages - 1
            ? "border-white/10 text-white/30 cursor-not-allowed"
            : "border-white/20 text-white hover:border-cyan-300/50"
        }`}
      >
        Siguiente <ChevronRight className="size-4" />
      </button>
    </div>

    {/* Contenido FAQ */}
    <div className="relative min-h-0 overflow-visible flex justify-center">
      <AnimatePresence mode="wait" initial={false} custom={dir}>
        <motion.div
          key={page}
          custom={dir}
          initial={{ x: dir === 1 ? 40 : -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: dir === 1 ? -40 : 40, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="
            grid grid-cols-1 lg:grid-cols-2 grid-rows-2
            gap-5 w-full justify-items-center items-start
          "
        >
          {items.map((item, i) => (
            <FaqItem key={item.q} q={item.q} a={item.a} idx={start + i} />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  </div>
</section>

  );
}
