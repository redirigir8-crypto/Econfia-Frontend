  // src/components/SectionAbout.jsx  (o donde lo tengas)
  import React, { useEffect, useRef, useState } from "react";
  import justicia from "../assets/justicia.jpg";
  // Importa hasta 4 más y descomenta cuando existan los archivos
  import justicia2 from "../assets/justicia2.jpg";
  import justicia3 from "../assets/justicia3.jpg";
  import justicia4 from "../assets/justicia4.jpg";
  import justicia5 from "../assets/justicia5.jpg";

  /* ---------- Tarjeta con slideshow aleatorio al hover ---------- */
  function HoverGalleryCard({
    images = [],
    widthRem = 20,          // ancho base
    maxVw = 55,             // ancho máximo relativo a viewport
    changeEveryMs = 1500,    // velocidad del crossfade al hover
    ratio = "2 / 3",        // relación de aspecto vertical
  }) {
    const safeImages = images.length ? images.slice(0, 5) : [];
    const [active, setActive] = useState(0);
    const timerRef = useRef(null);

    // Pre-carga
    useEffect(() => {
      safeImages.forEach((src) => {
        const i = new Image();
        i.src = src;
      });
    }, [safeImages]);

    const startShuffle = () => {
      if (safeImages.length < 2) return;
      stopShuffle();
      timerRef.current = setInterval(() => {
        setActive((curr) => {
          let next = curr;
          while (next === curr) {
            next = Math.floor(Math.random() * safeImages.length);
          }
          return next;
        });
      }, changeEveryMs);
    };

    const stopShuffle = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      // Opcional: volver a la primera al salir
      setActive(0);
    };

    return (
      <>
        <style>{`.econfia-card, .econfia-card * { margin: 0 !important; }`}</style>

      <div
        className="econfia-card relative mx-auto"   // ← mx-auto asegura centrado horizontal
        onMouseEnter={startShuffle}
        onMouseLeave={stopShuffle}
        style={{
          width: `${widthRem}rem`,
          maxWidth: `${maxVw}vw`,
          aspectRatio: ratio,
          borderRadius: "1rem",
          overflow: "hidden",
          boxShadow: "0 12px 40px rgba(0,0,0,.35)",
        }}
      >
          {/* Pila de imágenes con crossfade */}
          {safeImages.map((src, i) => (
            <img
              key={i}
              src={src}
              alt="Galería ECONFIA"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                i === active ? "opacity-100" : "opacity-0"
              }`}
              draggable={false}
            />
          ))}

          {/* Borde sutil al hover */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-0 transition-all duration-300 hover:ring-2 hover:ring-cyan-300/35" />
        </div>
      </>
    );
  }

  /* ------------------------ Sección About ------------------------ */
  export default function SectionAbout() {
    // agrega aquí hasta 5 imágenes
    const galleryImgs = [
      justicia,
      justicia2,
      justicia3,
      justicia4,
      justicia5,
    ];

    return (
      <section className="w-screen text-white">
        <div className="
            mx-auto max-w-[1200px] px-6
            min-h-[calc(100vh-80px)]
            grid grid-cols-1 lg:grid-cols-12 gap-8
            items-center pt-12 pb-14
          ">
          {/* Columna izquierda: texto */}
          <div className="lg:col-span-7">
            <div className="w-full max-w-[40rem] rounded-2xl p-6 lg:p-8 backdrop-blur-[2px] shadow-3xl">
              <h2
                className="text-[clamp(1.9rem,3.8vw,2.8rem)] font-bold leading-tight"
                style={{ fontFamily: "poppins, sans-serif" }}
              >
                ¿Qué es <span className="text-cyan-400">ECONFIA</span>?
              </h2>

              <div
                className="mt-3 space-y-3 text-[clamp(1rem,1.05vw,1.05rem)] text-gray-200 leading-relaxed"
                style={{ fontFamily: "poppins, sans-serif" }}
              >
                <p>
                  Es una prueba a la medida con alta confiabilidad que analiza cada
                  solicitante o aspirante. Como herramienta de detección en línea,
                  realiza búsquedas en tiempo real y evalúa comportamientos
                  contraproducentes o riesgosos en segundos.
                </p>
              </div>

              <div className="mt-4">
                <h3
                  className="text-[clamp(1.15rem,2.2vw,1.5rem)] font-semibold mb-2"
                  style={{ fontFamily: "poppins, sans-serif" }}
                >
                  ¿Ha tenido problemas con…?
                </h3>

                <ul
                  className="
                    grid grid-cols-2 gap-x-10 gap-y-3
                    text-gray-200 text-[0.98rem] leading-snug
                    text-left justify-items-start m-0
                  "
                >
                  {[
                    "Conflictos",
                    "Antecedentes",
                    "Anotaciones",
                    "Uso no autorizado de recursos",
                    "Listas restrictivas",
                    "Información adversa",
                    "Abuso de confianza",
                    "Consumo de drogas",
                    "Comisión de delitos",
                    "Falsedad de documentos",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 m-0">
                      <span className="w-2 h-2 mt-[6px] rounded-full bg-cyan-400 shrink-0" />
                      <span className="m-0">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

            {/* Columna derecha: tarjeta centrada */}
            <div className="lg:col-span-5 self-center">
              <div className="w-full flex items-center justify-center py-14 lg:pt-20">
                {/* Wrapper con glow */}
                <div className="relative group">
                  {/* Glow detrás */}
                  <div
                    className="
                      absolute -z-10 pointer-events-none
                      -inset-6 rounded-[24px]
                      blur-3xl opacity-80 group-hover:opacity-100
                      transition duration-500
                      mix-blend-screen
                    "
                    style={{
                      background:
                        "radial-gradient(65% 90% at 50% 50%, rgba(255, 255, 255, 0.9) 0%, rgba(255,255,255,.35) 45%, rgba(255,255,255,0) 70%)",
                    }}
                  />

                  {/* Tu card */}
                  <HoverGalleryCard images={galleryImgs} widthRem={20} maxVw={20} />
                </div>
              </div>
            </div>
        </div>
      </section>
    );
  }
