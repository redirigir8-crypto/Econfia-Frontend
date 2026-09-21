import React, { useEffect } from "react";
import { createPortal } from "react-dom";

// Guía en lenguaje sencillo del panel de Monitoreo de fuentes.
// Compartida por la vista de usuario y la de administrador.
// Pensada para que CUALQUIER persona (no técnica) entienda qué es cada cosa.

const T = {
  text: "rgb(var(--th-content))",
  muted: "rgb(var(--th-content) / 0.62)",
  brand: "rgb(var(--th-brand))",
  brand2: "rgb(var(--th-brand-2))",
  surface: "rgb(var(--th-surface))",
  surface2: "rgb(var(--th-surface-2))",
  line: "rgb(var(--th-line) / 0.14)",
  lineSoft: "rgb(var(--th-line) / 0.06)",
};

const VERDE = "#22c55e", AMBAR = "#f59e0b", ROJO = "#ef4444";

// Estados explicados como se lo contarías a alguien sin saber de sistemas.
const ESTADOS = [
  ["ok", VERDE, "rgba(34,197,94,.18)", "Todo bien", "La fuente respondió correctamente y rápido."],
  ["lento", AMBAR, "rgba(245,158,11,.18)", "Respondió, pero lento", "Sí respondió, pero se tardó más de lo normal (más de 5 segundos)."],
  ["bloqueo", ROJO, "rgba(239,68,68,.18)", "Nos bloqueó", "La página no nos dejó entrar (nos pidió un captcha o cerró la puerta)."],
  ["timeout", AMBAR, "rgba(245,158,11,.18)", "No contestó a tiempo", "Esperamos y la fuente nunca respondió dentro del límite."],
  ["error", ROJO, "rgba(239,68,68,.18)", "Falló la conexión", "No se pudo conectar (problema de red o de seguridad del sitio)."],
  ["no_encontrado", ROJO, "rgba(239,68,68,.18)", "Página no encontrada", "La dirección ya no existe o cambió."],
  ["error_servidor", ROJO, "rgba(239,68,68,.18)", "El sitio está fallando", "La fuente respondió con un error propio de su servidor."],
];

// Tarjetas de arriba, explicadas simple.
const TARJETAS = [
  ["📡", "Fuentes monitoreadas", "Cuántas fuentes de información vigilamos en total (entidades, listas, boletines…)."],
  ["🗓️", "Sondeos del día", "Cuántas revisiones automáticas se hicieron en el último día. No es un total acumulado."],
  ["✅", "Disponibilidad promedio", "De cada 100 revisiones, cuántas salieron bien. Verde = muy bien, ámbar = regular, rojo = mal.", true],
  ["🚦", "Por estado", "Un resumen de cómo respondieron las fuentes: cuántas bien, cuántas lentas, cuántas con problema."],
];

// Columnas de la tabla, en palabras de todos los días.
const COLUMNAS = [
  ["Fuente", "El nombre de la fuente que estamos revisando."],
  ["Ámbito", "Si es 🇨🇴 nacional (de Colombia) o 🌎 internacional. Las nacionales salen primero."],
  ["Sondeos", "Cuántas veces revisamos esa fuente en el periodo elegido (7, 30 o 90 días)."],
  ["Latencia", "Cuánto se tarda en responder, en milisegundos. Menos es mejor."],
  ["P95", "Casi el peor tiempo: el 95% de las veces respondió más rápido que este número."],
  ["Bloq. / T-O / Err.", "Cuántas veces nos bloqueó, no contestó a tiempo, o falló."],
  ["Último", "Cómo le fue en la revisión más reciente (con su color de estado)."],
];

export default function MonitoreoAyuda({ onClose, admin = false }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999, display: "flex",
        alignItems: "center", justifyContent: "center",
        background: "rgba(2,6,20,.68)", backdropFilter: "blur(4px)", padding: 20,
      }}>
      <div onClick={(e) => e.stopPropagation()} className="th-panel"
        style={{
          borderRadius: 20, maxWidth: 700, width: "100%", maxHeight: "88vh", color: T.text,
          display: "flex", flexDirection: "column", overflow: "hidden",
          boxShadow: "0 30px 80px rgba(0,0,0,.5)", border: `1px solid rgb(var(--th-brand) / 0.25)`,
        }}>
        {/* Cabecera */}
        <div style={{
          display: "flex", alignItems: "center", gap: 14, padding: "20px 24px", flexShrink: 0,
          background: `linear-gradient(120deg, rgb(var(--th-brand) / 0.20), rgb(var(--th-brand-2) / 0.10))`,
          borderBottom: `1px solid ${T.line}`,
        }}>
          <div style={{
            width: 46, height: 46, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, background: `linear-gradient(140deg, ${T.brand}, ${T.brand2})`, flexShrink: 0,
            boxShadow: `0 6px 18px rgb(var(--th-brand) / 0.35)`,
          }}>📡</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800 }}>¿Qué es esto y cómo se lee?</h2>
            <div style={{ fontSize: 12.5, color: T.muted, marginTop: 2 }}>Explicado en palabras sencillas</div>
          </div>
          <button onClick={onClose} aria-label="Cerrar"
            style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0, cursor: "pointer",
              background: T.lineSoft, border: `1px solid ${T.line}`, color: T.text, fontSize: 20, fontWeight: 700, lineHeight: 1,
            }}>×</button>
        </div>

        {/* Cuerpo */}
        <div style={{ padding: "20px 24px", overflowY: "auto" }}>
          {/* Qué es */}
          <div style={{
            borderLeft: `3px solid ${T.brand}`, background: T.lineSoft, borderRadius: 10,
            padding: "14px 16px", fontSize: 14, lineHeight: 1.6, color: T.muted, marginBottom: 22,
          }}>
            Este panel revisa <b style={{ color: T.text }}>automáticamente</b> si las fuentes de información
            (entidades del Estado, listas, boletines…) están funcionando. No hace la consulta completa:
            solo <b style={{ color: T.text }}>“toca la puerta”</b> para ver si contestan y qué tan rápido.
            Así sabemos, sin esperar a que un usuario falle, cuáles fuentes están caídas o lentas.
          </div>

          <Bloque icon="🕒" titulo="¿Cada cuánto se revisa?">
            <div style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.6 }}>
              De forma automática, <b style={{ color: T.text }}>2 veces al día</b> (una en la mañana y otra en la
              tarde).{admin ? " Además, un administrador puede lanzar una revisión manual con el botón “Ejecutar sondeo ahora”." : ""}
            </div>
          </Bloque>

          <Bloque icon="🧾" titulo="Las tarjetas de arriba">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 10 }}>
              {TARJETAS.filter((t) => admin || !t[3]).map((t) => (
                <Def key={t[1]} chip={`${t[0]} ${t[1]}`}>{t[2]}</Def>
              ))}
            </div>
          </Bloque>

          <Bloque icon="🚦" titulo="Los estados (los colores)">
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {ESTADOS.map(([e, fg, bg, titulo, desc]) => (
                <div key={e} style={{ display: "flex", gap: 12, alignItems: "center", padding: "7px 9px", borderRadius: 8, background: T.lineSoft }}>
                  <span style={{ background: bg, color: fg, fontWeight: 800, fontSize: 11, padding: "4px 9px", borderRadius: 7, minWidth: 118, textAlign: "center" }}>{titulo}</span>
                  <span style={{ fontSize: 13, color: T.muted }}>
                    <b style={{ color: T.text, fontWeight: 700 }}>{e}</b> — {desc}
                  </span>
                </div>
              ))}
            </div>
          </Bloque>

          <Bloque icon="📊" titulo="La tabla de fuentes">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 10 }}>
              {COLUMNAS.map(([k, d]) => <Def key={k} chip={k}>{d}</Def>)}
            </div>
          </Bloque>

          <Bloque icon="📉" titulo="El gráfico de barras">
            <div style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.6 }}>
              Cada barra es un día. La altura muestra <b style={{ color: T.text }}>cuántas fuentes fallaron ese día</b>.
              Es normal que suba y baje: una fuente puede caerse hoy y volver a funcionar mañana.
            </div>
          </Bloque>

          <div style={{ fontSize: 12, color: T.muted, textAlign: "center", marginTop: 6 }}>
            💡 Consejo: pasa el cursor sobre los títulos con “ⓘ” para ver una ayuda rápida en cada columna.
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

const Bloque = ({ icon, titulo, children }) => (
  <div style={{ marginBottom: 22 }}>
    <h3 style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 800, color: T.brand, letterSpacing: 1, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 7 }}>
      <span style={{ fontSize: 15 }}>{icon}</span> {titulo}
    </h3>
    {children}
  </div>
);

const Def = ({ chip, children }) => (
  <div style={{ fontSize: 13, lineHeight: 1.5 }}>
    <span style={{
      display: "inline-block", fontWeight: 800, color: T.brand, background: "rgb(var(--th-brand) / 0.12)",
      border: `1px solid rgb(var(--th-brand) / 0.25)`, borderRadius: 7, padding: "1px 8px", marginBottom: 4, fontSize: 12,
    }}>{chip}</span>
    <div style={{ color: T.muted }}>{children}</div>
  </div>
);
