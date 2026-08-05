import { useMemo, useState } from "react";
import { Activity, AlertTriangle, Building2, CalendarDays, ExternalLink, Factory, FileText, Image as ImageIcon, ShieldCheck, Store, UserRound, X } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function fmtText(value) {
  if (value === null || value === undefined || value === "" || value === "null") return "—";
  return String(value);
}

function numValue(value) {
  const n = Number(String(value ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function fmtMoney(value) {
  const n = numValue(value);
  if (!n) return "$0";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(date);
}

function isActiveStatus(value) {
  return /activa|activo|vigente/i.test(String(value || ""));
}

function Section({ icon: Icon, title, count, children }) {
  return (
    <section className="rounded-[22px] border border-line/15 bg-surface/90 p-5 shadow-xl shadow-black/5 backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-400/[0.08] text-brand">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-base font-bold text-content">{title}</h3>
        {count !== undefined && (
          <span className="rounded-full border border-line/15 bg-surface-2/70 px-2.5 py-0.5 text-xs font-semibold text-muted">
            {count}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function StatTile({ label, value, tone = "cyan" }) {
  const tones = {
    cyan: "border-cyan-500/25 from-cyan-500/10 to-blue-500/5",
    emerald: "border-emerald-500/25 from-emerald-500/10 to-cyan-500/5",
    amber: "border-amber-500/25 from-amber-500/10 to-orange-500/5",
    rose: "border-rose-500/25 from-rose-500/10 to-pink-500/5",
    slate: "border-line/15 from-surface-2/80 to-surface/70",
  };
  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-4 shadow-lg shadow-black/5 ${tones[tone] || tones.cyan}`}>
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{label}</div>
      <div className="mt-1.5 text-lg font-black leading-tight text-content">{value}</div>
    </div>
  );
}

function FactGrid({ items }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.filter((item) => item.value && item.value !== "—").map((item) => (
        <div key={item.label} className="rounded-2xl border border-line/15 bg-surface-2/70 p-4">
          <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">{item.label}</div>
          <div className="mt-1 text-sm font-bold text-content">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

function EmpresaCharts({ empresa }) {
  const actividad = toArray(empresa.actividad_economica);
  const representante = empresa.representante_legal || {};
  const proveedores = empresa.proveedores_ficticios_dian || {};
  const afiliados = empresa.camara_comercio_afiliados || {};
  const afiliadosRegistros = toArray(afiliados.registros);

  const coverage = [
    { name: "RUES", value: empresa.informacion_general && Object.keys(empresa.informacion_general).length ? 1 : 0, color: "#38bdf8" },
    { name: "Actividad", value: actividad.length ? 1 : 0, color: "#2dd4bf" },
    { name: "Representante", value: toArray(representante.registros).length || representante.mensaje ? 1 : 0, color: "#a78bfa" },
    { name: "DIAN", value: proveedores.mensaje ? 1 : 0, color: "#f59e0b" },
    { name: "Afiliados", value: afiliados.mensaje ? 1 : 0, color: "#fb7185" },
  ];
  const coverageTotal = coverage.reduce((sum, item) => sum + item.value, 0);
  const coveragePct = Math.round((coverageTotal / coverage.length) * 100);

  const signals = [
    { name: "Mercantil", valor: isActiveStatus(empresa.estado) ? 100 : 45 },
    { name: "Actividad", valor: Math.min(100, actividad.length * 35) },
    { name: "Representación", valor: toArray(representante.registros).length ? 90 : representante.mensaje ? 65 : 20 },
    { name: "DIAN", valor: proveedores.aparece ? 25 : proveedores.mensaje ? 95 : 45 },
    { name: "Afiliados", valor: afiliados.aparece ? 85 : afiliados.mensaje ? 55 : 25 },
  ];

  const financial = afiliadosRegistros
    .slice(0, 4)
    .map((item, index) => ({
      name: item.razon_social || `Afiliado ${index + 1}`,
      ingresos: numValue(item.financiero?.ingresos_actividad_ordinaria),
      patrimonio: numValue(item.financiero?.patrimonio),
    }))
    .filter((item) => item.ingresos || item.patrimonio);

  return (
    <Section icon={Activity} title="Lectura gráfica empresarial">
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-line/15 bg-gradient-to-br from-surface-2/95 via-surface/90 to-surface-2/80 p-4 shadow-lg shadow-black/5">
          <div className="mb-3">
            <div className="text-sm font-black text-content">Cobertura de fuentes</div>
            <div className="text-xs text-muted">Qué tan completa llegó la consulta empresarial.</div>
          </div>
          <div className="grid gap-3 sm:grid-cols-[210px_1fr]">
            <div className="relative h-[210px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={coverage}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="62%"
                    outerRadius="82%"
                    paddingAngle={4}
                    cornerRadius={8}
                    stroke="rgba(2,6,23,0.76)"
                    strokeWidth={3}
                    isAnimationActive
                    animationDuration={900}
                  >
                    {coverage.map((item) => (
                      <Cell key={item.name} fill={item.value ? item.color : "rgba(148,163,184,0.18)"} />
                    ))}
                  </Pie>
                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      background: "rgb(var(--th-surface))",
                      border: "1px solid rgb(var(--th-line) / 0.18)",
                      borderRadius: 12,
                      color: "rgb(var(--th-content))",
                    }}
                    formatter={(value) => [value ? "Disponible" : "No disponible", "Estado"]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-black text-content">{coveragePct}%</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand">cobertura</div>
              </div>
            </div>
            <div className="grid content-center gap-2">
              {coverage.map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-xl border border-line/15 bg-surface/80 px-3 py-2">
                  <span className="flex items-center gap-2 text-sm font-bold text-content">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.value ? item.color : "rgba(148,163,184,0.45)" }} />
                    {item.name}
                  </span>
                  <span className={item.value ? "text-xs font-black text-emerald-500" : "text-xs font-black text-muted"}>
                    {item.value ? "OK" : "Pendiente"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-line/15 bg-surface-2/70 p-4 shadow-lg shadow-black/5">
          <div className="mb-3">
            <div className="text-sm font-black text-content">Señales para calificación</div>
            <div className="text-xs text-muted">Lectura visual para priorizar revisión.</div>
          </div>
          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={signals} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgb(var(--th-line))" strokeOpacity={0.45} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "rgb(var(--th-muted))", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "rgb(var(--th-muted))", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(103,232,249,0.06)" }}
                  contentStyle={{
                    background: "rgb(var(--th-surface))",
                    border: "1px solid rgb(var(--th-line) / 0.18)",
                    borderRadius: 12,
                    color: "rgb(var(--th-content))",
                  }}
                />
                <Bar dataKey="valor" name="Indicador" radius={[8, 8, 0, 0]} isAnimationActive animationDuration={1000}>
                  {signals.map((item) => (
                    <Cell key={item.name} fill={item.valor < 50 ? "#f59e0b" : item.valor > 80 ? "#2dd4bf" : "#38bdf8"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {financial.length > 0 && (
        <div className="mt-4 rounded-2xl border border-line/15 bg-surface-2/70 p-4 shadow-lg shadow-black/5">
          <div className="mb-3">
            <div className="text-sm font-black text-content">Indicadores financieros reportados</div>
            <div className="text-xs text-muted">Información complementaria de afiliados cuando está disponible.</div>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financial} margin={{ top: 8, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="rgb(var(--th-line))" strokeOpacity={0.45} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "rgb(var(--th-muted))", fontSize: 10 }} axisLine={false} tickLine={false} interval={0} />
                <YAxis tickFormatter={(value) => `${Math.round(value / 1000000)}M`} tick={{ fill: "rgb(var(--th-muted))", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(103,232,249,0.06)" }}
                  formatter={(value, name) => [fmtMoney(value), name]}
                  contentStyle={{
                    background: "rgb(var(--th-surface))",
                    border: "1px solid rgb(var(--th-line) / 0.18)",
                    borderRadius: 12,
                    color: "rgb(var(--th-content))",
                  }}
                />
                <Bar dataKey="ingresos" name="Ingresos" fill="#38bdf8" radius={[8, 8, 0, 0]} />
                <Bar dataKey="patrimonio" name="Patrimonio" fill="#2dd4bf" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </Section>
  );
}

export default function EmpresaDetalleResultados({ empresa, onDownloadPdf }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const data = useMemo(() => empresa?.empresa_data || empresa || {}, [empresa]);
  const resumen = data.empresa_resumen || {};
  const perfil = resumen.perfil || {};
  const metricas = resumen.metricas || {};
  const historia = toArray(resumen.historia_empresarial);
  const actividades = toArray(data.actividad_economica);
  const representantes = toArray(data.representante_legal?.registros);
  const propietarios = toArray(data.propietario_establecimiento?.registros);
  const proveedores = data.proveedores_ficticios_dian || {};
  const alertaDian = Boolean(proveedores.aparece);

  return (
    <div className="grid gap-4">
      <div className="relative overflow-hidden rounded-[24px] border border-line/15 bg-surface/90 p-6 shadow-2xl shadow-black/5 backdrop-blur-xl">
        <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-emerald-500/[0.06] blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-ok/30 bg-ok/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-ok">
            <ShieldCheck className="h-3.5 w-3.5" />
            Empresa RUES
          </div>
          <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
            alertaDian ? "border-warn/30 bg-warn/10 text-warn" : "border-ok/30 bg-ok/10 text-ok"
          }`}>
            {alertaDian ? "Alerta DIAN" : "Sin alerta DIAN"}
          </span>
          <span className="rounded-md border border-brand/25 bg-brand/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
            Adjudicator pendiente
          </span>
        </div>
        <h2 className="mt-4 text-2xl font-black tracking-tight text-content md:text-3xl">{data.nombre || "Empresa consultada"}</h2>
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted">
          <span>NIT: {fmtText(data.nit)}</span>
          <span>Estado: {fmtText(data.estado)}</span>
          <span>Cámara: {fmtText(data.camara_comercio)}</span>
          <span>Consulta: {fmtDate(data.fecha_consulta)}</span>
        </div>
        {onDownloadPdf && (
          <button
            type="button"
            onClick={() => onDownloadPdf(data.nit)}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand to-brand-2 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <FileText className="h-4 w-4" /> Descargar informe empresarial
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Año matrícula" value={metricas.anio_fundacion || "—"} tone="cyan" />
        <StatTile label="Antigüedad" value={metricas.antiguedad_anos != null ? `${metricas.antiguedad_anos} años` : "—"} tone="emerald" />
        <StatTile label="Actividades" value={metricas.total_actividades ?? actividades.length} tone="amber" />
        <StatTile label="Estado DIAN" value={alertaDian ? "Alerta" : "Sin alerta"} tone={alertaDian ? "rose" : "emerald"} />
      </div>

      <EmpresaCharts empresa={data} />

      <Section icon={Building2} title="Información general">
        <FactGrid items={[
          { label: "Identificación RUES", value: perfil.identificacion },
          { label: "Tipo de sociedad", value: perfil.tipo_sociedad },
          { label: "Tipo organización", value: perfil.tipo_organizacion },
          { label: "Categoría matrícula", value: perfil.categoria_matricula },
          { label: "Matrícula", value: data.matricula },
          { label: "Cámara de comercio", value: data.camara_comercio },
          { label: "Estado matrícula", value: data.estado },
          { label: "Fecha consulta", value: fmtDate(data.fecha_consulta) },
        ]} />
      </Section>

      <Section icon={Factory} title="Actividades económicas" count={actividades.length}>
        <div className="grid gap-2.5">
          {actividades.length ? actividades.map((item, index) => (
            <div key={`${item.codigo}-${index}`} className="rounded-2xl border border-line/15 bg-surface-2/70 p-4">
              <div className="text-xs font-bold uppercase tracking-[0.16em] text-ok">
                {index === 0 ? "Principal" : `Actividad ${index + 1}`} · CIIU {item.codigo || "—"}
              </div>
              <div className="mt-2 text-sm leading-6 text-content">{item.descripcion || "Sin descripción"}</div>
            </div>
          )) : <div className="text-sm text-muted">Sin actividades económicas disponibles.</div>}
        </div>
      </Section>

      <div className="grid gap-4 xl:grid-cols-2">
        <Section icon={UserRound} title="Representante legal" count={representantes.length}>
          <div className="grid gap-2.5">
            {representantes.length ? representantes.map((item, index) => (
              <div key={`${item.nombre || item.valor}-${index}`} className="rounded-2xl border border-line/15 bg-surface-2/70 p-4">
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-brand">{item.cargo || item.etiqueta || "Cargo"}</div>
                <div className="mt-2 text-sm font-bold text-content">{item.nombre || item.valor || "No disponible"}</div>
                {item.identificacion && <div className="mt-1 text-xs text-muted">{item.identificacion}</div>}
              </div>
            )) : <div className="text-sm leading-6 text-muted">{data.representante_legal?.mensaje || "Información no disponible."}</div>}
          </div>
        </Section>

        <Section icon={CalendarDays} title="Historia registral" count={historia.length}>
          <div className="grid gap-2.5">
            {historia.length ? historia.map((item, index) => (
              <div key={`${item.titulo}-${index}`} className="rounded-2xl border border-line/15 bg-surface-2/70 p-4">
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-warn">{item.titulo}</div>
                <div className="mt-2 text-lg font-black text-content">{item.valor || "—"}</div>
                <div className="mt-1 text-xs text-muted">{item.detalle || "Sin detalle"}</div>
              </div>
            )) : <div className="text-sm text-muted">Sin historia registral estructurada.</div>}
          </div>
        </Section>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Section icon={AlertTriangle} title="Proveedores ficticios DIAN">
          <div className={`rounded-2xl border px-4 py-4 text-sm leading-6 ${
            alertaDian ? "border-warn/30 bg-warn/10 text-warn" : "border-ok/30 bg-ok/10 text-ok"
          }`}>
            {proveedores.mensaje || "Validación DIAN no disponible."}
          </div>
        </Section>

        <Section icon={Store} title="Propietario / establecimiento" count={propietarios.length}>
          <div className="grid gap-2.5">
            {propietarios.length ? propietarios.slice(0, 3).map((item, index) => (
              <div key={`${item.titulo}-${index}`} className="rounded-2xl border border-line/15 bg-surface-2/70 p-4">
                <div className="text-sm font-bold text-content">{item.titulo || `Establecimiento ${index + 1}`}</div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {Object.entries(item.campos || {}).slice(0, 4).map(([label, value]) => (
                    <div key={label}>
                      <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</div>
                      <div className="mt-0.5 text-xs font-medium text-content">{fmtText(value)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )) : <div className="text-sm text-muted">{data.propietario_establecimiento?.mensaje || "Sin establecimientos disponibles."}</div>}
          </div>
        </Section>
      </div>

      {data.captura_principal && (
        <Section icon={ImageIcon} title="Captura de la consulta">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="group relative block overflow-hidden rounded-2xl border border-line/15 bg-surface-2/70 text-left"
          >
            <img src={data.captura_principal} alt="Captura de la empresa" className="max-h-[360px] w-full object-cover opacity-90 transition group-hover:scale-[1.01] group-hover:opacity-100" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-slate-950/90 to-transparent px-4 py-4">
              <span className="text-sm font-bold text-white">Ver captura ampliada</span>
              <ExternalLink className="h-4 w-4 text-cyan-200" />
            </div>
          </button>
        </Section>
      )}

      {previewOpen && data.captura_principal && (
        <div className="fixed inset-0 z-[12000] flex items-center justify-center bg-slate-950/88 p-4 backdrop-blur-md" onClick={() => setPreviewOpen(false)}>
          <div className="relative max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-cyan-400/20 bg-slate-950 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="absolute right-3 top-3 z-10 rounded-full border border-white/10 bg-slate-950/80 p-2 text-white transition hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
            <img src={data.captura_principal} alt="Captura ampliada de la empresa" className="max-h-[92vh] w-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
