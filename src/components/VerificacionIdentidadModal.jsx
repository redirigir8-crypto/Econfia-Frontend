import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  BookOpen,
  Camera,
  Check,
  CheckCircle2,
  Download,
  FileCheck2,
  FileText,
  Globe,
  History,
  IdCard,
  Lock,
  MessageCircle,
  ShieldQuestion,
  Smartphone,
  Smile,
  Stamp,
  Trash2,
} from "lucide-react";
import Toast from "./Toast";
import { useTheme } from "../context/ThemeContext";
import { evaluarCalidadCaptura } from "../utils/calidadImagen";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Nombre del documento a verificar según lo que el candidato declaró en
// "Sus datos" — el flujo de verificación es el mismo (OCR + captura), pero
// referirse siempre a "cédula" confunde a quien tiene pasaporte, CE, PP o Visa.
const NOMBRE_DOCUMENTO_POR_TIPO = {
  CE: "cédula de extranjería",
  PA: "pasaporte",
  PP: "permiso de permanencia",
  VISA: "visa",
};

function nombreDocumento(tipoDoc) {
  return NOMBRE_DOCUMENTO_POR_TIPO[tipoDoc] || "cédula";
}

// Solo CC/CE/PA/PP/VISA tienen OCR real en el backend (dispatch por tipo,
// ver core/ocr_documentos.py) — el selector del modal de verificación no
// ofrece TI/PPT genérico para no arriesgar falsos rechazos por un patrón
// de documento que no coincide.
const TIPOS_DOC_VERIFICABLES = [
  { value: "CC", label: "Cédula de Ciudadanía", icono: IdCard },
  { value: "CE", label: "Cédula de Extranjería", icono: Globe },
  { value: "PA", label: "Pasaporte", icono: BookOpen },
  { value: "PP", label: "Permiso de Permanencia", icono: BadgeCheck },
  { value: "VISA", label: "Visa", icono: Stamp },
];

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
  // Si el envío real falla, el backend ya rechaza la solicitud como error
  // (no llega hasta acá) — no hay guardado silencioso de un código que el
  // usuario nunca recibió. `simulado` solo aparece en desarrollo, sin
  // Twilio configurado.
  if (data?.simulado) {
    return "Código generado (modo de prueba: aún no hay SMS real configurado).";
  }
  return "Código enviado por SMS.";
}

/**
 * variant="modal" (default): se usa desde Perfil, siempre como overlay con
 * las 3 tarjetas visibles (para reactivar/re-registrar cualquier método,
 * esté o no completo).
 * variant="inline": se usa embebido dentro de econfiaWallet, sin overlay,
 * mostrando el resumen de 3 iconos grandes siempre + las tarjetas de acción
 * SOLO de lo que aún falte por verificar (se ocultan una a una al
 * completarse, y si las 3 ya están hechas no se muestra ninguna tarjeta).
 */
export default function VerificacionIdentidadModal({ onClose, variant = "modal" }) {
  const [estado, setEstado] = useState(null);
  const [toast, setToast] = useState(null);

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
  const [exportandoHistorial, setExportandoHistorial] = useState(false);
  const [revocandoPropio, setRevocandoPropio] = useState("");
  const [mostrarEliminarDatos, setMostrarEliminarDatos] = useState(false);
  const [eliminandoDatos, setEliminandoDatos] = useState(false);
  // Documentos propios, usados solo para saber si la cédula ya quedó
  // verificada (HistorialIdentidadModal) — este componente no necesita la
  // lista general de "otros documentos" de la zona C de EconfiaWallet.jsx.
  const [documentos, setDocumentos] = useState([]);

  const { organizacion } = useTheme();
  const nombreWallet = organizacion?.nombre_wallet_efectivo || "econfiaWallet";

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

  const cargarDocumentos = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/wallet/documentos/`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) setDocumentos(data.documentos || []);
    } catch {
      /* silencioso */
    }
  }, []);

  useEffect(() => {
    cargarEstado();
    cargarDocumentos();
  }, [cargarEstado, cargarDocumentos]);

  // Necesaria tanto para HistorialIdentidadModal como para el resumen de
  // 3 iconos y para decidir qué tarjeta de acción ocultar en variant="inline".
  const cedulaVerificada = documentos.some((d) => d.tipo === "cedula" && d.estado_verificacion === "verificado");

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
    cargarDocumentos();
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

  const faltaRostro = !estado?.rostro_registrado;
  const faltaDocumento = !cedulaVerificada;
  const faltaTelefono = !estado?.telefono_verificado;
  const esInline = variant === "inline";

  // En variant="inline" (embebido en econfiaWallet) cada tarjeta de acción
  // solo se muestra mientras falte — una vez completada, su gestión pasa a
  // vivir exclusivamente en el modal de Configuración (Perfil). En
  // variant="modal" (el propio Configuración) las 3 siempre se muestran,
  // para poder reactivar/re-registrar cualquiera esté o no completa.
  const mostrarTarjetaRostro = !esInline || faltaRostro;
  const mostrarTarjetaDocumento = !esInline || faltaDocumento;
  const mostrarTarjetaTelefono = !esInline || faltaTelefono;
  const todoCompleto = !faltaRostro && !faltaDocumento && !faltaTelefono;

  const resumenIconos = (
    <div className="grid grid-cols-3 gap-3 mb-4">
      {[
        { falta: faltaRostro, Icono: Smile, label: "Rostro" },
        { falta: faltaDocumento, Icono: IdCard, label: "Documento" },
        { falta: faltaTelefono, Icono: MessageCircle, label: "Celular" },
      ].map(({ falta, Icono, label }) => (
        <div
          key={label}
          className={`flex flex-col items-center gap-1.5 rounded-2xl border py-4 transition-colors ${
            falta
              ? "border-line/15 bg-surface-2/40"
              : "border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
          }`}
        >
          <span className={`relative flex items-center justify-center w-12 h-12 rounded-full ${
            falta ? "bg-surface-2/70" : "bg-emerald-500/20"
          }`}>
            <Icono className={`w-6 h-6 ${falta ? "text-muted" : "text-emerald-400"}`} />
            {!falta && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 border-2 border-surface">
                <Check className="w-3 h-3 text-white" />
              </span>
            )}
          </span>
          <span className={`text-xs font-bold ${falta ? "text-muted" : "text-emerald-400"}`}>{label}</span>
          <span className="text-[10px] text-muted">{falta ? "Pendiente" : "Verificado"}</span>
        </div>
      ))}
    </div>
  );

  const contenido = (
    <>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {resumenIconos}

      {esInline && todoCompleto ? (
        <p className="text-muted text-xs text-center py-2 mb-1">
          Ya completó las 3 verificaciones. Gestiónelas desde su Perfil si necesita reactivar alguna.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2 mb-4">
          <button type="button" onClick={abrirPoliticaBiometrica}
            className="group flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 hover:border-emerald-400 pl-2.5 pr-3.5 py-1.5 text-emerald-300 hover:text-emerald-200 text-xs font-semibold transition-all hover:shadow-md hover:shadow-emerald-500/20">
            <ShieldQuestion className="w-4 h-4 flex-shrink-0" />
            ¿Qué pasa con la foto de mi rostro?
          </button>
          <button type="button" onClick={abrirConsentimientos}
            className="group flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 hover:border-emerald-400 pl-2.5 pr-3.5 py-1.5 text-emerald-300 hover:text-emerald-200 text-xs font-semibold transition-all hover:shadow-md hover:shadow-emerald-500/20">
            <FileCheck2 className="w-4 h-4 flex-shrink-0" />
            Ver mis autorizaciones otorgadas
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {mostrarTarjetaRostro && (
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
          <span className="text-2xl">
            {estado?.rostro_registrado
              ? <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              : <Smile className="w-6 h-6 text-muted" />}
          </span>
          <span>
            <span className="block text-content text-sm font-semibold">
              {estado?.rostro_registrado ? "Cara registrada" : "Verificar rostro"}
            </span>
            <span className="block text-muted text-[11px]">
              {estado?.rostro_registrado ? "Toque para volver a registrar" : "Registro facial (Face ID)"}
            </span>
          </span>
        </button>
        )}
        {mostrarTarjetaDocumento && (
        <button type="button" onClick={() => setModalVerificacion("cedula")}
          className="flex items-center gap-3 rounded-xl bg-surface-2/50 border border-line/10 hover:border-emerald-500/40 px-4 py-3 text-left transition-colors">
          <span className="text-2xl"><IdCard className="w-6 h-6 text-brand" /></span>
          <span>
            <span className="block text-content text-sm font-semibold">
              Verificar documento
            </span>
            <span className="block text-muted text-[11px]">Cédula, extranjería o pasaporte</span>
          </span>
        </button>
        )}
        {mostrarTarjetaTelefono && (
        <button type="button" onClick={() => setModalVerificacion("sms")}
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
            estado?.telefono_verificado
              ? "bg-emerald-500/10 border-emerald-500/40"
              : "bg-surface-2/50 border-line/10 hover:border-emerald-500/40"
          }`}>
          <span className="text-2xl">
            {estado?.telefono_verificado
              ? <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              : <MessageCircle className="w-6 h-6 text-muted" />}
          </span>
          <span>
            <span className="block text-content text-sm font-semibold">
              {estado?.telefono_verificado ? "Celular verificado" : "Verificar por SMS"}
            </span>
            <span className="block text-muted text-[11px]">Código enviado a su celular</span>
          </span>
        </button>
        )}
      </div>

      {!esInline && (
      <>
      <button type="button" onClick={abrirDispositivos}
        className="mt-3 w-full flex items-center gap-3 rounded-xl border border-line/10 bg-surface-2/50 hover:border-emerald-500/40 px-4 py-3 text-left transition-colors">
        <span className="text-xl"><Smartphone className="w-5 h-5 text-brand" /></span>
        <span className="flex-1">
          <span className="block text-content text-sm font-semibold">Dispositivos con sesión activa</span>
          <span className="block text-muted text-[11px]">Vea desde dónde han iniciado sesión en su cuenta</span>
        </span>
      </button>

      <button type="button" onClick={cerrarSesionesEnTodosLosDispositivos} disabled={cerrandoSesiones}
        className="mt-3 w-full flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 px-4 py-3 text-left transition-colors disabled:opacity-50">
        <span className="text-xl"><Lock className="w-5 h-5 text-red-300" /></span>
        <span className="flex-1">
          <span className="block text-red-300 text-sm font-semibold">¿Perdió su celular?</span>
          <span className="block text-muted text-[11px]">Cerrar sesión en todos los demás dispositivos</span>
        </span>
        {cerrandoSesiones && <Spinner tono="rojo" />}
      </button>

      <button type="button" onClick={abrirHistorial}
        className="mt-2 w-full flex items-center gap-3 rounded-xl border border-line/10 bg-surface-2/50 hover:border-emerald-500/40 px-4 py-3 text-left transition-colors">
        <span className="text-xl"><History className="w-5 h-5 text-brand" /></span>
        <span className="flex-1">
          <span className="block text-content text-sm font-semibold">Ver historial de identidad</span>
          <span className="block text-muted text-[11px]">Registros, verificaciones y revocaciones de su cuenta</span>
        </span>
      </button>

      <button type="button" onClick={() => setMostrarEliminarDatos(true)}
        className="mt-4 w-full flex items-center gap-3 rounded-xl border border-red-500/40 bg-red-500/10 hover:bg-red-500/15 px-4 py-3 text-left transition-colors">
        <span className="text-xl"><Trash2 className="w-5 h-5 text-red-300" /></span>
        <span className="flex-1">
          <span className="block text-red-300 text-sm font-semibold">Eliminar todos mis datos de Wallet</span>
          <span className="block text-muted text-[11px]">Rostro, documentos, títulos, referencias y consentimientos. No se puede deshacer.</span>
        </span>
      </button>
      </>
      )}
    </>
  );

  return esInline ? (
    <div className="bg-gradient-to-br from-surface/95 via-surface-2/80 to-surface/95 border border-line/15 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <ShieldQuestion className="w-6 h-6 text-brand flex-shrink-0" />
        <div>
          <h2 className="text-content font-bold">Verificación de identidad</h2>
          <p className="text-muted text-xs">Confirme su identidad con estos métodos. Su cédula se carga y valida aquí, no en el formulario de documentos genérico.</p>
        </div>
      </div>
      {contenido}
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
        <VerificarCedulaModal
          onClose={() => setModalVerificacion(null)}
          setToast={setToast}
          onVerificado={cargarEstado}
          tipoDoc={estado?.candidato?.tipo_doc}
          onTipoDocFijado={cargarEstado}
        />
      )}
      {modalVerificacion === "sms" && (
        <VerificarSmsModal onClose={() => setModalVerificacion(null)} setToast={setToast} datosTelefono={estado?.candidato?.telefono} onVerificado={cargarEstado} />
      )}
      {mostrarHistorial && (
        <HistorialIdentidadModal
          onClose={() => setMostrarHistorial(false)}
          eventos={historial}
          cargando={cargandoHistorial}
          onExportar={exportarHistorialPdf}
          exportando={exportandoHistorial}
          estado={estado}
          cedulaVerificada={cedulaVerificada}
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
    </div>
  ) : (
    <VerifModalShell
      title="Verificación de identidad"
      subtitle="Confirme su identidad con estos métodos. Su cédula se carga y valida aquí, no en el formulario de documentos genérico."
      onClose={onClose}>
      {contenido}
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
        <VerificarCedulaModal
          onClose={() => setModalVerificacion(null)}
          setToast={setToast}
          onVerificado={cargarEstado}
          tipoDoc={estado?.candidato?.tipo_doc}
          onTipoDocFijado={cargarEstado}
        />
      )}
      {modalVerificacion === "sms" && (
        <VerificarSmsModal onClose={() => setModalVerificacion(null)} setToast={setToast} datosTelefono={estado?.candidato?.telefono} onVerificado={cargarEstado} />
      )}
      {mostrarHistorial && (
        <HistorialIdentidadModal
          onClose={() => setMostrarHistorial(false)}
          eventos={historial}
          cargando={cargandoHistorial}
          onExportar={exportarHistorialPdf}
          exportando={exportandoHistorial}
          estado={estado}
          cedulaVerificada={cedulaVerificada}
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
    </VerifModalShell>
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
  registro_rostro: Smile,
  verificacion_rostro: CheckCircle2,
  verificacion_cedula: IdCard,
  verificacion_telefono: MessageCircle,
  revocacion: Lock,
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
        {exportando ? <Spinner /> : <Download className="w-4 h-4" />} Exportar historial en PDF
      </button>

      {cargando ? (
        <div className="flex justify-center py-6"><Spinner /></div>
      ) : eventos.length === 0 ? (
        <p className="text-muted text-xs text-center py-6">Aún no hay eventos registrados.</p>
      ) : (
        <ul className="flex flex-col gap-3 max-h-[45vh] overflow-y-auto">
          {eventos.map((ev, i) => {
            const IconoEvento = ICONO_EVENTO[ev.tipo];
            return (
            <li key={i} className="flex items-start gap-3 rounded-xl bg-surface-2/50 border border-line/10 px-4 py-3">
              <span className="text-xl">
                {IconoEvento ? <IconoEvento className="w-5 h-5 text-brand" /> : <span className="w-1.5 h-1.5 rounded-full bg-muted inline-block" />}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${ev.tipo === "revocacion" ? "text-red-300" : "text-content"}`}>
                  {ev.descripcion}
                </p>
                {ev.motivo && <p className="text-muted text-[11px] mt-0.5">{ev.motivo}</p>}
                <p className="text-muted text-[11px] mt-0.5">{new Date(ev.fecha).toLocaleString("es-CO")}</p>
              </div>
            </li>
            );
          })}
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
              <span className="text-xl"><Smartphone className="w-5 h-5 text-brand" /></span>
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
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
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
      if (data?.simulado) {
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
          <AlertTriangle className="w-10 h-10 text-amber-400" />
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

export function VerificarCedulaModal({ onClose, setToast, onVerificado }) {
  const [modo, setModo] = useState(null); // null | "camara" | "archivo"
  const [paso, setPaso] = useState("frente"); // frente | reverso | listo
  const [capturas, setCapturas] = useState({ frente: null, reverso: null });
  const [archivo, setArchivo] = useState(null);
  const [archivoReverso, setArchivoReverso] = useState(null);
  const [ppTieneReverso, setPpTieneReverso] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [camaraLista, setCamaraLista] = useState(false);
  const [errorCamara, setErrorCamara] = useState("");
  // Quality gate del lado cliente (Fase 5): si la foto sale borrosa o mal
  // expuesta, se rechaza AQUÍ MISMO (sin gastar un viaje de red) y se
  // muestra el motivo — el usuario repite la captura del mismo paso sin
  // avanzar. El backend sigue siendo la autoridad final (ver Fase 3), esto
  // solo evita la espera de subir una foto que de todas formas se iba a
  // rechazar.
  const [avisoCalidad, setAvisoCalidad] = useState("");
  const [capturando, setCapturando] = useState(false);
  // Cuenta fallos consecutivos de OCR ilegible (foto que ni siquiera se pudo
  // leer, no un dato que no coincide) para dar consejos cada vez más
  // específicos en vez de repetir el mismo mensaje genérico (IDV-02).
  const [intentosOcrIlegible, setIntentosOcrIlegible] = useState(0);
  // Mientras el documento queda "pendiente" (Celery consultando
  // Registraduría en segundo plano), se hace polling en vez de cerrar el
  // modal de inmediato, para mostrar el resultado final.
  const [verificando, setVerificando] = useState(false);
  const pollDocRef = useRef(null);
  const pollDocTokenRef = useRef(0);
  // El tipo de documento de "Sus datos" (formulario base) es solo un dato
  // de identidad y casi siempre ya viene fijo (arranca en "CC" por
  // defecto) — no sirve para saber qué va a fotografiar el usuario AHORA.
  // Por eso esta verificación pregunta siempre CC/CE/Pasaporte al abrir,
  // sin leer ni modificar ese campo: es una elección local, solo para
  // decidir el texto/OCR de esta sesión de verificación.
  const [tipoDocLocal, setTipoDocLocal] = useState(null);

  const documento = nombreDocumento(tipoDocLocal);
  const dosCaras = tipoDocLocal === "CC" || tipoDocLocal === "CE" || (tipoDocLocal === "PP" && ppTieneReverso);
  const ORDEN = dosCaras ? ["frente", "reverso"] : ["frente"];
  const esPdf = archivo?.type === "application/pdf" || /\.pdf$/i.test(archivo?.name || "");
  const instrucciones = dosCaras ? "Capture primero el frente y después el reverso."
    : tipoDocLocal === "PA" ? "Capture la página biográfica de su pasaporte."
    : tipoDocLocal === "VISA" ? "Capture únicamente la página o sección donde aparece la visa."
    : "Capture la cara que contiene los datos de su permiso.";
  const ETIQUETAS = {
    frente: tipoDocLocal === "PA" ? "Enfoque la página biográfica de su pasaporte"
      : tipoDocLocal === "VISA" ? "Enfoque únicamente la página o sección de la visa"
      : `Enfoque el frente de su ${documento}`,
    reverso: `Ahora enfoque el reverso de su ${documento}`,
  };

  useEffect(() => {
    if (modo !== "camara" || paso === "listo") return undefined;
    let activo = true;
    setCamaraLista(false);
    setErrorCamara("");
    async function iniciarCamara() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } } });
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
    if (!videoRef.current?.videoWidth || !videoRef.current?.videoHeight || capturando) return;
    setAvisoCalidad("");
    setCapturando(true);

    const calidad = evaluarCalidadCaptura(videoRef.current);
    if (!calidad.aceptable) {
      // Rechazo local: no se guarda la captura ni se avanza de paso — el
      // usuario ve el motivo y puede intentar de nuevo con la cámara ya
      // abierta, sin perder los pasos ya completados. El backend (Fase 3)
      // sigue siendo la autoridad final; esto solo evita la espera de
      // subir una foto que de todas formas se iba a rechazar.
      setAvisoCalidad(calidad.motivos[0]);
      setCapturando(false);
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    const nuevasCapturas = { ...capturas, [paso]: dataUrl };
    setCapturas(nuevasCapturas);
    setCapturando(false);
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
    setAvisoCalidad("");
  };

  const volverAlInicio = () => {
    pollDocTokenRef.current += 1;
    if (pollDocRef.current) {
      clearTimeout(pollDocRef.current);
      pollDocRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setModo(null);
    setPaso("frente");
    setCapturas({ frente: null, reverso: null });
    setArchivo(null);
    setArchivoReverso(null);
    setCamaraLista(false);
    setErrorCamara("");
    setAvisoCalidad("");
  };

  const cerrarDocumento = () => {
    volverAlInicio();
    setTipoDocLocal(null);
    onClose();
  };

  // Consulta periódica del documento mientras está "pendiente" (Celery
  // corriendo verificar_documento_wallet contra Registraduría).
  // Tras ~2 minutos (30 intentos cada 4s) de seguir "pendiente" se deja de
  // esperar en silencio: puede pasar si Registraduría no responde y el
  // documento queda pendiente indefinidamente (sin reintento automático en
  // el backend) — mejor avisar al usuario que dejarlo esperando para siempre.
  useEffect(() => () => {
    pollDocTokenRef.current += 1;
    if (pollDocRef.current) clearTimeout(pollDocRef.current);
  }, []);

  const POLL_INTENTOS_MAX = 30;

  const pollearDocumento = (docId, onReintentar) => {
    setVerificando(true);
    const token = ++pollDocTokenRef.current;
    const activo = () => pollDocTokenRef.current === token;
    let intentos = 0;
    const tick = async () => {
      if (!activo()) return;
      intentos += 1;
      try {
        const res = await fetch(`${API_URL}/api/wallet/documentos/${docId}/`, { headers: authHeaders() });
        const doc = await res.json().catch(() => null);
        if (!activo()) return;
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
        cerrarDocumento();
      } catch {
        if (!activo()) return;
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
      if (data?.documento?.detalle_verificacion?.resultado === "revision_requerida") {
        setToast({ type: "info", message: data.documento.detalle_verificacion.mensaje || "El documento requiere revisión." });
        onVerificado?.();
        cerrarDocumento();
        return;
      }
      if (data?.documento?.estado_verificacion === "pendiente") {
        pollearDocumento(data.documento.id, onReintentar);
        return;
      }
      setToast({ type: "success", message: data?.documento?.estado_verificacion === "verificado" ? "Documento verificado correctamente." : "Documento recibido." });
      onVerificado?.();
      cerrarDocumento();
    } catch {
      setToast({ type: "error", message: "Error de conexión al verificar la cédula." });
    } finally {
      setEnviando(false);
    }
  };

  const enviarCapturas = async () => {
    if (!tipoDocLocal || !capturas.frente || (dosCaras && !capturas.reverso)) return;
    const fd = new FormData();
    fd.append("tipo", "cedula");
    fd.append("tipo_doc", tipoDocLocal);
    fd.append("archivo", dataUrlAArchivo(capturas.frente, "cedula-frente.jpg"));
    fd.append("captura_documento", "camara");
    if (dosCaras) fd.append("archivo_reverso", dataUrlAArchivo(capturas.reverso, "documento-reverso.jpg"));
    await enviarDocumento(fd, () => {
      setCapturas({ frente: null, reverso: null });
      setPaso("frente");
    });
  };

  const enviarArchivo = async (e) => {
    e.preventDefault();
    if (!archivo || (dosCaras && !esPdf && !archivoReverso)) {
      setToast({ type: "error", message: dosCaras ? "Seleccione ambas caras o un PDF que las contenga." : "Seleccione la imagen o PDF de su documento." });
      return;
    }
    const fd = new FormData();
    fd.append("tipo", "cedula");
    fd.append("tipo_doc", tipoDocLocal);
    fd.append("archivo", archivo);
    fd.append("captura_documento", "escaneada");
    if (dosCaras && !esPdf && archivoReverso) fd.append("archivo_reverso", archivoReverso);
    await enviarDocumento(fd, () => { setArchivo(null); setArchivoReverso(null); });
  };

  if (!tipoDocLocal) {
    return (
      <VerifModalShell
        title="¿Qué documento va a verificar?"
        subtitle="Elija el tipo de documento que va a fotografiar."
        onClose={onClose}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {TIPOS_DOC_VERIFICABLES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTipoDocLocal(t.value)}
              className="flex flex-col items-center gap-2 rounded-xl bg-surface-2/50 border border-line/10 hover:border-emerald-500/40 px-4 py-6 transition-colors"
            >
              <t.icono className="w-8 h-8 text-brand" />
              <span className="text-content text-sm font-semibold text-center">{t.label}</span>
            </button>
          ))}
        </div>
      </VerifModalShell>
    );
  }

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
      <VerifModalShell title={`Verificar ${documento}`} subtitle={instrucciones} onClose={onClose}>
        {tipoDocLocal === "PP" && (
          <fieldset className="mb-4 flex gap-4 text-sm">
            <legend className="mb-2">¿Su permiso tiene reverso?</legend>
            <label><input type="radio" name="ppCaras" checked={ppTieneReverso} onChange={() => setPpTieneReverso(true)} /> Sí, dos caras</label>
            <label><input type="radio" name="ppCaras" checked={!ppTieneReverso} onChange={() => setPpTieneReverso(false)} /> No, una cara</label>
          </fieldset>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button type="button" onClick={() => setModo("camara")}
            className="flex flex-col items-center gap-2 rounded-xl bg-surface-2/50 border border-line/10 hover:border-emerald-500/40 px-4 py-6 transition-colors">
            <Camera className="w-8 h-8 text-brand" />
            <span className="text-content text-sm font-semibold">Tomar fotos</span>
            <span className="text-muted text-[11px] text-center">{dosCaras ? "Frente y reverso con la cámara" : "Una página con la cámara"}</span>
          </button>
          <button type="button" onClick={() => setModo("archivo")}
            className="flex flex-col items-center gap-2 rounded-xl bg-surface-2/50 border border-line/10 hover:border-emerald-500/40 px-4 py-6 transition-colors">
            <FileText className="w-8 h-8 text-brand" />
            <span className="text-content text-sm font-semibold">Subir archivo</span>
            <span className="text-muted text-[11px] text-center">PDF o imagen ya escaneada</span>
          </button>
        </div>
      </VerifModalShell>
    );
  }

  if (modo === "archivo") {
    return (
      <VerifModalShell title={`Verificar ${documento}`} subtitle={dosCaras ? 'Suba ambas caras como imágenes o un PDF que las contenga.' : instrucciones} onClose={onClose}>
        <form onSubmit={enviarArchivo} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-content/80">Archivo (PDF o imagen, máx 10 MB)</label>
            <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp"
              onChange={(e) => setArchivo(e.target.files?.[0] || null)}
              className="text-xs text-content file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-emerald-500 file:text-white file:text-xs file:font-semibold hover:file:bg-emerald-400 file:cursor-pointer" />
            {archivo && <p className="text-muted text-[11px] truncate">{archivo.name}</p>}
            {dosCaras && !esPdf && (
              <label className="text-xs font-semibold text-content/80">
                Reverso (imagen, máx 10 MB)
                <input type="file" accept=".png,.jpg,.jpeg,.webp"
                  onChange={(e) => setArchivoReverso(e.target.files?.[0] || null)} />
              </label>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={volverAlInicio} className="text-xs text-muted hover:text-content">
              ← Cambiar método
            </button>
            <button type="submit" disabled={enviando}
              className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors disabled:opacity-50">
              {enviando && <Spinner />}
              {enviando ? "Procesando documento…" : `Verificar ${documento}`}
            </button>
          </div>
        </form>
      </VerifModalShell>
    );
  }

  return (
    <VerifModalShell title={`Verificar ${documento}`} subtitle={instrucciones} onClose={onClose}>
      {paso !== "listo" ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-content text-sm font-semibold">
            {capturando ? "Capturando…" : ETIQUETAS[paso]}
          </p>
          {errorCamara ? (
            <p className="text-red-300 text-xs text-center">{errorCamara}</p>
          ) : (
            <div className={`w-full aspect-[3/2] rounded-lg overflow-hidden border-2 bg-surface-2/70 flex items-center justify-center transition-colors ${
              avisoCalidad ? "border-red-500/60" : "border-emerald-500/50"
            }`}>
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain" />
            </div>
          )}
          {avisoCalidad && (
            <p className="text-red-300 text-xs text-center font-semibold">{avisoCalidad}</p>
          )}
          <button type="button" onClick={capturarFoto} disabled={!camaraLista || capturando}
            className="mt-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors disabled:opacity-50">
            {capturando ? "Capturando…" : "Capturar"}
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
            {enviando ? "Procesando documento…" : `Verificar ${documento}`}
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
  // Consentimiento afirmativo y separado, requerido por Twilio para
  // campañas A2P/10DLC: el usuario debe marcar esto explícitamente antes de
  // poder enviar el código — nunca preseleccionado. El backend también lo
  // exige (ver api_wallet_sms_enviar), esto no es solo cosmético.
  const [aceptoSms, setAceptoSms] = useState(false);

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
    if (!aceptoSms) {
      setToast({ type: "error", message: "Debe aceptar recibir el código de verificación por SMS para continuar." });
      return;
    }
    setEnviando(true);
    try {
      const res = await fetch(`${API_URL}/api/wallet/identidad/sms/enviar/`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ telefono, canal: "web", acepto_sms: aceptoSms }),
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
          <label className="flex items-start gap-2.5 rounded-lg border border-line/15 bg-surface-2/40 px-3 py-2.5 cursor-pointer">
            <input type="checkbox" checked={aceptoSms} onChange={(e) => setAceptoSms(e.target.checked)}
              className="mt-0.5 accent-emerald-500 w-4 h-4 flex-shrink-0" />
            <span className="text-xs text-content/85 leading-relaxed">
              Acepto recibir por SMS códigos de verificación de ECONFIA en el número proporcionado.
              Pueden aplicarse tarifas de mensajes y datos. Responde <strong>STOP</strong> para cancelar
              y <strong>HELP</strong> para ayuda. Consulte los{" "}
              <a href="/sms-terms" target="_blank" rel="noreferrer"
                className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
                onClick={(e) => e.stopPropagation()}>
                Términos del programa SMS
              </a>
              {" "}y la{" "}
              <a href="/sms-privacy-policy" target="_blank" rel="noreferrer"
                className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
                onClick={(e) => e.stopPropagation()}>
                Política de Privacidad de SMS
              </a>
              .
            </span>
          </label>
          <button type="submit" disabled={enviando || !aceptoSms}
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
