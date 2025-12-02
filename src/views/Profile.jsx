import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell
} from "recharts";

/** Paleta y helpers de estilo “neón” */
const NEON = {
  bgPanel: "bg-white/5 backdrop-blur-md border border-white/20",
  text: "text-white",
  subtext: "text-white/70",
  cyan: "#00E5FF",
  purple: "#7C4DFF",
  magenta: "#FF00D4",
  lime: "#B8FF00",
  orange: "#FF8A00",
  yellow: "#FFE500",
};
const PIE_COLORS = [NEON.cyan, NEON.purple, NEON.magenta, NEON.lime, NEON.orange, NEON.yellow];

/** Tooltip “glass” personalizado */
function GlassTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md shadow-lg">
      {label && <div className="text-xs text-white/80 mb-1">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="text-sm text-white flex items-center gap-2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ background: p.color }}
          />
          <span className="opacity-90">{p.name}:</span>
          <span className="font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

/** Card contenedor con halo neón */
function NeonCard({ title, children, className = "" }) {
  return (
    <div
      className={`${NEON.bgPanel} rounded-2xl shadow-xl relative overflow-hidden ${className}`}
      style={{
        boxShadow:
          "0 0 0.6rem #ffffff10, inset 0 0 0.6rem #ffffff08",
      }}
    >
      {/* Halo animado suave */}
      <div
        className="pointer-events-none absolute -inset-24 opacity-30 blur-3xl"
        style={{
          background:
            "conic-gradient(from 90deg, rgba(124,77,255,.35), rgba(0,229,255,.25), rgba(255,0,212,.30), rgba(124,77,255,.35))",
          animation: "spin 16s linear infinite",
        }}
      />
      <div className="relative p-6">
        {title && (
          <h2 className="text-xl font-semibold text-white tracking-wide mb-4">
            {title}
          </h2>
        )}
        {children}
      </div>
      <style>{`
        @keyframes spin { 
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Perfil básico
        const resProfile = await fetch(`${API_URL}/api/profile/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        });
        if (!resProfile.ok) throw new Error("Error al obtener el perfil");
        const profileData = await resProfile.json();
        setProfile(profileData);

        // Estadísticas
        const resStats = await fetch(`${API_URL}/api/profile-stats/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        });
        if (!resStats.ok) throw new Error("Error al obtener las estadísticas");
        const statsData = await resStats.json();
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [API_URL]);

  if (!profile || !stats) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur">
          <span className="text-white/80">Cargando perfil...</span>
        </div>
      </div>
    );
  }

  // ---- Preparar datos para los gráficos ----
  const consultasPorEstado = (stats?.estadisticas?.consultas?.por_estado || []).map((e) => ({
    name: e.estado,
    total: e.total,
  }));

  const consultasResumen = [
    { name: "Última semana", total: stats?.estadisticas?.consultas?.ultima_semana ?? 0 },
    { name: "Último mes", total: stats?.estadisticas?.consultas?.ultimo_mes ?? 0 },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto mt-8 px-4 pb-32">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card izquierda: perfil */}
        <NeonCard className="lg:col-span-1">
          <div className="flex flex-col items-center">
            <h2 className="font-bold text-white text-2xl text-center">
              Bienvenido {profile?.full_name}
            </h2>

            <div
              className="w-28 h-28 rounded-full my-5 overflow-hidden border"
              style={{
                borderColor: "#ffffff30",
                boxShadow:
                  "0 0 12px rgba(0,229,255,.35), 0 0 28px rgba(124,77,255,.25)",
              }}
            >
              {profile?.perfil?.foto ? (
                <img
                  src={`${API_URL}${profile.perfil.foto}`}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-black/40 text-3xl font-bold text-white/80">
                  {profile?.full_name ? profile.full_name[0] : profile?.username?.[0]}
                </div>
              )}
            </div>

            <h3 className="text-lg font-semibold text-white">{profile?.username}</h3>
            <p className="text-white/70 text-sm mb-2">{profile?.email || "Sin correo"}</p>

            <span
              className="text-xs px-3 py-1 rounded-full"
              style={{
                color: "#0A0A0A",
                background:
                  "linear-gradient(90deg, #00E5FF 0%, #7C4DFF 100%)",
                boxShadow:
                  "0 0 12px rgba(0,229,255,.45), 0 0 18px rgba(124,77,255,.45)",
              }}
            >
              {profile?.groups?.length > 0 ? profile.groups[0] : "Usuario"}
            </span>

            <div className="w-full grid grid-cols-2 gap-3 mt-5">
              <div className="rounded-xl px-4 py-3 border border-white/10 bg-white/5">
                <div className="text-xs text-white/70">Consultas disponibles</div>
                <div className="text-white text-xl font-semibold">
                  {profile?.perfil?.consultas_disponibles ?? 0}
                </div>
              </div>
              <div className="rounded-xl px-4 py-3 border border-white/10 bg-white/5">
                <div className="text-xs text-white/70">Plan</div>
                <div className="text-white text-xl font-semibold">
                  {profile?.perfil?.plan ?? "—"}
                </div>
              </div>
            </div>
          </div>
        </NeonCard>

        {/* Card derecha: estadísticas y gráficos */}
        <NeonCard title="Estadísticas" className="lg:col-span-2 w-full">
          {/* Defs globales para glow/gradientes */}
          <svg width="0" height="0" className="absolute">
            <defs>
              {/* Glow azul/cian */}
              <filter id="neonGlowCyan" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Glow púrpura */}
              <filter id="neonGlowPurple" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Gradiente para barras */}
              <linearGradient id="gradBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={NEON.cyan} />
                <stop offset="100%" stopColor={NEON.purple} />
              </linearGradient>

              {/* Trazo neón para barras */}
              <linearGradient id="gradBarStroke" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={NEON.magenta} />
                <stop offset="100%" stopColor={NEON.cyan} />
              </linearGradient>

              {/* Gradiente para pie (anillo) */}
              <linearGradient id="gradPie" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={NEON.purple} />
                <stop offset="100%" stopColor={NEON.cyan} />
              </linearGradient>
            </defs>
          </svg>

          {/* Gráficos */}
          <div className="grid lg:grid-cols-2 gap-6 w-full">
            {/* Barras: Consultas por estado */}
            <div className="rounded-xl border border-white/10 p-4 bg-white/5">
              <h3 className="text-white font-semibold mb-3 text-center">
                Consultas por estado
              </h3>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={consultasPorEstado} margin={{ top: 8, right: 20, left: -20, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                    <XAxis dataKey="name" stroke="#E6F7FF" tick={{ fill: "#C8F9FF", fontSize: 12 }} />
                    <YAxis stroke="#E6F7FF" tick={{ fill: "#C8F9FF", fontSize: 12 }} />
                    <Tooltip content={<GlassTooltip />} />
                    <Legend
                      wrapperStyle={{ color: "#fff" }}
                      formatter={(v) => <span className="text-white/80">{v}</span>}
                    />
                    <Bar
                      dataKey="total"
                      name="Total"
                      fill="url(#gradBar)"
                      radius={[8, 8, 0, 0]}
                      stroke="url(#gradBarStroke)"
                      strokeWidth={1.6}
                    >
                      {consultasPorEstado.map((_, i) => (
                        <Cell
                          key={i}
                          filter="url(#neonGlowCyan)"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie: Resumen consultas */}
            <div className="rounded-xl border border-white/10 p-4 bg-white/5 w-full">
              <h3 className="text-white font-semibold mb-3 text-center">
                Resumen de consultas
              </h3>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<GlassTooltip />} />
                    <Legend
                      wrapperStyle={{ color: "#fff" }}
                      formatter={(v) => <span className="text-white/80">{v}</span>}
                    />
                    <Pie
                      data={consultasResumen}
                      dataKey="total"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={4}
                      stroke="url(#gradPie)"
                      strokeWidth={2}
                    >
                      {consultasResumen.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                          filter="url(#neonGlowPurple)"
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </NeonCard>
      </div>
    </div>
  );
}
