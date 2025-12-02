// src/components/ContratistaView.jsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function ContratistaView({
  imageSrc = "/img/imgcon.jpg",
  imageAlt = "Herramienta para contratistas",
  videoSrc = "/videos/econfia-presentacion.mp4",
  title = "Documentación de contratistas al alcance de tu mano con Econfia Contratista",
  ctaText = "Empezar ahora",
  onCta = () => {},
  overlayText = "Herramienta para que los contratistas tengan a su alcance la documentación necesaria, organizada y lista para compartir.",
}) {
  return (
    <section className="relative w-full min-h-screen overflow-hidde">
      {/* Panel izquierdo: imagen full height ~30% width en desktop */}
      <div className="group absolute inset-y-0 left-0 w-full lg:w-[30%]">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="h-full w-full object-cover"
          draggable={false}
        />

        {/* Overlay con degradado oscuro + texto al hover (siempre visible en móvil) */}
        <div
          className="
            pointer-events-none absolute inset-0
            bg-gradient-to-r from-black/80 via-black/60 to-transparent
            opacity-100 lg:opacity-0 lg:group-hover:opacity-100
            transition-opacity duration-300
          "
        />
        <div
          className="
            pointer-events-none absolute inset-x-0 bottom-0 lg:inset-y-0 lg:left-0 lg:right-auto
            p-6 lg:p-8 flex items-end lg:items-center
          "
        >
          <p
            className="
              max-w-sm text-sm md:text-base text-white/90 leading-relaxed
              lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300
            "
          >
            {overlayText}
          </p>
        </div>
      </div>

      {/* Columna derecha: contenido desplazado por el panel izquierdo en desktop */}
      <div className="relative z-10 lg:ml-[30%]">
        <div className="max-w-6xl mx-auto px-6 py-10 md:py-14">
          {/* Video arriba */}
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/40">
            <video
              src={videoSrc}
              className="w-full h-[260px] md:h-[380px] object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          </div>

          {/* Título */}
          <h2
            className="mt-6 text-white text-3xl md:text-5xl font-semibold leading-tight"
            style={{ fontFamily: "poppins, ui-sans-serif, system-ui" }}
          >
            {title}
          </h2>

          {/* Botón CTA */}
          <Link
                to="/profile"
          >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCta}
            className="
              mt-5 inline-flex items-center gap-2
              px-7 py-3 rounded-full bg-white text-slate-900 font-semibold
              border border-white/20 shadow-lg
              hover:bg-transparent hover:text-white transition-colors
            "
            aria-label={ctaText}
          >
            {ctaText}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M13.172 12 8.222 7.05l1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" />
            </svg>
          </motion.button>
          </Link>
        </div>
      </div>

      {/* Sutil overlay global para contraste del fondo */}
      <div className="pointer-events-none absolute inset-0 bg-black/10" />
    </section>
  );
}
