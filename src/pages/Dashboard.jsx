// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, Outlet, useNavigate } from "react-router-dom";
import Taskbar from "../components/TaskBar";
import {
  SESSION_INACTIVITY_LIMIT_MS,
  clearSession,
  isInactive,
  touchActivity,
} from "../utils/session";

const RESULTADOS_DETALLE_PREFIX = "/d3b7f1e9/";

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [resultadosDetalleAbierto, setResultadosDetalleAbierto] = useState(false);
  const hideLayout =
    location.pathname.startsWith(RESULTADOS_DETALLE_PREFIX) ||
    (location.pathname === "/d3b7f1e9" && resultadosDetalleAbierto);

  useEffect(() => {
    if (!location.pathname.startsWith("/d3b7f1e9")) {
      setResultadosDetalleAbierto(false);
      return undefined;
    }
    const handler = (event) => setResultadosDetalleAbierto(Boolean(event.detail));
    window.addEventListener("econfia-resultados-detalle", handler);
    return () => window.removeEventListener("econfia-resultados-detalle", handler);
  }, [location.pathname]);

  useEffect(() => {
    let timeoutId = null;
    let lastTouchAt = 0;

    const doLogout = () => {
      clearSession();
      navigate("/login", { replace: true });
    };

    const throttledTouch = () => {
      const now = Date.now();
      if (now - lastTouchAt < 1000) return;
      lastTouchAt = now;
      touchActivity(now);
    };

    const resetTimer = () => {
      throttledTouch();
      if (timeoutId) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        doLogout();
      }, SESSION_INACTIVITY_LIMIT_MS);
    };

    if (isInactive(SESSION_INACTIVITY_LIMIT_MS)) {
      doLogout();
      return undefined;
    }

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((evt) => window.addEventListener(evt, resetTimer, { passive: true }));
    resetTimer();

    const onVisibilityChange = () => {
      if (document.hidden) return;
      if (isInactive(SESSION_INACTIVITY_LIMIT_MS)) {
        doLogout();
      } else {
        resetTimer();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const onStorage = (event) => {
      if (event.key === "token" && !event.newValue) {
        navigate("/login", { replace: true });
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("storage", onStorage);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [navigate]);

  useEffect(() => {
    const apiBase = process.env.REACT_APP_API_URL;
    if (!apiBase || typeof window === "undefined" || typeof window.fetch !== "function") return;
    if (window.__econfiaFetchPatched) return;

    const originalFetch = window.fetch.bind(window);
    window.__econfiaFetchPatched = true;

    window.fetch = async (input, init = {}) => {
      const url =
        typeof input === "string"
          ? input
          : input && typeof input === "object" && "url" in input
            ? input.url
            : "";

      const isApiCall = Boolean(url && url.startsWith(apiBase));
      let finalInit = init;

      if (isApiCall) {
        const token = localStorage.getItem("token");
        if (token) {
          const headers = new Headers(init.headers || {});
          if (!headers.has("Authorization")) {
            headers.set("Authorization", `Token ${token}`);
          }
          finalInit = { ...init, headers };
        }
      }

      const response = await originalFetch(input, finalInit);

      if (isApiCall && response.status === 401) {
        clearSession();
        navigate("/login", { replace: true });
      }

      return response;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      {!hideLayout && (
        <>
          {/* Logo — esquina superior izquierda */}
          <div className="hidden md:flex fixed md:top-4 md:left-4 z-40 items-center gap-3 group">
            <style>{`
              @keyframes econfiaLogoSpin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              @keyframes econfiaLogoSpinReverse {
                from { transform: rotate(360deg); }
                to { transform: rotate(0deg); }
              }
              @keyframes econfiaAuraPulse {
                0%, 100% {
                  box-shadow: 0 0 14px 3px rgba(239,68,68,0.35), 0 0 26px 6px rgba(56,189,248,0.16);
                }
                50% {
                  box-shadow: 0 0 22px 5px rgba(239,68,68,0.55), 0 0 38px 10px rgba(56,189,248,0.28);
                }
              }
              @keyframes econfiaTextShine {
                0% { transform: translateX(-120%) skewX(-20deg); }
                100% { transform: translateX(220%) skewX(-20deg); }
              }
              .econfia-logo-ring {
                animation: econfiaLogoSpin 10s linear infinite;
              }
              .econfia-logo-ring-dashed {
                animation: econfiaLogoSpinReverse 16s linear infinite;
              }
              .econfia-aura {
                animation: econfiaAuraPulse 2.6s ease-in-out infinite;
              }
              .econfia-title {
                position: relative;
                display: inline-block;
                overflow: hidden;
                background: linear-gradient(to right, #ffffff 0%, #ffffff 45%, #38bdf8 100%);
                -webkit-background-clip: text;
                background-clip: text;
                color: transparent;
                filter: drop-shadow(0 0 10px rgba(56,189,248,0.5));
              }
              .econfia-title::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 40%;
                height: 100%;
                background: linear-gradient(100deg, transparent, rgba(255,255,255,0.9), transparent);
                animation: econfiaTextShine 3s ease-in-out infinite;
                mix-blend-mode: overlay;
              }
            `}</style>
            <div className="econfia-aura relative flex items-center gap-3 rounded-xl border border-cyan-400/20 bg-transparent px-4 py-2.5 transition-all duration-500 group-hover:border-cyan-400/40">
              {/* Icono con anillo tecnológico */}
              <div className="relative w-[58px] h-[58px] shrink-0">
                <div className="absolute inset-0 rounded-full bg-red-500/25 blur-md scale-125 group-hover:bg-red-500/40 transition-all duration-500" />
                <svg viewBox="0 0 100 100" className="econfia-logo-ring absolute inset-0 w-full h-full">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="url(#econfiaRingGradient)" strokeWidth="3" strokeDasharray="8 6" strokeLinecap="round" opacity="0.85" />
                  <defs>
                    <linearGradient id="econfiaRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#38bdf8" />
                    </linearGradient>
                  </defs>
                </svg>
                <svg viewBox="0 0 100 100" className="econfia-logo-ring-dashed absolute inset-0 w-full h-full">
                  <circle cx="50" cy="50" r="36" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2 8" strokeLinecap="round" opacity="0.5" />
                </svg>
                <div className="absolute inset-[7px] rounded-full bg-[#0a0e18] border border-white/10 flex items-center justify-center shadow-[inset_0_0_10px_rgba(239,68,68,0.4)]">
                  <img
                    src="/img/logo-econfia-1.png"
                    alt="Econfía"
                    className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(239,68,68,0.9)]"
                  />
                </div>
              </div>

              <div>
                <p className="econfia-title font-black text-lg tracking-[0.22em] uppercase leading-none">
                  Econfia
                </p>
                <p className="text-white/40 text-[8px] tracking-[0.15em] uppercase font-light mt-1.5 whitespace-nowrap">
                  Una marca de Grupo Soluciones
                </p>
              </div>
            </div>
          </div>

          <Taskbar />
        </>
      )}

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.35 }}
          className={`flex-1 w-full ${hideLayout ? "" : "pt-28"}`}
        >
          {/* Aquí se renderizan las rutas hijas definidas en App.jsx */}
          <Outlet />
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
