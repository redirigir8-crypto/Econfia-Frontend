import { useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  Landmark,
  PiggyBank,
  Search,
  ShieldCheck,
  UserRound,
  Wallet,
} from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ── Helpers ─────────────────────────────────────────────────────────────────

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

// Busca la primera aparición de `key` en cualquier nivel del objeto.
// Así funciona sin importar si la respuesta viene bajo ReportHDCplus,
// productResult, o directo.
function deepFind(root, key) {
  const stack = [root];
  while (stack.length) {
    const node = stack.shift();
    if (Array.isArray(node)) {
      for (const v of node) if (v && typeof v === "object") stack.push(v);
    } else if (node && typeof node === "object") {
      if (node[key] !== undefined) return node[key];
      for (const v of Object.values(node)) if (v && typeof v === "object") stack.push(v);
    }
  }
  return undefined;
}

function fmtMoney(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "$0";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

function numValue(value) {
  const numeric = Number(String(value ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 0;
}

function fmtAxis(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  if (Math.abs(n) >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (Math.abs(n) >= 1000) return `${Math.round(n / 1000)}k`;
  return String(Math.round(n));
}

function fmtText(value) {
  if (value === null || value === undefined || value === "" || value === "null") return "—";
  return String(value);
}

// Cada cuenta viene como { account: {...} } — devuelve el objeto real.
function acc(item) {
  return (item && typeof item === "object" && item.account) ? item.account : item || {};
}

function sumField(list, field) {
  return list.reduce((total, item) => {
    const value = Number(acc(item)[field]);
    return total + (Number.isFinite(value) && value > 0 ? value : 0);
  }, 0);
}

const DEBT_COMPOSITION_COLORS = ["#38bdf8", "#34d399", "#f59e0b", "#a78bfa", "#fb7185"];

function buildDebtCompositionData({ liabilities, creditCard, global }) {
  const direct = [
    { name: "Obligaciones", value: sumField(liabilities, "debtBalance"), color: DEBT_COMPOSITION_COLORS[0] },
    { name: "Tarjetas", value: sumField(creditCard, "debtBalance"), color: DEBT_COMPOSITION_COLORS[1] },
  ].filter((item) => item.value > 0);

  if (direct.length) return direct;

  const grouped = new Map();
  global.forEach((item) => {
    const name = fmtText(item.typeOfCreditDesc || item.entity?.businessLineName || "Otros");
    const value = numValue(item.capitalValue) * 1000;
    if (value > 0) grouped.set(name, (grouped.get(name) || 0) + value);
  });

  return Array.from(grouped.entries())
    .map(([name, value], index) => ({
      name,
      value,
      color: DEBT_COMPOSITION_COLORS[index % DEBT_COMPOSITION_COLORS.length],
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}

function buildDebtTrendData(root) {
  const evolution = deepFind(root, "debtEvolution");
  const trimester = toArray(evolution?.trimester);
  if (!trimester.length) return [];

  return trimester
    .map((item) => {
      const deb = item?.DebBasic || {};
      const rawPercent = numValue(deb.usePercentage ?? deb.debtPercentage);
      return {
        period: String(item?.trimesterDate || "").slice(0, 7),
        cupo: numValue(deb.initialValue),
        saldo: numValue(deb.debtBalance),
        deuda: rawPercent <= 1 ? Math.round(rawPercent * 1000) / 10 : Math.round(rawPercent * 10) / 10,
      };
    })
    .filter((item) => item.period && (item.cupo > 0 || item.saldo > 0 || item.deuda > 0))
    .sort((a, b) => a.period.localeCompare(b.period))
    .slice(-8);
}

// ── UI atoms ────────────────────────────────────────────────────────────────

function StatTile({ label, value, tone = "cyan" }) {
  const tones = {
    cyan: "border-cyan-500/20 from-cyan-500/10 to-blue-500/5 text-cyan-200",
    emerald: "border-emerald-500/20 from-emerald-500/10 to-cyan-500/5 text-emerald-200",
    amber: "border-amber-500/20 from-amber-500/10 to-orange-500/5 text-amber-200",
    rose: "border-rose-500/20 from-rose-500/10 to-pink-500/5 text-rose-200",
    slate: "border-white/10 from-white/[0.05] to-white/[0.02] text-slate-200",
  };
  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-4 ${tones[tone] || tones.cyan}`}>
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className="mt-1.5 text-lg font-black leading-tight text-white">{value}</div>
    </div>
  );
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
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-semibold text-slate-300">
            {count}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function estadoTone(desc) {
  const d = String(desc || "").toLowerCase();
  if (d.includes("mora") || d.includes("vencid")) return "rose";
  if (d.includes("al d") || d.includes("activ") || d.includes("vigente")) return "emerald";
  return "slate";
}

function Badge({ children, tone = "slate" }) {
  const tones = {
    emerald: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
    rose: "border-rose-500/25 bg-rose-500/10 text-rose-300",
    slate: "border-white/10 bg-white/5 text-slate-300",
  };
  return (
    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${tones[tone]}`}>
      {children}
    </span>
  );
}

function AccountCard({ titulo, subtitulo, estado, filas }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 transition hover:border-white/15 hover:bg-white/[0.05]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-white">{titulo}</div>
          {subtitulo && <div className="mt-0.5 text-xs text-slate-400">{subtitulo}</div>}
        </div>
        {estado && <Badge tone={estadoTone(estado)}>{estado}</Badge>}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
        {filas.filter((f) => f && f.value !== "—" && f.value !== "$0").map((f) => (
          <div key={f.label}>
            <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">{f.label}</div>
            <div className="mt-0.5 text-xs font-medium text-slate-100">{f.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DebtCompositionDonut({ data }) {
  if (!data.length) return null;

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Section icon={Wallet} title="Distribución de endeudamiento actual">
      <div className="grid gap-4 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-slate-900/80 via-[#0b2630]/80 to-slate-950/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] lg:grid-cols-[minmax(260px,0.9fr)_1.1fr]">
        <div className="relative h-[280px] min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {data.map((item, index) => (
                  <linearGradient key={item.name} id={`hdc-donut-${index}`} x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor={item.color} stopOpacity={0.98} />
                    <stop offset="100%" stopColor={item.color} stopOpacity={0.55} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="58%"
                outerRadius="82%"
                paddingAngle={3}
                cornerRadius={9}
                stroke="rgba(2,6,23,0.72)"
                strokeWidth={3}
                isAnimationActive
                animationDuration={950}
              >
                {data.map((item, index) => (
                  <Cell key={item.name} fill={`url(#hdc-donut-${index})`} />
                ))}
              </Pie>
              <Tooltip
                cursor={false}
                contentStyle={{
                  background: "rgba(6, 24, 31, 0.96)",
                  border: "1px solid rgba(103, 232, 249, 0.18)",
                  borderRadius: 12,
                  color: "#e8f1f2",
                  boxShadow: "0 18px 48px rgba(2,6,23,.32)",
                }}
                formatter={(value, name) => [fmtMoney(value), name]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Total deuda</div>
            <div className="mt-1 text-2xl font-black tracking-tight text-white">{fmtMoney(total)}</div>
          </div>
        </div>

        <div className="grid content-center gap-2">
          {data.map((item) => {
            const percent = total > 0 ? (item.value / total) * 100 : 0;
            return (
              <div key={item.name} className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="truncate text-sm font-bold text-white">{item.name}</span>
                  </div>
                  <span className="shrink-0 text-sm font-black text-cyan-100">{percent.toFixed(1)}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(percent, 2)}%`,
                      background: `linear-gradient(90deg, ${item.color}, rgba(255,255,255,0.56))`,
                    }}
                  />
                </div>
                <div className="mt-1.5 text-xs font-semibold text-slate-300">{fmtMoney(item.value)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

function DebtTrendChart({ data }) {
  if (!data.length) return null;

  return (
    <Section icon={Wallet} title="Evolución de cupo, saldo y % de deuda">
      <div className="rounded-2xl border border-white/[0.08] bg-[#0b2630]/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 14, right: 28, left: 4, bottom: 8 }}>
              <defs>
                <linearGradient id="hdc-cupo-line" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0ea5e9" />
                </linearGradient>
                <linearGradient id="hdc-saldo-line" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#22424c" strokeOpacity={0.62} vertical={false} />
              <XAxis
                dataKey="period"
                tick={{ fill: "#9bb9c3", fontSize: 12 }}
                axisLine={{ stroke: "#2b5662" }}
                tickLine={false}
              />
              <YAxis
                yAxisId="money"
                tickFormatter={fmtAxis}
                tick={{ fill: "#9bb9c3", fontSize: 12 }}
                axisLine={{ stroke: "#2b5662" }}
                tickLine={false}
                label={{ value: "Valor reportado", angle: -90, position: "insideLeft", fill: "#9bb9c3", fontSize: 12 }}
              />
              <YAxis
                yAxisId="percent"
                orientation="right"
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                tick={{ fill: "#9bb9c3", fontSize: 12 }}
                axisLine={{ stroke: "#2b5662" }}
                tickLine={false}
                label={{ value: "% deuda", angle: 90, position: "insideRight", fill: "#9bb9c3", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ stroke: "#67e8f9", strokeOpacity: 0.18 }}
                contentStyle={{
                  background: "rgba(6, 24, 31, 0.96)",
                  border: "1px solid rgba(103, 232, 249, 0.18)",
                  borderRadius: 12,
                  color: "#e8f1f2",
                  boxShadow: "0 18px 48px rgba(2,6,23,.32)",
                }}
                formatter={(value, name) => {
                  if (name === "% deuda") return [`${Number(value).toFixed(1)}%`, name];
                  return [fmtMoney(value), name];
                }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                wrapperStyle={{ color: "#c8d9de", fontSize: 12 }}
              />
              <Line
                yAxisId="money"
                type="monotone"
                dataKey="cupo"
                name="Cupo total"
                stroke="url(#hdc-cupo-line)"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: "#0b2630", stroke: "#38bdf8" }}
                activeDot={{ r: 6 }}
                isAnimationActive
                animationDuration={900}
              />
              <Line
                yAxisId="money"
                type="monotone"
                dataKey="saldo"
                name="Saldo total"
                stroke="url(#hdc-saldo-line)"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: "#0b2630", stroke: "#34d399" }}
                activeDot={{ r: 6 }}
                isAnimationActive
                animationDuration={1050}
              />
              <Line
                yAxisId="percent"
                type="monotone"
                dataKey="deuda"
                name="% deuda"
                stroke="#f59e0b"
                strokeWidth={3}
                strokeDasharray="7 5"
                dot={{ r: 4, strokeWidth: 2, fill: "#0b2630", stroke: "#f59e0b" }}
                activeDot={{ r: 6 }}
                isAnimationActive
                animationDuration={1200}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Section>
  );
}

// ── Componente principal ────────────────────────────────────────────────────

export default function HdcDetalleResultados({ data, consulta, consultaId }) {
  const [showJson, setShowJson] = useState(false);
  const [fetched, setFetched] = useState(null);
  const [loading, setLoading] = useState(Boolean(consultaId && !data));
  const [error, setError] = useState("");

  // Modo "por id": carga el detalle desde el backend.
  useEffect(() => {
    if (!consultaId || data) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/hdc/consultas/${consultaId}/`,
          { headers: { Authorization: `Token ${token}` } }
        );
        const json = await response.json();
        if (!response.ok) throw new Error(json?.detail || `Error HTTP ${response.status}`);
        if (!cancelled) setFetched(json);
      } catch (e) {
        if (!cancelled) setError(e.message || "No fue posible cargar Econfia Credit Report.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [consultaId, data]);

  const consultaObj = consulta || fetched || {};
  const respuesta = useMemo(() => data || fetched?.respuesta_json || {}, [data, fetched]);

  const pr = useMemo(() => respuesta || {}, [respuesta]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-t-cyan-400 border-slate-800" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-rose-500/20 bg-rose-500/[0.06] p-6 text-center text-sm text-rose-200">
        {error}
      </div>
    );
  }

  const basic = deepFind(pr, "basicInformation") || {};
  const natural = deepFind(pr, "nationalNatural") || {};
  const identificacion = basic.identification || natural.identification || {};
  const age = basic.age || natural.age || {};

  const savings = toArray(deepFind(pr, "savings"));
  const liabilities = toArray(deepFind(pr, "liabilities"));
  const creditCard = toArray(deepFind(pr, "creditCard"));
  const global = toArray(deepFind(pr, "globalIndebtedness"));
  const footprints = toArray(deepFind(pr, "inquiryFootprints"));

  const overview = deepFind(pr, "overview") || {};
  const principals = overview.principals || deepFind(pr, "principals") || {};
  const balances = overview.balances || deepFind(pr, "balances") || {};
  const responseDesc = deepFind(pr, "responseDesc");
  const consultDate = deepFind(pr, "consultDate");

  const fullName = basic.fullName || natural.fullName || consultaObj?.apellido_razon_social || "—";
  const genero = basic.genderDesc || natural.genderDesc || "";
  const edad = age.min && age.max ? `${age.min} - ${age.max} años` : "—";

  const totalDeuda = sumField(liabilities, "debtBalance") + sumField(creditCard, "debtBalance");
  const totalCuota = sumField(liabilities, "valueMonthlyPayment") + sumField(creditCard, "valueMonthlyPayment");
  const debtCompositionData = buildDebtCompositionData({ liabilities, creditCard, global });
  const debtTrendData = buildDebtTrendData(pr);

  return (
    <div className="grid gap-4">
      {/* Encabezado */}
      <div className="relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-slate-950/70 p-6 backdrop-blur-xl">
        <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-cyan-500/[0.06] blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Econfia Credit Report
          </div>
          {responseDesc && <Badge tone="emerald">{responseDesc}</Badge>}
        </div>
        <h2 className="mt-4 text-2xl font-black tracking-tight text-white md:text-3xl">{fullName}</h2>
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-400">
          <span>Doc: {fmtText(basic.personId?.personIdNumber || consultaObj?.numero_identificacion)}</span>
          {genero && <span>Género: {genero}</span>}
          <span>Edad: {edad}</span>
          {consultDate && <span>Consulta: {String(consultDate).slice(0, 10)}</span>}
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Deuda total" value={fmtMoney(totalDeuda)} tone="cyan" />
        <StatTile label="Cuota mensual" value={fmtMoney(totalCuota)} tone="emerald" />
        <StatTile label="Créditos vigentes" value={fmtText(principals.currentCredits)} tone="slate" />
        <StatTile
          label="Créditos negativos"
          value={fmtText(principals.currentNegativeCredits ?? "0")}
          tone={Number(principals.currentNegativeCredits) > 0 ? "rose" : "emerald"}
        />
        <StatTile label="Créditos cerrados" value={fmtText(principals.closedCredits)} tone="slate" />
        <StatTile label="Consultas (6 meses)" value={fmtText(principals.consultedLast6Months)} tone="amber" />
        <StatTile label="Mora total" value={fmtMoney(Number(balances.totalValueBalanceOverdue) * 1000)} tone={Number(balances.totalValueBalanceOverdue) > 0 ? "rose" : "emerald"} />
        <StatTile label="Antigüedad desde" value={fmtText(principals.maturationSince)} tone="slate" />
      </div>

      <DebtCompositionDonut data={debtCompositionData} />
      <DebtTrendChart data={debtTrendData} />

      {/* Identificación */}
      <Section icon={UserRound} title="Identificación">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Documento" value={fmtText(basic.personId?.personIdNumber)} tone="slate" />
          <StatTile label="Estado documento" value={fmtText(identificacion.statusDesc || identificacion.statusId)} tone="slate" />
          <StatTile label="Expedición" value={fmtText(identificacion.issueDate)} tone="slate" />
          <StatTile label="Ciudad expedición" value={fmtText(identificacion.issuingCityName)} tone="slate" />
        </div>
      </Section>

      {/* Obligaciones */}
      {liabilities.length > 0 && (
        <Section icon={Landmark} title="Obligaciones / Créditos" count={liabilities.length}>
          <div className="grid gap-2.5">
            {liabilities.map((item, i) => {
              const a = acc(item);
              return (
                <AccountCard
                  key={a.primaryKey || i}
                  titulo={fmtText(a.businessLineName)}
                  subtitulo={fmtText(a.featuresLiabilities?.typeOfCreditDesc || a.accountTypeDesc)}
                  estado={a.status?.account?.businessAccountStatusDesc || a.paymentTypeDesc}
                  filas={[
                    { label: "Saldo deuda", value: fmtMoney(a.debtBalance) },
                    { label: "Cuota mensual", value: fmtMoney(a.valueMonthlyPayment) },
                    { label: "Valor inicial", value: fmtMoney(a.initialValue) },
                    { label: "Apertura", value: fmtText(a.accountOpeningDate) },
                    { label: "Vencimiento", value: fmtText(a.liabilitiesAccount?.expiryDate) },
                    { label: "Calificación", value: fmtText(a.ratingDesc) },
                    { label: "Cuotas mora", value: fmtText(a.installmentsOverdue) },
                    { label: "Saldo en mora", value: fmtMoney(a.businessValueBalanceOverdue) },
                  ]}
                />
              );
            })}
          </div>
        </Section>
      )}

      {/* Tarjetas de crédito */}
      {creditCard.length > 0 && (
        <Section icon={CreditCard} title="Tarjetas de crédito" count={creditCard.length}>
          <div className="grid gap-2.5">
            {creditCard.map((item, i) => {
              const a = acc(item);
              return (
                <AccountCard
                  key={a.primaryKey || i}
                  titulo={fmtText(a.businessLineCode || a.businessLineName)}
                  subtitulo={fmtText(a.FeaturesCreditCard?.franchiseName)}
                  estado={a.status?.account?.businessAccountStatusDesc}
                  filas={[
                    { label: "Cupo disponible", value: fmtMoney(a.availableBalance) },
                    { label: "Saldo deuda", value: fmtMoney(a.debtBalance) },
                    { label: "Cupo total", value: fmtMoney(a.initialValue) },
                    { label: "Cuota mensual", value: fmtMoney(a.valueMonthlyPayment) },
                    { label: "Estado tarjeta", value: fmtText(a.card?.cardStatusName) },
                    { label: "Apertura", value: fmtText(a.accountOpeningDate) },
                  ]}
                />
              );
            })}
          </div>
        </Section>
      )}

      {/* Cuentas / productos de ahorro */}
      {savings.length > 0 && (
        <Section icon={PiggyBank} title="Cuentas y productos" count={savings.length}>
          <div className="grid gap-2.5 md:grid-cols-2">
            {savings.map((item, i) => {
              const a = acc(item);
              return (
                <AccountCard
                  key={a.primaryKey || i}
                  titulo={fmtText(a.businessLineName)}
                  subtitulo={fmtText(a.subAccountTypeName)}
                  estado={a.status?.businessBureauEventDesc}
                  filas={[
                    { label: "Número", value: fmtText(a.accountNumber) },
                    { label: "Apertura", value: fmtText(a.accountOpeningDate) },
                    { label: "Ciudad", value: fmtText(a.filingCityName) },
                  ]}
                />
              );
            })}
          </div>
        </Section>
      )}

      {/* Endeudamiento global */}
      {global.length > 0 && (
        <Section icon={Wallet} title="Endeudamiento global" count={global.length}>
          <div className="grid gap-2.5 md:grid-cols-2">
            {global.map((item, i) => (
              <AccountCard
                key={i}
                titulo={fmtText(item.entity?.businessLineName)}
                subtitulo={fmtText(item.typeOfCreditDesc)}
                estado={item.quarterQualificationDesc || item.quarterQualification}
                filas={[
                  { label: "Capital", value: fmtMoney(Number(item.capitalValue) * 1000) },
                  { label: "Fuente", value: fmtText(item.sourceGlobalIndebtednessDesc) },
                  { label: "Corte", value: fmtText(item.cutoffDate) },
                  { label: "Obligaciones", value: fmtText(item.quantityOfObligations) },
                ]}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Huellas de consulta */}
      {footprints.length > 0 && (
        <Section icon={Search} title="Huellas de consulta" count={footprints.length}>
          <div className="grid gap-2 md:grid-cols-2">
            {footprints.map((item, i) => (
              <div key={item.primaryKey || i} className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">{fmtText(item.inquiryBusinessName)}</div>
                  <div className="text-xs text-slate-400">{fmtText(item.inquiryReasonDesc)}</div>
                </div>
                <div className="shrink-0 text-xs font-medium text-cyan-300">{fmtText(item.inquiryDate)}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* JSON crudo (respaldo) */}
      <div>
        <button
          type="button"
          onClick={() => setShowJson((v) => !v)}
          className="text-xs font-semibold text-cyan-300 hover:text-cyan-200"
        >
          {showJson ? "Ocultar" : "Ver"} respuesta completa (JSON)
        </button>
        {showJson && (
          <pre className="mt-2 max-h-[28rem] overflow-auto rounded-xl border border-white/10 bg-[#02040a] p-4 text-[11px] leading-5 text-cyan-100/80">
            {JSON.stringify(respuesta, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
