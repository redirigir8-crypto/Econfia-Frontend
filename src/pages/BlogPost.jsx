// src/pages/BlogPost.jsx
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaCalendar, FaClock, FaUser, FaArrowLeft, FaArrowRight,
  FaShare, FaFire, FaStar, FaPlay,
} from "react-icons/fa";
import Header from "../components/Header";
import fallbackImg from "../assets/logo-econfia (1).png";

const POSTS_FALLBACK = [];

let API_URL = process.env.REACT_APP_API_URL || "";
if (!API_URL) {
  API_URL =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://localhost:8000/"
      : "https://www.econfia.co/";
}
if (!API_URL.endsWith("/")) API_URL += "/";

// ─────────────────────────────────────────────────────────────────────────────
// Markdown: devuelve secciones { type:'prose'|'grid'|'summary', ... }
// ─────────────────────────────────────────────────────────────────────────────
function inlineFormat(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-content font-bold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-brand not-italic font-medium">$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-brand/10 text-brand px-1.5 py-0.5 rounded font-mono text-sm">$1</code>');
}

function parseSections(text) {
  if (!text) return [];
  const lines = text.split("\n");
  const sections = [];
  let proseBuf  = [];      // elementos JSX del bloque prosa actual
  let listBuf   = [];
  let listType  = null;
  let keyN      = 0;
  const k       = () => keyN++;

  const flushList = () => {
    if (!listBuf.length) return;
    const isOl = listType === "ol";
    proseBuf.push(
      <div key={k()} className="mb-5 space-y-2">
        {listBuf.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3 text-base leading-relaxed text-muted">
            {isOl
              ? <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-brand/40 bg-brand/15 text-xs font-bold text-brand">{idx + 1}</span>
              : <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-brand" />
            }
            <span dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
          </div>
        ))}
      </div>
    );
    listBuf = []; listType = null;
  };

  const flushProse = () => {
    flushList();
    if (proseBuf.length) {
      sections.push({ type: "prose", elements: [...proseBuf] });
      proseBuf = [];
    }
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // ── Vacía
    if (line.trim() === "") { flushList(); i++; continue; }

    // ── [gallery] → cuadrícula con flip 3D
    if (line.trim() === "[gallery]") {
      flushProse();
      const images = [];
      i++;
      while (i < lines.length && lines[i].trim() !== "[/gallery]") {
        const gl = lines[i].trim();
        if (gl) {
          if (gl.includes("::")) {
            const sep = gl.indexOf("::");
            images.push({ url: gl.slice(0, sep).trim(), desc: gl.slice(sep + 2).trim() });
          } else {
            images.push({ url: gl, desc: "" });
          }
        }
        i++;
      }
      if (images.length) sections.push({ type: "gallery", images });
      i++; continue;
    }

    // ── [video]url[/video] → video inline en el contenido
    const videoInline = line.match(/^\[video\](.+)\[\/video\]$/);
    if (videoInline) {
      flushProse();
      sections.push({ type: "videoinline", url: videoInline[1].trim() });
      i++; continue;
    }

    // ── [grid] → tarjetas de beneficios
    if (line.trim() === "[grid]") {
      flushProse();
      // Buscar título previo (## en última sección pendiente)
      let gridTitle = "";
      // Leer cards
      const cards = [];
      i++;
      while (i < lines.length && lines[i].trim() !== "[/grid]") {
        const cl = lines[i].trim();
        if (cl) {
          const m = cl.match(/^(.{1,3}) \*\*(.+?)\*\* :: (.+)/)
                 || cl.match(/^(.{1,3}) (.+?) :: (.+)/);
          if (m) cards.push({ emoji: m[1], title: m[2], desc: m[3] });
          else if (cl.includes("::")) {
            const [l, d] = cl.split("::");
            cards.push({ emoji: "📌", title: l.replace(/\*\*/g, "").trim(), desc: d.trim() });
          }
        }
        i++;
      }
      if (cards.length) sections.push({ type: "grid", title: gridTitle, cards });
      i++; continue;
    }

    // ── [summary] bloque de cierre
    if (line.trim() === "[summary]") {
      flushProse();
      const summaryLines = [];
      i++;
      while (i < lines.length && lines[i].trim() !== "[/summary]") {
        if (lines[i].trim()) summaryLines.push(lines[i]);
        i++;
      }
      if (summaryLines.length)
        sections.push({ type: "summary", text: summaryLines.join(" ") });
      i++; continue;
    }

    // ── HR
    if (/^---+$/.test(line.trim())) {
      flushList();
      proseBuf.push(<hr key={k()} className="border-outline-variant/30 my-8" />);
      i++; continue;
    }

    // ── Encabezados — si preceden inmediatamente a [grid] los guardamos como título
    const h2 = line.match(/^## (.+)/);
    const h3 = line.match(/^### (.+)/);
    const h1 = line.match(/^# (.+)/);
    if (h1) {
      flushList();
      // Peek: si la siguiente línea no vacía es [grid], úsalo como título
      let peek = i + 1; while (peek < lines.length && lines[peek].trim() === "") peek++;
      if (peek < lines.length && lines[peek].trim() === "[grid]") {
        // Guardarlo para el grid que viene
        flushProse();
        sections.push({ type: "gridtitle", title: h1[1] });
        i++; continue;
      }
      proseBuf.push(<h2 key={k()} className="mb-4 mt-8 text-2xl font-extrabold text-content md:text-3xl" dangerouslySetInnerHTML={{ __html: inlineFormat(h1[1]) }} />);
      i++; continue;
    }
    if (h2) {
      flushList();
      let peek = i + 1; while (peek < lines.length && lines[peek].trim() === "") peek++;
      if (peek < lines.length && lines[peek].trim() === "[grid]") {
        flushProse();
        sections.push({ type: "gridtitle", title: h2[1] });
        i++; continue;
      }
      proseBuf.push(<h3 key={k()} className="mb-3 mt-7 text-xl font-bold text-brand" dangerouslySetInnerHTML={{ __html: inlineFormat(h2[1]) }} />);
      i++; continue;
    }
    if (h3) {
      flushList();
      proseBuf.push(<h4 key={k()} className="mb-2 mt-5 text-lg font-semibold text-brand" dangerouslySetInnerHTML={{ __html: inlineFormat(h3[1]) }} />);
      i++; continue;
    }

    // ── Cita
    const quote = line.match(/^> (.+)/);
    if (quote) {
      flushList();
      proseBuf.push(
        <blockquote key={k()}
          className="relative my-6 rounded-r-xl border-l-4 border-brand bg-brand/10 py-4 pl-6 text-base italic leading-relaxed text-muted">
          <span className="absolute left-3 top-2 select-none font-serif text-4xl leading-none text-brand/25">"</span>
          <span className="relative" dangerouslySetInnerHTML={{ __html: inlineFormat(quote[1]) }} />
        </blockquote>
      );
      i++; continue;
    }

    // ── Listas
    const ulItem = line.match(/^[-*] (.+)/);
    if (ulItem) { if (listType && listType !== "ul") flushList(); listType = "ul"; listBuf.push(ulItem[1]); i++; continue; }
    const olItem = line.match(/^\d+\. (.+)/);
    if (olItem) { if (listType && listType !== "ol") flushList(); listType = "ol"; listBuf.push(olItem[1]); i++; continue; }

    // ── Bloque emoji
    const emojiLine = line.match(/^(💡|📌|⚠️|✅|🔑|📊|🚀|🎯|🔥|⭐) (.+)/);
    if (emojiLine) {
      flushList();
      proseBuf.push(
        <div key={k()} className="my-4 flex items-start gap-4 rounded-xl border border-brand/20 bg-brand/10 px-5 py-4">
          <span className="text-2xl flex-shrink-0">{emojiLine[1]}</span>
          <p className="text-base leading-relaxed text-muted" dangerouslySetInnerHTML={{ __html: inlineFormat(emojiLine[2]) }} />
        </div>
      );
      i++; continue;
    }

    // ── Párrafo
    flushList();
    proseBuf.push(
      <p key={k()} className="mb-5 text-base leading-[1.85] text-muted md:text-lg"
        dangerouslySetInnerHTML={{ __html: inlineFormat(line) }} />
    );
    i++;
  }
  flushProse();
  return sections;
}

// Fusionar "gridtitle" con el grid que sigue
function mergeSections(sections) {
  const result = [];
  for (let i = 0; i < sections.length; i++) {
    if (sections[i].type === "gridtitle" && i + 1 < sections.length && sections[i + 1].type === "grid") {
      result.push({ ...sections[i + 1], title: sections[i].title });
      i++;
    } else {
      result.push(sections[i]);
    }
  }
  return result;
}

// ── CSS: glow + flip cards ────────────────────────────────────────────────────
const glassHoverStyle = `
  .glass-prose {
    background: rgb(var(--th-surface) / 0.86);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border: 1px solid rgb(var(--th-line) / 0.12);
    transition: background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
  }
  .glass-prose:hover {
    background: rgb(var(--th-surface) / 0.94);
    border-color: rgb(var(--th-brand) / 0.25);
    box-shadow: 0 16px 42px rgb(var(--th-brand) / 0.10), inset 0 0 24px rgb(var(--th-brand) / 0.03);
  }
  .benefit-card {
    background: rgb(var(--th-surface) / 0.86);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgb(var(--th-line) / 0.12);
    transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
  }
  .benefit-card:hover {
    background: rgb(var(--th-surface) / 0.94);
    border-color: rgb(var(--th-brand) / 0.35);
    box-shadow: 0 16px 36px rgb(var(--th-brand) / 0.14);
    transform: translateY(-2px);
  }
  .benefit-card:hover .benefit-icon {
    transform: scale(1.15);
  }
  .benefit-icon {
    transition: transform 0.3s ease;
    display: inline-block;
  }

  /* ── Flip card gallery ── */
  .flip-card {
    perspective: 900px;
    cursor: pointer;
  }
  .flip-inner {
    position: relative;
    width: 100%;
    padding-bottom: 100%;
    transform-style: preserve-3d;
    transition: transform 0.55s cubic-bezier(0.4,0.2,0.2,1);
  }
  .flip-card:hover .flip-inner {
    transform: rotateY(180deg);
  }
  .flip-front, .flip-back {
    position: absolute;
    inset: 0;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border-radius: 14px;
    overflow: hidden;
  }
  .flip-back {
    transform: rotateY(180deg);
    background: rgb(var(--th-surface) / 0.96);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    border: 1px solid rgb(var(--th-brand) / 0.25);
    box-shadow: inset 0 0 30px rgb(var(--th-brand) / 0.07);
  }
`;

// Componente que renderiza las secciones
function ArticleContent({ contenido }) {
  const sections = mergeSections(parseSections(contenido));

  return (
    <>
      <style>{glassHoverStyle}</style>
      <div className="space-y-5">
        {sections.map((sec, idx) => {

          // ── Prosa: glass card translúcida con glow al hover
          if (sec.type === "prose") return (
            <div key={idx} className="glass-prose rounded-xl p-6 md:p-8">
              {sec.elements}
            </div>
          );

          // ── Grid de beneficios
          if (sec.type === "grid") return (
            <section key={idx} className="pt-1">
              {sec.title && (
                <h3 className="mb-5 pl-1 text-xl font-black text-brand md:text-2xl">{sec.title}</h3>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sec.cards.map((c, ci) => (
                  <div key={ci} className="benefit-card rounded-xl p-6 cursor-default">
                    <span className="benefit-icon mb-4 block text-4xl">{c.emoji}</span>
                    <h4 className="mb-2 text-lg font-black text-content">{c.title}</h4>
                    <p className="text-sm leading-relaxed text-muted">{c.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          );

          // ── Summary
          if (sec.type === "summary") return (
            <div key={idx}
              className="glass-prose rounded-xl p-6"
              style={{ borderColor: "rgb(var(--th-line) / 0.12)" }}>
              <p className="text-base leading-relaxed text-muted"
                dangerouslySetInnerHTML={{ __html: inlineFormat(sec.text) }} />
            </div>
          );

          // ── Galería con flip 3D
          if (sec.type === "gallery") return (
            <section key={idx} className="pt-1">
              <div className={`grid gap-4 ${
                sec.images.length === 1 ? "grid-cols-1 max-w-sm" :
                sec.images.length === 2 ? "grid-cols-2" :
                "grid-cols-2 sm:grid-cols-3"
              }`}>
                {sec.images.map((img, gi) => (
                  <div key={gi} className="flip-card">
                    <div className="flip-inner">
                      {/* Frente — imagen */}
                      <div className="flip-front">
                        <img
                          src={img.url}
                          alt={img.desc || "imagen"}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.src = fallbackImg; }}
                        />
                        {/* Hint de que hay descripción */}
                        {img.desc && (
                          <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-2">
                            <span className="text-white/50 text-[10px] tracking-widest uppercase">ver más</span>
                          </div>
                        )}
                      </div>
                      {/* Reverso — descripción */}
                      <div className="flip-back">
                        <div className="mb-4 h-px w-8 bg-brand/50" />
                        <p className="text-center text-sm font-medium leading-relaxed text-content">
                          {img.desc || ""}
                        </p>
                        <div className="mt-4 h-px w-8 bg-brand/50" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-center text-xs tracking-wide text-muted">Pasa el cursor sobre las imágenes</p>
            </section>
          );

          // ── Video inline
          if (sec.type === "videoinline") {
            const url = sec.url;
            const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?\s]+)/);
            const vm = url.match(/vimeo\.com\/(\d+)/);
            const embedSrc = yt ? `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1`
                           : vm ? `https://player.vimeo.com/video/${vm[1]}` : null;
            return (
              <div key={idx} className="overflow-hidden rounded-2xl border border-brand/15 bg-surface shadow-xl backdrop-blur">
                {embedSrc
                  ? <div className="aspect-video"><iframe src={embedSrc} title="Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" /></div>
                  : <video controls className="w-full" src={url}>Tu navegador no soporta video.</video>
                }
              </div>
            );
          }

          return null;
        })}
      </div>
    </>
  );
}

// ── Video embebido ────────────────────────────────────────────────────────────
function VideoPlayer({ video_url, video_archivo_url, compact = false }) {
  if (!video_url && !video_archivo_url) return null;
  let embedSrc = null;
  if (video_url) {
    const yt = video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?\s]+)/);
    const vm = video_url.match(/vimeo\.com\/(\d+)/);
    if (yt) embedSrc = `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1`;
    else if (vm) embedSrc = `https://player.vimeo.com/video/${vm[1]}`;
  }
  return (
    <div className={compact ? "" : "my-8"}>
      {!compact && (
        <div className="flex items-center gap-2 mb-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-brand/40 bg-brand/15">
            <FaPlay className="text-cyan-400 text-[10px] ml-px" />
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-brand">Video</span>
        </div>
      )}
      <div className="overflow-hidden rounded-2xl border border-line/10 bg-surface shadow-xl">
        {embedSrc
          ? <div className="aspect-video"><iframe src={embedSrc} title="Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" /></div>
          : <video controls className="w-full" src={video_archivo_url}>Tu navegador no soporta video.</video>
        }
      </div>
    </div>
  );
}

// ── Panel lateral de medios ───────────────────────────────────────────────────
function MediaPanel({ post }) {
  const hasVideo = post.video_url || post.video_archivo_url;
  if (!hasVideo && !post.cover) return null;

  return (
    <div className="space-y-4">

      {/* Imagen de portada — completa, con glow */}
      {post.cover && (
        <div
          className="group overflow-hidden rounded-2xl border border-brand/15 bg-surface/90 shadow-[0_16px_42px_rgba(15,23,42,0.14)] transition-all duration-300 hover:border-brand/30 hover:shadow-cyan-500/15"
        >
          <img
            src={post.cover}
            alt={post.title}
            className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
            onError={(e) => { e.currentTarget.src = fallbackImg; }}
          />
        </div>
      )}

      {/* Video */}
      {hasVideo && (
        <div
          className="overflow-hidden rounded-2xl border border-brand/15 bg-surface/90 shadow-[0_16px_42px_rgba(15,23,42,0.14)] transition-all duration-300 hover:border-brand/30 hover:shadow-cyan-500/15"
        >
          {/* Label */}
          <div className="flex items-center gap-2 border-b border-line/10 px-4 py-3">
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-brand/30 bg-brand/15">
              <FaPlay className="text-cyan-400 text-[8px] ml-px" />
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-brand">Video</span>
          </div>
          <VideoPlayer video_url={post.video_url} video_archivo_url={post.video_archivo_url} compact />
        </div>
      )}

    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function BlogPost() {
  const { slug }    = useParams();
  const navigate    = useNavigate();
  const [post, setPost]         = useState(null);
  const [related, setRelated]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true); setNotFound(false);
    fetch(`${API_URL}api/blog/${slug}/`)
      .then((r) => { if (r.status === 404) throw new Error("not_found"); if (!r.ok) throw new Error("error"); return r.json(); })
      .then((data) => {
        setPost({
          slug: data.slug, title: data.titulo, date: data.fecha_publicacion || "",
          readTime: data.tiempo_lectura || "5 min", autor: data.autor,
          cover: data.portada_url || null, tags: data.tags_lista || [],
          featured: data.destacado, importante: data.importante, contenido: data.contenido,
          video_url: data.video_url || null, video_archivo_url: data.video_archivo_url || null,
        });
        return fetch(`${API_URL}api/blog/`);
      })
      .then((r) => r && r.ok ? r.json() : [])
      .then((list) => {
        if (Array.isArray(list))
          setRelated(list.filter((p) => p.slug !== slug).slice(0, 2).map((p) => ({
            slug: p.slug, title: p.titulo, date: p.fecha_publicacion || "",
            readTime: p.tiempo_lectura || "5 min", cover: p.portada_url || null,
          })));
      })
      .catch(() => {
        const fb = POSTS_FALLBACK.find((p) => p.slug === slug);
        if (fb) { setPost(fb); setRelated(POSTS_FALLBACK.filter((p) => p.slug !== slug).slice(0, 2)); }
        else setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) navigator.share({ title: post?.title, url: window.location.href });
    else { navigator.clipboard.writeText(window.location.href); alert("Link copiado al portapapeles"); }
  };

  if (loading) return (
    <main className="min-h-screen bg-transparent pb-20 pt-24 text-content">
      <Header />
      <div className="flex justify-center py-24"><div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>
    </main>
  );

  if (notFound || !post) return (
    <main className="min-h-screen bg-transparent pb-20 pt-24 text-content">
      <Header />
      <section className="max-w-4xl mx-auto px-6 text-center py-20">
        <h1 className="mb-4 text-4xl font-black text-content">Artículo no encontrado</h1>
        <p className="mb-8 text-muted">No pudimos encontrar el artículo que buscas.</p>
        <Link to="/blog" className="inline-flex items-center gap-2 font-semibold text-brand hover:opacity-80"><FaArrowLeft /> Volver al blog</Link>
      </section>
    </main>
  );

  const hasMedia = post.cover || post.video_url || post.video_archivo_url;

  return (
    <main className="min-h-screen bg-transparent text-content">
      <Header />

      {/* ══════════════════════════════════════════════
          HERO — imagen de portada grande con degradé
      ══════════════════════════════════════════════ */}
      {post.cover ? (
        <div className="relative w-full overflow-hidden" style={{ minHeight: "380px", maxHeight: "520px" }}>
          <img
            src={post.cover}
            alt={post.title}
            className="w-full h-full object-cover"
            style={{ minHeight: "380px", maxHeight: "520px", objectPosition: "center top" }}
            loading="eager"
            onError={(e) => { e.currentTarget.src = fallbackImg; }}
          />
          {/* Degradé lateral izquierdo */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/40 to-transparent" />
          {/* Degradé inferior para fundir con el fondo */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
          {/* Degradé superior (para el header) */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-transparent to-transparent" />

          {/* Título superpuesto en el hero */}
          <div className="absolute inset-0 flex flex-col justify-end pb-10 pt-20">
            <div className="max-w-6xl mx-auto px-4 md:px-6 w-full">
              <div className="max-w-xl">
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.featured && (
                    <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-red-500 text-white font-bold shadow-lg">
                      <FaFire /> Destacado
                    </span>
                  )}
                  {post.importante && (
                    <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-yellow-400 text-black font-bold shadow-lg">
                      <FaStar /> Importante
                    </span>
                  )}
                  {post.tags?.map((tag) => (
                    <span key={tag} className="rounded-full border border-cyan-400/50 bg-cyan-400/15 px-3 py-1 text-xs font-semibold text-cyan-100 backdrop-blur-sm">
                      {tag}
                    </span>
                  ))}
                </div>

                <h1 className="text-3xl md:text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight text-white drop-shadow-2xl">
                  {post.title}
                </h1>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Sin imagen: espaciado para el header */
        <div className="pt-24" />
      )}

      {/* ══════════════════════════════════════════════
          CONTENIDO
      ══════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 pb-24">

        {/* Volver */}
        <div className="pt-5 pb-4">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition-colors hover:opacity-80">
            <FaArrowLeft /> Volver al blog
          </Link>
        </div>

        {/* Si no hay imagen de portada, mostrar el título aquí */}
        {!post.cover && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.featured && <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-red-500 text-white font-bold"><FaFire /> Destacado</span>}
              {post.importante && <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-yellow-400 text-black font-bold"><FaStar /> Importante</span>}
              {post.tags?.map((tag) => <span key={tag} className="rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">{tag}</span>)}
            </div>
            <h1
              className="mb-2 bg-clip-text text-3xl font-extrabold leading-tight tracking-tight text-transparent md:text-5xl"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgb(var(--th-content)), rgb(var(--th-brand)), rgb(var(--th-brand-2)))",
              }}
            >
              {post.title}
            </h1>
          </div>
        )}

        {/* Meta bar */}
        <div className="mb-8 flex flex-wrap items-center gap-4 border-b border-line/10 pb-4 text-sm font-semibold text-muted">
          <span className="flex items-center gap-1.5"><FaUser className="text-brand/80" /> {post.autor}</span>
          <span className="flex items-center gap-1.5"><FaCalendar className="text-brand/80" /> {post.date}</span>
          <span className="flex items-center gap-1.5"><FaClock className="text-brand/80" /> {post.readTime} de lectura</span>
          <button onClick={handleShare} className="ml-auto flex items-center gap-1.5 font-semibold text-brand transition-colors hover:opacity-80">
            <FaShare /> Compartir
          </button>
        </div>

        {/* Grid: artículo + sidebar */}
        <div className={`flex flex-col ${hasMedia ? "lg:flex-row lg:gap-8 xl:gap-12" : ""}`}>

          {/* ─── ARTÍCULO (columna izquierda) ─── */}
          <article className="flex-1 min-w-0">
            <ArticleContent contenido={post.contenido} />

            {/* CTA */}
            <div className="mt-14 rounded-3xl border border-brand/20 bg-surface/90 p-8 text-center shadow-[0_16px_42px_rgba(15,23,42,0.12)] md:p-10">
              <div className="mb-3 text-xs font-black uppercase tracking-widest text-brand">Econfia</div>
              <h3 className="mb-3 text-2xl font-black text-content md:text-3xl">¿Listo para optimizar tus procesos?</h3>
              <p className="mx-auto mb-7 max-w-md text-sm leading-relaxed text-muted">
                Automatiza tu debida diligencia con Econfia y toma decisiones más seguras y eficientes.
              </p>
              <Link to="/servicio-econfia"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-7 py-3 font-black text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-105">
                Conocer más <FaArrowRight />
              </Link>
            </div>

            {/* Relacionados */}
            {related.length > 0 && (
              <div className="mt-16">
                <h3 className="mb-5 flex items-center gap-3 text-lg font-black text-content">
                  <span className="h-px flex-1 bg-line/10" /> Artículos relacionados <span className="h-px flex-1 bg-line/10" />
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {related.map((r) => (
                    <div key={r.slug} onClick={() => navigate(`/blog/${r.slug}`)}
                      className="group cursor-pointer overflow-hidden rounded-2xl border border-line/10 bg-surface/90 shadow-[0_12px_32px_rgba(15,23,42,0.10)] transition-all hover:border-brand/30 hover:bg-surface">
                      <div className="aspect-video overflow-hidden bg-surface-2">
                        <img src={r.cover || fallbackImg} alt={r.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy" onError={(e) => { e.currentTarget.src = fallbackImg; }} />
                      </div>
                      <div className="p-4">
                        <h4 className="mb-1.5 line-clamp-2 text-sm font-black text-content transition-colors group-hover:text-brand">{r.title}</h4>
                        <div className="flex items-center gap-3 text-xs font-semibold text-muted">
                          <span className="flex items-center gap-1"><FaCalendar className="text-brand/70" /> {r.date}</span>
                          <span className="flex items-center gap-1"><FaClock className="text-brand/70" /> {r.readTime}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* ─── SIDEBAR (columna derecha) ─── */}
          {hasMedia && (
            <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0 mt-8 lg:mt-0">
              <div className="lg:sticky lg:top-28">
                <MediaPanel post={post} />
              </div>
            </aside>
          )}

        </div>
      </div>
    </main>
  );
}
