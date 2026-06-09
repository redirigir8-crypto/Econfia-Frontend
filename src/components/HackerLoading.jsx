import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

const messages = [
  "Iniciando verificación de datos",
  "Detectando información relevante para ti",
  "Conectando con la base de datos en tiempo real",
  "Analizando posibles riesgos en segundos",
  "Preparando tu reporte personalizado",
  "Buscando coincidencias en múltiples fuentes",
  "Extrayendo información clave del candidato",
  "Procesando tu solicitud con máxima confiabilidad",
];

const audios = {
  "Iniciando verificación de datos": "/sounds/econfia-bot/econfia-6.wav",
  "Detectando información relevante para ti": "/sounds/econfia-bot/econfia-7.wav",
  "Conectando con la base de datos en tiempo real": "/sounds/econfia-bot/econfia-8.wav",
  "Analizando posibles riesgos en segundos": "/sounds/econfia-bot/econfia-9.wav",
  "Preparando tu reporte personalizado": "/sounds/econfia-bot/econfia-10.wav",
  "Buscando coincidencias en múltiples fuentes": "/sounds/econfia-bot/econfia-11.wav",
  "Extrayendo información clave del candidato": "/sounds/econfia-bot/econfia-14.wav",
  "Procesando tu solicitud con máxima confiabilidad": "/sounds/econfia-bot/econfia-13.wav",
};

// Degrades de color según el progreso:  azul → amarillo → verde
function getGradient(progress) {
  if (progress < 40) {
    // Azul puro → mezcla azul/amarillo
    const t = progress / 40;
    return `linear-gradient(90deg,
      #1e40af 0%,
      #2563eb ${30 - t * 10}%,
      #3b82f6 ${60 - t * 20}%,
      #0ea5e9 100%)`;
  }
  if (progress < 75) {
    // Azul → amarillo
    const t = (progress - 40) / 35;
    return `linear-gradient(90deg,
      #1d4ed8 0%,
      #2563eb ${20 - t * 10}%,
      #eab308 ${50 + t * 20}%,
      #facc15 100%)`;
  }
  // Amarillo → verde
  const t = (progress - 75) / 25;
  return `linear-gradient(90deg,
    #1d4ed8 0%,
    #16a34a ${20 + t * 30}%,
    #22c55e ${60 + t * 20}%,
    #4ade80 100%)`;
}

export default function HackerLoading({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const [done, setDone] = useState(false);
  const audioRef = useRef(null);
  const intervalRef = useRef(null);
  const finishCalledRef = useRef(false);

  // Reproducir audio del mensaje actual
  useEffect(() => {
    const msg = messages[msgIndex];
    if (!msg) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    const audio = new Audio(audios[msg]);
    audioRef.current = audio;
    if (window.__userInteracted) {
      audio.play().catch(() => {});
    }
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [msgIndex]);

  // Animación de la barra
  useEffect(() => {
    let current = 0;
    intervalRef.current = setInterval(() => {
      // Velocidad variable: rápido al inicio, se frena cerca del 90%, sprint al final
      let step;
      if (current < 60) step = 1.4;
      else if (current < 85) step = 0.6;
      else if (current < 95) step = 0.25;
      else step = 0.15;

      current = Math.min(current + step, 99);
      setProgress(current);

      // Cambiar mensaje según tramos
      const idx = Math.floor((current / 100) * messages.length);
      setMsgIndex(Math.min(idx, messages.length - 1));

      if (current >= 99) {
        clearInterval(intervalRef.current);
      }
    }, 50);

    return () => clearInterval(intervalRef.current);
  }, []);

  // Cuando onFinish se llama externamente, completar la barra
  useEffect(() => {
    if (onFinish && !finishCalledRef.current) {
      // Esperar a que la barra llegue al 100% antes de cerrar
      const check = setInterval(() => {
        setProgress(prev => {
          if (prev >= 99) {
            clearInterval(check);
            setDone(true);
            return 100;
          }
          return Math.min(prev + 3, 100);
        });
      }, 30);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (done && !finishCalledRef.current) {
      finishCalledRef.current = true;
      setTimeout(() => {
        if (onFinish) onFinish();
      }, 500);
    }
  }, [done, onFinish]);

  const gradient = getGradient(progress);
  const currentMsg = messages[msgIndex] || messages[messages.length - 1];

  const overlay = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "linear-gradient(160deg, #020112 0%, #01111f 60%, #05021f 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      {/* Video de fondo con opacidad baja */}
      <video
        autoPlay muted loop playsInline
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover", opacity: 0.18,
          pointerEvents: "none",
        }}
      >
        <source src="/videos/backgroud.mp4" type="video/mp4" />
      </video>

      {/* Contenido */}
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 560, textAlign: "center" }}>

        {/* Logo / título */}
        <p style={{
          color: "#bfdbfe",
          fontSize: 13,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          marginBottom: 32,
          opacity: 0.7,
        }}>
          Econfia · Análisis de Riesgo
        </p>

        {/* Mensaje animado */}
        <p
          key={currentMsg}
          style={{
            color: "#e0f2fe",
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: "0.03em",
            marginBottom: 36,
            minHeight: 28,
            transition: "opacity 0.4s",
            fontFamily: "'Segoe UI', sans-serif",
          }}
        >
          {currentMsg}
          <span style={{ animation: "blink 1s step-end infinite" }}>_</span>
        </p>

        {/* Barra de progreso */}
        <div style={{
          width: "100%",
          height: 12,
          borderRadius: 999,
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)",
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
          marginBottom: 12,
        }}>
          <div style={{
            height: "100%",
            width: `${progress}%`,
            borderRadius: 999,
            background: gradient,
            transition: "width 0.05s linear, background 0.8s ease",
            boxShadow: progress > 75
              ? "0 0 16px 2px rgba(34,197,94,0.5)"
              : progress > 40
              ? "0 0 16px 2px rgba(234,179,8,0.45)"
              : "0 0 16px 2px rgba(59,130,246,0.5)",
            position: "relative",
          }}>
            {/* Brillo deslizante */}
            <div style={{
              position: "absolute",
              top: 0, right: 0,
              width: 40, height: "100%",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35))",
              borderRadius: 999,
            }} />
          </div>
        </div>

        {/* Porcentaje */}
        <p style={{
          color: progress > 75 ? "#4ade80" : progress > 40 ? "#facc15" : "#60a5fa",
          fontSize: 13,
          fontWeight: 700,
          fontFamily: "monospace",
          letterSpacing: "0.1em",
          transition: "color 0.8s ease",
        }}>
          {Math.round(progress)}%
        </p>

      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );

  return createPortal(overlay, document.body);
}
