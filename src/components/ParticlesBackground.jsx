import React from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { useTheme } from "../context/ThemeContext";

/**
 * Fondo de constelaciones (puntos + líneas) que se adapta al tema.
 * Cada tema define su fondo y el color de los puntos/líneas para que las
 * constelaciones se vean bien sobre su color (oscuro, claro o naranja).
 */
const THEME_PARTICLES = {
  dark: {
    // Base oscura por debajo de los halos de color (ver construirBackground).
    base: "linear-gradient(135deg, #02010a, #040615, #010007)",
    halos: [
      { pos: "20% 30%", rgb: "10, 25, 50", alpha: 0.25, spread: "40%" },
      { pos: "80% 70%", rgb: "20, 60, 100", alpha: 0.2, spread: "40%" },
      { pos: "50% 50%", rgb: "5, 10, 25", alpha: 0.15, spread: "60%" },
    ],
    dots: ["#ffffff", "#bebebe"],
    linkColor: "#fff1a0",
    linkOpacity: 0.1,
    dotOpacity: 0.4,
  },
  orange: {
    base: "linear-gradient(160deg, #ffe8d1, #ffdcb8 55%, #ffd3a6)",
    halos: [
      { pos: "20% 30%", rgb: "249, 115, 22", alpha: 0.2, spread: "45%" },
      { pos: "80% 70%", rgb: "245, 158, 11", alpha: 0.18, spread: "45%" },
      { pos: "50% 50%", rgb: "251, 146, 60", alpha: 0.12, spread: "60%" },
    ],
    dots: ["#c2410c", "#ea580c", "#9a3412"],
    linkColor: "#ea580c",
    linkOpacity: 0.22,
    dotOpacity: 0.55,
  },
  light: {
    base: "linear-gradient(160deg, #e2f4ea, #d3ecdd 55%, #cfeada)",
    halos: [
      { pos: "20% 30%", rgb: "16, 185, 129", alpha: 0.16, spread: "45%" },
      { pos: "80% 70%", rgb: "20, 184, 166", alpha: 0.14, spread: "45%" },
    ],
    dots: ["#0f766e", "#059669", "#065f46"],
    linkColor: "#10b981",
    linkOpacity: 0.2,
    dotOpacity: 0.5,
  },
};

/** "#10b981" -> "16, 185, 129" para poder armar rgba(...) en los halos. */
function parseHexColor(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || "").trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbCsv(rgb) {
  if (!rgb) return null;
  return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
}

function rgbToHex({ r, g, b }) {
  const h = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

function mixRgb(a, b, weight = 0.5) {
  return {
    r: a.r + (b.r - a.r) * weight,
    g: a.g + (b.g - a.g) * weight,
    b: a.b + (b.b - a.b) * weight,
  };
}

function hexARgbCsv(hex) {
  return rgbCsv(parseHexColor(hex));
}

function suavizarHex(hex, theme) {
  const rgb = parseHexColor(hex);
  if (!rgb) return hex;
  const target = theme === "dark" ? { r: 255, g: 255, b: 255 } : { r: 15, g: 23, b: 42 };
  return rgbToHex(mixRgb(rgb, target, theme === "dark" ? 0.38 : 0.18));
}

function secundarioElegante(principal, secundario) {
  if (!principal) return secundario || principal;
  if (secundario && String(secundario).toLowerCase() !== String(principal).toLowerCase()) return secundario;
  const rgb = parseHexColor(principal);
  return rgb ? rgbToHex(mixRgb(rgb, { r: 255, g: 255, b: 255 }, 0.34)) : principal;
}

/** Arma el CSS `background` a partir de la base del tema y sus halos —
 * si se pasan colores de marca, los halos se tiñen con ellos en vez de
 * usar el color fijo del tema (la base oscura/clara/naranja no cambia,
 * solo el tinte de los resplandores). */
function construirBackground(cfg, rgbPrincipal, rgbSecundario, brandMode = false) {
  const halos = cfg.halos.map((h, i) => {
    const rgb = i === 0 ? rgbPrincipal || h.rgb : rgbSecundario || rgbPrincipal || h.rgb;
    const alpha = brandMode ? Math.min(h.alpha * 0.48, 0.09) : h.alpha;
    return `radial-gradient(circle at ${h.pos}, rgba(${rgb}, ${alpha}), transparent ${h.spread})`;
  });
  return [...halos, cfg.base].join(",\n      ");
}

export default function ParticlesBackground() {
  const { theme, organizacion } = useTheme();
  const base = THEME_PARTICLES[theme] || THEME_PARTICLES.dark;

  // Si el usuario tiene una Organizacion (cliente white-label) con marca
  // propia, los puntos y las líneas del fondo usan sus colores en vez de
  // los del tema — mismo gradiente de fondo base, pero "tiñendo" las
  // constelaciones con el acento principal/secundario del cliente.
  const principal = organizacion?.color_acento || null;
  const secundario = secundarioElegante(principal, organizacion?.color_secundario_efectivo);
  const rgbPrincipal = principal ? hexARgbCsv(principal) : null;
  const rgbSecundario = secundario ? hexARgbCsv(secundario) : rgbPrincipal;
  const cfg = principal
    ? {
        ...base,
        dots: [suavizarHex(principal, theme), suavizarHex(secundario, theme)],
        linkColor: suavizarHex(secundario || principal, theme),
        linkOpacity: Math.min(base.linkOpacity, theme === "dark" ? 0.075 : 0.12),
        dotOpacity: Math.min(base.dotOpacity, theme === "dark" ? 0.30 : 0.42),
        background: construirBackground(base, rgbPrincipal, rgbSecundario, true),
      }
    : { ...base, background: construirBackground(base, null, null, false) };

  const particlesInit = async (main) => {
    await loadFull(main);
  };

  return (
    <Particles
      // Remonta al cambiar el tema o la marca para re-inicializar con los nuevos colores.
      key={`${theme}-${principal || "default"}-${secundario || "default"}`}
      id="tsparticles"
      init={particlesInit}
      options={{
        background: { image: cfg.background },
        fullScreen: { enable: true, zIndex: -1 },
        particles: {
          number: { value: principal ? 560 : 800, density: { enable: true, area: 2000 } },
          shape: {
            type: ["circle", "polygon"],
            options: { polygon: { sides: 9 } },
          },
          color: { value: cfg.dots },
          opacity: {
            value: cfg.dotOpacity,
            random: true,
            animation: { enable: true, speed: 0.9, minimumValue: 0.1, sync: false },
          },
          size: {
            value: { min: 1, max: 3 },
            animation: { enable: true, speed: 5, minimumValue: 0.5, sync: false },
          },
          move: {
            enable: true,
            speed: 0.8,
            direction: "none",
            outModes: { default: "out" },
            random: true,
            straight: false,
          },
          links: {
            enable: true,
            distance: 60,
            color: cfg.linkColor,
            opacity: cfg.linkOpacity,
            width: 1,
          },
        },
        interactivity: {
          events: {
            onHover: { enable: false, mode: "attract" },
            resize: true,
          },
          modes: { attract: { distance: 300, duration: 0.01, speed: 0.8 } },
        },
      }}
    />
  );
}
