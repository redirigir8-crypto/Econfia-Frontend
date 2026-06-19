// src/components/SoundManager.jsx
// Reproductor global de sonidos por evento configurados por el admin.
//
// Cómo disparar un sonido desde cualquier parte de la app:
//   import { playEventSound } from "../components/SoundManager";
//   playEventSound("login");        // "login" | "consulta" | "resultados" | "navegacion"
//
// El sonido de "navegacion" se dispara automáticamente al cambiar de ruta.
// El usuario puede silenciar todo con el botón flotante (se guarda en localStorage).

import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Volume2, VolumeX } from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
const MUTE_KEY = "econfia_sounds_muted";
const EVENT_NAME = "econfia:sound";

/** Dispara un sonido de evento desde cualquier componente. */
export function playEventSound(evento) {
  if (!evento) return;
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { evento } }));
}

export default function SoundManager() {
  const [sonidos, setSonidos] = useState({}); // { evento: {url, volumen} }
  const [muted, setMuted] = useState(() => localStorage.getItem(MUTE_KEY) === "1");
  const mutedRef = useRef(muted);
  const location = useLocation();
  const firstNavRef = useRef(true);

  // Mantener ref sincronizado para usarlo dentro de listeners
  useEffect(() => {
    mutedRef.current = muted;
    localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  }, [muted]);

  // Cargar sonidos activos
  const fetchSonidos = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      // El endpoint es público: así también suena el error de login (sin sesión).
      const res = await fetch(`${API_URL}/api/sonidos/`, {
        headers: token ? { Authorization: `Token ${token}` } : {},
      });
      if (res.ok) setSonidos(await res.json());
    } catch {
      /* silencioso: los sonidos son opcionales */
    }
  }, []);

  useEffect(() => {
    fetchSonidos();
    // Permite que la página admin refresque sin recargar
    window.addEventListener("econfia:sounds-updated", fetchSonidos);
    return () => window.removeEventListener("econfia:sounds-updated", fetchSonidos);
  }, [fetchSonidos]);

  // Reproductor central
  const reproducir = useCallback(
    (evento) => {
      if (mutedRef.current) return;
      const cfg = sonidos?.[evento];
      if (!cfg?.url) return;
      try {
        const audio = new Audio(cfg.url);
        audio.volume = typeof cfg.volumen === "number" ? Math.min(Math.max(cfg.volumen, 0), 1) : 1;
        // play() puede rechazar si el navegador bloquea autoplay sin interacción
        audio.play().catch(() => {});
      } catch {
        /* noop */
      }
    },
    [sonidos]
  );

  // Escuchar eventos personalizados
  useEffect(() => {
    const handler = (e) => reproducir(e?.detail?.evento);
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, [reproducir]);

  // Sonido de "login" tras la recarga dura del inicio de sesión
  useEffect(() => {
    if (!Object.keys(sonidos).length) return;
    if (sessionStorage.getItem("econfia_play_login") === "1") {
      sessionStorage.removeItem("econfia_play_login");
      reproducir("login");
    }
  }, [sonidos, reproducir]);

  // Sonido de navegación al cambiar de ruta (ignora la primera carga)
  useEffect(() => {
    if (firstNavRef.current) {
      firstNavRef.current = false;
      return;
    }
    reproducir("navegacion");
  }, [location.pathname, reproducir]);

  // El botón de mute solo se muestra con sesión iniciada (los hooks de arriba
  // siguen activos para la detección de navegación y los eventos).
  if (!localStorage.getItem("token")) return null;

  return (
    <button
      onClick={() => setMuted((m) => !m)}
      title={muted ? "Activar sonidos" : "Silenciar sonidos"}
      aria-label={muted ? "Activar sonidos" : "Silenciar sonidos"}
      className="fixed bottom-24 left-4 z-[9998] flex h-11 w-11 items-center justify-center rounded-full border border-cyan-400/30 bg-slate-900/80 text-cyan-300 shadow-lg shadow-cyan-500/20 backdrop-blur transition-all hover:bg-slate-800 hover:text-cyan-200"
    >
      {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
    </button>
  );
}
