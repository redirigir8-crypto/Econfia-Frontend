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
    <section className="relative min-h-screen overflow-y-auto bg-transparent px-4 py-8 pb-28 sm:px-6">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-12 top-20 h-64 w-64 rounded-full bg-brand/15 blur-3xl" />
        <div className="absolute right-14 top-32 h-80 w-80 rounded-full bg-brand-2/15 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-ok/10 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-6xl">

        {toast && (
          <Toast {...toast} onClose={() => setToast(null)}
            sound={toast.type === "error" ? "/sounds/error-011-352286.mp3" : "/sounds/econfia-bot/econfia-1.wav"}
          />
        )}

        {/* ── Header ── */}
        <div className="mb-6 overflow-hidden rounded-[28px] border border-line/15 bg-surface/90 p-6 shadow-[0_22px_65px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex rounded-full border border-brand/25 bg-brand/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.28em] text-brand">Centro Administrativo</p>
            <h2 className="text-4xl font-black tracking-tight text-content sm:text-5xl">Blog & Noticias</h2>
            <p className="mt-4 text-base leading-7 text-muted">
              Administra publicaciones, estados, destacados y contenido multimedia del blog.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-ok/25 bg-ok/10 px-5 py-4 shadow-inner">
              <div className="text-[11px] font-black uppercase tracking-[0.24em] text-muted">Publicados</div>
              <div className="mt-2 text-3xl font-black text-ok">{totalPublicados}</div>
            </div>
            <div className="rounded-2xl border border-warn/25 bg-warn/10 px-5 py-4 shadow-inner">
              <div className="text-[11px] font-black uppercase tracking-[0.24em] text-muted">Borradores</div>
              <div className="mt-2 text-3xl font-black text-warn">{totalBorradores}</div>
            </div>
          </div>
          </div>
          <div className="mt-6 flex justify-end">
          <button
            onClick={() => { resetForm(); setVista(vista === "form" ? "lista" : "form"); }}
            className="flex items-center gap-2 rounded-xl px-5 py-3 font-black text-white shadow-[0_16px_35px_rgba(14,165,233,0.28)] transition-all hover:-translate-y-0.5"
            style={{ background: vista === "form" ? "linear-gradient(135deg,#475569,#334155)" : "linear-gradient(135deg,#06b6d4,#3b82f6)" }}
          >
            {vista === "form" ? "← Volver a la lista" : "+ Nueva publicación"}
          </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            FORMULARIO
        ══════════════════════════════════════════════════════ */}
        {vista === "form" && (
          <form onSubmit={handleSubmit} className="mb-8 space-y-5 rounded-[24px] border border-line/15 bg-surface/90 p-5 shadow-[0_22px_65px_rgba(15,23,42,0.16)] backdrop-blur-xl md:p-8">
            <h3 className="mb-2 text-xl font-black text-brand">
              {editId ? "✏️ Editar publicación" : "📝 Nueva publicación"}
            </h3>

            {/* Título */}
            <div>
              <label className="mb-1 block text-xs font-black uppercase tracking-wide text-muted">Título *</label>
              <input name="titulo" value={form.titulo} onChange={handleChange} required
                placeholder="Título de la publicación"
                className="w-full rounded-xl border border-line/15 bg-surface px-4 py-3 text-base font-semibold text-content outline-none transition placeholder:text-muted/70 focus:border-brand/50 focus:ring-4 focus:ring-brand/10"
              />
            </div>

            {/* Extracto */}
            <div>
              <label className="mb-1 block text-xs font-black uppercase tracking-wide text-muted">Extracto * <span className="normal-case text-muted/70">(resumen corto para la lista)</span></label>
              <textarea name="extracto" value={form.extracto} onChange={handleChange} required rows={2}
                placeholder="Breve descripción que aparece en la lista del blog..."
                className="w-full resize-none rounded-xl border border-line/15 bg-surface px-4 py-3 text-content outline-none transition placeholder:text-muted/70 focus:border-brand/50 focus:ring-4 focus:ring-brand/10"
              />
            </div>

            {/* Contenido */}
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-wide text-muted">
                Contenido * <span className="normal-case text-muted/70">(texto completo del artículo)</span>
              </label>

              {/* ── Barra de herramientas ── */}
              <div className="mb-2 flex flex-wrap gap-1.5 rounded-t-xl border border-line/15 border-b-0 bg-surface-2/70 p-2">
                {/* Formato inline */}
                <button type="button" title="Negrita" onClick={() => insertAtCursor("**", "**", "texto en negrita")}
                  className="rounded-lg border border-line/15 bg-surface px-2.5 py-1 text-xs font-bold text-content transition-all hover:bg-brand/10">B</button>
                <button type="button" title="Cursiva" onClick={() => insertAtCursor("*", "*", "texto en cursiva")}
                  className="rounded-lg border border-line/15 bg-surface px-2.5 py-1 text-xs italic text-content/80 transition-all hover:bg-brand/10">I</button>

                <span className="mx-1 w-px bg-line/10" />

                {/* Encabezados */}
                <button type="button" title="Título grande" onClick={() => insertBlock("# Título de sección")}
                  className="rounded-lg border border-line/15 bg-surface px-2.5 py-1 text-xs font-bold text-brand transition-all hover:bg-brand/10">H1</button>
                <button type="button" title="Subtítulo" onClick={() => insertBlock("## Subtítulo")}
                  className="rounded-lg border border-line/15 bg-surface px-2.5 py-1 text-xs font-semibold text-brand transition-all hover:bg-brand/10">H2</button>
                <button type="button" title="Título pequeño" onClick={() => insertBlock("### Título pequeño")}
                  className="rounded-lg border border-line/15 bg-surface px-2.5 py-1 text-xs text-brand transition-all hover:bg-brand/10">H3</button>

                <span className="mx-1 w-px bg-line/10" />

                {/* Bloques */}
                <button type="button" title="Cita destacada" onClick={() => insertBlock('> "Escribe aquí una cita o frase destacada."')}
                  className="rounded-lg border border-line/15 bg-surface px-2.5 py-1 text-xs italic text-content/70 transition-all hover:bg-brand/10">" "</button>
                <button type="button" title="Lista con puntos" onClick={() => insertBlock("- Punto uno\n- Punto dos\n- Punto tres")}
                  className="rounded-lg border border-line/15 bg-surface px-2.5 py-1 text-xs text-content transition-all hover:bg-brand/10">• Lista</button>
                <button type="button" title="Lista numerada" onClick={() => insertBlock("1. Primer paso\n2. Segundo paso\n3. Tercer paso")}
                  className="rounded-lg border border-line/15 bg-surface px-2.5 py-1 text-xs text-content transition-all hover:bg-brand/10">1. Lista</button>
                <button type="button" title="Bloque destacado" onClick={() => insertBlock("💡 Texto de consejo o dato importante")}
                  className="rounded-lg border border-warn/20 bg-warn/10 px-2.5 py-1 text-xs text-warn transition-all hover:bg-warn/15">💡 Destacado</button>
                <button type="button" title="Línea separadora" onClick={() => insertBlock("---")}
                  className="rounded-lg border border-line/15 bg-surface px-2.5 py-1 text-xs text-muted transition-all hover:bg-brand/10">— Separador</button>

                <span className="mx-1 w-px bg-line/10" />

                {/* Sección especial */}
                <button type="button" title="Insertar tarjetas de beneficios" onClick={() => insertBlock(GRID_TEMPLATE)}
                  className="flex items-center gap-1 rounded-lg border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-bold text-brand transition-all hover:bg-brand/15">
                  ▦ Tarjetas
                </button>
                <button type="button" title="Insertar galería de imágenes con flip" onClick={() => insertBlock("[gallery]\nhttps://url-imagen-1.jpg :: Descripción de la primera imagen\nhttps://url-imagen-2.jpg :: Descripción de la segunda imagen\n[/gallery]")}
                  className="flex items-center gap-1 rounded-lg border border-ok/30 bg-ok/10 px-3 py-1 text-xs font-bold text-ok transition-all hover:bg-ok/15">
                  🖼️ Galería
                </button>
                <button type="button" title="Insertar video embebido en el contenido" onClick={() => insertBlock("[video]https://youtube.com/watch?v=XXXXXXXXXX[/video]")}
                  className="flex items-center gap-1 rounded-lg border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-400 transition-all hover:bg-violet-500/15">
                  ▶ Video
                </button>
              </div>

              <textarea
                ref={contenidoRef}
                name="contenido" value={form.contenido} onChange={handleChange} required rows={12}
                placeholder={"Escribe el contenido aquí...\n\nEjemplo:\nUsa los botones de arriba para dar formato.\nSepara los párrafos con una línea en blanco."}
                className="w-full resize-y rounded-b-xl border border-line/15 bg-surface px-4 py-3 font-mono text-sm text-content outline-none placeholder:text-muted/70 focus:border-brand/50"
              />
              <p className="mt-1 text-xs text-muted/70">
                Formatos: **negrita** · *cursiva* · # Título · &gt; cita · - lista · 💡 destacado · [grid]...[/grid] tarjetas · [gallery]url :: desc[/gallery] imágenes · [video]url[/video] video
              </p>
            </div>

            {/* Fila: Autor + Tiempo lectura + Fecha */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-xs font-black uppercase tracking-wide text-muted">Autor</label>
                <input name="autor" value={form.autor} onChange={handleChange}
                  className="w-full rounded-xl border border-line/15 bg-surface px-4 py-3 text-content outline-none focus:border-brand/50"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-black uppercase tracking-wide text-muted">Tiempo lectura</label>
                <input name="tiempo_lectura" value={form.tiempo_lectura} onChange={handleChange} placeholder="5 min"
                  className="w-full rounded-xl border border-line/15 bg-surface px-4 py-3 text-content outline-none placeholder:text-muted/70 focus:border-brand/50"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-black uppercase tracking-wide text-muted">Fecha publicación</label>
                <input name="fecha_publicacion" type="date" value={form.fecha_publicacion} onChange={handleChange}
                  className="w-full rounded-xl border border-line/15 bg-surface px-4 py-3 text-content outline-none focus:border-brand/50"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="mb-1 block text-xs font-black uppercase tracking-wide text-muted">Tags <span className="normal-case text-muted/70">(separados por coma)</span></label>
              <input name="tags" value={form.tags} onChange={handleChange}
                placeholder="cumplimiento, riesgo, automatización"
                className="w-full rounded-xl border border-line/15 bg-surface px-4 py-3 text-content outline-none placeholder:text-muted/70 focus:border-brand/50"
              />
            </div>

            {/* Imagen portada */}
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-wide text-muted">Imagen de portada</label>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {portadaPreview && (
                  <img src={portadaPreview} alt="preview" className="h-24 w-32 rounded-xl border border-line/15 object-cover" />
                )}
                <div className="flex-1">
                  <input ref={portadaRef} type="file" accept="image/*" onChange={handlePortada}
                    className="w-full cursor-pointer text-sm text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-brand file:px-4 file:py-2 file:font-semibold file:text-white hover:file:opacity-90"
                  />
                  <p className="mt-1 text-xs text-muted/70">PNG, JPG, WebP — máx. 5MB</p>
                </div>
              </div>
            </div>

            {/* Video */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-black uppercase tracking-wide text-muted">Video URL <span className="normal-case text-muted/70">(YouTube / Vimeo)</span></label>
                <input name="video_url" value={form.video_url} onChange={handleChange}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full rounded-xl border border-line/15 bg-surface px-4 py-3 text-sm text-content outline-none placeholder:text-muted/70 focus:border-brand/50"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-wide text-muted">Video archivo <span className="normal-case text-muted/70">(MP4)</span></label>

                {/* Video existente en edición */}
                {existingVideoUrl && !clearVideo && (
                  <div className="mb-2 flex items-center gap-3 rounded-xl border border-violet-400/30 bg-violet-500/10 px-3 py-2">
                    <span className="flex-1 truncate text-xs text-violet-400">🎬 {existingVideoUrl.split("/").pop()}</span>
                    <button type="button"
                      onClick={() => { setClearVideo(true); if (videoRef.current) videoRef.current.value = ""; }}
                      className="flex-shrink-0 rounded-lg border border-danger/30 bg-danger/10 px-3 py-1 text-xs font-semibold text-danger transition-all hover:bg-danger/15"
                    >
                      ✕ Quitar video
                    </button>
                  </div>
                )}

                {clearVideo && (
                  <div className="mb-2 flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2">
                    <span className="flex-1 text-xs text-danger">Video será eliminado al guardar</span>
                    <button type="button"
                      onClick={() => setClearVideo(false)}
                      className="text-xs text-muted underline hover:text-content"
                    >Deshacer</button>
                  </div>
                )}

                {(!existingVideoUrl || clearVideo) && (
                  <input ref={videoRef} type="file" accept="video/*" onChange={(e) => { const f = e.target.files[0]; if (f) { setVideoFile(f); setClearVideo(false); } }}
                    className="w-full cursor-pointer text-sm text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-violet-500 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:opacity-90"
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
                <span className="font-semibold text-content">⭐ Destacado</span>
                <span className="text-xs text-muted">(aparece como post principal)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" name="importante" checked={form.importante} onChange={handleChange}
                  className="w-5 h-5 rounded accent-yellow-400"
                />
                <span className="font-semibold text-content">🔥 Importante</span>
                <span className="text-xs text-muted">(badge amarillo)</span>
              </label>
              <div className="ml-auto flex items-center gap-3">
                <label className="text-xs font-black uppercase tracking-wide text-muted">Estado</label>
                <select name="estado" value={form.estado} onChange={handleChange}
                  className="rounded-xl border border-line/15 bg-surface px-4 py-2.5 font-semibold text-content outline-none focus:border-brand/50"
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
                className="rounded-xl border border-line/15 bg-surface px-6 py-3 font-semibold text-content transition-all hover:border-brand/40"
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
            <div className="mb-5 grid gap-3 rounded-[24px] border border-line/15 bg-surface/90 p-4 shadow-[0_16px_42px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:grid-cols-[1fr_240px]">
              <input
                value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                placeholder="🔍 Buscar publicaciones..."
                className="w-full rounded-xl border border-line/15 bg-surface px-4 py-3 font-semibold text-content outline-none transition placeholder:text-muted/70 focus:border-brand/50 focus:ring-4 focus:ring-brand/10"
              />
              <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full rounded-xl border border-line/15 bg-surface px-4 py-3 font-semibold text-content outline-none transition focus:border-brand/50 focus:ring-4 focus:ring-brand/10"
              >
                <option value="todos">Todos los estados</option>
                <option value="publicado">✅ Publicados</option>
                <option value="borrador">📝 Borradores</option>
              </select>
            </div>

            {/* Tarjetas */}
            {postsFiltrados.length === 0 ? (
              <div className="rounded-[24px] border border-line/15 bg-surface/90 py-16 text-center text-muted shadow-[0_16px_42px_rgba(15,23,42,0.12)]">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-lg font-black text-content">No hay publicaciones</p>
                <p className="mt-1 text-sm">Crea tu primera publicación con el botón de arriba</p>
              </div>
            ) : (
              <div className="space-y-4">
                {postsFiltrados.map((post) => (
                  <div key={post.id}
                    className="flex flex-col gap-4 rounded-[24px] border border-line/15 bg-surface/90 p-4 shadow-[0_16px_42px_rgba(15,23,42,0.12)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-brand/35 sm:flex-row"
                  >
                    {/* Portada thumbnail */}
                    <div className="h-24 w-full flex-shrink-0 overflow-hidden rounded-2xl border border-line/10 bg-surface-2 sm:h-24 sm:w-36">
                      {post.portada_url ? (
                        <img src={post.portada_url} alt={post.titulo} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-3xl text-muted/50">📰</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                          post.estado === "publicado"
                            ? "bg-ok/10 text-ok border border-ok/30"
                            : "bg-warn/10 text-warn border border-warn/30"
                        }`}>
                          {post.estado === "publicado" ? "✅ Publicado" : "📝 Borrador"}
                        </span>
                        {post.destacado && <span className="rounded-full border border-danger/30 bg-danger/10 px-2.5 py-0.5 text-xs font-bold text-danger">⭐ Destacado</span>}
                        {post.importante && <span className="rounded-full border border-warn/30 bg-warn/10 px-2.5 py-0.5 text-xs font-bold text-warn">🔥 Importante</span>}
                        {(post.video_url || post.video_archivo_url) && (
                          <span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-2.5 py-0.5 text-xs font-bold text-violet-400">🎬 Video</span>
                        )}
                      </div>

                      <h3 className="truncate text-base font-black text-content">{post.titulo}</h3>
                      <p className="mt-0.5 truncate text-sm text-muted">{post.extracto}</p>

                      <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold text-muted">
                        {post.fecha_publicacion && <span>📅 {post.fecha_publicacion}</span>}
                        <span>⏱ {post.tiempo_lectura}</span>
                        <span>✍️ {post.autor}</span>
                        {post.tags && <span>🏷 {post.tags}</span>}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex sm:flex-col gap-2 justify-end flex-shrink-0">
                      <button onClick={() => handleEditar(post)}
                        className="rounded-lg border border-brand/30 bg-brand/10 px-4 py-2 text-sm font-black text-brand transition-all hover:bg-brand/15"
                      >
                        ✏️ Editar
                      </button>
                      <button onClick={() => toggleEstado(post)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                          post.estado === "publicado"
                            ? "bg-warn/10 hover:bg-warn/15 text-warn border-warn/30"
                            : "bg-ok/10 hover:bg-ok/15 text-ok border-ok/30"
                        }`}
                      >
                        {post.estado === "publicado" ? "⬇ Borrador" : "✅ Publicar"}
                      </button>
                      <button onClick={() => handleEliminar(post.id)}
                        className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-2 text-sm font-black text-danger transition-all hover:bg-danger/15"
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
