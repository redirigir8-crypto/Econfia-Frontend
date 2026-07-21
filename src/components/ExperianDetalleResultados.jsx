import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Briefcase,
  Building2,
  FileSearch,
  Landmark,
  ShieldCheck,
  UserRound,
  Wallet,
  X,
} from "lucide-react";

function humanizeKey(key) {
  return String(key || "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function objectToText(obj) {
  return Object.values(obj || {})
    .filter((v) => v !== null && v !== undefined && v !== "")
    .map((v) => (typeof v === "object" ? objectToText(v) : String(v)))
    .filter(Boolean)
    .join(" — ");
}

function displayValue(value) {
  if (value === null || value === undefined || value === "") return "No disponible";
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (Array.isArray(value)) {
    const parts = value
      .map((v) => (v && typeof v === "object" ? objectToText(v) : String(v ?? "")))
      .filter(Boolean);
    return parts.length ? parts.join(" · ") : "No disponible";
  }
  if (typeof value === "object") {
    const text = objectToText(value);
    return text || "No disponible";
  }
  return String(value);
}

function formatMoney(value) {
  const raw = String(value ?? "").replace(/[^\d-]/g, "");
  if (!raw) return displayValue(value);
  const numeric = Number(raw);
  if (Number.isNaN(numeric)) return displayValue(value);
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(numeric);
}

function numericValue(value) {
  const raw = String(value ?? "").replace(/[^\d.-]/g, "");
  if (!raw || raw === "-" || raw === "." || raw === "-.") return null;
  const numeric = Number(raw);
  return Number.isFinite(numeric) ? numeric : null;
}

function buildTrendBars(entries) {
  const parsed = entries
    .map(([label, value]) => ({ label, value, numeric: numericValue(value) }))
    .filter((item) => item.numeric !== null && item.numeric > 0);

  if (!parsed.length) return [];

  const max = Math.max(...parsed.map((item) => item.numeric)) || 1;
  return parsed.map((item) => ({
    ...item,
    width: Math.max(8, Math.round((item.numeric / max) * 100)),
    display: formatMoney(item.value),
  }));
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function compactFactsFromObject(record, keys) {
  return keys
    .map((key) => ({ label: humanizeKey(key), value: displayValue(record?.[key]) }))
    .filter((item) => item.value !== "No disponible");
}

function flattenPersonEntries(group) {
  if (!group || typeof group !== "object") return [];
  return Object.entries(group).flatMap(([bucket, values]) => {
    if (Array.isArray(values)) return values.map((value) => ({ grupo: humanizeKey(bucket), ...value }));
    if (values && typeof values === "object") return [{ grupo: humanizeKey(bucket), ...values }];
    return [];
  });
}

// ── Gauge ─────────────────────────────────────────────────────────────────────

const RATING_SCORE = { D: 50, C: 165, B: 285, BB: 430, BBB: 590, A: 760, AA: 950 };

function gaugePt(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

function gaugeArc(cx, cy, r, a1, a2) {
  const s = gaugePt(cx, cy, r, a1);
  const e = gaugePt(cx, cy, r, a2);
  const large = Math.abs(a1 - a2) >= 180 ? 1 : 0;
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

function gaugeColor(norm) {
  if (norm >= 0.7) return "#34d399";
  if (norm >= 0.4) return "#fbbf24";
  return "#f87171";
}

function SpeedoGauge({ value, max = 1000, displayText, label = "Score" }) {
  const CX = 100, CY = 86, R = 72, SW = 13;
  const num  = Math.min(Math.max(Number(value) || 0, 0), max);
  const norm = num / max;
  const valAngle = 180 * (1 - norm);
  const color = gaugeColor(norm);
  const z1 = 108;
  const z2 = 54;
  const needle = gaugePt(CX, CY, R - 6, valAngle);
  const iR = R - SW / 2 - 1;
  const oR = R + SW / 2 + 1;

  // arc endpoints for zone labels
  const leftY  = CY;   // y of arc left/right endpoints
  const arcTop = CY - R;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 -8 200 138" className="w-full">
        <defs>
          <linearGradient id="experian-gauge-gradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity="0.95" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.9" />
          </linearGradient>
          <filter id="g-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <style>{`
          @keyframes experianGaugeDraw { to { stroke-dashoffset: 0; } }
          @keyframes experianNeedleIn {
            from { opacity: .25; transform: rotate(-16deg) scale(.82); }
            to { opacity: .95; transform: rotate(0deg) scale(1); }
          }
          @keyframes experianValueIn {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* Background track */}
        <path d={gaugeArc(CX, CY, R, 180, 0)} fill="none" stroke="#0f172a" strokeWidth={SW} strokeLinecap="butt" />

        {/* Zone tints */}
        <path d={gaugeArc(CX, CY, R, 180, z1)} fill="none" stroke="#ef4444" strokeWidth={SW} strokeOpacity={0.22} />
        <path d={gaugeArc(CX, CY, R, z1,  z2)} fill="none" stroke="#f59e0b" strokeWidth={SW} strokeOpacity={0.22} />
        <path d={gaugeArc(CX, CY, R, z2,   0)} fill="none" stroke="#22c55e" strokeWidth={SW} strokeOpacity={0.22} />

        {/* Separator ticks */}
        {[z1, z2].map((a) => {
          const p1 = gaugePt(CX, CY, iR, a);
          const p2 = gaugePt(CX, CY, oR, a);
          return <line key={a} x1={p1.x.toFixed(1)} y1={p1.y.toFixed(1)} x2={p2.x.toFixed(1)} y2={p2.y.toFixed(1)} stroke="#020617" strokeWidth={2.5} />;
        })}

        {/* Active arc */}
        {norm > 0.005 && (
          <path
            d={gaugeArc(CX, CY, R, 180, valAngle)}
            fill="none"
            stroke="url(#experian-gauge-gradient)"
            strokeWidth={SW}
            strokeLinecap="round"
            filter="url(#g-glow)"
            strokeOpacity={0.9}
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset="100"
            style={{ animation: "experianGaugeDraw 1.05s cubic-bezier(.2,.8,.2,1) forwards" }}
          />
        )}

        {/* Needle */}
        <line x1={CX} y1={CY} x2={needle.x.toFixed(1)} y2={needle.y.toFixed(1)}
          stroke="white" strokeWidth={2.5} strokeLinecap="round" filter="url(#g-glow)" opacity={0.9}
          style={{ transformOrigin: `${CX}px ${CY}px`, animation: "experianNeedleIn .85s cubic-bezier(.2,.8,.2,1) .18s both" }} />
        <circle cx={CX} cy={CY} r={7}   fill="#020617" stroke={color} strokeWidth={2.5} />
        <circle cx={CX} cy={CY} r={2.5} fill={color} />

        {/* Zone labels — fixed, safe positions */}
        <text x="16"  y={leftY + 17} textAnchor="middle" fontSize={6.5} fill="#475569">ALTO</text>
        <text x={CX}  y={arcTop - 15} textAnchor="middle" fontSize={6.5} fill="#475569">MEDIO</text>
        <text x="184" y={leftY + 17} textAnchor="middle" fontSize={6.5} fill="#475569">BAJO</text>

        {/* Separator line before value */}
        <line x1="60" y1={CY + 16} x2="140" y2={CY + 16} stroke="#1e293b" strokeWidth={1} />

        {/* Value — clearly below pivot (pivot bottom at CY+7=93, text top at ~103) */}
        <text x={CX} y={CY + 32} textAnchor="middle" fontSize={22} fontWeight="700" fill={color}
          style={{ animation: "experianValueIn .55s ease-out .45s both" }}>
          {displayText ?? num}
        </text>
        <text x={CX} y={CY + 43} textAnchor="middle" fontSize={7} fill="#475569" letterSpacing="2">
          {label.toUpperCase()}
        </text>
      </svg>
    </div>
  );
}

// ── Metric palette ────────────────────────────────────────────────────────────

const METRIC_COLORS = {
  Viabilidad:       { top: "border-t-emerald-500/60", text: "text-emerald-200" },
  Riesgo:           { top: "border-t-amber-500/60",   text: "text-amber-200"   },
  "Monto sugerido": { top: "border-t-emerald-500/60", text: "text-emerald-200" },
  Alertas:          { top: "border-t-rose-500/60",    text: "text-rose-200"    },
};

function MetricCard({ label, value }) {
  const palette = METRIC_COLORS[label] ?? { top: "border-t-cyan-500/50", text: "text-cyan-100" };
  const Icon =
    label === "Monto sugerido" ? Wallet :
    label === "Alertas" ? AlertTriangle :
    label === "Viabilidad" ? BadgeCheck :
    Landmark;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-white/[0.08] border-t-2 ${palette.top} bg-white/[0.035] px-5 py-4 shadow-[0_18px_45px_rgba(2,6,23,0.35)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-white/[0.14] hover:bg-white/[0.055]`}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-cyan-400/[0.06] blur-2xl transition group-hover:bg-cyan-400/[0.10]" />
      <div className="relative flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.045] text-cyan-300 shadow-inner">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</div>
          <div className={`mt-2 text-2xl font-extrabold tracking-tight ${palette.text}`}>{displayValue(value)}</div>
        </div>
      </div>
    </div>
  );
}

function StatBadge({ label, value }) {
  return (
    <div className="group flex min-w-[150px] flex-col rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 shadow-[0_12px_30px_rgba(2,6,23,0.22)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-cyan-400/20 hover:bg-white/[0.055]">
      <div className="text-[9px] font-semibold uppercase tracking-[0.24em] text-slate-400 transition group-hover:text-cyan-200/80">{label}</div>
      <div className="mt-1 text-sm font-bold text-slate-50">{displayValue(value)}</div>
    </div>
  );
}

function SectionCard({ icon: Icon, title, description, children, action }) {
  return (
    <section className="relative overflow-hidden rounded-[26px] border border-white/[0.08] bg-slate-950/65 p-6 shadow-[0_24px_70px_rgba(2,6,23,0.34)] backdrop-blur-xl transition duration-300 hover:border-white/[0.13]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent" />
      <div className="pointer-events-none absolute -left-24 -top-24 h-52 w-52 rounded-full bg-cyan-500/[0.035] blur-3xl" />
      <div className="relative flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <div className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-400/[0.08] text-cyan-300 shadow-[0_0_28px_rgba(34,211,238,0.08)]">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-white">{title}</h3>
            {description ? (
              <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-400">{description}</p>
            ) : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="relative mt-6">{children}</div>
    </section>
  );
}

function FactGrid({ items, columns = "md:grid-cols-2 xl:grid-cols-3" }) {
  const filteredItems = items.filter(Boolean);
  if (!filteredItems.length)
    return <p className="text-sm italic text-slate-500">No hay información relevante para mostrar.</p>;

  return (
    <div className={`grid gap-2.5 ${columns}`}>
      {filteredItems.map((item) => (
        <div
          key={`${item.label}-${item.value}`}
          className="group rounded-2xl border border-white/[0.07] bg-white/[0.035] px-5 py-4 shadow-[0_12px_30px_rgba(2,6,23,0.18)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-white/[0.13] hover:bg-white/[0.055]"
        >
          <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-500 transition group-hover:text-slate-400">
            {item.label}
          </div>
          <div className="mt-1.5 text-sm font-medium leading-snug text-slate-100">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

function AnimatedTrendBars({ items }) {
  if (!items.length) return null;

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.035] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <style>{`
        @keyframes experianBarGrow {
          from { opacity: .35; transform: scaleX(0); }
          to { opacity: 1; transform: scaleX(1); }
        }
      `}</style>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <div className="text-[9px] font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
            Tendencia financiera
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Comparativo visual de los valores más relevantes de la respuesta.
          </p>
        </div>
        <div className="hidden rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:block">
          Barras
        </div>
      </div>
      <div className="grid gap-3">
        {items.map((item, index) => (
          <div key={`${item.label}-${item.display}`} className="grid gap-2">
            <div className="flex items-center justify-between gap-4 text-xs">
              <span className="font-semibold text-slate-300">{item.label}</span>
              <span className="font-bold text-slate-100">{item.display}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-800/80 ring-1 ring-white/[0.04]">
              <div
                className="h-full origin-left rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300 shadow-[0_0_24px_rgba(45,212,191,0.22)]"
                style={{
                  width: `${item.width}%`,
                  transform: "scaleX(0)",
                  animation: `experianBarGrow 800ms cubic-bezier(.2,.8,.2,1) ${index * 90}ms forwards`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompactList({ items, emptyLabel = "Sin registros relevantes." }) {
  if (!items.length)
    return <p className="text-sm italic text-slate-500">{emptyLabel}</p>;

  return (
    <div className="grid gap-2">
      {items.map((item, index) => (
        <div
          key={`${index}-${displayValue(item?.numeroDocumento || item?.nombre || item)}`}
          className="group rounded-2xl border border-white/[0.07] bg-white/[0.035] px-5 py-4 shadow-[0_12px_30px_rgba(2,6,23,0.18)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-white/[0.13] hover:bg-white/[0.055]"
        >
          {typeof item === "string" ? (
            <div className="text-sm leading-6 text-slate-200">{item}</div>
          ) : (
            <div className="grid gap-2.5 md:grid-cols-2">
              {Object.entries(item)
                .filter(([, value]) => value !== null && value !== undefined && value !== "")
                .map(([key, value]) => (
                  <div key={key}>
                    <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-500 transition group-hover:text-slate-400">
                      {humanizeKey(key)}
                    </div>
                    <div className="mt-1 text-sm leading-snug text-slate-100">
                      {Array.isArray(value) ? value.join(", ") : String(value)}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const GRUPO_COLORS = {
  principales:      "border-cyan-500/25 bg-cyan-500/[0.07] text-cyan-300",
  suplentes:        "border-slate-400/20 bg-slate-400/[0.06] text-slate-300",
  "empresa auditora":"border-violet-500/25 bg-violet-500/[0.07] text-violet-300",
};

function grupoColor(grupo) {
  const k = String(grupo || "").toLowerCase();
  for (const [token, cls] of Object.entries(GRUPO_COLORS)) {
    if (k.includes(token)) return cls;
  }
  return "border-slate-500/20 bg-white/[0.04] text-slate-400";
}

function PersonCard({ item }) {
  if (typeof item === "string") {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3">
        <p className="text-sm text-slate-200">{item}</p>
      </div>
    );
  }

  const {
    grupo,
    cargo,
    estado,
    nombre,
    apellidos,
    tipoDocumento,
    numeroDocumento,
    fechaNombramiento,
    ...rest
  } = item;

  const fullName = [nombre, apellidos].filter(Boolean).join(" ") || null;
  const docInfo  = [tipoDocumento, numeroDocumento].filter(Boolean).join(" ") || null;
  const extras   = Object.entries(rest).filter(([, v]) => v !== null && v !== undefined && v !== "");

  return (
    <div className="group overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.025] transition hover:border-white/[0.10] hover:bg-white/[0.04]">
      {/* badge strip */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.05] px-4 py-2.5">
        {grupo && (
          <span className={`rounded-md border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] ${grupoColor(grupo)}`}>
            {grupo}
          </span>
        )}
        {cargo && <span className="text-xs font-medium text-slate-300">{cargo}</span>}
      </div>

      {/* body */}
      <div className="px-4 py-3">
        {fullName && <p className="mb-3 text-sm font-semibold text-white">{fullName}</p>}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          {estado && (
            <div>
              <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500 transition group-hover:text-slate-400">Estado</div>
              <div className="mt-0.5 text-xs font-medium text-slate-200">{estado}</div>
            </div>
          )}
          {docInfo && (
            <div>
              <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500 transition group-hover:text-slate-400">Documento</div>
              <div className="mt-0.5 text-xs font-medium text-slate-200">{docInfo}</div>
            </div>
          )}
          {fechaNombramiento && (
            <div>
              <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500 transition group-hover:text-slate-400">Nombramiento</div>
              <div className="mt-0.5 text-xs font-medium text-slate-200">{fechaNombramiento}</div>
            </div>
          )}
          {extras.map(([k, v]) => (
            <div key={k}>
              <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500 transition group-hover:text-slate-400">
                {humanizeKey(k)}
              </div>
              <div className="mt-0.5 text-xs font-medium text-slate-200">
                {Array.isArray(v) ? v.join(", ") : String(v)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PersonList({ items, emptyLabel = "Sin registros relevantes." }) {
  if (!items.length) return <p className="text-sm italic text-slate-500">{emptyLabel}</p>;
  return (
    <div className="grid gap-2">
      {items.map((item, index) => (
        <PersonCard key={`${index}-${item?.numeroDocumento || item?.nombre || index}`} item={item} />
      ))}
    </div>
  );
}

function JsonBlock({ title, value }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#02040a]">
      <div className="flex items-center gap-3 border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-rose-500/50" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-500/50" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/50" />
        </div>
        <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-500">{title}</div>
      </div>
      <pre className="max-h-[26rem] overflow-auto p-4 text-[11px] leading-6 text-cyan-100/80">
        {JSON.stringify(value || {}, null, 2)}
      </pre>
    </div>
  );
}

function EvidenceDrawer({ open, onClose, detalle }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[12000] flex justify-end bg-slate-950/80 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Cerrar evidencia tecnica"
        className="flex-1 cursor-default"
        onClick={onClose}
      />
      <aside className="relative h-full w-full max-w-3xl border-l border-white/[0.08] bg-[#04060f]/98 px-6 py-6 shadow-[-32px_0_80px_rgba(2,6,23,0.6)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

        <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] pb-5">
          <div>
            <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.25em] text-slate-500">
              <div className="h-px w-4 bg-cyan-500/50" />
              Soporte y auditoría
            </div>
            <h3 className="mt-2 text-xl font-bold text-white">Evidencia tecnica</h3>
            <p className="mt-1.5 text-sm leading-6 text-slate-400">
              Respuesta cruda almacenada para trazabilidad, soporte y revisión operativa.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="group flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-slate-400 transition hover:border-rose-500/30 hover:bg-rose-500/[0.06] hover:text-rose-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid gap-4 overflow-y-auto pb-6">
          <JsonBlock title="Resumen JSON" value={detalle?.resumen_json} />
          <JsonBlock title="Respuesta completa" value={detalle?.respuesta_json} />
        </div>
      </aside>
    </div>
  );
}

// Claves del objeto sugerencias que NO son la lista de recomendaciones.
const SUGERENCIA_VECTOR_KEYS = ["vectorSugerencias", "vector", "sugerencias", "recomendaciones", "listaSugerencias"];

function pickSugerenciaTexto(item) {
  if (item === null || item === undefined) return "";
  if (typeof item === "string") return item;
  if (typeof item !== "object") return String(item);
  // Campos típicos de cada recomendación.
  const titulo = item.titulo || item.nombre || item.codigo || item.tipo || "";
  const detalle = item.descripcion || item.mensaje || item.detalle || item.texto || item.valor || "";
  const compuesto = [titulo, detalle].filter(Boolean).join(": ");
  return compuesto || objectToText(item);
}

function SugerenciasBlock({ sugerencias }) {
  if (!sugerencias || typeof sugerencias !== "object") {
    return (
      <CompactList items={safeArray(sugerencias)} emptyLabel="No se recibieron sugerencias." />
    );
  }

  // La lista de recomendaciones puede venir en distintas claves.
  let vector = [];
  for (const key of SUGERENCIA_VECTOR_KEYS) {
    if (Array.isArray(sugerencias[key]) && sugerencias[key].length) {
      vector = sugerencias[key];
      break;
    }
  }

  // Datos sueltos (conInformacion, etc.) que acompañan a la lista.
  const meta = Object.entries(sugerencias)
    .filter(([key, value]) => !SUGERENCIA_VECTOR_KEYS.includes(key))
    .map(([key, value]) => ({ label: humanizeKey(key), value: displayValue(value) }))
    .filter((item) => item.value !== "No disponible");

  const recomendaciones = vector.map(pickSugerenciaTexto).filter(Boolean);

  return (
    <div className="grid gap-4">
      {meta.length > 0 && <FactGrid items={meta} columns="md:grid-cols-2 xl:grid-cols-3" />}

      {recomendaciones.length > 0 ? (
        <div className="grid gap-2.5">
          <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Recomendaciones
          </div>
          {recomendaciones.map((texto, index) => (
            <div
              key={`${index}-${texto.slice(0, 24)}`}
              className="flex gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.035] px-5 py-4 shadow-[0_12px_30px_rgba(2,6,23,0.18)] backdrop-blur-xl transition hover:border-white/[0.13] hover:bg-white/[0.055]"
            >
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cyan-400/25 bg-cyan-400/[0.08] text-[11px] font-bold text-cyan-300">
                {index + 1}
              </div>
              <p className="text-sm leading-6 text-slate-100">{texto}</p>
            </div>
          ))}
        </div>
      ) : (
        meta.length === 0 && (
          <p className="text-sm italic text-slate-500">No se recibieron sugerencias estructuradas.</p>
        )
      )}
    </div>
  );
}

function buildExecutiveMetrics(detalle, isPj) {
  if (isPj) {
    return [
      { label: "Riesgo",           value: detalle?.nivel_riesgo || detalle?.resumen_json?.nivel },
      { label: "Monto sugerido",   value: formatMoney(detalle?.monto_sugerido || detalle?.resumen_json?.monto_sugerido) },
      { label: "Alertas",          value: detalle?.cantidad_alertas ?? "0" },
    ];
  }
  return [
    { label: "Viabilidad",       value: detalle?.viabilidad || detalle?.resumen_json?.viabilidad },
    { label: "Monto sugerido",   value: formatMoney(detalle?.monto_sugerido || detalle?.resumen_json?.monto_sugerido) },
    { label: "Alertas",          value: detalle?.cantidad_alertas ?? "0" },
  ];
}

function buildGaugeProps(detalle, isPj) {
  if (isPj) {
    const ratingStr = String(detalle?.rating || detalle?.resumen_json?.rating || "").toUpperCase();
    return { value: RATING_SCORE[ratingStr] ?? 0, max: 1000, displayText: ratingStr || "—", label: "Rating" };
  }
  const score = Number(detalle?.score_valor || detalle?.resumen_json?.score) || 0;
  return { value: score, max: 1000, label: "Score" };
}

export default function ExperianDetalleResultados({ consultaId }) {
  const API_URL = process.env.REACT_APP_API_URL;
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEvidence, setShowEvidence] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadDetalle() {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/api/experian/consultas/${consultaId}/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.detail || data?.error || `Error HTTP: ${response.status}`);
        }

        if (!cancelled) setDetalle(data);
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || "No fue posible cargar el detalle de Econfia Adjudicator.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDetalle();
    return () => { cancelled = true; };
  }, [API_URL, consultaId]);

  const context = useMemo(() => {
    const respuesta = detalle?.respuesta_json?.content?.respuesta || {};
    const validacion = respuesta?.validacion || {};
    return {
      respuesta,
      validacion,
      datosBasicos:       validacion?.datosBasicos || {},
      perfilGeneral:      validacion?.perfilGeneral || {},
      matricula:          validacion?.matricula || {},
      datosContacto:      validacion?.datosContacto || {},
      informacionRiesgo:  respuesta?.informacionRiesgo || {},
      comportamiento:     respuesta?.comportamientoCrediticio?.indicadoresValores || {},
      endeudamiento:      respuesta?.endeudamiento || {},
      sugerencias:        respuesta?.sugerencias || {},
      estadosFinancieros: respuesta?.estadosFinancieros || {},
      socios:             safeArray(validacion?.socios?.sociosAccionistas || respuesta?.socios),
      representantes:     flattenPersonEntries(validacion?.representanteLegal || respuesta?.representantes),
      juntaDirectiva:     flattenPersonEntries(validacion?.juntaDirectiva),
      revisoriaFiscal:    flattenPersonEntries(validacion?.revisoriaFiscal),
      mallaVinculos:      respuesta?.mallaVinculos || {},
      alertas:            safeArray(respuesta?.informacionRiesgo?.alertas),
    };
  }, [detalle]);

  const isPj = detalle?.tipo_resultado === "pj";
  const displayName =
    context.datosBasicos?.nombreCompleto ||
    context.datosBasicos?.razonSocial ||
    detalle?.apellido_razon_social ||
    detalle?.numero_identificacion;
  const metrics    = useMemo(() => buildExecutiveMetrics(detalle, isPj), [detalle, isPj]);
  const gaugeProps = useMemo(() => buildGaugeProps(detalle, isPj),       [detalle, isPj]);

  const summaryFacts = useMemo(() => {
    if (isPj) {
      return [
        { label: "Actividad economica",  value: displayValue(context.perfilGeneral?.actividadEconomica) },
        { label: "Organizacion juridica", value: displayValue(context.perfilGeneral?.organizacionJuridica) },
        { label: "Empleados",            value: displayValue(context.perfilGeneral?.rangosEmpleados || context.perfilGeneral?.numeroEmpleados) },
        { label: "Capital pagado",        value: formatMoney(context.perfilGeneral?.capitalPagado) },
      ].filter((item) => item.value !== "No disponible");
    }
    return compactFactsFromObject(detalle?.resumen_json || {}, ["score", "viabilidad", "monto_sugerido", "segmento"]);
  }, [context.perfilGeneral, detalle?.resumen_json, isPj]);

  const validationFacts = useMemo(() => {
    const base = [
      { label: "Documento",          value: `${detalle?.tipo_identificacion || ""} ${detalle?.numero_identificacion || ""}`.trim() },
      { label: isPj ? "Razon social" : "Titular", value: displayValue(context.datosBasicos?.nombreCompleto || context.datosBasicos?.razonSocial || detalle?.apellido_razon_social) },
      { label: "Estado interno",     value: displayValue(detalle?.estado) },
      { label: "Respuesta del producto", value: displayValue(detalle?.status_experian) },
      { label: "Estado contenido",   value: displayValue(detalle?.content_status) },
      { label: "Mensaje",            value: displayValue(detalle?.mensaje) },
    ];

    if (isPj) {
      return [
        ...base,
        ...compactFactsFromObject(context.matricula, ["camaraComercio", "numero", "estado", "ultimaRenovacion"]),
        ...compactFactsFromObject(context.datosContacto, ["ciudad", "telefono", "email"]),
      ];
    }

    return [...base, ...compactFactsFromObject(context.datosBasicos, Object.keys(context.datosBasicos || {}).slice(0, 4))];
  }, [
    context.datosBasicos,
    context.datosContacto,
    context.matricula,
    detalle?.apellido_razon_social,
    detalle?.content_status,
    detalle?.estado,
    detalle?.mensaje,
    detalle?.numero_identificacion,
    detalle?.status_experian,
    detalle?.tipo_identificacion,
    isPj,
  ]);

  const riskFacts = useMemo(() => [
    ...compactFactsFromObject(context.informacionRiesgo, ["rating", "nivel", "puntajeScore", "ratingRiesgoSectorial"]),
    ...compactFactsFromObject(context.comportamiento, ["creditosVigentes", "creditosCerrados", "saldoActual", "valorCuota", "porcentajeDeuda"]).map(
      (item) =>
        item.label.toLowerCase().includes("saldo") || item.label.toLowerCase().includes("cuota")
          ? { ...item, value: formatMoney(item.value) }
          : item
    ),
  ], [context.comportamiento, context.informacionRiesgo]);

  const financeFacts = useMemo(() => {
    if (isPj) {
      return compactFactsFromObject(context.estadosFinancieros, [
        "ventasNetas", "utilidadOperacional", "utilidadNeta", "activosTotales", "pasivosTotales", "patrimonio",
      ]).map((item) => ({ ...item, value: formatMoney(item.value) }));
    }
    return compactFactsFromObject(context.endeudamiento, Object.keys(context.endeudamiento || {})).map((item) => ({
      ...item,
      value: item.label.toLowerCase().includes("porcentaje") ? item.value : formatMoney(item.value),
    }));
  }, [context.endeudamiento, context.estadosFinancieros, isPj]);

  const trendBars = useMemo(() => {
    if (isPj) {
      return buildTrendBars([
        ["Ventas netas", context.estadosFinancieros?.ventasNetas],
        ["Utilidad operacional", context.estadosFinancieros?.utilidadOperacional],
        ["Utilidad neta", context.estadosFinancieros?.utilidadNeta],
        ["Activos totales", context.estadosFinancieros?.activosTotales],
        ["Pasivos totales", context.estadosFinancieros?.pasivosTotales],
        ["Patrimonio", context.estadosFinancieros?.patrimonio],
      ]);
    }

    return buildTrendBars([
      ["Saldo actual", context.comportamiento?.saldoActual || context.endeudamiento?.saldoActual],
      ["Valor cuota", context.comportamiento?.valorCuota || context.endeudamiento?.valorCuota],
      ["Monto sugerido", detalle?.monto_sugerido || detalle?.resumen_json?.monto_sugerido],
      ["Saldo en mora", context.comportamiento?.saldoMora || context.endeudamiento?.saldoMora],
    ]);
  }, [context.comportamiento, context.endeudamiento, context.estadosFinancieros, detalle?.monto_sugerido, detalle?.resumen_json, isPj]);

  if (loading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto mb-6 h-16 w-16">
            <div className="absolute inset-0 animate-ping rounded-full border border-cyan-500/25" />
            <div className="absolute inset-2 animate-spin rounded-full border-2 border-t-cyan-400 border-slate-800" />
          </div>
          <p className="text-sm font-semibold text-slate-300">Cargando Econfia Adjudicator</p>
          <p className="mt-1 text-xs text-slate-600">Un momento por favor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-rose-500/20 bg-rose-500/[0.05] p-8 text-center shadow-[0_0_40px_rgba(244,63,94,0.07)]">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/25 bg-rose-500/[0.08]">
            <AlertTriangle className="h-6 w-6 text-rose-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Error al cargar Econfia Adjudicator</h3>
          <p className="mt-2 text-sm leading-6 text-rose-200/70">{error}</p>
        </div>
      </div>
    );
  }

  if (!detalle) return null;

  return (
    <>
      <div className="h-full overflow-y-auto pr-1">
        <div className="grid gap-4 pb-8">

          {/* ── Hero header ─────────────────────────────────────────────── */}
          <section className="relative overflow-hidden rounded-[30px] border border-white/[0.08] bg-slate-950/70 px-6 py-7 shadow-[0_30px_90px_rgba(2,6,23,0.48)] backdrop-blur-xl md:px-8 md:py-8">
            <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-cyan-500/[0.055] blur-3xl" />
            <div className="pointer-events-none absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-violet-500/[0.035] blur-3xl" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

            <div className="relative grid gap-6 xl:grid-cols-[1.35fr_330px_300px] xl:items-stretch">
              {/* ── Left: identity ───────────────────────────────────────── */}
              <div className="flex min-w-0 flex-col justify-center">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/[0.08] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.08)]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Econfia Adjudicator
                </div>

                <h2 className="mt-5 max-w-4xl text-3xl font-black tracking-tight text-white md:text-4xl md:leading-tight">
                  {displayName}
                </h2>

                <p className="mt-4 max-w-2xl text-base leading-8 text-slate-400">
                  Lectura consolidada para decisión comercial — validación, riesgo y capacidad financiera en una sola vista.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <StatBadge
                    label="Documento"
                    value={`${detalle.tipo_identificacion || ""} ${detalle.numero_identificacion || ""}`.trim()}
                  />
                  <StatBadge label="Resultado" value={isPj ? "Persona jurídica" : "Persona natural"} />
                  <StatBadge label="Estado" value={detalle.estado} />
                </div>
              </div>

              {/* ── Center: gauge ───────────────────────────────────────── */}
              <div className="flex min-h-[260px] items-center justify-center rounded-[26px] border border-white/[0.08] bg-white/[0.025] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_18px_50px_rgba(2,6,23,0.26)] backdrop-blur-xl">
                <SpeedoGauge {...gaugeProps} />
              </div>

              {/* ── Right: metric cards ─────────────────────────────────── */}
              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={() => setShowEvidence(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/25 hover:text-white"
                >
                  <FileSearch className="h-4 w-4 text-cyan-300" />
                  Ver evidencia tecnica
                </button>
                {metrics.map((metric) => (
                  <MetricCard key={metric.label} label={metric.label} value={metric.value} />
                ))}
                <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.04] px-5 py-4 text-sm leading-6 text-slate-300">
                  <span className="font-semibold text-cyan-200">Nivel de lectura:</span>{" "}
                  úselo como apoyo para la decisión; no reemplaza el análisis crediticio completo.
                </div>
              </div>
            </div>
          </section>

          <SectionCard
            icon={Briefcase}
            title="Resumen ejecutivo"
            description="Variables de negocio destacadas para una lectura inicial rápida."
          >
            <FactGrid items={summaryFacts} />
          </SectionCard>

          <SectionCard
            icon={isPj ? Building2 : UserRound}
            title="Identificación y validación"
            description="Datos base de la consulta, estado de respuesta y referencias principales."
          >
            <FactGrid items={validationFacts} />
          </SectionCard>

          <SectionCard
            icon={Landmark}
            title="Riesgo"
            description="Señales de perfil crediticio y comportamiento reportado por la consulta."
            action={
              <div
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold ${
                  context.alertas.length
                    ? "border-amber-500/30 bg-amber-500/[0.07] text-amber-300"
                    : "border-white/[0.08] bg-white/[0.03] text-slate-400"
                }`}
              >
                {context.alertas.length
                  ? `${context.alertas.length} alerta${context.alertas.length !== 1 ? "s" : ""} registrada${context.alertas.length !== 1 ? "s" : ""}`
                  : "Sin alertas estructuradas"}
              </div>
            }
          >
            <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
              <FactGrid items={riskFacts} columns="md:grid-cols-2" />
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
                <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-500">Alertas</div>
                <div className="mt-3">
                  <CompactList
                    items={context.alertas.map((alerta) =>
                      typeof alerta === "string"
                        ? alerta
                        : Object.values(alerta || {}).filter(Boolean).join(" | ")
                    )}
                    emptyLabel="No se reportaron alertas estructuradas en esta respuesta."
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon={Wallet}
            title="Finanzas"
            description={
              isPj
                ? "Resumen financiero consolidado para lectura comercial."
                : "Indicadores financieros y de endeudamiento usados por el análisis."
            }
          >
            <FactGrid items={financeFacts} />
            <AnimatedTrendBars items={trendBars} />
          </SectionCard>

          {!isPj ? (
            <SectionCard
              icon={BadgeCheck}
              title="Sugerencias"
              description="Recomendaciones devueltas para apoyo en la decisión."
            >
              <SugerenciasBlock sugerencias={context.sugerencias} />
            </SectionCard>
          ) : (
            <SectionCard
              icon={UserRound}
              title="Relacionados"
              description="Partes vinculadas y órganos relevantes de la persona jurídica."
            >
              <div className="grid gap-6 xl:grid-cols-2">
                <div className="space-y-6">
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-px flex-1 bg-white/[0.05]" />
                      <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-500">Socios</div>
                      <div className="h-px flex-1 bg-white/[0.05]" />
                    </div>
                    <PersonList items={context.socios} emptyLabel="Sin socios estructurados." />
                  </div>
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-px flex-1 bg-white/[0.05]" />
                      <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-500">Representación legal</div>
                      <div className="h-px flex-1 bg-white/[0.05]" />
                    </div>
                    <PersonList items={context.representantes} emptyLabel="Sin representantes estructurados." />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-px flex-1 bg-white/[0.05]" />
                      <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-500">Junta directiva</div>
                      <div className="h-px flex-1 bg-white/[0.05]" />
                    </div>
                    <PersonList items={context.juntaDirectiva} emptyLabel="Sin junta estructurada." />
                  </div>
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-px flex-1 bg-white/[0.05]" />
                      <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-500">Revisoría fiscal y vínculos</div>
                      <div className="h-px flex-1 bg-white/[0.05]" />
                    </div>
                    <PersonList
                      items={[
                        ...context.revisoriaFiscal,
                        ...safeArray(context.mallaVinculos?.linkedRestrictiveSummary),
                      ]}
                      emptyLabel="Sin novedades estructuradas."
                    />
                  </div>
                </div>
              </div>
            </SectionCard>
          )}
        </div>
      </div>

      <EvidenceDrawer
        open={showEvidence}
        onClose={() => setShowEvidence(false)}
        detalle={detalle}
      />
    </>
  );
}
