import { useCallback, useEffect, useRef, useState } from "react";
import Toast from "../components/Toast";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const TIPO_DOC_OPCIONES = [
  { value: "CC", label: "Cédula de Ciudadanía (CC)" },
  { value: "TI", label: "Tarjeta de Identidad (TI)" },
  { value: "CE", label: "Cédula de Extranjería (CE)" },
  { value: "PPT", label: "Permiso de Protección Temporal (PPT)" },
  { value: "PEP", label: "Permiso Especial de Permanencia (PEP)" },
];

const TIPO_DOCUMENTO_SUBIDA = [
  { value: "cedula", label: "Cédula de ciudadanía" },
  { value: "hoja_vida", label: "Hoja de vida" },
  { value: "referencia_laboral", label: "Referencia laboral" },
  { value: "certificacion", label: "Certificación laboral" },
  { value: "otro", label: "Otro documento" },
];

const NIVEL_OPCIONES = [
  { value: "tecnico", label: "Técnico" },
  { value: "tecnologo", label: "Tecnólogo" },
  { value: "pregrado", label: "Pregrado" },
  { value: "especializacion", label: "Especialización" },
  { value: "maestria", label: "Maestría" },
  { value: "doctorado", label: "Doctorado" },
  { value: "otro", label: "Otro" },
];

// Colores por estado de verificación / resultado.
function badgeClasses(estado) {
  const e = String(estado || "").toLowerCase();
  if (["verificado", "sin antecedentes"].includes(e))
    return "bg-green-500/15 text-green-300 border-green-500/30";
  if (["rechazado", "con hallazgo"].includes(e))
    return "bg-red-500/15 text-red-300 border-red-500/30";
  if (["pendiente", "en_proceso"].includes(e))
    return "bg-amber-500/15 text-amber-300 border-amber-500/30";
  return "bg-surface-2/70 text-muted border-line/15";
}

function authHeaders(extra = {}) {
  const token = localStorage.getItem("token");
  return { Authorization: `Token ${token}`, ...extra };
}

export default function EconfiaWallet() {
  const [estado, setEstado] = useState(null);
  const [toast, setToast] = useState(null);

  // Formulario base
  const [form, setForm] = useState({
    documento: "",
    tipo_doc: "CC",
    fecha_expedicion: "",
    nombre_completo: "",
    fecha_nacimiento: "",
    lugar_nacimiento: "",
  });
  const [guardandoBase, setGuardandoBase] = useState(false);

  // Consulta única
  const [resultado, setResultado] = useState(null);
  const [consultando, setConsultando] = useState(false);
  const pollRef = useRef(null);

  // Documentos
  const [documentos, setDocumentos] = useState([]);
  const [tipoSubida, setTipoSubida] = useState("cedula");
  const [archivo, setArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  // Títulos académicos (formulario)
  const [titulos, setTitulos] = useState([]);
  const [tituloForm, setTituloForm] = useState({ institucion: "", programa: "", nivel: "pregrado", anio: "" });
  const [tituloArchivo, setTituloArchivo] = useState(null);
  const [guardandoTitulo, setGuardandoTitulo] = useState(false);

  // Referencias personales (formulario, máx. 2)
  const [referencias, setReferencias] = useState([]);
  const [refMax, setRefMax] = useState(2);
  const [refForm, setRefForm] = useState({ nombre: "", telefono: "", relacion: "", email: "" });
  const [guardandoRef, setGuardandoRef] = useState(false);

  // QR / pase temporal
  const [qr, setQr] = useState(null); // { url, qr_base64, expires_at }
  const [segundos, setSegundos] = useState(0);

  const baseCompleta = estado?.base_completa;
  const consultaHabilitada = estado?.consulta_habilitada;
  const consultaUsada = estado?.consulta_usada;

  // --------------------------------------------------------------- carga inicial
  const cargarEstado = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/wallet/estado/`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) setEstado(data);
      else setToast({ type: "error", message: data.error || "No se pudo cargar tu Wallet." });
    } catch {
      setToast({ type: "error", message: "Error de conexión al cargar tu Wallet." });
    }
  }, []);

  const cargarResultado = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/wallet/resultado/`, { headers: authHeaders() });
      if (res.status === 404) return null;
      const data = await res.json();
      if (res.ok) {
        setResultado(data);
        return data;
      }
    } catch {
      /* silencioso durante polling */
    }
    return null;
  }, []);

  const cargarDocumentos = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/wallet/documentos/`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) setDocumentos(data.documentos || []);
    } catch {
      /* silencioso */
    }
  }, []);

  const cargarTitulos = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/wallet/titulos/`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) setTitulos(data.titulos || []);
    } catch {
      /* silencioso */
    }
  }, []);

  const cargarReferencias = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/wallet/referencias/`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) {
        setReferencias(data.referencias || []);
        if (data.max) setRefMax(data.max);
      }
    } catch {
      /* silencioso */
    }
  }, []);

  useEffect(() => {
    cargarEstado();
    cargarDocumentos();
    cargarTitulos();
    cargarReferencias();
  }, [cargarEstado, cargarDocumentos, cargarTitulos, cargarReferencias]);

  // Al saber que ya hay consulta, cargar su resultado y hacer polling si sigue en curso.
  useEffect(() => {
    if (!estado?.consulta) return undefined;
    let activo = true;

    const tick = async () => {
      const data = await cargarResultado();
      if (!activo) return;
      if (data && !data.completada) {
        pollRef.current = setTimeout(tick, 5000);
      }
    };
    tick();

    return () => {
      activo = false;
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [estado?.consulta, cargarResultado]);

  // --------------------------------------------------------------- acciones
  const guardarBase = async (e) => {
    e.preventDefault();
    if (!form.documento.trim())
      return setToast({ type: "error", message: "Ingresa tu número de documento." });
    if (!form.fecha_expedicion)
      return setToast({ type: "error", message: "Ingresa la fecha de expedición." });
    if (!form.nombre_completo.trim())
      return setToast({ type: "error", message: "Ingresa tus nombres completos." });

    setGuardandoBase(true);
    try {
      const res = await fetch(`${API_URL}/api/wallet/base/`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({ type: "error", message: data.error || "No se pudieron guardar tus datos." });
        return;
      }
      setEstado(data);
      setToast({ type: "success", message: "Datos guardados. Ya puedes consultar." });
    } catch {
      setToast({ type: "error", message: "Error al guardar tus datos." });
    } finally {
      setGuardandoBase(false);
    }
  };

  const iniciarConsulta = async () => {
    setConsultando(true);
    try {
      const res = await fetch(`${API_URL}/api/wallet/consultar/`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({ type: "error", message: data.error || "No se pudo iniciar la consulta." });
        return;
      }
      setToast({ type: "success", message: "Consulta en proceso. Puede tardar unos minutos." });
      await cargarEstado(); // dispara el efecto de polling
    } catch {
      setToast({ type: "error", message: "Error al iniciar la consulta." });
    } finally {
      setConsultando(false);
    }
  };

  const descargarPDF = async () => {
    if (!resultado?.consulta_id) return;
    try {
      const res = await fetch(`${API_URL}/api/wallet/pdf/${resultado.consulta_id}/`, {
        headers: authHeaders(),
      });
      if (!res.ok) {
        setToast({ type: "error", message: "No se pudo generar el PDF." });
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `econfia-wallet-antecedentes-${resultado.consulta_id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setToast({ type: "error", message: "Error al descargar el PDF." });
    }
  };

  const subirDocumento = async (e) => {
    e.preventDefault();
    if (!archivo) return setToast({ type: "error", message: "Selecciona un archivo." });

    const fd = new FormData();
    fd.append("tipo", tipoSubida);
    fd.append("archivo", archivo);

    setSubiendo(true);
    try {
      const res = await fetch(`${API_URL}/api/wallet/documentos/`, {
        method: "POST",
        headers: authHeaders(),
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({ type: "error", message: data.error || "No se pudo subir el documento." });
        return;
      }
      setArchivo(null);
      e.target.reset();
      setToast({ type: "success", message: "Documento subido." });
      cargarDocumentos();
    } catch {
      setToast({ type: "error", message: "Error al subir el documento." });
    } finally {
      setSubiendo(false);
    }
  };

  const agregarTitulo = async (e) => {
    e.preventDefault();
    if (!tituloForm.institucion.trim() || !tituloForm.programa.trim())
      return setToast({ type: "error", message: "Institución y programa/título son obligatorios." });
    const fd = new FormData();
    fd.append("institucion", tituloForm.institucion);
    fd.append("programa", tituloForm.programa);
    fd.append("nivel", tituloForm.nivel);
    if (tituloForm.anio) fd.append("anio", tituloForm.anio);
    if (tituloArchivo) fd.append("archivo", tituloArchivo);
    setGuardandoTitulo(true);
    try {
      const res = await fetch(`${API_URL}/api/wallet/titulos/`, { method: "POST", headers: authHeaders(), body: fd });
      const data = await res.json();
      if (!res.ok) return setToast({ type: "error", message: data.error || "No se pudo registrar el título." });
      setTituloForm({ institucion: "", programa: "", nivel: "pregrado", anio: "" });
      setTituloArchivo(null);
      e.target.reset();
      setToast({ type: "success", message: "Título registrado." });
      cargarTitulos();
    } catch {
      setToast({ type: "error", message: "Error al registrar el título." });
    } finally {
      setGuardandoTitulo(false);
    }
  };

  const eliminarTitulo = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/wallet/titulos/${id}/`, { method: "DELETE", headers: authHeaders() });
      if (res.ok || res.status === 204) cargarTitulos();
    } catch {
      /* silencioso */
    }
  };

  const agregarReferencia = async (e) => {
    e.preventDefault();
    if (!refForm.nombre.trim() || !refForm.telefono.trim())
      return setToast({ type: "error", message: "Nombre y teléfono son obligatorios." });
    setGuardandoRef(true);
    try {
      const res = await fetch(`${API_URL}/api/wallet/referencias/`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(refForm),
      });
      const data = await res.json();
      if (!res.ok) return setToast({ type: "error", message: data.error || "No se pudo registrar la referencia." });
      setRefForm({ nombre: "", telefono: "", relacion: "", email: "" });
      setToast({ type: "success", message: "Referencia registrada." });
      cargarReferencias();
    } catch {
      setToast({ type: "error", message: "Error al registrar la referencia." });
    } finally {
      setGuardandoRef(false);
    }
  };

  const eliminarReferencia = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/wallet/referencias/${id}/`, { method: "DELETE", headers: authHeaders() });
      if (res.ok || res.status === 204) cargarReferencias();
    } catch {
      /* silencioso */
    }
  };

  // Cuenta regresiva del QR
  useEffect(() => {
    if (!qr) return undefined;
    const calc = () => Math.max(0, Math.round((new Date(qr.expires_at).getTime() - Date.now()) / 1000));
    setSegundos(calc());
    const id = setInterval(() => {
      const s = calc();
      setSegundos(s);
      if (s <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [qr]);

  const compartir = async () => {
    try {
      const res = await fetch(`${API_URL}/api/wallet/compartir/`, {
        method: "POST",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({ type: "error", message: data.error || "No se pudo generar el QR." });
        return;
      }
      setQr(data);
    } catch {
      setToast({ type: "error", message: "Error al generar el QR." });
    }
  };

  const eliminarDocumento = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/wallet/documentos/${id}/`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (res.ok) {
        setDocumentos((prev) => prev.filter((d) => d.id !== id));
      } else {
        setToast({ type: "error", message: "No se pudo eliminar el documento." });
      }
    } catch {
      setToast({ type: "error", message: "Error al eliminar el documento." });
    }
  };

  // --------------------------------------------------------------- render
  return (
    <section className="relative min-h-screen pt-24 pb-32 px-4">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Encabezado */}
        <header className="text-center md:text-left">
          <div className="inline-flex px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 mb-3 items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-emerald-300 text-xs font-medium">Tu billetera documental</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-content leading-tight tracking-tight">
            econfia<span className="text-emerald-400">Wallet</span>
          </h1>
          <p className="text-sm text-muted mt-2 max-w-2xl">
            Guarda tus documentos y consulta tus antecedentes en listas restrictivas. Completa tus
            datos una sola vez y obtén tu reporte consolidado en PDF.
          </p>
          {baseCompleta && (
            <button onClick={compartir}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 3h3m-3 3h6m0-6v.01M17 14h3" />
              </svg>
              Compartir con QR temporal
            </button>
          )}
        </header>

        {/* ================= ZONA A: datos base ================= */}
        <div className="bg-gradient-to-br from-surface/95 via-surface-2/80 to-surface/95 border border-line/15 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <StepDot n={1} done={baseCompleta} />
            <div>
              <h2 className="text-content font-bold">Tus datos</h2>
              <p className="text-muted text-xs">Documento, fecha de expedición y nombres completos.</p>
            </div>
          </div>

          {baseCompleta ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Campo label="Nombre" value={`${estado?.candidato?.nombre || ""} ${estado?.candidato?.apellido || ""}`} />
              <Campo label="Documento" value={`${estado?.candidato?.tipo_doc || ""} ${estado?.candidato?.cedula || ""}`} />
              <Campo label="Fecha de expedición" value={estado?.candidato?.fecha_expedicion} />
            </div>
          ) : (
            <form onSubmit={guardarBase} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Nombres completos *" value={form.nombre_completo}
                onChange={(v) => setForm({ ...form, nombre_completo: v })} placeholder="Juan Andrés Pérez Gómez" full />
              <Select label="Tipo de documento *" value={form.tipo_doc}
                onChange={(v) => setForm({ ...form, tipo_doc: v })} options={TIPO_DOC_OPCIONES} />
              <Input label="Número de documento *" value={form.documento}
                onChange={(v) => setForm({ ...form, documento: v })} placeholder="1002600636" />
              <Input label="Fecha de expedición *" type="date" value={form.fecha_expedicion}
                onChange={(v) => setForm({ ...form, fecha_expedicion: v })} />
              <Input label="Fecha de nacimiento" type="date" value={form.fecha_nacimiento}
                onChange={(v) => setForm({ ...form, fecha_nacimiento: v })} />
              <Input label="Lugar de nacimiento" value={form.lugar_nacimiento}
                onChange={(v) => setForm({ ...form, lugar_nacimiento: v })} placeholder="Bogotá D.C." />
              <div className="sm:col-span-2">
                <button type="submit" disabled={guardandoBase}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors disabled:opacity-50">
                  {guardandoBase ? "Guardando…" : "Guardar y habilitar consulta"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ================= ZONA B: consulta única ================= */}
        <div className="bg-gradient-to-br from-surface/95 via-surface-2/80 to-surface/95 border border-line/15 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <StepDot n={2} done={consultaUsada} />
            <div>
              <h2 className="text-content font-bold">Consulta de antecedentes</h2>
              <p className="text-muted text-xs">Policía, Procuraduría, Contraloría y Personería · una sola vez.</p>
            </div>
          </div>

          {!consultaUsada && (
            <button onClick={iniciarConsulta} disabled={!consultaHabilitada || consultando}
              className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {consultando ? "Iniciando…" : "Consultar mis antecedentes"}
            </button>
          )}
          {!consultaHabilitada && !consultaUsada && (
            <p className="text-muted text-xs mt-2">Primero completa tus datos para habilitar la consulta.</p>
          )}

          {resultado && (
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${badgeClasses(resultado.estado)}`}>
                  {resultado.completada ? "Consulta completada" : "Procesando…"}
                </span>
                {resultado.completada && (
                  <button onClick={descargarPDF}
                    className="px-4 py-2 rounded-lg border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 text-xs font-semibold transition-colors">
                    Descargar PDF
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {resultado.resultados?.map((r) => (
                  <div key={r.fuente} className="flex items-center justify-between gap-3 rounded-xl bg-surface-2/50 border border-line/10 px-4 py-3">
                    <div>
                      <p className="text-content text-sm font-semibold">{r.label}</p>
                      <p className="text-muted text-[11px]">{r.mensaje || (resultado.completada ? "—" : "En proceso")}</p>
                    </div>
                    <span className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badgeClasses(r.estado)}`}>
                      {r.estado}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ================= ZONA C: documentos ================= */}
        <div className="bg-gradient-to-br from-surface/95 via-surface-2/80 to-surface/95 border border-line/15 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <StepDot n={3} done={documentos.length > 0} />
            <div>
              <h2 className="text-content font-bold">Mis documentos</h2>
              <p className="text-muted text-xs">Sube tu cédula, hoja de vida, referencias o certificaciones. La cédula se verifica automáticamente.</p>
            </div>
          </div>

          <form onSubmit={subirDocumento} className="flex flex-col sm:flex-row sm:items-end gap-3 mb-5">
            <Select label="Tipo" value={tipoSubida} onChange={setTipoSubida} options={TIPO_DOCUMENTO_SUBIDA} />
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs font-semibold text-content/80">Archivo (PDF o imagen, máx 10 MB)</label>
              <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                className="text-xs text-content file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-emerald-500 file:text-white file:text-xs file:font-semibold hover:file:bg-emerald-400 file:cursor-pointer" />
            </div>
            <button type="submit" disabled={subiendo}
              className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors disabled:opacity-50">
              {subiendo ? "Subiendo…" : "Subir"}
            </button>
          </form>

          {documentos.length === 0 ? (
            <p className="text-muted text-xs">Aún no has subido documentos.</p>
          ) : (
            <ul className="space-y-2">
              {documentos.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 rounded-xl bg-surface-2/50 border border-line/10 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-content text-sm font-semibold truncate">{d.tipo_label}</p>
                    <a href={d.archivo_url} target="_blank" rel="noreferrer"
                      className="text-emerald-300 hover:text-emerald-200 text-[11px] underline underline-offset-2 truncate block">
                      {d.nombre_original}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badgeClasses(d.estado_verificacion)}`}>
                      {d.estado_label}
                    </span>
                    <button onClick={() => eliminarDocumento(d.id)}
                      className="text-muted hover:text-red-400 transition-colors" title="Eliminar">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ================= ZONA D: títulos académicos ================= */}
        <div className="bg-gradient-to-br from-surface/95 via-surface-2/80 to-surface/95 border border-line/15 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <StepDot n={4} done={titulos.length > 0} />
            <div>
              <h2 className="text-content font-bold">Títulos académicos</h2>
              <p className="text-muted text-xs">Registra tus estudios (institución, programa, nivel y año). El diploma es opcional.</p>
            </div>
          </div>

          <form onSubmit={agregarTitulo} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            <WField label="Institución *" value={tituloForm.institucion}
              onChange={(v) => setTituloForm({ ...tituloForm, institucion: v })} placeholder="Universidad Nacional…" />
            <WField label="Programa / Título *" value={tituloForm.programa}
              onChange={(v) => setTituloForm({ ...tituloForm, programa: v })} placeholder="Ingeniería de Sistemas" />
            <Select label="Nivel" value={tituloForm.nivel}
              onChange={(v) => setTituloForm({ ...tituloForm, nivel: v })} options={NIVEL_OPCIONES} />
            <WField label="Año" type="number" value={tituloForm.anio}
              onChange={(v) => setTituloForm({ ...tituloForm, anio: v })} placeholder="2020" />
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-xs font-semibold text-content/80">Diploma (PDF o imagen, opcional)</label>
              <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={(e) => setTituloArchivo(e.target.files?.[0] || null)}
                className="text-xs text-content file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-emerald-500 file:text-white file:text-xs file:font-semibold hover:file:bg-emerald-400 file:cursor-pointer" />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" disabled={guardandoTitulo}
                className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors disabled:opacity-50">
                {guardandoTitulo ? "Guardando…" : "Agregar título"}
              </button>
            </div>
          </form>

          {titulos.length === 0 ? (
            <p className="text-muted text-xs">Aún no has registrado títulos.</p>
          ) : (
            <ul className="space-y-2">
              {titulos.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 rounded-xl bg-surface-2/50 border border-line/10 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-content text-sm font-semibold truncate">{t.programa}</p>
                    <p className="text-muted text-[11px] truncate">
                      {t.institucion} · {t.nivel_label}{t.anio ? ` · ${t.anio}` : ""}
                      {t.archivo_url ? (
                        <> · <a href={t.archivo_url} target="_blank" rel="noreferrer" className="text-emerald-300 hover:text-emerald-200 underline underline-offset-2">diploma</a></>
                      ) : null}
                    </p>
                  </div>
                  <button onClick={() => eliminarTitulo(t.id)} className="text-muted hover:text-red-400 transition-colors shrink-0" title="Eliminar">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ================= ZONA E: referencias personales ================= */}
        <div className="bg-gradient-to-br from-surface/95 via-surface-2/80 to-surface/95 border border-line/15 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <StepDot n={5} done={referencias.length > 0} />
            <div>
              <h2 className="text-content font-bold">Referencias personales</h2>
              <p className="text-muted text-xs">Agrega hasta {refMax} referencias ({referencias.length}/{refMax}).</p>
            </div>
          </div>

          {referencias.length < refMax && (
            <form onSubmit={agregarReferencia} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <WField label="Nombre *" value={refForm.nombre} onChange={(v) => setRefForm({ ...refForm, nombre: v })} placeholder="Nombre completo" />
              <WField label="Teléfono *" value={refForm.telefono} onChange={(v) => setRefForm({ ...refForm, telefono: v })} placeholder="300 000 0000" />
              <WField label="Relación" value={refForm.relacion} onChange={(v) => setRefForm({ ...refForm, relacion: v })} placeholder="Jefe, colega, familiar…" />
              <WField label="Correo (opcional)" type="email" value={refForm.email} onChange={(v) => setRefForm({ ...refForm, email: v })} placeholder="correo@ejemplo.com" />
              <div className="sm:col-span-2">
                <button type="submit" disabled={guardandoRef}
                  className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors disabled:opacity-50">
                  {guardandoRef ? "Guardando…" : "Agregar referencia"}
                </button>
              </div>
            </form>
          )}

          {referencias.length === 0 ? (
            <p className="text-muted text-xs">Aún no has registrado referencias.</p>
          ) : (
            <ul className="space-y-2">
              {referencias.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 rounded-xl bg-surface-2/50 border border-line/10 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-content text-sm font-semibold truncate">{r.nombre}</p>
                    <p className="text-muted text-[11px] truncate">
                      {r.telefono}{r.relacion ? ` · ${r.relacion}` : ""}{r.email ? ` · ${r.email}` : ""}
                    </p>
                  </div>
                  <button onClick={() => eliminarReferencia(r.id)} className="text-muted hover:text-red-400 transition-colors shrink-0" title="Eliminar">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {qr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4"
          onClick={() => setQr(null)}>
          <div className="relative w-full max-w-sm bg-surface border border-line/15 rounded-2xl shadow-2xl p-6 text-center"
            onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setQr(null)} className="absolute top-3 right-3 text-muted hover:text-content">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-content font-bold text-lg">Pase temporal</h3>
            <p className="text-muted text-xs mt-1 mb-4">
              Muestra este QR. Expira automáticamente por seguridad.
            </p>

            {segundos > 0 ? (
              <>
                <div className="bg-white rounded-xl p-3 inline-block">
                  <img src={`data:image/png;base64,${qr.qr_base64}`} alt="QR" className="w-52 h-52" />
                </div>
                <div className="mt-4">
                  <span className="text-emerald-400 font-mono text-2xl font-bold tabular-nums">
                    {String(Math.floor(segundos / 60)).padStart(2, "0")}:
                    {String(segundos % 60).padStart(2, "0")}
                  </span>
                  <p className="text-muted text-[11px] mt-1">Tiempo restante</p>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <input readOnly value={qr.url}
                    className="flex-1 px-2 py-1.5 rounded-lg bg-surface-2/70 border border-line/15 text-content text-[11px] truncate" />
                  <button
                    onClick={() => { navigator.clipboard?.writeText(qr.url); setToast({ type: "success", message: "Enlace copiado." }); }}
                    className="px-3 py-1.5 rounded-lg border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 text-[11px] font-semibold">
                    Copiar
                  </button>
                </div>
              </>
            ) : (
              <div className="py-8">
                <p className="text-red-300 font-semibold">Este pase expiró.</p>
                <button onClick={compartir}
                  className="mt-4 px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold">
                  Generar uno nuevo
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ átomos UI */
function WField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-content/80">{label}</label>
      <input type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 rounded-lg bg-surface-2/70 border border-line/15 text-content text-sm placeholder:text-muted/60 focus:outline-none focus:border-emerald-500/50" />
    </div>
  );
}

function StepDot({ n, done }) {
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${
      done ? "bg-emerald-500 text-white border-emerald-400" : "bg-surface-2/70 text-muted border-line/20"
    }`}>
      {done ? "✓" : n}
    </div>
  );
}

function Campo({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wide text-muted">{label}</span>
      <span className="text-content text-sm font-semibold">{value?.trim?.() || value || "—"}</span>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text", full }) {
  return (
    <div className={`flex flex-col gap-1 ${full ? "sm:col-span-2" : ""}`}>
      <label className="text-xs font-semibold text-content/80">{label}</label>
      <input type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-surface-2/70 border border-line/15 text-content placeholder:text-muted/70 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-surface transition-all" />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-content/80">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 rounded-lg bg-surface-2/70 border border-line/15 text-content text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-surface transition-all cursor-pointer">
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-surface text-content">{o.label}</option>
        ))}
      </select>
    </div>
  );
}
