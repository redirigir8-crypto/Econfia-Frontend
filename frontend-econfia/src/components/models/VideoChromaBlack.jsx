import { useEffect, useRef } from "react";

export default function VideoChromaBlack({
  src,
  width = 520,
  height = 520,
  // píxeles con luminancia < 0.12 ~ negros (ajustable)
  lumaThreshold = 0.12,
  softness = 0.06,  // “penumbra” para bordes suaves
  minSaturation = 0.05, // evita comerse detalles azul oscuro
  playbackRate = 1.0,
  className = "",
  rounded = true,
}) {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const video = document.createElement("video");
    video.src = src;
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    videoRef.current = video;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    let running = true;

    const draw = () => {
      if (!running) return;

      const vw = video.videoWidth || width;
      const vh = video.videoHeight || height;
      const scale = Math.min(width / vw, height / vh);
      const dw = Math.max(1, Math.floor(vw * scale));
      const dh = Math.max(1, Math.floor(vh * scale));
      const dx = Math.floor((width - dw) / 2);
      const dy = Math.floor((height - dh) / 2);

      ctx.clearRect(0, 0, width, height);

      if (!video.paused && !video.ended) {
        ctx.drawImage(video, dx, dy, dw, dh);
        const img = ctx.getImageData(0, 0, width, height);
        const d = img.data;

        const t0 = Math.max(0, lumaThreshold - softness);
        const t1 = lumaThreshold;

        for (let i = 0; i < d.length; i += 4) {
          const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255;
          // luma aproximada (sRGB)
          const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          // saturación aprox. (evita que partes azul oscuro desaparezcan)
          const maxc = Math.max(r, g, b), minc = Math.min(r, g, b);
          const sat = maxc > 0 ? (maxc - minc) / maxc : 0;

          // si es muy oscuro y poco saturado → lo tratamos como “fondo”
          if (y < t1 && sat < minSaturation) {
            const k = Math.min(1, Math.max(0, (y - t0) / (t1 - t0))); // 0..1
            d[i + 3] = Math.floor(d[i + 3] * k * k); // borde más suave
          }
        }

        ctx.putImageData(img, 0, 0);
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    const onCanPlay = async () => {
      try { await video.play(); } catch {}
      video.playbackRate = playbackRate;
      draw();
    };
    video.addEventListener("canplay", onCanPlay);

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
      video.pause();
      video.removeEventListener("canplay", onCanPlay);
    };
  }, [src, width, height, lumaThreshold, softness, minSaturation, playbackRate]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`${rounded ? "rounded-2xl overflow-hidden" : ""} ${className}`}
    />
  );
}
