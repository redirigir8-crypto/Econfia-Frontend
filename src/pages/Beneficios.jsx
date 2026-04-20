// Beneficios.jsx — Sección pública: Reportes y Beneficios diferenciales
import React from "react";
import Header from "../components/Header";
import {
  ShieldCheck,
  Zap,
  BarChart3,
  FileSpreadsheet,
  Building2,
  CreditCard,
  BadgeCheck,
  FileText,
  Globe2,
  Sparkles,
  Activity,
  ScanSearch,
  Lock,
  RefreshCw,
  Puzzle,
  Users,
  MousePointerClick,
  Scale,
  Network,
  Layers,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   Estilos premium — inyectados una sola vez
───────────────────────────────────────────────────────────── */
const STYLE_ID = "econfia-premium-styles";
const premiumStyles = `
  @keyframes floatY {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-8px); }
  }
  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 0   rgba(34,211,238,0.0); }
    50%      { box-shadow: 0 0 40px rgba(34,211,238,0.18); }
  }
  .glass-panel {
    background: rgba(15,23,42,0.55);
    backdrop-filter: blur(18px);
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 20px 80px rgba(2,8,23,0.45);
  }
  .premium-card {
    position: relative;
    overflow: hidden;
    border-radius: 1.5rem;
    background: linear-gradient(180deg, rgba(15,23,42,0.82) 0%, rgba(2,6,23,0.88) 100%);
    border: 1px solid rgba(148,163,184,0.12);
    transition: transform .35s ease, border-color .35s ease, box-shadow .35s ease;
  }
  .premium-card:hover {
    transform: translateY(-8px);
    border-color: rgba(34,211,238,0.34);
    box-shadow: 0 24px 80px rgba(8,145,178,0.18);
  }
  .premium-card::after {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at top right, rgba(34,211,238,0.14), transparent 35%);
    pointer-events: none;
  }
  .glow-soft { animation: pulseGlow 4s ease-in-out infinite; }
`;

if (typeof document !== "undefined" && !document.getElementById(STYLE_ID)) {
  const tag = document.createElement("style");
  tag.id = STYLE_ID;
  tag.innerHTML = premiumStyles;
  document.head.appendChild(tag);
}

/* ─────────────────────────────────────────────────────────────
   Datos
───────────────────────────────────────────────────────────── */
const reportes = [
  {
    icon: FileText,
    color: "cyan",
    badge: "PDF",
    title: "Informe de consultas",
    desc: "Exporta una o varias consultas completadas en un PDF ejecutivo con portada, score SARLAFT, detalle de fuentes consultadas y evidencia estructurada. Listo para auditoría o presentación a terceros.",
    tags: ["Score SARLAFT", "Detalle por fuente", "Multi-consulta", "Logo corporativo"],
  },
  {
    icon: FileSpreadsheet,
    color: "emerald",
    badge: "Excel",
    title: "Exportación Excel (.xlsx)",
    desc: "Descarga tus resultados en formato Excel para análisis interno, cruces de datos o integración con herramientas de BI. Ideal para equipos operativos y analíticos.",
    tags: ["Filtros aplicados", "Datos tabulados", "Compatible BI", "Múltiples consultas"],
  },
  {
    icon: BadgeCheck,
    color: "purple",
    badge: "Verificable",
    title: "Reporte verificable con QR",
    desc: "Cada consulta genera una URL pública firmada con score de riesgo SARLAFT, dots de calificación y trazabilidad completa. Escanea el QR del PDF para validar el resultado de forma externa e independiente.",
    tags: ["URL firmada", "QR en PDF", "Score visible", "Sin login requerido"],
  },
  {
    icon: Building2,
    color: "blue",
    badge: "PDF",
    title: "Informe de empresa (RUES)",
    desc: "Genera un PDF profesional con los datos de la empresa consultada desde el RUES: razón social, NIT, estado, representantes y más. Formato ejecutivo A4.",
    tags: ["Datos RUES", "Representantes", "Estado legal", "Formato A4"],
  },
  {
    icon: BarChart3,
    color: "amber",
    badge: "PDF",
    title: "Informe de perfil de usuario",
    desc: "Descarga un resumen completo de tu actividad: consultas disponibles, consumidas, planes activos, historial de recargas y estadísticas por estado — todo en un PDF personalizado.",
    tags: ["Estadísticas", "Historial recargas", "Planes activos", "Por usuario"],
  },
  {
    icon: Layers,
    color: "teal",
    badge: "3 formatos",
    title: "Tipos de reporte PDF",
    desc: "Elige el nivel de detalle que necesitas: desde un resumen ejecutivo por persona hasta un informe consolidado con capturas de pantalla de cada fuente consultada.",
    tags: ["Individual", "Resumen", "Consolidado con capturas"],
    isMultiFormat: true,
    formats: [
      {
        label: "PDF Individual",
        sub: "Un PDF por persona con score SARLAFT, fuentes y resultado por consulta. Ideal para validaciones puntuales.",
        icon: "1",
        color: "cyan",
      },
      {
        label: "PDF Resumen",
        sub: "Sin capturas de pantalla. Compila múltiples consultas en un solo documento ejecutivo, ligero y de rápida lectura.",
        icon: "2",
        color: "emerald",
      },
      {
        label: "PDF Consolidado",
        sub: "Completo con capturas. Incluye evidencia visual de cada fuente consultada, ideal para auditorías y cumplimiento regulatorio.",
        icon: "3",
        color: "purple",
      },
    ],
  },
];

const colorMap = {
  cyan:    { ring: "ring-cyan-400/20",    bg: "bg-cyan-400/10",    text: "text-cyan-300",    border: "border-cyan-400/20",    badgeText: "text-cyan-300"    },
  emerald: { ring: "ring-emerald-400/20", bg: "bg-emerald-400/10", text: "text-emerald-300", border: "border-emerald-400/20", badgeText: "text-emerald-300" },
  purple:  { ring: "ring-purple-400/20",  bg: "bg-purple-400/10",  text: "text-purple-300",  border: "border-purple-400/20",  badgeText: "text-purple-300"  },
  blue:    { ring: "ring-blue-400/20",    bg: "bg-blue-400/10",    text: "text-blue-300",    border: "border-blue-400/20",    badgeText: "text-blue-300"    },
  amber:   { ring: "ring-amber-400/20",   bg: "bg-amber-400/10",   text: "text-amber-300",   border: "border-amber-400/20",   badgeText: "text-amber-300"   },
  pink:    { ring: "ring-pink-400/20",    bg: "bg-pink-400/10",    text: "text-pink-300",    border: "border-pink-400/20",    badgeText: "text-pink-300"    },
  yellow:  { ring: "ring-yellow-400/20",  bg: "bg-yellow-400/10",  text: "text-yellow-300",  border: "border-yellow-400/20",  badgeText: "text-yellow-300"  },
  orange:  { ring: "ring-orange-400/20",  bg: "bg-orange-400/10",  text: "text-orange-300",  border: "border-orange-400/20",  badgeText: "text-orange-300"  },
  teal:    { ring: "ring-teal-400/20",    bg: "bg-teal-400/10",    text: "text-teal-300",    border: "border-teal-400/20",    badgeText: "text-teal-300"    },
};

const formatColorText = {
  cyan:    "text-cyan-300",
  emerald: "text-emerald-300",
  purple:  "text-purple-300",
};
const formatColorBg = {
  cyan:    "bg-cyan-400/15 border-cyan-400/20",
  emerald: "bg-emerald-400/15 border-emerald-400/20",
  purple:  "bg-purple-400/15 border-purple-400/20",
};

const beneficios = [
  { icon: Globe2,            color: "cyan",    title: "Cobertura integral",        text: "Consulta listas restrictivas, bases públicas y privadas nacionales e internacionales en un solo proceso." },
  { icon: Zap,               color: "yellow",  title: "Velocidad y automatización", text: "Procesos automáticos en tiempo real que reducen tiempos de espera y eliminan errores manuales." },
  { icon: MousePointerClick, color: "blue",    title: "Interfaz amigable",          text: "Plataforma intuitiva y flexible: consultas individuales, masivas y a la medida desde un solo panel." },
  { icon: Scale,             color: "emerald", title: "Cumplimiento normativo",     text: "Alineado con SARLAFT, SAGRILAFT y protección de datos colombiana. Minimiza riesgos legales." },
  { icon: Lock,              color: "purple",  title: "Seguridad y confidencialidad", text: "Controles de acceso robustos y manejo seguro de datos personales en cada consulta." },
  { icon: Users,             color: "pink",    title: "Soporte y personalización",  text: "Atención al cliente, acompañamiento técnico y adaptación a requerimientos específicos de cada empresa." },
  { icon: Puzzle,            color: "orange",  title: "Integración sencilla",       text: "API y herramientas que facilitan la conexión con sistemas internos de empresas y entidades." },
  { icon: RefreshCw,         color: "teal",    title: "Actualización constante",    text: "Fuentes y algoritmos actualizados continuamente para garantizar información siempre relevante y confiable." },
];

const benColorGlow = {
  cyan:    "rgba(34,211,238,0.12)",
  yellow:  "rgba(250,204,21,0.12)",
  blue:    "rgba(96,165,250,0.12)",
  emerald: "rgba(52,211,153,0.12)",
  purple:  "rgba(167,139,250,0.12)",
  pink:    "rgba(244,114,182,0.12)",
  orange:  "rgba(251,146,60,0.12)",
  teal:    "rgba(45,212,191,0.12)",
};

/* ─────────────────────────────────────────────────────────────
   Componente principal
───────────────────────────────────────────────────────────── */
export default function Beneficios() {
  return (
    <div className="min-h-screen text-white">
      <Header />

      <main className="relative overflow-hidden pt-24">
        {/* Fondos decorativos */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.10),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.10),transparent_40%)]" />

        {/* ── BENEFICIOS DIFERENCIALES ── */}
        <section className="relative py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            {/* Encabezado */}
            <div className="mx-auto max-w-3xl text-center mb-14">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300/90">
                Ventajas competitivas
              </p>
              <h2 className="mt-3 text-3xl font-bold text-white md:text-5xl">
                ¿Por qué elegir ECONFIA?
              </h2>
              <p className="mt-5 text-base leading-7 text-slate-300 md:text-lg">
                Una plataforma diseñada para la excelencia operativa, el cumplimiento normativo
                y una experiencia de usuario que genera confianza desde el primer clic.
              </p>
            </div>

            {/* Grid de beneficios */}
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {beneficios.map(({ icon: Icon, color, title, text }) => {
                const c = colorMap[color];
                return (
                  <div key={title} className="premium-card p-6 flex flex-col gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${c.bg} ${c.text} ring-1 ${c.ring}`}
                      style={{ boxShadow: `0 0 28px ${benColorGlow[color]}` }}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Franja UX + Integridad */}
            <div className="mt-10 glass-panel rounded-[2rem] p-8 md:p-10">
              <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300/90">
                    Experiencia e integridad
                  </p>
                  <h3 className="mt-3 text-2xl font-bold text-white md:text-3xl">
                    Una plataforma que se siente tan sólida como los resultados que entrega
                  </h3>
                  <p className="mt-4 text-base leading-7 text-slate-300">
                    ECONFIA no solo verifica — también comunica. Cada pantalla, cada reporte
                    y cada resultado está diseñado para transmitir profesionalismo, claridad
                    y confianza a tus clientes, equipos y aliados corporativos.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: MousePointerClick, label: "UX ejecutiva",        desc: "Navegación limpia y fluida pensada para equipos de cumplimiento." },
                    { icon: ShieldCheck,       label: "Datos íntegros",       desc: "Cada consulta con trazabilidad, evidencia y estructura auditable." },
                    { icon: Network,           label: "Ecosistema unificado", desc: "Consultas, reportes y gestión desde un solo punto de acceso." },
                    { icon: BadgeCheck,        label: "Confianza verificable", desc: "Reportes PDF con QR y hash verificable para validación externa." },
                  ].map(({ icon: Icon, label, desc }) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 hover:border-cyan-400/25 hover:bg-cyan-400/[0.06] transition-all duration-300"
                    >
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/20">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-semibold text-white">{label}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-400">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ── REPORTES ── */}
        <section className="relative py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            {/* Encabezado */}
            <div className="mx-auto max-w-3xl text-center mb-14">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300/90">
                Reportería profesional
              </p>
              <h2 className="mt-3 text-3xl font-bold text-white md:text-5xl">
                Todos los reportes que maneja Econfia 
              </h2>
              <p className="mt-5 text-base leading-7 text-slate-300 md:text-lg">
                ECONFIA genera documentos ejecutivos, auditables y verificables para cada caso de uso —
                desde una consulta individual hasta informes masivos para cumplimiento corporativo.
              </p>
            </div>

            {/* Grid de tarjetas */}
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {reportes.map(({ icon: Icon, color, badge, title, desc, tags, isMultiFormat, formats }) => {
                const c = colorMap[color];
                if (isMultiFormat) {
                  return (
                    <div key={title} className="premium-card p-7 flex flex-col gap-5 md:col-span-2 xl:col-span-3">
                      <div className="flex items-start justify-between">
                        <div
                          className={`flex items-center justify-center rounded-2xl ${c.bg} ${c.text} ring-1 ${c.ring}`}
                          style={{ height: 52, width: 52 }}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <span
                          className={`rounded-full border ${c.border} ${c.bg} px-3 py-1 text-[11px] font-semibold ${c.badgeText} uppercase tracking-wide`}
                        >
                          {badge}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-400">{desc}</p>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-3 mt-1">
                        {formats.map((f) => (
                          <div
                            key={f.label}
                            className={`rounded-2xl border p-4 flex flex-col gap-2 ${formatColorBg[f.color]}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-white/10 ${formatColorText[f.color]}`}>
                                {f.icon}
                              </span>
                              <p className={`text-sm font-semibold ${formatColorText[f.color]}`}>{f.label}</p>
                            </div>
                            <p className="text-xs leading-5 text-slate-400">{f.sub}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-slate-300"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={title} className="premium-card p-7 flex flex-col gap-5">
                    <div className="flex items-start justify-between">
                      <div
                        className={`flex items-center justify-center rounded-2xl ${c.bg} ${c.text} ring-1 ${c.ring}`}
                        style={{ height: 52, width: 52 }}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <span
                        className={`rounded-full border ${c.border} ${c.bg} px-3 py-1 text-[11px] font-semibold ${c.badgeText} uppercase tracking-wide`}
                      >
                        {badge}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{desc}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-slate-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Franja resumen de formatos */}
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { label: "PDF ejecutivo",   sub: "Portada, score y evidencia",       color: "text-cyan-300",    ring: "ring-cyan-400/20"    },
                { label: "Excel .xlsx",     sub: "Datos tabulados para análisis BI", color: "text-emerald-300", ring: "ring-emerald-400/20" },
                { label: "QR verificable",  sub: "URL pública firmada sin login",    color: "text-purple-300",  ring: "ring-purple-400/20"  },
                { label: "Formato A4 · A5", sub: "Horizontal y vertical según tipo", color: "text-amber-300",   ring: "ring-amber-400/20"   },
              ].map(({ label, sub, color, ring }) => (
                <div
                  key={label}
                  className={`rounded-2xl border border-white/10 bg-white/[0.04] p-5 ring-1 ${ring} text-center hover:border-cyan-400/25 transition-all duration-300`}
                >
                  <p className={`text-base font-bold ${color}`}>{label}</p>
                  <p className="mt-1 text-xs text-slate-400">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="relative py-16">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="premium-card rounded-[2rem] p-8 md:p-12 text-center">
              <h2 className="text-2xl font-bold text-white md:text-4xl">
                Listo para verificar con confianza
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-300 md:text-lg max-w-xl mx-auto">
                Empieza a consultar, analizar y generar reportes ejecutivos hoy mismo.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row justify-center">
                <a
                  href="/consulta"
                  className="rounded-full bg-cyan-500 px-8 py-4 text-base font-semibold text-slate-950 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-400 hover:shadow-[0_12px_40px_rgba(34,211,238,0.25)]"
                >
                  Iniciar consulta
                </a>
                <a
                  href="/precios"
                  className="rounded-full border border-white/15 bg-white/5 px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-white/10"
                >
                  Ver planes
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
