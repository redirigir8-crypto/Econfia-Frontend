// App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import ParticlesBackground from "./components/ParticlesBackground";
import "react-horizontal-scrolling-menu/dist/styles.css";
import React from "react";
import { ConfigProvider } from "antd";
import { antdTheme } from "./theme/antdTheme";
import "./theme/global.css";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import Pricing from "./pages/Pricing";
import Consulta from "./views/Consulta";
import ConsultaContratista from "./views/ConsultaContratista";
import ConsultaMedida from "./views/ConsultaMedida";
import ConsultaBasicElemnt from "./views/ConsultaBasicElemnt";
import ConsultaEIdentidad from "./views/ConsultaEIdentidad";
import Resultados from "./views/Resultados";
import LogOut from "./views/LogOut";
import Ayuda from "./views/Ayuda";
import Profile from "./views/Profile";
import { CardProvider } from "./context/CardContext";
import Register from "./pages/Register";
import Nosotros from "./pages/Nosotros";
import Contacto from "./pages/Contacto";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ServicioEconfia from "./pages/ServicioEconfia";
import ServicioContratista from "./pages/ServicioContratista";
import ServicioSeguridad from "./pages/ServicioSeguridad";
import ServicioTitulos from "./pages/ServicioTitulos";
import TitulosValidationForm from "./views/TitulosValidationForm";
import AdminPanel from "./pages/AdminPanel";
import AdminUsuarios from "./components/AdminUsuarios";
import AdminPlanes from "./components/AdminPlanes";
import AdminFuentes from "./components/AdminFuentes";
import EmpresaRuesResult from "./components/EmpresaRuesResult";
import ConsultaEmpresa from "./views/ConsultaEmpresa";
import ConsultaFask from "./views/ConsultaFask";
import ConsultaEssencialExpress from "./views/ConsultaEssencialExpress";
import ConsultaExperian from "./views/ConsultaExperian";
import VerificarReporte from "./pages/VerificarReporte";
import Beneficios from "./pages/Beneficios";
import ChatbotFlotante from "./components/ChatbotFlotante";
import AdminSoporte from "./views/AdminSoporte";
import AdminBlog from "./components/AdminBlog";
import {
  ShieldCheck,
  Zap,
  FileSpreadsheet,
  Search,
  Briefcase,
  Building2,
  CreditCard,
  BadgeCheck,
  GraduationCap,
  Sparkles,
  ScanSearch,
} from "lucide-react";
import networkGif from "./assets/GIF by São Paulo City.gif";

/* ─────────────────────────────────────────────────────────────
   Estilos premium inyectados una sola vez
───────────────────────────────────────────────────────────── */
const premiumStyles = `
  @keyframes floatY {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-8px); }
  }
  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 0   rgba(34,211,238,0.0); }
    50%      { box-shadow: 0 0 40px rgba(34,211,238,0.18); }
  }
  @keyframes gridMove {
    0%   { transform: translateY(0);   }
    100% { transform: translateY(40px); }
  }

  /* Grid animado detrás del hero */
  .hero-grid::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: radial-gradient(circle at center, black 35%, transparent 85%);
    animation: gridMove 7s linear infinite alternate;
    pointer-events: none;
  }

  /* Panel de vidrio */
  .glass-panel {
    background: rgba(15,23,42,0.55);
    backdrop-filter: blur(18px);
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 20px 80px rgba(2,8,23,0.45);
  }

  /* Tarjeta premium */
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

  /* Métrica pequeña */
  .metric-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    backdrop-filter: blur(12px);
    transition: all .3s ease;
  }
  .metric-card:hover {
    background: rgba(34,211,238,0.08);
    border-color: rgba(34,211,238,0.28);
    transform: translateY(-4px);
  }

  .floating-soft { animation: floatY    5s ease-in-out infinite; }
  .glow-soft     { animation: pulseGlow 4s ease-in-out infinite; }
`;

if (typeof document !== "undefined" && !document.getElementById("econfia-premium-styles")) {
  const tag = document.createElement("style");
  tag.id = "econfia-premium-styles";
  tag.innerHTML = premiumStyles;
  document.head.appendChild(tag);
}

/* ─────────────────────────────────────────────────────────────
   Micro-componentes reutilizables
───────────────────────────────────────────────────────────── */
function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200">
      <span className="h-2 w-2 rounded-full bg-cyan-400 glow-soft" />
      {children}
    </span>
  );
}

function SectionTitle({ eyebrow, title, description, center = false }) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow && (
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300/90">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-bold leading-tight text-white md:text-5xl">{title}</h2>
      {description && (
        <p className="mt-4 text-base leading-7 text-slate-300 md:text-lg">{description}</p>
      )}
    </div>
  );
}

/* Tarjeta de GIF con overlay */
function HeroVisualCard({ src, title, subtitle, className = "" }) {
  return (
    <div className={`premium-card ${className}`}>
      <div className="relative h-full min-h-[220px] overflow-hidden">
        <img src={src} alt={title} className="h-full w-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
          <p className="text-lg font-semibold text-white md:text-xl">{title}</p>
          <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

/* Tarjeta: niveles de riesgo SARLAFT */
function RiskScoreCard({ className = "" }) {
  const levels = [
    { label: "Bajo",    color: "#22c55e", pct: 25  },
    { label: "Medio",   color: "#facc15", pct: 50  },
    { label: "Alto",    color: "#f97316", pct: 75  },
    { label: "Extremo", color: "#ef4444", pct: 100 },
  ];
  return (
    <div className={`premium-card p-5 flex flex-col gap-4 ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Score de Riesgo</p>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-300">
          SARLAFT
        </span>
      </div>
      <div className="space-y-2.5">
        {levels.map((r) => (
          <div key={r.label} className="flex items-center gap-2">
            <span className="text-xs text-slate-400 w-14 flex-shrink-0">{r.label}</span>
            <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div
                className="h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${r.pct}%`, background: r.color }}
              />
            </div>
            <span className="text-[10px] text-slate-500 w-6 text-right">{r.pct}</span>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-slate-500">Metodología aplicada en cada consulta</p>
    </div>
  );
}

/* Tarjeta: estado del sistema en tiempo real */
function LiveStatusCard({ className = "" }) {
  const metrics = [
    { label: "Fuentes activas",   val: "200+",    color: "#22d3ee" },
    { label: "Tiempo promedio",   val: "< 5 min", color: "#a78bfa" },
    { label: "Precisión global",  val: "99.9 %",  color: "#34d399" },
    { label: "Disponibilidad",    val: "24 / 7",  color: "#fb923c" },
  ];
  return (
    <div className={`premium-card p-5 flex flex-col gap-4 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
        </span>
        <p className="text-xs font-bold text-green-300 uppercase tracking-wider">Sistema operativo</p>
      </div>
      <div className="space-y-3">
        {metrics.map((m) => (
          <div key={m.label} className="flex justify-between items-center">
            <span className="text-xs text-slate-400">{m.label}</span>
            <span className="text-sm font-bold" style={{ color: m.color }}>{m.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Home — página principal
───────────────────────────────────────────────────────────── */
function Home() {
  const highlights = [
    { value: "200+", label: "Fuentes conectadas" },
    { value: "24/7", label: "Monitoreo continuo" },
    { value: "PDF + Excel", label: "Reportes exportables" },
    { value: "SARLAFT", label: "Scoring metodológico" },
  ];

  const capabilities = [
    {
      icon: ShieldCheck,
      title: "Validación y cumplimiento",
      text: "Consulta antecedentes, listas restrictivas, PEP, sanciones, boletines y validaciones críticas en una sola operación.",
    },
    {
      icon: ScanSearch,
      title: "Investigación inteligente",
      text: "Cruce de información nacional e internacional con respaldo visual, trazabilidad y estructura profesional.",
    },
    {
      icon: FileSpreadsheet,
      title: "Reportes ejecutivos",
      text: "Exporta resultados en PDF y Excel listos para auditoría, análisis interno y procesos de vinculación.",
    },
    {
      icon: Zap,
      title: "Consultas masivas",
      text: "Procesa grandes volúmenes de registros de forma más rápida y ordenada para equipos operativos y analíticos.",
    },
  ];

  const services = [
    { label: "Consulta de antecedentes", href: "/consulta", Icon: Search },
    { label: "Consulta de contratistas", href: "/6c1b9f3d", Icon: Briefcase },
    { label: "Empresas y RUES", href: "/4a7e2b8f", Icon: Building2 },
    { label: "Validación de títulos", href: "/2b7d5e9c", Icon: GraduationCap },
    { label: "Consulta Express", href: "/a1e6c4b8", Icon: Sparkles },
    { label: "Planes y precios", href: "/precios", Icon: CreditCard },
  ];

  const advantages = [
    "Evidencia visual y soporte verificable en cada resultado.",
    "Scoring de riesgo orientado a SARLAFT y SAGRILAFT.",
    "Consultas individuales y masivas desde un mismo ecosistema.",
    "Arquitectura orientada a velocidad, trazabilidad y cumplimiento.",
  ];

  return (
    <div className="min-h-screen text-white">
      <Header />

      <main className="relative overflow-hidden">
        {/* HERO */}
        <section className="hero-grid relative overflow-hidden pt-28 md:pt-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_32%),radial-gradient(circle_at_center,rgba(14,165,233,0.10),transparent_45%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/10 via-slate-950/20 to-slate-950/70" />

          <div className="relative mx-auto grid min-h-[95vh] max-w-7xl grid-cols-1 items-center gap-14 px-4 pb-16 md:px-6 lg:grid-cols-[1.1fr_.9fr]">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200 shadow-[0_0_25px_rgba(34,211,238,0.08)]">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                Plataforma de verificación, riesgo y cumplimiento
              </div>

              <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.02] text-white md:text-6xl xl:text-7xl">
                Inteligencia para
                <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 bg-clip-text text-transparent">
                  {" "}verificar, analizar{" "}
                </span>
                y decidir con confianza.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
                ECONFIA transforma procesos de validación en una experiencia visual,
                sólida y ejecutiva. Centraliza consultas, evidencia, scoring de riesgo
                y reportes profesionales en una sola plataforma.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href="/consulta"
                  className="group rounded-full bg-cyan-500 px-8 py-4 text-center text-base font-semibold text-slate-950 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-400 hover:shadow-[0_12px_40px_rgba(34,211,238,0.25)]"
                >
                  Iniciar consulta
                </a>
                <a
                  href="/precios"
                  className="rounded-full border border-white/15 bg-white/5 px-8 py-4 text-center text-base font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-white/10"
                >
                  Ver planes
                </a>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
                {highlights.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/25 hover:bg-cyan-400/[0.08]"
                  >
                    <p className="text-xl font-bold text-cyan-300 md:text-2xl">{item.value}</p>
                    <p className="mt-1 text-sm text-slate-400">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right */}
            <div className="relative">
              <div className="absolute -left-12 top-8 h-28 w-28 rounded-full bg-cyan-400/20 blur-3xl" />
              <div className="absolute -right-10 bottom-10 h-32 w-32 rounded-full bg-blue-500/20 blur-3xl" />

              <div className="grid grid-cols-2 gap-5">
                <div className="premium-card col-span-2 overflow-hidden">
                  <div className="relative min-h-[320px]">
                    <img
                      src={networkGif}
                      alt="Econfia monitoreo"
                      className="h-full w-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
                      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        Monitoreo activo
                      </div>
                      <h3 className="text-2xl font-bold text-white md:text-3xl">
                        Verificación avanzada en tiempo real
                      </h3>
                      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
                        Integración de múltiples fuentes, evidencia estructurada y resultados
                        listos para análisis operativo, comercial y de cumplimiento.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="premium-card p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
                      Riesgo y scoring
                    </p>
                    <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 text-[10px] text-cyan-300">
                      SARLAFT
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
                    {[
                      { label: "Bajo", width: "28%", color: "bg-emerald-400" },
                      { label: "Medio", width: "55%", color: "bg-yellow-400" },
                      { label: "Alto", width: "76%", color: "bg-orange-400" },
                      { label: "Crítico", width: "95%", color: "bg-red-500" },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                          <span>{item.label}</span>
                          <span>{item.width}</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/10">
                          <div className={`h-2 rounded-full ${item.color}`} style={{ width: item.width }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="mt-4 text-xs leading-5 text-slate-500">
                    Evaluación estructurada para priorización y toma de decisiones.
                  </p>
                </div>

                <div className="premium-card p-5">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    </span>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">
                      Estado de plataforma
                    </p>
                  </div>

                  <div className="mt-5 space-y-3">
                    {[
                      ["Fuentes activas", "200+"],
                      ["Reportes", "PDF / Excel"],
                      ["Consultas masivas", "Disponibles"],
                      ["Disponibilidad", "24/7"],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">{label}</span>
                        <span className="text-sm font-semibold text-white">{value}</span>
                      </div>
                    ))}
                  </div>

                  <p className="mt-4 text-xs leading-5 text-slate-500">
                    Arquitectura pensada para trazabilidad, velocidad y cumplimiento.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CAPABILITIES */}
        <section className="relative py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300/90">
                ¿Por qué ECONFIA?
              </p>
              <h2 className="mt-3 text-3xl font-bold text-white md:text-5xl">
                Un ecosistema de verificación con presencia, claridad y valor corporativo
              </h2>
              <p className="mt-5 text-base leading-7 text-slate-300 md:text-lg">
                Pensado para procesos de vinculación, debida diligencia, análisis de terceros,
                cumplimiento y revisión documental con una estética más ejecutiva y confiable.
              </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {capabilities.map((item) => (
                <div key={item.title} className="premium-card p-6">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/20 shadow-[0_0_30px_rgba(34,211,238,0.10)]">
                    <item.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 leading-7 text-slate-300">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SERVICES + VALUE */}
        <section className="relative py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="glass-panel rounded-[2rem] p-8 md:p-12">
              <div className="grid gap-12 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300/90">
                    Soluciones ECONFIA
                  </p>
                  <h2 className="mt-3 text-3xl font-bold text-white md:text-5xl">
                    Diferentes consultas, una sola experiencia premium
                  </h2>
                  <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                    Integra procesos de consulta, validación y análisis desde un mismo panel,
                    con una navegación limpia, moderna y mucho más elegante.
                  </p>

                  <div className="mt-8 grid gap-4 md:grid-cols-2">
                    {services.map(({ label, href, Icon }) => (
                      <a
                        key={label}
                        href={href}
                        className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/35 hover:bg-cyan-400/10"
                      >
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/15 transition group-hover:scale-105 group-hover:bg-cyan-400/15">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span>{label}</span>
                      </a>
                    ))}
                  </div>
                </div>

                <div className="premium-card p-7 md:p-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300/90">
                    Valor diferencial
                  </p>

                  <div className="mt-6 space-y-5">
                    {advantages.map((point) => (
                      <div key={point} className="flex items-start gap-3">
                        <div className="mt-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400/10 ring-1 ring-cyan-400/20">
                          <BadgeCheck className="h-3.5 w-3.5 text-cyan-300" />
                        </div>
                        <p className="text-slate-300 leading-relaxed">{point}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="text-sm font-semibold text-white">
                      Diseñado para empresas que necesitan:
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {[
                        "Cumplimiento",
                        "Debida diligencia",
                        "Trazabilidad",
                        "Auditoría",
                        "Rapidez",
                        "Confianza",
                      ].map((tag) => (
                        <div
                          key={tag}
                          className="rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2 text-center text-sm text-slate-300"
                        >
                          {tag}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="relative py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="premium-card rounded-[2rem] p-8 md:p-14">
              <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300/90">
                    Empieza ahora
                  </p>
                  <h2 className="mt-4 text-3xl font-bold text-white md:text-5xl">
                    Haz que la verificación se vea tan sólida como tu servicio.
                  </h2>
                  <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                    Una interfaz más elegante genera más confianza, comunica más valor y
                    posiciona mejor a ECONFIA frente a clientes, aliados y equipos corporativos.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <a
                    href="/register"
                    className="rounded-2xl bg-cyan-500 px-6 py-5 text-center font-semibold text-slate-950 transition-all duration-300 hover:-translate-y-1 hover:bg-cyan-400 hover:shadow-[0_14px_40px_rgba(34,211,238,0.25)]"
                  >
                    Comenzar 
                  </a>
                  <a
                    href="/contacto"
                    className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-center font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/35 hover:bg-white/10"
                  >
                    Hablar con nosotros
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   App — router raíz
───────────────────────────────────────────────────────────── */
export default function App() {
  // Activar sonidos automáticamente en la primera interacción del usuario
  React.useEffect(() => {
    if (window.__userInteracted) return;
    const mark = () => { window.__userInteracted = true; };
    window.addEventListener("click", mark, { once: true });
    window.addEventListener("keydown", mark, { once: true });
    window.addEventListener("touchstart", mark, { once: true });
    return () => {
      window.removeEventListener("click", mark);
      window.removeEventListener("keydown", mark);
      window.removeEventListener("touchstart", mark);
    };
  }, []);

  return (
    <ConfigProvider theme={antdTheme}>
      <CardProvider>
        <Router>
          <ParticlesBackground />
          <ChatbotFlotante />
          <Routes>
            {/* Públicas */}
            <Route path="/"                  element={<Home />}             />
            <Route path="/login"             element={<Login />}            />
            <Route path="/register"          element={<Register />}         />
            <Route path="/precios"           element={<Pricing />}          />
            <Route path="/nosotros"          element={<Nosotros />}         />
            <Route path="/contacto"          element={<Contacto />}         />
            <Route path="/blog"              element={<Blog />}             />
            <Route path="/blog/:slug"        element={<BlogPost />}         />
            <Route path="/forgot"            element={<ForgotPassword />}   />
            <Route path="/reset"             element={<ResetPassword />}    />
            <Route path="/servicio-econfia"      element={<ServicioEconfia />}      />
            <Route path="/servicio-contratista"  element={<ServicioContratista />}  />
            <Route path="/servicio-seguridad"    element={<ServicioSeguridad />}    />
            <Route path="/servicio-titulos"      element={<ServicioTitulos />}      />
            {/* Verificación pública QR */}
            <Route path="/econfia/resumen-consulta/:consultaId" element={<VerificarReporte />} />
            <Route path="/beneficios" element={<Beneficios />} />

            {/* Protegidas */}
            <Route element={<PrivateRoute><Dashboard /></PrivateRoute>}>
              <Route path="/3c8f1a2e"          element={<Consulta />}                />
              <Route path="/consulta"           element={<Consulta />}                />
              <Route path="/a1e6c4b8"          element={<ConsultaEssencialExpress />} />
              <Route path="/5c2e8f4a"          element={<ConsultaExperian />}         />
              <Route path="/experian"          element={<ConsultaExperian />}         />
              <Route path="/7f3a9e2b"          element={<ConsultaFask />}             />
              <Route path="/2b7d5e9c"          element={<TitulosValidationForm />}    />
              <Route path="/9e3a6c1f"          element={<ConsultaMedida />}           />
              <Route path="/b4f8d2e7"          element={<ConsultaBasicElemnt />}      />
              <Route path="/1d5f8e3a"          element={<ConsultaEIdentidad />}       />
              <Route path="/6c1b9f3d"          element={<ConsultaContratista />}      />
              <Route path="/4a7e2b8f"          element={<ConsultaEmpresa />}          />
              <Route path="/8f5c3a1b/:nit"     element={<EmpresaRuesResult />}        />
              <Route path="/d3b7f1e9"          element={<Resultados />}               />
              <Route path="/d3b7f1e9/:consultaId" element={<Resultados />}            />
              <Route path="/e9c4b2f7"          element={<Profile />}                  />
              <Route path="/f1d8a5c3"          element={<LogOut />}                   />
              <Route path="/c2e6b9a4"          element={<Ayuda />}                    />
              <Route path="/7b3f9d1e"          element={<AdminUsuarios />}            />
              <Route path="/1e5c8a4b"          element={<AdminPlanes />}              />
              <Route path="/4d9b2f6e"          element={<AdminFuentes />}             />
              <Route path="/5d2a9c8e"          element={<AdminSoporte />}             />
              <Route path="/2c8e5f1a"          element={<AdminBlog />}                />
            </Route>

            <Route path="/a8e3c7b2" element={<PrivateRoute><AdminPanel /></PrivateRoute>} />
          </Routes>
        </Router>
      </CardProvider>
    </ConfigProvider>
  );
}
