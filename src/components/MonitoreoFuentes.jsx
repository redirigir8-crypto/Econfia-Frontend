import React, { useCallback, useEffect, useState } from "react";

// Versión NO-ADMIN del monitoreo de fuentes.
// Diferencias vs AdminMonitoreo:
//  - NO puede lanzar escaneo (sin botón "Ejecutar sondeo") ni descargar Excel.
//  - NO muestra el porcentaje de disponibilidad (ni global ni por fuente).
//  - Ordena las fuentes NACIONALES primero (viene así del backend).
//  - Agrega un gráfico de barras de "fuentes caídas por día".

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const T = {
  text: "rgb(var(--th-content))",
  muted: "rgb(var(--th-content) / 0.6)",
  brand: "rgb(var(--th-brand))",
  brand2: "rgb(var(--th-brand-2))",
  surface: "rgb(var(--th-surface))",
  surface2: "rgb(var(--th-surface-2))",
  line: "rgb(var(--th-line) / 0.14)",
  lineSoft: "rgb(var(--th-line) / 0.06)",
};

const VERDE = "#22c55e", AMBAR = "#f59e0b", ROJO = "#ef4444";
const ESTADO_COLOR = {
  ok: ["rgba(34,197,94,.18)", VERDE], lento: ["rgba(245,158,11,.18)", AMBAR],
  bloqueo: ["rgba(239,68,68,.18)", ROJO], no_encontrado: ["rgba(239,68,68,.18)", ROJO],
  error_servidor: ["rgba(239,68,68,.18)", ROJO], error: ["rgba(239,68,68,.18)", ROJO],
  timeout: ["rgba(245,158,11,.18)", AMBAR],
};

const cardStyle = { borderRadius: 16, padding: 18 };
const tdC = { padding: "9px 12px", textAlign: "center" };

// Columnas SIN "Disp %"
const COLUMNAS = [
  { key: "Fuente", tip: "Nombre interno de la fuente / bot que se está monitoreando." },
  { key: "Ámbito", tip: "Nacional o internacional. Las nacionales se muestran primero." },
  { key: "Sondeos", tip: "Cuántas veces se ha sondeado la fuente en la ventana elegida." },
  { key: "Lat. med (ms)", tip: "Tiempo típico que tarda la fuente en responder, en milisegundos." },
  { key: "P95", tip: "El 95% de las respuestas fueron más rápidas que este valor." },
  { key: "Bloq.", tip: "Veces que la fuente respondió con bloqueo (403/429/captcha)." },
  { key: "T/O", tip: "Timeouts: no respondió dentro del límite." },
  { key: "Err.", tip: "Errores de conexión, SSL o error de servidor." },
  { key: "Último", tip: "Estado del sondeo más reciente de esta fuente." },
];


const MonitoreoFuentes = () => {
  const token = localStorage.getItem("token");
  const auth = { Authorization: `Token ${token}` };

  const [dias, setDias] = useState(30);
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const cargarReporte = useCallback(async (d = dias) => {
    if (!token) return;
    setCargando(true); setError(null);
    try {
      const r = await fetch(`${API_URL}/api/monitor/publico/reporte/?dias=${d}`, { headers: auth });
      if (!r.ok) throw new Error("No se pudo cargar el monitoreo");
      setReporte(await r.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, [dias, token]);   // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { cargarReporte(); }, [cargarReporte]);

  const cambiarDias = (d) => { setDias(d); cargarReporte(d); };
  const kpi = reporte?.kpi;

  return (
    <div style={{
      fontFamily: "Segoe UI, system-ui, sans-serif", color: T.text,
      minHeight: "100vh", padding: "120px 32px 48px", boxSizing: "border-box",
      maxWidth: 1360, margin: "0 auto",
    }}>
      {/* Cabecera (SIN botón de sondeo ni Excel) */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, display: "flex", alignItems: "center", gap: 10 }}>
            <span>📡</span> Monitoreo de fuentes
          </h1>
          <p style={{ margin: "6px 0 0", color: T.muted }}>
            Estado de disponibilidad y latencia de las fuentes externas. Se actualiza automáticamente.
          </p>
        </div>
        <div style={{ display: "flex", background: T.surface2, borderRadius: 12, padding: 4, border: `1px solid ${T.line}` }}>
          {[7, 30, 90].map((d) => (
            <button key={d} onClick={() => cambiarDias(d)}
              style={{
                border: "none", cursor: "pointer", padding: "7px 15px", borderRadius: 9, fontWeight: 700,
                background: dias === d ? T.brand : "transparent",
                color: dias === d ? T.surface : T.muted,
              }}>{d}d</button>
          ))}
        </div>
      </div>

      {/* KPIs (SIN "Disponibilidad promedio") */}
      {kpi && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 16, marginTop: 24 }}>
          <KpiCard label="FUENTES MONITOREADAS" val={kpi.fuentes_monitoreadas} />
          <KpiCard label="SONDEOS TOTALES" val={kpi.sondeos_totales} />
          <div className="th-card" style={cardStyle}>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.muted, marginBottom: 10, letterSpacing: .5 }}>POR ESTADO</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {Object.entries(kpi.por_estado || {}).map(([e, n]) => {
                const [bg, fg] = ESTADO_COLOR[e] || ["rgb(var(--th-line) / 0.15)", T.text];
                return <span key={e} style={{ background: bg, color: fg, fontWeight: 800, fontSize: 12, padding: "3px 9px", borderRadius: 7 }}>{e}: {n}</span>;
              })}
            </div>
          </div>
        </div>
      )}

      {/* Gráfico de barras: fuentes caídas por día */}
      <Seccion titulo="Fuentes caídas por día">
        <GraficoFallos datos={reporte?.fallos_por_dia} />
      </Seccion>

      {/* Tabla — nacionales primero */}
      <Seccion titulo="Fuentes (nacionales primero)">
        {cargando ? <p style={{ color: T.muted }}>Cargando…</p> : error ? (
          <p style={{ color: ROJO }}>{error}</p>
        ) : (
          <div className="th-panel" style={{ overflowX: "auto", borderRadius: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, color: T.text }}>
              <thead>
                <tr style={{ background: T.surface2 }}>
                  {COLUMNAS.map((c) => (
                    <th key={c.key} title={c.tip}
                      style={{ padding: "12px", textAlign: c.key === "Fuente" ? "left" : "center", fontWeight: 800, color: T.muted, borderBottom: `1px solid ${T.line}`, cursor: "help", whiteSpace: "nowrap" }}>
                      {c.key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(reporte?.disponibilidad || []).map((r, i) => {
                  const [bg, fg] = ESTADO_COLOR[r.ultimo_estado] || ["rgb(var(--th-line) / 0.15)", T.text];
                  return (
                    <tr key={r.clave} style={{ background: i % 2 ? T.lineSoft : "transparent" }}>
                      <td style={{ padding: "9px 12px", fontWeight: 600 }}>{r.clave}</td>
                      <td style={tdC}>
                        <span style={{
                          fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 7,
                          background: r.nacional ? "rgba(34,197,94,.14)" : "rgba(59,130,246,.14)",
                          color: r.nacional ? VERDE : "#3b82f6",
                        }}>{r.nacional ? "🇨🇴 Nacional" : "🌎 Internacional"}</span>
                      </td>
                      <td style={tdC}>{r.sondeos}</td>
                      <td style={tdC}>{r.latencia_med_ms ?? "—"}</td>
                      <td style={tdC}>{r.latencia_p95_ms ?? "—"}</td>
                      <td style={tdC}>{r.bloqueos || ""}</td>
                      <td style={tdC}>{r.timeouts || ""}</td>
                      <td style={tdC}>{r.errores || ""}</td>
                      <td style={tdC}><span style={{ background: bg, color: fg, fontWeight: 800, fontSize: 11, padding: "3px 8px", borderRadius: 7 }}>{r.ultimo_estado || "—"}</span></td>
                    </tr>
                  );
                })}
                {reporte && !reporte.disponibilidad.length && (
                  <tr><td colSpan={9} style={{ padding: 24, textAlign: "center", color: T.muted }}>
                    Aún no hay datos de monitoreo.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Seccion>
    </div>
  );
};


// Gráfico de barras dependency-free: una barra por día, alto ∝ fuentes caídas.
const GraficoFallos = ({ datos }) => {
  if (!datos || !datos.length) {
    return <p style={{ color: T.muted }}>Aún no hay historial de sondeos para graficar.</p>;
  }
  const max = Math.max(...datos.map((d) => d.fallos), 1);
  return (
    <div className="th-panel" style={{ borderRadius: 16, padding: "22px 20px 14px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 200, overflowX: "auto", paddingBottom: 6 }}>
        {datos.map((d) => {
          const h = Math.max(4, Math.round((d.fallos / max) * 160));
          return (
            <div key={d.fecha}
              title={`${d.fecha}: ${d.fallos} fuentes caídas de ${d.total} sondeadas`}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 40 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: ROJO }}>{d.fallos}</span>
              <div style={{
                width: 28, height: h, borderRadius: "7px 7px 0 0",
                background: `linear-gradient(180deg, ${ROJO}, rgba(239,68,68,.45))`,
              }} />
              <span style={{ fontSize: 10, color: T.muted, whiteSpace: "nowrap" }}>{d.fecha.slice(5)}</span>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 12, color: T.muted, marginTop: 10 }}>
        Cada barra es un día: número de fuentes que fallaron (bloqueo, timeout, error o no encontrado).
        Una fuente puede caer hoy y volver a funcionar mañana.
      </div>
    </div>
  );
};

const KpiCard = ({ label, val }) => (
  <div className="th-card" style={cardStyle}>
    <div style={{ fontSize: 11, fontWeight: 800, color: T.muted, marginBottom: 6, letterSpacing: .5 }}>{label}</div>
    <div style={{ fontSize: 32, fontWeight: 800, color: T.text }}>{val}</div>
  </div>
);

const Seccion = ({ titulo, children }) => (
  <div style={{ marginTop: 30 }}>
    <h2 style={{ fontSize: 17, fontWeight: 800, margin: "0 0 12px", color: T.text }}>{titulo}</h2>
    {children}
  </div>
);

export default MonitoreoFuentes;
