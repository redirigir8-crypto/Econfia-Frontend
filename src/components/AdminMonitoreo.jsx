import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Tokens de tema de la app (claro/oscuro automático)
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

// Colores semánticos de estado (válidos en cualquier tema)
const VERDE = "#22c55e", AMBAR = "#f59e0b", ROJO = "#ef4444";
const ESTADO_COLOR = {
  ok: ["rgba(34,197,94,.18)", VERDE], lento: ["rgba(245,158,11,.18)", AMBAR],
  bloqueo: ["rgba(239,68,68,.18)", ROJO], no_encontrado: ["rgba(239,68,68,.18)", ROJO],
  error_servidor: ["rgba(239,68,68,.18)", ROJO], error: ["rgba(239,68,68,.18)", ROJO],
  timeout: ["rgba(245,158,11,.18)", AMBAR],
};
const dispColor = (p) => (p >= 90 ? VERDE : p >= 50 ? AMBAR : ROJO);

const cardStyle = {
  borderRadius: 16, padding: 18,
};
const tdC = { padding: "9px 12px", textAlign: "center" };

// Descripción de cada columna de la tabla (para tooltip + modal de ayuda)
const COLUMNAS = [
  { key: "Fuente", tip: "Nombre interno de la fuente / bot que se está monitoreando." },
  { key: "Sondeos", tip: "Cuántas veces se ha sondeado la fuente en la ventana elegida (7/30/90 días)." },
  { key: "Disp %", tip: "% de sondeos exitosos (respondió OK o lento). Verde ≥90%, ámbar ≥50%, rojo por debajo." },
  { key: "Lat. med (ms)", tip: "Latencia mediana: el tiempo típico que tarda la fuente en responder, en milisegundos." },
  { key: "P95", tip: "Latencia del percentil 95: el 95% de las respuestas fueron más rápidas que este valor (mide los picos lentos)." },
  { key: "Bloq.", tip: "Veces que la fuente respondió con bloqueo: 403, 429 o captcha/anti-bot." },
  { key: "T/O", tip: "Timeouts: la fuente no respondió dentro del límite de 15 segundos." },
  { key: "Err.", tip: "Errores de conexión, SSL o error de servidor (5xx)." },
  { key: "Último", tip: "Estado del sondeo más reciente de esta fuente." },
];

// Significado de cada estado posible
const ESTADOS_DOC = [
  ["ok", "Respondió correctamente y rápido."],
  ["lento", "Respondió, pero tardó más de 5 segundos."],
  ["bloqueo", "La fuente bloqueó la petición (403/429) o exige captcha."],
  ["no_encontrado", "La URL devolvió 404 (puede requerir ajustar la URL objetivo)."],
  ["error_servidor", "La fuente devolvió un error 5xx."],
  ["timeout", "No respondió dentro de los 15 segundos."],
  ["error", "Falló la conexión o el certificado SSL."],
];

const AdminMonitoreo = () => {
  const token = localStorage.getItem("token");
  const auth = { Authorization: `Token ${token}` };

  const [dias, setDias] = useState(30);
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [sondeando, setSondeando] = useState(false);
  const [progreso, setProgreso] = useState({ hechos: 0, total: 0 });
  const [toast, setToast] = useState(null);
  const [ayuda, setAyuda] = useState(false);
  const pollRef = useRef(null);

  const notificar = (msg, tipo = "ok") => setToast({ msg, tipo });
  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 3500); return () => clearTimeout(t); }
  }, [toast]);

  const cargarReporte = useCallback(async (d = dias) => {
    if (!token) return;
    setCargando(true);
    try {
      const r = await fetch(`${API_URL}/api/admin/monitor/reporte/?dias=${d}`, { headers: auth });
      if (!r.ok) throw new Error("No autorizado o error del servidor");
      setReporte(await r.json());
    } catch (e) {
      notificar(e.message, "err");
    } finally {
      setCargando(false);
    }
  }, [dias, token]);   // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { cargarReporte(); }, [cargarReporte]);
  useEffect(() => () => clearInterval(pollRef.current), []);

  const lanzarSondeo = async () => {
    try {
      const r = await fetch(`${API_URL}/api/admin/monitor/sondear/`, {
        method: "POST", headers: { ...auth, "Content-Type": "application/json" }, body: "{}",
      });
      const data = await r.json();
      if (r.status === 409) { notificar("Ya hay un sondeo en curso.", "err"); return; }
      if (!r.ok) { notificar(data.detail || "Error al iniciar", "err"); return; }
      setSondeando(true);
      setProgreso({ hechos: 0, total: data.total });
      notificar(`Sondeo iniciado (${data.total} fuentes)…`);
      pollRef.current = setInterval(async () => {
        const e = await (await fetch(`${API_URL}/api/admin/monitor/estado/`, { headers: auth })).json();
        setProgreso({ hechos: e.hechos, total: e.total });
        if (!e.corriendo) {
          clearInterval(pollRef.current);
          setSondeando(false);
          notificar("Sondeo completado ✔");
          cargarReporte();
        }
      }, 1500);
    } catch (e) {
      notificar("Error de red al iniciar el sondeo", "err");
    }
  };

  const descargarExcel = async () => {
    try {
      const r = await fetch(`${API_URL}/api/admin/monitor/excel/?dias=${dias}`, { headers: auth });
      if (!r.ok) throw new Error("No se pudo generar el Excel");
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "");
      a.href = url; a.download = `monitoreo_fuentes_${stamp}.xlsx`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      notificar("Excel descargado ✔");
    } catch (e) {
      notificar(e.message, "err");
    }
  };

  const cambiarDias = (d) => { setDias(d); cargarReporte(d); };

  const kpi = reporte?.kpi;
  const pct = progreso.total ? Math.round((progreso.hechos / progreso.total) * 100) : 0;

  return (
    <div style={{
      fontFamily: "Segoe UI, system-ui, sans-serif", color: T.text,
      minHeight: "100vh", padding: "120px 32px 48px", boxSizing: "border-box",
      maxWidth: 1360, margin: "0 auto",
    }}>
      {/* Cabecera */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, display: "flex", alignItems: "center", gap: 10 }}>
            <span>📡</span> Monitoreo de fuentes
          </h1>
          <p style={{ margin: "6px 0 0", color: T.muted }}>
            Disponibilidad, latencia y frecuencia de actualización de las fuentes externas.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={() => setAyuda(true)} title="Cómo funciona este panel"
            style={{
              cursor: "pointer", padding: "9px 14px", borderRadius: 12, fontWeight: 800,
              color: T.text, background: T.surface2, border: `1px solid ${T.line}`,
            }}>ℹ️ ¿Cómo funciona?</button>
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
          <button onClick={lanzarSondeo} disabled={sondeando}
            style={{
              border: "none", cursor: sondeando ? "default" : "pointer", padding: "11px 20px", borderRadius: 12,
              fontWeight: 800, color: T.surface, opacity: sondeando ? 0.7 : 1,
              background: `linear-gradient(120deg, ${T.brand}, ${T.brand2})`,
              boxShadow: `0 8px 20px rgb(var(--th-brand) / 0.28)`,
            }}>
            {sondeando ? `Sondeando… ${pct}%` : "▶ Ejecutar sondeo ahora"}
          </button>
          <button onClick={descargarExcel}
            style={{
              cursor: "pointer", padding: "11px 20px", borderRadius: 12, fontWeight: 800,
              color: T.brand, background: "transparent", border: `1.5px solid ${T.brand}`,
            }}>⬇ Descargar Excel</button>
        </div>
      </div>

      {/* Barra de progreso */}
      {sondeando && (
        <div style={{ marginTop: 18, background: T.surface2, borderRadius: 999, height: 10, overflow: "hidden", border: `1px solid ${T.line}` }}>
          <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${T.brand}, ${T.brand2})`, transition: "width .4s" }} />
        </div>
      )}

      {/* KPIs */}
      {kpi && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 16, marginTop: 24 }}>
          <KpiCard label="FUENTES MONITOREADAS" val={kpi.fuentes_monitoreadas} />
          <KpiCard label="SONDEOS TOTALES" val={kpi.sondeos_totales} />
          <KpiCard label="DISPONIBILIDAD PROMEDIO" val={`${kpi.disponibilidad_promedio_pct}%`}
            color={dispColor(kpi.disponibilidad_promedio_pct)} />
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

      {/* Tabla disponibilidad */}
      <Seccion titulo="Disponibilidad y latencia (peores primero)">
        {cargando ? <p style={{ color: T.muted }}>Cargando…</p> : (
          <div className="th-panel" style={{ overflowX: "auto", borderRadius: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, color: T.text }}>
              <thead>
                <tr style={{ background: T.surface2 }}>
                  {COLUMNAS.map((c) => (
                    <th key={c.key} title={c.tip}
                      style={{ padding: "12px", textAlign: c.key === "Fuente" ? "left" : "center", fontWeight: 800, color: T.muted, borderBottom: `1px solid ${T.line}`, cursor: "help", whiteSpace: "nowrap" }}>
                      {c.key} <span style={{ opacity: 0.5, fontWeight: 400 }}>ⓘ</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(reporte?.disponibilidad || []).slice(0, 60).map((r, i) => {
                  const [bg, fg] = ESTADO_COLOR[r.ultimo_estado] || ["rgb(var(--th-line) / 0.15)", T.text];
                  return (
                    <tr key={r.clave} style={{ background: i % 2 ? T.lineSoft : "transparent" }}>
                      <td style={{ padding: "9px 12px", fontWeight: 600 }}>{r.clave}</td>
                      <td style={tdC}>{r.sondeos}</td>
                      <td style={{ ...tdC, fontWeight: 800, color: dispColor(r.disponibilidad_pct) }}>{r.disponibilidad_pct}%</td>
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
                    Aún no hay sondeos. Pulsa “Ejecutar sondeo ahora”.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Seccion>

      {/* Frecuencia de boletines */}
      <Seccion titulo="Frecuencia real de boletines">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
          {(reporte?.frecuencia_boletines || []).map((b) => (
            <div key={b.clave} className="th-card" style={cardStyle}>
              <div style={{ fontWeight: 800, color: T.muted, fontSize: 12, letterSpacing: .5 }}>{b.clave.replace("boletin_", "").toUpperCase()}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: T.brand, margin: "6px 0" }}>{b.cadencia}</div>
              <div style={{ fontSize: 12, color: T.muted }}>{b.registros} registros · {b.lotes_de_carga} lotes</div>
            </div>
          ))}
        </div>
      </Seccion>

      {ayuda && <HelpModal onClose={() => setAyuda(false)} />}

      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, padding: "12px 20px", borderRadius: 12, color: "#fff",
          fontWeight: 800, background: toast.tipo === "err" ? ROJO : VERDE, boxShadow: "0 8px 24px rgba(0,0,0,.3)", zIndex: 60,
        }}>{toast.msg}</div>
      )}
    </div>
  );
};

const HelpModal = ({ onClose }) => {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal((
    <div onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(2,6,20,.68)", backdropFilter: "blur(4px)", padding: 20,
      }}>
      <div onClick={(e) => e.stopPropagation()} className="th-panel"
        style={{
          borderRadius: 20, maxWidth: 680, width: "100%", maxHeight: "86vh", color: T.text,
          display: "flex", flexDirection: "column", overflow: "hidden",
          boxShadow: "0 30px 80px rgba(0,0,0,.5)", border: `1px solid rgb(var(--th-brand) / 0.25)`,
        }}>
        {/* Cabecera fija */}
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
            <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800 }}>Cómo funciona el monitoreo</h2>
            <div style={{ fontSize: 12.5, color: T.muted, marginTop: 2 }}>Guía rápida del panel de fuentes</div>
          </div>
          <button onClick={onClose} aria-label="Cerrar"
            style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0, cursor: "pointer",
              background: T.lineSoft, border: `1px solid ${T.line}`, color: T.text, fontSize: 20, fontWeight: 700, lineHeight: 1,
            }}>×</button>
        </div>

        {/* Cuerpo con scroll */}
        <div style={{ padding: "20px 24px", overflowY: "auto" }}>
          {/* Intro destacada */}
          <div style={{
            borderLeft: `3px solid ${T.brand}`, background: T.lineSoft, borderRadius: 10,
            padding: "12px 14px", fontSize: 13.5, lineHeight: 1.55, color: T.muted, marginBottom: 22,
          }}>
            Revisa periódicamente las fuentes externas con una <b style={{ color: T.text }}>sonda ligera</b>
            {" "}(una petición web, sin ejecutar el bot completo ni gastar captcha) y mide tres cosas:{" "}
            <b style={{ color: T.text }}>disponibilidad</b>, <b style={{ color: T.text }}>latencia</b> y{" "}
            <b style={{ color: T.text }}>frecuencia de actualización</b>.
          </div>

          <Bloque icon="🔘" titulo="Botones">
            <Def chip="▶ Ejecutar sondeo ahora">Lanza un sondeo de todas las fuentes en segundo plano; verás una barra de progreso en vivo.</Def>
            <Def chip="⬇ Descargar Excel">Descarga todo el reporte con formato y colores en un archivo .xlsx.</Def>
            <Def chip="7d / 30d / 90d">Cambia la ventana de tiempo sobre la que se calculan las estadísticas.</Def>
          </Bloque>

          <Bloque icon="📊" titulo="Columnas de la tabla">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 10 }}>
              {COLUMNAS.map((c) => <Def key={c.key} chip={c.key}>{c.tip}</Def>)}
            </div>
          </Bloque>

          <Bloque icon="🚦" titulo="Estados">
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {ESTADOS_DOC.map(([e, d]) => {
                const [bg, fg] = ESTADO_COLOR[e] || ["rgb(var(--th-line) / 0.15)", T.text];
                return (
                  <div key={e} style={{ display: "flex", gap: 12, alignItems: "center", padding: "6px 8px", borderRadius: 8, background: T.lineSoft }}>
                    <span style={{ background: bg, color: fg, fontWeight: 800, fontSize: 11, padding: "4px 9px", borderRadius: 7, minWidth: 104, textAlign: "center" }}>{e}</span>
                    <span style={{ fontSize: 13, color: T.muted }}>{d}</span>
                  </div>
                );
              })}
            </div>
          </Bloque>

          <Bloque icon="🔄" titulo="Frecuencia de actualización">
            <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.55 }}>
              Para los <b style={{ color: T.text }}>boletines</b> (Fiscalía, Procuraduría, etc.) la cadencia
              real se calcula desde la base de datos. Para el resto, se infiere detectando cambios en el
              contenido entre sondeos — necesita varias semanas de historial para ser fiable.
            </div>
          </Bloque>
        </div>
      </div>
    </div>
  ), document.body);
};

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

const KpiCard = ({ label, val, color }) => (
  <div className="th-card" style={cardStyle}>
    <div style={{ fontSize: 11, fontWeight: 800, color: T.muted, marginBottom: 6, letterSpacing: .5 }}>{label}</div>
    <div style={{ fontSize: 32, fontWeight: 800, color: color || T.text }}>{val}</div>
  </div>
);

const Seccion = ({ titulo, children }) => (
  <div style={{ marginTop: 30 }}>
    <h2 style={{ fontSize: 17, fontWeight: 800, margin: "0 0 12px", color: T.text }}>{titulo}</h2>
    {children}
  </div>
);

export default AdminMonitoreo;
