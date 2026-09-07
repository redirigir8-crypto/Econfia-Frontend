// src/pages/LegalShell.jsx
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";
import Header from "../components/Header";

/**
 * Cascaron reutilizable para documentos legales publicos (Terminos,
 * Politica de Privacidad). Se muestra siempre con el tema oscuro de la
 * marca para que el texto quede legible sin depender del tema del sitio,
 * y es 100% publico (sin login) para cumplir el requisito de Google Play.
 */
export default function LegalShell({
  eyebrow = "Documento legal",
  title,
  intro,
  updatedAt,
  children,
}) {
  useEffect(() => {
    if (title) document.title = `${title} · ECONFIA`;
  }, [title]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.14),transparent_32%),linear-gradient(180deg,#0b1220,#070d1a)] text-slate-200">
      <Header />

      <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-10 sm:px-6">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70 transition hover:border-cyan-300/40 hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>

        <div className="overflow-hidden rounded-[28px] border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(8,15,30,0.96))] shadow-[0_30px_80px_rgba(2,12,27,0.55)]">
          {/* Encabezado */}
          <div className="border-b border-white/10 px-6 py-8 sm:px-10">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200">
                <ShieldCheck size={14} />
                Consulta segura
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/65">
                <LockKeyhole size={14} />
                Uso responsable
              </span>
            </div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-300/80">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
              {title}
            </h1>
            {intro && (
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300/85">
                {intro}
              </p>
            )}
            {updatedAt && (
              <p className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                Ultima actualizacion: {updatedAt}
              </p>
            )}
          </div>

          {/* Cuerpo */}
          <div className="px-6 py-8 sm:px-10">
            <div className="terms-content text-sm leading-7 text-slate-200/90 [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-black [&_h2]:text-white first:[&_h2]:mt-0 [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-white [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_li]:text-slate-200/85 [&_p]:mb-3 [&_p]:text-justify [&_p]:text-slate-200/90 [&_a]:text-cyan-300 [&_a]:underline [&_a]:underline-offset-4">
              {children}
            </div>
          </div>
        </div>

        {/* Pie de documento */}
        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 text-sm text-slate-300/80 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-white">ECONFIA</p>
            <p>Bogota, Colombia · +57 305 422 6582</p>
            <a
              href="mailto:coordinaciondesarrollo@solutionsgroupcol.com"
              className="text-cyan-300 underline underline-offset-4"
            >
              coordinaciondesarrollo@solutionsgroupcol.com
            </a>
          </div>
          <div className="flex gap-4">
            <Link to="/terminos" className="hover:text-white">
              Terminos y Condiciones
            </Link>
            <Link to="/politica-privacidad" className="hover:text-white">
              Politica de Privacidad
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
