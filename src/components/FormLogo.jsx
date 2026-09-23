import React from "react";
import { useLocation } from "react-router-dom";
import EconfiaLogo from "./EconfiaLogo";
import { colorForPath } from "../utils/serviceColors";
import { useTheme } from "../context/ThemeContext";

// Logo de Econfia para la cabecera de los formularios de consulta.
// Toma automáticamente el color del plan / tipo de consulta según la ruta.
export default function FormLogo({ size = 60 }) {
  const { pathname } = useLocation();
  const { organizacion } = useTheme();
  const color = organizacion?.color_acento || colorForPath(pathname);
  return (
    <div className="flex items-center justify-center mb-4">
      {/* key por ruta: al entrar a otra consulta el logo se remonta y
          la animación de entrada (giro + acomodo) se vuelve a reproducir */}
      <EconfiaLogo key={`${pathname}-${color}`} size={size} color={color} />
    </div>
  );
}
