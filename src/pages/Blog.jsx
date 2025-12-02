// src/pages/Blog.jsx
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header"
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
    excerpt:
      "La automatización reduce tiempos, errores humanos y mejora el cumplimiento normativo.",
    cover: cover1, // 👈 usando import
    tags: ["cumplimiento", "automatización"],
  },
  {
    slug: "listas-restrictivas-internacionales-101",
    title: "Listas restrictivas internacionales 101",
    date: "9/9/2025",
    excerpt:
      "UN, OFAC, UE, bancos multilaterales… cómo interpretarlas y auditarlas.",
    cover: cover2,
    tags: ["listas", "riesgo"],
  },
  {
    slug: "mejores-practicas-reportes-riesgo",
    title: "Mejores prácticas para reportes de riesgo",
    date: "31/8/2025",
    excerpt:
      "Diseño de reportes claros: puntaje, semáforo, evidencia y trazabilidad.",
    cover: cover3,
    tags: ["reportes", "ux"],
  },
];

const Tag = ({ children }) => (
  <span className="text-xs px-3 py-1 rounded-full border border-white/10 bg-white/5">
    {children}
  </span>
);

function PostCard({ post }) {
  const navigate = useNavigate();
  return (
    <article
      onClick={() => navigate(`/blog/${post.slug}`)}
      className={[
        "cursor-pointer rounded-2xl overflow-hidden",
        "border border-white/10 bg-white/5 shadow-3xl",
        "hover:border-cyan-300/40 hover:shadow-[0_0_28px_rgba(34,211,238,0.22)]",
        "transition",
        "flex flex-col h-full",     // alturas iguales
        "min-h-[520px]",           // ajusta si quieres cards más altas/bajas
      ].join(" ")}
    >
      {/* cover */}
      <div className="aspect-[16/9] w-full overflow-hidden">
        <img
          src={post.cover}
          alt={post.title}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.src = fallbackImg;
          }}
        />
      </div>

      {/* body */}
      <div className="flex flex-col flex-1 p-5">
        <div className="text-white/70 text-sm">{post.date}</div>

        {/* Limitar líneas para que todas alineen (requiere @tailwindcss/line-clamp) */}
        <h3 className="mt-1 text-white font-semibold text-[clamp(1rem,1.4vw,1.15rem)] line-clamp-2">
          {post.title}
        </h3>

        <p className="text-white/80 mt-2 text-[0.95rem] leading-relaxed line-clamp-3">
          {post.excerpt}
        </p>

        {/* Chips al fondo */}
        <div className="mt-auto pt-4 flex flex-wrap gap-2">
          {post.tags?.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function Blog() {
  return (
    <main className="min-h-[calc(100vh-64px)] pt-[88px] md:pt-[96px] text-white">
      <Header />
      <section className="max-w-[1200px] mx-auto px-6">
        <header className="mb-6">
          <h1
            className="text-[clamp(2rem,3.5vw,3rem)] font-extrabold leading-tight tracking-tight"
            style={{ fontFamily: "poppins, sans-serif" }}
          >
            Blog
          </h1>
          <p className="text-white/80">
            Ideas, guías y novedades sobre verificación y cumplimiento.
          </p>
        </header>

        {/* items-stretch + h-full en cards = mismas alturas por fila */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {POSTS.map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
        </div>

        <div className="mt-8">
          <Link
            to="/"
            className="text-cyan-300 hover:text-cyan-200 underline underline-offset-4"
          >
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
