// src/components/AdminSonidos.jsx
import React, { useEffect, useState, useRef } from "react";
import Toast from "./Toast";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const EVENTOS = [
  { value: "login",          label: "Ingreso (login)",          icon: "🔑", desc: "Suena cuando la persona inicia sesión.",      accent: "cyan" },
  { value: "consulta",       label: "Al realizar consulta",      icon: "🔎", desc: "Suena cuando se envía una consulta.",          accent: "blue" },
  { value: "resultados",     label: "Al obtener resultados",     icon: "📊", desc: "Suena cuando la consulta termina.",            accent: "emerald" },
  { value: "error_consulta", label: "Al fallar (consulta o login)", icon: "⚠️", desc: "Suena cuando una consulta falla, no arranca, o el usuario/contraseña es incorrecto.", accent: "rose" },
  { value: "navegacion",     label: "Navegación entre páginas",  icon: "🧭", desc: "Sonido suave al cambiar de página.",           accent: "violet" },
];

// Clases por acento (Tailwind necesita clases completas, no interpoladas)
const ACCENT = {
  cyan:    { ring: "border-brand/35",       glow: "bg-brand/10",       text: "text-brand",       dot: "bg-brand" },
  blue:    { ring: "border-blue-400/35",    glow: "bg-blue-500/10",    text: "text-blue-400",    dot: "bg-blue-400" },
  emerald: { ring: "border-ok/35",          glow: "bg-ok/10",          text: "text-ok",          dot: "bg-ok" },
  rose:    { ring: "border-danger/35",      glow: "bg-danger/10",      text: "text-danger",      dot: "bg-danger" },
  violet:  { ring: "border-violet-400/35",  glow: "bg-violet-500/10",  text: "text-violet-400",  dot: "bg-violet-400" },
};

const EMPTY_FORM = { nombre: "", evento: "login", volumen: 1, activo: true };

export default function AdminSonidos() {
  const token = localStorage.getItem("token");

  const [sonidos, setSonidos] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [archivoFile, setArchivoFile] = useState(null);
  const [existingUrl, setExistingUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const archivoRef = useRef();

  const fetchSonidos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin-sonidos/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (res.ok) setSonidos(await res.json());
    } catch {
      setToast({ type: "error", message: "Error al cargar sonidos" });
    }
  };

  useEffect(() => { fetchSonidos(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setArchivoFile(null);
    setExistingUrl(null);
    if (archivoRef.current) archivoRef.current.value = "";
  };

  const handleEditar = (s) => {
    setForm({
      nombre: s.nombre || "",
      evento: s.evento || "login",
      volumen: s.volumen ?? 1,
      activo: s.activo ?? true,
    });
    setExistingUrl(s.archivo_url || null);
    setArchivoFile(null);
    setEditId(s.id);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      setToast({ type: "error", message: "Ponle un nombre al sonido" });
      return;
    }
    if (!editId && !archivoFile) {
      setToast({ type: "error", message: "Sube un archivo de sonido" });
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("nombre", form.nombre);
      fd.append("evento", form.evento);
      fd.append("volumen", form.volumen);
      fd.append("activo", form.activo ? "1" : "0");
      if (archivoFile) fd.append("archivo", archivoFile);

      const method = editId ? "PUT" : "POST";
      const url = editId ? `${API_URL}/api/admin-sonidos/${editId}/` : `${API_URL}/api/admin-sonidos/`;
      const res = await fetch(url, { method, headers: { Authorization: `Token ${token}` }, body: fd });
      if (!res.ok) throw new Error();
      setToast({ type: "success", message: editId ? "Sonido actualizado ✅" : "Sonido creado ✅" });
      resetForm();
      fetchSonidos();
      window.dispatchEvent(new Event("econfia:sounds-updated"));
    } catch {
      setToast({ type: "error", message: "Error al guardar el sonido" });
    } finally {
      setLoading(false);
    }
  };

  const toggleActivo = async (s) => {
    try {
      const fd = new FormData();
      fd.append("activo", s.activo ? "0" : "1");
      const res = await fetch(`${API_URL}/api/admin-sonidos/${s.id}/`, {
        method: "PATCH", headers: { Authorization: `Token ${token}` }, body: fd,
      });
      if (!res.ok) throw new Error();
      fetchSonidos();
      window.dispatchEvent(new Event("econfia:sounds-updated"));
    } catch {
      setToast({ type: "error", message: "Error al cambiar estado" });
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Eliminar este sonido?")) return;
    try {
      const res = await fetch(`${API_URL}/api/admin-sonidos/${id}/`, {
        method: "DELETE", headers: { Authorization: `Token ${token}` },
      });
      if (!res.ok) throw new Error();
      setToast({ type: "success", message: "Sonido eliminado" });
      fetchSonidos();
      window.dispatchEvent(new Event("econfia:sounds-updated"));
    } catch {
      setToast({ type: "error", message: "Error al eliminar" });
    }
  };

  const probar = (url, vol) => {
    if (!url) return;
    try {
      const a = new Audio(url);
      a.volume = Math.min(Math.max(Number(vol) || 1, 0), 1);
      a.play().catch(() => {});
    } catch { /* noop */ }
  };

  const eventoMeta = (ev) => EVENTOS.find((e) => e.value === ev) || { icon: "🔊", label: ev };

  const metaActual = eventoMeta(form.evento);
  const accentActual = ACCENT[metaActual.accent] || ACCENT.cyan;
  const totalConfigurados = EVENTOS.filter((ev) => sonidos.some((s) => s.evento === ev.value && s.activo)).length;

  return (
    <section className="relative min-h-screen overflow-y-auto bg-transparent px-4 py-8 pb-32 sm:px-6">
      {/* Glows decorativos */}
      <div className="pointer-events-none absolute right-10 top-10 h-72 w-72 rounded-full bg-brand/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-24 left-0 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative mx-auto w-full max-w-5xl">
        {toast && (
          <Toast {...toast} onClose={() => setToast(null)}
            sound={toast.type === "error" ? "/sounds/error-011-352286.mp3" : "/sounds/econfia-bot/econfia-1.wav"} />
        )}

        {/* Header */}
        <div className="mb-7 mt-2 overflow-hidden rounded-[28px] border border-line/15 bg-surface/90 p-6 shadow-[0_22px_65px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border border-brand/30 bg-brand/10 shadow-lg shadow-cyan-500/10">
            <span className="text-2xl">🔊</span>
          </div>
          <div className="min-w-0">
            <p className="mb-2 text-[11px] font-black uppercase tracking-[0.28em] text-brand">Centro Administrativo</p>
            <h2 className="text-3xl font-black leading-tight tracking-tight text-content md:text-4xl">
              Sonidos por evento
            </h2>
            <p className="mt-2 text-sm text-muted">
              <span className="font-black text-brand">{totalConfigurados}/{EVENTOS.length}</span> eventos con sonido activo. Solo el sonido activo de cada evento se reproduce.
            </p>
          </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}
          className="relative mb-8 space-y-5 overflow-hidden rounded-[24px] border border-line/15 bg-surface/90 p-5 shadow-[0_22px_65px_rgba(15,23,42,0.16)] backdrop-blur-xl md:p-7">
          <div className={`pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl ${accentActual.glow}`} />
          <div className="relative flex items-center gap-2">
            <h3 className="text-lg font-black text-brand">{editId ? "✏️ Editar sonido" : "➕ Nuevo sonido"}</h3>
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-muted">Nombre *</label>
              <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ej: Campana de ingreso"
                className="w-full rounded-xl border border-line/15 bg-surface px-4 py-3 font-semibold text-content outline-none transition-all placeholder:text-muted/70 focus:border-brand/50 focus:ring-4 focus:ring-brand/10" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-muted">Evento *</label>
              <select name="evento" value={form.evento} onChange={handleChange}
                className="w-full rounded-xl border border-line/15 bg-surface px-4 py-3 font-semibold text-content outline-none transition-all focus:border-brand/50 focus:ring-4 focus:ring-brand/10">
                {EVENTOS.map((e) => <option key={e.value} value={e.value}>{e.icon} {e.label}</option>)}
              </select>
              <p className={`text-xs mt-1.5 ${accentActual.text}`}>{metaActual.icon} {metaActual.desc}</p>
            </div>
          </div>

          {/* Archivo */}
          <div className="relative">
            <label className="mb-2 block text-xs font-black uppercase tracking-wide text-muted">
              Archivo de sonido {editId ? "(deja vacío para conservar el actual)" : "*"}
            </label>
            {existingUrl && (
              <div className="mb-2 flex items-center gap-3 rounded-xl border border-brand/30 bg-brand/10 px-3 py-2">
                <span className="flex-1 truncate text-xs text-brand">🎵 {existingUrl.split("/").pop()}</span>
                <button type="button" onClick={() => probar(existingUrl, form.volumen)}
                  className="rounded-lg border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand transition-all hover:bg-brand/15">▶ Probar</button>
              </div>
            )}
            <input ref={archivoRef} type="file" accept="audio/*"
              onChange={(e) => setArchivoFile(e.target.files[0] || null)}
              className="w-full cursor-pointer text-sm text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-cyan-600 file:to-blue-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:opacity-90" />
            <p className="mt-1 text-xs text-muted/70">MP3, WAV u OGG</p>
          </div>

          {/* Volumen + activo */}
          <div className="relative flex flex-wrap items-center gap-5">
            <div className="flex-1 min-w-[200px]">
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-muted">
                Volumen: <span className="text-brand">{Math.round((form.volumen ?? 1) * 100)}%</span>
              </label>
              <input type="range" min="0" max="1" step="0.05" name="volumen" value={form.volumen}
                onChange={handleChange} className="w-full accent-cyan-500" />
            </div>
            <label className="flex cursor-pointer select-none items-center gap-2 rounded-xl border border-line/15 bg-surface-2/60 px-3 py-2 transition-all hover:border-brand/40">
              <input type="checkbox" name="activo" checked={form.activo} onChange={handleChange} className="w-5 h-5 rounded accent-cyan-400" />
              <span className="text-sm font-semibold text-content">Activo</span>
              <span className="hidden text-xs text-muted sm:inline">(reemplaza al actual)</span>
            </label>
          </div>

          <div className="relative flex gap-3 pt-1">
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl font-bold text-white text-base transition-all disabled:opacity-60 hover:scale-[1.01]"
              style={{ background: "linear-gradient(135deg,#06b6d4,#3b82f6)", boxShadow: "0 0 24px rgba(6,182,212,0.35)" }}>
              {loading ? "Guardando…" : editId ? "Actualizar sonido" : "Guardar sonido"}
            </button>
            {editId && (
              <button type="button" onClick={resetForm}
                className="rounded-xl border border-line/15 bg-surface px-6 py-3 font-semibold text-content transition-all hover:border-brand/40">Cancelar</button>
            )}
          </div>
        </form>

        {/* Lista agrupada por evento */}
        <div className="space-y-4">
          {EVENTOS.map((ev) => {
            const grupo = sonidos.filter((s) => s.evento === ev.value);
            const a = ACCENT[ev.accent] || ACCENT.cyan;
            const tieneActivo = grupo.some((s) => s.activo);
            return (
              <div key={ev.value}
                className="rounded-[22px] border border-line/15 bg-surface/90 p-4 shadow-[0_16px_42px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                {/* Cabecera del evento */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`flex-shrink-0 h-10 w-10 rounded-xl ${a.glow} border ${a.ring} flex items-center justify-center text-lg`}>
                    {ev.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black leading-tight text-content">{ev.label}</h4>
                    <p className="truncate text-xs text-muted">{ev.desc}</p>
                  </div>
                  {tieneActivo
                    ? <span className="flex-shrink-0 rounded-full border border-ok/30 bg-ok/10 px-2.5 py-1 text-[10px] font-bold text-ok">● Activo</span>
                    : <span className="flex-shrink-0 rounded-full border border-line/15 bg-surface-2 px-2.5 py-1 text-[10px] font-bold text-muted">Sin sonido</span>}
                </div>

                {grupo.length === 0 ? (
                  <p className="pl-1 text-sm text-muted">Aún no hay sonidos para este evento.</p>
                ) : (
                  <div className="space-y-2">
                    {grupo.map((s) => (
                      <div key={s.id}
                        className={`flex flex-wrap items-center gap-2.5 p-2.5 pl-3 rounded-xl border transition-all ${
                          s.activo ? `${a.glow} ${a.ring}` : "bg-surface-2/60 border-line/10 hover:border-line/25"
                        }`}>
                        {s.activo && <span className={`flex-shrink-0 w-2 h-2 rounded-full ${a.dot} ${a.text} shadow-[0_0_8px_currentColor]`} />}
                        <span className="min-w-[120px] flex-1 truncate text-sm font-bold text-content">{s.nombre}</span>
                        <span className="text-xs font-semibold text-muted">Vol {Math.round((s.volumen ?? 1) * 100)}%</span>
                        <button onClick={() => probar(s.archivo_url, s.volumen)}
                          className="rounded-lg border border-brand/25 bg-brand/10 px-2.5 py-1.5 text-xs font-bold text-brand transition-all hover:bg-brand/15">▶ Probar</button>
                        <button onClick={() => toggleActivo(s)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            s.activo ? "bg-warn/10 text-warn border-warn/30 hover:bg-warn/15" : "bg-ok/10 text-ok border-ok/30 hover:bg-ok/15"
                          }`}>{s.activo ? "Desactivar" : "Activar"}</button>
                        <button onClick={() => handleEditar(s)} title="Editar"
                          className="rounded-lg border border-brand/25 bg-brand/10 px-2.5 py-1.5 text-xs font-bold text-brand transition-all hover:bg-brand/15">✏️</button>
                        <button onClick={() => handleEliminar(s.id)} title="Eliminar"
                          className="rounded-lg border border-danger/30 bg-danger/10 px-2.5 py-1.5 text-xs font-bold text-danger transition-all hover:bg-danger/15">🗑</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
