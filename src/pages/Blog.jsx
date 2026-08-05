// src/pages/Blog.jsx
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../components/Header"
import { FaCalendar, FaClock, FaArrowRight, FaSearch, FaFire, FaTags } from "react-icons/fa";
import fallbackImg from "../assets/logo-econfia (1).png";

// Normaliza un post del API al formato que usan los componentes
function normalizar(p) {
  return {
    slug:      p.slug,
    title:     p.titulo,
    date:      p.fecha_publicacion || "",
    readTime:  p.tiempo_lectura || "5 min",
    excerpt:   p.extracto,
    cover:     p.portada_url || null,
    tags:      p.tags_lista || [],
    featured:  p.destacado,
    importante: p.importante,
    autor:     p.autor,
    contenido: p.contenido,
    video_url: p.video_url || null,
    video_archivo_url: p.video_archivo_url || null,
  };
}

const POSTS_FALLBACK = [];

let API_URL = process.env.REACT_APP_API_URL || "";
if (!API_URL) {
  API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000/"
    : "https://www.econfia.co/";
}
if (!API_URL.endsWith("/")) API_URL += "/";

const Tag = ({ children, onClick, active }) => (
  <span 
    onClick={onClick}
    className={`cursor-pointer rounded-full border px-4 py-2 text-xs font-semibold transition-all ${
      active 
        ? 'border-brand/40 bg-brand/15 text-brand' 
        : 'border-line/15 bg-surface/70 text-muted hover:border-brand/50 hover:bg-brand/10 hover:text-brand'
    }`}
  >
    {children}
  </span>
);

function FeaturedPost({ post }) {
  const navigate = useNavigate();
  return (
    <article
      onClick={() => navigate(`/blog/${post.slug}`)}
      className="group cursor-pointer overflow-hidden rounded-3xl border border-brand/25 bg-surface/90 shadow-[0_22px_65px_rgba(15,23,42,0.16)] backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-brand/45 hover:shadow-cyan-500/20"
    >
      <div className="grid md:grid-cols-2 gap-0">
        {/* Imagen */}
        <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-3xl bg-surface-2">
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            <FaFire /> Destacado
          </div>
          <img
            src={post.cover}
            alt={post.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = fallbackImg;
            }}
          />
        </div>

        {/* Contenido */}
        <div className="flex flex-col justify-center p-8">
          <div className="mb-4 flex items-center gap-4 text-sm font-semibold text-brand">
            <span className="flex items-center gap-1">
              <FaCalendar /> {post.date}
            </span>
            <span className="flex items-center gap-1">
              <FaClock /> {post.readTime}
            </span>
          </div>

          <h2 className="mb-4 text-3xl font-black leading-tight text-content transition-colors group-hover:text-brand md:text-4xl">
            {post.title}
          </h2>

          <p className="mb-6 text-lg leading-relaxed text-muted">
            {post.excerpt}
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags?.map((t) => (
              <span key={t} className="rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                {t}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 text-cyan-400 font-semibold group-hover:gap-4 transition-all">
            Leer más <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
          </div>
        </div>
      </div>
    </article>
  );
}

function PostCard({ post }) {
  const navigate = useNavigate();
  return (
    <article
      onClick={() => navigate(`/blog/${post.slug}`)}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-line/15 bg-surface/90 shadow-[0_16px_42px_rgba(15,23,42,0.12)] backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:border-brand/40 hover:shadow-cyan-500/20"
    >
      {/* cover con overlay gradient */}
      <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl bg-surface-2">
        <img
          src={post.cover}
          alt={post.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = fallbackImg;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* body */}
      <div className="flex flex-col flex-1 p-6">
        <div className="mb-3 flex items-center gap-3 text-sm font-semibold text-muted">
          <span className="flex items-center gap-1">
            <FaCalendar className="text-cyan-400" /> {post.date}
          </span>
          <span className="flex items-center gap-1">
            <FaClock className="text-cyan-400" /> {post.readTime}
          </span>
        </div>

        <h3 className="mb-3 line-clamp-2 text-xl font-black text-content transition-colors group-hover:text-brand">
          {post.title}
        </h3>

        <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-muted">
          {post.excerpt}
        </p>

        {/* Chips y botón */}
        <div className="mt-auto">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags?.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
          
          <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold group-hover:gap-3 transition-all">
            Leer artículo <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Blog() {
  const [searchTerm, setSearchTerm]   = useState("");
  const [selectedTag, setSelectedTag] = useState(null);
  const [posts, setPosts]             = useState(POSTS_FALLBACK);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    fetch(`${API_URL}api/blog/`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPosts(data.map(normalizar));
        }
      })
      .catch(() => {/* mantiene POSTS_FALLBACK */})
      .finally(() => setLoading(false));
  }, []);

  const allTags = [...new Set(posts.flatMap((p) => p.tags))];

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || post.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const featuredPost = filteredPosts.find((p) => p.featured);
  const regularPosts = filteredPosts.filter((p) => !p.featured);

  return (
    <main className="min-h-screen bg-transparent pb-20 pt-20 text-content md:pt-24">
      <Header />
      
      <section className="max-w-7xl mx-auto px-6">
        {/* Header del blog con animación */}
        <header className="mb-12 text-center">
          <div className="inline-block mb-4">
            <span className="rounded-full border border-brand/30 bg-brand/10 px-4 py-2 text-sm font-black text-brand">
              📚 Centro de Conocimiento
            </span>
          </div>
          <h1
            className="mb-4 bg-clip-text text-4xl font-black leading-tight tracking-tight text-transparent md:text-5xl"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgb(var(--th-content)), rgb(var(--th-brand)), rgb(var(--th-brand-2)))",
            }}
          >
            Blog Econfia
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-muted">
            Ideas, guías y novedades sobre verificación, cumplimiento normativo y debida diligencia
          </p>
        </header>

        {/* Barra de búsqueda y filtros */}
        <div className="mb-10 space-y-6">
          {/* Búsqueda */}
          <div className="relative max-w-2xl mx-auto">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 transform text-muted" />
            <input
              type="text"
              placeholder="Buscar artículos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-line/15 bg-surface/90 py-4 pl-12 pr-4 text-content placeholder:text-muted/70 backdrop-blur-sm transition-all focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>

          {/* Filtros por tags */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <FaTags className="text-cyan-400" />
            <Tag 
              onClick={() => setSelectedTag(null)} 
              active={!selectedTag}
            >
              Todos
            </Tag>
            {allTags.map(tag => (
              <Tag 
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                active={tag === selectedTag}
              >
                {tag}
              </Tag>
            ))}
          </div>
        </div>

        {/* Indicador de carga */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Post destacado */}
        {!loading && featuredPost && (
          <div className="mb-12">
            <FeaturedPost post={featuredPost} />
          </div>
        )}

        {/* Grid de posts regulares */}
        {!loading && regularPosts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-lg text-muted">No se encontraron artículos con esos filtros</p>
          </div>
        )}

        {/* Newsletter CTA */}
        <div className="mt-16 rounded-3xl border border-brand/25 bg-surface/90 p-8 text-center shadow-[0_22px_65px_rgba(15,23,42,0.16)] backdrop-blur-xl md:p-12">
          <h3 className="mb-4 text-3xl font-black text-content">
            ¿Quieres recibir nuestras últimas publicaciones?
          </h3>
          <p className="mx-auto mb-6 max-w-2xl text-muted">
            Suscríbete a nuestro newsletter y recibe contenido exclusivo sobre compliance, 
            verificación y las últimas tendencias en debida diligencia.
          </p>
          <Link
            to="/contacto"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-4 font-black text-white shadow-lg shadow-cyan-500/30 transition hover:scale-105"
          >
            Suscribirse ahora
            <FaArrowRight />
          </Link>
        </div>
      </section>
    </main>
  );
}
