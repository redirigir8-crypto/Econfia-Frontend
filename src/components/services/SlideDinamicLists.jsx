// SlideDinamicLists.jsx
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import VerticalAutoCarousel from "../VerticalAutoCarousel";
import { Link } from "react-router-dom";
import { Volume2, VolumeX } from "lucide-react";

export default function SlideDinamicLists({ onMore }) {
  // Ejemplo de imágenes (cámbialas por tus rutas reales)
  const rightImages = [
    { src: "/img/carrusel/img1.png", alt: "Screenshot 01" },
    { src: "/img/carrusel/img2.png", alt: "Screenshot 02" },
    { src: "/img/carrusel/img3.png", alt: "Screenshot 03" },
    { src: "/img/carrusel/img4.png", alt: "Screenshot 04" },
    { src: "/img/carrusel/img5.png", alt: "Screenshot 05" },
  ];

  // --- Control de audio del video ---
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    // iOS/Android requieren interacción para desmutear; este click cuenta como gesto.
    v.muted = !v.muted;
    // Ajusta un volumen cómodo al desmutear
    if (!v.muted && v.volume === 0) v.volume = 0.6;
    setIsMuted(v.muted);
  };

  return (
    <section className="relative w-full min-h-[90vh] md:min-h-[100vh] overflow-hidden pt-12">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Wrapper con 'zoom' en pantallas pequeñas */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="transform-gpu origin-top md:scale-100 scale-[0.8]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Columna izquierda: video + título + botón */}
            <div className="flex flex-col gap-6">
              <h2
                className="text-white text-3xl md:text-5xl font-semibold leading-tight"
                style={{ fontFamily: "poppins, sans-serif" }}
              >
                Consulta de listas dinámicas de adversos Econfia.
              </h2>

              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <video
                  ref={videoRef}
                  src="/videos/inicio-page.mp4"
                  className="w-full h-[260px] md:h-[360px] object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
                {/* Botón Mute/Unmute */}
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted ? "Activar sonido" : "Silenciar video"}
                  className="absolute top-3 right-3 inline-flex items-center justify-center rounded-full bg-black/60 backdrop-blur px-3 py-3 border border-white/20 hover:bg-black/70 transition"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>

              <Link
                to="/profile"
                className="self-start px-7 py-3 rounded-full bg-white text-slate-900 font-semibold border border-white/20 shadow-lg
                           hover:bg-transparent hover:text-white transition-colors"
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onMore}
                >
                  Iniciar ahora
                </motion.button>
              </Link>
            </div>

            {/* Columna derecha: carrusel vertical infinito */}
            <div className="flex w-full">
              <VerticalAutoCarousel
                images={rightImages}
                speed={30}                       // ajusta la velocidad (segundos por ciclo)
                itemClass="h-28 md:h-36 xl:h-44" // tamaño de cada tarjeta
                rounded="rounded-2xl"            // radio de borde
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
