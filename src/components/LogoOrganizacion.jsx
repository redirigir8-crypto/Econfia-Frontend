import { useTheme } from "../context/ThemeContext";

/**
 * Logo que respeta la marca white-label del usuario logueado: si tiene una
 * Organizacion asignada con logo propio, se muestra ese; si no, cae al logo
 * de Econfia por defecto. Centraliza el patrón que antes estaba repetido
 * como <img src="/img/logo-econfia-1.png"> en varias vistas de consulta.
 */
export default function LogoOrganizacion({ className = "h-16 w-16 object-contain", alt }) {
  const { organizacion } = useTheme();
  const src = organizacion?.logo || "/img/logo-econfia-1.png";
  const altText = alt || (organizacion ? `Logo ${organizacion.nombre}` : "Econfia");
  return <img src={src} alt={altText} className={className} />;
}
