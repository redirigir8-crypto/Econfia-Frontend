// src/pages/BlogPost.jsx
import { Link, useParams, useNavigate } from "react-router-dom";
import { FaCalendar, FaClock, FaUser, FaArrowLeft, FaArrowRight, FaShare } from "react-icons/fa";
import Header from "../components/Header";

// Imágenes desde src/assets
import cover1 from "../assets/justicia.jpg";
import cover2 from "../assets/justicia2.jpg";
import cover3 from "../assets/justicia3.jpg";
import fallbackImg from "../assets/logo-econfia (1).png";

const POSTS = [
  {
    slug: "por-que-automatizar-debida-diligencia",
    title: "¿Por qué automatizar la debida diligencia?",
    date: "15/9/2025",
    readTime: "5 min",
    author: "Equipo Econfia",
    cover: cover1,
    tags: ["cumplimiento", "automatización"],
    content: [
      {
        type: "paragraph",
        text: "La automatización de debida diligencia reduce tiempos y errores, y estandariza criterios."
      },
      {
        type: "paragraph",
        text: "Conectando múltiples fuentes en tiempo real, puedes evidenciar cada paso y generar reportes claros para auditoría."
      },
      {
        type: "heading",
        text: "Beneficios de la Automatización"
      },
      {
        type: "paragraph",
        text: "En este artículo repasamos ventajas, consideraciones de implementación y métricas de éxito."
      },
      {
        type: "list",
        items: [
          "Reducción significativa de tiempos de procesamiento",
          "Eliminación de errores humanos en la captura de datos",
          "Estandarización de criterios de evaluación",
          "Trazabilidad completa del proceso",
          "Generación automática de reportes auditables"
        ]
      }
    ],
  },
  {
    slug: "listas-restrictivas-internacionales-101",
    title: "Listas restrictivas internacionales 101",
    date: "9/9/2025",
    readTime: "8 min",
    author: "Equipo Econfia",
    cover: cover2,
    tags: ["listas", "riesgo"],
    content: [
      {
        type: "paragraph",
        text: "Las listas de la ONU, OFAC, Unión Europea y bancos multilaterales tienen particularidades."
      },
      {
        type: "paragraph",
        text: "Una plataforma centralizada ayuda a interpretar coincidencias, gestionar falsos positivos y auditar decisiones."
      },
      {
        type: "heading",
        text: "Principales Listas Restrictivas"
      },
      {
        type: "list",
        items: [
          "OFAC (Oficina de Control de Activos Extranjeros - USA)",
          "Listas Consolidadas de la ONU",
          "Listas de Sanciones de la Unión Europea",
          "Lista Clinton (PEP)",
          "Interpol - Avisos Rojos"
        ]
      }
    ],
  },
  {
    slug: "mejores-practicas-reportes-riesgo",
    title: "Mejores prácticas para reportes de riesgo",
    date: "31/8/2025",
    readTime: "6 min",
    author: "Equipo Econfia",
    cover: cover3,
    tags: ["reportes", "ux"],
    content: [
      {
        type: "paragraph",
        text: "Un buen reporte es accionable: puntaje, señalización visual (semáforo), evidencia y trazabilidad."
      },
      {
        type: "paragraph",
        text: "Define un modelo de datos consistente y evita PDFs 'cerrados' cuando necesites analítica posterior."
      },
      {
        type: "heading",
        text: "Elementos Clave de un Reporte Efectivo"
      },
      {
        type: "list",
        items: [
          "Sistema de puntuación claro y objetivo",
          "Codificación visual por niveles de riesgo (semáforo)",
          "Evidencia documental respaldatoria",
          "Trazabilidad de fuentes consultadas",
          "Recomendaciones accionables"
        ]
      }
    ],
  },
];

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = POSTS.find((p) => p.slug === slug);
  
  const relatedPosts = POSTS.filter(p => p.slug !== slug).slice(0, 2);

  if (!post) {
    return (
      <main className="min-h-screen pt-24 pb-20 text-white bg-gradient-to-b from-gray-900 via-blue-900/20 to-gray-900">
        <Header />
        <section className="max-w-4xl mx-auto px-6">
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold mb-4">Artículo no encontrado</h1>
            <p className="text-white/70 mb-8">No pudimos encontrar el artículo que buscas.</p>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              <FaArrowLeft /> Volver al blog
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content[0].text,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado al portapapeles');
    }
  };

  return (
    <main className="min-h-screen pt-20 md:pt-24 pb-20 text-white bg-gradient-to-b from-gray-900 via-blue-900/20 to-gray-900">
      <Header />
      
      <article className="max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            <FaArrowLeft /> Volver al blog
          </Link>
        </div>

        <header className="mb-10">
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags?.map((tag) => (
              <span 
                key={tag}
                className="text-xs px-4 py-1.5 rounded-full border border-cyan-400/50 bg-cyan-400/10 text-cyan-300"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6 bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-white/60">
            <div className="flex items-center gap-2">
              <FaUser className="text-cyan-400" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCalendar className="text-cyan-400" />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaClock className="text-cyan-400" />
              <span>{post.readTime} de lectura</span>
            </div>
            <button
              onClick={handleShare}
              className="ml-auto flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <FaShare /> Compartir
            </button>
          </div>
        </header>

        <figure className="mb-12 rounded-3xl overflow-hidden border border-cyan-500/30 shadow-2xl">
          <img
            src={post.cover}
            alt={post.title}
            className="w-full h-[300px] md:h-[400px] lg:h-[500px] object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = fallbackImg;
            }}
          />
        </figure>

        <div className="prose prose-lg prose-invert max-w-none">
          {post.content.map((block, i) => {
            switch (block.type) {
              case 'heading':
                return (
                  <h2 key={i} className="text-3xl font-bold text-white mt-12 mb-6">
                    {block.text}
                  </h2>
                );
              case 'paragraph':
                return (
                  <p key={i} className="text-white/80 text-lg leading-relaxed mb-6">
                    {block.text}
                  </p>
                );
              case 'list':
                return (
                  <ul key={i} className="space-y-3 mb-8 ml-6">
                    {block.items.map((item, j) => (
                      <li key={j} className="text-white/80 text-lg flex items-start gap-3">
                        <span className="text-cyan-400 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                );
              default:
                return null;
            }
          })}
        </div>

        <div className="mt-16 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-3xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            ¿Listo para optimizar tus procesos de verificación?
          </h3>
          <p className="text-white/70 mb-6">
            Descubre cómo Econfia puede ayudarte a automatizar tu debida diligencia
          </p>
          <Link
            to="/servicio-econfia"
            className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 text-black font-semibold rounded-full hover:bg-cyan-400 transition transform hover:scale-105"
          >
            Conocer más
            <FaArrowRight />
          </Link>
        </div>

        {relatedPosts.length > 0 && (
          <div className="mt-20">
            <h3 className="text-2xl font-bold text-white mb-8">Artículos relacionados</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {relatedPosts.map(relatedPost => (
                <div
                  key={relatedPost.slug}
                  onClick={() => navigate(`/blog/${relatedPost.slug}`)}
                  className="cursor-pointer rounded-2xl overflow-hidden border border-white/10 bg-white/5 hover:border-cyan-300/40 hover:shadow-cyan-500/20 hover:shadow-xl transition-all group"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={relatedPost.cover}
                      alt={relatedPost.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = fallbackImg;
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                      {relatedPost.title}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <span className="flex items-center gap-1">
                        <FaCalendar className="text-cyan-400" /> {relatedPost.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaClock className="text-cyan-400" /> {relatedPost.readTime}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </article>
    </main>
  );
}
