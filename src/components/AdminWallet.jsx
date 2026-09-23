import React, { useCallback, useEffect, useState } from "react";
import AdminWalletEsquemas from "./AdminWalletEsquemas";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Tokens de tema de la app (claro/oscuro automático) — mismo patrón que AdminMonitoreo.
const T = {
  text: "rgb(var(--th-content))",
  muted: "rgb(var(--th-content) / 0.6)",
  brand: "rgb(var(--th-brand))",
  brand2: "rgb(var(--th-brand-2))",
  surface: "rgb(var(--th-surface))",
  surface2: "rgb(var(--th-surface-2))",
  line: "rgb(var(--th-line) / 0.14)",
};

const VERDE = "#22c55e", AMBAR = "#f59e0b", ROJO = "#ef4444";

const METODO_LABEL = {
  rostro: "Rostro (Face ID)",
  cedula: "Cédula verificada",
  telefono: "Teléfono verificado",
};

function Badge({ ok, textoOk = "Sí", textoNo = "No" }) {
  const color = ok ? VERDE : ROJO;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 999,
      fontSize: 12, fontWeight: 700, background: `${color}22`, color,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: 999, background: color }} />
      {ok ? textoOk : textoNo}
    </span>
  );
}

const botonRevocarStyle = {
  cursor: "pointer", padding: "2px 8px", borderRadius: 8, fontSize: 10, fontWeight: 700,
  color: ROJO, background: `${ROJO}18`, border: `1px solid ${ROJO}55`,
};

const METODO_LABEL_ACCION = { rostro: "el rostro", cedula: "la cédula verificada", telefono: "el teléfono verificado" };

function KpiCard({ icono, titulo, valor, sub }) {
  return (
    <div style={{
      flex: "1 1 180px", background: T.surface2, border: `1px solid ${T.line}`, borderRadius: 16,
      padding: "16px 18px",
    }}>
      <div style={{ fontSize: 22 }}>{icono}</div>
      <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6 }}>{valor}</div>
      <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{titulo}</div>
      {sub && <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function AdminWallet() {
  const token = localStorage.getItem("token");
  const auth = { Authorization: `Token ${token}` };

  // Superadmin Econfia ve todo el panel; el admin de una Entidad (org-admin)
  // solo ve la pestaña de Esquemas de credenciales.
  const usuarioLocal = (() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } })();
  const esSuperadmin = !!(usuarioLocal?.is_staff || usuarioLocal?.is_superuser);

  const [resumen, setResumen] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [revocaciones, setRevocaciones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [pestana, setPestana] = useState(esSuperadmin ? "usuarios" : "esquemas"); // usuarios | revocaciones | esquemas
  const [error, setError] = useState("");
  const [revocando, setRevocando] = useState(""); // `${perfil_id}-${metodo}` en curso, o ""
  const [dispositivosModal, setDispositivosModal] = useState(null); // { usuario, dispositivos } | null
  const [cargandoDispositivos, setCargandoDispositivos] = useState(false);

  const cargar = useCallback(async (q = "") => {
    if (!token) return;
    setCargando(true);
    setError("");
    try {
      const [rResumen, rUsuarios, rRevocaciones] = await Promise.all([
        fetch(`${API_URL}/api/admin/wallet/resumen/`, { headers: auth }),
        fetch(`${API_URL}/api/admin/wallet/usuarios/${q ? `?q=${encodeURIComponent(q)}` : ""}`, { headers: auth }),
        fetch(`${API_URL}/api/admin/wallet/revocaciones/`, { headers: auth }),
      ]);
      if (!rResumen.ok || !rUsuarios.ok || !rRevocaciones.ok) {
        throw new Error("No se pudo cargar la información. Verifique sus permisos de administrador.");
      }
      setResumen(await rResumen.json());
      setUsuarios((await rUsuarios.json()).usuarios || []);
      setRevocaciones((await rRevocaciones.json()).revocaciones || []);
    } catch (e) {
      setError(e.message || "Error al cargar el panel de Wallet.");
    } finally {
      setCargando(false);
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  // El org-admin no llama a los endpoints de superadmin (dan 403): solo usa Esquemas.
  useEffect(() => { if (esSuperadmin) cargar(); }, [cargar, esSuperadmin]);

  const buscar = (e) => {
    e.preventDefault();
    cargar(busqueda.trim());
  };

  const revocar = async (usuario, metodo) => {
    const etiqueta = METODO_LABEL_ACCION[metodo] || metodo;
    if (!window.confirm(
      `¿Revocar ${etiqueta} de "${usuario.usuario}"? Deberá volver a verificarlo.`
    )) return;
    const clave = `${usuario.perfil_id}-${metodo}`;
    setRevocando(clave);
    try {
      const res = await fetch(`${API_URL}/api/admin/wallet/usuarios/${usuario.perfil_id}/revocar/`, {
        method: "POST",
        headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify({ metodo }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        alert(data?.error || "No se pudo revocar."); // eslint-disable-line no-alert
        return;
      }
      cargar(busqueda.trim());
    } catch {
      alert("Error de conexión al revocar."); // eslint-disable-line no-alert
    } finally {
      setRevocando("");
    }
  };

  const verDispositivos = async (usuario) => {
    setDispositivosModal({ usuario: usuario.usuario, dispositivos: [] });
    setCargandoDispositivos(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/wallet/usuarios/${usuario.perfil_id}/dispositivos/`, { headers: auth });
      const data = await res.json().catch(() => null);
      setDispositivosModal({ usuario: usuario.usuario, dispositivos: res.ok ? (data?.dispositivos || []) : [] });
    } catch {
      setDispositivosModal({ usuario: usuario.usuario, dispositivos: [] });
    } finally {
      setCargandoDispositivos(false);
    }
  };

  return (
    <div style={{
      fontFamily: "Segoe UI, system-ui, sans-serif", color: T.text,
      // El header (disco) del layout reserva 340px y deja ~90px vacíos debajo;
      // en superadmin cerramos ese hueco, pero en admin de organización
      // dejamos más aire para que el formulario no se monte con el taskbar.
      minHeight: "100vh",
      padding: esSuperadmin ? "0 32px 48px" : "36px 32px 56px",
      boxSizing: "border-box",
      maxWidth: 1360,
      margin: esSuperadmin ? "-84px auto 0" : "-28px auto 0",
    }}>
      {/* Cabecera */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, display: "flex", alignItems: "center", gap: 10 }}>
            <span>🪪</span> Admin econfiaWallet
          </h1>
          <p style={{ margin: "6px 0 0", color: T.muted }}>
            Control de verificación de identidad (rostro, cédula, teléfono) según los requerimientos de Certicámara.
          </p>
        </div>
        <form onSubmit={buscar} style={{ display: "flex", gap: 8 }}>
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar usuario o correo…"
            style={{
              padding: "10px 14px", borderRadius: 12, border: `1px solid ${T.line}`,
              background: T.surface2, color: T.text, minWidth: 220,
            }}
          />
          <button type="submit" style={{
            cursor: "pointer", padding: "10px 18px", borderRadius: 12, fontWeight: 800,
            color: T.surface, border: "none", background: `linear-gradient(120deg, ${T.brand}, ${T.brand2})`,
          }}>Buscar</button>
        </form>
      </div>

      {error && (
        <div style={{
          marginTop: 20, padding: "12px 16px", borderRadius: 12, background: `${ROJO}18`,
          color: ROJO, fontWeight: 600, fontSize: 13,
        }}>{error}</div>
      )}

      {/* KPIs */}
      {resumen && (
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 24 }}>
          <KpiCard icono="👥" titulo="Perfiles con Wallet" valor={resumen.total_perfiles_wallet} />
          <KpiCard icono="🙂" titulo="Con rostro registrado" valor={resumen.con_rostro_registrado}
            sub={resumen.total_perfiles_wallet ? `${Math.round((resumen.con_rostro_registrado / resumen.total_perfiles_wallet) * 100)}%` : null} />
          <KpiCard icono="🪪" titulo="Con cédula verificada" valor={resumen.con_cedula_verificada}
            sub={resumen.total_perfiles_wallet ? `${Math.round((resumen.con_cedula_verificada / resumen.total_perfiles_wallet) * 100)}%` : null} />
          <KpiCard icono="💬" titulo="Con teléfono verificado" valor={resumen.con_telefono_verificado}
            sub={resumen.total_perfiles_wallet ? `${Math.round((resumen.con_telefono_verificado / resumen.total_perfiles_wallet) * 100)}%` : null} />
          <KpiCard icono="🔒" titulo="Revocaciones totales" valor={resumen.revocaciones_totales} />
        </div>
      )}

      {/* Pestañas */}
      <div style={{ display: "flex", gap: 8, marginTop: 28, borderBottom: `1px solid ${T.line}` }}>
        {[
          ...(esSuperadmin ? [
            { key: "usuarios", label: `Usuarios (${usuarios.length})` },
            { key: "revocaciones", label: `Revocaciones (${revocaciones.length})` },
          ] : []),
          { key: "esquemas", label: "Esquemas de credenciales" },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setPestana(tab.key)}
            style={{
              cursor: "pointer", padding: "10px 16px", border: "none", background: "transparent",
              borderBottom: pestana === tab.key ? `3px solid ${T.brand}` : "3px solid transparent",
              color: pestana === tab.key ? T.text : T.muted, fontWeight: 700, fontSize: 14,
            }}>{tab.label}</button>
        ))}
      </div>

      {cargando && <p style={{ color: T.muted, marginTop: 16 }}>Cargando…</p>}

      {/* Tabla de usuarios */}
      {!cargando && pestana === "usuarios" && (
        <div style={{ overflowX: "auto", marginTop: 16 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left", color: T.muted, borderBottom: `1px solid ${T.line}` }}>
                <th style={{ padding: "10px 12px" }}>Usuario</th>
                <th style={{ padding: "10px 12px" }}>Cédula</th>
                <th style={{ padding: "10px 12px" }}>Nombre</th>
                <th style={{ padding: "10px 12px", textAlign: "center" }}>Rostro</th>
                <th style={{ padding: "10px 12px", textAlign: "center" }}>Cédula verificada</th>
                <th style={{ padding: "10px 12px", textAlign: "center" }}>Teléfono</th>
                <th style={{ padding: "10px 12px", textAlign: "center" }}>Dispositivos</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 20, textAlign: "center", color: T.muted }}>
                  Ningún usuario con econfiaWallet todavía.
                </td></tr>
              ) : usuarios.map((u) => (
                <tr key={u.perfil_id} style={{ borderBottom: `1px solid ${T.line}` }}>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ fontWeight: 700 }}>{u.usuario}</div>
                    <div style={{ color: T.muted, fontSize: 11 }}>{u.email}</div>
                  </td>
                  <td style={{ padding: "10px 12px" }}>{u.cedula || "—"}</td>
                  <td style={{ padding: "10px 12px" }}>{u.nombre_completo || "—"}</td>
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <Badge ok={u.rostro_registrado} />
                      {u.rostro_registrado && (
                        <button onClick={() => revocar(u, "rostro")} disabled={revocando === `${u.perfil_id}-rostro`}
                          style={botonRevocarStyle}>
                          {revocando === `${u.perfil_id}-rostro` ? "…" : "Revocar"}
                        </button>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <span style={{
                        fontSize: 12, fontWeight: 700,
                        color: u.cedula_estado === "verificado" ? VERDE : u.cedula_estado === "rechazado" ? ROJO : u.cedula_estado === "pendiente" ? AMBAR : T.muted,
                      }}>
                        {u.cedula_estado_label || "Sin subir"}
                      </span>
                      {u.cedula_estado === "verificado" && (
                        <button onClick={() => revocar(u, "cedula")} disabled={revocando === `${u.perfil_id}-cedula`}
                          style={botonRevocarStyle}>
                          {revocando === `${u.perfil_id}-cedula` ? "…" : "Revocar"}
                        </button>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <Badge ok={u.telefono_verificado} />
                      {u.telefono_verificado && (
                        <button onClick={() => revocar(u, "telefono")} disabled={revocando === `${u.perfil_id}-telefono`}
                          style={botonRevocarStyle}>
                          {revocando === `${u.perfil_id}-telefono` ? "…" : "Revocar"}
                        </button>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>
                    <button onClick={() => verDispositivos(u)} style={{
                      cursor: "pointer", padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                      color: T.text, background: T.surface2, border: `1px solid ${T.line}`,
                    }}>
                      📱 {u.dispositivos_count}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tabla de revocaciones */}
      {!cargando && pestana === "revocaciones" && (
        <div style={{ overflowX: "auto", marginTop: 16 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left", color: T.muted, borderBottom: `1px solid ${T.line}` }}>
                <th style={{ padding: "10px 12px" }}>Fecha</th>
                <th style={{ padding: "10px 12px" }}>Usuario</th>
                <th style={{ padding: "10px 12px" }}>Método</th>
                <th style={{ padding: "10px 12px" }}>Motivo</th>
                <th style={{ padding: "10px 12px" }}>Revocado por</th>
              </tr>
            </thead>
            <tbody>
              {revocaciones.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 20, textAlign: "center", color: T.muted }}>
                  Sin revocaciones registradas todavía.
                </td></tr>
              ) : revocaciones.map((r) => (
                <tr key={r.id} style={{ borderBottom: `1px solid ${T.line}` }}>
                  <td style={{ padding: "10px 12px", color: T.muted }}>
                    {new Date(r.fecha).toLocaleString("es-CO")}
                  </td>
                  <td style={{ padding: "10px 12px", fontWeight: 700 }}>{r.usuario}</td>
                  <td style={{ padding: "10px 12px" }}>{METODO_LABEL[r.metodo] || r.metodo_label}</td>
                  <td style={{ padding: "10px 12px", color: T.muted }}>{r.motivo}</td>
                  <td style={{ padding: "10px 12px" }}>{r.revocado_por || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Configuración dinámica de esquemas de credenciales (Certicámara) */}
      {pestana === "esquemas" && <AdminWalletEsquemas esSuperadmin={esSuperadmin} />}

      {dispositivosModal && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.6)", padding: 16,
          }}
          onClick={() => setDispositivosModal(null)}
        >
          <div
            style={{
              width: "100%", maxWidth: 420, maxHeight: "80vh", overflowY: "auto",
              background: T.surface, border: `1px solid ${T.line}`, borderRadius: 16, padding: 22,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Dispositivos de {dispositivosModal.usuario}</h3>
            <p style={{ margin: "4px 0 14px", color: T.muted, fontSize: 12 }}>
              Solo visibilidad — no hay revocación por dispositivo individual todavía.
            </p>
            {cargandoDispositivos ? (
              <p style={{ color: T.muted, fontSize: 13 }}>Cargando…</p>
            ) : dispositivosModal.dispositivos.length === 0 ? (
              <p style={{ color: T.muted, fontSize: 13 }}>Sin dispositivos registrados.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {dispositivosModal.dispositivos.map((d, i) => (
                  <div key={i} style={{
                    padding: "10px 12px", borderRadius: 10, background: T.surface2, border: `1px solid ${T.line}`,
                  }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>📱 {d.nombre}</div>
                    <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
                      Último acceso: {new Date(d.ultimo_acceso).toLocaleString("es-CO")}
                      {d.ultima_ip ? ` · IP ${d.ultima_ip}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setDispositivosModal(null)} style={{
              marginTop: 16, cursor: "pointer", padding: "8px 16px", borderRadius: 10, fontWeight: 700,
              color: T.text, background: T.surface2, border: `1px solid ${T.line}`,
            }}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
