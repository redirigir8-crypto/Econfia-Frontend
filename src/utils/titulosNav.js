// Navegación hacia el módulo de Econfia Títulos.
//
// - En PRODUCCIÓN: Títulos se sirve en el mismo dominio bajo /titulos (nginx).
// - En LOCAL (desarrollo): Títulos corre en su propio puerto (por defecto :3001),
//   porque no hay nginx que enrute /titulos.
//
// Se puede forzar con la variable REACT_APP_TITULOS_URL (recomendado en prod
// dejarla en "/titulos"; en local no hace falta, se autodetecta).

export function baseTitulos() {
  const envUrl = process.env.REACT_APP_TITULOS_URL;
  if (envUrl) return envUrl.replace(/\/+$/, "");
  const host = typeof window !== "undefined" ? window.location.hostname : "";
  const esLocal = host === "localhost" || host === "127.0.0.1";
  return esLocal ? "http://localhost:3001" : "/titulos";
}

// URL final para ENTRAR a Títulos, con SSO si hay sesión de Econfia.
export function urlEntrarTitulos() {
  let token = "";
  try {
    token = localStorage.getItem("token") || "";
  } catch (e) {
    token = "";
  }
  const base = baseTitulos();
  return token
    ? `${base}/?econfia_token=${encodeURIComponent(token)}`
    : `${base}/`;
}
