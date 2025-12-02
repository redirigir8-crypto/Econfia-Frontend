import React, { useEffect, useMemo, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow } from "swiper/modules";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search, FileText, LogOut, User, HelpCircle, Briefcase, Sparkles,
} from "lucide-react";
import "swiper/css";
import "swiper/css/effect-coverflow";

const menuItems = [
  { path: "/logout",     icon: <LogOut size={40} strokeWidth={1.5} />,   label: "Cerrar Sesión" },

  { path: "/consulta",             icon: <Search size={40} strokeWidth={1.5} />,    label: "E-Core Full" },
  { path: "/consulta-contratista", icon: <Briefcase size={40} strokeWidth={1.5} />, label: "E-unity Contratista" },
  { path: "/consulta-medida",      icon: <Sparkles size={40} strokeWidth={1.5} />,  label: "E-ssential" },
  { path: "/profile",    icon: <User size={40} strokeWidth={1.5} />,     label: "Perfil" },
  { path: "/resultados", icon: <FileText size={40} strokeWidth={1.5} />, label: "Resultados" },
  { path: "/ayuda",      icon: <HelpCircle size={40} strokeWidth={1.5} />,label: "Ayuda" },
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
    <div className="fixed bottom-0 left-0 right-0 w-[94%] max-w-3xl mx-auto mb-10 z-50">
      <Swiper
        modules={[EffectCoverflow]}
        effect="coverflow"
        grabCursor
        centeredSlides
        slidesPerView={3}
        loop={false}                              // índices estables
        initialSlide={currentIndex}               // arranca ya alineado a la URL actual
        onSwiper={(sw) => (swiperRef.current = sw)}
        onSlideChange={(sw) => {
          // Si el slide cambió por nuestra propia sincronización, lo ignoramos
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
                className="flex flex-col items-center justify-center transition-all duration-300 cursor-pointer"
              >
                <div className={`transition-all duration-300 ${
                  isActive ? "scale-125 text-white" : "scale-90 text-white/40 blur-[1px]"
                }`}>
                  {item.icon}
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
