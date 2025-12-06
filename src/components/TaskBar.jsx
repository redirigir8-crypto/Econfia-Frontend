import React, { useEffect, useMemo, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow } from "swiper/modules";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search, FileText, LogOut, User, HelpCircle, HardHat, Target, ArrowUpCircle,
} from "lucide-react";
import "swiper/css";
import "swiper/css/effect-coverflow";

const menuItems = [
  { path: "/logout",     icon: <LogOut size={28} strokeWidth={1.5} />,   label: "Cerrar Sesión" },

  { path: "/consulta",             icon: <Search size={28} strokeWidth={1.5} />,    label: "E-Core Full" },
  { path: "/consulta-contratista", icon: <HardHat size={28} strokeWidth={1.5} />, label: "E-unity Contratista" },
  { path: "/consulta-medida",      icon: <Target size={28} strokeWidth={1.5} />,  label: "E-ssential" },
  { path: "/profile",    icon: <User size={28} strokeWidth={1.5} />,     label: "Perfil" },
  { path: "/resultados", icon: <FileText size={28} strokeWidth={1.5} />, label: "Resultados" },
  { path: "/ayuda",      icon: <HelpCircle size={28} strokeWidth={1.5} />,label: "Ayuda" },
];

export default function Taskbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const swiperRef = useRef(null);

  // Flag para evitar loop: cuando sincronizamos manualmente, ignoramos el próximo slideChange
  const ignoreNextChange = useRef(false);

  // índice según la ruta actual (soporta subrutas /profile/ajustes)
  const currentIndex = useMemo(() => {
    const i = menuItems.findIndex(m => pathname === m.path || pathname.startsWith(m.path + "/"));
    return i >= 0 ? i : 0;
  }, [pathname]);

  // Sincroniza el carrusel cuando cambia la URL
  useEffect(() => {
    const sw = swiperRef.current;
    if (!sw) return;
    if (sw.activeIndex !== currentIndex) {
      ignoreNextChange.current = true;           // evitamos navegar por este cambio programático
      sw.slideTo(currentIndex, 0);               // sin animación
    }
  }, [currentIndex]);

  return (
    <div className="fixed bottom-0 left-0 right-0 w-[94%] max-w-3xl mx-auto mb-4 z-50">
      <style>{`
        @keyframes orbitRotation {
          from {
            transform: rotateY(0deg) translateZ(20px);
          }
          to {
            transform: rotateY(360deg) translateZ(20px);
          }
        }
        .icon-rotate-active {
          animation: orbitRotation 2.5s linear infinite;
          transform-style: preserve-3d;
        }
        .icon-rotate-active::before {
          animation: orbitRotation 6s linear infinite;
        }
        .icon-sphere-reflection {
          position: relative;
        }
        .icon-sphere-reflection::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: inherit;
          display: inherit;
          align-items: inherit;
          justify-content: inherit;
          color: inherit;
          transform: translateZ(-20px);
          opacity: 0.8;
          pointer-events: none;
        }
      `}</style>
      <Swiper
        modules={[EffectCoverflow]}
        effect="coverflow"
        grabCursor
        centeredSlides
        slidesPerView={3}
        loop={false}
        initialSlide={currentIndex}
        onSwiper={(sw) => (swiperRef.current = sw)}
        onSlideChange={(sw) => {
          if (ignoreNextChange.current) {
            ignoreNextChange.current = false;
            return;
          }
          const item = menuItems[sw.activeIndex];
          if (item && item.path !== pathname) {
            navigate(item.path, { replace: true });
          }
        }}
        coverflowEffect={{
          rotate: 0, stretch: 0, depth: 200, modifier: 1.2, slideShadows: false,
        }}
        className="mySwiper"
      >
        {menuItems.map((item) => (
          <SwiperSlide key={item.path}>
            {({ isActive }) => (
              <div
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center justify-center transition-all duration-300 cursor-pointer pt-2"
              >
                <div className="relative inline-block icon-sphere-container">
                  <div 
                    className={`icon-sphere-reflection relative z-10 transition-all duration-300 ${
                      isActive ? "icon-rotate-active scale-125 text-white" : "scale-90 text-white/40 blur-[1px]"
                    }`}
                    style={{
                      perspective: "800px",
                      transformStyle: "preserve-3d"
                    }}
                  >
                    {item.icon}
                  </div>
                </div>
                <span className={`mt-2 text-sm transition-all duration-300 ${
                  isActive ? "text-white" : "text-white/40 blur-[1px]"
                }`}>
                  {item.label}
                </span>
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
