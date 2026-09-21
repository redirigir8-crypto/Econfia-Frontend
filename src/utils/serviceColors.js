// Color de cada servicio por su ruta (mismo mapeo que los iconos del TaskBar).
// Se usa para tintar el logo según el plan / tipo de consulta activo.

export const ECONFIA_RED = "#FF141F";

const PATH_COLOR = {
  "/3c8f1a2e": "#f59e0b", // E-Core Full
  "/6c1b9f3d": "#f97316", // E-Contratista
  "/9e3a6c1f": "#06b6d4", // E-Essential
  "/b4f8d2e7": "#8b5cf6", // E-Basic Element
  "/4a7e2b8f": "#10b981", // Empresa RUES
  "/7f3a9e2b": "#eab308", // E-Fast
  "/a1e6c4b8": "#ec4899", // E-Essencial Express
  "/2b7d5e9c": "#6366f1", // Validación de títulos
  "/1d5f8e3a": "#14b8a6", // E-Identidad
  "/e7c1a9d4": "#10b981", // econfiaWallet
  "/5c2e8f4a": "#0ea5e9", // Econfia Adjudicator
  "/3e9f7c1d": "#0ea5e9", // Econfia Credit Report
  "/6b2d8e4f": "#0ea5e9", // Econfia Contact Search
  "/e9c4b2f7": "#d946ef", // Perfil
  "/d3b7f1e9": "#3b82f6", // Consultas
  "/c2e6b9a4": "#84cc16", // Ayuda
  "/f1d8a5c3": "#f43f5e", // Salir
  "/7f2b9e4d": "#0ea5e9", // Monitoreo de fuentes
  "/9a3f2c7e": "#0ea5e9", // Admin Monitoreo
  "/7b3f9d1e": "#f43f5e", // Admin Usuarios
  "/1e5c8a4b": "#f59e0b", // Admin Planes
  "/4d9b2f6e": "#06b6d4", // Admin Fuentes
  "/2c8e5f1a": "#8b5cf6", // Admin Blog
  "/8f4a1d7c": "#10b981", // Admin Sonidos
};

// Devuelve el color del servicio de la ruta actual (rojo Econfia por defecto).
export function colorForPath(pathname) {
  if (!pathname) return ECONFIA_RED;
  for (const [p, c] of Object.entries(PATH_COLOR)) {
    if (pathname === p || pathname.startsWith(p + "/")) return c;
  }
  return ECONFIA_RED;
}
