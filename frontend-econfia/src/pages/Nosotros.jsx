// src/pages/Nosotros.jsx
import { useEffect, useRef, useState } from "react";
import Header from "../components/Header"
/* ------- UI helpers ------- */
const Chip = ({ children }) => (
  <span className="text-xs px-3 py-1 rounded-full border border-white/10 bg-white/5">
    {children}
  </span>
);

const Stat = ({ n, l }) => (
  <div className="rounded-2xl p-6 border border-white/10 bg-white/[0.04]">
    <div className="text-3xl font-bold text-cyan-400">{n}</div>
    <div className="text-white/70">{l}</div>
  </div>
);

function Valor({ titulo, resumen, detalle }) {
  const [open, setOpen] = useState(false);
  return (
    <>
    
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-start justify-between gap-4">
        <h4 className="text-lg font-semibold text-white">{titulo}</h4>
        <button
          onClick={() => setOpen(!open)}
          className="text-xs px-3 py-1 rounded-full border border-white/10 hover:border-cyan-400 hover:text-cyan-300"
        >
          {open ? "Ver menos" : "Ver más"}
        </button>
      </div>
      <p className="text-white/75 mt-2">{open ? detalle : resumen}</p>
    </div>
    </>
  );
}

/* ------- Página con carrusel horizontal ------- */
export default function Nosotros() {
  const scrollerRef = useRef(null);
  const [page, setPage] = useState(0); // 0..2

  // Convierte el scroll vertical del mouse/trackpad en desplazamiento horizontal
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      // Si el gesto es mayormente vertical, lo usamos para mover horizontal
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollBy({ left: e.deltaY, behavior: "smooth" });
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Actualiza page al hacer scroll (para dots/flechas)
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const handler = () => {
      const w = el.clientWidth;
      const p = Math.round(el.scrollLeft / w);
      setPage(p);
    };
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, []);

  const go = (idx) => {
    const el = scrollerRef.current;
    if (!el) return;
    const w = el.clientWidth;
    el.scrollTo({ left: w * idx, behavior: "smooth" });
  };

  const next = () => go(Math.min(page + 1, 2));
  const prev = () => go(Math.max(page - 1, 0));

  return (
    <main className="min-h-[calc(100vh-64px)] pt-16 text-white overflow-hidden">
      <Header />
      {/* Contenedor horizontal a pantalla (menos header): sin overflow-y */}
      <section
        ref={scrollerRef}
        className="
          h-[calc(100vh-64px)]
          snap-x snap-mandatory
          overflow-x-auto overflow-y-hidden
          flex
          scroll-smooth
        "
      >
        {/* ===== Slide 1: Hero + Servicios ===== */}
        <div className="snap-start shrink-0 w-full h-full overflow-y-auto">
          <div className="mx-auto max-w-[1200px] px-6 py-6 md:py-8">
            <header className="grid place-items-start gap-3">
              <h1
                className="text-[clamp(2rem,3.5vw,3.2rem)] font-extrabold leading-tight tracking-tight"
                style={{ fontFamily: "poppins, sans-serif" }}
              >
                Sobre <span className="text-cyan-400">eConfia</span>
              </h1>
              <p className="text-white/80 max-w-3xl text-[0.98rem] text-justify">
                eConfia es una plataforma de verificación y listas restrictivas que
                automatiza consultas en fuentes nacionales e internacionales para
                reducir riesgo operativo y de cumplimiento. Cumple normativa, guarda
                evidencia y genera reportes claros para decisiones ágiles.
              </p>
            </header>

            <section className="mt-6">
              <h2 className="text-2xl md:text-3xl font-bold">Servicios</h2>
              <p className="text-white/80 max-w-3xl mt-3 text-justify">
                Ofrecemos servicios de calidad para complementar tus procesos y{" "}
                <span className="text-white">prevenir proactivamente irregularidades</span>{" "}
                que afecten la imagen de tu empresa. Contamos con un equipo
                multidisciplinario y metodologías de cumplimiento para que tomes
                decisiones con confianza.
              </p>

              <div className="max-w-3xl">
                <div className="flex flex-wrap gap-2 mt-4 justify-start items-start content-start">
                  {[
                    "Psicólogos",
                    "Criminalística",
                    "Grafología",
                    "Dactiloscopía",
                    "Ingeniería",
                    "Trabajo Social",
                    "Auditoría integral",
                    "Gestión de riesgos",
                    "Selección",
                    "SGSST",
                    "SARLAFT",
                    "Bienestar",
                  ].map((t) => (
                    <Chip key={t}>{t}</Chip>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* ===== Slide 2: Misión / Visión + Métricas ===== */}
        <div className="snap-start shrink-0 w-full h-full overflow-y-auto">
          <div className="mx-auto max-w-[1200px] px-6 py-6 md:py-8">
            {/* Misión / Visión */}
            <section className="mt-2">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 md:p-5 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
                  <article className="h-full min-h-[220px] rounded-2xl p-5 border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] flex flex-col overflow-hidden">
                    <h3 className="text-xl font-semibold">Misión</h3>
                    <p className="text-white/75 mt-2">
                      Proveer soluciones óptimas mediante información, verificación e
                      investigación para garantizar personal apto, idóneo y honesto. Con
                      altos estándares de confidencialidad y tecnología de última
                      generación, generamos valor de forma efectiva y proactiva.
                    </p>
                  </article>

                  <article className="h-full min-h-[220px] rounded-2xl p-5 border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] flex flex-col overflow-hidden">
                    <h3 className="text-xl font-semibold">Visión</h3>
                    <p className="text-white/75 mt-2">
                      Para 2030, GRUPO SOLUCIONES será referente en asesoría de
                      confiabilidad y selección, con infraestructura sólida, gestión
                      moderna orientada a valor y tecnología de punta.
                    </p>
                  </article>
                </div>
              </div>
            </section>

            {/* Métricas */}
            <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
              <Stat n="150+" l="Fuentes integradas" />
              <Stat n="60s" l="Tiempo promedio por consulta" />
              <Stat n="99.9%" l="Disponibilidad" />
              <Stat n="AES-256" l="Cifrado de datos" />
            </section>
          </div>
        </div>

        {/* ===== Slide 3: Valores ===== */}
        <div className="snap-start shrink-0 w-full h-full overflow-y-auto">
          <div className="mx-auto max-w-[1200px] px-6 py-6 md:py-8">
            <section className="mt-2 pb-6">
              <h2 className="text-2xl md:text-3xl font-bold">Valores corporativos</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                <Valor
                  titulo="Calidad"
                  resumen="Ejecutamos con mejora continua en cada servicio."
                  detalle="Todas nuestras actividades se realizan bajo mejora continua, midiendo, aprendiendo y optimizando procesos para resultados predecibles."
                />
                <Valor
                  titulo="Confidencialidad y control"
                  resumen="Protegemos datos y hallazgos con controles estrictos."
                  detalle="Compromiso total con la confidencialidad: controles de acceso, trazabilidad, manejo seguro de evidencias y cumplimiento de privacidad."
                />
                <Valor
                  titulo="Competitividad"
                  resumen="Calidad y eficiencia a precios competitivos."
                  detalle="Servicios y productos de calidad con eficiencia y eficacia, optimizando costos sin sacrificar el estándar de cumplimiento."
                />
                <Valor
                  titulo="Honestidad"
                  resumen="Actuamos con honradez, equidad y claridad."
                  detalle="Relaciones basadas en dignidad, transparencia y responsabilidad profesional."
                />
                <Valor
                  titulo="Oportunidad"
                  resumen="Agilidad con cumplimiento estricto."
                  detalle="Respondemos rápido y dentro del marco normativo para ajustarnos a las necesidades del cliente y del mercado."
                />
                <Valor
                  titulo="Servicio y satisfacción"
                  resumen="Atención respetuosa orientada a expectativas."
                  detalle="Escuchamos, entendemos y nos alineamos a lo que necesitas. Meta: superar expectativas con soluciones claras."
                />
                <Valor
                  titulo="Transparencia"
                  resumen="Comunicación clara y actualizaciones permanentes."
                  detalle="Informamos avances y hallazgos. Evidencias y enlaces disponibles para auditoría y trazabilidad."
                />
                <Valor
                  titulo="Adaptabilidad"
                  resumen="Formación continua ante el cambio."
                  detalle="Actualizamos procesos, tecnología y habilidades del equipo para mantener y elevar la calidad del servicio."
                />
              </div>
            </section>
          </div>
        </div>
      </section>

      {/* Controles (flechas + dots) */}
      <div className="pointer-events-none fixed bottom-6 left-0 right-0 flex items-center justify-center gap-3">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-black/30 border border-white/15 backdrop-blur px-2 py-1">
          <button
            onClick={prev}
            className="px-3 py-1 text-sm rounded-full hover:bg-white/10"
            disabled={page === 0}
          >
            ◀︎
          </button>
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className={`w-2.5 h-2.5 rounded-full ${
                page === i ? "bg-cyan-400" : "bg-white/40"
              }`}
            />
          ))}
          <button
            onClick={next}
            className="px-3 py-1 text-sm rounded-full hover:bg-white/10"
            disabled={page === 2}
          >
            ▶︎
          </button>
        </div>
      </div>
    </main>
  );
}
