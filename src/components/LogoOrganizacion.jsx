import { useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import EconfiaLogo from "./EconfiaLogo";
import { colorForPath } from "../utils/serviceColors";

/**
 * Logo que respeta la marca white-label del usuario logueado: si tiene una
 * Organizacion asignada con logo propio, se muestra ese. Si no, cae al logo
 * animado de Econfia (las "dos lunas") coloreado según el tipo de consulta
 * activo (mismo criterio que TaskBar/FormLogo) en vez de un PNG estático.
 * Centraliza el patrón que antes estaba repetido como
 * <img src="/img/logo-econfia-1.png"> en varias vistas de consulta.
 */
export default function LogoOrganizacion({ className = "h-16 w-16 object-contain", alt, size = 60 }) {
  const { organizacion } = useTheme();
  const { pathname } = useLocation();

  if (organizacion?.logo) {
    return (
      <img
        src={organizacion.logo}
        alt={alt || `Logo ${organizacion.nombre}`}
        className={className}
      />
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <EconfiaLogo key={pathname} size={size} color={colorForPath(pathname)} title={alt || "Econfía"} />
    </div>
  );
}
