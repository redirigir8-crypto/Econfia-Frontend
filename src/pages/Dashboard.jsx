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
          <div className="hidden md:flex fixed md:top-6 md:left-6 z-40 items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-red-500/30 blur-xl scale-125 group-hover:bg-red-500/50 transition-all duration-500" />
              <div className="relative w-14 h-14 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center shadow-[0_0_24px_rgba(220,38,38,0.3)] group-hover:shadow-[0_0_36px_rgba(220,38,38,0.5)] transition-all duration-500 group-hover:scale-105">
                <img
                  src="/img/logo-econfia-1.png"
                  alt="Econfía"
                  className="w-9 h-9 object-contain drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]"
                />
              </div>
            </div>
            <div>
              <p className="text-transparent bg-clip-text font-black text-base tracking-[0.3em] uppercase" style={{backgroundImage:"linear-gradient(to right, #ffffff, #bae6fd, #38bdf8, #0ea5e9)", filter:"drop-shadow(0 0 8px rgba(56,189,248,0.9)) drop-shadow(0 0 18px rgba(56,189,248,0.5))"}}>Econfia</p>
              <p className="text-white/40 text-[9px] tracking-[0.2em] uppercase font-light mt-0.5">Una marca de Grupo Soluciones</p>
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
          className={`flex-1 w-full ${hideLayout ? "" : "pt-20"}`}
        >
          {/* Aquí se renderizan las rutas hijas definidas en App.jsx */}
          <Outlet />
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
