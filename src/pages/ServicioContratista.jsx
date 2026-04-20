import React from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaCheckCircle,
  FaClock,
  FaFileAlt,
  FaFolderOpen,
  FaShieldAlt,
  FaUserTie,
  FaCloudDownloadAlt,
  FaClipboardList,
  FaSearch,
} from "react-icons/fa";
import Header from "../components/Header";

export default function ServicioContratista() {
  const entregables = [
    "Certificado de Antecedentes Fiscales (Contraloría)",
    "Certificado de Antecedentes Disciplinarios (Procuraduría)",
    "Certificado de Antecedentes Judiciales (Policía)",
    "Certificado SIMIT y validaciones relacionadas",
    "Consulta de Medidas Correctivas",
    "RUT y soportes documentales requeridos",
    "Constancias de afiliación y certificados complementarios",
    "Consolidación de soportes para procesos contractuales",
  ];

  const ventajas = [
    {
      icon: <FaClock />,
      title: "Menos tiempo operativo",
      text: "Centraliza documentos frecuentes en un solo flujo y reduce tareas repetitivas antes de una postulación o legalización.",
    },
    {
      icon: <FaFolderOpen />,
      title: "Soporte ordenado",
      text: "Agrupa certificados y evidencias en una experiencia más clara para contratistas, auxiliares administrativos y equipos de apoyo.",
    },
    {
      icon: <FaShieldAlt />,
      title: "Fuentes oficiales",
      text: "La información se obtiene desde fuentes públicas y oficiales para mantener trazabilidad documental en cada entrega.",
    },
  ];

  const pasos = [
    {
      step: "01",
      title: "Ingresas la información básica",
      text: "Documento, datos principales y contexto de la solicitud.",
      icon: <FaUserTie />,
    },
    {
      step: "02",
      title: "Se ejecutan las validaciones requeridas",
      text: "La plataforma consulta certificados y soportes asociados al perfil del contratista.",
      icon: <FaSearch />,
    },
    {
      step: "03",
      title: "Descargas los soportes",
      text: "Obtienes resultados organizados para revisión, archivo o entrega al cliente interno.",
      icon: <FaCloudDownloadAlt />,
    },
  ];

  const indicadores = [
    { value: "1 flujo", label: "para reunir soportes clave" },
    { value: "Menos clics", label: "para procesos repetitivos" },
    { value: "Más orden", label: "en cada entrega documental" },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <Header />

      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(168,85,247,0.12),transparent_35%,rgba(244,114,182,0.12)_65%,transparent)]" />
        <div className="absolute -top-10 left-[-6rem] h-72 w-72 rounded-full bg-purple-400/15 blur-3xl animate-pulse" />
        <div className="absolute top-32 right-[-8rem] h-96 w-96 rounded-full bg-fuchsia-400/15 blur-3xl animate-pulse [animation-duration:7s]" />
        <div className="absolute bottom-10 left-1/3 h-80 w-80 rounded-full bg-violet-300/10 blur-3xl animate-pulse [animation-duration:9s]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-purple-300/8 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-24 md:px-6 md:pt-32">
        <section className="mb-16 grid gap-8 lg:grid-cols-[1.25fr_0.95fr] lg:items-end">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-400/10 px-4 py-2 text-sm font-medium text-purple-200 backdrop-blur-md">
              <FaClipboardList className="text-purple-300" />
              Solución documental para procesos de contratación
            </div>

            <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Econfia Contratista
              <span className="mt-2 block bg-gradient-to-r from-purple-300 via-fuchsia-200 to-violet-300 bg-clip-text text-transparent">
                documentos listos, más claridad operativa
              </span>
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-300 md:text-xl">
              Una vista más ordenada para contratistas que necesitan reunir soportes
              y certificados frecuentes sin navegar por múltiples portales. La idea es
              simplificar la preparación documental y dar una experiencia más formal,
              comprensible y útil desde el primer paso.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 px-8 py-4 font-semibold text-white shadow-[0_0_30px_rgba(168,85,247,0.28)] transition-all duration-300 hover:scale-[1.02] hover:from-purple-400 hover:to-fuchsia-400"
              >
                Ingresar a Contratista
                <FaArrowRight />
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-3 rounded-full border border-white/15 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-md transition-all duration-300 hover:border-white/25 hover:bg-white/10"
              >
                Crear cuenta
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-purple-300/10 bg-white/5 p-6 shadow-[0_0_60px_rgba(168,85,247,0.10)] backdrop-blur-2xl">
            <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-purple-200/80">
                  Panorama del servicio
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Más orden antes de contratar
                </h2>
              </div>
              <div className="rounded-2xl border border-purple-300/20 bg-purple-300/10 p-3 text-purple-200">
                <FaFileAlt className="text-2xl" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {indicadores.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-slate-950/35 p-4"
                >
                  <p className="text-2xl font-bold text-white">{item.value}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-purple-300/15 bg-gradient-to-r from-purple-400/10 to-fuchsia-400/10 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-200/75">
                Enfoque
              </p>
              <p className="mt-3 text-base leading-relaxed text-slate-200">
                Esta experiencia está pensada para presentar requisitos, entregables y
                beneficios con un tono más institucional y una navegación más clara para el usuario final.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="rounded-[2rem] border border-purple-300/10 bg-white/8 p-8 shadow-[0_0_70px_rgba(168,85,247,0.10)] backdrop-blur-2xl md:p-10">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-200/80">
                  ¿Qué resuelve?
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
                  Una experiencia más limpia para reunir soportes contractuales
                </h2>
              </div>
              <div className="rounded-full border border-white/10 bg-slate-950/30 px-4 py-2 text-sm text-slate-300">
                Pensado para contratistas y equipos de soporte documental
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-5 text-lg leading-relaxed text-slate-200">
                <p>
                  <span className="font-semibold text-purple-300">Econfia Contratista</span> está orientado a
                  quienes deben presentar certificados y evidencias de forma recurrente en procesos de
                  vinculación, contratación o actualización documental.
                </p>
                <p>
                  En vez de dispersar el proceso entre múltiples sitios, la plataforma organiza el flujo
                  de consulta y entrega con una experiencia más consistente, más comprensible y más formal.
                </p>
                <p>
                  El valor real no es solo descargar archivos: es reducir fricción, evitar repeticiones
                  innecesarias y presentar al usuario una ruta clara de qué se puede obtener, para qué sirve
                  y cómo aprovecharlo dentro del proceso contractual.
                </p>
              </div>

              <div className="grid gap-4">
                {ventajas.map((item) => (
                  <div
                    key={item.title}
                  className="rounded-3xl border border-white/10 bg-slate-950/35 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-purple-300/20"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-300/15 bg-purple-400/10 text-xl text-purple-300">
                    {item.icon}
                  </div>
                    <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-300">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl border border-purple-300/15 bg-purple-300/10 p-3 text-purple-200">
                <FaFileAlt className="text-2xl" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-200/80">
                  Entregables frecuentes
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-white">
                  Documentos que suelen necesitarse
                </h2>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {entregables.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-white/8 bg-slate-950/30 px-4 py-4"
                >
                  <FaCheckCircle className="mt-1 shrink-0 text-purple-300" />
                  <span className="text-sm leading-relaxed text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950/60 to-slate-900/40 p-8 backdrop-blur-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-200/80">
              Cómo funciona
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white">
              Un flujo más directo y entendible
            </h2>

            <div className="mt-8 space-y-5">
              {pasos.map((item) => (
                <div
                  key={item.step}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-purple-300/15 bg-purple-400/10 text-purple-300">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-purple-200/70">
                          Paso {item.step}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="text-center">
          <div className="rounded-[2rem] border border-purple-300/10 bg-gradient-to-r from-purple-400/10 via-fuchsia-400/10 to-violet-300/10 px-6 py-10 shadow-[0_0_80px_rgba(168,85,247,0.14)] backdrop-blur-2xl md:px-10">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-purple-200/80">
              Siguiente paso
            </p>
            <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold text-white md:text-4xl">
              Una experiencia más formal para contratistas que necesitan resultados rápidos y ordenados
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">
              Ingresa a la plataforma, consulta los soportes requeridos y mantén una ruta más clara para
              preparar entregas documentales sin dispersión operativa.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/contacto"
                className="inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 px-8 py-4 font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:from-purple-400 hover:to-fuchsia-400"
              >
                Solicitar información
                <FaArrowRight />
              </Link>
              <Link
                to="/contacto"
                className="inline-flex items-center justify-center gap-3 rounded-full border border-white/15 bg-slate-950/30 px-8 py-4 font-semibold text-white transition-all duration-300 hover:bg-slate-950/45"
              >
                Contáctanos
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
