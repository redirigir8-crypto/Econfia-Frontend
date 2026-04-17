import React from "react";
import {
  FaArrowRight,
  FaCheckCircle,
  FaClipboardList,
  FaFileAlt,
  FaGraduationCap,
  FaUniversity,
} from "react-icons/fa";
import Header from "../components/Header";

const puntosClave = [
  "Revisión de títulos, certificados y soportes académicos dentro de un flujo más claro.",
  "Validación documental orientada a procesos de selección, vinculación y control interno.",
  "Organización de evidencia para equipos de talento humano, cumplimiento y auditoría.",
];

const paraQuien = [
  "Empresas que contratan perfiles profesionales o técnicos.",
  "Áreas de talento humano que necesitan respaldo documental antes de vincular.",
  "Equipos de cumplimiento que requieren trazabilidad en validaciones académicas.",
  "Operaciones que quieren un proceso más ordenado y menos manual.",
];

const queRecibe = [
  "Información organizada para la revisión del caso.",
  "Soporte documental con mejor contexto para la toma de decisiones.",
  "Un flujo entendible para validar si la documentación cumple con lo esperado.",
  "Evidencia utilizable en procesos internos, revisión y seguimiento.",
];

const flujo = [
  {
    titulo: "Recepción del caso",
    texto:
      "Se estructura la información del documento o soporte a revisar para iniciar el proceso con orden.",
  },
  {
    titulo: "Validación documental",
    texto:
      "Se revisa la consistencia de la información académica y de los soportes asociados según el proceso.",
  },
  {
    titulo: "Resultado claro",
    texto:
      "Se entrega una salida comprensible, con evidencia y contexto suficiente para que cualquier área la entienda.",
  },
];

export default function ServicioTitulos() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-sky-950 to-slate-900">
      <Header />

      <main className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_28%)]" />

        <div className="relative max-w-6xl mx-auto px-4 md:px-6 pt-24 md:pt-32 pb-20">
          <section className="mb-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-4 py-2 text-sm font-medium text-amber-200">
              <FaGraduationCap className="text-amber-300" />
              Servicio especializado en validación académica
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
              <div>
                <h1 className="text-4xl md:text-6xl font-black leading-tight text-white">
                  Econfia Títulos
                </h1>
                <p className="mt-5 max-w-3xl text-lg md:text-xl leading-8 text-slate-300">
                  Una solución pensada para validar títulos, certificados y
                  soportes académicos con una presentación más seria, más clara y
                  mucho más útil para los equipos que deben tomar decisiones.
                </p>
                <p className="mt-4 max-w-3xl text-base md:text-lg leading-7 text-slate-400">
                  No se trata solo de revisar un documento. Se trata de dar
                  contexto, orden y evidencia a un proceso que normalmente se
                  hace de forma dispersa.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <a
                    href="https://www.econfia.online"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-3 rounded-full bg-amber-400 px-8 py-4 font-semibold text-slate-950 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-[0_16px_40px_rgba(245,158,11,0.22)]"
                  >
                    Visitar Econfia Títulos
                    <FaArrowRight />
                  </a>
                  <a
                    href="/contacto"
                    className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-8 py-4 font-semibold text-white transition-all duration-300 hover:border-amber-300/40 hover:bg-white/10"
                  >
                    Solicitar información
                  </a>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8 shadow-[0_30px_80px_rgba(2,6,23,0.4)]">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-200">
                  Panorama del servicio
                </p>

                <div className="mt-6 space-y-4">
                  {puntosClave.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-4"
                    >
                      <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/20">
                        <FaCheckCircle className="text-sm" />
                      </div>
                      <p className="text-slate-300 leading-7">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-3 mb-14">
            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-lg">
              <FaUniversity className="text-3xl text-amber-300 mb-4" />
              <h2 className="text-xl font-semibold text-white mb-3">
                Enfoque institucional
              </h2>
              <p className="text-slate-300 leading-7">
                Pensado para verse serio, claro y comprensible frente a áreas
                administrativas, jurídicas y de talento humano.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-lg">
              <FaFileAlt className="text-3xl text-sky-300 mb-4" />
              <h2 className="text-xl font-semibold text-white mb-3">
                Lectura sencilla
              </h2>
              <p className="text-slate-300 leading-7">
                La información se presenta con una estructura limpia para que el
                resultado no dependa solo del criterio técnico.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-lg">
              <FaClipboardList className="text-3xl text-amber-300 mb-4" />
              <h2 className="text-xl font-semibold text-white mb-3">
                Proceso trazable
              </h2>
              <p className="text-slate-300 leading-7">
                Facilita el control documental y deja una base mejor organizada
                para seguimiento o revisión posterior.
              </p>
            </div>
          </section>

          <section className="grid gap-8 lg:grid-cols-2 mb-14">
            <div className="rounded-[2rem] border border-amber-400/15 bg-slate-950/50 p-8">
              <h2 className="text-3xl font-bold text-white mb-6">
                ¿Para quién funciona bien?
              </h2>
              <div className="space-y-4">
                {paraQuien.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="mt-2 h-2.5 w-2.5 rounded-full bg-amber-300 flex-shrink-0" />
                    <p className="text-slate-300 leading-7">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-sky-400/15 bg-white/[0.04] p-8 backdrop-blur-lg">
              <h2 className="text-3xl font-bold text-white mb-6">
                ¿Qué recibe tu equipo?
              </h2>
              <div className="space-y-4">
                {queRecibe.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/8 bg-slate-950/35 px-5 py-4"
                  >
                    <p className="text-slate-300 leading-7">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mb-14">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-200">
                Cómo se entiende
              </p>
              <h2 className="mt-3 text-3xl md:text-5xl font-bold text-white">
                Un flujo simple para que el servicio se entienda rápido
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-300">
                La idea no es llenar la vista con bloques. La idea es explicar
                bien qué hace el servicio, cómo aporta y por qué ayuda al proceso.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {flujo.map((item, index) => (
                <div
                  key={item.titulo}
                  className="rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-lg font-bold text-amber-300 ring-1 ring-amber-400/20">
                    0{index + 1}
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-white">
                    {item.titulo}
                  </h3>
                  <p className="mt-3 text-slate-300 leading-7">{item.texto}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-gradient-to-r from-white/[0.06] to-amber-400/[0.06] p-8 md:p-12 backdrop-blur-xl">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-200">
                  Cierre
                </p>
                <h2 className="mt-3 text-3xl md:text-5xl font-bold text-white">
                  Econfia Títulos debe verse tan confiable como el proceso que respalda
                </h2>
                <p className="mt-5 text-lg leading-8 text-slate-300">
                  Por eso esta página queda con una línea más sobria, más clara y
                  más orientada a explicar valor real sin saturar al usuario.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <a
                  href="https://www.econfia.online"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 rounded-full bg-amber-400 px-8 py-4 font-semibold text-slate-950 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-300"
                >
                  Ir a Econfia Títulos
                  <FaArrowRight />
                </a>
                <p className="text-sm text-slate-400 text-center">
                  Plataforma externa enfocada en títulos, soportes y validación documental.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
