import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";

/**
 * Sistema de temas de la app.
 * - Pone data-theme en <html> (lo consumen los tokens CSS de themes.css).
 * - Se guarda POR CUENTA en el backend (Perfil.tema_ui) y sigue al usuario
 *   entre dispositivos. localStorage se usa solo como caché para pintar al
 *   instante (evitar parpadeo) antes de sincronizar con el backend.
 * - Default "dark" (look actual).
 *
 * Para agregar más temas: añade su paleta en themes.css ([data-theme="x"])
 * y su entrada en THEMES aquí (y ampliar las opciones válidas en el backend).
 */
export const THEMES = [
  { id: "dark", label: "Oscuro" },
  { id: "light", label: "Claro" },
];

const STORAGE_KEY = "econfia_theme"; // caché local
const API = process.env.REACT_APP_API_URL;

function isValid(t) {
  return THEMES.some((x) => x.id === t);
}

const ThemeContext = createContext({
  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
  themes: THEMES,
});

export function ThemeProvider({ children }) {
  // ¿Había preferencia guardada en ESTE navegador al arrancar? Se captura ANTES
  // de que el efecto escriba la caché, para decidir si sincronizamos del backend.
  const hadLocalAtStart = useRef(false);
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (isValid(saved)) {
        hadLocalAtStart.current = true;
        return saved;
      }
    } catch (_) {}
    return "dark";
  });

  // Refleja el tema en <html data-theme="..."> y actualiza la caché local.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (_) {}
  }, [theme]);

  // Guarda la preferencia en el backend (solo en cambios iniciados por el usuario).
  const persistToBackend = useCallback((next) => {
    const token = localStorage.getItem("token");
    if (!token || !API) return;
    fetch(`${API}/api/preferences/ui-theme/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ tema_ui: next }),
    }).catch(() => {}); // si falla, queda al menos la caché local
  }, []);

  // Lee el tema guardado del perfil del usuario (backend) y lo aplica SOLO en el
  // primer ingreso de este navegador (cuando no había caché local). Así, en un
  // dispositivo donde el usuario ya eligió tema, un refresco NUNCA lo revierte;
  // y un dispositivo nuevo sí toma la preferencia guardada en su cuenta.
  const syncFromBackend = useCallback(async () => {
    if (hadLocalAtStart.current) return; // ya hay preferencia local -> respetarla
    const token = localStorage.getItem("token");
    if (!token || !API) return;
    try {
      const res = await fetch(`${API}/api/profile/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const t = data?.perfil?.tema_ui;
      if (isValid(t)) setThemeState(t); // el efecto de arriba refresca la caché
    } catch (_) {}
  }, []);

  // Al cargar y cuando cambia el usuario (login), sincroniza desde el backend.
  useEffect(() => {
    syncFromBackend();
    const onUser = () => syncFromBackend();
    window.addEventListener("user-updated", onUser);
    return () => window.removeEventListener("user-updated", onUser);
  }, [syncFromBackend]);

  const setTheme = useCallback(
    (next) => {
      if (!isValid(next)) return;
      setThemeState(next);
      persistToBackend(next);
    },
    [persistToBackend]
  );

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      persistToBackend(next);
      return next;
    });
  }, [persistToBackend]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
