
import React, { useEffect, useRef, useState } from "react";

import "swiper/css";
import "swiper/css/pagination";


/**
 * Slider full-screen horizontal, sin dependencias.
 * - Rueda del mouse y trackpad (deltaMode normalizado)
 * - Gestos touch (swipe)
 * - Teclado (← →)
 * - Transición suave y bloqueo durante la animación
 */
export default function FullPageSlider({
  children,
  duration = 700,            // ms de la animación
  threshold = 60,            // px de desplazamiento para cambiar de slide
  disableLoop = false,        // si true, no loop
}) {
  const total = React.Children.count(children);
  const [index, setIndex] = useState(0);
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const animatingRef = useRef(false);
  const accRef = useRef(0);
  const touchStartRef = useRef({ x: 0, y: 0, t: 0, dragging: false });

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const goTo = (i) => {
    if (animatingRef.current) return;
    let next = i;
    if (disableLoop) next = clamp(i, 0, total - 1);
    else {
      if (i < 0) next = total - 1;
      if (i >= total) next = 0;
    }
    if (next === index) return;

    animatingRef.current = true;
    setIndex(next);
  };

  // Aplica la transformación cuando cambia index
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.style.transition = `transform ${duration}ms cubic-bezier(.22,.61,.36,1)`;
    track.style.transform = `translate3d(${-index * 100}%, 0, 0)`;
    const onEnd = () => {
      animatingRef.current = false;
      track.style.transition = ""; // evita transicionar al arrastrar manualmente
    };
    track.addEventListener("transitionend", onEnd, { once: true });
    return () => track.removeEventListener("transitionend", onEnd);
  }, [index, duration]);

  // Normaliza wheel para mouse/trackpad
  const normalizeWheel = (e) => {
    // Usa el eje dominante (sirve para pads que envían vertical para moverte horizontal)
    const primary =
      Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;

    // deltaMode: 0=pixel, 1=line, 2=page
    if (e.deltaMode === 1) return primary * 16;
    if (e.deltaMode === 2) return primary * 16 * 16;
    return primary; // ya está en px
  };

  // Wheel handler (mouse y trackpad)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e) => {
      // Necesario para que el pad no haga scroll de la página
      e.preventDefault();

      if (animatingRef.current) return;

      const delta = normalizeWheel(e);
      accRef.current += delta;

      if (Math.abs(accRef.current) >= threshold) {
        const dir = accRef.current > 0 ? 1 : -1; // derecha si > 0
        accRef.current = 0;
        goTo(index + dir);
      }
    };

    // Súper importante: passive: false para poder preventDefault()
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [index, threshold]);

  // Gestos touch (swipe)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e) => {
      const t = e.touches[0];
      touchStartRef.current = {
        x: t.clientX,
        y: t.clientY,
        t: performance.now(),
        dragging: false,
      };
    };

    const onTouchMove = (e) => {
      const t = e.touches[0];
      const dx = t.clientX - touchStartRef.current.x;
      const dy = t.clientY - touchStartRef.current.y;

      // Si el gesto es mayormente horizontal, capturamos y evitamos el scroll de la página
      if (Math.abs(dx) > Math.abs(dy) * 1.2) {
        e.preventDefault();
        touchStartRef.current.dragging = true;

        // Arrastre visual (opcional): mueve el track en vivo
        if (!animatingRef.current) {
          trackRef.current.style.transform = `translate3d(${(-index * 100) + (dx / el.clientWidth) * 100}%, 0, 0)`;
        }
      }
    };

    const onTouchEnd = (e) => {
      const dx =
        (e.changedTouches?.[0]?.clientX ?? 0) - touchStartRef.current.x;
      const dt = performance.now() - touchStartRef.current.t;

      // Umbral: distancia o flick rápido
      const distanceOk = Math.abs(dx) > el.clientWidth * 0.12;
      const flickOk = Math.abs(dx) > 40 && dt < 220;

      // Vuelve al snap actual si no pasó el umbral
      if (!(distanceOk || flickOk)) {
        trackRef.current.style.transition = `transform ${duration}ms cubic-bezier(.22,.61,.36,1)`;
        trackRef.current.style.transform = `translate3d(${-index * 100}%, 0, 0)`;
        trackRef.current.addEventListener(
          "transitionend",
          () => (trackRef.current.style.transition = ""),
          { once: true }
        );
        return;
      }

      const dir = dx < 0 ? 1 : -1; // deslizar a la izquierda -> siguiente
      goTo(index + dir);
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [index, duration]);

  // Teclado
  useEffect(() => {
    const onKey = (e) => {
      if (animatingRef.current) return;
      if (e.key === "ArrowRight") goTo(index + 1);
      if (e.key === "ArrowLeft") goTo(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        // Evita el bounce/scroll del documento y mejora pads
        overscrollBehavior: "none",
        touchAction: "pan-y", // permitimos pan vertical del sistema, nosotros manejamos horizontal
        userSelect: "none",
      }}
    >
      <div
        ref={trackRef}
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          willChange: "transform",
          transform: `translate3d(${-index * 100}%, 0, 0)`,
        }}
      >
        {React.Children.map(children, (child, i) => (
          <div
            key={i}
            style={{
              minWidth: "100%",
              width: "100%",
              height: "100%",
            }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
