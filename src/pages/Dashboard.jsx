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
              @keyframes econfiaLetterSweep {
                0% { background-position: 130% 50%; }
                45% { background-position: -30% 50%; }
                100% { background-position: -30% 50%; }
              }
              .econfia-title-shell {
                position: relative;
                display: inline-block;
                padding: 2px 0;
              }
              .econfia-title {
                position: relative;
                display: inline-block;
                background:
                  linear-gradient(100deg,
                    #eef7ff 0%,
                    #ffffff 28%,
                    #ffffff 42%,
                    #8fe7ff 49%,
                    #ffffff 56%,
                    #dff7ff 72%,
                    #74d9ff 100%);
                background-size: 240% 100%;
                background-position: 130% 50%;
                -webkit-background-clip: text;
                background-clip: text;
                color: transparent;
                animation: econfiaLetterSweep 3.8s ease-in-out infinite;
                text-shadow:
                  0 0 2px rgba(255,255,255,0.56),
                  0 0 8px rgba(125,211,252,0.28);
                filter:
                  drop-shadow(0 0 3px rgba(255,255,255,0.45))
                  drop-shadow(0 0 8px rgba(56,189,248,0.24));
              }
            `}</style>
            <div className="relative flex w-[360px] items-center gap-3 bg-transparent px-2 py-2">
              <div className="relative w-[58px] h-[58px] shrink-0">
                <div className="absolute inset-1 rounded-2xl bg-red-500/10 blur-md transition-all duration-500 group-hover:bg-red-500/16" />
                <div className="absolute inset-[5px] rounded-2xl bg-[#0a0e18]/55 border border-white/10 flex items-center justify-center shadow-[inset_0_0_10px_rgba(255,255,255,0.06)]">
                  <img
                    src="/img/logo-econfia-1.png"
                    alt="Econfía"
                    className="w-10 h-10 object-contain drop-shadow-[0_0_6px_rgba(239,68,68,0.55)]"
                  />
                </div>
              </div>

              <div className="flex flex-col justify-center leading-none">
                <div className="econfia-title-shell">
                  <p className="econfia-title font-black text-xl tracking-[0.22em] uppercase leading-none">
                    Econfia
                  </p>
                </div>
                <p className="text-white/40 text-[8.5px] tracking-[0.15em] uppercase font-light mt-1 whitespace-nowrap">
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
