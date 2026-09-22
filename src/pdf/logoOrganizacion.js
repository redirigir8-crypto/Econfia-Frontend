// Carga el logo a usar en los PDFs generados con jsPDF: si el usuario tiene
// una Organizacion (cliente white-label) con logo propio, se descarga y
// convierte a base64 (jsPDF.addImage necesita un data URL o imagen ya
// cargada, no puede recibir una URL remota directamente). Si no hay
// organización, o falla la descarga, cae al logo de Econfia importado
// estáticamente — nunca debe romper la generación del PDF por un logo
// remoto caído.
import logoEconfia from "../assets/logo-econfia.png";

function fetchComoDataUrl(url) {
  return fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error("No se pudo descargar el logo");
      return res.blob();
    })
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
    );
}

/**
 * @param {{logo?: string, nombre?: string} | null} organizacion
 * @returns {Promise<{src: string, nombre: string}>}
 */
export async function cargarLogoParaPdf(organizacion) {
  if (organizacion?.logo) {
    try {
      const src = await fetchComoDataUrl(organizacion.logo);
      return { src, nombre: organizacion.nombre || "Econfia" };
    } catch {
      // Logo remoto no disponible (red, CORS, etc.) — se sigue con el
      // informe usando el logo por defecto en vez de fallar la descarga.
    }
  }
  return { src: logoEconfia, nombre: "Econfia" };
}
