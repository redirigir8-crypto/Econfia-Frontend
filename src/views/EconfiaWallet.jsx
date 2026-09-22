import { useCallback, useEffect, useRef, useState } from "react";
import Toast from "../components/Toast";
import { useTheme } from "../context/ThemeContext";
import { MUNICIPIOS_COLOMBIA } from "../utils/municipiosColombia";
import { PROFESIONES_MUNDO } from "../utils/profesionesMundo";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const TIPO_DOC_OPCIONES = [
  { value: "CC", label: "Cédula de Ciudadanía (CC)" },
  { value: "TI", label: "Tarjeta de Identidad (TI)" },
  { value: "CE", label: "Cédula de Extranjería (CE)" },
  { value: "PA", label: "Pasaporte (PA)" },
  { value: "PPT", label: "Permiso de Protección Temporal (PPT)" },
  { value: "PEP", label: "Permiso Especial de Permanencia (PEP)" },
];

// Nombre del documento a verificar según lo que el candidato declaró en
// "Sus datos" — el flujo de verificación es el mismo (OCR + captura), pero
// referirse siempre a "cédula" confunde a quien tiene pasaporte o CE.
const NOMBRE_DOCUMENTO_POR_TIPO = {
  CE: "cédula de extranjería",
  PA: "pasaporte",
};

function nombreDocumento(tipoDoc) {
  return NOMBRE_DOCUMENTO_POR_TIPO[tipoDoc] || "cédula";
}

const TIPO_DOCUMENTO_SUBIDA = [
  { value: "hoja_vida", label: "Hoja de vida" },
  { value: "eps", label: "Certificado de afiliación EPS" },
  { value: "pension", label: "Certificado de afiliación a pensión" },
  { value: "libreta_militar", label: "Libreta militar" },
  { value: "rut", label: "RUT" },
  { value: "curso_diplomado", label: "Curso / diplomado" },
  { value: "otro", label: "Otro documento que consideres relevante" },
];

const SEXO_OPCIONES = [
  { value: "", label: "Seleccione…" },
  { value: "M", label: "Masculino" },
  { value: "F", label: "Femenino" },
  { value: "NB", label: "Prefiero no decirlo" },
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

// Consejos cada vez más específicos cuando el OCR no logra leer la cédula
// varias veces seguidas, en vez de repetir el mismo mensaje genérico
// (IDV-02 del anexo Certicámara).
function consejoOcrIlegible(intentos) {
  if (intentos <= 1) {
    return "No se pudo leer el número de documento en la foto. Intente de nuevo con buena luz y sin reflejos.";
  }
  if (intentos === 2) {
    return "Sigue sin leerse bien. Pruebe: apoye la cédula sobre una superficie plana y oscura, evite luz directa que genere brillo, y acerque un poco más el número de documento.";
  }
  return "Varios intentos sin éxito. Pruebe con luz natural (cerca de una ventana, sin sol directo), limpie la cédula si tiene polvo o rayones, y sostenga la cámara bien firme al capturar.";
}

// Mensaje del envío de código SMS, distinguiendo POR QUÉ no llegó un SMS
// real (IDV-02 del anexo Certicámara: el motivo debe ser comprensible, no
// ambiguo) — "nunca se configuró Twilio" no es lo mismo que "Twilio está
// configurado pero falló en este intento".
function mensajeEnvioSms(data) {
  if (data?.fallo_envio_real) {
    return "No se pudo enviar el SMS real en este momento (problema con el proveedor). Se generó un código de respaldo: contacte a soporte si el problema persiste.";
  }
  if (data?.simulado) {
    return "Código generado (modo de prueba: aún no hay SMS real configurado).";
  }
  return "Código enviado por SMS.";
}

export default function EconfiaWallet() {
  const { organizacion } = useTheme();
  // Certicámara (y cualquier otro cliente white-label) puede renombrar el
  // producto Wallet para sus usuarios — el resto de Econfia conserva su
  // nombre tal cual (decisión de alcance: solo Wallet cambia de nombre).
  const nombreWallet = organizacion?.nombre_wallet_efectivo || "econfiaWallet";
  const [estado, setEstado] = useState(null);
  const [toast, setToast] = useState(null);

  // Formulario base
  const [form, setForm] = useState({
    documento: "",
    tipo_doc: "CC",
    fecha_expedicion: "",
    nombre_completo: "",
    fecha_nacimiento: "",
    lugar_expedicion: "",
    email: "",
    profesion: "",
    profesion_otro: "",
    sexo: "",
    telefono: "",
    ciudad_residencia: "",
  });
  const [guardandoBase, setGuardandoBase] = useState(false);

  // Consulta única
  const [resultado, setResultado] = useState(null);
  const [consultando, setConsultando] = useState(false);
  const pollRef = useRef(null);

  // Documentos
  const [documentos, setDocumentos] = useState([]);
  const [tipoSubida, setTipoSubida] = useState("hoja_vida");
  const [archivo, setArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  // Verificación de identidad (rostro / cédula / SMS)
  const [modalVerificacion, setModalVerificacion] = useState(null); // "rostro" | "cedula" | "sms" | null
  const [confirmarRerregistroRostro, setConfirmarRerregistroRostro] = useState(false);
  const [cerrandoSesiones, setCerrandoSesiones] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [mostrarDispositivos, setMostrarDispositivos] = useState(false);
  const [dispositivos, setDispositivos] = useState([]);
  const [cargandoDispositivos, setCargandoDispositivos] = useState(false);
  const [mostrarPoliticaBiometrica, setMostrarPoliticaBiometrica] = useState(false);
  const [politicaBiometrica, setPoliticaBiometrica] = useState(null);
  const [cargandoPolitica, setCargandoPolitica] = useState(false);
  const [mostrarConsentimientos, setMostrarConsentimientos] = useState(false);
  const [consentimientos, setConsentimientos] = useState([]);
  const [cargandoConsentimientos, setCargandoConsentimientos] = useState(false);

  const abrirConsentimientos = async () => {
    setMostrarConsentimientos(true);
    setCargandoConsentimientos(true);
    try {
      const res = await fetch(`${API_URL}/api/wallet/identidad/consentimientos/`, { headers: authHeaders() });
      const data = await res.json().catch(() => null);
      setConsentimientos(res.ok ? (data?.consentimientos || []) : []);
    } catch {
      setConsentimientos([]);
    } finally {
      setCargandoConsentimientos(false);
    }
  };

  const abrirPoliticaBiometrica = async () => {
    setMostrarPoliticaBiometrica(true);
    if (politicaBiometrica) return;
    setCargandoPolitica(true);
    try {
      const res = await fetch(`${API_URL}/api/wallet/identidad/politica-biometrica/`);
      setPoliticaBiometrica(res.ok ? await res.json() : null);
    } catch {
      setPoliticaBiometrica(null);
    } finally {
      setCargandoPolitica(false);
    }
  };

  const abrirHistorial = async () => {
    setMostrarHistorial(true);
    setCargandoHistorial(true);
    try {
      const res = await fetch(`${API_URL}/api/wallet/identidad/historial/`, { headers: authHeaders() });
      const data = await res.json().catch(() => null);
      setHistorial(res.ok ? (data?.eventos || []) : []);
    } catch {
      setHistorial([]);
    } finally {
      setCargandoHistorial(false);
    }
  };

  const [exportandoHistorial, setExportandoHistorial] = useState(false);

  const exportarHistorialPdf = async () => {
    setExportandoHistorial(true);
    try {
      const res = await fetch(`${API_URL}/api/wallet/identidad/historial/pdf/`, { headers: authHeaders() });
      if (!res.ok) {
        setToast({ type: "error", message: "No se pudo generar el PDF." });
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "econfia-wallet-historial.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setToast({ type: "error", message: "Error al generar el PDF." });
    } finally {
      setExportandoHistorial(false);
    }
  };

  const [revocandoPropio, setRevocandoPropio] = useState("");

  const revocarPropio = async (metodo) => {
    const etiqueta = { rostro: "su rostro", cedula: "su cédula verificada", telefono: "su teléfono verificado" }[metodo];
    if (!window.confirm(`¿Revocar ${etiqueta}? Deberá volver a verificarlo.`)) return;
    setRevocandoPropio(metodo);
    try {
      const res = await fetch(`${API_URL}/api/wallet/identidad/autorrevocar/`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ metodo }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setToast({ type: "error", message: data?.error || "No se pudo revocar." });
        return;
      }
      setToast({ type: "success", message: `Se revocó ${etiqueta} correctamente.` });
      cargarEstado();
      cargarDocumentos();
      abrirHistorial();
    } catch {
      setToast({ type: "error", message: "Error de conexión al revocar." });
    } finally {
      setRevocandoPropio("");
    }
  };

  const [mostrarEliminarDatos, setMostrarEliminarDatos] = useState(false);
  const [eliminandoDatos, setEliminandoDatos] = useState(false);

  const eliminarTodosMisDatos = async (password) => {
    setEliminandoDatos(true);
    try {
      const res = await fetch(`${API_URL}/api/wallet/identidad/eliminar-datos/`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setToast({ type: "error", message: data?.error || "No se pudo eliminar sus datos." });
        return false;
      }
      setToast({ type: "success", message: `Se eliminaron todos sus datos de ${nombreWallet}.` });
      setMostrarEliminarDatos(false);
      cargarEstado();
      cargarDocumentos();
      return true;
    } catch {
      setToast({ type: "error", message: "Error de conexión al eliminar sus datos." });
      return false;
    } finally {
      setEliminandoDatos(false);
    }
  };

  const abrirDispositivos = async () => {
    setMostrarDispositivos(true);
    setCargandoDispositivos(true);
    try {
      const res = await fetch(`${API_URL}/api/wallet/identidad/dispositivos/`, { headers: authHeaders() });
      const data = await res.json().catch(() => null);
      setDispositivos(res.ok ? (data?.dispositivos || []) : []);
    } catch {
      setDispositivos([]);
    } finally {
      setCargandoDispositivos(false);
    }
  };

  const cerrarSesionesEnTodosLosDispositivos = async () => {
    if (!window.confirm(
      "Esto cerrará la sesión en cualquier otro dispositivo donde haya iniciado sesión con su cuenta. Este dispositivo seguirá funcionando normalmente. ¿Continuar?"
    )) return;
    setCerrandoSesiones(true);
    try {
      const res = await fetch(`${API_URL}/api/wallet/identidad/cerrar-sesiones/`, {
        method: "POST",
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setToast({ type: "error", message: data?.error || "No se pudo cerrar la sesión en los demás dispositivos." });
        return;
      }
      localStorage.setItem("token", data.token);
      setToast({ type: "success", message: "Se cerró la sesión en todos los demás dispositivos." });
    } catch {
      setToast({ type: "error", message: "Error de conexión al cerrar las sesiones." });
    } finally {
      setCerrandoSesiones(false);
    }
  };

  // Certificaciones laborales (formulario + archivo opcional)
  const [certificaciones, setCertificaciones] = useState([]);
  const [certForm, setCertForm] = useState({ empresa: "", cargo: "", fecha_inicio: "", fecha_fin: "", actual: false });
  const [certArchivo, setCertArchivo] = useState(null);
  const [guardandoCert, setGuardandoCert] = useState(false);

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
  const [mostrarSelectorCompartir, setMostrarSelectorCompartir] = useState(false);
  const [atributosCompartir, setAtributosCompartir] = useState(["persona", "documentos", "antecedentes"]);

  const baseCompleta = estado?.base_completa;
  const consultaHabilitada = estado?.consulta_habilitada;
  const consultaUsada = estado?.consulta_usada;

  // Las certificaciones viven en su propia sección (modelo aparte); "Mis
  // documentos" excluye cualquier documento legado de tipo certificación.
  const otrosDocumentos = documentos.filter((d) => d.tipo !== "certificacion");

  // --------------------------------------------------------------- carga inicial
  const cargarEstado = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/wallet/estado/`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) setEstado(data);
      else setToast({ type: "error", message: data.error || "No se pudo cargar su Wallet." });
    } catch {
      setToast({ type: "error", message: "Error de conexión al cargar su Wallet." });
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

  const cargarCertificaciones = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/wallet/certificaciones/`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) setCertificaciones(data.certificaciones || []);
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
    cargarCertificaciones();
  }, [cargarEstado, cargarDocumentos, cargarTitulos, cargarReferencias, cargarCertificaciones]);

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
      return setToast({ type: "error", message: "Ingrese su número de documento." });
    if (!form.fecha_expedicion)
      return setToast({ type: "error", message: "Ingrese la fecha de expedición." });
    if (!form.nombre_completo.trim())
      return setToast({ type: "error", message: "Ingrese sus nombres completos." });
    if (form.profesion === "Otro" && !form.profesion_otro.trim())
      return setToast({ type: "error", message: "Especifique su profesión." });

    const { profesion_otro, ...formBase } = form;
    const payload = {
      ...formBase,
      profesion: form.profesion === "Otro" ? form.profesion_otro.trim() : form.profesion,
    };

    setGuardandoBase(true);
    try {
      const res = await fetch(`${API_URL}/api/wallet/base/`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({ type: "error", message: data.error || "No se pudieron guardar sus datos." });
        return;
      }
      setEstado(data);
      setToast({ type: "success", message: "Datos guardados. Ya puede consultar." });
    } catch {
      setToast({ type: "error", message: "Error al guardar sus datos." });
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

  const agregarCertificacion = async (e) => {
    e.preventDefault();
    if (!certForm.empresa.trim() || !certForm.cargo.trim())
      return setToast({ type: "error", message: "Empresa y cargo son obligatorios." });

    const fd = new FormData();
    fd.append("empresa", certForm.empresa);
    fd.append("cargo", certForm.cargo);
    if (certForm.fecha_inicio) fd.append("fecha_inicio", certForm.fecha_inicio);
    fd.append("actual", certForm.actual ? "true" : "false");
    if (!certForm.actual && certForm.fecha_fin) fd.append("fecha_fin", certForm.fecha_fin);
    if (certArchivo) fd.append("archivo", certArchivo);

    setGuardandoCert(true);
    try {
      const res = await fetch(`${API_URL}/api/wallet/certificaciones/`, {
        method: "POST",
        headers: authHeaders(),
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({ type: "error", message: data.error || "No se pudo registrar la certificación." });
        return;
      }
      setCertForm({ empresa: "", cargo: "", fecha_inicio: "", fecha_fin: "", actual: false });
      setCertArchivo(null);
      e.target.reset();
      setToast({ type: "success", message: "Certificación registrada." });
      cargarCertificaciones();
    } catch {
      setToast({ type: "error", message: "Error al registrar la certificación." });
    } finally {
      setGuardandoCert(false);
    }
  };

  const eliminarCertificacion = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/wallet/certificaciones/${id}/`, { method: "DELETE", headers: authHeaders() });
      if (res.ok || res.status === 204) cargarCertificaciones();
    } catch {
      /* silencioso */
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

  const compartir = async (atributos = atributosCompartir) => {
    if (!atributos || atributos.length === 0) {
      setToast({ type: "error", message: "Elige al menos un dato para compartir." });
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/wallet/compartir/`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ atributos }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({ type: "error", message: data.error || "No se pudo generar el QR." });
        return;
      }
      setMostrarSelectorCompartir(false);
      setQr(data);
    } catch {
      setToast({ type: "error", message: "Error al generar el QR." });
    }
  };

  const ATRIBUTOS_COMPARTIR_INFO = [
    { key: "persona", label: "Datos personales", detalle: "Nombre y número de documento" },
    { key: "documentos", label: "Documentos", detalle: "Cédula subida a su Wallet" },
    { key: "antecedentes", label: "Antecedentes", detalle: "Resultado de sus consultas en listas restrictivas" },
  ];

  const toggleAtributoCompartir = (key) => {
    setAtributosCompartir((prev) =>
      prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key]
    );
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
        {/* Encabezado — hero */}
        <header className="relative overflow-hidden rounded-2xl border border-line/15 bg-gradient-to-br from-surface/95 via-surface-2/70 to-surface/95 px-6 py-6 md:px-8 md:py-7 shadow-xl">
          {/* Glow decorativo */}
          <div className="pointer-events-none absolute -top-24 -right-20 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 w-64 h-64 rounded-full bg-emerald-400/[0.06] blur-3xl" />

          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            {/* Izquierda: identidad del módulo */}
            <div className="max-w-2xl">
              <div className="inline-flex px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 mb-3 items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-emerald-300 text-xs font-medium">Tu billetera documental</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden sm:flex w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 items-center justify-center shrink-0 shadow-inner">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M21 12V7H5a2 2 0 010-4h14v4M3 5v14a2 2 0 002 2h16v-5M18 12a2 2 0 000 4h4v-4h-4z" />
                  </svg>
                </span>
                <h1 className="text-3xl md:text-4xl font-black text-content leading-none tracking-tight">
                  {organizacion?.nombre_wallet ? (
                    nombreWallet
                  ) : (
                    <>econfia<span className="text-emerald-400">Wallet</span></>
                  )}
                </h1>
              </div>
              <p className="text-sm text-muted mt-3 leading-relaxed">
                Guarde sus documentos y consulte sus antecedentes en listas restrictivas. Complete
                sus datos una sola vez y obtenga su reporte consolidado en PDF.
              </p>
            </div>

            {/* Derecha: acción principal (QR) */}
            {baseCompleta && (
              <div className="shrink-0">
                <button onClick={() => setMostrarSelectorCompartir(true)}
                  className="group inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:-translate-y-0.5">
                  <span className="flex w-9 h-9 rounded-lg bg-white/15 items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 3h3m-3 3h6m0-6v.01M17 14h3" />
                    </svg>
                  </span>
                  <span className="flex flex-col items-start leading-tight">
                    <span className="text-sm font-semibold">Compartir con QR</span>
                    <span className="text-[10px] font-normal text-white/80">Pase temporal seguro</span>
                  </span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* ================= ZONA A: datos base ================= */}
        <div className="bg-gradient-to-br from-surface/95 via-surface-2/80 to-surface/95 border border-line/15 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <StepDot n={1} done={baseCompleta} />
            <div>
              <h2 className="text-content font-bold">Sus datos</h2>
              <p className="text-muted text-xs">Documento, fecha de expedición y nombres completos.</p>
            </div>
          </div>

          {baseCompleta ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Campo label="Nombre" value={`${estado?.candidato?.nombre || ""} ${estado?.candidato?.apellido || ""}`} />
              <Campo label="Documento" value={`${estado?.candidato?.tipo_doc || ""} ${estado?.candidato?.cedula || ""}`} />
              <Campo label="Fecha de expedición" value={estado?.candidato?.fecha_expedicion} />
              <Campo label="Correo electrónico" value={estado?.candidato?.email} />
              <Campo label="Teléfono" value={estado?.candidato?.telefono} />
              <Campo label="Ciudad de residencia" value={estado?.candidato?.ciudad_residencia} />
              <Campo label="Profesión" value={estado?.candidato?.profesion} />
              <Campo label="Sexo" value={estado?.candidato?.sexo} />
              <Campo label="Lugar de expedición" value={estado?.candidato?.lugar_expedicion} />
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
              <Input label="Lugar de expedición" value={form.lugar_expedicion}
                onChange={(v) => setForm({ ...form, lugar_expedicion: v })} placeholder="Bogotá D.C." />
              <Select label="Sexo" value={form.sexo}
                onChange={(v) => setForm({ ...form, sexo: v })} options={SEXO_OPCIONES} />
              <Input label="Correo electrónico" type="email" value={form.email}
                onChange={(v) => setForm({ ...form, email: v })} placeholder="correo@ejemplo.com" />
              <Input label="Teléfono / celular" value={form.telefono}
                onChange={(v) => setForm({ ...form, telefono: v })} placeholder="3001234567" />
              <Input label="Ciudad de residencia" value={form.ciudad_residencia} listId="ciudades-colombia"
                onChange={(v) => setForm({ ...form, ciudad_residencia: v })} placeholder="Bogotá D.C." />
              <datalist id="ciudades-colombia">
                {MUNICIPIOS_COLOMBIA.map((c) => <option key={c} value={c} />)}
              </datalist>
              <Input label="Profesión" value={form.profesion} listId="profesiones-mundo"
                onChange={(v) => setForm({ ...form, profesion: v, profesion_otro: "" })} placeholder="Ingeniero de sistemas" />
              <datalist id="profesiones-mundo">
                {PROFESIONES_MUNDO.map((p) => <option key={p} value={p} />)}
              </datalist>
              {form.profesion === "Otro" && (
                <Input label="Especifique cuál *" value={form.profesion_otro}
                  onChange={(v) => setForm({ ...form, profesion_otro: v })} placeholder="Ej. Apicultor" />
              )}
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
              <p className="text-muted text-xs">Policía, Procuraduría, Contraloría, Personería, Inhabilidades, Rama Judicial, Tyba y SIMIT · una sola vez.</p>
            </div>
          </div>

          {!consultaUsada && (
            <button onClick={iniciarConsulta} disabled={!consultaHabilitada || consultando}
              className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {consultando ? "Iniciando…" : "Consultar mis antecedentes"}
            </button>
          )}
          {!consultaHabilitada && !consultaUsada && (
            <p className="text-muted text-xs mt-2">Primero complete sus datos para habilitar la consulta.</p>
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
            <StepDot n={3} done={otrosDocumentos.length > 0} />
            <div>
              <h2 className="text-content font-bold">Mis documentos</h2>
              <p className="text-muted text-xs">Entre más documentos tenga cargados, más información podrán verificar las empresas sobre usted. Suba su hoja de vida, certificaciones y cualquier otro documento que considere relevante para respaldar su perfil.</p>
            </div>
          </div>

          <div className="mb-5">
            <p className="text-content text-sm font-semibold mb-2">Verificación de identidad</p>
            <p className="text-muted text-xs mb-1">Confirme su identidad con estos tres métodos. Su cédula se carga y valida aquí, no en el formulario de documentos genérico.</p>
            <button type="button" onClick={abrirPoliticaBiometrica}
              className="text-emerald-400 hover:text-emerald-300 text-[11px] underline underline-offset-2 mb-1 mr-3 inline-block">
              ¿Qué pasa con la foto de mi rostro?
            </button>
            <button type="button" onClick={abrirConsentimientos}
              className="text-emerald-400 hover:text-emerald-300 text-[11px] underline underline-offset-2 mb-3 inline-block">
              Ver mis autorizaciones otorgadas
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button type="button" onClick={() => {
                  if (estado?.rostro_registrado) {
                    setConfirmarRerregistroRostro(true);
                    return;
                  }
                  setModalVerificacion("rostro");
                }}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                  estado?.rostro_registrado
                    ? "bg-emerald-500/10 border-emerald-500/40"
                    : "bg-surface-2/50 border-line/10 hover:border-emerald-500/40"
                }`}>
                <span className="text-2xl">{estado?.rostro_registrado ? "✅" : "🙂"}</span>
                <span>
                  <span className="block text-content text-sm font-semibold">
                    {estado?.rostro_registrado ? "Cara registrada" : "Verificar rostro"}
                  </span>
                  <span className="block text-muted text-[11px]">
                    {estado?.rostro_registrado ? "Toque para volver a registrar" : "Registro facial (Face ID)"}
                  </span>
                </span>
              </button>
              <button type="button" onClick={() => setModalVerificacion("cedula")}
                className="flex items-center gap-3 rounded-xl bg-surface-2/50 border border-line/10 hover:border-emerald-500/40 px-4 py-3 text-left transition-colors">
                <span className="text-2xl">🪪</span>
                <span>
                  <span className="block text-content text-sm font-semibold capitalize">
                    Verificar {nombreDocumento(estado?.candidato?.tipo_doc)}
                  </span>
                  <span className="block text-muted text-[11px]">Frente y reverso</span>
                </span>
              </button>
              <button type="button" onClick={() => setModalVerificacion("sms")}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                  estado?.telefono_verificado
                    ? "bg-emerald-500/10 border-emerald-500/40"
                    : "bg-surface-2/50 border-line/10 hover:border-emerald-500/40"
                }`}>
                <span className="text-2xl">{estado?.telefono_verificado ? "✅" : "💬"}</span>
                <span>
                  <span className="block text-content text-sm font-semibold">
                    {estado?.telefono_verificado ? "Celular verificado" : "Verificar por SMS"}
                  </span>
                  <span className="block text-muted text-[11px]">Código enviado a su celular</span>
                </span>
              </button>
            </div>

            <button type="button" onClick={abrirDispositivos}
              className="mt-3 w-full flex items-center gap-3 rounded-xl border border-line/10 bg-surface-2/50 hover:border-emerald-500/40 px-4 py-3 text-left transition-colors">
              <span className="text-xl">📱</span>
              <span className="flex-1">
                <span className="block text-content text-sm font-semibold">Dispositivos con sesión activa</span>
                <span className="block text-muted text-[11px]">Vea desde dónde han iniciado sesión en su cuenta</span>
              </span>
            </button>

            <button type="button" onClick={cerrarSesionesEnTodosLosDispositivos} disabled={cerrandoSesiones}
              className="mt-3 w-full flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 px-4 py-3 text-left transition-colors disabled:opacity-50">
              <span className="text-xl">🔒</span>
              <span className="flex-1">
                <span className="block text-red-300 text-sm font-semibold">¿Perdió su celular?</span>
                <span className="block text-muted text-[11px]">Cerrar sesión en todos los demás dispositivos</span>
              </span>
              {cerrandoSesiones && <Spinner tono="rojo" />}
            </button>

            <button type="button" onClick={abrirHistorial}
              className="mt-2 w-full flex items-center gap-3 rounded-xl border border-line/10 bg-surface-2/50 hover:border-emerald-500/40 px-4 py-3 text-left transition-colors">
              <span className="text-xl">🕘</span>
              <span className="flex-1">
                <span className="block text-content text-sm font-semibold">Ver historial de identidad</span>
                <span className="block text-muted text-[11px]">Registros, verificaciones y revocaciones de su cuenta</span>
              </span>
            </button>

            <button type="button" onClick={() => setMostrarEliminarDatos(true)}
              className="mt-4 w-full flex items-center gap-3 rounded-xl border border-red-500/40 bg-red-500/10 hover:bg-red-500/15 px-4 py-3 text-left transition-colors">
              <span className="text-xl">🗑️</span>
              <span className="flex-1">
                <span className="block text-red-300 text-sm font-semibold">Eliminar todos mis datos de Wallet</span>
                <span className="block text-muted text-[11px]">Rostro, documentos, títulos, referencias y consentimientos. No se puede deshacer.</span>
              </span>
            </button>
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

          {otrosDocumentos.length === 0 ? (
            <p className="text-muted text-xs">Aún no has subido documentos.</p>
          ) : (
            <ul className="space-y-2">
              {otrosDocumentos.map((d) => (
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

        {/* ================= ZONA C2: certificaciones laborales ================= */}
        <div className="bg-gradient-to-br from-surface/95 via-surface-2/80 to-surface/95 border border-line/15 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <StepDot n={4} done={certificaciones.length > 0} />
            <div>
              <h2 className="text-content font-bold">Certificaciones laborales</h2>
              <p className="text-muted text-xs">Registre su experiencia laboral (empresa, cargo y fechas). Adjuntar la constancia es opcional.</p>
            </div>
          </div>

          <form onSubmit={agregarCertificacion} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            <WField label="Empresa *" value={certForm.empresa}
              onChange={(v) => setCertForm({ ...certForm, empresa: v })} placeholder="Nombre de la empresa" />
            <WField label="Cargo *" value={certForm.cargo}
              onChange={(v) => setCertForm({ ...certForm, cargo: v })} placeholder="Ej. Analista de sistemas" />
            <WField label="Fecha de inicio" type="date" value={certForm.fecha_inicio}
              onChange={(v) => setCertForm({ ...certForm, fecha_inicio: v })} />
            <WField label="Fecha de fin" type="date" value={certForm.fecha_fin}
              onChange={(v) => setCertForm({ ...certForm, fecha_fin: v })} disabled={certForm.actual} />
            <label className="flex items-center gap-2 text-xs text-content/85 cursor-pointer sm:col-span-2">
              <input type="checkbox" checked={certForm.actual}
                onChange={(e) => setCertForm({ ...certForm, actual: e.target.checked, fecha_fin: e.target.checked ? "" : certForm.fecha_fin })}
                className="accent-emerald-500 w-4 h-4 cursor-pointer" />
              Trabajo aquí actualmente
            </label>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-xs font-semibold text-content/80">Constancia laboral (PDF o imagen, opcional)</label>
              <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={(e) => setCertArchivo(e.target.files?.[0] || null)}
                className="text-xs text-content file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-emerald-500 file:text-white file:text-xs file:font-semibold hover:file:bg-emerald-400 file:cursor-pointer" />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" disabled={guardandoCert}
                className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors disabled:opacity-50">
                {guardandoCert ? "Guardando…" : "Agregar certificación"}
              </button>
            </div>
          </form>

          {certificaciones.length === 0 ? (
            <p className="text-muted text-xs">Aún no has registrado certificaciones.</p>
          ) : (
            <ul className="space-y-2">
              {certificaciones.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 rounded-xl bg-surface-2/50 border border-line/10 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-content text-sm font-semibold truncate">{c.cargo} · {c.empresa}</p>
                    <p className="text-muted text-[11px] truncate">
                      {c.fecha_inicio || "—"} → {c.actual ? "Actual" : (c.fecha_fin || "—")}
                      {c.archivo_url ? (
                        <> · <a href={c.archivo_url} target="_blank" rel="noreferrer" className="text-emerald-300 hover:text-emerald-200 underline underline-offset-2">constancia</a></>
                      ) : null}
                    </p>
                  </div>
                  <button onClick={() => eliminarCertificacion(c.id)}
                    className="text-muted hover:text-red-400 transition-colors shrink-0" title="Eliminar">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ================= ZONA D: títulos académicos ================= */}
        <div className="bg-gradient-to-br from-surface/95 via-surface-2/80 to-surface/95 border border-line/15 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <StepDot n={5} done={titulos.length > 0} />
            <div>
              <h2 className="text-content font-bold">Títulos académicos</h2>
              <p className="text-muted text-xs">Registre sus estudios (institución, programa, nivel y año). El diploma es opcional.</p>
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
            <StepDot n={6} done={referencias.length > 0} />
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
      {mostrarSelectorCompartir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4"
          onClick={() => setMostrarSelectorCompartir(false)}>
          <div className="relative w-full max-w-sm bg-surface border border-line/15 rounded-2xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setMostrarSelectorCompartir(false)} className="absolute top-3 right-3 text-muted hover:text-content">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-content font-bold text-lg">¿Qué desea compartir?</h3>
            <p className="text-muted text-xs mt-1 mb-4">
              Elija solo los datos que la persona que escanee el QR podrá ver. Puede compartir todo o solo una parte.
            </p>
            <div className="space-y-2">
              {ATRIBUTOS_COMPARTIR_INFO.map((a) => (
                <label key={a.key}
                  className="flex items-start gap-3 rounded-xl border border-line/10 bg-surface-2/50 hover:border-emerald-500/30 px-4 py-3 cursor-pointer transition-colors">
                  <input type="checkbox" className="mt-1 accent-emerald-500"
                    checked={atributosCompartir.includes(a.key)}
                    onChange={() => toggleAtributoCompartir(a.key)} />
                  <span>
                    <span className="block text-content text-sm font-semibold">{a.label}</span>
                    <span className="block text-muted text-[11px]">{a.detalle}</span>
                  </span>
                </label>
              ))}
            </div>
            <button onClick={() => compartir(atributosCompartir)}
              disabled={atributosCompartir.length === 0}
              className="mt-5 w-full px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors">
              Generar QR con lo seleccionado
            </button>
          </div>
        </div>
      )}
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

      {confirmarRerregistroRostro && (
        <ConfirmarRerregistroRostroModal
          onCancelar={() => setConfirmarRerregistroRostro(false)}
          onConfirmar={() => { setConfirmarRerregistroRostro(false); setModalVerificacion("rostro"); }}
        />
      )}
      {modalVerificacion === "rostro" && (
        <VerificarRostroModal
          onClose={() => setModalVerificacion(null)}
          setToast={setToast}
          onVerificado={cargarEstado}
          esReregistro={!!estado?.rostro_registrado}
          telefonoVerificado={estado?.telefono_verificado ? estado?.candidato?.telefono : null}
          onIrACedula={() => setModalVerificacion("cedula")}
        />
      )}
      {modalVerificacion === "cedula" && (
        <VerificarCedulaModal onClose={() => setModalVerificacion(null)} setToast={setToast} onVerificado={cargarDocumentos} tipoDoc={estado?.candidato?.tipo_doc} />
      )}
      {modalVerificacion === "sms" && (
        <VerificarSmsModal onClose={() => setModalVerificacion(null)} setToast={setToast} datosTelefono={form.telefono} onVerificado={cargarEstado} />
      )}
      {mostrarHistorial && (
        <HistorialIdentidadModal
          onClose={() => setMostrarHistorial(false)}
          eventos={historial}
          cargando={cargandoHistorial}
          onExportar={exportarHistorialPdf}
          exportando={exportandoHistorial}
          estado={estado}
          cedulaVerificada={documentos.some((d) => d.tipo === "cedula" && d.estado_verificacion === "verificado")}
          onRevocar={revocarPropio}
          revocando={revocandoPropio}
        />
      )}
      {mostrarDispositivos && (
        <DispositivosModal
          onClose={() => setMostrarDispositivos(false)}
          dispositivos={dispositivos}
          cargando={cargandoDispositivos}
        />
      )}
      {mostrarPoliticaBiometrica && (
        <PoliticaBiometricaModal
          onClose={() => setMostrarPoliticaBiometrica(false)}
          data={politicaBiometrica}
          cargando={cargandoPolitica}
        />
      )}
      {mostrarConsentimientos && (
        <ConsentimientosModal
          onClose={() => setMostrarConsentimientos(false)}
          consentimientos={consentimientos}
          cargando={cargandoConsentimientos}
        />
      )}
      {mostrarEliminarDatos && (
        <EliminarDatosModal
          onClose={() => setMostrarEliminarDatos(false)}
          onConfirmar={eliminarTodosMisDatos}
          eliminando={eliminandoDatos}
        />
      )}
    </section>
  );
}

/* ------------------------------------------------------ modales de verificación */
function Spinner({ tono = "claro" }) {
  const clases = tono === "rojo"
    ? "border-red-500/30 border-t-red-400"
    : "border-white/30 border-t-white";
  return (
    <span
      className={`inline-block w-4 h-4 rounded-full border-2 animate-spin ${clases}`}
      aria-hidden="true"
    />
  );
}

function VerifModalShell({ title, subtitle, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg bg-surface border border-line/15 rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} aria-label="Cerrar"
          className="absolute top-4 right-4 text-muted hover:text-content text-xl leading-none">
          ×
        </button>
        <h3 className="text-content font-bold text-lg pr-8">{title}</h3>
        {subtitle && <p className="text-muted text-xs mt-1 mb-4">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

const ICONO_EVENTO = {
  registro_rostro: "🙂",
  verificacion_rostro: "✅",
  verificacion_cedula: "🪪",
  verificacion_telefono: "💬",
  revocacion: "🔒",
};

const METODO_LABEL_PROPIO = { rostro: "el rostro", cedula: "la cédula verificada", telefono: "el teléfono verificado" };

function HistorialIdentidadModal({ onClose, eventos, cargando, onExportar, exportando, estado, cedulaVerificada, onRevocar, revocando }) {
  const { organizacion } = useTheme();
  const nombreWallet = organizacion?.nombre_wallet_efectivo || "econfiaWallet";
  const metodosActivos = [
    estado?.rostro_registrado && "rostro",
    cedulaVerificada && "cedula",
    estado?.telefono_verificado && "telefono",
  ].filter(Boolean);

  return (
    <VerifModalShell
      title="Historial de identidad"
      subtitle={`Registro de sus verificaciones y revocaciones en ${nombreWallet}.`}
      onClose={onClose}>
      <button type="button" onClick={onExportar} disabled={exportando}
        className="mb-3 w-full flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 px-4 py-2.5 text-emerald-300 text-xs font-semibold transition-colors disabled:opacity-50">
        {exportando ? <Spinner /> : "⬇"} Exportar historial en PDF
      </button>

      {cargando ? (
        <div className="flex justify-center py-6"><Spinner /></div>
      ) : eventos.length === 0 ? (
        <p className="text-muted text-xs text-center py-6">Aún no hay eventos registrados.</p>
      ) : (
        <ul className="flex flex-col gap-3 max-h-[45vh] overflow-y-auto">
          {eventos.map((ev, i) => (
            <li key={i} className="flex items-start gap-3 rounded-xl bg-surface-2/50 border border-line/10 px-4 py-3">
              <span className="text-xl">{ICONO_EVENTO[ev.tipo] || "•"}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${ev.tipo === "revocacion" ? "text-red-300" : "text-content"}`}>
                  {ev.descripcion}
                </p>
                {ev.motivo && <p className="text-muted text-[11px] mt-0.5">{ev.motivo}</p>}
                <p className="text-muted text-[11px] mt-0.5">{new Date(ev.fecha).toLocaleString("es-CO")}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {metodosActivos.length > 0 && (
        <div className="mt-4 pt-4 border-t border-line/10">
          <p className="text-muted text-[11px] mb-2">Si desea eliminar alguna verificación de su cuenta:</p>
          <div className="flex flex-wrap gap-2">
            {metodosActivos.map((m) => (
              <button key={m} type="button" onClick={() => onRevocar(m)} disabled={revocando === m}
                className="px-3 py-1.5 rounded-lg border border-red-500/40 text-red-300 hover:bg-red-500/10 text-[11px] font-semibold disabled:opacity-50">
                {revocando === m ? "Revocando…" : `Revocar ${METODO_LABEL_PROPIO[m]}`}
              </button>
            ))}
          </div>
        </div>
      )}
    </VerifModalShell>
  );
}

function DispositivosModal({ onClose, dispositivos, cargando }) {
  return (
    <VerifModalShell
      title="Dispositivos con sesión activa"
      subtitle="Vea desde dónde han iniciado sesión en su cuenta. Si no reconoce alguno, cierre sesión en todos los dispositivos."
      onClose={onClose}>
      {cargando ? (
        <div className="flex justify-center py-6"><Spinner /></div>
      ) : dispositivos.length === 0 ? (
        <p className="text-muted text-xs text-center py-6">Aún no hay dispositivos registrados.</p>
      ) : (
        <ul className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
          {dispositivos.map((d, i) => (
            <li key={i} className="flex items-start gap-3 rounded-xl bg-surface-2/50 border border-line/10 px-4 py-3">
              <span className="text-xl">📱</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-content">{d.nombre}</p>
                <p className="text-muted text-[11px] mt-0.5">
                  Último acceso: {new Date(d.ultimo_acceso).toLocaleString("es-CO")}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </VerifModalShell>
  );
}

function PoliticaBiometricaModal({ onClose, data, cargando }) {
  return (
    <VerifModalShell title="Política de datos biométricos" onClose={onClose}>
      {cargando || !data ? (
        <div className="flex justify-center py-6"><Spinner /></div>
      ) : (
        <div className="flex flex-col gap-4 max-h-[65vh] overflow-y-auto text-left">
          <p className="text-content text-sm leading-relaxed">{data.resumen}</p>

          <div>
            <p className="text-content text-xs font-bold uppercase tracking-wide mb-2">Qué sí se guarda</p>
            <ul className="space-y-2">
              {data.que_se_guarda?.map((item, i) => (
                <li key={i} className="rounded-lg bg-surface-2/50 border border-line/10 px-3 py-2">
                  <p className="text-content text-xs font-semibold">{item.dato}</p>
                  <p className="text-muted text-[11px] mt-0.5">{item.detalle}</p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-red-300 text-xs font-bold uppercase tracking-wide mb-2">Qué NO se guarda</p>
            <ul className="space-y-1.5">
              {data.que_NO_se_guarda?.map((texto, i) => (
                <li key={i} className="text-muted text-xs flex gap-2">
                  <span className="text-red-400">✕</span>
                  <span>{texto}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-muted text-[11px] leading-relaxed">{data.procesamiento}</p>
          <p className="text-muted text-[11px] leading-relaxed border-t border-line/10 pt-3">{data.excepcion_cedula}</p>
          <p className="text-muted text-[11px] leading-relaxed">{data.revocacion}</p>

          <p className="text-muted/70 text-[10px] text-right">
            Versión {data.version} · vigente desde {data.fecha_vigencia}
          </p>
        </div>
      )}
    </VerifModalShell>
  );
}

const CANAL_LABEL = { app: "App móvil", web: "Sitio web" };

function ConsentimientosModal({ onClose, consentimientos, cargando }) {
  const { organizacion } = useTheme();
  const nombreWallet = organizacion?.nombre_wallet_efectivo || "econfiaWallet";
  return (
    <VerifModalShell
      title="Mis autorizaciones otorgadas"
      subtitle={`Registro de las autorizaciones que ha dado en ${nombreWallet}, por categoría de dato.`}
      onClose={onClose}>
      {cargando ? (
        <div className="flex justify-center py-6"><Spinner /></div>
      ) : consentimientos.length === 0 ? (
        <p className="text-muted text-xs text-center py-6">Aún no ha otorgado ninguna autorización.</p>
      ) : (
        <ul className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
          {consentimientos.map((c, i) => (
            <li key={i} className="rounded-xl bg-surface-2/50 border border-line/10 px-4 py-3">
              <p className="text-content text-sm font-semibold">{c.categoria_label}</p>
              <p className="text-muted text-[11px] mt-1 leading-relaxed">{c.texto_aceptado}</p>
              <p className="text-muted/70 text-[10px] mt-2">
                Versión {c.version} · {CANAL_LABEL[c.canal] || c.canal} · {new Date(c.fecha_aceptacion).toLocaleString("es-CO")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </VerifModalShell>
  );
}

function EliminarDatosModal({ onClose, onConfirmar, eliminando }) {
  const { organizacion } = useTheme();
  const nombreWallet = organizacion?.nombre_wallet_efectivo || "econfiaWallet";
  const [paso, setPaso] = useState("advertencia"); // advertencia | password
  const [textoConfirmacion, setTextoConfirmacion] = useState("");
  const [password, setPassword] = useState("");

  const confirmacionValida = textoConfirmacion.trim().toUpperCase() === "ELIMINAR";

  const enviar = async (e) => {
    e.preventDefault();
    if (!password) return;
    await onConfirmar(password);
  };

  if (paso === "advertencia") {
    return (
      <VerifModalShell title={`Eliminar todos mis datos de ${nombreWallet}`} onClose={onClose}>
        <div className="flex flex-col gap-4">
          <p className="text-content text-sm">
            Esto eliminará de forma <strong>permanente e irreversible</strong>: su rostro registrado, la cédula
            y demás documentos subidos, títulos académicos, referencias, certificaciones, pases QR compartidos,
            dispositivos registrados y las autorizaciones otorgadas.
          </p>
          <p className="text-muted text-xs">
            No se elimina su cuenta de Econfia ni sus consultas de antecedentes fuera de {nombreWallet}. El
            historial de revocaciones se conserva como registro de auditoría.
          </p>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-content/80">
              Para continuar, escriba <span className="text-red-300">ELIMINAR</span>
            </label>
            <input type="text" value={textoConfirmacion} onChange={(e) => setTextoConfirmacion(e.target.value)}
              className="px-3 py-2 rounded-lg bg-surface-2/70 border border-line/15 text-content text-sm"
              autoComplete="off" />
          </div>
          <button type="button" disabled={!confirmacionValida} onClick={() => setPaso("password")}
            className="px-5 py-2.5 rounded-lg bg-red-500 hover:bg-red-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors">
            Continuar
          </button>
        </div>
      </VerifModalShell>
    );
  }

  return (
    <VerifModalShell title="Confirme su contraseña" onClose={onClose}>
      <form onSubmit={enviar} className="flex flex-col gap-4">
        <p className="text-muted text-xs">
          Por seguridad, ingrese la contraseña de su cuenta para confirmar la eliminación definitiva.
        </p>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña de su cuenta"
          className="px-3 py-2 rounded-lg bg-surface-2/70 border border-line/15 text-content text-sm"
          autoComplete="current-password" autoFocus />
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setPaso("advertencia")} className="text-xs text-muted hover:text-content">
            ← Volver
          </button>
          <button type="submit" disabled={!password || eliminando}
            className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
            {eliminando && <Spinner tono="rojo" />}
            {eliminando ? "Eliminando…" : "Eliminar definitivamente"}
          </button>
        </div>
      </form>
    </VerifModalShell>
  );
}

function ConfirmarRerregistroRostroModal({ onCancelar, onConfirmar }) {
  return (
    <VerifModalShell title="Ya tiene un rostro registrado" onClose={onCancelar}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center text-4xl">
          ✅
        </div>
        <p className="text-content text-sm text-center">
          Ya tiene un rostro registrado en su Wallet. Solo necesita volver a registrarlo si cambió mucho su
          apariencia (por ejemplo, barba, peso o el paso de varios años).
        </p>
        <p className="text-muted text-xs text-center">
          No se guarda ninguna foto suya en el servidor, solo una huella digital de su rostro que se compara
          en cada verificación.
        </p>
        <div className="flex items-center gap-3 w-full mt-2">
          <button type="button" onClick={onCancelar}
            className="flex-1 px-5 py-2.5 rounded-lg border border-line/20 text-content text-sm font-semibold hover:bg-surface-2/60 transition-colors">
            Cancelar
          </button>
          <button type="button" onClick={onConfirmar}
            className="flex-1 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors">
            Volver a registrar
          </button>
        </div>
      </div>
    </VerifModalShell>
  );
}

const MENSAJES_ERROR_ROSTRO = {
  cedula_no_verificada:
    "Antes de registrar su rostro necesitamos confirmar su identidad con su cédula. Verifique su cédula primero y vuelva a intentarlo.",
  rostro_cedula_no_detectado:
    "No pudimos ver claramente el rostro en la foto de su cédula. Vuelva a subir la cédula con la foto del rostro bien visible.",
  rostro_no_coincide_cedula:
    "El rostro que tomó no se parece al de la foto de su cédula. Intente de nuevo con buena luz y mirando de frente, o revise que su cédula sea la correcta.",
};

function VerificarRostroModal({ onClose, setToast, onVerificado, esReregistro, telefonoVerificado, onIrACedula }) {
  const requiereReverificacion = !!esReregistro && !!telefonoVerificado;
  const [fase, setFase] = useState(requiereReverificacion ? "reverificacion" : "captura");
  const [codigoReverificacion, setCodigoReverificacion] = useState("");
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [enviandoCodigo, setEnviandoCodigo] = useState(false);
  const [paso, setPaso] = useState("frontal"); // frontal | izquierda | derecha | listo
  const [capturas, setCapturas] = useState({ frontal: null, izquierda: null, derecha: null });
  const [enviando, setEnviando] = useState(false);
  const [errorRegistro, setErrorRegistro] = useState(null); // { motivo, mensaje } | null
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [camaraLista, setCamaraLista] = useState(false);
  const [errorCamara, setErrorCamara] = useState("");

  const ORDEN = ["frontal", "izquierda", "derecha"];
  const ETIQUETAS = { frontal: "Mire al frente", izquierda: "Gire levemente a la izquierda", derecha: "Gire levemente a la derecha" };

  useEffect(() => {
    if (fase !== "captura") return undefined;
    let activo = true;
    async function iniciarCamara() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        if (!activo) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCamaraLista(true);
        }
      } catch {
        setErrorCamara("No se pudo acceder a la cámara. Verifique los permisos del navegador.");
      }
    }
    if (paso !== "listo") iniciarCamara();
    return () => {
      activo = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [fase, paso]);

  const capturarFoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    const nuevasCapturas = { ...capturas, [paso]: dataUrl };
    setCapturas(nuevasCapturas);
    const idx = ORDEN.indexOf(paso);
    if (idx < ORDEN.length - 1) {
      setPaso(ORDEN[idx + 1]);
    } else {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      setPaso("listo");
    }
  };

  const enviarCodigoReverificacion = async () => {
    setEnviandoCodigo(true);
    try {
      const res = await fetch(`${API_URL}/api/wallet/identidad/sms/enviar/`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ telefono: telefonoVerificado, canal: "web" }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setToast({ type: "error", message: data?.error || "No se pudo enviar el código." });
        return;
      }
      setCodigoEnviado(true);
      if (data?.fallo_envio_real || data?.simulado) {
        setToast({ type: "success", message: mensajeEnvioSms(data) });
      }
    } catch {
      setToast({ type: "error", message: "Error de conexión al enviar el código." });
    } finally {
      setEnviandoCodigo(false);
    }
  };

  const enviarRegistro = async () => {
    setEnviando(true);
    try {
      const fd = new FormData();
      fd.append("foto_frontal", dataUrlAArchivo(capturas.frontal, "rostro-frontal.jpg"));
      fd.append("canal", "web");
      if (requiereReverificacion) fd.append("codigo_reverificacion", codigoReverificacion);
      const res = await fetch(`${API_URL}/api/wallet/identidad/rostro/registrar/`, {
        method: "POST",
        headers: authHeaders(),
        body: fd,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const motivo = data?.motivo;
        if (motivo && MENSAJES_ERROR_ROSTRO[motivo]) {
          setErrorRegistro({ motivo, mensaje: MENSAJES_ERROR_ROSTRO[motivo] });
        } else {
          setToast({ type: "error", message: data?.error || "No se pudo registrar el rostro." });
        }
        return;
      }
      setToast({ type: "success", message: "Rostro registrado correctamente." });
      onVerificado?.();
      onClose();
    } catch {
      setToast({ type: "error", message: "Error de conexión al registrar el rostro." });
    } finally {
      setEnviando(false);
    }
  };

  if (errorRegistro) {
    return (
      <VerifModalShell title="No se pudo registrar el rostro" onClose={onClose}>
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="text-4xl">⚠️</span>
          <p className="text-content text-sm">{errorRegistro.mensaje}</p>
          {errorRegistro.motivo === "cedula_no_verificada" && onIrACedula ? (
            <button type="button" onClick={() => { setErrorRegistro(null); onIrACedula(); }}
              className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors">
              Verificar cédula ahora
            </button>
          ) : (
            <button type="button" onClick={() => setErrorRegistro(null)}
              className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors">
              Intentar de nuevo
            </button>
          )}
        </div>
      </VerifModalShell>
    );
  }

  if (esReregistro && !telefonoVerificado) {
    return (
      <VerifModalShell title="Verificar rostro" onClose={onClose}>
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-content text-sm">
            Para volver a registrar su rostro primero debe verificar su celular por SMS. Esto evita que alguien más
            reemplace su rostro registrado.
          </p>
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors">
            Entendido
          </button>
        </div>
      </VerifModalShell>
    );
  }

  if (fase === "reverificacion") {
    return (
      <VerifModalShell title="Confirme que es usted" subtitle="Por seguridad, confirme un código enviado a su celular antes de volver a registrar su rostro." onClose={onClose}>
        <div className="flex flex-col gap-4">
          {!codigoEnviado ? (
            <button type="button" onClick={enviarCodigoReverificacion} disabled={enviandoCodigo}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors disabled:opacity-50">
              {enviandoCodigo && <Spinner />}
              {enviandoCodigo ? "Enviando…" : "Enviar código de verificación"}
            </button>
          ) : (
            <>
              <p className="text-muted text-xs">Código enviado a su celular.</p>
              <WField label="Código de 6 dígitos" value={codigoReverificacion} onChange={setCodigoReverificacion} placeholder="000000" />
              <button type="button"
                onClick={() => {
                  if (codigoReverificacion.trim().length !== 6) {
                    setToast({ type: "error", message: "Ingrese el código de 6 dígitos." });
                    return;
                  }
                  setFase("captura");
                }}
                className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors">
                Continuar
              </button>
            </>
          )}
        </div>
      </VerifModalShell>
    );
  }

  return (
    <VerifModalShell title="Verificar rostro" subtitle="Tome 3 fotos siguiendo las indicaciones para registrar su rostro." onClose={onClose}>
      {paso !== "listo" ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-content text-sm font-semibold">{ETIQUETAS[paso]}</p>
          {errorCamara ? (
            <p className="text-red-300 text-xs text-center">{errorCamara}</p>
          ) : (
            <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-emerald-500/50 bg-surface-2/70 flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
            </div>
          )}
          <button type="button" onClick={capturarFoto} disabled={!camaraLista}
            className="mt-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors disabled:opacity-50">
            Capturar
          </button>
          <div className="flex items-center gap-2 mt-1">
            {ORDEN.map((p) => (
              <span key={p} className={`w-2.5 h-2.5 rounded-full ${capturas[p] ? "bg-emerald-500" : "bg-line/30"}`} />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-3">
            {ORDEN.map((p) => (
              <img key={p} src={capturas[p]} alt={p} className="w-20 h-20 rounded-lg object-cover border border-line/15" />
            ))}
          </div>
          <p className="text-muted text-xs text-center">Sus 3 capturas están listas para registrarse.</p>
          <button type="button" onClick={enviarRegistro} disabled={enviando}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors disabled:opacity-50">
            {enviando && <Spinner />}
            {enviando ? "Guardando…" : "Registrar rostro"}
          </button>
        </div>
      )}
    </VerifModalShell>
  );
}

function dataUrlAArchivo(dataUrl, nombre) {
  const [meta, base64] = dataUrl.split(",");
  const mime = meta.match(/:(.*?);/)[1];
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new File([arr], nombre, { type: mime });
}

function VerificarCedulaModal({ onClose, setToast, onVerificado, tipoDoc }) {
  const [modo, setModo] = useState(null); // null | "camara" | "archivo"
  const [paso, setPaso] = useState("frente"); // frente | reverso | listo
  const [capturas, setCapturas] = useState({ frente: null, reverso: null });
  const [archivo, setArchivo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [camaraLista, setCamaraLista] = useState(false);
  const [errorCamara, setErrorCamara] = useState("");
  // Cuenta fallos consecutivos de OCR ilegible (foto que ni siquiera se pudo
  // leer, no un dato que no coincide) para dar consejos cada vez más
  // específicos en vez de repetir el mismo mensaje genérico (IDV-02).
  const [intentosOcrIlegible, setIntentosOcrIlegible] = useState(0);
  // Mientras el documento queda "pendiente" (Celery consultando
  // Registraduría en segundo plano), se hace polling en vez de cerrar el
  // modal de inmediato, para mostrar el resultado final.
  const [verificando, setVerificando] = useState(false);
  const pollDocRef = useRef(null);

  const documento = nombreDocumento(tipoDoc);
  const ORDEN = ["frente", "reverso"];
  const ETIQUETAS = {
    frente: `Enfoque el frente de su ${documento}`,
    reverso: `Ahora enfoque el reverso de su ${documento}`,
  };

  useEffect(() => {
    if (modo !== "camara" || paso === "listo") return undefined;
    let activo = true;
    async function iniciarCamara() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (!activo) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCamaraLista(true);
        }
      } catch {
        setErrorCamara("No se pudo acceder a la cámara. Verifique los permisos del navegador.");
      }
    }
    iniciarCamara();
    return () => {
      activo = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [modo, paso]);

  const capturarFoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    const nuevasCapturas = { ...capturas, [paso]: dataUrl };
    setCapturas(nuevasCapturas);
    const idx = ORDEN.indexOf(paso);
    if (idx < ORDEN.length - 1) {
      setPaso(ORDEN[idx + 1]);
    } else {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      setPaso("listo");
    }
  };

  const repetir = (p) => {
    setCapturas((c) => ({ ...c, [p]: null }));
    setPaso(p);
  };

  const volverAlInicio = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setModo(null);
    setPaso("frente");
    setCapturas({ frente: null, reverso: null });
    setArchivo(null);
    setCamaraLista(false);
    setErrorCamara("");
  };

  // Consulta periódica del documento mientras está "pendiente" (Celery
  // corriendo verificar_documento_wallet contra Registraduría).
  // Tras ~2 minutos (30 intentos cada 4s) de seguir "pendiente" se deja de
  // esperar en silencio: puede pasar si Registraduría no responde y el
  // documento queda pendiente indefinidamente (sin reintento automático en
  // el backend) — mejor avisar al usuario que dejarlo esperando para siempre.
  const POLL_INTENTOS_MAX = 30;

  const pollearDocumento = (docId, onReintentar) => {
    setVerificando(true);
    let activo = true;
    let intentos = 0;
    const tick = async () => {
      intentos += 1;
      try {
        const res = await fetch(`${API_URL}/api/wallet/documentos/${docId}/`, { headers: authHeaders() });
        const doc = await res.json().catch(() => null);
        if (!activo) return;
        if (!res.ok || !doc) {
          if (intentos >= POLL_INTENTOS_MAX) {
            setVerificando(false);
            setToast({ type: "error", message: "No se pudo confirmar el estado de su cédula. Intente de nuevo más tarde." });
            onReintentar?.();
            return;
          }
          pollDocRef.current = setTimeout(tick, 4000);
          return;
        }
        if (doc.estado_verificacion === "pendiente") {
          if (intentos >= POLL_INTENTOS_MAX) {
            setVerificando(false);
            setToast({
              type: "error",
              message: doc.detalle_verificacion?.mensaje
                || "La verificación está tardando más de lo normal. Intente de nuevo más tarde.",
            });
            onReintentar?.();
            return;
          }
          pollDocRef.current = setTimeout(tick, 4000);
          return;
        }
        setVerificando(false);
        if (doc.estado_verificacion === "rechazado") {
          const mensaje = doc.detalle_verificacion?.mensaje
            || "Los datos no pudieron confirmarse. Intente de nuevo.";
          setToast({ type: "error", message: mensaje });
          onVerificado?.();
          onReintentar?.();
          return;
        }
        setToast({ type: "success", message: "Cédula verificada correctamente." });
        onVerificado?.();
        onClose();
      } catch {
        if (!activo) return;
        if (intentos >= POLL_INTENTOS_MAX) {
          setVerificando(false);
          setToast({ type: "error", message: "No se pudo confirmar el estado de su cédula. Intente de nuevo más tarde." });
          onReintentar?.();
          return;
        }
        pollDocRef.current = setTimeout(tick, 4000);
      }
    };
    tick();
  };

  // Si el backend rechaza la cédula (ej. el OCR no coincide con los datos
  // declarados), no se trata como "enviado": se muestra el motivo y se deja
  // reintentar sin cerrar el modal, para que el usuario no crea que su
  // cédula ya quedó registrada cuando en realidad no pasó la verificación.
  const enviarDocumento = async (fd, onReintentar) => {
    setEnviando(true);
    fd.append("canal", "web");
    try {
      const res = await fetch(`${API_URL}/api/wallet/documentos/`, {
        method: "POST",
        headers: authHeaders(),
        body: fd,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        if (data?.motivo === "ocr_ilegible") {
          const siguienteIntento = intentosOcrIlegible + 1;
          setIntentosOcrIlegible(siguienteIntento);
          setToast({ type: "error", message: consejoOcrIlegible(siguienteIntento) });
          return;
        }
        setIntentosOcrIlegible(0);
        setToast({ type: "error", message: data?.error || "No se pudo verificar la cédula." });
        return;
      }
      setIntentosOcrIlegible(0);
      if (data?.documento?.estado_verificacion === "rechazado") {
        const mensaje = data.documento.detalle_verificacion?.mensaje
          || "La foto no coincide con los datos registrados. Intente de nuevo.";
        setToast({ type: "error", message: mensaje });
        onReintentar?.();
        return;
      }
      if (data?.documento?.estado_verificacion === "pendiente") {
        pollearDocumento(data.documento.id, onReintentar);
        return;
      }
      setToast({ type: "success", message: "Cédula enviada. Su verificación quedó en proceso." });
      onVerificado?.();
      onClose();
    } catch {
      setToast({ type: "error", message: "Error de conexión al verificar la cédula." });
    } finally {
      setEnviando(false);
    }
  };

  const enviarCapturas = async () => {
    const fd = new FormData();
    fd.append("tipo", "cedula");
    fd.append("archivo", dataUrlAArchivo(capturas.frente, "cedula-frente.jpg"));
    fd.append("archivo_reverso", dataUrlAArchivo(capturas.reverso, "cedula-reverso.jpg"));
    await enviarDocumento(fd, () => {
      setCapturas({ frente: null, reverso: null });
      setPaso("frente");
    });
  };

  const enviarArchivo = async (e) => {
    e.preventDefault();
    if (!archivo) {
      setToast({ type: "error", message: "Seleccione el archivo escaneado de su cédula (PDF o imagen)." });
      return;
    }
    const fd = new FormData();
    fd.append("tipo", "cedula");
    fd.append("archivo", archivo);
    await enviarDocumento(fd, () => setArchivo(null));
  };

  if (verificando) {
    return (
      <VerifModalShell
        title={`Verificar ${documento}`}
        subtitle="Estamos confirmando sus datos con la Registraduría. Esto puede tardar hasta un minuto."
        onClose={onClose}>
        <div className="flex flex-col items-center gap-4 py-4">
          <span className="w-10 h-10 rounded-full border-4 border-emerald-500/25 border-t-emerald-500 animate-spin" aria-hidden="true" />
          <p className="text-muted text-xs">Verificando sus datos…</p>
        </div>
      </VerifModalShell>
    );
  }

  if (modo === null) {
    return (
      <VerifModalShell title={`Verificar ${documento}`} subtitle="Elija cómo quiere entregar su documento." onClose={onClose}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button type="button" onClick={() => setModo("camara")}
            className="flex flex-col items-center gap-2 rounded-xl bg-surface-2/50 border border-line/10 hover:border-emerald-500/40 px-4 py-6 transition-colors">
            <span className="text-3xl">📷</span>
            <span className="text-content text-sm font-semibold">Tomar fotos</span>
            <span className="text-muted text-[11px] text-center">Frente y reverso con la cámara</span>
          </button>
          <button type="button" onClick={() => setModo("archivo")}
            className="flex flex-col items-center gap-2 rounded-xl bg-surface-2/50 border border-line/10 hover:border-emerald-500/40 px-4 py-6 transition-colors">
            <span className="text-3xl">📄</span>
            <span className="text-content text-sm font-semibold">Subir archivo</span>
            <span className="text-muted text-[11px] text-center">PDF o imagen ya escaneada</span>
          </button>
        </div>
      </VerifModalShell>
    );
  }

  if (modo === "archivo") {
    return (
      <VerifModalShell title={`Verificar ${documento}`} subtitle={`Suba el PDF o imagen de su ${documento} escaneado (frente y reverso, en una o dos páginas).`} onClose={onClose}>
        <form onSubmit={enviarArchivo} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-content/80">Archivo (PDF o imagen, máx 10 MB)</label>
            <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp"
              onChange={(e) => setArchivo(e.target.files?.[0] || null)}
              className="text-xs text-content file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-emerald-500 file:text-white file:text-xs file:font-semibold hover:file:bg-emerald-400 file:cursor-pointer" />
            {archivo && <p className="text-muted text-[11px] truncate">{archivo.name}</p>}
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={volverAlInicio} className="text-xs text-muted hover:text-content">
              ← Cambiar método
            </button>
            <button type="submit" disabled={enviando}
              className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors disabled:opacity-50">
              {enviando && <Spinner />}
              {enviando ? "Enviando…" : `Verificar ${documento}`}
            </button>
          </div>
        </form>
      </VerifModalShell>
    );
  }

  return (
    <VerifModalShell title={`Verificar ${documento}`} subtitle={`Tome una foto del frente y luego del reverso de su ${documento}.`} onClose={onClose}>
      {paso !== "listo" ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-content text-sm font-semibold">{ETIQUETAS[paso]}</p>
          {errorCamara ? (
            <p className="text-red-300 text-xs text-center">{errorCamara}</p>
          ) : (
            <div className="w-full aspect-[3/2] rounded-lg overflow-hidden border-2 border-emerald-500/50 bg-surface-2/70 flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            </div>
          )}
          <button type="button" onClick={capturarFoto} disabled={!camaraLista}
            className="mt-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors disabled:opacity-50">
            Capturar
          </button>
          <div className="flex items-center gap-2 mt-1">
            {ORDEN.map((p) => (
              <span key={p} className={`w-2.5 h-2.5 rounded-full ${capturas[p] ? "bg-emerald-500" : "bg-line/30"}`} />
            ))}
          </div>
          <button type="button" onClick={volverAlInicio} className="text-xs text-muted hover:text-content">
            ← Cambiar método
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="grid grid-cols-2 gap-3 w-full">
            {ORDEN.map((p) => (
              <div key={p} className="flex flex-col gap-1">
                <img src={capturas[p]} alt={p} className="w-full aspect-[3/2] rounded-lg object-cover border border-line/15" />
                <button type="button" onClick={() => repetir(p)} className="text-[11px] text-emerald-300 hover:text-emerald-200 self-center">
                  Repetir {p}
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={enviarCapturas} disabled={enviando}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors disabled:opacity-50">
            {enviando && <Spinner />}
            {enviando ? "Enviando…" : `Verificar ${documento}`}
          </button>
        </div>
      )}
    </VerifModalShell>
  );
}

function VerificarSmsModal({ onClose, setToast, datosTelefono, onVerificado }) {
  const [fase, setFase] = useState("telefono"); // telefono | codigo
  const [telefono, setTelefono] = useState(datosTelefono || "");
  const [codigo, setCodigo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [segundos, setSegundos] = useState(0);

  useEffect(() => {
    if (segundos <= 0) return undefined;
    const id = setInterval(() => setSegundos((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [segundos]);

  const enviarCodigo = async (e) => {
    e.preventDefault();
    if (!telefono.trim()) {
      setToast({ type: "error", message: "Ingrese su número de celular." });
      return;
    }
    setEnviando(true);
    try {
      const res = await fetch(`${API_URL}/api/wallet/identidad/sms/enviar/`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ telefono, canal: "web" }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setToast({ type: "error", message: data?.error || "No se pudo enviar el código." });
        return;
      }
      setFase("codigo");
      setSegundos(60);
      setToast({ type: "success", message: mensajeEnvioSms(data) });
    } catch {
      setToast({ type: "error", message: "Error de conexión al enviar el código." });
    } finally {
      setEnviando(false);
    }
  };

  const confirmarCodigo = async (e) => {
    e.preventDefault();
    if (codigo.trim().length !== 6) {
      setToast({ type: "error", message: "El código debe tener 6 dígitos." });
      return;
    }
    setEnviando(true);
    try {
      const res = await fetch(`${API_URL}/api/wallet/identidad/sms/verificar/`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ telefono, codigo }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setToast({ type: "error", message: data?.error || "No se pudo verificar el código." });
        return;
      }
      setToast({ type: "success", message: "Teléfono verificado correctamente." });
      onVerificado?.();
      onClose();
    } catch {
      setToast({ type: "error", message: "Error de conexión al verificar el código." });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <VerifModalShell title="Verificar por SMS" subtitle="Enviaremos un código de 6 dígitos a su celular." onClose={onClose}>
      {fase === "telefono" ? (
        <form onSubmit={enviarCodigo} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-content/80">Número de celular</label>
            <div className="flex items-center rounded-lg border border-line/15 bg-surface-2/70 focus-within:border-emerald-500/50 overflow-hidden">
              <span className="px-3 py-2 text-content text-sm font-semibold bg-surface-2/90 border-r border-line/15 select-none">+57</span>
              <input type="tel" value={telefono} placeholder="3001234567" maxLength={10}
                onChange={(e) => setTelefono(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="flex-1 px-3 py-2 bg-transparent text-content text-sm placeholder:text-muted/60 focus:outline-none" />
            </div>
          </div>
          <button type="submit" disabled={enviando}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors disabled:opacity-50">
            {enviando && <Spinner />}
            {enviando ? "Enviando…" : "Enviar código"}
          </button>
        </form>
      ) : (
        <form onSubmit={confirmarCodigo} className="flex flex-col gap-4">
          <p className="text-muted text-xs">Código enviado a {telefono}.</p>
          <WField label="Código de 6 dígitos" value={codigo} onChange={setCodigo} placeholder="000000" />
          <div className="flex items-center justify-between">
            <button type="submit" disabled={enviando}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors disabled:opacity-50">
              {enviando && <Spinner />}
              {enviando ? "Verificando…" : "Confirmar código"}
            </button>
            <button type="button" disabled={segundos > 0} onClick={enviarCodigo}
              className="text-xs text-emerald-300 hover:text-emerald-200 disabled:text-muted disabled:cursor-not-allowed">
              {segundos > 0 ? `Reenviar en ${segundos}s` : "Reenviar código"}
            </button>
          </div>
        </form>
      )}
    </VerifModalShell>
  );
}

/* ------------------------------------------------------------------ átomos UI */
function WField({ label, value, onChange, placeholder, type = "text", disabled = false }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-content/80">{label}</label>
      <input type={type} value={value} placeholder={placeholder} disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 rounded-lg bg-surface-2/70 border border-line/15 text-content text-sm placeholder:text-muted/60 focus:outline-none focus:border-emerald-500/50 disabled:opacity-50" />
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

function Input({ label, value, onChange, placeholder, type = "text", full, listId }) {
  return (
    <div className={`flex flex-col gap-1 ${full ? "sm:col-span-2" : ""}`}>
      <label className="text-xs font-semibold text-content/80">{label}</label>
      <input type={type} value={value} placeholder={placeholder} list={listId}
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
