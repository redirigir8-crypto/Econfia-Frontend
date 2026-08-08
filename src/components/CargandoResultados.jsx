import React from "react";

/**
 * Animación de carga de la app (spinner doble anillo con glow + texto gradiente).
 * Usa los tokens de tema (--th-brand, --th-content, etc.) así que se adapta
 * automáticamente a TODOS los temas (oscuro / claro / naranja).
 *
 * Props:
 *  - title:    texto principal (default "Cargando resultados")
 *  - subtitle: texto secundario (default "Preparando tu información, un momento…")
 *  - className: clases extra para el contenedor (ej. alto mínimo)
 */
export default function CargandoResultados({
  title = "Cargando resultados",
  subtitle = "Preparando tu información, un momento…",
  className = "min-h-[60vh]",
}) {
  return (
    <div className={`flex w-full flex-col items-center justify-center gap-6 px-4 ${className}`}>
      {/* Spinner doble anillo con glow */}
      <div className="relative h-20 w-20 rounded-full bg-surface/75 shadow-[0_18px_45px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        <span className="absolute inset-0 rounded-full border-2 border-brand/20" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-r-brand border-t-brand [animation-duration:0.9s]" />
        <span className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-b-brand-2 border-l-brand-2 [animation-duration:1.4s] [animation-direction:reverse]" />
        {/* Núcleo pulsante */}
        <span className="absolute inset-0 m-auto h-3 w-3 animate-pulse rounded-full bg-brand shadow-[0_0_16px_4px_rgb(var(--th-brand)/0.55)]" />
      </div>

      {/* Texto + puntos animados */}
      <div className="flex flex-col items-center gap-2">
        <p
          className="bg-clip-text text-lg font-black text-transparent"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgb(var(--th-content)), rgb(var(--th-brand)), rgb(var(--th-brand-2)))",
          }}
        >
          {title}
        </p>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand" />
        </div>
        {subtitle ? <p className="text-xs font-semibold text-muted">{subtitle}</p> : null}
      </div>
    </div>
  );
}
