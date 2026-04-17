import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { FileCheck2, LockKeyhole, ShieldCheck, X } from "lucide-react";

function DefaultTermsContent() {
  const legalFramework = [
    "Constitucion Politica de Colombia, articulo 15.",
    "Ley 1581 de 2012 y sus decretos reglamentarios.",
    "Ley 1266 de 2008 sobre habeas data financiero y comercial.",
    "Decreto 1377 de 2013 y normas concordantes.",
    "Disposiciones asociadas a SARLAFT, SAGRILAFT, SIPLAFT y LA/FT/FPADM.",
  ];

  const userDuties = [
    "Usar la informacion consultada unicamente para fines licitos y autorizados.",
    "Contar con la base legal y/o autorizacion correspondiente para realizar la consulta.",
    "Interpretar los resultados como apoyo de analisis y no como prueba concluyente por si sola.",
    "Abstenerse de divulgar, comercializar o reutilizar la informacion de forma no autorizada.",
  ];

  const dataRights = [
    "Conocer, actualizar y rectificar sus datos personales.",
    "Solicitar prueba de la autorizacion otorgada cuando aplique.",
    "Ser informado sobre el uso dado a sus datos.",
    "Presentar consultas o reclamos y ejercer los derechos previstos en la Ley 1581 de 2012.",
  ];

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h3 className="text-lg font-bold text-white">1. Objeto</h3>
        <p>
          Los presentes terminos regulan el acceso, uso y consulta de informacion
          a traves del aplicativo ECONFIA para procesos de debida diligencia,
          conocimiento de contrapartes, gestion del riesgo y cumplimiento
          normativo.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-bold text-white">2. Marco normativo aplicable</h3>
        <ul className="space-y-2">
          {legalFramework.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-bold text-white">3. Naturaleza de la informacion</h3>
        <p>
          La informacion consultada puede provenir de fuentes publicas, abiertas,
          oficiales o de terceros legalmente habilitados. Su caracter es
          referencial, informativo y de apoyo para analisis de riesgo y procesos
          internos, por lo que no constituye por si sola una declaracion definitiva
          de responsabilidad sobre las personas o entidades consultadas.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-bold text-white">4. Finalidades del tratamiento</h3>
        <p>
          La informacion se utiliza para apoyar procesos de debida diligencia,
          prevenir riesgos legales, reputacionales, financieros y operativos, y
          cumplir obligaciones legales o regulatorias aplicables.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-bold text-white">5. Responsabilidad del usuario</h3>
        <ul className="space-y-2">
          {userDuties.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-bold text-white">6. Proteccion de datos personales</h3>
        <p>
          ECONFIA adopta medidas tecnicas, administrativas y organizacionales
          razonables para proteger la informacion frente a accesos no autorizados,
          perdida o uso indebido. Los datos personales se tratan conforme a la Ley
          1581 de 2012 y demas normas aplicables.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-bold text-white">7. Derechos del titular</h3>
        <ul className="space-y-2">
          {dataRights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-bold text-white">8. Confidencialidad y limitacion</h3>
        <p>
          La informacion obtenida a traves del aplicativo es confidencial y de uso
          restringido. ECONFIA no garantiza que la informacion este libre de
          errores o totalmente actualizada en todos los casos, dado que depende de
          la disponibilidad y actualizacion de las fuentes de origen.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-bold text-white">9. Aceptacion y vigencia</h3>
        <p>
          El acceso y uso del aplicativo implica la aceptacion expresa de estos
          terminos. ECONFIA podra actualizarlos cuando existan cambios normativos,
          operativos o tecnologicos, siendo aplicables desde su publicacion.
        </p>
      </section>
    </div>
  );
}

function TermsBody({ children }) {
  const content = useMemo(() => {
    if (children) return children;
    return <DefaultTermsContent />;
  }, [children]);

  return (
    <div className="terms-content text-sm leading-7 text-slate-200/90 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-white [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_li]:text-slate-200/85 [&_p]:text-justify [&_p]:text-slate-200/90">
      {content}
    </div>
  );
}

export default function Terminos({
  isOpen = false,
  onClose,
  children,
  inline = false,
  triggerLabel = "terminos y condiciones",
  triggerClassName = "",
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = inline ? internalOpen : isOpen;

  const handleClose = () => {
    if (inline) setInternalOpen(false);
    onClose?.();
  };

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow || "auto";
    };
  }, [open]);

  if (inline) {
    return (
      <>
        <button
          type="button"
          onClick={() => setInternalOpen(true)}
          className={
            triggerClassName ||
            "text-cyan-300 underline decoration-cyan-400/60 underline-offset-4 transition hover:text-cyan-200"
          }
        >
          {triggerLabel}
        </button>
        {open &&
          createPortal(
            <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-slate-950/75 px-4 py-6 backdrop-blur-md">
              <div className="relative flex h-[min(88vh,780px)] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-cyan-400/20 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.12),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(8,15,30,0.98))] shadow-[0_30px_80px_rgba(2,12,27,0.6)]">
                <button
                  type="button"
                  onClick={handleClose}
                  className="absolute right-4 top-4 z-10 rounded-full border border-white/10 bg-white/5 p-2 text-white/60 transition hover:border-cyan-300/40 hover:bg-white/10 hover:text-white"
                  aria-label="Cerrar terminos"
                >
                  <X size={20} />
                </button>

                <div className="border-b border-white/10 px-6 py-5 sm:px-8">
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200">
                      <ShieldCheck size={14} />
                      Consulta segura
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/65">
                      <LockKeyhole size={14} />
                      Uso responsable
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-white sm:text-3xl">Terminos y Condiciones</h2>
                  <p className="mt-2 max-w-3xl text-sm text-slate-300/80">
                    Consulta las condiciones de uso del aplicativo ECONFIA, el alcance
                    de la informacion y las reglas de tratamiento de datos antes de
                    continuar con cualquier consulta.
                  </p>
                </div>

                <div className="grid gap-0 overflow-hidden lg:grid-cols-[280px_1fr]">
                  <aside className="hidden border-r border-white/10 bg-white/[0.03] p-6 lg:block">
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-cyan-400/15 bg-cyan-500/8 p-4">
                        <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-200">
                          <FileCheck2 size={18} />
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white/90">
                          Lectura recomendada
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-300/75">
                          Revisa el alcance del uso, la naturaleza de la informacion y
                          las obligaciones del usuario antes de aceptar.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400">
                          Incluye
                        </p>
                        <ul className="mt-3 space-y-2 text-sm text-slate-300/80">
                          <li>Uso permitido del servicio</li>
                          <li>Proteccion de datos personales</li>
                          <li>Deberes del usuario</li>
                          <li>Confidencialidad y vigencia</li>
                        </ul>
                      </div>
                    </div>
                  </aside>

                  <div className="overflow-y-auto px-6 py-6 sm:px-8">
                    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
                      <TermsBody>{children}</TermsBody>
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )}
      </>
    );
  }

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-slate-950/75 px-4 py-6 backdrop-blur-md"
      onClick={handleClose}
    >
      <div
        className="relative flex h-[min(88vh,780px)] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-cyan-400/20 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.12),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(8,15,30,0.98))] shadow-[0_30px_80px_rgba(2,12,27,0.6)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 rounded-full border border-white/10 bg-white/5 p-2 text-white/60 transition hover:border-cyan-300/40 hover:bg-white/10 hover:text-white"
          aria-label="Cerrar terminos"
        >
          <X size={20} />
        </button>

        <div className="border-b border-white/10 px-6 py-5 sm:px-8">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200">
              <ShieldCheck size={14} />
              Consulta segura
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/65">
              <LockKeyhole size={14} />
              Uso responsable
            </span>
          </div>
          <h2 className="text-2xl font-black text-white sm:text-3xl">Terminos y Condiciones</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-300/80">
            Consulta las condiciones de uso del aplicativo ECONFIA, el alcance de la
            informacion y las reglas de tratamiento de datos antes de continuar con
            cualquier consulta.
          </p>
        </div>

        <div className="grid gap-0 overflow-hidden lg:grid-cols-[280px_1fr]">
          <aside className="hidden border-r border-white/10 bg-white/[0.03] p-6 lg:block">
            <div className="space-y-4">
              <div className="rounded-2xl border border-cyan-400/15 bg-cyan-500/8 p-4">
                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-200">
                  <FileCheck2 size={18} />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white/90">
                  Lectura recomendada
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-300/75">
                  Revisa el alcance del uso, la naturaleza de la informacion y las
                  obligaciones del usuario antes de aceptar.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400">
                  Incluye
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-300/80">
                  <li>Uso permitido del servicio</li>
                  <li>Proteccion de datos personales</li>
                  <li>Deberes del usuario</li>
                  <li>Confidencialidad y vigencia</li>
                </ul>
              </div>
            </div>
          </aside>

          <div className="overflow-y-auto px-6 py-6 sm:px-8">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
              <TermsBody>{children}</TermsBody>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
