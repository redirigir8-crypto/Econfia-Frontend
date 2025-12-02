// src/pages/BlogPost.jsx
import { Link, useParams } from "react-router-dom";

// Imágenes desde src/assets (ajusta si tus nombres difieren)
import cover1 from "../assets/justicia.jpg";
import cover2 from "../assets/justicia2.jpg";
import cover3 from "../assets/justicia3.jpg";
import fallbackImg from "../assets/logo-econfia (1).png"; // placeholder

/* Si ya traes el post del backend, deja sólo el find por slug */
const POSTS = [
  {
    slug: "por-que-automatizar-debida-diligencia",
    title: "¿Por qué automatizar la debida diligencia?",
    date: "15/9/2025",
    author: "Equipo eConfia",
    cover: cover1,
    content: [
      "La automatización de debida diligencia reduce tiempos y errores, y estandariza criterios.",
      "Conectando múltiples fuentes en tiempo real, puedes evidenciar cada paso y generar reportes claros para auditoría.",
      "En este artículo repasamos ventajas, consideraciones de implementación y métricas de éxito.",
    ],
  },
  {
    slug: "listas-restrictivas-internacionales-101",
    title: "Listas restrictivas internacionales 101",
    date: "9/9/2025",
    author: "Equipo eConfia",
    cover: cover2,
    content: [
      "Las listas de la ONU, OFAC, Unión Europea y bancos multilaterales tienen particularidades.",
      "Una plataforma centralizada ayuda a interpretar coincidencias, gestionar falsos positivos y auditar decisiones.",
    ],
  },
  {
    slug: "mejores-practicas-reportes-riesgo",
    title: "Mejores prácticas para reportes de riesgo",
    date: "31/8/2025",
    author: "Equipo eConfia",
    cover: cover3,
    content: [
      "Un buen reporte es accionable: puntaje, señalización visual (semáforo), evidencia y trazabilidad.",
      "Define un modelo de datos consistente y evita PDFs ‘cerrados’ cuando necesites analítica posterior.",
    ],
  },
];

export default function BlogPost() {
  const { slug } = useParams();
  const post = POSTS.find((p) => p.slug === slug);

  if (!post) {
    return (
      <main className="min-h-[calc(100vh-64px)] pt-[88px] md:pt-[96px] text-white">
        <section className="max-w-[1100px] mx-auto px-6">
          <p className="text-white/80">No encontramos este artículo.</p>
          <Link
            to="/blog"
            className="text-cyan-300 hover:text-cyan-200 underline underline-offset-4"
          >
            ← Volver al blog
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-64px)] pt-[88px] md:pt-[96px] text-white">
      <section className="max-w-[1100px] mx-auto px-6">
        <div className="mb-5">
          <Link
            to="/blog"
            className="text-cyan-300 hover:text-cyan-200 underline underline-offset-4"
          >
            ← Volver al blog
          </Link>
        </div>

        <header className="mb-4">
          <h1
            className="text-[clamp(2rem,3.2vw,3rem)] font-extrabold leading-tight tracking-tight"
            style={{ fontFamily: "poppins, sans-serif" }}
          >
            {post.title}
          </h1>
          <div className="text-white/70 mt-1 text-sm">
            {post.date} • {post.author}
          </div>
        </header>

        {/* Cover con altura más compacta */}
        <figure className="my-6 rounded-3xl overflow-hidden border border-white/10 shadow-3xl bg-white/5">
          <img
            src={post.cover}
            alt={post.title}
            className="w-full h-[160px] md:h-[210px] lg:h-[260px] object-cover object-center"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.src = fallbackImg;
            }}
          />
        </figure>

        {/* Contenido */}
        <article>
          {post.content.map((p, i) => (
            <p
              key={i}
              className="text-white/85 leading-relaxed text-[1.02rem] mb-4"
            >
              {p}
            </p>
          ))}
        </article>

        <footer className="mt-10">
          <Link
            to="/blog"
            className="text-cyan-300 hover:text-cyan-200 underline underline-offset-4"
          >
            ← Volver al blog
          </Link>
        </footer>
      </section>
    </main>
  );
}
