import React, { useCallback, useEffect, useState } from "react";
import CredencialCard from "./CredencialCard";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const T = {
  text: "rgb(var(--th-content))",
  muted: "rgb(var(--th-content) / 0.6)",
  brand: "rgb(var(--th-brand))",
  brand2: "rgb(var(--th-brand-2))",
  surface: "rgb(var(--th-surface))",
  surface2: "rgb(var(--th-surface-2))",
  line: "rgb(var(--th-line) / 0.14)",
};
const ROJO = "#ef4444", VERDE = "#22c55e", AMBAR = "#f59e0b";

const TIPOS = [
  { value: "texto", label: "Texto" },
  { value: "numero", label: "Número" },
  { value: "fecha", label: "Fecha" },
  { value: "booleano", label: "Sí / No" },
  { value: "lista", label: "Lista de opciones" },
  { value: "archivo", label: "Archivo" },
];
const ESTADO_COLOR = { borrador: AMBAR, publicado: VERDE, archivado: T.muted };

const authHeaders = (extra = {}) => ({ Authorization: `Token ${localStorage.getItem("token")}`, ...extra });
const input = { padding: "9px 12px", borderRadius: 10, border: `1px solid ${T.line}`, background: T.surface2, color: T.text, fontSize: 13, width: "100%", boxSizing: "border-box" };
const btn = (bg, color = "#fff") => ({ cursor: "pointer", padding: "8px 14px", borderRadius: 10, border: "none", background: bg, color, fontWeight: 700, fontSize: 13 });
const CAMPO_VACIO = () => ({ etiqueta: "", tipo: "texto", requerido: false, ayuda: "", validacion: { opciones: [], regex: "" } });

// Campos de muestra para el modal "así queda".
const EJEMPLO_CAMPOS = [
  { clave: "razon_social", etiqueta: "Razón social", tipo: "texto", grupo: "Datos de la empresa" },
  { clave: "nit", etiqueta: "NIT", tipo: "texto", grupo: "Datos de la empresa" },
  { clave: "matricula_mercantil", etiqueta: "Matrícula mercantil", tipo: "texto", grupo: "Datos de la empresa" },
  { clave: "estado", etiqueta: "Estado de la matrícula", tipo: "texto", grupo: "Datos de la empresa" },
  { clave: "rep_nombre", etiqueta: "Representante legal", tipo: "texto", grupo: "Representante legal" },
  { clave: "vigente", etiqueta: "Sociedad vigente", tipo: "booleano", grupo: "Representante legal" },
];

export default function AdminWalletEsquemas({ esSuperadmin = true }) {
  const [esquemas, setEsquemas] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [vista, setVista] = useState("lista"); // "lista" | "editor" | "emitir" | "credenciales"
  const [form, setForm] = useState(null); // { id?, nombre, codigo, descripcion, organizacion_id, estado, campos: [] }
  const [emitForm, setEmitForm] = useState(null); // { esquema, valores: {} }
  const [emitFiles, setEmitFiles] = useState({}); // { clave: File } para campos tipo archivo
  const [titularQuery, setTitularQuery] = useState("");
  const [titulares, setTitulares] = useState([]);
  const [titularSel, setTitularSel] = useState(null);
  const [nitRues, setNitRues] = useState("");
  const [ruesCargando, setRuesCargando] = useState(false);
  const [credenciales, setCredenciales] = useState([]);
  const [ultimaEmitida, setUltimaEmitida] = useState(null);
  const [ejemploOpen, setEjemploOpen] = useState(false);
  const [adminsOpen, setAdminsOpen] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminOrg, setAdminOrg] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/wallet/esquemas/`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudieron cargar los esquemas.");
      setEsquemas(data.esquemas || []);
      setError("");
    } catch (e) { setError(e.message); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);
  useEffect(() => {
    // Solo el superadmin elige organización; el org-admin queda forzado a la suya.
    if (!esSuperadmin) return;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/organizaciones/`, { headers: authHeaders() });
        const data = await res.json();
        if (res.ok) setOrgs(Array.isArray(data) ? data : (data.results || []));
      } catch { /* si falla, solo queda "Global" */ }
    })();
  }, [esSuperadmin]);

  const nuevo = () => setForm({ nombre: "", codigo: "", descripcion: "", color: "#10b981", organizacion_id: "", campos: [] });
  const editar = (e) => setForm({
    id: e.id, nombre: e.nombre, codigo: e.codigo, descripcion: e.descripcion, color: e.color || "#10b981",
    organizacion_id: e.organizacion_id || "", estado: e.estado,
    campos: (e.campos || []).map((c) => ({ ...c, validacion: c.validacion || { opciones: [], regex: "" } })),
  });

  useEffect(() => { setVista(form ? "editor" : "lista"); setMensaje(""); }, [form]);

  // ── acciones de campos ──
  const setCampo = (i, patch) => setForm((f) => ({ ...f, campos: f.campos.map((c, j) => (j === i ? { ...c, ...patch } : c)) }));
  const setValidacion = (i, patch) => setForm((f) => ({ ...f, campos: f.campos.map((c, j) => (j === i ? { ...c, validacion: { ...c.validacion, ...patch } } : c)) }));
  const addCampo = () => setForm((f) => ({ ...f, campos: [...f.campos, CAMPO_VACIO()] }));
  const delCampo = (i) => setForm((f) => ({ ...f, campos: f.campos.filter((_, j) => j !== i) }));
  const moverCampo = (i, dir) => setForm((f) => {
    const arr = [...f.campos]; const j = i + dir;
    if (j < 0 || j >= arr.length) return f;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    return { ...f, campos: arr };
  });

  const guardar = async () => {
    setError(""); setMensaje("");
    const cuerpo = {
      nombre: form.nombre, codigo: form.codigo, descripcion: form.descripcion, color: form.color || "",
      organizacion_id: form.organizacion_id || null,
      campos: form.campos.map((c, i) => ({
        etiqueta: c.etiqueta, tipo: c.tipo, requerido: !!c.requerido, ayuda: c.ayuda || "", grupo: c.grupo || "", orden: i,
        validacion: {
          regex: c.validacion?.regex || "",
          opciones: c.tipo === "lista"
            ? String(c.validacion?.opciones || "").toString().split(",").map((o) => o.trim()).filter(Boolean)
            : [],
        },
      })),
    };
    const editando = !!form.id;
    const url = editando ? `${API_URL}/api/admin/wallet/esquemas/${form.id}/` : `${API_URL}/api/admin/wallet/esquemas/`;
    try {
      const res = await fetch(url, { method: editando ? "PUT" : "POST", headers: authHeaders({ "Content-Type": "application/json" }), body: JSON.stringify(cuerpo) });
      const data = await res.json();
      if (!res.ok) { setError((data.error || "No se pudo guardar.") + (data.detalles ? " " + data.detalles.join(" ") : "")); return; }
      await cargar();
      setVista("lista");
      setForm(null);
      setMensaje("Esquema guardado.");
    } catch { setError("Error de conexión."); }
  };

  const accion = async (id, ruta, ok) => {
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/wallet/esquemas/${id}/${ruta}/`, { method: "POST", headers: authHeaders() });
      if (res.status !== 200) { const d = await res.json().catch(() => ({})); setError(d.error || "No se pudo completar la acción."); return; }
      await cargar(); setMensaje(ok);
    } catch { setError("Error de conexión."); }
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar este esquema en borrador?")) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/wallet/esquemas/${id}/`, { method: "DELETE", headers: authHeaders() });
      if (res.status !== 204) { const d = await res.json().catch(() => ({})); setError(d.error || "No se pudo eliminar."); return; }
      await cargar(); setMensaje("Esquema eliminado.");
    } catch { setError("Error de conexión."); }
  };

  // ── emisión de credenciales ──
  const iniciarEmision = (e) => {
    setUltimaEmitida(null); setError(""); setMensaje(""); setEmitFiles({}); setNitRues("");
    setTitularQuery(""); setTitulares([]); setTitularSel(null);
    setEmitForm({ esquema: e, valores: {} });
    setVista("emitir");
  };
  const setValor = (clave, valor) => setEmitForm((f) => ({ ...f, valores: { ...f.valores, [clave]: valor } }));

  const buscarTitulares = async () => {
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/wallet/titulares/?q=${encodeURIComponent(titularQuery.trim())}`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "No se pudieron buscar titulares."); return; }
      setTitulares(data.titulares || []);
    } catch { setError("Error de conexión buscando titulares."); }
  };

  const emitir = async () => {
    setError(""); setMensaje("");
    const tieneArchivos = Object.values(emitFiles).some(Boolean);
    let opciones;
    if (tieneArchivos) {
      const fd = new FormData();
      fd.append("valores", JSON.stringify(emitForm.valores));
      if (titularSel?.id) fd.append("sujeto_perfil_id", String(titularSel.id));
      Object.entries(emitFiles).forEach(([clave, file]) => { if (file) fd.append(`archivo__${clave}`, file); });
      opciones = { method: "POST", headers: authHeaders(), body: fd }; // el navegador pone el boundary
    } else {
      opciones = {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ valores: emitForm.valores, sujeto_perfil_id: titularSel?.id || null }),
      };
    }
    try {
      const res = await fetch(`${API_URL}/api/admin/wallet/esquemas/${emitForm.esquema.id}/emitir/`, opciones);
      const data = await res.json();
      if (!res.ok) { setError((data.error || "No se pudo emitir.") + (data.detalles ? " " + data.detalles.join(" ") : "")); return; }
      setUltimaEmitida(data);
      setMensaje("Credencial emitida correctamente.");
    } catch { setError("Error de conexión."); }
  };

  // Prellena la credencial desde RUES en vivo (Celery + polling), mapeando por clave.
  const prellenarRues = async () => {
    if (!nitRues.trim()) return;
    setRuesCargando(true); setError(""); setMensaje("Consultando RUES en vivo… puede tardar ~30 s.");
    try {
      const res = await fetch(`${API_URL}/api/admin/wallet/esquemas/prellenar-rues/`, {
        method: "POST", headers: authHeaders({ "Content-Type": "application/json" }), body: JSON.stringify({ nit: nitRues.trim() }),
      });
      const t = await res.json();
      if (!res.ok || !t.task_id) { setError(t.error || "No se pudo iniciar la consulta a RUES."); setRuesCargando(false); return; }
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 3000));
        let data;
        try {
          const e = await fetch(`${API_URL}/api/admin/wallet/esquemas/prellenar-rues/estado/?task=${encodeURIComponent(t.task_id)}`, { headers: authHeaders() });
          data = await e.json();
        } catch { continue; }
        if (data.estado === "pendiente") continue;
        if (data.estado === "listo" && data.encontrado) {
          const datos = data.datos || {};
          setEmitForm((f) => {
            const valores = { ...f.valores };
            (f.esquema.campos || []).forEach((c) => { if (datos[c.clave] != null && datos[c.clave] !== "") valores[c.clave] = datos[c.clave]; });
            return { ...f, valores };
          });
          setMensaje("Datos traídos de RUES. Revisa y completa lo que falte.");
        } else setError(data.mensaje || "No se encontró la empresa en RUES.");
        setRuesCargando(false); return;
      }
      setError("RUES tardó demasiado. Intenta de nuevo."); setRuesCargando(false);
    } catch { setError("Error de conexión."); setRuesCargando(false); }
  };

  const nuevaVersion = async (id) => {
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/wallet/esquemas/${id}/nueva-version/`, { method: "POST", headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "No se pudo crear la versión."); return; }
      await cargar();
      editar(data);
    } catch { setError("Error de conexión."); }
  };

  const cargarCredenciales = useCallback(async () => {
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/wallet/credenciales/`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) setCredenciales(data.credenciales || []);
    } catch { setError("Error de conexión."); }
  }, []);

  const verCredenciales = () => { setError(""); setMensaje(""); setVista("credenciales"); cargarCredenciales(); };

  const descargarPdf = async (credId) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/wallet/credenciales/${credId}/pdf/`, { headers: authHeaders() });
      if (!res.ok) { setError("No se pudo generar el PDF."); return; }
      const url = URL.createObjectURL(await res.blob());
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch { setError("Error de conexión."); }
  };

  const descargarArchivo = async (credId, clave) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/wallet/credenciales/${credId}/archivo/${encodeURIComponent(clave)}/`, { headers: authHeaders() });
      if (!res.ok) { setError("No se pudo descargar el archivo."); return; }
      const url = URL.createObjectURL(await res.blob());
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch { setError("Error de conexión."); }
  };

  const emitInput = (c) => {
    const v = emitForm.valores[c.clave] ?? "";
    const set = (val) => setValor(c.clave, val);
    if (c.tipo === "booleano") return <input type="checkbox" checked={!!emitForm.valores[c.clave]} onChange={(e) => set(e.target.checked)} />;
    if (c.tipo === "fecha") return <input type="date" value={v} onChange={(e) => set(e.target.value)} style={input} />;
    if (c.tipo === "numero") return <input type="number" value={v} onChange={(e) => set(e.target.value)} style={input} />;
    if (c.tipo === "archivo") return <input type="file" onChange={(e) => setEmitFiles((prev) => ({ ...prev, [c.clave]: (e.target.files && e.target.files[0]) || null }))} style={{ ...input, padding: 6 }} />;
    if (c.tipo === "lista") {
      const opts = Array.isArray(c.validacion?.opciones) ? c.validacion.opciones : [];
      return <select value={v} onChange={(e) => set(e.target.value)} style={input}><option value="">Seleccione…</option>{opts.map((o, k) => <option key={k} value={o}>{o}</option>)}</select>;
    }
    return <input type="text" value={v} onChange={(e) => set(e.target.value)} placeholder={c.ayuda || ""} style={input} />;
  };

  // ── admins de Entidad (solo superadmin) ──
  const cargarAdmins = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/wallet/org-admins/`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) setAdmins(data.admins || []);
    } catch { /* silencioso */ }
  }, []);

  const toggleAdmins = () => { const abrir = !adminsOpen; setAdminsOpen(abrir); if (abrir) cargarAdmins(); };

  const otorgarAdmin = async (activar, email, orgId) => {
    const correo = (email ?? adminEmail).trim();
    if (!correo) return;
    setError(""); setMensaje("");
    try {
      const res = await fetch(`${API_URL}/api/admin/wallet/org-admins/`, {
        method: "POST", headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ email: correo, organizacion_id: (orgId ?? adminOrg) || null, activar }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "No se pudo actualizar el privilegio."); return; }
      if (activar) setAdminEmail("");
      setMensaje(activar ? "Privilegio de admin de Entidad otorgado." : "Privilegio retirado.");
      cargarAdmins();
    } catch { setError("Error de conexión."); }
  };

  // ─────────────────────────────────────────────── LISTA ───────────────
  if (vista === "lista") {
    return (
      <div style={{ marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18 }}>Esquemas de credenciales</h2>
            <p style={{ margin: "4px 0 0", color: T.muted, fontSize: 13, maxWidth: 520 }}>
              Diseña plantillas (Certificado de Existencia, RUT, SAGRILAFT…), publícalas y emítelas — sin desarrollo a la medida.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => setEjemploOpen(true)} style={btn(T.surface, T.text)}>Ver ejemplo</button>
            <button onClick={verCredenciales} style={btn(T.surface, T.text)}>Credenciales emitidas</button>
            {esSuperadmin && <button onClick={toggleAdmins} style={btn(T.surface, T.text)}>Admins de Entidad</button>}
            <button onClick={nuevo} style={btn(`linear-gradient(120deg, ${T.brand}, ${T.brand2})`, T.surface)}>+ Nuevo esquema</button>
          </div>
        </div>

        {/* Guía rápida del flujo */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
          {[["1", "Diseña", "Agrega los campos y el color"], ["2", "Publica", "Queda disponible para emitir"], ["3", "Emite", "Llena los datos (o trae de RUES)"], ["4", "Verifica", "PDF con QR y validez pública"]].map(([n, t, d]) => (
            <div key={n} style={{ flex: "1 1 160px", border: `1px solid ${T.line}`, borderRadius: 12, padding: "10px 12px", background: T.surface2 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: `${T.brand}22`, color: T.brand, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12 }}>{n}</span>
                <strong style={{ fontSize: 13 }}>{t}</strong>
              </div>
              <div style={{ color: T.muted, fontSize: 11, marginTop: 4 }}>{d}</div>
            </div>
          ))}
        </div>

        {/* Panel: otorgar admin de Entidad (solo superadmin) */}
        {esSuperadmin && adminsOpen && (
          <div style={{ border: `1px solid ${T.line}`, borderRadius: 14, padding: 16, marginTop: 14, background: T.surface2 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 14 }}>Admins de Entidad</h3>
            <p style={{ margin: "0 0 10px", color: T.muted, fontSize: 12 }}>Otorga a un usuario el privilegio de gestionar los esquemas de SU organización. Debe tener una organización asignada.</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="correo@empresa.com" style={{ ...input, width: 240 }} />
              <select value={adminOrg} onChange={(e) => setAdminOrg(e.target.value)} style={{ ...input, width: 220 }}>
                <option value="">Su organización actual</option>
                {orgs.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
              </select>
              <button onClick={() => otorgarAdmin(true)} style={btn(VERDE)}>Otorgar</button>
            </div>
            <div style={{ marginTop: 12, display: "grid", gap: 4 }}>
              {admins.length === 0 && <p style={{ color: T.muted, fontSize: 12 }}>Nadie tiene el privilegio todavía.</p>}
              {admins.map((a) => (
                <div key={a.perfil_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, borderBottom: `1px solid ${T.line}`, padding: "6px 0" }}>
                  <span>{a.nombre || a.email} <span style={{ color: T.muted }}>· {a.organizacion || "sin organización"}</span></span>
                  <button onClick={() => otorgarAdmin(false, a.email)} style={btn(T.surface, ROJO)}>Quitar</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {mensaje && <p style={{ color: VERDE, fontSize: 13, marginTop: 10 }}>{mensaje}</p>}
        {error && <p style={{ color: ROJO, fontSize: 13, marginTop: 10 }}>{error}</p>}
        {cargando && <p style={{ color: T.muted, marginTop: 14 }}>Cargando…</p>}
        {!cargando && esquemas.length === 0 && <p style={{ color: T.muted, marginTop: 20 }}>Aún no hay esquemas. Crea el primero.</p>}
        <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
          {esquemas.map((e) => (
            <div key={e.id} style={{ border: `1px solid ${T.line}`, borderRadius: 14, padding: 16, background: T.surface2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{e.nombre} <span style={{ color: T.muted, fontWeight: 500 }}>v{e.version}</span></div>
                <div style={{ color: T.muted, fontSize: 12, marginTop: 2 }}>
                  <code>{e.codigo}</code> · {(e.campos || []).length} campo(s) · {e.organizacion || "Global"}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 999, color: ESTADO_COLOR[e.estado], border: `1px solid ${ESTADO_COLOR[e.estado]}55` }}>{e.estado.toUpperCase()}</span>
                {e.estado === "borrador" && <button onClick={() => editar(e)} style={btn(T.surface, T.text)}>Editar</button>}
                {e.estado === "borrador" && <button onClick={() => accion(e.id, "publicar", "Esquema publicado.")} style={btn(VERDE)}>Publicar</button>}
                {e.estado === "publicado" && <button onClick={() => iniciarEmision(e)} style={btn(`linear-gradient(120deg, ${T.brand}, ${T.brand2})`, T.surface)}>Emitir</button>}
                {e.estado !== "archivado" && <button onClick={() => accion(e.id, "archivar", "Esquema archivado.")} style={btn(T.surface, T.muted)}>Archivar</button>}
                {e.estado === "borrador" && <button onClick={() => eliminar(e.id)} style={btn(T.surface, ROJO)}>Eliminar</button>}
                {e.estado !== "borrador" && <button onClick={() => nuevaVersion(e.id)} style={btn(T.surface, T.text)}>Nueva versión</button>}
                {e.estado !== "borrador" && <button onClick={() => editar(e)} style={btn(T.surface, T.text)}>Ver</button>}
              </div>
            </div>
          ))}
        </div>

        {ejemploOpen && (
          <div onClick={() => setEjemploOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
            <div onClick={(ev) => ev.stopPropagation()} style={{ width: "100%", maxWidth: 460 }}>
              <div style={{ color: "#fff", marginBottom: 10, fontSize: 13, fontWeight: 600 }}>Así se ve una credencial emitida (ejemplo):</div>
              <CredencialCard nombre="Certificado de Existencia y Representación Legal" color="#2563eb"
                organizacion="Certicámara" sujeto="Grupo Soluciones S.A.S." campos={EJEMPLO_CAMPOS} ejemplo />
              <div style={{ textAlign: "center", marginTop: 12 }}>
                <button onClick={() => setEjemploOpen(false)} style={btn(T.surface, T.text)}>Cerrar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────── EMITIR ──────────────
  if (vista === "emitir" && emitForm) {
    return (
      <div style={{ marginTop: 16, maxWidth: 640 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <button onClick={() => { setEmitForm(null); setVista("lista"); }} style={btn(T.surface, T.muted)}>← Volver</button>
          {!ultimaEmitida && <button onClick={emitir} style={btn(`linear-gradient(120deg, ${T.brand}, ${T.brand2})`, T.surface)}>Emitir credencial</button>}
        </div>
        <h3 style={{ margin: "0 0 4px" }}>{emitForm.esquema.nombre}</h3>
        <p style={{ color: T.muted, fontSize: 12, margin: 0 }}>Completa los datos para emitir la credencial.</p>
        {error && <p style={{ color: ROJO, fontSize: 13, marginTop: 10 }}>{error}</p>}
        {ultimaEmitida ? (
          <div style={{ marginTop: 20, padding: 16, border: `1px solid ${VERDE}55`, borderRadius: 14, background: T.surface2 }}>
            <p style={{ color: VERDE, fontWeight: 800, margin: 0 }}>✓ Credencial N.º {ultimaEmitida.id} emitida.</p>
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <button onClick={() => descargarPdf(ultimaEmitida.id)} style={btn(`linear-gradient(120deg, ${T.brand}, ${T.brand2})`, T.surface)}>Descargar PDF</button>
              <button onClick={() => { setUltimaEmitida(null); setEmitFiles({}); setEmitForm({ esquema: emitForm.esquema, valores: {} }); }} style={btn(T.surface, T.text)}>Emitir otra</button>
            </div>
            {ultimaEmitida.url_verificacion && (
              <a href={ultimaEmitida.url_verificacion} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 10, fontSize: 12, color: T.brand }}>Ver verificación pública ↗</a>
            )}
          </div>
        ) : (
          <>
            {/* Titular de la credencial: si se selecciona, aparece en su wallet */}
            <div style={{ border: `1px solid ${T.line}`, borderRadius: 14, padding: 14, marginTop: 16, background: T.surface }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: T.brand, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 8 }}>
                Titular en wallet
              </div>
              <p style={{ color: T.muted, fontSize: 12, margin: "0 0 10px" }}>
                Busca la persona o empresa que recibirá esta credencial. Si no eliges titular, la credencial queda solo en el listado administrativo.
              </p>
              {titularSel ? (
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap", padding: 10, borderRadius: 10, background: T.surface2 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 13 }}>{titularSel.nombre}</div>
                    <div style={{ color: T.muted, fontSize: 11 }}>
                      {titularSel.email}{titularSel.identificacion ? ` · ${titularSel.identificacion}` : ""}{titularSel.organizacion ? ` · ${titularSel.organizacion}` : ""}
                    </div>
                  </div>
                  <button onClick={() => setTitularSel(null)} style={btn(T.surface, T.text)}>Cambiar</button>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <input
                      value={titularQuery}
                      onChange={(e) => setTitularQuery(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); buscarTitulares(); } }}
                      placeholder="Correo, nombre, NIT o empresa"
                      style={{ ...input, width: 280 }}
                    />
                    <button onClick={buscarTitulares} style={btn(T.surface, T.brand)}>Buscar titular</button>
                  </div>
                  {titulares.length > 0 && (
                    <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                      {titulares.map((t) => (
                        <button key={t.id} type="button" onClick={() => setTitularSel(t)}
                          style={{ ...btn(T.surface2, T.text), textAlign: "left", border: `1px solid ${T.line}` }}>
                          <span style={{ display: "block", fontSize: 13 }}>{t.nombre}</span>
                          <span style={{ display: "block", color: T.muted, fontSize: 11, marginTop: 2 }}>
                            {t.email}{t.identificacion ? ` · ${t.identificacion}` : ""}{t.organizacion ? ` · ${t.organizacion}` : ""}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Prellenar desde RUES (empresas) */}
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 16, flexWrap: "wrap" }}>
              <input value={nitRues} onChange={(e) => setNitRues(e.target.value)} placeholder="NIT para traer de RUES" style={{ ...input, width: 220 }} />
              <button onClick={prellenarRues} disabled={ruesCargando} style={btn(T.surface, T.brand)}>{ruesCargando ? "Consultando…" : "Traer de RUES"}</button>
              <span style={{ fontSize: 11, color: T.muted }}>Autocompleta campos cuya clave coincida (razon_social, nit, matricula_mercantil, rep_nombre…).</span>
            </div>
            <div style={{ border: `1px solid ${T.line}`, borderRadius: 14, padding: 16, marginTop: 12, background: T.surface }}>
              {(() => {
                const campos = emitForm.esquema.campos || [];
                if (campos.length === 0) return <p style={{ color: T.muted }}>Este esquema no tiene campos.</p>;
                const grupos = []; const idx = {};
                campos.forEach((c) => { const g = c.grupo || ""; if (!(g in idx)) { idx[g] = grupos.length; grupos.push({ g, campos: [] }); } grupos[idx[g]].campos.push(c); });
                return grupos.map((sec, gi) => (
                  <div key={gi}>
                    {sec.g && <div style={{ fontSize: 12, fontWeight: 800, color: T.brand, textTransform: "uppercase", letterSpacing: ".5px", margin: gi ? "18px 0 6px" : "0 0 6px" }}>{sec.g}</div>}
                    {sec.campos.map((c) => (
                      <div key={c.clave} style={{ marginBottom: 12 }}>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.muted, marginBottom: 4 }}>{c.etiqueta}{c.requerido ? " *" : ""}</label>
                        {emitInput(c)}
                        {c.ayuda && <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>{c.ayuda}</div>}
                      </div>
                    ))}
                  </div>
                ));
              })()}
            </div>
          </>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────── CREDENCIALES ────────
  if (vista === "credenciales") {
    return (
      <div style={{ marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => setVista("lista")} style={btn(T.surface, T.muted)}>← Volver</button>
          <button onClick={cargarCredenciales} style={btn(T.surface, T.text)}>Actualizar</button>
        </div>
        <h3 style={{ margin: "14px 0 0" }}>Credenciales emitidas</h3>
        {error && <p style={{ color: ROJO, fontSize: 13 }}>{error}</p>}
        {credenciales.length === 0 && <p style={{ color: T.muted, marginTop: 12 }}>Aún no se ha emitido ninguna credencial.</p>}
        <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
          {credenciales.map((c) => (
            <div key={c.id} style={{ border: `1px solid ${T.line}`, borderRadius: 12, padding: 14, background: T.surface2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{c.esquema} <span style={{ color: T.muted, fontWeight: 500 }}>#{c.id}</span></div>
                <div style={{ color: T.muted, fontSize: 12, marginTop: 2 }}>
                  {c.sujeto ? `${c.sujeto} · ` : ""}{new Date(c.created_at).toLocaleString("es-CO")}{c.organizacion ? ` · ${c.organizacion}` : ""}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button onClick={() => descargarPdf(c.id)} style={btn(`linear-gradient(120deg, ${T.brand}, ${T.brand2})`, T.surface)}>PDF</button>
                {c.url_verificacion && <a href={c.url_verificacion} target="_blank" rel="noreferrer" style={{ ...btn(T.surface, T.text), textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Verificar ↗</a>}
                {(c.archivos || []).map((a) => (
                  <button key={a.clave} onClick={() => descargarArchivo(c.id, a.clave)} style={btn(T.surface, T.text)} title={a.nombre || a.clave}>📎 {a.nombre || a.clave}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────── EDITOR ──────────────
  if (!form) {
    return (
      <div style={{ marginTop: 16 }}>
        <p style={{ color: T.muted, fontSize: 13 }}>Cargando editor…</p>
      </div>
    );
  }
  const soloLectura = form.estado && form.estado !== "borrador";
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <button onClick={() => setForm(null)} style={btn(T.surface, T.muted)}>← Volver</button>
        {!soloLectura && <button onClick={guardar} style={btn(`linear-gradient(120deg, ${T.brand}, ${T.brand2})`, T.surface)}>Guardar esquema</button>}
      </div>
      {!soloLectura && (
        <div style={{ background: `${T.brand}12`, border: `1px solid ${T.brand}33`, borderRadius: 12, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: T.text, lineHeight: 1.5 }}>
          <strong>¿Cómo funciona?</strong> Ponle <strong>nombre y color</strong>, agrega los <strong>campos</strong> que llevará la credencial (izquierda). A la derecha ves <strong>en vivo cómo quedará</strong>. Al terminar: <strong>Guardar</strong> → <strong>Publicar</strong> → ya puedes <strong>Emitir</strong>.
        </div>
      )}
      {soloLectura && <p style={{ color: AMBAR, fontSize: 12, marginBottom: 10 }}>Este esquema está {form.estado}. Para cambiarlo, crea una nueva versión.</p>}
      {error && <p style={{ color: ROJO, fontSize: 13 }}>{error}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: T.muted }}>Nombre *</label>
          <input value={form.nombre} disabled={soloLectura} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Certificado de Existencia y Representación Legal" style={input} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: T.muted }}>Código</label>
          <input value={form.codigo} disabled={soloLectura || !!form.id} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="certificado-existencia (se genera del nombre)" style={input} />
        </div>
        {esSuperadmin && (
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: T.muted }}>Organización</label>
            <select value={form.organizacion_id} disabled={soloLectura || !!form.id} onChange={(e) => setForm({ ...form, organizacion_id: e.target.value })} style={input}>
              <option value="">Global (todas)</option>
              {orgs.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
            </select>
          </div>
        )}
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: T.muted }}>Descripción</label>
          <input value={form.descripcion} disabled={soloLectura} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} style={input} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: T.muted }}>Color de la credencial</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(form.color || "") ? form.color : "#10b981"} disabled={soloLectura}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              style={{ width: 46, height: 38, border: `1px solid ${T.line}`, borderRadius: 8, background: T.surface2, cursor: soloLectura ? "default" : "pointer", padding: 2 }} />
            <input value={form.color || ""} disabled={soloLectura} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="#10b981" style={{ ...input, flex: 1 }} />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20, marginTop: 24 }}>
        {/* Constructor de campos */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: 15 }}>Campos</h3>
            {!soloLectura && <button onClick={addCampo} style={btn(T.surface, T.brand)}>+ Agregar campo</button>}
          </div>
          {form.campos.length === 0 && <p style={{ color: T.muted, fontSize: 13, marginTop: 10 }}>Agrega los campos que tendrá la credencial.</p>}
          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            {form.campos.map((c, i) => (
              <div key={i} style={{ border: `1px solid ${T.line}`, borderRadius: 12, padding: 12, background: T.surface2 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input value={c.etiqueta} disabled={soloLectura} onChange={(e) => setCampo(i, { etiqueta: e.target.value })} placeholder="Etiqueta del campo" style={{ ...input, flex: 1 }} />
                  <select value={c.tipo} disabled={soloLectura} onChange={(e) => setCampo(i, { tipo: e.target.value })} style={{ ...input, width: 130 }}>
                    {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
                  <label style={{ fontSize: 12, color: T.muted, display: "flex", gap: 5, alignItems: "center" }}>
                    <input type="checkbox" checked={!!c.requerido} disabled={soloLectura} onChange={(e) => setCampo(i, { requerido: e.target.checked })} /> Obligatorio
                  </label>
                  <input value={c.grupo || ""} disabled={soloLectura} onChange={(e) => setCampo(i, { grupo: e.target.value })}
                    placeholder="Sección (opcional)" style={{ ...input, width: 150 }} />
                  {c.tipo === "lista" && (
                    <input value={Array.isArray(c.validacion?.opciones) ? c.validacion.opciones.join(", ") : (c.validacion?.opciones || "")}
                      disabled={soloLectura} onChange={(e) => setValidacion(i, { opciones: e.target.value })}
                      placeholder="Opciones separadas por coma" style={{ ...input, flex: 1, minWidth: 160 }} />
                  )}
                  {!soloLectura && (
                    <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                      <button onClick={() => moverCampo(i, -1)} style={btn(T.surface, T.muted)}>↑</button>
                      <button onClick={() => moverCampo(i, 1)} style={btn(T.surface, T.muted)}>↓</button>
                      <button onClick={() => delCampo(i)} style={btn(T.surface, ROJO)}>✕</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vista previa en vivo — así se verá la credencial */}
        <div>
          <h3 style={{ margin: 0, fontSize: 15 }}>Vista previa <span style={{ fontSize: 11, color: T.muted, fontWeight: 500 }}>(así queda)</span></h3>
          <div style={{ marginTop: 12 }}>
            <CredencialCard nombre={form.nombre} descripcion={form.descripcion} color={form.color}
              organizacion={(orgs.find((o) => String(o.id) === String(form.organizacion_id)) || {}).nombre}
              sujeto="Nombre del titular" campos={form.campos} ejemplo />
          </div>
        </div>
      </div>
    </div>
  );
}
