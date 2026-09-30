import { useEffect, useRef, useState, useCallback } from "react";
import jsQR from "jsqr";

/**
 * Modal de escaneo de QR con la cámara del dispositivo.
 *
 * Props:
 *  - open: boolean — muestra/oculta el modal y enciende/apaga la cámara.
 *  - onClose(): cierra el modal (el usuario canceló).
 *  - onDetected(texto): se llama UNA vez con el texto del QR detectado.
 *
 * Requiere contexto seguro (HTTPS o localhost) para acceder a la cámara.
 */
export default function EscanerQR({ open, onClose, onDetected }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const yaDetectadoRef = useRef(false);
  const [error, setError] = useState("");

  const detener = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const cerrar = useCallback(() => {
    detener();
    onClose?.();
  }, [detener, onClose]);

  useEffect(() => {
    if (!open) return;
    yaDetectadoRef.current = false;
    setError("");

    let cancelado = false;

    const escanearFrame = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
        rafRef.current = requestAnimationFrame(escanearFrame);
        return;
      }
      const w = video.videoWidth;
      const h = video.videoHeight;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(video, 0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, w, h);
      const code = jsQR(imageData.data, w, h, { inversionAttempts: "dontInvert" });
      if (code && code.data && !yaDetectadoRef.current) {
        yaDetectadoRef.current = true;
        detener();
        onDetected?.(code.data);
        return;
      }
      rafRef.current = requestAnimationFrame(escanearFrame);
    };

    const iniciar = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Tu navegador no permite usar la cámara.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelado) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.setAttribute("playsinline", "true");
          video.srcObject = stream;
          await video.play();
          rafRef.current = requestAnimationFrame(escanearFrame);
        }
      } catch (e) {
        if (e?.name === "NotAllowedError" || e?.name === "SecurityError") {
          setError("Permiso de cámara denegado. Habilítalo en el navegador.");
        } else if (e?.name === "NotFoundError") {
          setError("No se encontró ninguna cámara en el dispositivo.");
        } else {
          setError("No se pudo iniciar la cámara.");
        }
      }
    };

    iniciar();
    return () => {
      cancelado = true;
      detener();
    };
  }, [open, detener, onDetected]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-surface border border-line/20 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line/15">
          <h3 className="font-bold text-content">Escanear código QR</h3>
          <button
            onClick={cerrar}
            className="text-muted hover:text-content text-xl leading-none"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="p-5">
          {error ? (
            <div className="text-center py-8">
              <p className="text-sm text-red-400 mb-4">{error}</p>
              <button
                onClick={cerrar}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-content bg-surface-2/70 border border-line/15 hover:bg-surface-2"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <>
              <div className="relative rounded-xl overflow-hidden bg-black aspect-square">
                <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                {/* Marco guía de escaneo */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="w-2/3 h-2/3 border-2 border-emerald-400/80 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
                </div>
              </div>
              <p className="text-xs text-muted text-center mt-3">
                Apunta la cámara al código QR de la llave.
              </p>
            </>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
