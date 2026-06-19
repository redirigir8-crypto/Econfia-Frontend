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
  cyan:    { ring: "border-cyan-400/40",    glow: "bg-cyan-500/10",    text: "text-cyan-300",    dot: "bg-cyan-300" },
  blue:    { ring: "border-blue-400/40",    glow: "bg-blue-500/10",    text: "text-blue-300",    dot: "bg-blue-300" },
  emerald: { ring: "border-emerald-400/40", glow: "bg-emerald-500/10", text: "text-emerald-300", dot: "bg-emerald-300" },
  rose:    { ring: "border-rose-400/40",    glow: "bg-rose-500/10",    text: "text-rose-300",    dot: "bg-rose-300" },
  violet:  { ring: "border-violet-400/40",  glow: "bg-violet-500/10",  text: "text-violet-300",  dot: "bg-violet-300" },
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
    <section className="relative min-h-screen py-5 pb-32 bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 overflow-y-auto">
      {/* Glows decorativos */}
      <div className="pointer-events-none absolute top-10 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-24 left-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-4xl mx-auto px-3 md:px-6">
        {toast && (
          <Toast {...toast} onClose={() => setToast(null)}
            sound={toast.type === "error" ? "/sounds/error-011-352286.mp3" : "/sounds/econfia-bot/econfia-1.wav"} />
        )}

        {/* Header */}
        <div className="flex items-center gap-4 mb-7 mt-2">
          <div className="flex-shrink-0 h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-500/20 border border-cyan-400/30 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <span className="text-2xl">🔊</span>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-cyan-400 font-semibold tracking-[0.2em] uppercase mb-0.5">Centro Administrativo</p>
            <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-white via-cyan-100 to-blue-300 bg-clip-text text-transparent leading-tight">
              Sonidos por evento
            </h2>
            <p className="text-white/45 text-xs sm:text-sm mt-1">
              <span className="text-cyan-300 font-semibold">{totalConfigurados}/{EVENTOS.length}</span> eventos con sonido activo. Solo el sonido activo de cada evento se reproduce.
            </p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}
          className="relative rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 via-blue-950/40 to-slate-900/90 backdrop-blur-xl shadow-2xl shadow-cyan-500/10 p-5 md:p-7 mb-8 space-y-5 overflow-hidden">
          <div className={`pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl ${accentActual.glow}`} />
          <div className="relative flex items-center gap-2">
            <h3 className="text-lg font-bold text-cyan-300">{editId ? "✏️ Editar sonido" : "➕ Nuevo sonido"}</h3>
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/55 mb-1.5 font-semibold uppercase tracking-wide">Nombre *</label>
              <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ej: Campana de ingreso"
                className="w-full px-4 py-3 rounded-xl bg-slate-900/70 text-white border border-white/10 focus:border-cyan-400/60 focus:bg-slate-900 outline-none transition-all placeholder:text-white/30" />
            </div>
            <div>
              <label className="block text-xs text-white/55 mb-1.5 font-semibold uppercase tracking-wide">Evento *</label>
              <select name="evento" value={form.evento} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-slate-900/70 text-white border border-white/10 focus:border-cyan-400/60 outline-none transition-all">
                {EVENTOS.map((e) => <option key={e.value} value={e.value}>{e.icon} {e.label}</option>)}
              </select>
              <p className={`text-xs mt-1.5 ${accentActual.text}`}>{metaActual.icon} {metaActual.desc}</p>
            </div>
          </div>

          {/* Archivo */}
          <div className="relative">
            <label className="block text-xs text-white/55 mb-2 font-semibold uppercase tracking-wide">
              Archivo de sonido {editId ? "(deja vacío para conservar el actual)" : "*"}
            </label>
            {existingUrl && (
              <div className="flex items-center gap-3 mb-2 px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                <span className="text-cyan-300 text-xs flex-1 truncate">🎵 {existingUrl.split("/").pop()}</span>
                <button type="button" onClick={() => probar(existingUrl, form.volumen)}
                  className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/35 text-cyan-200 text-xs font-semibold border border-cyan-500/30 transition-all">▶ Probar</button>
              </div>
            )}
            <input ref={archivoRef} type="file" accept="audio/*"
              onChange={(e) => setArchivoFile(e.target.files[0] || null)}
              className="w-full text-white/70 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-cyan-600 file:to-blue-600 file:text-white file:font-semibold hover:file:opacity-90 cursor-pointer" />
            <p className="text-white/30 text-xs mt-1">MP3, WAV u OGG</p>
          </div>

          {/* Volumen + activo */}
          <div className="relative flex flex-wrap items-center gap-5">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs text-white/55 mb-1.5 font-semibold uppercase tracking-wide">
                Volumen: <span className="text-cyan-300">{Math.round((form.volumen ?? 1) * 100)}%</span>
              </label>
              <input type="range" min="0" max="1" step="0.05" name="volumen" value={form.volumen}
                onChange={handleChange} className="w-full accent-cyan-500" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all">
              <input type="checkbox" name="activo" checked={form.activo} onChange={handleChange} className="w-5 h-5 rounded accent-cyan-400" />
              <span className="text-white font-semibold text-sm">Activo</span>
              <span className="text-white/35 text-xs hidden sm:inline">(reemplaza al actual)</span>
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
                className="px-6 py-3 rounded-xl bg-white/5 border border-white/15 hover:bg-white/10 text-white font-semibold transition-all">Cancelar</button>
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
                className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/70 to-slate-950/70 backdrop-blur p-4">
                {/* Cabecera del evento */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`flex-shrink-0 h-10 w-10 rounded-xl ${a.glow} border ${a.ring} flex items-center justify-center text-lg`}>
                    {ev.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-bold leading-tight">{ev.label}</h4>
                    <p className="text-white/35 text-xs truncate">{ev.desc}</p>
                  </div>
                  {tieneActivo
                    ? <span className="flex-shrink-0 text-[10px] px-2.5 py-1 rounded-full bg-green-500/15 text-green-300 border border-green-500/30 font-semibold">● Activo</span>
                    : <span className="flex-shrink-0 text-[10px] px-2.5 py-1 rounded-full bg-white/5 text-white/35 border border-white/10 font-semibold">Sin sonido</span>}
                </div>

                {grupo.length === 0 ? (
                  <p className="text-white/30 text-sm pl-1">Aún no hay sonidos para este evento.</p>
                ) : (
                  <div className="space-y-2">
                    {grupo.map((s) => (
                      <div key={s.id}
                        className={`flex flex-wrap items-center gap-2.5 p-2.5 pl-3 rounded-xl border transition-all ${
                          s.activo ? `${a.glow} ${a.ring}` : "bg-white/[0.03] border-white/10 hover:border-white/20"
                        }`}>
                        {s.activo && <span className={`flex-shrink-0 w-2 h-2 rounded-full ${a.dot} ${a.text} shadow-[0_0_8px_currentColor]`} />}
                        <span className="text-white font-semibold text-sm flex-1 min-w-[120px] truncate">{s.nombre}</span>
                        <span className="text-white/35 text-xs">Vol {Math.round((s.volumen ?? 1) * 100)}%</span>
                        <button onClick={() => probar(s.archivo_url, s.volumen)}
                          className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-white/10 transition-all">▶ Probar</button>
                        <button onClick={() => toggleActivo(s)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            s.activo ? "bg-yellow-500/15 text-yellow-300 border-yellow-500/30 hover:bg-yellow-500/25" : "bg-green-500/15 text-green-300 border-green-500/30 hover:bg-green-500/25"
                          }`}>{s.activo ? "Desactivar" : "Activar"}</button>
                        <button onClick={() => handleEditar(s)} title="Editar"
                          className="px-2.5 py-1.5 rounded-lg bg-cyan-600/15 hover:bg-cyan-600/35 text-cyan-300 text-xs font-semibold border border-cyan-600/30 transition-all">✏️</button>
                        <button onClick={() => handleEliminar(s.id)} title="Eliminar"
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 text-xs font-semibold border border-rose-500/30 transition-all">🗑</button>
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
