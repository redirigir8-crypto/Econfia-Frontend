import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { createPortal } from 'react-dom';
import Toast from '../components/Toast';

const resolveApiBase = () => {
  const envBase = (process.env.REACT_APP_API_URL || '').trim();
  if (envBase) {
    return envBase.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    return isLocal ? 'http://127.0.0.1:8000' : window.location.origin.replace(/\/$/, '');
  }

  return 'http://127.0.0.1:8000';
};

const API_URL = `${resolveApiBase()}/api/validar_titulos/`;

const TitulosValidationForm = () => {
  const [form, setForm] = useState({
    cedula: '',
    tipo_doc: 'CC',
    nombre: '',
    apellido: '',
    profesion: '',
    universidad: '',
    codigo_titulo: '',
    codigo_csv: '',
  });
  const [archivoPdf, setArchivoPdf] = useState(null);
  const [archivoQr, setArchivoQr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);
  const [showResultados, setShowResultados] = useState(false);

  const canSubmit = useMemo(() => form.cedula.trim().length > 0, [form.cedula]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) {
      setToast({ type: 'error', message: 'La cédula es obligatoria.' });
      return;
    }

    setLoading(true);
    setResult(null);
    setShowResultados(false);
    setToast(null);

    try {
      const token = localStorage.getItem('token');
      const payload = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (String(value || '').trim()) {
          payload.append(key, value);
        }
      });

      if (archivoPdf) {
        payload.append('archivo_pdf', archivoPdf);
      }
      if (archivoQr) {
        payload.append('archivo_qr', archivoQr);
      }

      const response = await axios.post(API_URL, payload, token ? {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      } : {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data);
      setShowResultados(true);
    } catch (error) {
      const backendMessage = error?.response?.data?.error || error?.response?.data?.mensaje;
      setToast({
        type: 'error',
        message: backendMessage || 'Error al enviar la consulta de validación de títulos.',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetResultados = () => {
    setShowResultados(false);
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_32%),linear-gradient(135deg,_#07111f_0%,_#0d1b2a_45%,_#111827_100%)] px-4 py-10 text-white">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute left-[-8rem] top-10 h-64 w-64 rounded-full bg-cyan-400 blur-3xl" />
        <div className="absolute bottom-0 right-[-6rem] h-72 w-72 rounded-full bg-sky-700 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.9fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/6 p-8 shadow-[0_30px_80px_rgba(2,12,27,0.45)] backdrop-blur-xl">
            <div className="mb-8">
              <div className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">
                Validacion integral de titulos
              </div>
              <h1 className="max-w-3xl font-serif text-4xl leading-tight text-white md:text-5xl">
                Ejecuta colegios reguladores y universidades en una sola consulta.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200/80 md:text-base">
                La consulta base dispara todos los colegios reguladores configurados. Los bots universitarios se suman de forma automatica y solo quedan pendientes los que exigen codigo CSV, PDF o QR.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Cedula" required>
                  <input
                    name="cedula"
                    value={form.cedula}
                    onChange={handleChange}
                    placeholder="Numero de documento"
                    className={inputClassName}
                    required
                  />
                </Field>
                <Field label="Tipo de documento">
                  <select
                    name="tipo_doc"
                    value={form.tipo_doc}
                    onChange={handleChange}
                    className={inputClassName}
                  >
                    <option value="CC">CC</option>
                    <option value="CE">CE</option>
                    <option value="TI">TI</option>
                    <option value="PPT">PPT</option>
                    <option value="PASAPORTE">Pasaporte</option>
                  </select>
                </Field>
                <Field label="Nombre">
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Nombre"
                    className={inputClassName}
                  />
                </Field>
                <Field label="Apellido">
                  <input
                    name="apellido"
                    value={form.apellido}
                    onChange={handleChange}
                    placeholder="Apellido"
                    className={inputClassName}
                  />
                </Field>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Parametros universitarios opcionales</h2>
                    <p className="mt-1 text-xs text-slate-300/75">
                      Solo diligencia estos campos si tienes el codigo o el soporte que exige la universidad.
                    </p>
                  </div>
                  <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-200">
                    Opcional
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Profesion de referencia">
                    <input
                      name="profesion"
                      value={form.profesion}
                      onChange={handleChange}
                      placeholder="Ejemplo: Abogado, Ingeniero"
                      className={inputClassName}
                    />
                  </Field>
                  <Field label="Universidad de referencia">
                    <input
                      name="universidad"
                      value={form.universidad}
                      onChange={handleChange}
                      placeholder="Ejemplo: Universidad del Norte"
                      className={inputClassName}
                    />
                  </Field>
                  <Field label="Codigo de verificacion / CSV">
                    <input
                      name="codigo_titulo"
                      value={form.codigo_titulo}
                      onChange={handleChange}
                      placeholder="Codigo para Nacional, Central, Norte, Occidente, Distrital"
                      className={inputClassName}
                    />
                  </Field>
                  <Field label="Codigo CSV especifico">
                    <input
                      name="codigo_csv"
                      value={form.codigo_csv}
                      onChange={handleChange}
                      placeholder="Codigo CSV de UNAD"
                      className={inputClassName}
                    />
                  </Field>
                  <Field label="Archivo PDF">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(event) => setArchivoPdf(event.target.files?.[0] || null)}
                      className={`${inputClassName} file:mr-4 file:rounded-full file:border-0 file:bg-cyan-400/15 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-cyan-100`}
                    />
                  </Field>
                  <Field label="Imagen QR">
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp"
                      onChange={(event) => setArchivoQr(event.target.files?.[0] || null)}
                      className={`${inputClassName} file:mr-4 file:rounded-full file:border-0 file:bg-cyan-400/15 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-cyan-100`}
                    />
                  </Field>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-xl text-xs leading-6 text-slate-300/80">
                  La consulta siempre dispara los colegios reguladores base. Si faltan parametros para una universidad, el sistema la deja marcada como pendiente para completarla despues.
                </p>
                <button
                  type="submit"
                  disabled={!canSubmit || loading}
                  className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${
                    !canSubmit || loading
                      ? 'cursor-not-allowed bg-white/10 text-white/35'
                      : 'bg-cyan-400 text-slate-950 shadow-[0_12px_35px_rgba(34,211,238,0.35)] hover:bg-cyan-300'
                  }`}
                >
                  {loading ? 'Procesando consulta...' : 'Lanzar consulta completa'}
                </button>
              </div>
            </form>
          </div>

          <aside className="rounded-[28px] border border-white/10 bg-slate-950/45 p-8 shadow-[0_30px_80px_rgba(2,12,27,0.45)] backdrop-blur-xl">
            <h2 className="text-xl font-semibold text-white">Como funciona ahora</h2>
            <div className="mt-6 space-y-4 text-sm text-slate-200/85">
              <InfoCard
                title="1. Consulta base"
                text="Con la cedula se ejecutan todos los colegios reguladores y cualquier universidad que no pida datos extra."
              />
              <InfoCard
                title="2. Parametros especiales"
                text="Si una universidad exige CSV, PDF o QR, el backend la reporta como pendiente en vez de descartarla silenciosamente."
              />
              <InfoCard
                title="3. Resultado claro"
                text="La respuesta diferencia bots ejecutados, bots pendientes y los campos faltantes para completar la validacion."
              />
            </div>
          </aside>
        </div>
      </div>

      {loading && createPortal(
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-950/90 p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-white/15 border-t-cyan-300" />
            <p className="text-base font-semibold text-white">Ejecutando consulta</p>
            <p className="mt-2 text-sm text-slate-300/80">Colegios reguladores y bots universitarios disponibles se estan enviando a proceso.</p>
          </div>
        </div>,
        document.body
      )}

      {!loading && showResultados && result && createPortal(
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-[28px] border border-white/10 bg-[#08111d] p-8 text-left text-white shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/80">Resultado</p>
                <h3 className="mt-2 text-2xl font-semibold">Consulta creada #{result.consulta_id}</h3>
                <p className="mt-2 text-sm text-slate-300/80">{result.mensaje}</p>
              </div>
              <button
                onClick={resetResultados}
                className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <ResultBlock title="Bots ejecutados" items={result.bots || []} emptyText="No hubo bots ejecutados." />
              <ResultBlock
                title="Campos faltantes"
                items={result.campos_faltantes || []}
                emptyText="No faltan parametros adicionales."
              />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <ResultBlock
                title="Colegios reguladores"
                items={result.bots_contratista || []}
                emptyText="No llegaron bots base en la respuesta."
              />
              <PendingBlock items={result.bots_pendientes || []} />
            </div>
          </div>
        </div>,
        document.body
      )}

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
          sound="sounds/error-011-352286.mp3"
        />
      )}
    </section>
  );
};

const inputClassName = 'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none transition focus:border-cyan-300/70 focus:bg-white/10';

const Field = ({ label, required = false, children }) => (
  <label className="block">
    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-300/80">
      {label} {required ? '*' : ''}
    </span>
    {children}
  </label>
);

const InfoCard = ({ title, text }) => (
  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
    <h3 className="text-sm font-semibold text-cyan-100">{title}</h3>
    <p className="mt-2 text-sm leading-6 text-slate-300/80">{text}</p>
  </div>
);

const ResultBlock = ({ title, items, emptyText }) => (
  <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
    <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-100">{title}</h4>
    {items?.length ? (
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="rounded-full border border-cyan-300/15 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
            {item}
          </span>
        ))}
      </div>
    ) : (
      <p className="mt-3 text-sm text-slate-300/75">{emptyText}</p>
    )}
  </div>
);

const PendingBlock = ({ items }) => (
  <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
    <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-100">Bots pendientes</h4>
    {items?.length ? (
      <div className="mt-3 space-y-3">
        {items.map((item) => (
          <div key={item.name} className="rounded-2xl border border-amber-300/15 bg-amber-300/5 p-3">
            <p className="text-sm font-semibold text-white">{item.label || item.name}</p>
            <p className="mt-1 text-xs text-slate-300/80">Faltan: {(item.required_labels || []).join(', ')}</p>
          </div>
        ))}
      </div>
    ) : (
      <p className="mt-3 text-sm text-slate-300/75">No hay bots pendientes por parametros.</p>
    )}
  </div>
);

export default TitulosValidationForm;
