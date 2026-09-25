import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Check, ScanFace, Trash2 } from "lucide-react";
import Toast from "../components/Toast";
import { useTheme } from "../context/ThemeContext";
import VerificacionIdentidadModal from "../components/VerificacionIdentidadModal";
import WalletSolicitudes from "../components/WalletSolicitudes";
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

// Mismas 8 fuentes y mismas claves que FUENTES_WALLET en core/views_wallet.py
// — deben coincidir exactamente para que el filtro de divulgación selectiva
// tenga efecto en el pase compartido.
const FUENTES_ANTECEDENTES_INFO = [
  { key: "policia_nacional", label: "Policía Nacional" },
  { key: "procuraduria", label: "Procuraduría General" },
  { key: "contraloria", label: "Contraloría General" },
  { key: "personeria", label: "Personería" },
  { key: "inhabilidades", label: "Inhabilidades" },
  { key: "rama_judicial", label: "Rama Judicial" },
  { key: "tyba", label: "Tyba" },
  { key: "simit", label: "SIMIT" },
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
  const [editandoBase, setEditandoBase] = useState(false);

  // Confirmación previa a cualquier borrado (documento, certificación,
  // título o referencia): { tipo, id, nombre } | null. Un solo modal
  // reutilizado por los 4 botones de eliminar — borrar es irreversible,
  // así que ninguno actúa directo al clic.
  const [confirmarEliminar, setConfirmarEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  // Consulta única
  const [resultado, setResultado] = useState(null);
  const [consultando, setConsultando] = useState(false);
  const pollRef = useRef(null);

  // Documentos
  const [documentos, setDocumentos] = useState([]);
  const [credenciales, setCredenciales] = useState([]);
  const [tipoSubida, setTipoSubida] = useState("hoja_vida");
  const [archivo, setArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

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
  const [llave, setLlave] = useState(null); // { clave, expires_at, max_consultas }
  const [segundos, setSegundos] = useState(0);
  const [mostrarSelectorCompartir, setMostrarSelectorCompartir] = useState(false);
  const [atributosCompartir, setAtributosCompartir] = useState(["persona", "documentos", "antecedentes"]);
  // Divulgación selectiva dentro de "antecedentes": qué fuentes concretas
  // (ver FUENTES_WALLET en core/views_wallet.py) se muestran en el pase.
  const [fuentesAntecedentesCompartir, setFuentesAntecedentesCompartir] = useState(
    FUENTES_ANTECEDENTES_INFO.map((f) => f.key)
  );
  // Antes de abrir el selector de qué compartir, se exige reconfirmar
  // identidad (FaceID o SMS, lo que el titular tenga disponible) — evita
  // que, con la sesión ya iniciada, cualquiera que tome el dispositivo
  // desatendido genere un QR/llave con los datos del titular sin más que
  // un clic.
  const [mostrarReautenticar, setMostrarReautenticar] = useState(false);

  // Confirmación previa a iniciar la consulta: los datos base quedan
  // bloqueados en cuanto se usa la única consulta disponible (no editables
  // ni por el propio titular, ver _consulta_usada en views_wallet.py), así
  // que se pide una confirmación explícita antes de gastarla — evita que
  // alguien la consuma con un dato mal digitado sin darse cuenta.
  const [mostrarConfirmarConsulta, setMostrarConfirmarConsulta] = useState(false);

  // Llave fija personal: handle propio (WLT-...) elegido desde sugerencias.
  const [llaveFija, setLlaveFija] = useState(null); // { clave, url, qr_base64, atributos } | null
  const [sugerenciasLlave, setSugerenciasLlave] = useState([]);
  const [llaveInput, setLlaveInput] = useState("");
  const [guardandoLlave, setGuardandoLlave] = useState(false);
  const [editandoLlave, setEditandoLlave] = useState(false);

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

  const cargarCredenciales = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/wallet/credenciales/`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) setCredenciales(data.credenciales || []);
    } catch {
      /* silencioso */
    }
  }, []);

  const cargarLlaveFija = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/wallet/llave-fija/`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) {
        setLlaveFija(data.llave || null);
        setSugerenciasLlave(data.sugerencias || []);
        if (data.llave?.clave) setLlaveInput(data.llave.clave);
        else if ((data.sugerencias || []).length) setLlaveInput(data.sugerencias[0]);
      }
    } catch {
      /* silencioso */
    }
  }, []);

  const guardarLlaveFija = useCallback(async (clave) => {
    const valor = (clave ?? llaveInput ?? "").trim();
    if (!valor) {
      setToast({ type: "error", message: "Elija o escriba una llave." });
      return;
    }
    setGuardandoLlave(true);
    try {
      const res = await fetch(`${API_URL}/api/wallet/llave-fija/`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ clave: valor }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({ type: "error", message: data.error || "No se pudo guardar la llave." });
        return;
      }
      setLlaveFija(data);
      setLlaveInput(data.clave);
      setEditandoLlave(false);
      setToast({ type: "success", message: "Tu llave quedó lista." });
    } catch {
      setToast({ type: "error", message: "Error al guardar la llave." });
    } finally {
      setGuardandoLlave(false);
    }
  }, [llaveInput]);

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
    cargarCredenciales();
    cargarTitulos();
    cargarReferencias();
    cargarCertificaciones();
    cargarLlaveFija();
  }, [cargarEstado, cargarDocumentos, cargarCredenciales, cargarTitulos, cargarReferencias, cargarCertificaciones, cargarLlaveFija]);

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
      setEditandoBase(false);
      setToast({ type: "success", message: "Datos guardados. Ya puede consultar." });
    } catch {
      setToast({ type: "error", message: "Error al guardar sus datos." });
    } finally {
      setGuardandoBase(false);
    }
  };

  // Precarga el formulario con los datos ya guardados (candidato_data del
  // backend, ver views_wallet.py) para editarlos — nombre/apellido llegan
  // separados ahí pero el formulario usa un solo campo "nombre_completo".
  const editarBase = () => {
    const c = estado?.candidato || {};
    setForm({
      documento: c.cedula || "",
      tipo_doc: c.tipo_doc || "CC",
      fecha_expedicion: c.fecha_expedicion || "",
      nombre_completo: `${c.nombre || ""} ${c.apellido || ""}`.trim(),
      fecha_nacimiento: c.fecha_nacimiento || "",
      lugar_expedicion: c.lugar_expedicion || "",
      email: c.email || "",
      profesion: c.profesion || "",
      profesion_otro: "",
      sexo: c.sexo || "",
      telefono: c.telefono || "",
      ciudad_residencia: c.ciudad_residencia || "",
    });
    setEditandoBase(true);
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

  const descargarCredencialPDF = async (credencialId) => {
    try {
      const res = await fetch(`${API_URL}/api/wallet/credenciales/${credencialId}/pdf/`, {
        headers: authHeaders(),
      });
      if (!res.ok) {
        setToast({ type: "error", message: "No se pudo descargar la credencial." });
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `credencial-wallet-${credencialId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setToast({ type: "error", message: "Error al descargar la credencial." });
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

  const compartir = async (atributos = atributosCompartir, fuentesAntecedentes = fuentesAntecedentesCompartir) => {
    if (!atributos || atributos.length === 0) {
      setToast({ type: "error", message: "Elige al menos un dato para compartir." });
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/wallet/compartir/`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ atributos, fuentes_antecedentes: fuentesAntecedentes }),
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

  // Llave duradera para compartir con una empresa (Fase 1 wallet empresa).
  const compartirLlave = async (atributos = atributosCompartir, fuentesAntecedentes = fuentesAntecedentesCompartir) => {
    if (!atributos || atributos.length === 0) {
      setToast({ type: "error", message: "Elige al menos un dato para compartir." });
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/wallet/compartir-llave/`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ atributos, fuentes_antecedentes: fuentesAntecedentes, dias: 7, max_consultas: 5 }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({ type: "error", message: data.error || "No se pudo generar la llave." });
        return;
      }
      setMostrarSelectorCompartir(false);
      setLlave(data);
    } catch {
      setToast({ type: "error", message: "Error al generar la llave." });
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

  const toggleFuenteAntecedentes = (key) => {
    setFuentesAntecedentesCompartir((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
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

  const ELIMINAR_POR_TIPO = {
    documento: eliminarDocumento,
    certificacion: eliminarCertificacion,
    titulo: eliminarTitulo,
    referencia: eliminarReferencia,
  };

  const confirmarYEliminar = async () => {
    if (!confirmarEliminar) return;
    setEliminando(true);
    try {
      await ELIMINAR_POR_TIPO[confirmarEliminar.tipo](confirmarEliminar.id);
    } finally {
      setEliminando(false);
      setConfirmarEliminar(null);
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
                <button onClick={() => setMostrarReautenticar(true)}
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

        {/* ============ Mi llave fija personal ============ */}
        {baseCompleta && (
          <div className="bg-gradient-to-br from-emerald-500/10 via-surface-2/70 to-surface/95 border border-emerald-500/25 rounded-2xl p-6 shadow-xl mb-6">
            <div className="flex items-start gap-3">
              <span className="flex w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-content font-bold text-lg leading-tight">Mi llave</h2>
                <p className="text-muted text-xs mt-1 leading-relaxed">
                  Es tu identificador propio para que una empresa consulte tu Wallet. Elige una de las
                  sugerencias (creadas con tu documento o tu nombre) y compártela por WhatsApp, correo o en persona.
                </p>

                {llaveFija?.clave && !editandoLlave ? (
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <div className="bg-surface-2/70 border border-emerald-500/30 rounded-xl px-5 py-3">
                      <span className="text-emerald-300 font-mono text-xl font-bold tracking-widest break-all">{llaveFija.clave}</span>
                    </div>
                    <button
                      onClick={() => { navigator.clipboard?.writeText(llaveFija.clave); setToast({ type: "success", message: "Llave copiada." }); }}
                      className="px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors">
                      Copiar
                    </button>
                    <button
                      onClick={() => { setEditandoLlave(true); setLlaveInput(llaveFija.clave); }}
                      className="px-4 py-2.5 rounded-lg border border-line/20 text-muted hover:text-content hover:border-emerald-500/30 text-sm font-semibold transition-colors">
                      Cambiar
                    </button>
                  </div>
                ) : (
                  <div className="mt-4">
                    {sugerenciasLlave.length > 0 ? (
                      <>
                        <p className="text-muted text-[11px] mb-2">Elige la que prefieras:</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {sugerenciasLlave.map((s) => (
                            <button key={s} onClick={() => setLlaveInput(s)}
                              className={`px-3 py-2 rounded-lg font-mono text-sm font-semibold border transition-colors ${
                                llaveInput === s
                                  ? "bg-emerald-500 text-white border-emerald-500"
                                  : "bg-surface-2/60 text-emerald-300 border-emerald-500/30 hover:border-emerald-400"
                              }`}>
                              {s}
                            </button>
                          ))}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => guardarLlaveFija()}
                            disabled={guardandoLlave || !llaveInput}
                            className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
                            {guardandoLlave ? "Guardando…" : "Usar esta llave"}
                          </button>
                          {llaveFija?.clave && (
                            <button onClick={() => { setEditandoLlave(false); setLlaveInput(llaveFija.clave); }}
                              className="px-4 py-2.5 rounded-lg border border-line/20 text-muted hover:text-content text-sm font-semibold transition-colors">
                              Cancelar
                            </button>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-muted text-xs">
                        Completa tus datos personales (nombre y documento) para poder sugerirte una llave.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= ZONA A: datos base ================= */}
        <WalletSolicitudes />
        <div className="bg-gradient-to-br from-surface/95 via-surface-2/80 to-surface/95 border border-line/15 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <StepDot n={1} done={baseCompleta} />
            <div className="flex-1">
              <h2 className="text-content font-bold">Sus datos</h2>
              <p className="text-muted text-xs">Documento, fecha de expedición y nombres completos.</p>
            </div>
            {baseCompleta && !editandoBase && !consultaUsada && (
              <button type="button" onClick={editarBase}
                className="shrink-0 px-4 py-1.5 rounded-lg border border-line/20 text-content text-xs font-semibold hover:bg-surface-2/60 transition-colors">
                Editar
              </button>
            )}
          </div>

          {baseCompleta && !editandoBase ? (
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
              <Input label="Lugar de expedición" value={form.lugar_expedicion} listId="ciudades-colombia"
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
              <div className="sm:col-span-2 flex items-center gap-3">
                <button type="submit" disabled={guardandoBase}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors disabled:opacity-50">
                  {guardandoBase ? "Guardando…" : editandoBase ? "Guardar cambios" : "Guardar y habilitar consulta"}
                </button>
                {editandoBase && (
                  <button type="button" onClick={() => setEditandoBase(false)} disabled={guardandoBase}
                    className="px-6 py-2.5 rounded-lg border border-line/20 text-content text-sm font-semibold hover:bg-surface-2/60 transition-colors disabled:opacity-50">
                    Cancelar
                  </button>
                )}
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
            <button onClick={() => setMostrarConfirmarConsulta(true)} disabled={!consultaHabilitada || consultando}
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

        {/* ================= ZONA B2: verificación de identidad ================= */}
        <VerificacionIdentidadModal variant="inline" />

        {/* ================= ZONA C: documentos ================= */}
        <div className="bg-gradient-to-br from-surface/95 via-surface-2/80 to-surface/95 border border-line/15 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <StepDot n={3} done={otrosDocumentos.length > 0} />
            <div>
              <h2 className="text-content font-bold">Mis documentos</h2>
              <p className="text-muted text-xs">Entre más documentos tenga cargados, más información podrán verificar las empresas sobre usted. Suba su hoja de vida, certificaciones y cualquier otro documento que considere relevante para respaldar su perfil.</p>
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
                    <button onClick={() => setConfirmarEliminar({ tipo: "documento", id: d.id, nombre: d.tipo_label })}
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

        {/* ================= ZONA C1: credenciales emitidas ================= */}
        <div className="bg-gradient-to-br from-surface/95 via-surface-2/80 to-surface/95 border border-line/15 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <StepDot n={4} done={credenciales.length > 0} />
            <div>
              <h2 className="text-content font-bold">Mis credenciales</h2>
              <p className="text-muted text-xs">Credenciales oficiales emitidas para su wallet. Puede descargar el PDF o abrir la verificación pública.</p>
            </div>
          </div>

          {credenciales.length === 0 ? (
            <p className="text-muted text-xs">Aún no tienes credenciales emitidas.</p>
          ) : (
            <ul className="space-y-2">
              {credenciales.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-2/50 border border-line/10 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-content text-sm font-semibold truncate">{c.esquema}</p>
                    <p className="text-muted text-[11px] truncate">
                      {c.organizacion ? `${c.organizacion} · ` : ""}Emitida {new Date(c.created_at).toLocaleString("es-CO")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badgeClasses(c.estado)}`}>
                      {c.estado}
                    </span>
                    <button type="button" onClick={() => descargarCredencialPDF(c.id)}
                      className="text-xs font-semibold text-emerald-300 hover:text-emerald-200">
                      PDF
                    </button>
                    {c.url_verificacion && (
                      <a href={c.url_verificacion} target="_blank" rel="noreferrer"
                        className="text-xs font-semibold text-sky-300 hover:text-sky-200">
                        Verificar ↗
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ================= ZONA C2: certificaciones laborales ================= */}
        <div className="bg-gradient-to-br from-surface/95 via-surface-2/80 to-surface/95 border border-line/15 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <StepDot n={5} done={certificaciones.length > 0} />
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
                  <button onClick={() => setConfirmarEliminar({ tipo: "certificacion", id: c.id, nombre: `${c.cargo} · ${c.empresa}` })}
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
            <StepDot n={6} done={titulos.length > 0} />
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
                  <button onClick={() => setConfirmarEliminar({ tipo: "titulo", id: t.id, nombre: `${t.programa} · ${t.institucion}` })} className="text-muted hover:text-red-400 transition-colors shrink-0" title="Eliminar">
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
            <StepDot n={7} done={referencias.length > 0} />
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
                  <button onClick={() => setConfirmarEliminar({ tipo: "referencia", id: r.id, nombre: r.nombre })} className="text-muted hover:text-red-400 transition-colors shrink-0" title="Eliminar">
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
      {mostrarConfirmarConsulta && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4"
          onClick={() => !consultando && setMostrarConfirmarConsulta(false)}>
          <div className="relative w-full max-w-md bg-surface border border-line/15 rounded-2xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setMostrarConfirmarConsulta(false)} disabled={consultando}
              className="absolute top-3 right-3 text-muted hover:text-content disabled:opacity-40">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-content font-bold text-lg pr-6">Confirme sus datos</h3>
            <p className="text-muted text-xs mt-1 mb-4">
              Esta consulta solo puede hacerse una vez y sus datos quedarán bloqueados para edición. Verifique que
              todo esté correcto antes de continuar.
            </p>
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-line/10 bg-surface-2/50 p-4 mb-5">
              <Campo label="Nombre" value={`${estado?.candidato?.nombre || ""} ${estado?.candidato?.apellido || ""}`} />
              <Campo label="Documento" value={`${estado?.candidato?.tipo_doc || ""} ${estado?.candidato?.cedula || ""}`} />
              <Campo label="Fecha de expedición" value={estado?.candidato?.fecha_expedicion} />
              <Campo label="Lugar de expedición" value={estado?.candidato?.lugar_expedicion} />
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setMostrarConfirmarConsulta(false)} disabled={consultando}
                className="flex-1 px-4 py-2.5 rounded-lg border border-line/20 text-content text-sm font-semibold hover:bg-surface-2/60 transition-colors disabled:opacity-40">
                Cancelar
              </button>
              <button
                onClick={async () => {
                  setMostrarConfirmarConsulta(false);
                  await iniciarConsulta();
                }}
                disabled={consultando}
                className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors disabled:opacity-50">
                {consultando ? "Iniciando…" : "Aceptar y consultar"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {mostrarReautenticar && (
        <ReautenticarCompartirModal
          rostroRegistrado={!!estado?.rostro_registrado}
          telefonoVerificado={!!estado?.telefono_verificado}
          telefono={estado?.candidato?.telefono}
          setToast={setToast}
          onCancelar={() => setMostrarReautenticar(false)}
          onConfirmado={() => {
            setMostrarReautenticar(false);
            setMostrarSelectorCompartir(true);
          }}
        />
      )}
      {mostrarSelectorCompartir && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4"
          onClick={() => setMostrarSelectorCompartir(false)}>
          <div className="relative w-full max-w-sm bg-surface border border-line/15 rounded-2xl shadow-2xl p-6 max-h-[85vh] overflow-y-auto"
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
                <div key={a.key} className="rounded-xl border border-line/10 bg-surface-2/50 hover:border-emerald-500/30 transition-colors overflow-hidden">
                  <label className="flex items-start gap-3 px-4 py-3 cursor-pointer">
                    <input type="checkbox" className="mt-1 accent-emerald-500"
                      checked={atributosCompartir.includes(a.key)}
                      onChange={() => toggleAtributoCompartir(a.key)} />
                    <span>
                      <span className="block text-content text-sm font-semibold">{a.label}</span>
                      <span className="block text-muted text-[11px]">{a.detalle}</span>
                    </span>
                  </label>
                  {/* Divulgación selectiva dentro de "Antecedentes": elegir
                     fuente por fuente (Policía, Procuraduría, ...) en vez de
                     compartir el bloque completo de una vez. */}
                  {a.key === "antecedentes" && atributosCompartir.includes("antecedentes") && (
                    <div className="border-t border-line/10 bg-surface/40 px-4 py-3 space-y-1.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-muted text-[11px] font-semibold uppercase tracking-wide">Fuentes a mostrar</span>
                        <button type="button"
                          onClick={() => setFuentesAntecedentesCompartir(
                            fuentesAntecedentesCompartir.length === FUENTES_ANTECEDENTES_INFO.length
                              ? [] : FUENTES_ANTECEDENTES_INFO.map((f) => f.key)
                          )}
                          className="text-[11px] text-emerald-300 hover:text-emerald-200 font-semibold">
                          {fuentesAntecedentesCompartir.length === FUENTES_ANTECEDENTES_INFO.length ? "Ninguna" : "Todas"}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                        {FUENTES_ANTECEDENTES_INFO.map((f) => (
                          <label key={f.key} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="accent-emerald-500 w-3.5 h-3.5"
                              checked={fuentesAntecedentesCompartir.includes(f.key)}
                              onChange={() => toggleFuenteAntecedentes(f.key)} />
                            <span className="text-content text-xs">{f.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button onClick={() => compartir(atributosCompartir, fuentesAntecedentesCompartir)}
              disabled={atributosCompartir.length === 0 || (atributosCompartir.includes("antecedentes") && fuentesAntecedentesCompartir.length === 0)}
              className="mt-5 w-full px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors">
              Generar QR con lo seleccionado
            </button>
            <button onClick={() => compartirLlave(atributosCompartir, fuentesAntecedentesCompartir)}
              disabled={atributosCompartir.length === 0 || (atributosCompartir.includes("antecedentes") && fuentesAntecedentesCompartir.length === 0)}
              className="mt-2 w-full px-5 py-2.5 rounded-lg border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold transition-colors">
              Generar llave para empresa (7 días)
            </button>
          </div>
        </div>,
        document.body
      )}
      {confirmarEliminar && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4"
          onClick={() => !eliminando && setConfirmarEliminar(null)}>
          <div className="relative w-full max-w-sm bg-surface border border-line/15 rounded-2xl shadow-2xl p-6 text-center"
            onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-3 flex items-center justify-center w-12 h-12 rounded-full bg-red-500/15 border border-red-500/30">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-content font-bold text-lg">¿Eliminar este elemento?</h3>
            <p className="text-muted text-xs mt-2">
              {confirmarEliminar.nombre ? <span className="text-content font-semibold">"{confirmarEliminar.nombre}"</span> : "Este elemento"} se eliminará permanentemente. Esta acción no se puede deshacer.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <button type="button" onClick={() => setConfirmarEliminar(null)} disabled={eliminando}
                className="flex-1 px-5 py-2.5 rounded-lg border border-line/20 text-content text-sm font-semibold hover:bg-surface-2/60 transition-colors disabled:opacity-50">
                Cancelar
              </button>
              <button type="button" onClick={confirmarYEliminar} disabled={eliminando}
                className="flex-1 px-5 py-2.5 rounded-lg bg-red-500 hover:bg-red-400 text-white text-sm font-semibold transition-colors disabled:opacity-50">
                {eliminando ? "Eliminando…" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {llave && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4"
          onClick={() => setLlave(null)}>
          <div className="relative w-full max-w-sm bg-surface border border-line/15 rounded-2xl shadow-2xl p-6 text-center"
            onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setLlave(null)} className="absolute top-3 right-3 text-muted hover:text-content text-lg leading-none">✕</button>
            <h3 className="text-content font-bold text-lg">Llave para empresa</h3>
            <p className="text-muted text-xs mt-1 mb-4">
              Comparte esta llave con la empresa (por WhatsApp, correo o en persona). La empresa la ingresa en “Consultar Wallet”.
            </p>
            <div className="bg-surface-2/70 border border-emerald-500/30 rounded-xl py-4">
              <span className="text-emerald-300 font-mono text-2xl font-bold tracking-widest">{llave.clave}</span>
            </div>
            <button
              onClick={() => { navigator.clipboard?.writeText(llave.clave); setToast({ type: "success", message: "Llave copiada." }); }}
              className="mt-4 w-full px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors">
              Copiar llave
            </button>
            <p className="text-muted text-[11px] mt-3">
              Vence: {new Date(llave.expires_at).toLocaleString()} · {llave.max_consultas ? `${llave.max_consultas} consultas` : "consultas ilimitadas"}
            </p>
          </div>
        </div>,
        document.body
      )}
      {qr && createPortal(
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
        </div>,
        document.body
      )}
    </section>
  );
}

/* Reconfirmación de identidad (FaceID o SMS) justo antes de compartir datos
 * por QR/llave — usa lo que el titular ya tenga registrado; si tiene ambos,
 * lo deja elegir; si no tiene ninguno, bloquea y explica qué falta. */
function ReautenticarCompartirModal({ rostroRegistrado, telefonoVerificado, telefono, setToast, onCancelar, onConfirmado }) {
  const [metodo, setMetodo] = useState(
    rostroRegistrado && telefonoVerificado ? null : rostroRegistrado ? "rostro" : telefonoVerificado ? "sms" : "ninguno"
  );

  if (metodo === "ninguno" || (!rostroRegistrado && !telefonoVerificado)) {
    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4" onClick={onCancelar}>
        <div className="relative w-full max-w-sm bg-surface border border-line/15 rounded-2xl shadow-2xl p-6 text-center" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-content font-bold text-lg">Confirme su identidad primero</h3>
          <p className="text-muted text-xs mt-2">
            Para compartir sus datos necesita tener registrado su rostro (Face ID) o su celular verificado por SMS.
            Complete al menos uno de los dos en la sección de Verificación de identidad.
          </p>
          <button onClick={onCancelar}
            className="mt-5 w-full px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors">
            Entendido
          </button>
        </div>
      </div>,
      document.body
    );
  }

  if (metodo === null) {
    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4" onClick={onCancelar}>
        <div className="relative w-full max-w-sm bg-surface border border-line/15 rounded-2xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-content font-bold text-lg">Confirme que es usted</h3>
          <p className="text-muted text-xs mt-1 mb-4">
            Antes de generar el QR, elija cómo quiere reconfirmar su identidad.
          </p>
          <div className="space-y-2">
            <button onClick={() => setMetodo("rostro")}
              className="w-full text-left rounded-xl border border-line/10 bg-surface-2/50 hover:border-emerald-500/30 px-4 py-3 transition-colors">
              <span className="block text-content text-sm font-semibold">Face ID</span>
              <span className="block text-muted text-[11px]">Tome una foto de su rostro para compararla con la registrada.</span>
            </button>
            <button onClick={() => setMetodo("sms")}
              className="w-full text-left rounded-xl border border-line/10 bg-surface-2/50 hover:border-emerald-500/30 px-4 py-3 transition-colors">
              <span className="block text-content text-sm font-semibold">Código SMS</span>
              <span className="block text-muted text-[11px]">Reciba un código en su celular verificado ({telefono}).</span>
            </button>
          </div>
          <button onClick={onCancelar} className="mt-4 w-full text-center text-xs text-muted hover:text-content">
            Cancelar
          </button>
        </div>
      </div>,
      document.body
    );
  }

  if (metodo === "rostro") {
    return <ReautenticarRostroPaso onCancelar={onCancelar} onConfirmado={onConfirmado} setToast={setToast} />;
  }
  return <ReautenticarSmsPaso telefono={telefono} onCancelar={onCancelar} onConfirmado={onConfirmado} setToast={setToast} />;
}

function ReautenticarRostroPaso({ onCancelar, onConfirmado, setToast }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [camaraLista, setCamaraLista] = useState(false);
  const [errorCamara, setErrorCamara] = useState("");
  const [verificando, setVerificando] = useState(false);

  useEffect(() => {
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
    iniciarCamara();
    return () => {
      activo = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const confirmar = async () => {
    if (!videoRef.current?.videoWidth || verificando) return;
    setVerificando(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
      const foto = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
      const fd = new FormData();
      fd.append("foto", foto, "reautenticacion.jpg");
      const res = await fetch(`${API_URL}/api/wallet/identidad/rostro/verificar/`, {
        method: "POST",
        headers: authHeaders(),
        body: fd,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.coincide) {
        setToast({ type: "error", message: data?.error || "El rostro no coincide. Intente de nuevo." });
        return;
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      onConfirmado();
    } catch {
      setToast({ type: "error", message: "Error de conexión al verificar su rostro." });
    } finally {
      setVerificando(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4" onClick={onCancelar}>
      <div className="relative w-full max-w-sm bg-surface border border-line/15 rounded-2xl shadow-2xl p-6 flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <motion.span
          className="relative flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/20 mb-3"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ScanFace className="w-7 h-7 text-emerald-400" />
          {camaraLista && !verificando && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 border-2 border-surface">
              <Check className="w-3 h-3 text-white" />
            </span>
          )}
        </motion.span>
        <h3 className="text-content font-bold text-lg">Verifique su rostro</h3>
        <p className="text-muted text-xs mt-1 mb-4 text-center">
          Acérquese y ubique su rostro dentro del óvalo.
        </p>
        {errorCamara ? (
          <p className="text-red-300 text-xs text-center">{errorCamara}</p>
        ) : (
          <div className="relative w-52 h-64">
            {/* Máscara ovalada (más alta que ancha, como el contorno de una
               cara): solo se ve el rostro, sin el fondo rectangular del
               video crudo. El video es más grande que el óvalo visible para
               que el recorte no deje bordes rectos asomando. */}
            <div className={`absolute inset-0 rounded-[50%] overflow-hidden border-2 ${
              camaraLista ? "border-emerald-500/60 animate-face-scan-pulse" : "border-line/20"
            } bg-surface-2/70`}>
              <video ref={videoRef} autoPlay playsInline muted
                className="absolute top-1/2 left-1/2 w-[150%] h-[130%] -translate-x-1/2 -translate-y-1/2 object-cover scale-x-[-1]" />
              {camaraLista && !verificando && (
                <span className="absolute left-0 right-0 h-0.5 bg-emerald-400/90 shadow-[0_0_10px_2px_rgba(16,185,129,0.7)] animate-face-scan-line" />
              )}
              {verificando && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="w-8 h-8 rounded-full border-3 border-emerald-500/30 border-t-emerald-400 animate-spin" />
                </div>
              )}
            </div>
          </div>
        )}
        <div className="flex items-center gap-3 mt-5 w-full">
          <button type="button" onClick={onCancelar} className="text-xs text-muted hover:text-content">
            Cancelar
          </button>
          <button type="button" onClick={confirmar} disabled={!camaraLista || verificando}
            className="ml-auto px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
            {verificando ? "Verificando…" : "Confirmar"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ReautenticarSmsPaso({ telefono, onCancelar, onConfirmado, setToast }) {
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [verificando, setVerificando] = useState(false);

  useEffect(() => {
    let activo = true;
    (async () => {
      setEnviando(true);
      try {
        const res = await fetch(`${API_URL}/api/wallet/identidad/sms/enviar/`, {
          method: "POST",
          headers: { ...authHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({ telefono }),
        });
        const data = await res.json().catch(() => null);
        if (!activo) return;
        if (!res.ok) {
          setToast({ type: "error", message: data?.error || "No se pudo enviar el código." });
          return;
        }
        setCodigoEnviado(true);
      } catch {
        if (activo) setToast({ type: "error", message: "Error de conexión al enviar el código." });
      } finally {
        if (activo) setEnviando(false);
      }
    })();
    return () => { activo = false; };
  }, [telefono, setToast]);

  const confirmar = async () => {
    if (codigo.trim().length !== 6 || verificando) return;
    setVerificando(true);
    try {
      const res = await fetch(`${API_URL}/api/wallet/identidad/sms/verificar/`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ telefono, codigo: codigo.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setToast({ type: "error", message: data?.error || "Código incorrecto." });
        return;
      }
      onConfirmado();
    } catch {
      setToast({ type: "error", message: "Error de conexión al verificar el código." });
    } finally {
      setVerificando(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4" onClick={onCancelar}>
      <div className="relative w-full max-w-sm bg-surface border border-line/15 rounded-2xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-content font-bold text-lg">Ingrese el código</h3>
        <p className="text-muted text-xs mt-1 mb-4">
          {enviando ? `Enviando código a ${telefono}…` : codigoEnviado ? `Enviamos un código de 6 dígitos a ${telefono}.` : "No se pudo enviar el código."}
        </p>
        <input type="text" inputMode="numeric" maxLength={6} value={codigo}
          onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
          placeholder="000000"
          className="w-full px-3 py-2 rounded-lg bg-surface-2/70 border border-line/15 text-content text-lg tracking-[0.3em] text-center placeholder:text-muted/40 focus:outline-none focus:border-emerald-500/50" />
        <div className="flex items-center gap-3 mt-4">
          <button type="button" onClick={onCancelar} className="text-xs text-muted hover:text-content">
            Cancelar
          </button>
          <button type="button" onClick={confirmar} disabled={codigo.trim().length !== 6 || verificando || !codigoEnviado}
            className="ml-auto px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
            {verificando ? "Verificando…" : "Confirmar"}
          </button>
        </div>
      </div>
    </div>,
    document.body
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
      {done ? <Check className="w-4 h-4" /> : n}
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
