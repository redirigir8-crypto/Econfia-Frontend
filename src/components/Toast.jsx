import React, { useEffect } from "react";
import { createPortal } from "react-dom";

export default function Toast({ type, message, onClose, sound }) {
  useEffect(() => {
    if (sound) {
      const audio = new Audio(sound);
      audio.play();
    }

    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [sound, onClose]);

  // Contenido del Toast
  const toastContent = (
    <div
      onClick={onClose}
      className="fixed inset-0 flex items-center justify-center z-50 cursor-pointer"
    >
      <div
        className={`absolute inset-0 ${
          type === "error" ? "bg-red-500/40" : "bg-green-500/40"
        }`}
      />
      <div
        className="relative px-8 py-6 rounded-2xl shadow-2xl text-white text-lg font-semibold animate-fade-in"
        style={{
          backgroundColor: type === "error" ? "#dc2626" : "#16a34a",
        }}
      >
        {message}
      </div>
    </div>
  );

  // Se monta directo en <body> usando portal
  return createPortal(toastContent, document.body);
}
