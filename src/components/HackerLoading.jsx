import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

export default function HackerLoading({ onFinish }) {
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const audioRef = useRef(null);

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
  "Extrayendo información clave del candidato": "/sounds/econfia-bot/econfia-12.wav",
  "Procesando tu solicitud con máxima confiabilidad": "/sounds/econfia-bot/econfia-13.wav",
};


  useEffect(() => {
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setText(randomMessage);

    const audio = new Audio(audios[randomMessage]);
    audioRef.current = audio;
    audio.play().catch(() => {});

    audio.onended = () => {
      if (onFinish) onFinish();
    };

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [onFinish]);

  const overlay = (
    <div className="fixed inset-0 flex items-center justify-center bg-black z-[9999]">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
          <source src="/videos/backgroud.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/70"></div>

      <div className="relative z-10 text-center px-4">
        <p className="text-green-400 font-mono text-2xl md:text-4xl tracking-wide animate-pulse">
          {text}
        </p>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
