// src/pages/Blog.jsx
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "../components/Header"
import { FaCalendar, FaClock, FaArrowRight, FaSearch, FaFire, FaTags } from "react-icons/fa";
// Imágenes desde src/assets (ajusta los nombres si hace falta)
import cover1 from "../assets/justicia.jpg";
import cover2 from "../assets/justicia2.jpg";
import cover3 from "../assets/justicia3.jpg";
import fallbackImg from "../assets/logo-econfia (1).png"; // placeholder seguro

/* Si luego traes posts del backend, reemplaza este array */
const POSTS = [
  {
    slug: "por-que-automatizar-debida-diligencia",
    title: "¿Por qué automatizar la debida diligencia?",
    date: "15/9/2025",
    readTime: "5 min",
    excerpt:
      "La automatización reduce tiempos, errores humanos y mejora el cumplimiento normativo.",
    cover: cover1,
    tags: ["cumplimiento", "automatización"],
    featured: true,
  },
  {
    slug: "listas-restrictivas-internacionales-101",
    title: "Listas restrictivas internacionales 101",
    date: "9/9/2025",
    readTime: "8 min",
    excerpt:
      "UN, OFAC, UE, bancos multilaterales… cómo interpretarlas y auditarlas.",
    cover: cover2,
    tags: ["listas", "riesgo"],
    featured: false,
  },
  {
    slug: "mejores-practicas-reportes-riesgo",
    title: "Mejores prácticas para reportes de riesgo",
    date: "31/8/2025",
    readTime: "6 min",
    excerpt:
      "Diseño de reportes claros: puntaje, semáforo, evidencia y trazabilidad.",
    cover: cover3,
    tags: ["reportes", "ux"],
    featured: false,
  },
];

const Tag = ({ children, onClick, active }) => (
  <span 
    onClick={onClick}
    className={`text-xs px-4 py-2 rounded-full border cursor-pointer transition-all ${
      active 
        ? 'border-cyan-400 bg-cyan-400/20 text-cyan-300' 
        : 'border-white/20 bg-white/5 hover:border-cyan-400/50 hover:bg-white/10'
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
      className="cursor-pointer rounded-3xl overflow-hidden border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300 transform hover:scale-[1.02] group"
    >
      <div className="grid md:grid-cols-2 gap-0">
        {/* Imagen */}
        <div className="relative h-[300px] md:h-full overflow-hidden">
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            <FaFire /> Destacado
          </div>
          <img
            src={post.cover}
            alt={post.title}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = fallbackImg;
            }}
          />
        </div>

        {/* Contenido */}
        <div className="p-8 flex flex-col justify-center">
          <div className="flex items-center gap-4 text-cyan-300 text-sm mb-4">
            <span className="flex items-center gap-1">
              <FaCalendar /> {post.date}
            </span>
            <span className="flex items-center gap-1">
              <FaClock /> {post.readTime}
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight group-hover:text-cyan-300 transition-colors">
            {post.title}
          </h2>

          <p className="text-white/80 text-lg leading-relaxed mb-6">
            {post.excerpt}
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags?.map((t) => (
              <span key={t} className="text-xs px-3 py-1 rounded-full border border-cyan-400/50 bg-cyan-400/10 text-cyan-300">
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
      className="cursor-pointer rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm shadow-lg hover:border-cyan-300/40 hover:shadow-cyan-500/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.03] flex flex-col h-full group"
    >
      {/* cover con overlay gradient */}
      <div className="aspect-[16/9] w-full overflow-hidden relative">
        <img
          src={post.cover}
          alt={post.title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = fallbackImg;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* body */}
      <div className="flex flex-col flex-1 p-6">
        <div className="flex items-center gap-3 text-white/60 text-sm mb-3">
          <span className="flex items-center gap-1">
            <FaCalendar className="text-cyan-400" /> {post.date}
          </span>
          <span className="flex items-center gap-1">
            <FaClock className="text-cyan-400" /> {post.readTime}
          </span>
        </div>

        <h3 className="text-white font-bold text-xl mb-3 line-clamp-2 group-hover:text-cyan-300 transition-colors">
          {post.title}
        </h3>

        <p className="text-white/70 text-sm leading-relaxed line-clamp-3 mb-4">
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);

  // Obtener todos los tags únicos
  const allTags = [...new Set(POSTS.flatMap(post => post.tags))];

  // Filtrar posts
  const filteredPosts = POSTS.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || post.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const featuredPost = filteredPosts.find(p => p.featured);
  const regularPosts = filteredPosts.filter(p => !p.featured);

  return (
    <main className="min-h-screen pt-20 md:pt-24 pb-20 text-white bg-gradient-to-b from-gray-900 via-blue-900/20 to-gray-900">
      <Header />
      
      <section className="max-w-7xl mx-auto px-6">
        {/* Header del blog con animación */}
        <header className="mb-12 text-center">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-semibold">
              📚 Centro de Conocimiento
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-4 bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent">
            Blog Econfia
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Ideas, guías y novedades sobre verificación, cumplimiento normativo y debida diligencia
          </p>
        </header>

        {/* Barra de búsqueda y filtros */}
        <div className="mb-10 space-y-6">
          {/* Búsqueda */}
          <div className="relative max-w-2xl mx-auto">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Buscar artículos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all backdrop-blur-sm"
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

        {/* Post destacado */}
        {featuredPost && (
          <div className="mb-12">
            <FeaturedPost post={featuredPost} />
          </div>
        )}

        {/* Grid de posts regulares */}
        {regularPosts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-white/60 text-lg">No se encontraron artículos con esos filtros</p>
          </div>
        )}

        {/* Newsletter CTA */}
        <div className="mt-16 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-3xl p-8 md:p-12 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            ¿Quieres recibir nuestras últimas publicaciones?
          </h3>
          <p className="text-white/70 mb-6 max-w-2xl mx-auto">
            Suscríbete a nuestro newsletter y recibe contenido exclusivo sobre compliance, 
            verificación y las últimas tendencias en debida diligencia.
          </p>
          <Link
            to="/contacto"
            className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-500 text-black font-semibold rounded-full hover:bg-cyan-400 transition transform hover:scale-105 shadow-lg shadow-cyan-500/50"
          >
            Suscribirse ahora
            <FaArrowRight />
          </Link>
        </div>
      </section>
    </main>
  );
}
