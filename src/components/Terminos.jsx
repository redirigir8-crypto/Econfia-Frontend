// components/Terminos.jsx
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function Terminos({ isOpen, onClose, children }) {
  // Evitar scroll en el body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-white w-[80vw] h-[80vh] rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-black"
        >
          <X size={24} />
        </button>

        {/* Contenido con scroll */}
        <div className="p-6 overflow-y-auto">
          {children || (
            <p>

            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
