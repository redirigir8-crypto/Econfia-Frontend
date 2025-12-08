import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell
} from "recharts";
import { Modal } from "antd";

/** Paleta y helpers de estilo elegante */
const THEME = {
  bgPanel: "bg-gradient-to-br from-slate-900/90 via-blue-900/30 to-slate-900/90 backdrop-blur-xl border border-white/10",
  text: "text-white",
  subtext: "text-white/70",
  cyan: "#06b6d4",
  blue: "#3b82f6",
  purple: "#8b5cf6",
  pink: "#ec4899",
  emerald: "#10b981",
  amber: "#f59e0b",
};
const PIE_COLORS = [THEME.cyan, THEME.blue, THEME.purple, THEME.pink, THEME.emerald, THEME.amber];

/** Tooltip elegante personalizado */
function GlassTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="px-3 py-2 rounded-lg border border-white/20 bg-gradient-to-br from-slate-900/95 via-blue-900/40 to-slate-900/95 backdrop-blur-xl shadow-2xl shadow-cyan-500/20">
      {label && <div className="text-xs text-cyan-300 mb-1 font-semibold">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="text-sm text-white flex items-center gap-2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full shadow-lg"
            style={{ background: p.color, boxShadow: `0 0 8px ${p.color}` }}
          />
          <span className="opacity-90">{p.name}:</span>
          <span className="font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

/** Card contenedor elegante */
function ElegantCard({ title, children, className = "" }) {
  return (
    <div
      className={`${THEME.bgPanel} rounded-[20px] shadow-2xl shadow-cyan-500/10 relative overflow-hidden group ${className}`}
    >
      {/* Glow effect sutil */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[20px] bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none" />
      
      <div className="relative p-3 md:p-4">
        {title && (
          <div className="mb-2 md:mb-3">
            <h2 className="text-lg md:text-xl font-black bg-gradient-to-r from-white via-cyan-100 to-blue-300 bg-clip-text text-transparent">
              {title}
            </h2>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

const AVATAR_LIST = [
  "https://api.dicebear.com/7.x/bottts/svg?seed=avatar1",
  "https://api.dicebear.com/7.x/bottts/svg?seed=avatar2",
  "https://api.dicebear.com/7.x/bottts/svg?seed=avatar3",
  "https://api.dicebear.com/7.x/bottts/svg?seed=avatar4",
  "https://api.dicebear.com/7.x/bottts/svg?seed=avatar5",
];

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL;

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("foto", file);

    setUploadingPhoto(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/profile/update-photo/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Error al subir la foto");
      
      const updatedProfile = await response.json();
      setProfile(updatedProfile);
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("Error al subir la foto. Por favor intenta de nuevo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleAvatarSelect = async (avatar) => {
    setSelectedAvatar(avatar);
    setShowAvatarModal(false);
    setUploadingPhoto(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/profile/update-photo/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ avatar }),
      });
      if (!response.ok) throw new Error("Error al actualizar el avatar");
      const updatedProfile = await response.json();
      setProfile(updatedProfile);
    } catch (error) {
      alert("Error al actualizar el avatar");
    } finally {
      setUploadingPhoto(false);
    }
  };

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
    <section className="relative h-screen py-4 md:py-6 pb-20 md:pb-24 overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="w-full max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card izquierda: perfil */}
          <ElegantCard className="lg:col-span-1">
          <div className="flex flex-col items-center">
            <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 mb-3">
              <span className="text-cyan-300 text-xs font-medium">Mi Perfil</span>
            </div>
            <h2 className="font-black text-2xl text-center bg-gradient-to-r from-white via-cyan-100 to-blue-300 bg-clip-text text-transparent mb-2">
              {profile?.full_name}
            </h2>

            <div
              className="w-28 h-28 rounded-full my-4 overflow-hidden border-2 border-cyan-500/30 relative group cursor-pointer transition-all hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/50"
              onClick={() => setShowAvatarModal(true)}
            >
              <img
                src={selectedAvatar || (profile?.perfil?.foto ? `${API_URL}${profile.perfil.foto}` : "https://www.gravatar.com/avatar/?d=mp")}
                alt="Foto de perfil"
                className="w-full h-full object-cover"
              />
              
              {/* Overlay al hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-semibold drop-shadow-lg">
                  {uploadingPhoto ? "Actualizando..." : "Cambiar avatar"}
                </span>
              </div>
            </div>

            {/* Modal para selección de avatar */}
            <Modal
              open={showAvatarModal}
              onCancel={() => setShowAvatarModal(false)}
              footer={null}
              title="Selecciona tu avatar"
              centered
            >
              <div className="flex flex-wrap gap-4 justify-center py-4">
                {AVATAR_LIST.map((avatar, idx) => (
                  <img
                    key={idx}
                    src={avatar}
                    alt={`Avatar ${idx+1}`}
                    className={`w-20 h-20 rounded-full border-2 cursor-pointer hover:border-cyan-400 transition ${selectedAvatar === avatar ? "border-cyan-500" : "border-transparent"}`}
                    onClick={() => handleAvatarSelect(avatar)}
                  />
                ))}
              </div>
            </Modal>

            <h3 className="text-lg font-semibold text-white">{profile?.username}</h3>
            <p className="text-white/60 text-sm mb-3">{profile?.email || "Sin correo"}</p>

            <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/30">
              {profile?.groups?.length > 0 ? profile.groups[0] : "Usuario"}
            </span>

            <div className="w-full grid grid-cols-2 gap-3 mt-5">
              <div className="rounded-lg px-4 py-3 border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 hover:from-cyan-500/20 hover:to-blue-500/10 transition-all">
                <div className="text-xs text-cyan-300 font-medium">Consultas</div>
                <div className="text-white text-2xl font-black">
                  {profile?.perfil?.consultas_disponibles ?? 0}
                </div>
              </div>
              <div className="rounded-lg px-4 py-3 border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-purple-500/5 hover:from-blue-500/20 hover:to-purple-500/10 transition-all">
                <div className="text-xs text-blue-300 font-medium">Plan</div>
                <div className="text-white text-2xl font-black">
                  {profile?.perfil?.plan ?? "—"}
                </div>
              </div>
            </div>
          </div>
        </ElegantCard>

        {/* Card derecha: estadísticas y gráficos */}
        <ElegantCard title="Estadísticas" className="lg:col-span-2 w-full">
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
                <stop offset="0%" stopColor={THEME.cyan} />
                <stop offset="100%" stopColor={THEME.blue} />
              </linearGradient>

              {/* Trazo elegante para barras */}
              <linearGradient id="gradBarStroke" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={THEME.cyan} />
                <stop offset="100%" stopColor={THEME.blue} />
              </linearGradient>

              {/* Gradiente para pie (anillo) */}
              <linearGradient id="gradPie" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={THEME.blue} />
                <stop offset="100%" stopColor={THEME.cyan} />
              </linearGradient>
            </defs>
          </svg>

          {/* Gráficos */}
          <div className="grid lg:grid-cols-2 gap-4 md:gap-6 w-full">
            {/* Barras: Consultas por estado */}
            <div className="relative rounded-xl border border-cyan-500/20 p-3 md:p-4 bg-gradient-to-br from-slate-900/60 to-blue-900/20 backdrop-blur-lg shadow-xl shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all group">
              {/* Glow decorativo */}
              <div className="absolute -top-1 -right-1 w-20 h-20 bg-cyan-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center justify-center gap-2 mb-2 md:mb-3">
                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-500/50 animate-pulse" />
                <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 font-black text-sm md:text-base">
                  Consultas por Estado
                </h3>
              </div>
              
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={consultasPorEstado} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="barGradient1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6} />
                      </linearGradient>
                      <filter id="barShadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                        <feOffset dx="0" dy="2" result="offsetblur" />
                        <feComponentTransfer>
                          <feFuncA type="linear" slope="0.5" />
                        </feComponentTransfer>
                        <feMerge>
                          <feMergeNode />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(6,182,212,0.08)" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#06b6d4" 
                      tick={{ fill: "#67e8f9", fontSize: 11, fontWeight: 600 }} 
                      axisLine={{ stroke: "#06b6d4", strokeWidth: 2 }}
                    />
                    <YAxis 
                      stroke="#06b6d4" 
                      tick={{ fill: "#67e8f9", fontSize: 11, fontWeight: 600 }} 
                      axisLine={{ stroke: "#06b6d4", strokeWidth: 2 }}
                    />
                    <Tooltip content={<GlassTooltip />} cursor={{ fill: "rgba(6,182,212,0.1)" }} />
                    <Bar
                      dataKey="total"
                      name="Total"
                      fill="url(#barGradient1)"
                      radius={[10, 10, 0, 0]}
                      filter="url(#barShadow)"
                      animationDuration={800}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie: Resumen consultas */}
            <div className="relative rounded-xl border border-blue-500/20 p-3 md:p-4 bg-gradient-to-br from-slate-900/60 to-purple-900/20 backdrop-blur-lg shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 transition-all group w-full">
              {/* Glow decorativo */}
              <div className="absolute -top-1 -left-1 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center justify-center gap-2 mb-2 md:mb-3">
                <div className="w-2 h-2 rounded-full bg-blue-400 shadow-lg shadow-blue-500/50 animate-pulse" style={{ animationDelay: '0.3s' }} />
                <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 font-black text-sm md:text-base">
                  Resumen de Consultas
                </h3>
              </div>
              
              <div className="h-[180px] md:h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      {consultasResumen.map((_, index) => (
                        <linearGradient key={`pieGrad-${index}`} id={`pieGradient${index}`} x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={PIE_COLORS[index % PIE_COLORS.length]} stopOpacity={1} />
                          <stop offset="100%" stopColor={PIE_COLORS[index % PIE_COLORS.length]} stopOpacity={0.7} />
                        </linearGradient>
                      ))}
                      <filter id="pieShadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
                        <feOffset dx="0" dy="3" result="offsetblur" />
                        <feComponentTransfer>
                          <feFuncA type="linear" slope="0.4" />
                        </feComponentTransfer>
                        <feMerge>
                          <feMergeNode />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <Tooltip content={<GlassTooltip />} />
                    <Legend
                      wrapperStyle={{ paddingTop: "10px" }}
                      formatter={(v) => <span className="text-cyan-200 text-xs font-semibold">{v}</span>}
                      iconType="circle"
                    />
                    <Pie
                      data={consultasResumen}
                      dataKey="total"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={6}
                      strokeWidth={3}
                      filter="url(#pieShadow)"
                      animationDuration={1000}
                      animationBegin={200}
                    >
                      {consultasResumen.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={`url(#pieGradient${index})`}
                          stroke={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </ElegantCard>
        </div>
      </div>
    </section>
  );
}
