import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search, FileText, LogOut, User, HelpCircle, HardHat, BookOpen, ShieldCheck, Volume2,
  ChevronLeft, ChevronRight, Sun, Moon,
} from "lucide-react";
import { Fuel } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
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
    consultaItems.push({ path: "/5c2e8f4a", icon: <ShieldCheck size={16} strokeWidth={1.75} />, label: "Econfia Adjudicator", color: "sky" });
  }
  if (planes.includes("historia_credito") || planes.includes("experian")) {
    consultaItems.push({ path: "/3e9f7c1d", icon: <ShieldCheck size={16} strokeWidth={1.75} />, label: "Econfia Credit Report", color: "sky" });
  }
  if (planes.includes("reconocer") || planes.includes("experian")) {
    consultaItems.push({ path: "/6b2d8e4f", icon: <ShieldCheck size={16} strokeWidth={1.75} />, label: "Econfia Recognize", color: "sky" });
  }
}

// Menú base — "Salir" siempre primero, de izquierda a derecha
let menuItems = [
  { path: "/f1d8a5c3", icon: <LogOut size={16} strokeWidth={1.75} />, label: "Salir", color: "rose" },
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
  const { theme, toggleTheme } = useTheme();

  const COLOR_HEX = {
    amber: "#f59e0b",
    orange: "#f97316",
    cyan: "#06b6d4",
    violet: "#8b5cf6",
    emerald: "#10b981",
    yellow: "#eab308",
    pink: "#ec4899",
    indigo: "#6366f1",
    teal: "#14b8a6",
    sky: "#0ea5e9",
    fuchsia: "#d946ef",
    blue: "#3b82f6",
    lime: "#84cc16",
    rose: "#f43f5e",
  };

  const SIDE_SPAN = 2; // ítems visibles a cada lado del activo
  const activeIndex = menuItems.findIndex(
    (item) => pathname === item.path || pathname.startsWith(item.path + "/")
  );
  const [anchor, setAnchor] = useState(activeIndex >= 0 ? activeIndex : 0);

  useEffect(() => {
    if (activeIndex >= 0) setAnchor(activeIndex);
  }, [activeIndex]);

  const windowStart = Math.max(0, anchor - SIDE_SPAN);
  const windowEnd = Math.min(menuItems.length, anchor + SIDE_SPAN + 1);
  const pageItems = menuItems.slice(windowStart, windowEnd);
  const canPagePrev = windowStart > 0;
  const canPageNext = windowEnd < menuItems.length;

  // Curva tipo "sonrisa": baja hacia el centro y sube en los extremos.
  const ITEM_GAP = 104;
  const DIP_DEPTH = 36;
  const count = pageItems.length;
  const midIndex = (count - 1) / 2;

  return (
    <div className="fixed top-5 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <style>{`
        .glass-pill {
          background: linear-gradient(180deg, rgb(var(--th-surface) / 0.72) 0%, rgb(var(--th-surface-2) / 0.58) 100%);
          backdrop-filter: blur(10px) saturate(160%);
          -webkit-backdrop-filter: blur(10px) saturate(160%);
          border: 1px solid rgb(var(--th-line) / 0.20);
          box-shadow: 0 10px 28px rgb(var(--th-line) / 0.08);
        }
        @keyframes taskbarShineSweep {
          0% { transform: translateX(-130%) rotate(20deg); }
          100% { transform: translateX(230%) rotate(20deg); }
        }
        @keyframes taskbarPulseGlow {
          0%, 100% {
            box-shadow:
              0 0 14px 2px color-mix(in srgb, var(--item-color, #38bdf8) 55%, transparent),
              inset 0 0 0 1px rgb(var(--th-content) / 0.18);
          }
          50% {
            box-shadow:
              0 0 26px 6px color-mix(in srgb, var(--item-color, #38bdf8) 80%, transparent),
              inset 0 0 0 1px rgb(var(--th-content) / 0.26);
          }
        }
        .curve-track {
          position: relative;
          height: 112px;
        }
        .curve-item {
          position: absolute;
          top: 0;
          left: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 7px;
          width: 100px;
          pointer-events: auto;
          z-index: 1;
          transition: transform 0.35s ease, opacity 0.2s ease, filter 0.2s ease;
        }
        .curve-icon {
          position: relative;
          overflow: hidden;
          width: 58px;
          height: 58px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgb(var(--th-content) / 0.78);
          border: 1px solid color-mix(in srgb, var(--item-color, #38bdf8) 40%, rgb(var(--th-line) / 0.28));
          transition: all 0.2s ease;
        }
        .curve-item.active {
          z-index: 10;
        }
        .curve-item.active .curve-icon {
          width: 72px;
          height: 72px;
          background: linear-gradient(180deg,
            color-mix(in srgb, var(--item-color, #38bdf8) 85%, white 5%),
            color-mix(in srgb, var(--item-color, #38bdf8) 65%, black 25%));
          border-color: color-mix(in srgb, var(--item-color, #38bdf8) 70%, white 20%);
          animation: taskbarPulseGlow 2.2s ease-in-out infinite;
        }
        .curve-item.active .curve-shine {
          position: absolute;
          top: -40%;
          left: 0;
          width: 45%;
          height: 180%;
          background: linear-gradient(120deg, transparent, rgb(var(--th-content) / 0.45), transparent);
          animation: taskbarShineSweep 2.4s ease-in-out infinite;
        }
        .curve-item:not(.active) {
          opacity: 0.9;
          filter: none;
        }
        .curve-item:not(.active):hover {
          opacity: 1;
          filter: none;
        }
        .curve-label {
          font-size: 11px;
          font-weight: 800;
          color: rgb(var(--th-content) / 0.70);
          text-align: center;
          line-height: 1.15;
          white-space: nowrap;
          max-width: 96px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .curve-item.active .curve-label {
          color: rgb(var(--th-content));
          font-size: 12px;
          text-shadow: 0 0 10px color-mix(in srgb, var(--item-color, #38bdf8) 70%, transparent);
        }
        .curve-page-btn {
          pointer-events: auto;
          flex-shrink: 0;
          width: 38px;
          height: 38px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgb(var(--th-content) / 0.78);
          transition: all 0.15s ease;
        }
        html[data-theme="light"] .curve-item.active .curve-label {
          color: #07111f;
          font-weight: 900;
          text-shadow: 0 1px 0 rgb(var(--th-surface) / 0.96), 0 0 12px color-mix(in srgb, var(--item-color, #38bdf8) 28%, transparent);
        }
        html[data-theme="light"] .curve-label {
          color: #475569;
          font-weight: 800;
          text-shadow: 0 1px 0 rgb(var(--th-surface) / 0.88);
        }
        html[data-theme="light"] .curve-item:not(.active):hover .curve-label {
          color: #0f172a;
        }
        html[data-theme="light"] .curve-icon {
          background: linear-gradient(180deg, rgb(var(--th-surface) / 0.92), rgb(var(--th-surface-2) / 0.84));
          color: #334155;
        }
        html[data-theme="light"] .curve-icon img {
          filter: brightness(0) saturate(100%) invert(24%) sepia(14%) saturate(1368%) hue-rotate(176deg) brightness(92%) contrast(88%);
          opacity: 0.88;
        }
        html[data-theme="light"] .curve-item:not(.active):hover .curve-icon {
          color: #0f172a;
          border-color: color-mix(in srgb, var(--item-color, #38bdf8) 58%, rgb(var(--th-line) / 0.18));
        }
        html[data-theme="light"] .curve-item:not(.active):hover .curve-icon img {
          opacity: 1;
          filter: brightness(0) saturate(100%) invert(12%) sepia(28%) saturate(1125%) hue-rotate(176deg) brightness(92%) contrast(95%);
        }
        html[data-theme="light"] .curve-item.active .curve-icon {
          color: #ffffff;
        }
        html[data-theme="light"] .curve-item.active .curve-icon img {
          filter: brightness(0) invert(1);
          opacity: 1;
        }
        html[data-theme="dark"] .curve-icon,
        html[data-theme="dark"] .curve-page-btn {
          color: rgb(255 255 255 / 0.82);
        }
      `}</style>

      <div className="pointer-events-auto flex items-center gap-6">
        {/* Flecha página anterior */}
        <button
          type="button"
          onClick={() => canPagePrev && setAnchor((a) => Math.max(0, a - 1))}
          className={`curve-page-btn glass-pill hover:bg-brand/10 ${
            canPagePrev ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          aria-label="Módulos anteriores"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Módulos en curva tipo "sonrisa" */}
        <div className="curve-track" style={{ width: ITEM_GAP * Math.max(0, count - 1) + 100 }}>
          {pageItems.map((item, i) => {
            const offsetFromMid = i - midIndex;
            const x = offsetFromMid * ITEM_GAP;
            const norm = midIndex > 0 ? offsetFromMid / midIndex : 0;
            const y = 6 + DIP_DEPTH * (1 - norm * norm);
            const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={`curve-item ${isActive ? "active" : ""}`}
                style={{
                  transform: `translate(${x}px, ${y}px) translateX(-50%)`,
                  "--item-color": COLOR_HEX[item.color] || "#38bdf8",
                }}
              >
                <span className="curve-icon glass-pill" title={item.label}>
                  {isActive && <span className="curve-shine" />}
                  <span className="relative flex items-center justify-center w-7 h-7 text-current [&>img]:w-[26px] [&>img]:h-[26px] [&>svg]:w-[26px] [&>svg]:h-[26px]">
                    {item.icon}
                  </span>
                </span>
                <span className="curve-label">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Flecha página siguiente */}
        <button
          type="button"
          onClick={() => canPageNext && setAnchor((a) => Math.min(menuItems.length - 1, a + 1))}
          className={`curve-page-btn glass-pill hover:bg-brand/10 ${
            canPageNext ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          aria-label="Más módulos"
        >
          <ChevronRight size={18} />
        </button>

        {/* Cambio de tema (claro / oscuro) */}
        <button
          type="button"
          onClick={toggleTheme}
          className="curve-page-btn glass-pill hover:bg-brand/10"
          aria-label="Cambiar tema"
          title={theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

      </div>
    </div>
  );
}
