// src/components/VerticalAutoCarousel.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";

export default function VerticalAutoCarousel({
  images = [],
  speed = 30,           // segundos por ciclo
  itemClass = "h-28 md:h-36 lg:h-40", // alto de cada miniatura
  rounded = "rounded-xl",
}) {
  const controls = useAnimation();
  const [isHover, setIsHover] = useState(false);
  const wrapRef = useRef(null);

  // Duplicamos para loop continuo
  const loopImages = useMemo(() => [...images, ...images], [images]);

  async function startLoop() {
    // Reinicia desde 0 y baja hasta -50% (porque duplicamos el contenido)
    await controls.set({ y: "0%" });
    await controls.start({
      y: "-50%",
      transition: { duration: speed, ease: "linear", repeat: Infinity },
    });
  }

  useEffect(() => { startLoop(); /* eslint-disable-next-line */ }, [speed, images.length]);

  return (
    <div
      ref={wrapRef}
      className="relative w-full overflow-hidden"
      // altura del carrusel
      style={{ height: "520px", WebkitMaskImage: "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)", maskImage: "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)" }}
      onMouseEnter={() => { setIsHover(true); controls.stop(); }}
      onMouseLeave={() => { setIsHover(false); startLoop(); }}
    >
      {/* Sutiles fades (por si el navegador no aplica mask-image) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent z-10" />

      <motion.div animate={controls} className="flex flex-col">
        {loopImages.map((img, i) => (
          <div
            key={i}
            className={`w-full ${itemClass} overflow-hidden shadow-lg bg-white/5`}
          >
            {/* Usa <img> para rendimiento; si necesitas <video> alterna aquí */}
            <img
              src={img.src}
              alt={img.alt ?? `carousel-${i}`}
              className="w-full h-full object-cover"
              loading="lazy"
              draggable={false}
            />
          </div>
        ))}
      </motion.div>

      {/* Indicador de pausa al hover (opcional) */}
      {isHover && (
        <div className="absolute right-3 top-3 z-20 text-[11px] px-2 py-1 rounded-full bg-black/60 text-white border border-white/10">
          Pausado
        </div>
      )}
    </div>
  );
}
