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
function hexARgbCsv(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || "").trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

/** Arma el CSS `background` a partir de la base del tema y sus halos —
 * si se pasan colores de marca, los halos se tiñen con ellos en vez de
 * usar el color fijo del tema (la base oscura/clara/naranja no cambia,
 * solo el tinte de los resplandores). */
function construirBackground(cfg, rgbPrincipal, rgbSecundario) {
  const halos = cfg.halos.map((h, i) => {
    const rgb = i === 0 ? rgbPrincipal || h.rgb : rgbSecundario || rgbPrincipal || h.rgb;
    return `radial-gradient(circle at ${h.pos}, rgba(${rgb}, ${h.alpha}), transparent ${h.spread})`;
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
  const secundario = organizacion?.color_secundario_efectivo || principal;
  const rgbPrincipal = principal ? hexARgbCsv(principal) : null;
  const rgbSecundario = secundario ? hexARgbCsv(secundario) : rgbPrincipal;
  const cfg = principal
    ? {
        ...base,
        dots: [principal, secundario],
        linkColor: principal,
        background: construirBackground(base, rgbPrincipal, rgbSecundario),
      }
    : { ...base, background: construirBackground(base, null, null) };

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
          number: { value: 800, density: { enable: true, area: 2000 } },
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
