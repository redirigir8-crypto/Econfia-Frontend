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
  { id: "orange", label: "Naranja" },
];

const STORAGE_KEY = "econfia_theme"; // caché local
const API = process.env.REACT_APP_API_URL;

function isValid(t) {
  return THEMES.some((x) => x.id === t);
}

/** "#10b981" -> "16 185 129" (formato canal-RGB sin coma que usan los
 * tokens de themes.css, para poder combinarse con rgb(var(--x) / alpha)). */
function hexARgbTokens(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || "").trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

/** Aplica (o limpia) el branding de una Organizacion sobre los tokens de
 * tema — logo y colores de acento. Sobreescribe con un custom property
 * inline en <html>, que gana por especificidad sobre las reglas
 * [data-theme="x"] de themes.css sin tener que tocar ese archivo.
 *
 * --th-brand es el acento principal (color_acento) y --th-brand-2 el
 * secundario/degradado (color_secundario_efectivo, que el backend ya
 * resuelve — si la organización no definió uno propio, cae al mismo
 * color_acento, así que aquí siempre llega un valor listo para usar). */
export function aplicarBrandingOrganizacion(organizacion) {
  const root = document.documentElement;
  const rgbPrincipal = organizacion?.color_acento ? hexARgbTokens(organizacion.color_acento) : null;
  const rgbSecundario = organizacion?.color_secundario_efectivo
    ? hexARgbTokens(organizacion.color_secundario_efectivo)
    : rgbPrincipal;
  if (rgbPrincipal) {
    root.style.setProperty("--th-brand", rgbPrincipal);
    root.style.setProperty("--th-brand-2", rgbSecundario || rgbPrincipal);
  } else {
    root.style.removeProperty("--th-brand");
    root.style.removeProperty("--th-brand-2");
  }
  const fondoRgb = organizacion?.color_fondo ? hexARgbTokens(organizacion.color_fondo) : null;
  if (fondoRgb) {
    root.style.setProperty("--th-app", fondoRgb);
  } else {
    root.style.removeProperty("--th-app");
  }
}

const ThemeContext = createContext({
  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
  themes: THEMES,
  organizacion: null,
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
  // Cliente white-label del usuario logueado (logo/colores/nombre de
  // Wallet) — null si no tiene organización, y entonces se usa la marca
  // Econfia por defecto en toda la UI.
  const [organizacion, setOrganizacion] = useState(null);

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
    const token = localStorage.getItem("token");
    if (!token || !API) return;
    try {
      const res = await fetch(`${API}/api/profile/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      // El branding de la organización (logo/colores) se aplica siempre que
      // haya sesión, independiente de si el usuario ya tenía un tema local
      // elegido — es marca del cliente white-label, no una preferencia
      // personal como el tema claro/oscuro.
      aplicarBrandingOrganizacion(data?.perfil?.organizacion);
      setOrganizacion(data?.perfil?.organizacion || null);
      if (hadLocalAtStart.current) return; // tema ya elegido localmente -> respetarlo
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

  // Cicla por todos los temas disponibles en orden (Oscuro → Claro → Naranja → …).
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const idx = THEMES.findIndex((t) => t.id === prev);
      const next = THEMES[(idx + 1) % THEMES.length].id;
      persistToBackend(next);
      return next;
    });
  }, [persistToBackend]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, themes: THEMES, organizacion }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
