// AnalisisInteligente.jsx
// Panel ejecutivo de análisis de una consulta. Calcula el nivel de riesgo,
// cobertura y hallazgos relevantes a partir de los resultados (reglas).
// El bloque "Resumen ejecutivo" está preparado para, en una segunda fase,
// reemplazar la narrativa por reglas con una generada por IA (ver onGenerarIA).
import { useMemo } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Search,
  Layers,
  Signal,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { describirFuente } from "../utils/fuentesCatalogo";

const getNum = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

// Clasificación por resultado, consistente con getModalVisualState de DetalleResultados:
// score >= 4 => alto, score == 3 => medio, 0 < score < 3 => limpio.
const clasificar = (item) => {
  const estado = (item?.estado || "").toLowerCase().trim();
  if (estado === "offline") return "offline";
  if (estado === "error") return "error";
  if (estado === "revalidando" || estado === "en_proceso") return "pendiente";

  const score = getNum(item?.score);
  if (score !== null) {
    if (score >= 4) return "alto";
    if (score >= 3) return "medio";
    if (score > 0) return "limpio";
  }
  if (["validado", "validada", "completado"].includes(estado)) return "limpio";
  return "pendiente";
};

const titleCase = (value) => {
  const txt = String(value || "").trim();
  if (!txt) return "";
  return txt
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

export default function AnalisisInteligente({
  detalle = [],
  consulta = null,
  onVerHallazgo,
  onIrAResultados,
  onGenerarIA, // reservado para la fase IA; si no se pasa, se oculta el botón
}) {
  const stats = useMemo(() => {
    const buckets = {
      alto: [],
      medio: [],
      limpio: [],
      offline: [],
      error: [],
      pendiente: [],
    };

    const porTipo = new Map();

    for (const item of detalle) {
      const clase = clasificar(item);
      buckets[clase].push(item);

      const tipo = (item?.tipo_fuente || "Sin clasificar").trim() || "Sin clasificar";
      if (!porTipo.has(tipo)) porTipo.set(tipo, { total: 0, hallazgos: 0 });
      const ref = porTipo.get(tipo);
      ref.total += 1;
      if (clase === "alto" || clase === "medio") ref.hallazgos += 1;
    }

    const total = detalle.length;
    const hallazgos = [...buckets.alto, ...buckets.medio];
    const noConcluyentes = buckets.offline.length + buckets.error.length;
    const validadas = total - noConcluyentes - buckets.pendiente.length;
    const cobertura = total > 0 ? Math.round((validadas / total) * 100) : 0;

    let nivel;
    if (buckets.alto.length > 0) nivel = "alto";
    else if (buckets.medio.length > 0) nivel = "medio";
    else if (total > 0 && hallazgos.length === 0) nivel = "limpio";
    else nivel = "indeterminado";

    const tipos = [...porTipo.entries()]
      .map(([nombre, v]) => ({ nombre, ...v }))
      .sort((a, b) => b.total - a.total);

    return {
      total,
      buckets,
      hallazgos,
      noConcluyentes,
      validadas,
      cobertura,
      nivel,
      tipos,
    };
  }, [detalle]);

  const nombre = titleCase(consulta?.nombre) || "Persona consultada";
  const documento = consulta?.cedula || consulta?.nit || consulta?.documento || "";
  const tipoConsulta = consulta?.tipo_consulta || consulta?.tipo || "";

  const nivelUI = {
    alto: {
      label: "Riesgo Alto",
      Icon: ShieldAlert,
      ring: "#fb7185",
      text: "text-rose-300",
      chip: "text-rose-200 border-rose-400/30 bg-rose-500/10",
      banner: "border-rose-400/30 from-rose-500/15 to-red-500/10",
      glow: "shadow-[0_0_30px_rgba(251,113,133,0.25)]",
    },
    medio: {
      label: "Riesgo Medio",
      Icon: AlertTriangle,
      ring: "#f59e0b",
      text: "text-amber-300",
      chip: "text-amber-200 border-amber-400/30 bg-amber-500/10",
      banner: "border-amber-400/30 from-amber-500/15 to-orange-500/10",
      glow: "shadow-[0_0_30px_rgba(245,158,11,0.22)]",
    },
    limpio: {
      label: "Sin hallazgos relevantes",
      Icon: ShieldCheck,
      ring: "#10b981",
      text: "text-emerald-300",
      chip: "text-emerald-200 border-emerald-400/30 bg-emerald-500/10",
      banner: "border-emerald-400/30 from-emerald-500/15 to-cyan-500/10",
      glow: "shadow-[0_0_30px_rgba(16,185,129,0.22)]",
    },
    indeterminado: {
      label: "Cobertura incompleta",
      Icon: Signal,
      ring: "#38bdf8",
      text: "text-cyan-300",
      chip: "text-cyan-200 border-cyan-400/30 bg-cyan-500/10",
      banner: "border-cyan-400/30 from-cyan-500/15 to-blue-500/10",
      glow: "shadow-[0_0_30px_rgba(56,189,248,0.22)]",
    },
  }[stats.nivel];

  // Narrativa por reglas. En la fase IA, este texto se reemplaza por la respuesta del backend.
  const narrativa = useMemo(() => {
    if (stats.total === 0) return "Aún no hay resultados para analizar.";
    const partes = [];
    partes.push(
      `Se consultaron ${stats.total} fuente${stats.total === 1 ? "" : "s"} para ${nombre}${
        documento ? ` (${documento})` : ""
      }.`
    );
    if (stats.hallazgos.length > 0) {
      partes.push(
        `Se identificaron ${stats.hallazgos.length} coincidencia${
          stats.hallazgos.length === 1 ? "" : "s"
        } que requieren revisión` +
          (stats.buckets.alto.length
            ? ` (${stats.buckets.alto.length} de riesgo alto${
                stats.buckets.medio.length ? `, ${stats.buckets.medio.length} de riesgo medio` : ""
              }).`
            : `.`)
      );
    } else {
      partes.push("No se identificaron hallazgos relevantes en las fuentes validadas.");
    }
    if (stats.noConcluyentes > 0) {
      partes.push(
        `${stats.noConcluyentes} fuente${
          stats.noConcluyentes === 1 ? "" : "s"
        } no pudieron validarse y quedan pendientes de reintento.`
      );
    } else {
      partes.push("La cobertura de fuentes fue completa.");
    }
    return partes.join(" ");
  }, [stats, nombre, documento]);

  const NivelIcon = nivelUI.Icon;
  const maxTipo = Math.max(1, ...stats.tipos.map((t) => t.total));

  const kpis = [
    { label: "Fuentes consultadas", value: stats.total, tone: "text-white" },
    { label: "Con hallazgo", value: stats.hallazgos.length, tone: "text-rose-300" },
    { label: "Sin hallazgo", value: stats.buckets.limpio.length, tone: "text-emerald-300" },
    { label: "No concluyentes", value: stats.noConcluyentes, tone: "text-amber-300" },
  ];

  return (
    <div className="pr-1 pb-10 space-y-4 sm:space-y-5">
      {/* Encabezado / veredicto */}
      <section
        className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${nivelUI.banner} ${nivelUI.glow} p-5 sm:p-6`}
      >
        <div className="absolute right-0 top-0 h-full w-48 bg-white/[0.03] skew-x-12 translate-x-16 pointer-events-none" />
        <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-5 items-center">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-200">
              <Sparkles size={12} />
              Análisis de la consulta
            </div>
            <h3 className="mt-3 text-2xl sm:text-3xl font-black text-white leading-tight truncate">
              {nombre}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-300">
              {documento && (
                <span className="rounded-md bg-black/25 border border-white/10 px-2 py-1 font-mono">
                  Doc. {documento}
                </span>
              )}
              {tipoConsulta && (
                <span className="rounded-md bg-black/25 border border-white/10 px-2 py-1 uppercase tracking-wide">
                  {tipoConsulta}
                </span>
              )}
            </div>
            <div className={`mt-4 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold ${nivelUI.chip}`}>
              <NivelIcon size={18} />
              {nivelUI.label}
            </div>
          </div>

          {/* Anillo de riesgo */}
          <div className="justify-self-center lg:justify-self-end">
            <div className="relative w-32 h-32 sm:w-36 sm:h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={nivelUI.ring}
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 45}
                  strokeDashoffset={(2 * Math.PI * 45) * (1 - stats.cobertura / 100)}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl sm:text-3xl font-black text-white">{stats.cobertura}%</span>
                <span className="text-[9px] uppercase tracking-widest text-slate-400">Cobertura</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resumen ejecutivo (slot para IA) */}
      <section className="rounded-2xl border border-cyan-300/15 bg-white/[0.02] p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 mb-2">
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-cyan-300 flex items-center gap-2">
            <Search size={14} /> Resumen ejecutivo
          </h4>
          {typeof onGenerarIA === "function" ? (
            <button
              onClick={onGenerarIA}
              className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-2.5 py-1 text-[11px] font-bold text-cyan-100 hover:bg-cyan-300/15 transition-colors"
            >
              <Sparkles size={12} /> Analizar con IA
            </button>
          ) : (
            <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">
              Automático
            </span>
          )}
        </div>
        <p className="text-sm text-slate-200 leading-relaxed">{narrativa}</p>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-white/10 bg-black/25 p-4">
            <p className="text-[9px] uppercase tracking-widest text-slate-400">{kpi.label}</p>
            <p className={`mt-1 text-2xl sm:text-3xl font-black ${kpi.tone}`}>{kpi.value}</p>
          </div>
        ))}
      </section>

      {/* Distribución por tipo de fuente */}
      {stats.tipos.length > 0 && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-300 flex items-center gap-2 mb-3">
            <Layers size={14} /> Distribución por tipo de fuente
          </h4>
          <div className="space-y-2.5">
            {stats.tipos.map((t) => (
              <div key={t.nombre}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-200 font-semibold truncate pr-2">{t.nombre}</span>
                  <span className="text-slate-400 shrink-0">
                    {t.hallazgos > 0 && (
                      <span className="text-rose-300 font-bold mr-1">{t.hallazgos} alerta{t.hallazgos === 1 ? "" : "s"} ·</span>
                    )}
                    {t.total}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      t.hallazgos > 0
                        ? "bg-gradient-to-r from-rose-500/70 to-amber-400/70"
                        : "bg-gradient-to-r from-cyan-500/60 to-blue-500/60"
                    }`}
                    style={{ width: `${(t.total / maxTipo) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Hallazgos relevantes */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-300 flex items-center gap-2">
            <ShieldAlert size={14} /> Hallazgos relevantes
          </h4>
          {typeof onIrAResultados === "function" && (
            <button
              onClick={onIrAResultados}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-300 hover:text-cyan-200 transition-colors"
            >
              Ver todos <ChevronRight size={13} />
            </button>
          )}
        </div>

        {stats.hallazgos.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-4">
            <ShieldCheck size={20} className="text-emerald-300 shrink-0" />
            <p className="text-sm text-emerald-100/90">
              No se detectaron hallazgos con alerta en las fuentes validadas de esta consulta.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {stats.hallazgos.map((item) => {
              const clase = clasificar(item);
              const tone =
                clase === "alto"
                  ? "border-rose-400/25 bg-rose-500/10"
                  : "border-amber-400/25 bg-amber-500/10";
              const label = clase === "alto" ? "Riesgo alto" : "Riesgo medio";
              const labelTone = clase === "alto" ? "text-rose-200" : "text-amber-200";
              const info = describirFuente(item);
              return (
                <button
                  key={item.id}
                  onClick={(e) => onVerHallazgo?.(item, e)}
                  className={`w-full text-left rounded-xl border ${tone} p-3 sm:p-4 hover:brightness-110 transition-all group`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white leading-snug break-words">
                        {info.titulo}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400 break-words">
                        {item.fuente}
                        {item.tipo_fuente ? ` · ${item.tipo_fuente}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`rounded-lg border border-white/10 bg-black/20 px-2 py-1 text-[10px] font-bold ${labelTone}`}>
                        {label}
                      </span>
                      <span className="rounded-lg bg-black/30 border border-white/10 px-2 py-1 text-xs font-black text-white">
                        {item.score ?? "—"}
                      </span>
                      <ChevronRight size={16} className="text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-slate-300 leading-relaxed">{info.desc}</p>

                  <div className="mt-2 flex items-start gap-2 rounded-lg border border-white/10 bg-black/25 px-2.5 py-2">
                    <AlertTriangle size={13} className={`mt-0.5 shrink-0 ${labelTone}`} />
                    <p className="text-[11px] text-slate-200 leading-relaxed">
                      <span className="font-bold">Qué implica: </span>
                      {info.hallazgo}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Cobertura de fuentes */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
        <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-300 flex items-center gap-2 mb-3">
          <Signal size={14} /> Cobertura de fuentes
        </h4>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 font-semibold text-emerald-200">
            Validadas: {stats.validadas}
          </span>
          <span className="rounded-lg border border-amber-400/20 bg-amber-500/10 px-3 py-1.5 font-semibold text-amber-200">
            Offline: {stats.buckets.offline.length}
          </span>
          <span className="rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-1.5 font-semibold text-rose-200">
            Error: {stats.buckets.error.length}
          </span>
          {stats.buckets.pendiente.length > 0 && (
            <span className="rounded-lg border border-slate-400/20 bg-white/5 px-3 py-1.5 font-semibold text-slate-300">
              Pendientes: {stats.buckets.pendiente.length}
            </span>
          )}
        </div>
      </section>
    </div>
  );
}
