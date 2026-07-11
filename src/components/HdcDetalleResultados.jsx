import { useMemo, useState } from "react";
import {
  CreditCard,
  Landmark,
  PiggyBank,
  Search,
  ShieldCheck,
  UserRound,
  Wallet,
} from "lucide-react";

// ── Helpers ─────────────────────────────────────────────────────────────────

function toArray(value) {
  return Array.isArray(value) ? value : [];
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

// ── Componente principal ────────────────────────────────────────────────────

export default function HdcDetalleResultados({ data, consulta }) {
  const [showJson, setShowJson] = useState(false);

  const pr = useMemo(() => {
    const root = data || {};
    return root.ReportHDCplus?.productResult || root.productResult || root.ReportHDCplus || root;
  }, [data]);

  const basic = pr.basicInformation || {};
  const location = pr.location || {};
  const natural = location.nationalNatural || {};
  const identificacion = basic.identification || natural.identification || {};
  const age = basic.age || natural.age || {};

  const savings = toArray(pr.savings);
  const liabilities = toArray(pr.liabilities);
  const creditCard = toArray(pr.creditCard);
  const global = toArray(pr.globalIndebtedness);
  const footprints = toArray(pr.inquiryFootprints);

  const overview = pr.agregatedInfo?.overview || {};
  const principals = overview.principals || {};
  const balances = overview.balances || {};

  const fullName = basic.fullName || natural.fullName || consulta?.apellido_razon_social || "—";
  const genero = basic.genderDesc || natural.genderDesc || "";
  const edad = age.min && age.max ? `${age.min} - ${age.max} años` : "—";

  const totalDeuda = sumField(liabilities, "debtBalance") + sumField(creditCard, "debtBalance");
  const totalCuota = sumField(liabilities, "valueMonthlyPayment") + sumField(creditCard, "valueMonthlyPayment");

  return (
    <div className="grid gap-4">
      {/* Encabezado */}
      <div className="relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-slate-950/70 p-6 backdrop-blur-xl">
        <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-cyan-500/[0.06] blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Historia de Crédito
          </div>
          {pr.responseDesc && <Badge tone="emerald">{pr.responseDesc}</Badge>}
        </div>
        <h2 className="mt-4 text-2xl font-black tracking-tight text-white md:text-3xl">{fullName}</h2>
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-400">
          <span>Doc: {fmtText(basic.personId?.personIdNumber || consulta?.numero_identificacion)}</span>
          {genero && <span>Género: {genero}</span>}
          <span>Edad: {edad}</span>
          {pr.consultDate && <span>Consulta: {String(pr.consultDate).slice(0, 10)}</span>}
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
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
