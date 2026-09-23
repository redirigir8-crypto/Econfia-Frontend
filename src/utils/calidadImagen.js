// Quality gate del lado cliente (Fase 5 del plan de validación de
// documentos) — evalúa blur y exposición sobre el canvas ANTES de aceptar
// la captura y avanzar al siguiente paso, con los mismos criterios base
// que el backend (core/calidad_imagen.py: varianza de Laplaciano para
// nitidez, media de luminancia para exposición), reimplementados en JS
// puro sobre ImageData — sin librería nueva, mismo enfoque que ya usa el
// video/canvas nativo del navegador.
//
// Es un gate RÁPIDO y COMPLEMENTARIO: el backend sigue siendo la
// autoridad final (ver Fase 3), esto solo evita que el usuario tenga que
// esperar un viaje de red completo para enterarse de que la foto salió
// borrosa.

// Umbrales heurísticos — mismo criterio de honestidad que el backend: no
// son valores medidos con dataset real, deben ajustarse con datos reales.
const UMBRAL_BLUR_MINIMO = 25; // más bajo que el backend: JPEG de canvas ya comprime, y aquí basta con filtrar los casos obviamente malos, no ser tan estricto como el gate final.
const UMBRAL_EXPOSICION_MIN = 35;
const UMBRAL_EXPOSICION_MAX = 240;

/** Convierte a escala de grises y calcula una aproximación de la varianza
 * del Laplaciano (kernel 3x3 estándar de detección de bordes) sobre un
 * ImageData — más nítido = mayor varianza. Se hace a mano (sin librería)
 * porque es una operación simple sobre un array de píxeles. */
function medirBlur(imageData) {
  const { data, width, height } = imageData;
  const gris = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    gris[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }

  // Kernel Laplaciano: [[0,1,0],[1,-4,1],[0,1,0]] — se recorre sin bordes
  // (i=1..width-2, j=1..height-2) para no salirse del array.
  let suma = 0;
  let sumaCuadrados = 0;
  let n = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const laplaciano =
        gris[idx - width] + gris[idx + width] + gris[idx - 1] + gris[idx + 1] - 4 * gris[idx];
      suma += laplaciano;
      sumaCuadrados += laplaciano * laplaciano;
      n++;
    }
  }
  if (n === 0) return 0;
  const media = suma / n;
  return sumaCuadrados / n - media * media;
}

function medirExposicion(imageData) {
  const { data } = imageData;
  let suma = 0;
  const totalPixeles = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    suma += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  return suma / totalPixeles;
}

/**
 * Evalúa la calidad de un frame de video/canvas antes de aceptarlo como
 * captura. Para no analizar la imagen a resolución completa (costoso en
 * cada captura), se reduce a un tamaño fijo pequeño primero — el blur y la
 * exposición se detectan igual de bien a baja resolución y es casi
 * instantáneo.
 *
 * @param {HTMLVideoElement|HTMLCanvasElement} fuente
 * @returns {{aceptable: boolean, motivos: string[], detalle: object}}
 */
export function evaluarCalidadCaptura(fuente) {
  const ANCHO_ANALISIS = 200;
  const anchoOriginal = fuente.videoWidth || fuente.width || ANCHO_ANALISIS;
  const altoOriginal = fuente.videoHeight || fuente.height || ANCHO_ANALISIS;
  const escala = ANCHO_ANALISIS / anchoOriginal;
  const anchoAnalisis = ANCHO_ANALISIS;
  const altoAnalisis = Math.max(1, Math.round(altoOriginal * escala));

  const canvas = document.createElement("canvas");
  canvas.width = anchoAnalisis;
  canvas.height = altoAnalisis;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(fuente, 0, 0, anchoAnalisis, altoAnalisis);
  const imageData = ctx.getImageData(0, 0, anchoAnalisis, altoAnalisis);

  const motivos = [];
  const blur = medirBlur(imageData);
  if (blur < UMBRAL_BLUR_MINIMO) {
    motivos.push("La imagen está desenfocada. Intente de nuevo.");
  }

  const exposicion = medirExposicion(imageData);
  if (exposicion < UMBRAL_EXPOSICION_MIN) {
    motivos.push("Mejora la iluminación.");
  } else if (exposicion > UMBRAL_EXPOSICION_MAX) {
    motivos.push("Hay demasiado brillo o reflejo sobre el documento.");
  }

  return {
    aceptable: motivos.length === 0,
    motivos,
    detalle: { blur: Math.round(blur * 10) / 10, exposicion: Math.round(exposicion * 10) / 10 },
  };
}
