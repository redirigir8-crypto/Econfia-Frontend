import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import logo from "../assets/logo-econfia.png";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

/* ─── Helpers ─── */
const RIESGO_META = {
  Bajo:    { color: "text-green-400",  bg: "bg-green-500/20",  border: "border-green-500/40",  glow: "shadow-green-500/30",  bar: "bg-green-500",  pct: 25,  icon: "✓" },
  Medio:   { color: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500/40", glow: "shadow-yellow-500/30", bar: "bg-yellow-400", pct: 50,  icon: "!" },
  Alto:    { color: "text-orange-400", bg: "bg-orange-500/20", border: "border-orange-500/40", glow: "shadow-orange-500/30", bar: "bg-orange-500", pct: 75,  icon: "!!" },
  Extremo: { color: "text-red-400",    bg: "bg-red-500/20",    border: "border-red-500/40",    glow: "shadow-red-500/30",    bar: "bg-red-500",   pct: 100, icon: "✕" },
};

const SCORE_META = [
  { label: "No registra incidentes", color: "bg-green-500",  text: "text-green-400"  },
  { label: "Coincidencia por revisar", color: "bg-yellow-400", text: "text-yellow-400" },
  { label: "Moderado",   color: "bg-orange-500", text: "text-orange-400" },
  { label: "Crítico",    color: "bg-red-500",    text: "text-red-400"    },
];

function ScoreDots({ score }) {
  const s = Math.max(1, Math.min(4, score || 1));
  const meta = SCORE_META[s - 1];
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={`inline-block w-2.5 h-2.5 rounded-full ${
            i <= s ? meta.color : "bg-gray-700"
          }`}
        />
      ))}
    </div>
  );
}

function EstadoBadge({ estado }) {
  const map = {
    validado: "bg-green-500/20 text-green-400 border-green-500/40",
    offline:  "bg-gray-500/20 text-gray-400 border-gray-500/40",
    pendiente:"bg-blue-500/20 text-blue-400 border-blue-500/40",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${map[estado] || "bg-gray-500/20 text-gray-400 border-gray-500/40"}`}>
      {estado || "—"}
    </span>
  );
}

/* ─── Skeleton mientras carga ─── */
function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-16 rounded-xl bg-white/5" />
      ))}
    </div>
  );
}

/* ─── Componente principal ─── */
export default function VerificarReporte() {
  const { consultaId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/verificar-reporte/${consultaId}/`)
      .then((r) => {
        if (!r.ok) throw new Error(`Error ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [consultaId]);

  const riesgoMeta = RIESGO_META[data?.riesgo?.categoria] || RIESGO_META["Bajo"];

  return (
    <div className="min-h-screen bg-[#080e1a] text-white overflow-x-hidden">
      {/* Fondo decorativo */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">

        {/* ── Header ── */}
        <header className="flex items-center justify-between">
          <Link to="/">
            <img src={logo} alt="Econfia" className="h-10 object-contain" />
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300 tracking-wide">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            VERIFICACIÓN OFICIAL
          </div>
        </header>

        {loading && (
          <div className="mt-8">
            <Skeleton />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-4 mt-16 text-center">
            <div className="text-5xl">⚠️</div>
            <h2 className="text-xl font-bold text-red-400">Reporte no encontrado</h2>
            <p className="text-gray-400 text-sm">
              El ID <span className="text-white font-mono">#{consultaId}</span> no corresponde a ningún reporte generado por Econfia.
            </p>
            <Link to="/" className="mt-4 px-6 py-2.5 rounded-full bg-cyan-500 text-white text-sm font-semibold hover:bg-cyan-400 transition">
              Ir a Econfia.co
            </Link>
          </div>
        )}

        {data && (
          <>
            {/* ── Sello de autenticidad ── */}
            <div className="relative overflow-hidden rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-500/10 to-cyan-500/5 p-6 shadow-lg shadow-green-500/10">
              <div className="absolute -top-8 -right-8 w-40 h-40 bg-green-500/10 rounded-full blur-2xl" />
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500/50 flex items-center justify-center text-3xl shadow-lg shadow-green-500/20">
                  🛡️
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-green-400 tracking-wide">
                    Reporte Auténtico y Verificado
                  </h1>
                  <p className="text-gray-300 text-sm mt-1 leading-relaxed">
                    Este informe fue generado de forma oficial por{" "}
                    <span className="text-cyan-300 font-semibold">Econfia</span>, plataforma
                    colombiana certificada de verificación de antecedentes. La información
                    proviene de fuentes oficiales consultadas en tiempo real.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                      ID Consulta: <span className="text-white font-mono font-bold">#{data.consulta_id}</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                      Fecha:{" "}
                      <span className="text-white font-semibold">
                        {data.fecha_consulta
                          ? new Date(data.fecha_consulta).toLocaleDateString("es-CO", {
                              day: "2-digit", month: "long", year: "numeric",
                            })
                          : "—"}
                      </span>
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                      Fuentes consultadas:{" "}
                      <span className="text-cyan-300 font-bold">{data.total_fuentes}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Candidato ── */}
            <div className="rounded-2xl border border-white/10 bg-white/3 p-5 backdrop-blur-sm">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                Información del Candidato
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-[11px] text-gray-500 mb-0.5">Tipo de Documento</p>
                  <p className="text-white font-semibold">{data.tipo_doc || "CC"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 mb-0.5">Número de Documento</p>
                  <p className="text-white font-mono font-semibold tracking-wider">{data.cedula_parcial}</p>
                </div>
                {data.nombre && (
                  <div>
                    <p className="text-[11px] text-gray-500 mb-0.5">Nombres</p>
                    <p className="text-white font-semibold">{data.nombre}</p>
                  </div>
                )}
                {data.apellido && (
                  <div>
                    <p className="text-[11px] text-gray-500 mb-0.5">Apellidos</p>
                    <p className="text-white font-semibold">{data.apellido}</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Nivel de Riesgo ── */}
            <div className={`rounded-2xl border ${riesgoMeta.border} ${riesgoMeta.bg} p-5 shadow-lg ${riesgoMeta.glow}`}>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                Nivel de Riesgo Global
              </h2>
              <div className="flex items-center gap-5">
                <div className={`flex-shrink-0 w-14 h-14 rounded-full border-2 ${riesgoMeta.border} ${riesgoMeta.bg} flex items-center justify-center text-2xl font-black ${riesgoMeta.color}`}>
                  {riesgoMeta.icon}
                </div>
                <div className="flex-1">
                  <p className={`text-2xl font-extrabold ${riesgoMeta.color}`}>
                    {data.riesgo.categoria}
                  </p>
                  {data.score_promedio != null && (
                    <p className="text-sm text-gray-400 mt-0.5">
                      Score promedio:{" "}
                      <span className="text-white font-bold">{data.score_promedio} / 4</span>
                    </p>
                  )}
                  {/* Barra de progreso */}
                  <div className="mt-3 h-2 w-full rounded-full bg-white/10">
                    <div
                      className={`h-2 rounded-full transition-all duration-700 ${riesgoMeta.bar}`}
                      style={{ width: `${riesgoMeta.pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                    <span>Bajo</span>
                    <span>Medio</span>
                    <span>Alto</span>
                    <span>Extremo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Fuentes consultadas ── */}
            <div className="rounded-2xl border border-white/10 bg-white/3 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Fuentes Consultadas
                </h2>
                <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
                  {data.total_fuentes} fuentes
                </span>
              </div>

              {data.fuentes.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">Sin resultados disponibles</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {data.fuentes.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-white/5 border border-white/8 hover:bg-white/8 transition"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium truncate">{f.nombre}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <ScoreDots score={f.score} />
                          <span className="text-[10px] text-gray-500">
                            {SCORE_META[Math.max(0, Math.min(3, (f.score || 1) - 1))].label}
                          </span>
                        </div>
                      </div>
                      <EstadoBadge estado={f.estado} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Leyenda de scores ── */}
            <div className="rounded-xl border border-white/8 bg-white/3 p-4">
              <p className="text-[11px] text-gray-500 uppercase tracking-wider font-bold mb-3">
                Interpretación del score por fuente
              </p>
              <div className="flex flex-wrap gap-3">
                {SCORE_META.map((m, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs">
                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${m.color}`} />
                    <span className="text-gray-400">
                      {i + 1} — <span className={m.text}>{m.label}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Footer ── */}
        <footer className="mt-4 text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <div className="h-px flex-1 bg-white/10" />
            <img src={logo} alt="Econfia" className="h-6 object-contain opacity-60" />
            <div className="h-px flex-1 bg-white/10" />
          </div>
          <p className="text-xs text-gray-500">
            Este reporte fue generado por{" "}
            <a href="https://econfia.co" className="text-cyan-400 hover:text-cyan-300 transition font-medium">
              Econfia.co
            </a>{" "}
            · Plataforma oficial de verificación de antecedentes en Colombia
          </p>
          <p className="text-[11px] text-gray-600">
            © {new Date().getFullYear()} Econfia. Todos los derechos reservados.
          </p>
        </footer>
      </div>
    </div>
  );
}
