import { useEffect, useMemo, useState } from "react";
import { Activity, BarChart3, Mail, MapPin, Phone, ShieldCheck, UserRound } from "lucide-react";
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

function toArray(v) {
  return Array.isArray(v) ? v : [];
}
function fmtText(v) {
  if (v === null || v === undefined || v === "" || v === "null") return "—";
  return String(v);
}
function tipoDireccion(d) {
  if (d.tipoResidencia) return "Residencia";
  if (d.tipoLaboralOComercial) return "Laboral / Comercial";
  if (d.tipoCorrespondencia) return "Correspondencia";
  return fmtText(d.tipo);
}

function numValue(value) {
  const n = Number(String(value ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function parseDateValue(value) {
  const text = String(value || "").trim();
  if (!text || text === "—") return null;
  const normalized = text.includes("/") ? text.split("/").reverse().join("-") : text.slice(0, 10);
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function shortDate(value) {
  const date = parseDateValue(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat("es-CO", { month: "short", year: "2-digit" }).format(date).replace(".", "");
}

function latestDateFrom(items, field) {
  return items
    .map((item) => parseDateValue(item?.[field]))
    .filter(Boolean)
    .sort((a, b) => b - a)[0] || null;
}

function Section({ icon: Icon, title, count, children }) {
  return (
    <section className="rounded-[22px] border border-white/[0.08] bg-slate-950/60 p-5 backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-400/[0.08] text-cyan-300">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-base font-bold text-white">{title}</h3>
        {count !== undefined && (
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-semibold text-slate-300">{count}</span>
        )}
      </div>
      {children}
    </section>
  );
}

function StatTile({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className="mt-1.5 text-sm font-bold text-white">{value}</div>
    </div>
  );
}

const CHART_COLORS = ["#38bdf8", "#2dd4bf", "#a78bfa", "#f59e0b"];

function ExecutiveChartPanel({ direcciones, celulares, telefonos, emails }) {
  const channels = [
    { name: "Direcciones", value: direcciones.length, color: CHART_COLORS[0] },
    { name: "Celulares", value: celulares.length, color: CHART_COLORS[1] },
    { name: "Fijos", value: telefonos.length, color: CHART_COLORS[2] },
    { name: "Correos", value: emails.length, color: CHART_COLORS[3] },
  ].filter((item) => item.value > 0);

  const strength = [
    { name: "Direcciones", reportes: direcciones.reduce((s, i) => s + numValue(i.numReportes), 0), entidades: direcciones.reduce((s, i) => s + numValue(i.numeroEntidades), 0) },
    { name: "Celulares", reportes: celulares.reduce((s, i) => s + numValue(i.numReportes), 0), entidades: celulares.reduce((s, i) => s + numValue(i.numeroEntidades), 0) },
    { name: "Fijos", reportes: telefonos.reduce((s, i) => s + numValue(i.numReportes), 0), entidades: telefonos.reduce((s, i) => s + numValue(i.numeroEntidades), 0) },
    { name: "Correos", reportes: emails.reduce((s, i) => s + numValue(i.numReportes), 0), entidades: emails.reduce((s, i) => s + numValue(i.numeroEntidades), 0) },
  ].filter((item) => item.reportes > 0 || item.entidades > 0);

  const totalChannels = channels.reduce((sum, item) => sum + item.value, 0);
  const principal = channels[0] || { name: "Sin datos", value: 0 };
  const latest = latestDateFrom([...direcciones, ...celulares, ...telefonos, ...emails], "ultimoReporte");
  const oldest = [...direcciones, ...celulares, ...telefonos, ...emails]
    .map((item) => parseDateValue(item?.reportadoDesde))
    .filter(Boolean)
    .sort((a, b) => a - b)[0];

  if (!channels.length && !strength.length) return null;

  return (
    <Section icon={Activity} title="Resumen de contactabilidad">
      <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-slate-900/85 via-[#0b2630]/75 to-slate-950/85 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-black text-white">Cobertura por canal</div>
              <div className="text-xs text-slate-400">Registros encontrados por tipo de dato.</div>
            </div>
            <BarChart3 className="h-5 w-5 text-cyan-300" />
          </div>
          <div className="grid gap-3 sm:grid-cols-[220px_1fr]">
            <div className="relative h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channels}
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
                    {channels.map((item) => <Cell key={item.name} fill={item.color} />)}
                  </Pie>
                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      background: "rgba(6, 24, 31, 0.96)",
                      border: "1px solid rgba(103, 232, 249, 0.18)",
                      borderRadius: 12,
                      color: "#e8f1f2",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <div className="text-3xl font-black text-white">{totalChannels}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200">registros</div>
              </div>
            </div>
            <div className="grid content-center gap-2">
              {channels.map((item) => {
                const percent = totalChannels ? (item.value / totalChannels) * 100 : 0;
                return (
                  <div key={item.name} className="rounded-xl border border-white/[0.07] bg-white/[0.035] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-2 text-sm font-bold text-white">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.name}
                      </span>
                      <span className="text-sm font-black text-cyan-100">{percent.toFixed(0)}%</span>
                    </div>
                    <div className="mt-1 text-xs text-slate-400">{item.value} registro(s)</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {strength.length > 0 && (
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4">
              <div className="mb-3">
                <div className="text-sm font-black text-white">Solidez de los datos reportados</div>
                <div className="text-xs text-slate-400">Cruza cantidad de reportes y entidades informantes.</div>
              </div>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={strength} margin={{ top: 8, right: 10, left: -18, bottom: 0 }}>
                    <CartesianGrid stroke="#24424c" strokeOpacity={0.45} vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "#9bb9c3", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#9bb9c3", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      cursor={{ fill: "rgba(103,232,249,0.06)" }}
                      contentStyle={{
                        background: "rgba(6, 24, 31, 0.96)",
                        border: "1px solid rgba(103, 232, 249, 0.18)",
                        borderRadius: 12,
                        color: "#e8f1f2",
                      }}
                    />
                    <Bar dataKey="reportes" name="Reportes" fill="#38bdf8" radius={[8, 8, 0, 0]} isAnimationActive animationDuration={900} />
                    <Bar dataKey="entidades" name="Entidades" fill="#2dd4bf" radius={[8, 8, 0, 0]} isAnimationActive animationDuration={1100} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <StatTile label="Canal principal" value={principal.name} />
            <StatTile label="Último reporte" value={latest ? shortDate(latest) : "—"} />
            <StatTile label="Primer registro" value={oldest ? shortDate(oldest) : "—"} />
            <StatTile label="Fuentes acumuladas" value={String(strength.reduce((s, item) => s + item.entidades, 0) || "—")} />
          </div>
        </div>
      </div>
    </Section>
  );
}

function InfoCard({ titulo, badge, filas }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 transition hover:border-white/15 hover:bg-white/[0.05]">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="truncate text-sm font-bold text-white">{titulo}</div>
        {badge && (
          <span className="shrink-0 rounded-md border border-cyan-400/25 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-300">
            {badge}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-4">
        {filas.filter((f) => f && f.value !== "—").map((f) => (
          <div key={f.label}>
            <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">{f.label}</div>
            <div className="mt-0.5 text-xs font-medium text-slate-100">{f.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReconocerDetalleResultados({ consultaId }) {
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showJson, setShowJson] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/reconocer/consultas/${consultaId}/`,
          { headers: { Authorization: `Token ${token}` } }
        );
        const json = await response.json();
        if (!response.ok) throw new Error(json?.detail || `Error HTTP ${response.status}`);
        if (!cancelled) setDetalle(json);
      } catch (e) {
        if (!cancelled) setError(e.message || "No fue posible cargar Econfia Recognize.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [consultaId]);

  const rep = useMemo(() => {
    const root = detalle?.respuesta_json || {};
    return root.reporte || root;
  }, [detalle]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-t-cyan-400 border-slate-800" />
      </div>
    );
  }
  if (error) {
    return <div className="mx-auto max-w-md rounded-2xl border border-rose-500/20 bg-rose-500/[0.06] p-6 text-center text-sm text-rose-200">{error}</div>;
  }
  if (!detalle) return null;

  const basica = rep.informacionBasica || {};
  const edad = basica.rangoEdad ? `${basica.rangoEdad.min} - ${basica.rangoEdad.max} años` : "—";
  const direcciones = toArray(rep.direcciones);
  const celulares = toArray(rep.celulares);
  const telefonos = toArray(rep.telefonos);
  const emails = toArray(rep.emails);

  const fullName = basica.nombreCompleto || detalle.apellido_razon_social || "—";

  return (
    <div className="grid gap-4">
      {/* Encabezado */}
      <div className="relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-slate-950/70 p-6 backdrop-blur-xl">
        <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-cyan-500/[0.06] blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Econfia Recognize
          </div>
        </div>
        <h2 className="mt-4 text-2xl font-black tracking-tight text-white md:text-3xl">{fullName}</h2>
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-400">
          <span>Doc: {fmtText(basica.numeroIdentificacion || detalle.numero_identificacion)}</span>
          {basica.genero && <span>Género: {basica.genero === "M" ? "Masculino" : basica.genero === "F" ? "Femenino" : basica.genero}</span>}
          <span>Edad: {edad}</span>
          {rep.fechaConsulta && <span>Consulta: {String(rep.fechaConsulta).slice(0, 10)}</span>}
        </div>
      </div>

      <ExecutiveChartPanel
        direcciones={direcciones}
        celulares={celulares}
        telefonos={telefonos}
        emails={emails}
      />

      {/* Identificación */}
      <Section icon={UserRound} title="Identificación">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Documento" value={fmtText(basica.numeroIdentificacion)} />
          <StatTile label="Estado documento" value={fmtText(basica.estadoDocumento)} />
          <StatTile label="Expedición" value={fmtText(basica.fechaExpedicion)} />
          <StatTile label="Lugar expedición" value={`${fmtText(basica.municipioExpedicion)}, ${fmtText(basica.departamentoExpedicion)}`} />
        </div>
      </Section>

      {/* Direcciones */}
      {direcciones.length > 0 && (
        <Section icon={MapPin} title="Direcciones" count={direcciones.length}>
          <div className="grid gap-2.5">
            {direcciones.map((d, i) => (
              <InfoCard
                key={i}
                titulo={fmtText(d.dato)}
                badge={tipoDireccion(d)}
                filas={[
                  { label: "Ciudad", value: `${fmtText(d.nombreCiudad)}, ${fmtText(d.nombreDepartamento)}` },
                  { label: "Reportado desde", value: fmtText(d.reportadoDesde) },
                  { label: "Último reporte", value: fmtText(d.ultimoReporte) },
                  { label: "N° reportes", value: fmtText(d.numReportes) },
                  { label: "N° entidades", value: fmtText(d.numeroEntidades) },
                  { label: "Antigüedad (meses)", value: fmtText(d.antiguedad) },
                ]}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Celulares */}
      {(celulares.length > 0 || telefonos.length > 0) && (
        <Section icon={Phone} title="Teléfonos y celulares" count={celulares.length + telefonos.length}>
          <div className="grid gap-2.5 md:grid-cols-2">
            {celulares.map((c, i) => (
              <InfoCard
                key={`cel-${i}`}
                titulo={fmtText(c.celular)}
                badge="Celular"
                filas={[
                  { label: "Reportado desde", value: fmtText(c.reportadoDesde) },
                  { label: "Último reporte", value: fmtText(c.ultimoReporte) },
                  { label: "N° reportes", value: fmtText(c.numReportes) },
                  { label: "N° entidades", value: fmtText(c.numeroEntidades) },
                ]}
              />
            ))}
            {telefonos.map((t, i) => (
              <InfoCard
                key={`tel-${i}`}
                titulo={fmtText(t.telefono || t.numero)}
                badge="Fijo"
                filas={[
                  { label: "Reportado desde", value: fmtText(t.reportadoDesde) },
                  { label: "Último reporte", value: fmtText(t.ultimoReporte) },
                  { label: "N° reportes", value: fmtText(t.numReportes) },
                ]}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Emails */}
      {emails.length > 0 && (
        <Section icon={Mail} title="Correos electrónicos" count={emails.length}>
          <div className="grid gap-2 md:grid-cols-2">
            {emails.map((e, i) => (
              <div key={i} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">{fmtText(e.email)}</div>
                  <div className="text-xs text-slate-400">
                    {fmtText(e.reportadoDesde)} → {fmtText(e.ultimoReporte)} · {fmtText(e.numReportes)} reportes
                  </div>
                </div>
                <Mail className="h-4 w-4 shrink-0 text-cyan-300" />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* JSON crudo */}
      <div>
        <button type="button" onClick={() => setShowJson((v) => !v)} className="text-xs font-semibold text-cyan-300 hover:text-cyan-200">
          {showJson ? "Ocultar" : "Ver"} respuesta completa (JSON)
        </button>
        {showJson && (
          <pre className="mt-2 max-h-[28rem] overflow-auto rounded-xl border border-white/10 bg-[#02040a] p-4 text-[11px] leading-5 text-cyan-100/80">
            {JSON.stringify(detalle.respuesta_json, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
