import { useState } from "react";
import {
  FaBuilding,
  FaCheckCircle,
  FaFilePdf,
  FaIndustry,
  FaStore,
} from "react-icons/fa";
import Terminos from "../components/Terminos";
import { generarInformeEmpresaPDF } from "../pdf/InformeEmpresaPDF";

function SectionCard({ title, children, accent = "emerald" }) {
  const accentMap = {
    emerald: "border-emerald-400/20 shadow-[0_18px_60px_rgba(16,185,129,0.08)]",
    sky: "border-sky-400/20 shadow-[0_18px_60px_rgba(56,189,248,0.08)]",
    amber: "border-amber-400/20 shadow-[0_18px_60px_rgba(245,158,11,0.08)]",
    violet: "border-violet-400/20 shadow-[0_18px_60px_rgba(139,92,246,0.08)]",
  };

  return (
    <div className={`rounded-[1.75rem] border bg-slate-950/75 p-6 backdrop-blur-xl ${accentMap[accent] || accentMap.emerald}`}>
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}

function FieldRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 border-b border-white/6 pb-3 last:border-b-0 last:pb-0">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </span>
      <span className="text-sm md:text-base text-white">
        {value || "No disponible"}
      </span>
    </div>
  );
}

function MetricTile({ label, value, tone = "emerald" }) {
  const tones = {
    emerald: "from-emerald-400/15 to-transparent text-emerald-200",
    sky: "from-sky-400/15 to-transparent text-sky-200",
    amber: "from-amber-400/15 to-transparent text-amber-200",
    violet: "from-violet-400/15 to-transparent text-violet-200",
  };

  return (
    <div className={`rounded-2xl border border-white/8 bg-gradient-to-br ${tones[tone] || tones.emerald} p-4`}>
      <div className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-bold text-white">{value ?? "—"}</div>
    </div>
  );
}

function InfoChip({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function cleanValue(value, fallback = "No disponible") {
  if (value === null || value === undefined || value === "") return fallback;
  return value;
}

function formatMoney(value) {
  if (value === null || value === undefined || value === "") return "No reportado";
  const numeric = Number(String(value).replace(/[^\d.-]/g, ""));
  if (!Number.isFinite(numeric)) return value;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(numeric);
}

function CompactField({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-3">
      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </div>
      <div className="mt-1 break-words text-sm font-semibold leading-5 text-white">
        {cleanValue(value)}
      </div>
    </div>
  );
}

function FinancialMetric({ label, value, tone = "sky" }) {
  const toneMap = {
    sky: "border-sky-400/15 bg-sky-500/10 text-sky-200",
    emerald: "border-emerald-400/15 bg-emerald-500/10 text-emerald-200",
    amber: "border-amber-400/15 bg-amber-500/10 text-amber-200",
    violet: "border-violet-400/15 bg-violet-500/10 text-violet-200",
  };

  return (
    <div className={`rounded-2xl border px-4 py-3 ${toneMap[tone] || toneMap.sky}`}>
      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
        {label}
      </div>
      <div className="mt-2 text-base font-bold text-white">
        {value}
      </div>
    </div>
  );
}

function CamaraAfiliadoCard({ item, index }) {
  const telefono =
    item.contacto?.telefono_1 ||
    item.contacto?.telefono_2 ||
    item.contacto?.telefono_3;
  const actividades = item.actividades || [];

  return (
    <div className="overflow-hidden rounded-[1.6rem] border border-sky-400/15 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_38%),rgba(15,23,42,0.66)]">
      <div className="border-b border-white/8 bg-white/[0.035] px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="inline-flex rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-200">
              Registro Cámara {index + 1}
            </div>
            <h4 className="mt-3 text-lg font-bold leading-tight text-white">
              {item.razon_social || "Empresa afiliada"}
            </h4>
            <p className="mt-1 text-sm text-slate-300">
              Afiliada a Cámara de Comercio con información mercantil, contacto y actividad económica registrada.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">
            Afiliado
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <CompactField label="NIT" value={item.nit} />
          <CompactField label="Matrícula mercantil" value={item.matricula_mercantil} />
          <CompactField label="Fecha afiliación" value={item.perfil?.fecha_afiliacion} />
          <CompactField label="Última renovación" value={item.perfil?.fecha_renovacion} />
        </div>

        <div className="rounded-2xl border border-white/8 bg-slate-950/35 p-4">
          <div className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-sky-300">
            Datos mercantiles principales
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <CompactField label="Tipo de organización" value={item.tipo_organizacion} />
            <CompactField label="Representante legal" value={item.perfil?.representante_legal} />
            <CompactField label="Fecha de matrícula" value={item.perfil?.fecha_matricula} />
            <CompactField label="Fecha de constitución" value={item.perfil?.fecha_constitucion} />
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-slate-950/35 p-4">
          <div className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
            Contacto reportado
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <CompactField label="Dirección comercial" value={item.contacto?.direccion} />
            <CompactField label="Ciudad" value={item.contacto?.ciudad} />
            <CompactField label="Correo comercial" value={item.contacto?.correo_comercial} />
            <CompactField label="Teléfono" value={telefono} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <FinancialMetric label="Ingresos ordinarios" value={formatMoney(item.financiero?.ingresos_actividad_ordinaria)} tone="sky" />
          <FinancialMetric label="Patrimonio" value={formatMoney(item.financiero?.patrimonio)} tone="emerald" />
          <FinancialMetric label="Utilidad neta" value={formatMoney(item.financiero?.utilidad_neta)} tone="amber" />
          <FinancialMetric label="Personal ocupado" value={cleanValue(item.financiero?.personas_ocupadas, "No reportado")} tone="violet" />
        </div>

        <div className="rounded-2xl border border-sky-400/12 bg-sky-500/10 p-4">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-sky-200">
            Actividades económicas registradas
          </div>
          {actividades.length > 0 ? (
            <div className="mt-3 space-y-2">
              {actividades.map((actividad, actividadIndex) => (
                <div
                  key={`${actividad.codigo}-${actividadIndex}`}
                  className="rounded-xl border border-white/8 bg-slate-950/40 px-4 py-3"
                >
                  <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-300">
                    {actividadIndex === 0 ? "Actividad principal" : `Actividad ${actividadIndex + 1}`} · CIIU {actividad.codigo || "Sin código"}
                  </div>
                  <div className="mt-1 text-sm leading-6 text-slate-100">
                    {actividad.descripcion || "Sin descripción disponible."}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 text-sm text-slate-300">
              No hay actividades económicas disponibles en esta fuente.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ConsultaEmpresa() {
  const [tipoDoc] = useState("NIT");
  const [nit, setNit] = useState("");
  const [acepta, setAcepta] = useState(false);
  const [consentimiento, setConsentimiento] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generandoPdf, setGenerandoPdf] = useState(false);
  const [toast, setToast] = useState(null);
  const [resultadoEmpresa, setResultadoEmpresa] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nit) {
      setToast({ type: "error", message: "Ingresa el NIT de la empresa." });
      return;
    }
    if (!acepta) {
      setToast({ type: "error", message: "Debes aceptar los términos y condiciones." });
      return;
    }
    if (!consentimiento) {
      setToast({ type: "error", message: "Debes confirmar que cuentas con el consentimiento del titular." });
      return;
    }

    setLoading(true);
    setToast(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/consultar-empresa-rues/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ nit, tipo_consulta: "empresa" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({ type: "error", message: data.error || `Error HTTP: ${res.status}` });
        return;
      }

      setResultadoEmpresa({
        nombre: data.nombre,
        nit: data.nit,
        estado: data.estado,
        camara_comercio: data.camara_comercio,
        matricula: data.matricula,
        informacion_general: data.informacion_general || {},
        actividad_economica: data.actividad_economica || [],
        representante_legal: data.representante_legal || {},
        propietario_establecimiento: data.propietario_establecimiento || {},
        proveedores_ficticios_dian: data.proveedores_ficticios_dian || {},
        camara_comercio_afiliados: data.camara_comercio_afiliados || {},
        empresa_resumen: data.empresa_resumen || {},
        captura_principal: data.captura_principal,
      });
    } catch (error) {
      setToast({ type: "error", message: "Ocurrió un error en la consulta." });
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarPdf = async () => {
    if (!resultadoEmpresa || generandoPdf) return;

    setGenerandoPdf(true);
    try {
      await generarInformeEmpresaPDF(resultadoEmpresa);
    } catch (error) {
      setToast({ type: "error", message: "No fue posible generar el PDF de empresa." });
    } finally {
      setGenerandoPdf(false);
    }
  };

  const perfil = resultadoEmpresa?.empresa_resumen?.perfil || {};
  const metricas = resultadoEmpresa?.empresa_resumen?.metricas || {};
  const historia = resultadoEmpresa?.empresa_resumen?.historia_empresarial || [];
  const actividadPrincipal = resultadoEmpresa?.empresa_resumen?.actividad_principal || {};
  const propietarioData = resultadoEmpresa?.propietario_establecimiento || {};
  const propietarioRegistros = propietarioData?.registros || [];
  const proveedoresFicticios = resultadoEmpresa?.proveedores_ficticios_dian || {};
  const proveedoresFicticiosRegistros = proveedoresFicticios?.registros || [];
  const camaraAfiliados = resultadoEmpresa?.camara_comercio_afiliados || {};
  const camaraAfiliadosRegistros = camaraAfiliados?.registros || [];
  const generalPreferredOrder = [
    "Identificación",
    "Categoria de la Matrícula",
    "Tipo de Sociedad",
    "Tipo Organización",
    "Cámara de Comercio",
    "Número de Matrícula",
    "Fecha de Matrícula",
    "Fecha de Vigencia",
    "Estado de la matrícula",
    "Fecha de renovación",
    "Último año renovado",
    "Fecha de Actualización",
    "Emprendimiento Social",
  ];
  const generalEntriesMap = resultadoEmpresa?.informacion_general || {};
  const generalEntries = [
    ...generalPreferredOrder
      .filter((key) => Object.prototype.hasOwnProperty.call(generalEntriesMap, key))
      .map((key) => [key, generalEntriesMap[key]]),
    ...Object.entries(generalEntriesMap).filter(([key]) => !generalPreferredOrder.includes(key)),
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-10">
      <div className="grid gap-8 xl:grid-cols-[360px_1fr]">
        <aside className="h-fit rounded-[2rem] border border-sky-400/15 bg-[linear-gradient(180deg,rgba(7,13,34,0.98),rgba(20,41,102,0.98))] p-6 shadow-[0_30px_80px_rgba(2,6,23,0.35)] xl:sticky xl:top-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-sm font-medium text-sky-200">
            <FaBuilding className="text-sky-300" />
            Consulta de Empresa
          </div>

          <h2 className="mt-6 text-2xl font-bold text-white">
            Consulta mercantil y perfil empresarial
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Consulta información de RUES y organízala en una ficha más clara para validación operativa, revisión comercial y lectura registral.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <InfoChip label="Fuente" value="RUES" />
            <InfoChip label="Cobertura" value="Perfil mercantil y detalle registral" />
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-sky-100">
                Tipo de documento
              </label>
              <select
                className="w-full rounded-xl border border-white/10 bg-slate-950/35 px-4 py-3 text-white"
                value={tipoDoc}
                disabled
              >
                <option value="NIT">NIT</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-sky-100">
                NIT de la empresa
              </label>
              <input
                type="text"
                className="w-full rounded-xl border border-white/10 bg-slate-950/35 px-4 py-3 text-white placeholder:text-slate-500"
                placeholder="Ej: 0000000000"
                value={nit}
                onChange={(e) => setNit(e.target.value)}
                autoComplete="off"
              />
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Usa el NIT tal como aparece en la cámara de comercio o en el certificado mercantil.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="acepta"
                  checked={acepta}
                  onChange={(e) => setAcepta(e.target.checked)}
                  className="mt-1 accent-sky-500"
                />
                <label htmlFor="acepta" className="text-sm text-slate-300">
                  Acepto los <Terminos inline />.
                </label>
              </div>

              <div className="mt-3 flex items-start gap-2">
                <input
                  type="checkbox"
                  id="consentimiento"
                  checked={consentimiento}
                  onChange={(e) => setConsentimiento(e.target.checked)}
                  className="mt-1 accent-sky-500"
                />
                <label htmlFor="consentimiento" className="text-sm text-slate-300">
                  Confirmo que cuento con autorización para consultar esta información.
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 px-4 py-3 font-semibold text-white transition-all duration-300 hover:from-sky-400 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Consultando..." : "Consultar Empresa"}
            </button>

            <div className="rounded-2xl border border-sky-400/15 bg-sky-500/10 px-4 py-4 text-sm leading-6 text-sky-100">
              La consulta prioriza la información estructurada de RUES y, si la empresa ya fue revisada, reutiliza la ficha guardada solo cuando está completa.
            </div>

            {toast && (
              <div className={`rounded-xl border px-4 py-3 text-sm ${
                toast.type === "error"
                  ? "border-red-400/20 bg-red-500/10 text-red-200"
                  : "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
              }`}>
                {toast.message}
              </div>
            )}
          </form>
        </aside>

        <section className="space-y-6">
          {!resultadoEmpresa ? (
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-10 text-center backdrop-blur-xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-300">
                <FaIndustry className="text-2xl" />
              </div>
              <h3 className="mt-5 text-2xl font-bold text-white">
                Resultado de empresa
              </h3>
              <p className="mt-3 max-w-2xl mx-auto text-slate-300 leading-7">
                Aquí verás la ficha empresarial con información general, actividad económica, representación legal, historia registral y captura de consulta.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950/95 to-slate-900/95 p-6 md:p-8 shadow-[0_30px_80px_rgba(2,6,23,0.35)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                      <FaCheckCircle className="text-emerald-300" />
                      Fuente RUES
                    </div>
                    <h3 className="mt-4 text-2xl md:text-3xl font-bold text-white">
                      {resultadoEmpresa.nombre || "Empresa consultada"}
                    </h3>
                    <p className="mt-2 text-slate-300">
                      NIT: <span className="font-semibold text-white">{resultadoEmpresa.nit}</span>
                    </p>
                    <p className="mt-1 text-slate-300">
                      Estado: <span className="font-semibold text-white">{resultadoEmpresa.estado || "No disponible"}</span>
                    </p>
                    <button
                      type="button"
                      onClick={handleDescargarPdf}
                      disabled={generandoPdf}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl border border-sky-400/20 bg-sky-500/15 px-4 py-3 text-sm font-semibold text-sky-100 transition-all duration-300 hover:border-sky-300/40 hover:bg-sky-500/25 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <FaFilePdf className="text-sky-300" />
                      {generandoPdf ? "Generando PDF..." : "Descargar PDF empresarial"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:min-w-[320px]">
                    <MetricTile label="Año de matrícula" value={metricas.anio_fundacion} tone="sky" />
                    <MetricTile label="Antigüedad" value={metricas.antiguedad_anos != null ? `${metricas.antiguedad_anos} años` : "—"} tone="emerald" />
                    <MetricTile label="Actividades" value={metricas.total_actividades} tone="amber" />
                    <MetricTile
                      label="DIAN ficticios"
                      value={proveedoresFicticios?.aparece ? "Alerta" : "Validado"}
                      tone={proveedoresFicticios?.aparece ? "amber" : "emerald"}
                    />
                  </div>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Cámara</div>
                    <div className="mt-2 text-white font-semibold">{resultadoEmpresa.camara_comercio || "No disponible"}</div>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Matrícula</div>
                    <div className="mt-2 text-white font-semibold">{resultadoEmpresa.matricula || "No disponible"}</div>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Actividad principal</div>
                    <div className="mt-2 text-white font-semibold">
                      {actividadPrincipal.codigo || "No disponible"}
                    </div>
                    <div className="mt-1 text-sm text-slate-300">
                      {actividadPrincipal.descripcion || "No disponible"}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Último año renovado</div>
                    <div className="mt-2 text-white font-semibold">
                      {perfil.ultimo_anio_renovado || "No disponible"}
                    </div>
                    <div className="mt-1 text-sm text-slate-300">
                      {perfil.fecha_renovacion || "Sin fecha"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
                <div className="space-y-6">
                  <SectionCard title="Información general" accent="sky">
                    <div className="grid gap-4 md:grid-cols-2">
                      {generalEntries.length > 0 ? (
                        generalEntries.map(([label, value]) => (
                          <FieldRow key={label} label={label} value={value} />
                        ))
                      ) : (
                        <div className="text-slate-300">No hay información general disponible.</div>
                      )}
                    </div>
                  </SectionCard>

                  <SectionCard title="Actividades económicas" accent="emerald">
                    <div className="space-y-3">
                      {(resultadoEmpresa.actividad_economica || []).length > 0 ? (
                        resultadoEmpresa.actividad_economica.map((item, index) => (
                          <div key={`${item.codigo}-${index}`} className="rounded-2xl border border-white/8 bg-slate-950/35 p-4">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                              {index === 0 ? "Principal" : `Actividad ${index + 1}`}
                            </div>
                            <div className="mt-2 text-white font-semibold">
                              {item.codigo || "Sin código"}
                            </div>
                            <div className="mt-1 text-slate-300">
                              {item.descripcion || "Sin descripción"}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-slate-300">No hay actividades económicas disponibles.</div>
                      )}
                    </div>
                  </SectionCard>

                  <SectionCard title="Proveedores ficticios DIAN" accent={proveedoresFicticios?.aparece ? "amber" : "emerald"}>
                    <div className={`rounded-2xl border px-4 py-4 text-sm leading-6 ${
                      proveedoresFicticios?.aparece
                        ? "border-amber-400/20 bg-amber-500/10 text-amber-100"
                        : "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
                    }`}>
                      <div className="font-semibold">
                        {proveedoresFicticios?.mensaje || "Validación DIAN no disponible."}
                      </div>
                      {proveedoresFicticios?.fundamento && (
                        <div className="mt-2 text-slate-300">{proveedoresFicticios.fundamento}</div>
                      )}
                      {proveedoresFicticios?.recomendacion && (
                        <div className="mt-2 text-slate-300">{proveedoresFicticios.recomendacion}</div>
                      )}
                    </div>

                    {proveedoresFicticiosRegistros.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {proveedoresFicticiosRegistros.map((item, index) => (
                          <div key={`${item.nit}-${item.numero_resolucion}-${index}`} className="rounded-2xl border border-white/8 bg-slate-950/35 p-4">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">
                              Registro DIAN {index + 1}
                            </div>
                            <div className="mt-3 grid gap-4 md:grid-cols-2">
                              <FieldRow label="NIT" value={item.nit} />
                              <FieldRow label="Razón social" value={item.nombre_razon_social} />
                              <FieldRow label="Año" value={item.anio} />
                              <FieldRow label="Resolución" value={item.numero_resolucion} />
                              <FieldRow label="Fecha resolución" value={item.fecha_resolucion} />
                              <FieldRow label="Publicación" value={item.medio_publicacion} />
                              <FieldRow label="Artículo" value={item.articulo} />
                              <FieldRow label="Dirección seccional" value={item.direccion_seccional} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </SectionCard>

                  <SectionCard title="Afiliados Cámara de Comercio" accent={camaraAfiliados?.aparece ? "sky" : "violet"}>
                    <div className={`rounded-2xl border px-4 py-4 text-sm leading-6 ${
                      camaraAfiliados?.aparece
                        ? "border-sky-400/20 bg-sky-500/10 text-sky-100"
                        : "border-violet-400/20 bg-violet-500/10 text-violet-100"
                    }`}>
                      <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-300">
                        Validación en base de afiliados
                      </div>
                      <div className="mt-2 font-semibold">
                        {camaraAfiliados?.mensaje || "Validación de afiliados Cámara no disponible."}
                      </div>
                      {camaraAfiliadosRegistros.length > 0 && (
                        <div className="mt-2 text-slate-300">
                          Se encontró información complementaria para perfilar la empresa: datos mercantiles, contacto, indicadores financieros y actividades económicas.
                        </div>
                      )}
                    </div>

                    {camaraAfiliadosRegistros.length > 0 && (
                      <div className="mt-4 space-y-4">
                        {camaraAfiliadosRegistros.map((item, index) => (
                          <CamaraAfiliadoCard
                            key={`${item.nit}-${item.matricula_mercantil}-${index}`}
                            item={item}
                            index={index}
                          />
                        ))}
                      </div>
                    )}
                  </SectionCard>

                  <SectionCard title="Propietario / Establecimiento" accent="amber">
                    <div className="space-y-4">
                      {propietarioRegistros.length > 0 ? (
                        propietarioRegistros.map((item, index) => (
                          <div key={`${item.titulo}-${index}`} className="rounded-2xl border border-white/8 bg-slate-950/35 p-5">
                            <div className="flex items-center gap-2 text-white font-semibold">
                              <FaStore className="text-amber-300" />
                              {item.titulo || `Establecimiento ${index + 1}`}
                            </div>
                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                              {Object.entries(item.campos || {}).map(([label, value]) => (
                                <FieldRow key={`${item.titulo}-${label}`} label={label} value={value} />
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-amber-400/15 bg-amber-500/10 px-4 py-4 text-sm text-amber-100">
                          {propietarioData?.mensaje || "No hay información de establecimientos disponible."}
                        </div>
                      )}
                    </div>
                  </SectionCard>
                </div>

                <div className="space-y-6">
                  <SectionCard title="Perfil empresarial" accent="violet">
                    <div className="space-y-3">
                      <FieldRow label="Tipo de sociedad" value={perfil.tipo_sociedad} />
                      <FieldRow label="Tipo de organización" value={perfil.tipo_organizacion} />
                      <FieldRow label="Categoría de matrícula" value={perfil.categoria_matricula} />
                      <FieldRow label="Identificación RUES" value={perfil.identificacion} />
                    </div>
                  </SectionCard>

                  <SectionCard title="Representante legal" accent="sky">
                    {(resultadoEmpresa.representante_legal?.registros || []).length > 0 ? (
                      <div className="space-y-3">
                        {resultadoEmpresa.representante_legal.registros.map((item, index) => (
                          <div key={`${item.cargo || item.etiqueta}-${index}`} className="rounded-2xl border border-white/8 bg-slate-950/35 p-4">
                            <div className="text-xs uppercase tracking-[0.16em] text-sky-300">
                              {item.cargo || item.etiqueta || "Cargo"}
                            </div>
                            <div className="mt-2 text-white font-semibold">
                              {item.nombre || item.valor || "No disponible"}
                            </div>
                            {item.identificacion && (
                              <div className="mt-1 text-sm text-slate-300">{item.identificacion}</div>
                            )}
                          </div>
                        ))}
                        {resultadoEmpresa.representante_legal?.mensaje && (
                          <div className="rounded-2xl border border-white/8 bg-slate-950/35 p-4 text-sm leading-7 text-slate-300 whitespace-pre-line">
                            {resultadoEmpresa.representante_legal.mensaje}
                          </div>
                        )}
                      </div>
                    ) : resultadoEmpresa.representante_legal?.mensaje ? (
                      <div className="rounded-2xl border border-white/8 bg-slate-950/35 p-4 text-sm leading-7 text-slate-300 whitespace-pre-line">
                        {resultadoEmpresa.representante_legal.mensaje}
                      </div>
                    ) : (
                      <div className="text-slate-300">Información no disponible.</div>
                    )}
                  </SectionCard>

                  <SectionCard title="Historia registral" accent="amber">
                    <div className="space-y-3">
                      {historia.map((item, index) => (
                        <div key={`${item.titulo}-${index}`} className="rounded-2xl border border-white/8 bg-slate-950/35 p-4">
                          <div className="text-xs uppercase tracking-[0.16em] text-amber-300">{item.titulo}</div>
                          <div className="mt-2 text-white text-xl font-bold">{item.valor || "—"}</div>
                          <div className="mt-1 text-sm text-slate-300">{item.detalle || "Sin detalle"}</div>
                        </div>
                      ))}
                    </div>
                  </SectionCard>

                  {resultadoEmpresa.captura_principal && (
                    <SectionCard title="Captura de la consulta" accent="emerald">
                      <img
                        src={resultadoEmpresa.captura_principal}
                        alt="Captura de la empresa"
                        className="w-full rounded-2xl border border-white/10 shadow"
                      />
                    </SectionCard>
                  )}

                  <SectionCard title="Lectura operativa" accent="sky">
                    <div className="space-y-3 text-sm leading-7 text-slate-300">
                      <p>
                        Esta vista está pensada para que el equipo entienda rápido la situación registral de la empresa sin revisar bloques largos de texto.
                      </p>
                      <p>
                        Si una empresa ya estaba guardada pero con información pobre, el backend ahora intenta refrescarla antes de responder.
                      </p>
                    </div>
                  </SectionCard>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
