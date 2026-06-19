import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell
} from "recharts";
import { Modal } from "antd";
import { FiLogOut } from "react-icons/fi";
import jsPDF from "jspdf";
import { generarInformeUsuarioPDF } from "../pdf/InformeUsuarioPDFV2";
import { clearSession } from "../utils/session";

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

  const handleLogout = () => {
    clearSession();
    window.location.replace("/login");
  };

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
        // Guardar los datos de stats (que incluyen is_staff y is_superuser) en localStorage como 'user'
        localStorage.setItem("user", JSON.stringify(statsData));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [API_URL]);

  if (!profile || !stats) {
    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-6 px-4">
        {/* Spinner doble anillo con glow */}
        <div className="relative h-20 w-20">
          <span className="absolute inset-0 rounded-full border-2 border-cyan-500/15" />
          <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-cyan-400 border-r-cyan-400 [animation-duration:0.9s]" />
          <span className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-b-blue-400 border-l-blue-400 [animation-duration:1.4s] [animation-direction:reverse]" />
          <span className="absolute inset-0 m-auto h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_16px_4px_rgba(34,211,238,0.7)] animate-pulse" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-lg font-bold bg-gradient-to-r from-white via-cyan-100 to-blue-300 bg-clip-text text-transparent">
            Cargando perfil
          </p>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" />
          </div>
          <p className="text-xs text-white/40">Preparando tu información, un momento…</p>
        </div>
      </div>
    );
  }

  // ---- Preparar datos para el nuevo gráfico ----
  const consultasPorEstado = (stats?.estadisticas?.consultas?.por_estado || []).map((e) => ({
    name: e.estado,
    total: e.total,
  }));

  // Nueva métrica: evolución semanal (simulada si no existe)
  const consultasSemanal = (stats?.estadisticas?.consultas?.evolucion_semanal || [
    { semana: "Semana 1", total: stats?.estadisticas?.consultas?.ultima_semana ?? 0 },
    { semana: "Semana 2", total: Math.floor((stats?.estadisticas?.consultas?.ultimo_mes ?? 0) / 4) },
  ]);

  // --- Lógica para generar el PDF ---
  function handleGeneratePDF() {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    // Estilos generales
    doc.setFont("helvetica", "bold");
    doc.setTextColor(44, 62, 80); // Gris oscuro
    doc.setDrawColor(6, 182, 212); // Cyan para líneas
    doc.setLineWidth(0.5);

    // Título principal
    doc.setFontSize(24);
    doc.text("Informe de Usuario", 20, 25);
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(`Nombre: ${profile?.full_name || "-"}` , 20, 35);
    doc.text(`Usuario: ${profile?.username || "-"}` , 20, 43);
    doc.text(`Correo: ${profile?.email || "-"}` , 20, 51);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}` , 20, 59);
    doc.line(20, 62, 190, 62);

    // Consultas y planes
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Consultas", 20, 70);
    doc.setFontSize(13);
    doc.setFont("helvetica", "normal");
    doc.text(`Consultas disponibles: ${profile?.perfil?.consultas_disponibles ?? 0}` , 20, 78);
    doc.text(`Consultas cargadas: ${profile?.perfil?.consultas_cargadas_total ?? 0}` , 20, 85);
    doc.text(`Consultas consumidas: ${profile?.perfil?.consultas_consumidas ?? 0}` , 20, 92);
    doc.line(20, 95, 190, 95);

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Planes activos", 20, 105);
    doc.setFontSize(13);
    doc.setFont("helvetica", "normal");
    if (profile?.perfil?.planes && profile.perfil.planes.length > 0) {
      profile.perfil.planes.forEach((plan, idx) => {
        doc.text(`- ${plan.nombre.charAt(0).toUpperCase() + plan.nombre.slice(1)}`, 25, 112 + idx * 7);
      });
    } else {
      doc.text("Sin plan", 25, 112);
    }
    doc.line(20, 120 + (profile?.perfil?.planes?.length ?? 0) * 7, 190, 120 + (profile?.perfil?.planes?.length ?? 0) * 7);

    // Estadísticas detalladas
    let baseY = 130 + (profile?.perfil?.planes?.length ?? 0) * 7;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Estadísticas de consultas", 20, baseY);
    doc.setFontSize(13);
    doc.setFont("helvetica", "normal");
    if (stats?.estadisticas?.consultas?.por_estado?.length > 0) {
      stats.estadisticas.consultas.por_estado.forEach((e, idx) => {
        doc.text(`${e.estado}: ${e.total}`, 25, baseY + 8 + idx * 7);
      });
    } else {
      doc.text("Sin datos de estados", 25, baseY + 8);
    }
    doc.line(20, baseY + 15 + (stats?.estadisticas?.consultas?.por_estado?.length ?? 0) * 7, 190, baseY + 15 + (stats?.estadisticas?.consultas?.por_estado?.length ?? 0) * 7);

    // Evolución semanal
    let baseY2 = baseY + 25 + (stats?.estadisticas?.consultas?.por_estado?.length ?? 0) * 7;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Evolución semanal", 20, baseY2);
    doc.setFontSize(13);
    doc.setFont("helvetica", "normal");
    if (stats?.estadisticas?.consultas?.evolucion_semanal?.length > 0) {
      stats.estadisticas.consultas.evolucion_semanal.forEach((e, idx) => {
        doc.text(`${e.semana}: ${e.total}`, 25, baseY2 + 8 + idx * 7);
      });
    } else {
      doc.text("Sin datos semanales", 25, baseY2 + 8);
    }
    doc.line(20, baseY2 + 15 + (stats?.estadisticas?.consultas?.evolucion_semanal?.length ?? 0) * 7, 190, baseY2 + 15 + (stats?.estadisticas?.consultas?.evolucion_semanal?.length ?? 0) * 7);

    // Estado de renovación
    let baseY3 = baseY2 + 25 + (stats?.estadisticas?.consultas?.evolucion_semanal?.length ?? 0) * 7;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Estado de renovación", 20, baseY3);
    doc.setFontSize(13);
    doc.setFont("helvetica", "normal");
    doc.text(profile?.perfil?.consultas_disponibles === 0
      ? '¡Renueva tu plan!'
      : 'Vigente', 25, baseY3 + 8);
    doc.line(20, baseY3 + 15, 190, baseY3 + 15);

    // Historial de recargas
    let baseY4 = baseY3 + 25;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Historial de recargas", 20, baseY4);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    if (profile?.perfil?.historial_recargas?.length > 0) {
      profile.perfil.historial_recargas.forEach((r, idx) => {
        doc.text(`Recarga: ${r.cantidad} | Fecha: ${new Date(r.fecha_recarga).toLocaleString()} | Antes: ${r.saldo_antes} | Después: ${r.saldo_despues} | Tipo: ${r.tipo}`,
          25, baseY4 + 8 + idx * 6);
      });
    } else {
      doc.text("Sin recargas registradas", 25, baseY4 + 8);
    }
    doc.line(20, baseY4 + 15 + (profile?.perfil?.historial_recargas?.length ?? 0) * 6, 190, baseY4 + 15 + (profile?.perfil?.historial_recargas?.length ?? 0) * 6);

    // Historial de consumos
    let baseY5 = baseY4 + 25 + (profile?.perfil?.historial_recargas?.length ?? 0) * 6;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Historial de consumos", 20, baseY5);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    if (profile?.perfil?.historial_consumos?.length > 0) {
      profile.perfil.historial_consumos.forEach((c, idx) => {
        doc.text(`Consumo: ${c.cantidad} | Fecha: ${new Date(c.fecha_consumo).toLocaleString()} | Antes: ${c.saldo_antes} | Después: ${c.saldo_despues}`,
          25, baseY5 + 8 + idx * 6);
      });
    } else {
      doc.text("Sin consumos registrados", 25, baseY5 + 8);
    }
    doc.line(20, baseY5 + 15 + (profile?.perfil?.historial_consumos?.length ?? 0) * 6, 190, baseY5 + 15 + (profile?.perfil?.historial_consumos?.length ?? 0) * 6);

    // Pie de página
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(6, 182, 212); // Cyan
    doc.text("Generado por Econfia", 20, 287);

    doc.save("informe_usuario.pdf");
  }

  void handleGeneratePDF;

  return (
    <section className="relative min-h-screen py-4 md:py-6 pb-32 md:pb-36 overflow-hidden bg-transparent">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Card izquierda: perfil */}
          <ElegantCard className="lg:col-span-1">
          <div className="flex flex-col items-center relative">
            {/* Icono cerrar sesión — esquina superior derecha del card */}
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="absolute top-0 right-0 p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all z-10"
            >
              <FiLogOut className="w-4 h-4" />
            </button>
            <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 mb-2">
              <span className="text-cyan-300 text-xs font-medium">Mi Perfil</span>
            </div>

            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full my-3 overflow-hidden border-2 border-cyan-500/30 relative group cursor-pointer transition-all hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/50"
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

            <h3 className="text-base sm:text-lg font-semibold text-white text-center">{profile?.full_name || profile?.username}</h3>
            <p className="text-white/60 text-xs sm:text-sm mb-2 text-center break-all">{profile?.email || "Sin correo"}</p>

            <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/30">
              {profile?.groups?.length > 0 ? profile.groups[0] : "Usuario"}
            </span>

            <div className="w-full grid grid-cols-2 gap-2.5 sm:gap-3 mt-4">
              {/* Consultas */}
              <div className="rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 hover:from-cyan-500/20 hover:to-blue-500/10 transition-all flex flex-col">
                <div className="text-[10px] sm:text-xs text-cyan-300 font-semibold uppercase tracking-wide">Consultas</div>
                <div className="text-white text-xl sm:text-2xl font-black mt-0.5 flex items-center">
                  {profile?.perfil?.consultas_infinitas
                    ? <img src={require('../assets/icons8-infinito-24.png')} alt="Consultas infinitas" style={{height:'26px'}} />
                    : (profile?.perfil?.consultas_disponibles ?? 0)}
                </div>
              </div>
              {/* Planes activos */}
              <div className="rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-purple-500/5 hover:from-blue-500/20 hover:to-purple-500/10 transition-all flex flex-col">
                <div className="text-[10px] sm:text-xs text-blue-300 font-semibold uppercase tracking-wide mb-1.5">Planes activos</div>
                <div className="flex flex-wrap gap-1.5">
                  {(profile?.perfil?.planes && profile.perfil.planes.length > 0)
                    ? profile.perfil.planes.map((plan) => (
                        <span
                          key={plan.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/25 to-blue-500/25 border border-cyan-400/30 text-cyan-100 text-[10px] sm:text-[11px] font-bold shadow-sm shadow-cyan-500/20"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
                          {plan.nombre.charAt(0).toUpperCase() + plan.nombre.slice(1)}
                        </span>
                      ))
                    : <span className="text-slate-400 text-xs">Sin plan</span>}
                </div>
              </div>
            </div>
            {/* Botón PDF */}
            <div className="w-full flex justify-center mt-5">
              <button
                className="w-full px-6 py-2 text-sm sm:text-base rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold shadow-lg shadow-cyan-500/30 hover:from-cyan-600 hover:to-blue-600 transition-all"
                onClick={() => generarInformeUsuarioPDF(profile, stats)}
              >
                Generar informe PDF
              </button>
            </div>
          </div>
        </ElegantCard>

        {/* Card derecha: estadísticas y gráfico renovado */}
        <ElegantCard title="Estadísticas" className="lg:col-span-2 w-full">
          {/* Control de consultas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="rounded-xl px-3 py-3 sm:px-4 border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 text-center transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/10">
              <div className="text-[10px] sm:text-xs text-cyan-300 font-semibold uppercase tracking-wide">Consultas cargadas</div>
              <div className="text-white text-xl sm:text-2xl font-black mt-1 flex items-center justify-center min-h-[34px]">
                {profile?.perfil?.consultas_infinitas
                  ? <img src={require('../assets/icons8-infinito-24.png')} alt="Consultas infinitas" style={{height:'26px'}} />
                  : (profile?.perfil?.consultas_cargadas_total ?? 0)}
              </div>
            </div>
            <div className="rounded-xl px-3 py-3 sm:px-4 border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-purple-500/5 text-center transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/10">
              <div className="text-[10px] sm:text-xs text-blue-300 font-semibold uppercase tracking-wide">Consultas consumidas</div>
              <div className="text-white text-xl sm:text-2xl font-black mt-1 flex items-center justify-center min-h-[34px]">{profile?.perfil?.consultas_consumidas ?? 0}</div>
            </div>
            <div className="rounded-xl px-3 py-3 sm:px-4 border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-cyan-500/5 text-center transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/10">
              <div className="text-[10px] sm:text-xs text-emerald-300 font-semibold uppercase tracking-wide">Saldo de consultas</div>
              <div className="text-white text-xl sm:text-2xl font-black mt-1 flex items-center justify-center min-h-[34px]">
                {profile?.perfil?.consultas_infinitas
                  ? <img src={require('../assets/icons8-infinito-24.png')} alt="Consultas infinitas" style={{height:'30px'}} />
                  : (profile?.perfil?.consultas_disponibles ?? 0)}
              </div>
            </div>
            <div className="rounded-xl px-3 py-3 sm:px-4 border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-pink-500/5 text-center transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-500/10">
              <div className="text-[10px] sm:text-xs text-amber-300 font-semibold uppercase tracking-wide">Estado de renovación</div>
              <div className="text-base sm:text-xl font-black mt-1 flex items-center justify-center min-h-[34px] leading-tight">
                {profile?.perfil?.consultas_infinitas
                  ? <span className="text-cyan-300">Plan ilimitado</span>
                  : profile?.perfil?.consultas_disponibles === 0
                    ? <span className="text-red-400">¡Renueva tu plan!</span>
                    : <span className="text-white">Vigente</span>}
              </div>
            </div>
          </div>

          {/* Gráfico de barras: Consultas por estado */}
          <div className="w-full h-[220px] sm:h-[280px] md:h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consultasPorEstado} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
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
        </ElegantCard>
        </div>
      </div>
    </section>
  );
}
