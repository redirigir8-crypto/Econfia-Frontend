import React from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

export default function ParticlesBackground() {
  const particlesInit = async (main) => {
    await loadFull(main);
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        background: {
          image: `
            radial-gradient(circle at 20% 30%, rgba(10, 25, 50, 0.25), transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(20, 60, 100, 0.2), transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(5, 10, 25, 0.15), transparent 60%),
            linear-gradient(135deg, #02010a, #040615, #010007)
          `
        },
        fullScreen: {
          enable: true,
          zIndex: -1
        },
        particles: {
          number: { value: 800, density: { enable: true, area: 2000 } },
          shape: {
            type: ["circle", "polygon"],
            options: { polygon: { sides: 9 } }
          },
          color: {
            value: ["#ffffffff", "#bebebeff"]
          },
          opacity: {
            value: 0.4,
            random: true,
            animation: {
              enable: true,
              speed: 0.9,
              minimumValue: 0.1,
              sync: false
            }
          },
          size: {
            value: { min: 1, max: 3 },
            animation: {
              enable: true,
              speed: 5,
              minimumValue: 0.5,
              sync: false
            }
          },
          move: {
            enable: true,
            speed: 0.8,
            direction: "none",
            outModes: { default: "out" },
            random: true,
            straight: false
          },
          links: {
            enable: true,
            distance: 60,
            color: "#fff1a0ff",
            opacity: 0.1,
            width: 1
          }
        },
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: "attract"
            },
            resize: true
          },
          modes: {
            attract: {
              distance: 300,
              duration: 0.01,
              speed: 0.8 
            }
          }
        }
      }}
    />
  );
}
