// src/components/AudioConsent.jsx
import { useState } from "react";

export default function AudioConsent({ onAccept }) {
  const [visible, setVisible] = useState(true);

  const handleAccept = () => {
    setVisible(false);
    onAccept();
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white p-4 rounded-lg shadow-lg z-50 flex flex-col items-center space-y-2 w-full">
      <p>Para una mejor experiencia, ¿desea reproducir sonido?</p>
      <button
        onClick={handleAccept}
        className="px-4 py-2 bg-cyan-500 rounded-full hover:bg-cyan-400 transition"
      >
        Sí, reproducir sonido
      </button>
    </div>
  );
}
