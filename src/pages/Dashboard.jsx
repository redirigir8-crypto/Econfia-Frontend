// src/pages/Dashboard.jsx
import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, Outlet, useNavigate } from "react-router-dom";
import Taskbar from "../components/TaskBar";
import {
  SESSION_INACTIVITY_LIMIT_MS,
  clearSession,
  isInactive,
  touchActivity,
} from "../utils/session";

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();

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
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.35 }}
          className="flex-1 w-full"
        >
          {/* Aquí se renderizan las rutas hijas definidas en App.jsx */}
          <Outlet />
        </motion.main>
      </AnimatePresence>

      <Taskbar />
    </div>
  );
}
