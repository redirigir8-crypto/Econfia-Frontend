import React, { useEffect, useMemo, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow } from "swiper/modules";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search, FileText, LogOut, User, HelpCircle, HardHat, Target, ArrowUpCircle,
} from "lucide-react";
import { Fuel } from "lucide-react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import HardHatIcon from '../assets/icons8-contratista-64 (1).png';
import UserCogIcon from '../assets/icons8-lista-de-verificación-64.png';
import UserBaseIcon from '../assets/icons8-usuario-48 (1).png';
import AjustesIcon from '../assets/icons8-ajustes-de-usuarioesse-64 (2).png';
import IconFask from '../assets/icon-fask.png';

export default function Taskbar() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user"));
      setUser(u);
      console.log("[TaskBar] user:", u);
      if (u) {
        console.log("[TaskBar] is_staff:", u.is_staff, "is_superuser:", u.is_superuser);
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    function handleUserUpdate() {
      try {
        const u = JSON.parse(localStorage.getItem("user"));
        setUser(u);
      } catch {
        setUser(null);
      }
    }
// ...existing code...
// Accesos de consulta según los planes asignados
let consultaItems = [];
if (user?.perfil?.planes && user.perfil.planes.length > 0) {
  const planes = user.perfil.planes.map(p => (p.nombre || '').toLowerCase());
  if (planes.includes("ecorefull")) {
    consultaItems.push({ path: "/consulta", icon: <Fuel size={28} strokeWidth={1.5} />, label: "E-Core Full" });
  }
  if (planes.includes("contratista")) {
    consultaItems.push({ path: "/consulta-contratista", icon: <img src={HardHatIcon} alt="Contratista" style={{width:28,height:28}} />, label: "E-Contratista" });
  }
  if (planes.includes("essential")) {
    consultaItems.push({ path: "/consulta-medida", icon: <img src={UserCogIcon} alt="Essential" style={{width:28,height:28}} />, label: "E-ssential" });
  }
  if (planes.includes("basic-element") || planes.includes("basic-elemnt")) {
    consultaItems.push({ path: "/consulta-basic-elemnt", icon: <img src={AjustesIcon} alt="Basic Elemnt" style={{width:28,height:28}} />, label: "Basic Elemnt" });
  }
  if(planes.includes("empresa")){
    consultaItems.push({ path: "/consulta-empresa", icon: <HardHat size={28} strokeWidth={1.5} />, label: "Empresa RUES" });
  }
  if (planes.includes("econfiafask")) {
    consultaItems.push({ path: "/consulta-fask", icon: <img src={IconFask} alt="EconfiaFast" style={{width:28,height:28}} />, label: "EconfiaFask" });
  }
  if (planes.includes("essencial-express")) {
    consultaItems.push({ path: "/consulta-essencial-express", icon: <img src={IconFask} alt="Essencial Express" style={{width:28,height:28}} />, label: "Essencial Express" });
  }


}
    window.addEventListener("user-updated", handleUserUpdate);
    return () => window.removeEventListener("user-updated", handleUserUpdate);
  }, []);

  const hasPlanes = user?.perfil?.planes && user.perfil.planes.length > 0;
  const hasConsultas = (user?.perfil?.consultas_disponibles ?? 0) > 0;
  const isAdmin = user?.is_superuser || user?.is_staff;

// Accesos de consulta según los planes asignados
let consultaItems = [];
if (hasPlanes) {
  const planes = user.perfil.planes.map(p => (p.nombre || '').toLowerCase());
  if (planes.includes("ecorefull")) {
    consultaItems.push({ path: "/consulta", icon: <Fuel size={28} strokeWidth={1.5} />, label: "E-Core Full" });
  }
  if (planes.includes("contratista")) {
    consultaItems.push({ path: "/consulta-contratista", icon: <img src={HardHatIcon} alt="Contratista" style={{width:28,height:28}} />, label: "E-Contratista" });
  }
  if (planes.includes("essential")) {
    consultaItems.push({ path: "/consulta-medida", icon: <img src={UserCogIcon} alt="Essential" style={{width:28,height:28}} />, label: "E-ssential" });
  }
  if (planes.includes("basic-element") || planes.includes("basic-elemnt")) {
    consultaItems.push({ path: "/consulta-basic-elemnt", icon: <img src={AjustesIcon} alt="E-Basic Element" style={{width:28,height:28}} />, label: "Basic Element" });
  }
  if(planes.includes("empresa")){
    consultaItems.push({ path: "/consulta-empresa", icon: <HardHat size={28} strokeWidth={1.5} />, label: "Empresa RUES" });
  }
  if (planes.includes("econfiafask")) {
    consultaItems.push({ path: "/consulta-fask", icon: <img src={IconFask} alt="E-Fast" style={{width:28,height:28}} />, label: "EconfiaFast" });
  }
  if (planes.includes("essencial-express")) {
    consultaItems.push({ path: "/consulta-essencial-express", icon: <img src={IconFask} alt="E-Essencial Express" style={{width:28,height:28}} />, label: "E-Essencial Express" });
  }
  if(planes.includes("validacion-titulos")){
  consultaItems.push({ path: "/consulta-titulos", icon: <img src={UserCogIcon} alt="Validación de títulos" style={{width:28,height:28}} />, label: "Validación de títulos" });
  }
}

// Menú base
let menuItems = [
 
  { path: "/logout",     icon: <LogOut size={28} strokeWidth={1.5} />,   label: "Cerrar Sesión" },
  ...consultaItems,
  { path: "/profile",    icon: <img src={UserBaseIcon} alt="Perfil" style={{width:28,height:28}} />,     label: "Perfil" },
  { path: "/resultados", icon: <FileText size={28} strokeWidth={1.5} />, label: "Resultados" },
  { path: "/ayuda",      icon: <HelpCircle size={28} strokeWidth={1.5} />,label: "Ayuda" },
];

// Accesos CRUD solo para admin
if (isAdmin) {
  menuItems = [
    ...menuItems,
    { path: "/admin-usuarios", icon: <User size={28} strokeWidth={1.5} />, label: "Admin Usuarios" },
    { path: "/admin-planes", icon: <FileText size={28} strokeWidth={1.5} />, label: "Admin Planes" },
    { path: "/admin-fuentes", icon: <Search size={28} strokeWidth={1.5} />, label: "Admin Fuentes" },

  ];
}

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const swiperRef = useRef(null);
  const ignoreNextChange = useRef(false);
  const currentIndex = useMemo(() => {
    const i = menuItems.findIndex(m => pathname === m.path || pathname.startsWith(m.path + "/"));
    return i >= 0 ? i : 0;
  }, [pathname, user]);
  useEffect(() => {
    const sw = swiperRef.current;
    if (!sw) return;
    if (sw.activeIndex !== currentIndex) {
      ignoreNextChange.current = true;
      sw.slideTo(currentIndex, 0);
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
