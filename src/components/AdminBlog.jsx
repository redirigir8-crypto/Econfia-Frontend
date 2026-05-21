// src/components/AdminBlog.jsx
import React, { useEffect, useState, useRef } from "react";
import Toast from "./Toast";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const EMPTY_FORM = {
  titulo: "", extracto: "", contenido: "",
  tags: "", autor: "Equipo Econfia", tiempo_lectura: "5 min",
  fecha_publicacion: "", estado: "borrador",
  destacado: false, importante: false,
  video_url: "",
};

export default function AdminBlog() {
  const token = localStorage.getItem("token");

  const [posts, setPosts]         = useState([]);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [editId, setEditId]       = useState(null);
  const [portadaFile, setPortadaFile]         = useState(null);
  const [videoFile, setVideoFile]             = useState(null);
  const [portadaPreview, setPortadaPreview]   = useState(null);
  const [existingVideoUrl, setExistingVideoUrl] = useState(null);
  const [clearVideo, setClearVideo]           = useState(false);
  const [loading, setLoading]     = useState(false);
  const [toast, setToast]         = useState(null);
  const [vista, setVista]         = useState("lista"); // "lista" | "form"
  const [busqueda, setBusqueda]   = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const portadaRef    = useRef();
  const videoRef      = useRef();
  const contenidoRef  = useRef();

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin-blog/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (res.ok) setPosts(await res.json());
    } catch {
      setToast({ type: "error", message: "Error al cargar publicaciones" });
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  // ── Helpers form ────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handlePortada = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPortadaFile(file);
    setPortadaPreview(URL.createObjectURL(file));
  };

  const handleVideo = (e) => {
    const file = e.target.files[0];
    if (file) setVideoFile(file);
  };

  // ── Insertar formato en textarea de contenido ────────────────────────────────
  const insertAtCursor = (before, after = "", placeholder = "texto") => {
    const el = contenidoRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end   = el.selectionEnd;
    const selected = form.contenido.substring(start, end) || placeholder;
    const newText = form.contenido.substring(0, start) + before + selected + after + form.contenido.substring(end);
    setForm(f => ({ ...f, contenido: newText }));
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  const insertBlock = (block) => {
    const el = contenidoRef.current;
    if (!el) return;
    const pos = el.selectionStart;
    const newText = form.contenido.substring(0, pos) + "\n" + block + "\n" + form.contenido.substring(pos);
    setForm(f => ({ ...f, contenido: newText }));
    setTimeout(() => { el.focus(); }, 0);
  };

  const GRID_TEMPLATE =
`\n## Beneficios Principales\n\n[grid]\n⏱ **Reducción de tiempos** :: Optimiza flujos operativos eliminando la carga manual.\n📊 **Mayor trazabilidad** :: Mantén un registro auditable de cada consulta realizada.\n🔒 **Validación centralizada** :: Conecta con cientos de bases de datos desde una sola interfaz.\n⚡ **Disminución de riesgos** :: Minimiza la exposición a fraudes mediante alertas inteligentes.\n[/grid]\n`;

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setPortadaFile(null);
    setVideoFile(null);
    setPortadaPreview(null);
    setExistingVideoUrl(null);
    setClearVideo(false);
    if (portadaRef.current) portadaRef.current.value = "";
    if (videoRef.current)   videoRef.current.value   = "";
  };

  const handleEditar = (post) => {
    setForm({
      titulo:            post.titulo           || "",
      extracto:          post.extracto         || "",
      contenido:         post.contenido        || "",
      tags:              post.tags             || "",
      autor:             post.autor            || "Equipo Econfia",
      tiempo_lectura:    post.tiempo_lectura   || "5 min",
      fecha_publicacion: post.fecha_publicacion || "",
      estado:            post.estado           || "borrador",
      destacado:         post.destacado        || false,
      importante:        post.importante       || false,
      video_url:         post.video_url        || "",
    });
    setPortadaPreview(post.portada_url || null);
    setExistingVideoUrl(post.video_archivo_url || null);
    setClearVideo(false);
    setEditId(post.id);
    setVista("form");
    window.scrollTo(0, 0);
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.extracto.trim() || !form.contenido.trim()) {
      setToast({ type: "error", message: "Título, extracto y contenido son obligatorios" });
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined) fd.append(k, v);
      });
      if (portadaFile) fd.append("portada", portadaFile);
      if (videoFile)   fd.append("video_archivo", videoFile);
      if (clearVideo)  fd.append("clear_video_archivo", "1");

      const method = editId ? "PUT" : "POST";
      const url    = editId
        ? `${API_URL}/api/admin-blog/${editId}/`
        : `${API_URL}/api/admin-blog/`;

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Token ${token}` },
        body: fd,
      });

      if (!res.ok) throw new Error();
      setToast({ type: "success", message: editId ? "Publicación actualizada ✅" : "Publicación creada ✅" });
      resetForm();
      fetchPosts();
      setVista("lista");
    } catch {
      setToast({ type: "error", message: "Error al guardar la publicación" });
    } finally {
      setLoading(false);
    }
  };

  // ── Publicar / Archivar rápido ──────────────────────────────────────────────
  const toggleEstado = async (post) => {
    const nuevoEstado = post.estado === "publicado" ? "borrador" : "publicado";
    try {
      const fd = new FormData();
      fd.append("estado", nuevoEstado);
      const res = await fetch(`${API_URL}/api/admin-blog/${post.id}/`, {
        method: "PATCH",
        headers: { Authorization: `Token ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error();
      setToast({ type: "success", message: nuevoEstado === "publicado" ? "Publicado ✅" : "Pasado a borrador" });
      fetchPosts();
    } catch {
      setToast({ type: "error", message: "Error al cambiar estado" });
    }
  };

  // ── Eliminar ────────────────────────────────────────────────────────────────
  const handleEliminar = async (id) => {
    if (!window.confirm("¿Eliminar esta publicación? Esta acción no se puede deshacer.")) return;
    try {
      const res = await fetch(`${API_URL}/api/admin-blog/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Token ${token}` },
      });
      if (!res.ok) throw new Error();
      setToast({ type: "success", message: "Publicación eliminada" });
      fetchPosts();
    } catch {
      setToast({ type: "error", message: "Error al eliminar" });
    }
  };

  // ── Filtros ─────────────────────────────────────────────────────────────────
  const postsFiltrados = posts.filter((p) => {
    const matchBusq = p.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
                      p.extracto?.toLowerCase().includes(busqueda.toLowerCase());
    const matchEstado = filtroEstado === "todos" || p.estado === filtroEstado;
    return matchBusq && matchEstado;
  });

  const totalPublicados = posts.filter((p) => p.estado === "publicado").length;
  const totalBorradores = posts.filter((p) => p.estado === "borrador").length;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <section className="relative min-h-screen py-4 pb-28 bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 overflow-y-auto">
      <div className="w-full max-w-5xl mx-auto px-3 md:px-6">

        {toast && (
          <Toast {...toast} onClose={() => setToast(null)}
            sound={toast.type === "error" ? "/sounds/error-011-352286.mp3" : "/sounds/success-1-6297.mp3"}
          />
        )}

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 mt-2">
          <div>
            <p className="text-xs text-cyan-400 font-semibold tracking-widest uppercase mb-1">Centro Administrativo</p>
            <h2 className="text-3xl font-black text-white drop-shadow-lg">Blog & Noticias</h2>
            <p className="text-white/50 text-sm mt-1">
              {totalPublicados} publicado{totalPublicados !== 1 ? "s" : ""} · {totalBorradores} borrador{totalBorradores !== 1 ? "es" : ""}
            </p>
          </div>
          <button
            onClick={() => { resetForm(); setVista(vista === "form" ? "lista" : "form"); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white transition-all"
            style={{ background: vista === "form" ? "#334155" : "linear-gradient(135deg,#06b6d4,#3b82f6)" }}
          >
            {vista === "form" ? "← Volver a la lista" : "+ Nueva publicación"}
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════
            FORMULARIO
        ══════════════════════════════════════════════════════ */}
        {vista === "form" && (
          <form onSubmit={handleSubmit} className="bg-slate-800/80 rounded-2xl border border-cyan-900/40 shadow-2xl p-5 md:p-8 mb-8 space-y-5">
            <h3 className="text-xl font-bold text-cyan-300 mb-2">
              {editId ? "✏️ Editar publicación" : "📝 Nueva publicación"}
            </h3>

            {/* Título */}
            <div>
              <label className="block text-xs text-white/60 mb-1 font-semibold uppercase tracking-wide">Título *</label>
              <input name="titulo" value={form.titulo} onChange={handleChange} required
                placeholder="Título de la publicación"
                className="w-full px-4 py-3 rounded-xl bg-slate-900/80 text-white border border-cyan-700/40 focus:border-cyan-400 outline-none text-base"
              />
            </div>

            {/* Extracto */}
            <div>
              <label className="block text-xs text-white/60 mb-1 font-semibold uppercase tracking-wide">Extracto * <span className="normal-case text-white/40">(resumen corto para la lista)</span></label>
              <textarea name="extracto" value={form.extracto} onChange={handleChange} required rows={2}
                placeholder="Breve descripción que aparece en la lista del blog..."
                className="w-full px-4 py-3 rounded-xl bg-slate-900/80 text-white border border-cyan-700/40 focus:border-cyan-400 outline-none resize-none"
              />
            </div>

            {/* Contenido */}
            <div>
              <label className="block text-xs text-white/60 mb-2 font-semibold uppercase tracking-wide">
                Contenido * <span className="normal-case text-white/40">(texto completo del artículo)</span>
              </label>

              {/* ── Barra de herramientas ── */}
              <div className="flex flex-wrap gap-1.5 mb-2 p-2 rounded-t-xl bg-slate-900 border border-cyan-700/40 border-b-0">
                {/* Formato inline */}
                <button type="button" title="Negrita" onClick={() => insertAtCursor("**", "**", "texto en negrita")}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-white text-xs font-bold border border-white/10 transition-all">B</button>
                <button type="button" title="Cursiva" onClick={() => insertAtCursor("*", "*", "texto en cursiva")}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-white/80 text-xs italic border border-white/10 transition-all">I</button>

                <span className="w-px bg-white/10 mx-1" />

                {/* Encabezados */}
                <button type="button" title="Título grande" onClick={() => insertBlock("# Título de sección")}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-white/10 transition-all">H1</button>
                <button type="button" title="Subtítulo" onClick={() => insertBlock("## Subtítulo")}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-white/10 transition-all">H2</button>
                <button type="button" title="Título pequeño" onClick={() => insertBlock("### Título pequeño")}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-cyan-300 text-xs border border-white/10 transition-all">H3</button>

                <span className="w-px bg-white/10 mx-1" />

                {/* Bloques */}
                <button type="button" title="Cita destacada" onClick={() => insertBlock('> "Escribe aquí una cita o frase destacada."')}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-white/70 text-xs italic border border-white/10 transition-all">" "</button>
                <button type="button" title="Lista con puntos" onClick={() => insertBlock("- Punto uno\n- Punto dos\n- Punto tres")}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-white text-xs border border-white/10 transition-all">• Lista</button>
                <button type="button" title="Lista numerada" onClick={() => insertBlock("1. Primer paso\n2. Segundo paso\n3. Tercer paso")}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-white text-xs border border-white/10 transition-all">1. Lista</button>
                <button type="button" title="Bloque destacado" onClick={() => insertBlock("💡 Texto de consejo o dato importante")}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-yellow-300 text-xs border border-white/10 transition-all">💡 Destacado</button>
                <button type="button" title="Línea separadora" onClick={() => insertBlock("---")}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-white/50 text-xs border border-white/10 transition-all">— Separador</button>

                <span className="w-px bg-white/10 mx-1" />

                {/* Sección especial */}
                <button type="button" title="Insertar tarjetas de beneficios" onClick={() => insertBlock(GRID_TEMPLATE)}
                  className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/35 text-cyan-300 text-xs font-bold border border-cyan-500/40 transition-all flex items-center gap-1">
                  ▦ Tarjetas
                </button>
                <button type="button" title="Insertar galería de imágenes con flip" onClick={() => insertBlock("[gallery]\nhttps://url-imagen-1.jpg :: Descripción de la primera imagen\nhttps://url-imagen-2.jpg :: Descripción de la segunda imagen\n[/gallery]")}
                  className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 text-xs font-bold border border-emerald-500/40 transition-all flex items-center gap-1">
                  🖼️ Galería
                </button>
                <button type="button" title="Insertar video embebido en el contenido" onClick={() => insertBlock("[video]https://youtube.com/watch?v=XXXXXXXXXX[/video]")}
                  className="px-3 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/35 text-purple-300 text-xs font-bold border border-purple-500/40 transition-all flex items-center gap-1">
                  ▶ Video
                </button>
              </div>

              <textarea
                ref={contenidoRef}
                name="contenido" value={form.contenido} onChange={handleChange} required rows={12}
                placeholder={"Escribe el contenido aquí...\n\nEjemplo:\nUsa los botones de arriba para dar formato.\nSepara los párrafos con una línea en blanco."}
                className="w-full px-4 py-3 rounded-b-xl bg-slate-900/80 text-white border border-cyan-700/40 focus:border-cyan-400 outline-none resize-y font-mono text-sm"
              />
              <p className="text-white/25 text-xs mt-1">
                Formatos: **negrita** · *cursiva* · # Título · &gt; cita · - lista · 💡 destacado · [grid]...[/grid] tarjetas · [gallery]url :: desc[/gallery] imágenes · [video]url[/video] video
              </p>
            </div>

            {/* Fila: Autor + Tiempo lectura + Fecha */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-white/60 mb-1 font-semibold uppercase tracking-wide">Autor</label>
                <input name="autor" value={form.autor} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 text-white border border-cyan-700/40 focus:border-cyan-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1 font-semibold uppercase tracking-wide">Tiempo lectura</label>
                <input name="tiempo_lectura" value={form.tiempo_lectura} onChange={handleChange} placeholder="5 min"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 text-white border border-cyan-700/40 focus:border-cyan-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1 font-semibold uppercase tracking-wide">Fecha publicación</label>
                <input name="fecha_publicacion" type="date" value={form.fecha_publicacion} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 text-white border border-cyan-700/40 focus:border-cyan-400 outline-none"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs text-white/60 mb-1 font-semibold uppercase tracking-wide">Tags <span className="normal-case text-white/40">(separados por coma)</span></label>
              <input name="tags" value={form.tags} onChange={handleChange}
                placeholder="cumplimiento, riesgo, automatización"
                className="w-full px-4 py-3 rounded-xl bg-slate-900/80 text-white border border-cyan-700/40 focus:border-cyan-400 outline-none"
              />
            </div>

            {/* Imagen portada */}
            <div>
              <label className="block text-xs text-white/60 mb-2 font-semibold uppercase tracking-wide">Imagen de portada</label>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {portadaPreview && (
                  <img src={portadaPreview} alt="preview" className="w-32 h-24 object-cover rounded-xl border border-cyan-700/40" />
                )}
                <div className="flex-1">
                  <input ref={portadaRef} type="file" accept="image/*" onChange={handlePortada}
                    className="w-full text-white/70 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-600 file:text-white file:font-semibold hover:file:bg-cyan-500 cursor-pointer"
                  />
                  <p className="text-white/30 text-xs mt-1">PNG, JPG, WebP — máx. 5MB</p>
                </div>
              </div>
            </div>

            {/* Video */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/60 mb-1 font-semibold uppercase tracking-wide">Video URL <span className="normal-case text-white/40">(YouTube / Vimeo)</span></label>
                <input name="video_url" value={form.video_url} onChange={handleChange}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 text-white border border-cyan-700/40 focus:border-cyan-400 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-2 font-semibold uppercase tracking-wide">Video archivo <span className="normal-case text-white/40">(MP4)</span></label>

                {/* Video existente en edición */}
                {existingVideoUrl && !clearVideo && (
                  <div className="flex items-center gap-3 mb-2 px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30">
                    <span className="text-purple-300 text-xs flex-1 truncate">🎬 {existingVideoUrl.split("/").pop()}</span>
                    <button type="button"
                      onClick={() => { setClearVideo(true); if (videoRef.current) videoRef.current.value = ""; }}
                      className="flex-shrink-0 px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/35 text-red-400 text-xs font-semibold border border-red-500/30 transition-all"
                    >
                      ✕ Quitar video
                    </button>
                  </div>
                )}

                {clearVideo && (
                  <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30">
                    <span className="text-red-400 text-xs flex-1">Video será eliminado al guardar</span>
                    <button type="button"
                      onClick={() => setClearVideo(false)}
                      className="text-white/50 hover:text-white text-xs underline"
                    >Deshacer</button>
                  </div>
                )}

                {(!existingVideoUrl || clearVideo) && (
                  <input ref={videoRef} type="file" accept="video/*" onChange={(e) => { const f = e.target.files[0]; if (f) { setVideoFile(f); setClearVideo(false); } }}
                    className="w-full text-white/70 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white file:font-semibold hover:file:bg-purple-500 cursor-pointer"
                  />
                )}
              </div>
            </div>

            {/* Checkboxes + Estado */}
            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" name="destacado" checked={form.destacado} onChange={handleChange}
                  className="w-5 h-5 rounded accent-cyan-400"
                />
                <span className="text-white font-semibold">⭐ Destacado</span>
                <span className="text-white/40 text-xs">(aparece como post principal)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" name="importante" checked={form.importante} onChange={handleChange}
                  className="w-5 h-5 rounded accent-yellow-400"
                />
                <span className="text-white font-semibold">🔥 Importante</span>
                <span className="text-white/40 text-xs">(badge amarillo)</span>
              </label>
              <div className="ml-auto flex items-center gap-3">
                <label className="text-xs text-white/60 font-semibold uppercase tracking-wide">Estado</label>
                <select name="estado" value={form.estado} onChange={handleChange}
                  className="px-4 py-2.5 rounded-xl bg-slate-900/80 text-white border border-cyan-700/40 focus:border-cyan-400 outline-none font-semibold"
                >
                  <option value="borrador">📝 Borrador</option>
                  <option value="publicado">✅ Publicado</option>
                </select>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading}
                className="flex-1 py-3 rounded-xl font-bold text-white text-base transition-all disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#06b6d4,#3b82f6)", boxShadow: "0 0 20px rgba(6,182,212,0.3)" }}
              >
                {loading ? "Guardando…" : editId ? "Actualizar publicación" : "Publicar"}
              </button>
              <button type="button" onClick={() => { resetForm(); setVista("lista"); }}
                className="px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* ══════════════════════════════════════════════════════
            LISTA DE PUBLICACIONES
        ══════════════════════════════════════════════════════ */}
        {vista === "lista" && (
          <>
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <input
                value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                placeholder="🔍 Buscar publicaciones..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800/80 text-white border border-cyan-700/40 focus:border-cyan-400 outline-none"
              />
              <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-slate-800/80 text-white border border-cyan-700/40 focus:border-cyan-400 outline-none"
              >
                <option value="todos">Todos los estados</option>
                <option value="publicado">✅ Publicados</option>
                <option value="borrador">📝 Borradores</option>
              </select>
            </div>

            {/* Tarjetas */}
            {postsFiltrados.length === 0 ? (
              <div className="text-center py-16 text-white/40">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-lg">No hay publicaciones</p>
                <p className="text-sm mt-1">Crea tu primera publicación con el botón de arriba</p>
              </div>
            ) : (
              <div className="space-y-4">
                {postsFiltrados.map((post) => (
                  <div key={post.id}
                    className="bg-slate-800/80 rounded-2xl border border-cyan-900/30 shadow-lg p-4 flex flex-col sm:flex-row gap-4 hover:border-cyan-500/40 transition-all"
                  >
                    {/* Portada thumbnail */}
                    <div className="w-full sm:w-28 h-20 rounded-xl overflow-hidden bg-slate-700 flex-shrink-0">
                      {post.portada_url ? (
                        <img src={post.portada_url} alt={post.titulo} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl text-white/20">📰</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                          post.estado === "publicado"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                        }`}>
                          {post.estado === "publicado" ? "✅ Publicado" : "📝 Borrador"}
                        </span>
                        {post.destacado && <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">⭐ Destacado</span>}
                        {post.importante && <span className="text-xs px-2.5 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">🔥 Importante</span>}
                        {(post.video_url || post.video_archivo_url) && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">🎬 Video</span>
                        )}
                      </div>

                      <h3 className="text-white font-bold text-base truncate">{post.titulo}</h3>
                      <p className="text-white/50 text-sm truncate mt-0.5">{post.extracto}</p>

                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-white/40">
                        {post.fecha_publicacion && <span>📅 {post.fecha_publicacion}</span>}
                        <span>⏱ {post.tiempo_lectura}</span>
                        <span>✍️ {post.autor}</span>
                        {post.tags && <span>🏷 {post.tags}</span>}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex sm:flex-col gap-2 justify-end flex-shrink-0">
                      <button onClick={() => handleEditar(post)}
                        className="px-4 py-2 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 text-sm font-semibold border border-cyan-600/30 transition-all"
                      >
                        ✏️ Editar
                      </button>
                      <button onClick={() => toggleEstado(post)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                          post.estado === "publicado"
                            ? "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border-yellow-500/30"
                            : "bg-green-500/20 hover:bg-green-500/30 text-green-300 border-green-500/30"
                        }`}
                      >
                        {post.estado === "publicado" ? "⬇ Borrador" : "✅ Publicar"}
                      </button>
                      <button onClick={() => handleEliminar(post.id)}
                        className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-semibold border border-red-500/30 transition-all"
                      >
                        🗑 Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
