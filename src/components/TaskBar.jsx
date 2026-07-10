import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search, FileText, LogOut, User, HelpCircle, HardHat, Target, ArrowUpCircle, BookOpen, ShieldCheck, Volume2,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { Fuel } from "lucide-react";
import HardHatIcon from '../assets/icons8-contratista-64 (1).png';
import UserCogIcon from '../assets/icons8-lista-de-verificación-64.png';
import UserBaseIcon from '../assets/icons8-usuario-48 (1).png';
import AjustesIcon from '../assets/icons8-orthogonal-view-24.png';
import IconFask from '../assets/icons8-flash-activado-50.png';
import express from '../assets/icons8-hand-drag-50.png';

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
    consultaItems.push({ path: "/3c8f1a2e", icon: <Fuel size={16} strokeWidth={1.75} />, label: "E-Core Full", color: "amber" });
  }
  if (planes.includes("contratista")) {
    consultaItems.push({ path: "/6c1b9f3d", icon: <img src={HardHatIcon} alt="Contratista" />, label: "E-Contratista", color: "orange" });
  }
  if (planes.includes("essential")) {
    consultaItems.push({ path: "/9e3a6c1f", icon: <img src={UserCogIcon} alt="E-Essential" />, label: "E-Essential", color: "cyan" });
  }
  if (planes.includes("basic-element") || planes.includes("basic-elemnt")) {
    consultaItems.push({ path: "/b4f8d2e7", icon: <img src={AjustesIcon} alt="E-Basic Element" />, label: "E-Basic Element", color: "violet" });
  }
  if(planes.includes("empresa")){
    consultaItems.push({ path: "/4a7e2b8f", icon: <HardHat size={16} strokeWidth={1.75} />, label: "Empresa RUES", color: "emerald" });
  }
  if (planes.includes("econfiafast")) {
    consultaItems.push({ path: "/7f3a9e2b", icon: <img src={IconFask} alt="E-Fast" />, label: "E-Fast", color: "yellow" });
  }
  if (planes.includes("essencial-express")) {
    consultaItems.push({ path: "/a1e6c4b8", icon: <img src={express} alt="E-Essencial Express" />, label: "E-Essencial Express", color: "pink" });
  }
  if(planes.includes("validacion-titulos")){
  consultaItems.push({ path: "/2b7d5e9c", icon: <img src={UserCogIcon} alt="Validación de títulos" />, label: "Validación de títulos", color: "indigo" });
  }
  if (planes.includes("e-identidad")) {
    consultaItems.push({ path: "/1d5f8e3a", icon: <User size={16} strokeWidth={1.75} />, label: "E-Identidad", color: "teal" });
  }
  if (planes.includes("experian")) {
    consultaItems.push({ path: "/5c2e8f4a", icon: <ShieldCheck size={16} strokeWidth={1.75} />, label: "Experian", color: "sky" });
  }
}

// Menú base
let menuItems = [
  ...consultaItems,
  { path: "/e9c4b2f7", icon: <img src={UserBaseIcon} alt="Perfil" />, label: "Perfil", color: "fuchsia" },
  { path: "/d3b7f1e9", icon: <FileText size={16} strokeWidth={1.75} />, label: "Consultas", color: "blue" },
  { path: "/c2e6b9a4", icon: <HelpCircle size={16} strokeWidth={1.75} />, label: "Ayuda", color: "lime" },
];

// Accesos CRUD solo para admin
if (isAdmin) {
  menuItems = [
    ...menuItems,
    { path: "/7b3f9d1e", icon: <User size={16} strokeWidth={1.75} />, label: "Admin Usuarios", color: "rose" },
    { path: "/1e5c8a4b", icon: <FileText size={16} strokeWidth={1.75} />, label: "Admin Planes", color: "amber" },
    { path: "/4d9b2f6e", icon: <Search size={16} strokeWidth={1.75} />, label: "Admin Fuentes", color: "cyan" },
    { path: "/2c8e5f1a", icon: <BookOpen size={16} strokeWidth={1.75} />, label: "Admin Blog", color: "violet" },
    { path: "/8f4a1d7c", icon: <Volume2 size={16} strokeWidth={1.75} />, label: "Admin Sonidos", color: "emerald" },
  ];
}

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const COLOR_MAP = {
    amber:   { text: "text-amber-300",   dot: "#fbbf24" },
    orange:  { text: "text-orange-300",  dot: "#fb923c" },
    cyan:    { text: "text-cyan-300",    dot: "#22d3ee" },
    violet:  { text: "text-violet-300",  dot: "#a78bfa" },
    emerald: { text: "text-emerald-300", dot: "#34d399" },
    yellow:  { text: "text-yellow-300",  dot: "#facc15" },
    pink:    { text: "text-pink-300",    dot: "#f472b6" },
    indigo:  { text: "text-indigo-300",  dot: "#818cf8" },
    teal:    { text: "text-teal-300",    dot: "#2dd4bf" },
    sky:     { text: "text-sky-300",     dot: "#38bdf8" },
    fuchsia: { text: "text-fuchsia-300", dot: "#e879f9" },
    blue:    { text: "text-blue-300",    dot: "#60a5fa" },
    lime:    { text: "text-lime-300",    dot: "#a3e635" },
    rose:    { text: "text-rose-300",    dot: "#fb7185" },
  };

  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState, menuItems.length]);

  const scrollByAmount = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 240, behavior: "smooth" });
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const centerActiveItem = () => {
      const activeBtn = el.querySelector('[data-active="true"]');
      if (!activeBtn) return;
      const target =
        activeBtn.offsetLeft - el.clientWidth / 2 + activeBtn.offsetWidth / 2;
      el.scrollLeft = Math.max(0, target);
      updateScrollState();
    };

    const raf = requestAnimationFrame(centerActiveItem);
    return () => cancelAnimationFrame(raf);
  }, [pathname, menuItems.length, updateScrollState]);

  return (
    <div className="fixed top-3 left-0 right-0 z-50 flex items-center justify-center gap-2 px-3">
      <style>{`
        .taskbar-scroll::-webkit-scrollbar { height: 0; }
        .glass-surface {
          background: linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.015) 100%),
                      rgba(15,20,35,0.50);
          backdrop-filter: blur(8px) saturate(160%);
          -webkit-backdrop-filter: blur(8px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.14);
          box-shadow:
            0 8px 32px rgba(0,0,0,0.28),
            inset 0 1px 0 rgba(255,255,255,0.14),
            inset 0 0 0 1px rgba(255,255,255,0.03);
        }
        @keyframes taskbarShineSweep {
          0% { transform: translateX(-130%) rotate(20deg); }
          100% { transform: translateX(230%) rotate(20deg); }
        }
        @keyframes taskbarTextPulse {
          0%, 100% { color: #ffffff; }
          50% { color: #bfdbfe; }
        }
        .taskbar-item-active {
          position: relative;
          z-index: 10;
          overflow: hidden;
          background: linear-gradient(180deg, rgba(56,120,220,0.55) 0%, rgba(37,80,160,0.5) 100%);
          box-shadow:
            0 4px 18px rgba(56,120,220,0.35),
            0 0 0 1px rgba(255,255,255,0.16) inset;
          animation: taskbarTextPulse 2.4s ease-in-out infinite;
        }
        .taskbar-item-dim {
          opacity: 0.4;
        }
        .taskbar-item-dim:hover {
          opacity: 0.85;
        }
        .taskbar-item-active .taskbar-shine {
          position: absolute;
          top: -40%;
          left: 0;
          width: 35%;
          height: 180%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.65), transparent);
          animation: taskbarShineSweep 2.2s ease-in-out infinite;
          pointer-events: none;
        }
      `}</style>

      <button
        type="button"
        onClick={() => scrollByAmount(-1)}
        className={`glass-surface shrink-0 flex items-center justify-center w-9 h-9 rounded-full text-white/75 hover:text-white hover:bg-white/[0.08] transition-all ${
          canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-label="Ver módulos anteriores"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="relative w-full sm:w-auto" style={{ maxWidth: "min(100%, 560px)" }}>
        <nav
          ref={scrollRef}
          className="glass-surface taskbar-scroll flex items-center gap-1.5 overflow-x-auto rounded-full px-2 py-2"
        >
          <button
            type="button"
            onClick={() => navigate("/f1d8a5c3")}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors duration-200 outline-none"
          >
            <LogOut size={15} strokeWidth={1.75} />
            Salir
          </button>

          <div className="w-px h-5 bg-white/10 shrink-0" />

          {(() => {
            const hasActiveItem = menuItems.some(
              (item) => pathname === item.path || pathname.startsWith(item.path + "/")
            );
            return menuItems.map((item) => {
              const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
              return (
                <button
                  key={item.path}
                  type="button"
                  data-active={isActive}
                  onClick={() => navigate(item.path)}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 outline-none ${
                    isActive
                      ? "taskbar-item-active text-white"
                      : `text-white/55 hover:text-white hover:bg-white/[0.06] ${
                          hasActiveItem ? "taskbar-item-dim" : ""
                        }`
                  }`}
                >
                  {isActive && <span className="taskbar-shine" />}
                  <span className="relative flex items-center justify-center w-4 h-4 [&>img]:w-[15px] [&>img]:h-[15px] [&>img]:opacity-90 [&>svg]:opacity-90">
                    {item.icon}
                  </span>
                  <span className="relative">{item.label}</span>
                </button>
              );
            });
          })()}
        </nav>
      </div>

      <button
        type="button"
        onClick={() => scrollByAmount(1)}
        className={`glass-surface shrink-0 flex items-center justify-center w-9 h-9 rounded-full text-white/75 hover:text-white hover:bg-white/[0.08] transition-all ${
          canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-label="Ver más módulos"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
