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
    background: `
      radial-gradient(circle at 20% 30%, rgba(10, 25, 50, 0.25), transparent 40%),
      radial-gradient(circle at 80% 70%, rgba(20, 60, 100, 0.2), transparent 40%),
      radial-gradient(circle at 50% 50%, rgba(5, 10, 25, 0.15), transparent 60%),
      linear-gradient(135deg, #02010a, #040615, #010007)
    `,
    dots: ["#ffffff", "#bebebe"],
    linkColor: "#fff1a0",
    linkOpacity: 0.1,
    dotOpacity: 0.4,
  },
  orange: {
    background: `
      radial-gradient(circle at 20% 30%, rgba(249, 115, 22, 0.20), transparent 45%),
      radial-gradient(circle at 80% 70%, rgba(245, 158, 11, 0.18), transparent 45%),
      radial-gradient(circle at 50% 50%, rgba(251, 146, 60, 0.12), transparent 60%),
      linear-gradient(160deg, #ffe8d1, #ffdcb8 55%, #ffd3a6)
    `,
    dots: ["#c2410c", "#ea580c", "#9a3412"],
    linkColor: "#ea580c",
    linkOpacity: 0.22,
    dotOpacity: 0.55,
  },
  light: {
    background: `
      radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.16), transparent 45%),
      radial-gradient(circle at 80% 70%, rgba(20, 184, 166, 0.14), transparent 45%),
      linear-gradient(160deg, #e2f4ea, #d3ecdd 55%, #cfeada)
    `,
    dots: ["#0f766e", "#059669", "#065f46"],
    linkColor: "#10b981",
    linkOpacity: 0.2,
    dotOpacity: 0.5,
  },
};

export default function ParticlesBackground() {
  const { theme } = useTheme();
  const cfg = THEME_PARTICLES[theme] || THEME_PARTICLES.dark;

  const particlesInit = async (main) => {
    await loadFull(main);
  };

  return (
    <Particles
      // Remonta al cambiar el tema para re-inicializar con los nuevos colores.
      key={theme}
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
