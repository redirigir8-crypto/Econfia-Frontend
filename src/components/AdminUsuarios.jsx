import React, { useEffect, useState } from "react";
import Toast from "./Toast";
import Modal from "./Modal";
import { generarInformeAdminPDF, generarInformeAdminIndividualPDF } from "../pdf/InformeAdminPDFV2";
import AdminSoporte from "../views/AdminSoporte";
import soporteService from "../services/soporteService";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// ─── Iconos inline ────────────────────────────────────────────────
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4-4m0 0A7 7 0 104 4a7 7 0 0013 13z" />
  </svg>
);
const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
const SpinIcon = () => (
  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-9.197 4.803A9.956 9.956 0 0112 21c2.21 0 4.267-.72 5.925-1.95M21 12c0 1.657-.403 3.22-1.125 4.575" />
  </svg>
);
const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575m1.875-2.25A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.403 3.22-1.125 4.575m-1.875 2.25A9.956 9.956 0 0112 21c-2.21 0-4.267-.72-5.925-1.95M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// ─── Botón de acción reutilizable ─────────────────────────────────
const ActionBtn = ({ onClick, title, color, children, className = "", disabled = false }) => {
  const colors = {
    teal:   "border-teal-500/40 text-teal-300 hover:bg-teal-900/40 hover:border-teal-400/60 hover:text-teal-200",
    cyan:   "border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/40 hover:border-cyan-400/60 hover:text-cyan-200",
    sky:    "border-sky-500/40 text-sky-300 hover:bg-sky-900/40 hover:border-sky-400/60 hover:text-sky-200",
    indigo: "border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/40 hover:border-indigo-400/60 hover:text-indigo-200",
    red:    "border-red-500/40 text-red-300 hover:bg-red-900/40 hover:border-red-400/60 hover:text-red-200",
    green:  "border-green-500/40 text-green-300 hover:bg-green-900/40 hover:border-green-400/60 hover:text-green-200",
    violet: "border-violet-500/40 text-violet-300 hover:bg-violet-900/40 hover:border-violet-400/60 hover:text-violet-200",
  };
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg border bg-white/5 text-xs font-semibold transition-all duration-200 whitespace-nowrap disabled:opacity-50 disabled:cursor-wait ${colors[color] || colors.cyan} ${className}`}
    >
      {children}
    </button>
  );
};

// ─── Input reutilizable para modales ──────────────────────────────
const ModalInput = ({ label, ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-xs text-cyan-400 font-medium tracking-wide">{label}</label>}
    <input
      {...props}
      className="rounded-lg px-3 py-2 border border-slate-600 bg-slate-800/80 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:bg-slate-800 transition text-sm"
    />
  </div>
);

// ─── Badge de estado ───────────────────────────────────────────────
const Badge = ({ children, color }) => {
  const colors = {
    green:  "bg-green-900/50 text-green-300 border-green-700/40",
    red:    "bg-red-900/50 text-red-300 border-red-700/40",
    cyan:   "bg-cyan-900/50 text-cyan-300 border-cyan-700/40",
    violet: "bg-violet-900/50 text-violet-300 border-violet-700/40",
    slate:  "bg-slate-700/50 text-slate-400 border-slate-600/40",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${colors[color] || colors.slate}`}>
      {children}
    </span>
  );
};

const formatPlanName = (name = "") => name ? name.charAt(0).toUpperCase() + name.slice(1) : "Sin plan";

const getRoleSummary = (user) => {
  if (user.is_superuser) return "Superusuario";
  if (user.is_staff) return "Staff";
  return "Usuario";
};


const AdminUsuarios = () => {
  const [filter, setFilter]     = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 6;
  const [orderAsc, setOrderAsc] = useState(true);
  const [users, setUsers]       = useState([]);
  const [planes, setPlanes]     = useState([]);
  const [toast, setToast]       = useState(null);
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [generandoPDFUserId, setGenerandoPDFUserId] = useState(null);

  // Modales
  const [showModal, setShowModal]           = useState(false);
  const [showEditModal, setShowEditModal]   = useState(false);
  const [selectedUser, setSelectedUser]     = useState(null);
  const [selectedPlanes, setSelectedPlanes] = useState([]);
  const [editUserData, setEditUserData]     = useState({ username: "", email: "", first_name: "", last_name: "", password: "" });
  const [showPassword, setShowPassword]     = useState(false);

  // Consultas realizadas
  const [showConsultasRealizadasModal, setShowConsultasRealizadasModal] = useState(false);
  const [consultasRealizadas, setConsultasRealizadas]           = useState([]);
  const [consultasRealizadasTotal, setConsultasRealizadasTotal] = useState(0);
  const [consultasRealizadasPage, setConsultasRealizadasPage]   = useState(1);
  const [consultasRealizadasLoading, setConsultasRealizadasLoading] = useState(false);
  const [consultasRealizadasUser, setConsultasRealizadasUser]   = useState(null);

  // Asignar consultas
  const [showConsultasModal, setShowConsultasModal] = useState(false);
  const [consultasValue, setConsultasValue]         = useState(0);
  const [consultasInfinitas, setConsultasInfinitas] = useState(false);

  // Consultas masivas
  const [showMasivasModal, setShowMasivasModal]   = useState(false);
  const [masivasUser, setMasivasUser]             = useState(null);
  const [masivasPlanId, setMasivasPlanId]         = useState("");

  // Soporte técnico
  const [showSoporteModal, setShowSoporteModal] = useState(false);
  const [ticketsSoporteActivos, setTicketsSoporteActivos] = useState(0);
  const [loadingSoporte, setLoadingSoporte] = useState(false);

  const token = localStorage.getItem("token");

  // ── Fetch ──────────────────────────────────────────────────────
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users/`, { headers: { Authorization: `Token ${token}` } });
      const data = await res.json();
      setUsers(data);
      setCurrentPage(1);
    } catch {
      setToast({ type: "error", message: "Error al cargar usuarios" });
    }
  };

  useEffect(() => { fetchUsers(); }, [token]);

  const fetchSoporteActivos = async () => {
    if (!token) return;
    setLoadingSoporte(true);
    try {
      const tickets = await soporteService.obtenerTicketsAbiertos();
      setTicketsSoporteActivos(Array.isArray(tickets) ? tickets.length : 0);
    } catch {
      setTicketsSoporteActivos(0);
    } finally {
      setLoadingSoporte(false);
    }
  };

  useEffect(() => { fetchSoporteActivos(); }, [token]);

  const handleOpenSoporteModal = async () => {
    await fetchSoporteActivos();
    setShowSoporteModal(true);
  };

  useEffect(() => {
    const fetchPlanes = async () => {
      try {
        const res = await fetch(`${API_URL}/api/planes/`, { headers: { Authorization: `Token ${token}` } });
        setPlanes(await res.json());
      } catch {}
    };
    fetchPlanes();
  }, [token]);

  // ── Ver consultas ─────────────────────────────────────────────
  const fetchConsultasRealizadas = async (userId, page = 1) => {
    setConsultasRealizadasLoading(true);
    try {
      const res  = await fetch(`${API_URL}/api/admin/users/${userId}/consultas/?page=${page}`, { headers: { Authorization: `Token ${token}` } });
      const data = await res.json();
      setConsultasRealizadas(data.results || []);
      setConsultasRealizadasTotal(data.total || 0);
      setConsultasRealizadasPage(page);
    } catch {
      setToast({ type: "error", message: "Error al cargar consultas del usuario" });
    } finally {
      setConsultasRealizadasLoading(false);
    }
  };

  const handleVerConsultas = (user) => {
    setConsultasRealizadasUser(user);
    setConsultasRealizadas([]);
    setConsultasRealizadasPage(1);
    setShowConsultasRealizadasModal(true);
    fetchConsultasRealizadas(user.id, 1);
  };

  // ── Asignar consultas ─────────────────────────────────────────
  const fetchAllConsultasByUser = async (userId) => {
    const todas = [];
    let page = 1;

    while (true) {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/consultas/?page=${page}`, {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await res.json();
      const resultados = data.results || [];
      todas.push(...resultados);
      if (todas.length >= (data.total || 0) || resultados.length === 0) break;
      page += 1;
    }

    return todas;
  };

  const handleGenerateIndividualPDF = async (user) => {
    setGenerandoPDFUserId(user.id);
    try {
      const adminName = localStorage.getItem("username") || "Administrador";
      const consultas = await fetchAllConsultasByUser(user.id);
      generarInformeAdminIndividualPDF(user, adminName, consultas);
    } catch {
      setToast({ type: "error", message: "No se pudo generar el informe individual" });
    } finally {
      setGenerandoPDFUserId(null);
    }
  };

  const handleOpenConsultasModal = (user) => {
    setSelectedUser(user);
    setConsultasValue(user.perfil?.consultas_infinitas ? 0 : (user.perfil?.consultas_disponibles || 0));
    setConsultasInfinitas(!!user.perfil?.consultas_infinitas);
    setShowConsultasModal(true);
  };

  const handleSaveConsultas = async () => {
    try {
      const res = await fetch(`${API_URL}/api/perfiles/${selectedUser.perfil.id}/`, {
        method: "PATCH",
        headers: { Authorization: `Token ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ consultas_disponibles: consultasValue, consultas_infinitas: consultasInfinitas }),
      });
      if (!res.ok) throw new Error();
      setUsers((prev) => prev.map((u) =>
        u.id === selectedUser.id
          ? { ...u, perfil: { ...u.perfil, consultas_disponibles: consultasValue, consultas_infinitas: consultasInfinitas } }
          : u
      ));
      setToast({ type: "success", message: "Consultas asignadas" });
      setShowConsultasModal(false);
    } catch {
      setToast({ type: "error", message: "Error al asignar consultas" });
    }
  };

  // ── Editar usuario ────────────────────────────────────────────
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditUserData({ username: user.username, email: user.email, first_name: user.first_name, last_name: user.last_name, password: "" });
    setShowEditModal(true);
  };

  const handleSaveEditUser = async () => {
    try {
      const dataToSend = { ...editUserData, id: selectedUser.id };
      if (!dataToSend.password) delete dataToSend.password;
      const res = await fetch(`${API_URL}/api/admin/users/`, {
        method: "PUT",
        headers: { Authorization: `Token ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });
      if (!res.ok) throw new Error();
      setUsers((prev) => prev.map((u) =>
        u.id === selectedUser.id
          ? { ...u, username: editUserData.username, email: editUserData.email, first_name: editUserData.first_name, last_name: editUserData.last_name }
          : u
      ));
      setToast({ type: "success", message: "Usuario actualizado" });
      setShowEditModal(false);
    } catch {
      setToast({ type: "error", message: "Error al actualizar usuario" });
    }
  };

  // ── Eliminar usuario ──────────────────────────────────────────
  const handleDeleteUser = async (user) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/users/`, {
        method: "DELETE",
        headers: { Authorization: `Token ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id }),
      });
      if (res.status !== 204) throw new Error();
      setToast({ type: "success", message: "Usuario eliminado" });
      fetchUsers();
    } catch {
      setToast({ type: "error", message: "Error al eliminar usuario" });
    }
  };

  // ── Editar planes ─────────────────────────────────────────────
  const handleEditPlanes = async (user) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${user.id}/`, { headers: { Authorization: `Token ${token}` } });
      if (!res.ok) throw new Error();
      const updatedUser = await res.json();
      setSelectedUser(updatedUser);
      setSelectedPlanes((updatedUser.perfil?.planes || []).map((p) => p.id));
      setShowModal(true);
    } catch {
      setToast({ type: "error", message: "No se pudo cargar el usuario actualizado" });
    }
  };

  const handleSavePlanes = async () => {
    try {
      const res = await fetch(`${API_URL}/api/perfiles/${selectedUser.perfil.id}/asignar-planes/`, {
        method: "POST",
        headers: { Authorization: `Token ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ planes: selectedPlanes }),
      });
      if (!res.ok) throw new Error();
      // Actualizar planes del usuario en el estado local
      const planesAsignados = planes.filter((p) => selectedPlanes.includes(p.id));
      setUsers((prev) => prev.map((u) =>
        u.id === selectedUser.id
          ? { ...u, perfil: { ...u.perfil, planes: planesAsignados } }
          : u
      ));
      setToast({ type: "success", message: "Planes actualizados" });
      setShowModal(false);
      setSelectedPlanes([]);
      setSelectedUser(null);
      const userRes = await fetch(`${API_URL}/api/profile/`, { headers: { Authorization: `Token ${token}` } });
      if (userRes.ok) {
        const updatedUser = await userRes.json();
        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("user-updated"));
      }
    } catch {
      setToast({ type: "error", message: "Error al guardar planes" });
    }
  };

  // ── Asignar plan a masivas ────────────────────────────────────
  const handleAsignarPlanMasivas = async (user, planId) => {
    if (!user.perfil || !planId) return;
    const plan = (user.perfil?.planes || []).find((p) => String(p.id) === String(planId));
    if (!plan) return;
    const idsActuales = user.perfil?.planes_masivas_ids || [];
    if (idsActuales.includes(plan.id)) return;
    const nuevosIds = [...idsActuales, plan.id];
    const nuevosPlanes = [...(user.perfil?.planes_masivas || []), plan];
    const usuarioActualizado = { ...user, perfil: { ...user.perfil, planes_masivas_ids: nuevosIds, planes_masivas: nuevosPlanes, consultas_masivas: true } };
    setUsers((prev) => prev.map((u) => u.id === user.id ? usuarioActualizado : u));
    setMasivasUser(usuarioActualizado);
    setMasivasPlanId("");
    try {
      const res = await fetch(`${API_URL}/api/perfiles/${user.perfil.id}/`, {
        method: "PATCH",
        headers: { Authorization: `Token ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ planes_masivas_ids: nuevosIds }),
      });
      if (!res.ok) throw new Error();
      setToast({ type: "success", message: `Masivas asignadas al plan ${plan.nombre} para ${user.username}` });
    } catch {
      setUsers((prev) => prev.map((u) => u.id === user.id ? user : u));
      setMasivasUser(user);
      setToast({ type: "error", message: "Error al asignar masivas al plan" });
    }
  };

  // ── Quitar plan de masivas ────────────────────────────────────
  const handleQuitarPlanMasivas = async (user, planId) => {
    if (!user.perfil) return;
    const nuevosIds = (user.perfil?.planes_masivas_ids || []).filter((id) => id !== planId);
    const nuevosPlanes = (user.perfil?.planes_masivas || []).filter((p) => p.id !== planId);
    const usuarioActualizado = { ...user, perfil: { ...user.perfil, planes_masivas_ids: nuevosIds, planes_masivas: nuevosPlanes, consultas_masivas: nuevosIds.length > 0 } };
    setUsers((prev) => prev.map((u) => u.id === user.id ? usuarioActualizado : u));
    setMasivasUser(usuarioActualizado);
    try {
      const res = await fetch(`${API_URL}/api/perfiles/${user.perfil.id}/`, {
        method: "PATCH",
        headers: { Authorization: `Token ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ planes_masivas_ids: nuevosIds }),
      });
      if (!res.ok) throw new Error();
      setToast({ type: "success", message: `Plan quitado de masivas para ${user.username}` });
    } catch {
      setUsers((prev) => prev.map((u) => u.id === user.id ? user : u));
      setMasivasUser(user);
      setToast({ type: "error", message: "Error al quitar plan de masivas" });
    }
  };

  // ── Desactivar todas las masivas ──────────────────────────────
  const handleDesactivarMasivas = async (user) => {
    if (!user.perfil) return;
    const usuarioActualizado = { ...user, perfil: { ...user.perfil, planes_masivas_ids: [], planes_masivas: [], consultas_masivas: false } };
    setUsers((prev) => prev.map((u) => u.id === user.id ? usuarioActualizado : u));
    setMasivasUser(usuarioActualizado);
    try {
      const res = await fetch(`${API_URL}/api/perfiles/${user.perfil.id}/`, {
        method: "PATCH",
        headers: { Authorization: `Token ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ planes_masivas_ids: [] }),
      });
      if (!res.ok) throw new Error();
      setToast({ type: "success", message: `Masivas desactivadas para ${user.username}` });
    } catch {
      setUsers((prev) => prev.map((u) => u.id === user.id ? user : u));
      setMasivasUser(user);
      setToast({ type: "error", message: "Error al desactivar masivas" });
    }
  };

  // ── Activar / Desactivar ──────────────────────────────────────
  const handleToggleActive = async (user) => {
    const nuevoEstado = !user.is_active;
    // Actualización optimista
    setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, is_active: nuevoEstado } : u));
    try {
      const endpoint = user.is_active
        ? `${API_URL}/api/usuarios/${user.id}/desactivar/`
        : `${API_URL}/api/usuarios/${user.id}/activar/`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Token ${token}`, "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error();
      setToast({ type: "success", message: `Usuario ${nuevoEstado ? "activado" : "desactivado"}` });
    } catch {
      // Revertir si falla
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, is_active: user.is_active } : u));
      setToast({ type: "error", message: "Error al cambiar estado del usuario" });
    }
  };

  // ── Datos filtrados y paginados ───────────────────────────────
  const filteredUsers = users
    .filter((u) => {
      if (!filter.trim()) return true;
      const val = filter.trim().toLowerCase();
      return (
        String(u.id).includes(val) ||
        (u.username && u.username.toLowerCase().includes(val)) ||
        (u.email && u.email.toLowerCase().includes(val)) ||
        (u.full_name && u.full_name.toLowerCase().includes(val)) ||
        (u.is_active ? "sí" : "no").includes(val) ||
        (u.is_staff ? "sí" : "no").includes(val) ||
        (u.is_superuser ? "sí" : "no").includes(val) ||
        ((u.perfil?.planes || []).map((p) => p.nombre.toLowerCase()).join(", ").includes(val)) ||
        (u.perfil?.nombre_empresa && u.perfil.nombre_empresa.toLowerCase().includes(val)) ||
        (u.perfil?.nit && u.perfil.nit.toLowerCase().includes(val)) ||
        (u.perfil?.tipo_registro && u.perfil.tipo_registro.toLowerCase().includes(val))
      );
    })
    .slice()
    .sort((a, b) => (orderAsc ? a.id - b.id : b.id - a.id));

  const totalPages  = Math.max(1, Math.ceil(filteredUsers.length / usersPerPage));
  const pagedUsers  = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);
  const usuariosActivos = users.filter((u) => u.is_active).length;
  const usuariosEmpresa = users.filter((u) => u.perfil?.tipo_registro === "empresa").length;
  const usuariosConPlanes = users.filter((u) => (u.perfil?.planes || []).length > 0).length;
  const usuariosMasivos = users.filter((u) => u.perfil?.consultas_masivas).length;
  const visibleFrom = filteredUsers.length === 0 ? 0 : (currentPage - 1) * usersPerPage + 1;
  const visibleTo = filteredUsers.length === 0 ? 0 : Math.min(currentPage * usersPerPage, filteredUsers.length);

  const estadoColores = {
    completado:    "text-green-400",
    en_proceso:    "text-yellow-400",
    no_encontrado: "text-red-400",
    pendiente:     "text-indigo-400",
  };

  // ── RENDER ─────────────────────────────────────────────────────
  return (
    <section className="min-h-screen px-3 py-4 pb-28 sm:px-5 sm:py-6 sm:pb-32 lg:px-6 lg:pb-36">
      {/* Toast */}
      {toast && (
        <Toast
          {...toast}
          onClose={() => setToast(null)}
          sound={toast.type === "error" ? "/sounds/error-011-352286.mp3" : "/sounds/success-1-6297.mp3"}
        />
      )}

      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5">
        <div className="overflow-hidden rounded-[28px] border border-cyan-500/10 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_34%),linear-gradient(135deg,rgba(8,15,30,0.98),rgba(10,18,36,0.92)_55%,rgba(8,12,24,0.98))] px-4 py-5 shadow-[0_30px_80px_rgba(8,145,178,0.08)] sm:px-6 sm:py-6 lg:px-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200/90">
                Centro administrativo
              </span>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl xl:text-[2.65rem]">
                Administracion de usuarios
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-[15px]">
                Supervisa cuentas, planes, credito operativo y exportes desde una vista mucho mas comoda para escritorio, tablet y movil.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[560px]">
              {[
                { label: "Usuarios activos", value: usuariosActivos, tone: "from-emerald-400/20 to-transparent text-emerald-300" },
                { label: "Cuentas empresa", value: usuariosEmpresa, tone: "from-violet-400/20 to-transparent text-violet-300" },
                { label: "Con planes", value: usuariosConPlanes, tone: "from-sky-400/20 to-transparent text-sky-300" },
                { label: "Masivas activas", value: usuariosMasivos, tone: "from-amber-400/20 to-transparent text-amber-300" },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-2xl border border-white/10 bg-gradient-to-br ${item.tone} px-4 py-4 backdrop-blur-sm`}
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">{item.label}</div>
                  <div className="mt-3 text-2xl font-black text-white">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-slate-950/95 via-slate-900/95 to-slate-950/95 shadow-2xl shadow-cyan-500/5">
          <div className="border-b border-white/8 bg-[linear-gradient(180deg,rgba(18,33,59,0.82),rgba(10,18,34,0.88))] px-4 py-4 sm:px-5 lg:px-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="relative w-full xl:max-w-xl">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cyan-300/70">
                    <SearchIcon />
                  </span>
                  <input
                    type="text"
                    value={filter}
                    onChange={(e) => { setFilter(e.target.value); setCurrentPage(1); }}
                    placeholder="Buscar por usuario, email, empresa, NIT o rol..."
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/70 py-3 pl-10 pr-4 text-sm text-white/90 shadow-inner shadow-black/20 transition placeholder:text-white/30 focus:border-cyan-400/60 focus:bg-slate-900 focus:outline-none"
                    autoComplete="off"
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row xl:justify-end">
                  <button
                    onClick={handleOpenSoporteModal}
                    className="relative inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-400/35 bg-amber-500/12 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100 transition-all hover:bg-amber-500/20"
                    title="Ver tickets de soporte técnico"
                  >
                    <span>Tickets</span>
                    <span className="rounded-full bg-amber-300 px-2 py-0.5 text-[10px] font-black text-slate-950">
                      {loadingSoporte ? "..." : ticketsSoporteActivos}
                    </span>
                    {ticketsSoporteActivos > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setOrderAsc((v) => !v)}
                    className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] transition-all ${
                      orderAsc
                        ? "border-cyan-500/30 bg-cyan-500/12 text-cyan-200 hover:bg-cyan-500/20"
                        : "border-blue-500/30 bg-blue-500/12 text-blue-200 hover:bg-blue-500/20"
                    }`}
                  >
                    {orderAsc ? "Orden ID asc" : "Orden ID desc"}
                  </button>

                  <button
                    onClick={async () => {
                      setGenerandoPDF(true);
                      try {
                        const adminName = localStorage.getItem("username") || "Administrador";
                        let usersParaPDF = users;
                        try {
                          const resUsers = await fetch(`${API_URL}/api/admin/users/`, { headers: { Authorization: `Token ${token}` } });
                          if (resUsers.ok) usersParaPDF = await resUsers.json();
                        } catch {}
                        const consultasPorUsuario = {};
                        await Promise.all(
                          usersParaPDF.map(async (u) => {
                            try {
                              consultasPorUsuario[u.id] = await fetchAllConsultasByUser(u.id);
                            } catch {
                              consultasPorUsuario[u.id] = [];
                            }
                          })
                        );
                        generarInformeAdminPDF(usersParaPDF, adminName, consultasPorUsuario);
                      } finally {
                        setGenerandoPDF(false);
                      }
                    }}
                    disabled={generandoPDF}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-lg shadow-cyan-500/20 transition-all hover:brightness-110 disabled:cursor-wait disabled:opacity-50"
                  >
                    {generandoPDF ? <><SpinIcon /> Generando...</> : <><DownloadIcon /> Informe PDF</>}
                  </button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">Resultados visibles</div>
                  <div className="mt-2 text-xl font-bold text-white">{filteredUsers.length}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">Rango mostrado</div>
                  <div className="mt-2 text-xl font-bold text-white">{visibleFrom} - {visibleTo}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">Pagina actual</div>
                  <div className="mt-2 text-xl font-bold text-white">{currentPage} / {totalPages}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">Cobertura</div>
                  <div className="mt-2 text-sm font-semibold text-cyan-200">
                    {filter.trim() ? "Listado filtrado por busqueda activa" : "Vista completa del padron de usuarios"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="block xl:hidden px-3 py-3 sm:px-4 sm:py-4">
            {pagedUsers.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-14 text-center text-sm text-white/35">
                No se encontraron usuarios con ese filtro.
              </div>
            ) : (
              <div className="space-y-4">
                {pagedUsers.map((u) => (
                  <article
                    key={u.id}
                    className="overflow-hidden rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,27,47,0.95),rgba(7,14,26,0.98))] shadow-[0_20px_45px_rgba(2,8,23,0.35)]"
                  >
                    <div className="border-b border-white/6 bg-[linear-gradient(120deg,rgba(14,165,233,0.12),transparent_40%,rgba(59,130,246,0.08))] px-4 py-4 sm:px-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/12 text-lg font-black uppercase text-cyan-200">
                          {(u.username || "U").slice(0, 1)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-base font-bold text-white sm:text-lg">{u.username}</h3>
                            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-mono text-white/45">#{u.id}</span>
                            {u.is_active ? <Badge color="green">Activo</Badge> : <Badge color="red">Inactivo</Badge>}
                          </div>
                          <p className="mt-1 break-all text-xs text-slate-300">{u.email || "Sin email registrado"}</p>
                          <p className="mt-1 text-sm text-white/70">{u.full_name || "Sin nombre completo"}</p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
                          <div className="text-[10px] uppercase tracking-[0.18em] text-white/35">Tipo</div>
                          <div className="mt-1 text-sm font-semibold text-white">{u.perfil?.tipo_registro === "empresa" ? "Empresa" : "Natural"}</div>
                        </div>
                        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
                          <div className="text-[10px] uppercase tracking-[0.18em] text-white/35">Rol</div>
                          <div className="mt-1 text-sm font-semibold text-white">{getRoleSummary(u)}</div>
                        </div>
                        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
                          <div className="text-[10px] uppercase tracking-[0.18em] text-white/35">Planes</div>
                          <div className="mt-1 text-sm font-semibold text-white">{(u.perfil?.planes || []).length}</div>
                        </div>
                        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
                          <div className="text-[10px] uppercase tracking-[0.18em] text-white/35">Creditos</div>
                          <div className="mt-1 text-sm font-semibold text-white">{u.perfil?.consultas_infinitas ? "Ilimitados" : (u.perfil?.consultas_disponibles ?? 0)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 py-4 sm:px-5">
                      {u.perfil?.tipo_registro === "empresa" && (
                        <div className="mb-4 rounded-2xl border border-violet-500/15 bg-violet-500/8 px-4 py-3">
                          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-200/60">Entidad asociada</div>
                          <div className="mt-1 text-sm font-semibold text-white">{u.perfil.nombre_empresa || "Sin nombre de empresa"}</div>
                          <div className="mt-1 text-xs font-mono text-violet-200/70">{u.perfil.nit ? `NIT ${u.perfil.nit}` : "Sin NIT registrado"}</div>
                        </div>
                      )}

                      {(u.perfil?.planes || []).length > 0 ? (
                        <div className="mb-4 flex flex-wrap gap-2">
                          {u.perfil.planes.map((p) => (
                            <span
                              key={p.id}
                              className="rounded-full border border-cyan-400/15 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200"
                            >
                              {formatPlanName(p.nombre)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="mb-4 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 text-xs text-white/40">
                          Este usuario no tiene planes asignados.
                        </div>
                      )}

                      <div className="mb-4 flex flex-wrap gap-2">
                        {u.is_superuser && <Badge color="violet">Super</Badge>}
                        {u.is_staff && !u.is_superuser && <Badge color="cyan">Staff</Badge>}
                        {u.perfil?.consultas_masivas && <Badge color="violet">Masivas activas</Badge>}
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        <ActionBtn className="w-full justify-center" color="teal" onClick={() => handleVerConsultas(u)} title="Ver cedulas consultadas">Consultas</ActionBtn>
                        <ActionBtn className="w-full justify-center" color="cyan" onClick={() => handleOpenConsultasModal(u)}>Creditos</ActionBtn>
                        <ActionBtn
                          className="w-full justify-center"
                          color="green"
                          onClick={() => handleGenerateIndividualPDF(u)}
                          title="Descargar informe individual"
                          disabled={generandoPDFUserId === u.id}
                        >
                          {generandoPDFUserId === u.id ? "Generando..." : "PDF usuario"}
                        </ActionBtn>
                        {u.perfil && <ActionBtn className="w-full justify-center" color="sky" onClick={() => handleEditPlanes(u)}>Planes</ActionBtn>}
                        {u.perfil && (
                          <ActionBtn
                            className="w-full justify-center"
                            color="violet"
                            onClick={() => { setMasivasUser(u); setMasivasPlanId(""); setShowMasivasModal(true); }}
                            title="Asignar consultas masivas al usuario"
                          >
                            {u.perfil.consultas_masivas ? "Masivas on" : "Masivas"}
                          </ActionBtn>
                        )}
                        <ActionBtn className="w-full justify-center" color="indigo" onClick={() => handleEditUser(u)}>Editar</ActionBtn>
                        <ActionBtn className="w-full justify-center" color="red" onClick={() => handleDeleteUser(u)}>Eliminar</ActionBtn>
                        {u.is_active
                          ? <ActionBtn className="w-full justify-center" color="red" onClick={() => handleToggleActive(u)}>Desactivar</ActionBtn>
                          : <ActionBtn className="w-full justify-center" color="green" onClick={() => handleToggleActive(u)}>Activar</ActionBtn>}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="hidden xl:block px-4 py-4">
            <div className="overflow-hidden rounded-[24px] border border-white/8 bg-slate-950/40">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1320px] text-left text-sm">
                  <thead className="bg-[linear-gradient(180deg,rgba(20,35,64,0.98),rgba(16,28,50,0.95))] text-[11px] uppercase tracking-[0.18em] text-slate-300">
                    <tr className="border-b border-white/8">
                      <th className="px-4 py-4 font-semibold">ID</th>
                      <th className="px-4 py-4 font-semibold">Usuario</th>
                      <th className="px-4 py-4 font-semibold">Email</th>
                      <th className="px-4 py-4 font-semibold">Nombre</th>
                      <th className="px-4 py-4 font-semibold">Tipo</th>
                      <th className="px-4 py-4 font-semibold">Empresa / NIT</th>
                      <th className="px-4 py-4 font-semibold">Estado</th>
                      <th className="px-4 py-4 font-semibold">Roles</th>
                      <th className="px-4 py-4 font-semibold">Planes</th>
                      <th className="px-4 py-4 font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {pagedUsers.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-4 py-16 text-center text-sm text-white/30">
                          No se encontraron usuarios con ese filtro.
                        </td>
                      </tr>
                    ) : (
                      pagedUsers.map((u) => (
                        <tr key={u.id} className="align-top transition-colors hover:bg-cyan-500/[0.04]">
                          <td className="px-4 py-4">
                            <span className="rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-xs font-mono text-white/55">
                              #{u.id}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-sm font-black uppercase text-cyan-200">
                                {(u.username || "U").slice(0, 1)}
                              </div>
                              <div className="min-w-0">
                                <div className="truncate text-sm font-bold text-white">{u.username}</div>
                                <div className="mt-1 text-xs text-white/45">{getRoleSummary(u)}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span className="break-all text-xs leading-5 text-slate-300">{u.email || "Sin email"}</span>
                          </td>

                          <td className="px-4 py-4">
                            <span className="text-xs font-medium text-white/80">{u.full_name || "Sin nombre completo"}</span>
                          </td>

                          <td className="px-4 py-4">
                            {u.perfil?.tipo_registro === "empresa"
                              ? <Badge color="violet">Empresa</Badge>
                              : <Badge color="cyan">Natural</Badge>}
                          </td>

                          <td className="px-4 py-4">
                            {u.perfil?.tipo_registro === "empresa" ? (
                              <div className="max-w-[220px] rounded-2xl border border-violet-400/10 bg-violet-500/[0.06] px-3 py-2">
                                <div className="truncate text-xs font-semibold text-white">{u.perfil.nombre_empresa || "Sin nombre"}</div>
                                <div className="mt-1 text-xs font-mono text-violet-200/70">{u.perfil.nit ? `NIT ${u.perfil.nit}` : "Sin NIT"}</div>
                              </div>
                            ) : (
                              <span className="text-xs text-white/25">No aplica</span>
                            )}
                          </td>

                          <td className="px-4 py-4">
                            {u.is_active ? <Badge color="green">Activo</Badge> : <Badge color="red">Inactivo</Badge>}
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex max-w-[180px] flex-wrap gap-1.5">
                              {u.is_superuser && <Badge color="violet">Super</Badge>}
                              {u.is_staff && !u.is_superuser && <Badge color="cyan">Staff</Badge>}
                              {u.perfil?.consultas_masivas && <Badge color="violet">Masivas</Badge>}
                              {!u.is_superuser && !u.is_staff && !u.perfil?.consultas_masivas && (
                                <span className="text-xs text-white/25">Sin distintivos</span>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            {(u.perfil?.planes || []).length > 0 ? (
                              <div className="flex max-w-[220px] flex-wrap gap-1.5">
                                {u.perfil.planes.map((p) => (
                                  <span
                                    key={p.id}
                                    className="rounded-full border border-cyan-400/15 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-200"
                                  >
                                    {formatPlanName(p.nombre)}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs italic text-white/25">Sin plan</span>
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <div className="grid max-w-[280px] grid-cols-2 gap-2">
                              <ActionBtn className="w-full justify-center" color="teal" onClick={() => handleVerConsultas(u)} title="Ver cedulas consultadas">Consultas</ActionBtn>
                              <ActionBtn className="w-full justify-center" color="cyan" onClick={() => handleOpenConsultasModal(u)}>Creditos</ActionBtn>
                              <ActionBtn
                                className="w-full justify-center"
                                color="green"
                                onClick={() => handleGenerateIndividualPDF(u)}
                                title="Descargar informe individual"
                                disabled={generandoPDFUserId === u.id}
                              >
                                {generandoPDFUserId === u.id ? "Generando..." : "PDF usuario"}
                              </ActionBtn>
                              {u.perfil && <ActionBtn className="w-full justify-center" color="sky" onClick={() => handleEditPlanes(u)}>Planes</ActionBtn>}
                              {u.perfil && (
                                <ActionBtn
                                  className="w-full justify-center"
                                  color="violet"
                                  onClick={() => { setMasivasUser(u); setMasivasPlanId(""); setShowMasivasModal(true); }}
                                  title="Asignar consultas masivas al usuario"
                                >
                                  {u.perfil.consultas_masivas ? "Masivas on" : "Masivas"}
                                </ActionBtn>
                              )}
                              <ActionBtn className="w-full justify-center" color="indigo" onClick={() => handleEditUser(u)}>Editar</ActionBtn>
                              <ActionBtn className="w-full justify-center" color="red" onClick={() => handleDeleteUser(u)}>Eliminar</ActionBtn>
                              {u.is_active
                                ? <ActionBtn className="w-full justify-center" color="red" onClick={() => handleToggleActive(u)}>Desactivar</ActionBtn>
                                : <ActionBtn className="w-full justify-center" color="green" onClick={() => handleToggleActive(u)}>Activar</ActionBtn>}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="border-t border-white/8 bg-slate-950/60 px-4 py-4 sm:px-5 lg:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-white/35">
                Mostrando <span className="font-semibold text-white/70">{visibleFrom} - {visibleTo}</span> de <span className="font-semibold text-cyan-200">{filteredUsers.length}</span> usuarios.
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl border border-white/10 bg-slate-800/60 px-3.5 py-2 text-xs font-semibold text-white/70 transition hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Anterior
                </button>
                <span className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3.5 py-2 text-xs font-bold text-cyan-200">
                  Pagina {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="rounded-xl border border-white/10 bg-slate-800/60 px-3.5 py-2 text-xs font-semibold text-white/70 transition hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ── Modal: Soporte técnico ── */}
      {showSoporteModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="flex max-h-[88vh] w-full max-w-7xl flex-col overflow-hidden rounded-[28px] border border-cyan-500/20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-2xl shadow-cyan-950/40">
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h3 className="text-lg font-black text-white">Centro de soporte técnico</h3>
                <p className="mt-1 text-xs text-white/45">
                  Tickets activos: <span className="font-bold text-amber-300">{ticketsSoporteActivos}</span>
                </p>
              </div>
              <button
                onClick={() => {
                  setShowSoporteModal(false);
                  fetchSoporteActivos();
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl font-bold text-white/60 transition hover:bg-white/10 hover:text-white"
                aria-label="Cerrar soporte"
              >
                ×
              </button>
            </div>
            <div className="max-h-[calc(88vh-72px)] overflow-y-auto p-5">
              <AdminSoporte embedded />
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Consultas Masivas ── */}
      {showMasivasModal && masivasUser && (
        <Modal onClose={() => setShowMasivasModal(false)}>
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 flex flex-col gap-4 min-w-[340px] border border-white/10 shadow-2xl">
            <div>
              <h3 className="text-lg font-bold text-white">Consultas Masivas</h3>
              <p className="text-xs text-white/40 mt-0.5">
                Usuario: <span className="text-violet-300">{masivasUser.username}</span>
              </p>
            </div>

            {/* Estado actual */}
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10">
              <span className="text-xs text-white/50">Estado actual:</span>
              {(masivasUser.perfil?.planes_masivas_ids || []).length > 0
                ? <Badge color="violet">✓ Masivas activas</Badge>
                : <Badge color="slate">Sin acceso</Badge>}
            </div>

            {/* Selector de plan + botón Asignar */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-violet-400 font-medium tracking-wide">
                Asignar masivas a un plan
              </label>
              <div className="flex gap-2">
                <select
                  value={masivasPlanId}
                  onChange={(e) => setMasivasPlanId(e.target.value)}
                  className="flex-1 rounded-lg px-3 py-2 border border-slate-600 bg-slate-800/80 text-white focus:outline-none focus:border-violet-500 transition text-sm appearance-none cursor-pointer"
                >
                  <option value="">— Seleccione un plan —</option>
                  {(masivasUser.perfil?.planes || [])
                    .filter((p) => !(masivasUser.perfil?.planes_masivas_ids || []).includes(p.id))
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre.charAt(0).toUpperCase() + p.nombre.slice(1)}
                      </option>
                    ))}
                </select>
                <button
                  disabled={!masivasPlanId}
                  onClick={() => handleAsignarPlanMasivas(masivasUser, masivasPlanId)}
                  className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold text-xs transition whitespace-nowrap"
                >
                  Asignar
                </button>
              </div>
            </div>

            {/* Lista de planes con masivas asignadas */}
            {(masivasUser.perfil?.planes_masivas_ids || []).length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-white/40">Planes con masivas activas:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(masivasUser.perfil?.planes || [])
                    .filter((p) => (masivasUser.perfil?.planes_masivas_ids || []).includes(p.id))
                    .map((p) => (
                      <span key={p.id} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-violet-900/40 text-violet-300 border border-violet-700/30 font-medium">
                        {p.nombre.charAt(0).toUpperCase() + p.nombre.slice(1)}
                        <button
                          onClick={() => handleQuitarPlanMasivas(masivasUser, p.id)}
                          className="ml-0.5 text-violet-400 hover:text-red-400 transition font-bold leading-none"
                          title="Quitar"
                        >×</button>
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Acciones: Desactivar todo + Cancelar */}
            <div className="flex gap-2 pt-1">
              {(masivasUser.perfil?.planes_masivas_ids || []).length > 0 && (
                <button
                  onClick={() => handleDesactivarMasivas(masivasUser)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-sm transition border border-slate-600"
                >
                  Desactivar todas
                </button>
              )}
              <button
                onClick={() => setShowMasivasModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 font-semibold text-sm transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal: Asignar créditos ── */}
      {showConsultasModal && (
        <Modal onClose={() => setShowConsultasModal(false)}>
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 flex flex-col gap-4 min-w-[320px] border border-white/10 shadow-2xl">
            <div>
              <h3 className="text-lg font-bold text-white">Asignar consultas</h3>
              <p className="text-xs text-white/40 mt-0.5">Usuario: <span className="text-cyan-300">{selectedUser?.username}</span></p>
            </div>
            <ModalInput
              label="Número de consultas"
              type="number"
              min={0}
              value={consultasValue}
              onChange={(e) => setConsultasValue(e.target.value === "" ? "" : Number(e.target.value))}
              onBlur={(e) => { if (e.target.value === "") setConsultasValue(0); }}
              disabled={consultasInfinitas}
            />
            <label className="flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2.5 border border-white/10 bg-white/5 hover:bg-white/8 transition">
              <input
                type="checkbox"
                checked={consultasInfinitas}
                onChange={(e) => setConsultasInfinitas(e.target.checked)}
                className="w-4 h-4 accent-cyan-400"
              />
              <span className="text-sm text-white/80 font-medium">Consultas infinitas</span>
            </label>
            <button
              onClick={handleSaveConsultas}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm transition shadow-lg shadow-cyan-500/20"
            >
              Guardar
            </button>
          </div>
        </Modal>
      )}

      {/* ── Modal: Editar usuario ── */}
      {showEditModal && (
        <Modal onClose={() => setShowEditModal(false)}>
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 flex flex-col gap-4 min-w-[320px] border border-white/10 shadow-2xl">
            <div>
              <h3 className="text-lg font-bold text-white">Editar usuario</h3>
              <p className="text-xs text-white/40 mt-0.5">ID: #{selectedUser?.id}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ModalInput label="Usuario"  name="username"   value={editUserData.username}   onChange={(e) => setEditUserData({ ...editUserData, [e.target.name]: e.target.value })} placeholder="usuario" />
              <ModalInput label="Email"    name="email"      value={editUserData.email}      onChange={(e) => setEditUserData({ ...editUserData, [e.target.name]: e.target.value })} placeholder="email@..." />
              <ModalInput label="Nombre"   name="first_name" value={editUserData.first_name} onChange={(e) => setEditUserData({ ...editUserData, [e.target.name]: e.target.value })} placeholder="Nombre" />
              <ModalInput label="Apellido" name="last_name"  value={editUserData.last_name}  onChange={(e) => setEditUserData({ ...editUserData, [e.target.name]: e.target.value })} placeholder="Apellido" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-cyan-400 font-medium tracking-wide">Nueva contraseña <span className="text-white/30">(opcional)</span></label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={editUserData.password}
                  onChange={(e) => setEditUserData({ ...editUserData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full rounded-lg px-3 py-2 pr-10 border border-slate-600 bg-slate-800/80 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
            <button
              onClick={handleSaveEditUser}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm transition shadow-lg shadow-cyan-500/20"
            >
              Guardar cambios
            </button>
          </div>
        </Modal>
      )}

      {/* ── Modal: Editar planes ── */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 flex flex-col gap-4 min-w-[280px] border border-white/10 shadow-2xl">
            <div>
              <h3 className="text-lg font-bold text-white">Editar planes</h3>
              <p className="text-xs text-white/40 mt-0.5">Usuario: <span className="text-cyan-300">{selectedUser?.username}</span></p>
            </div>
            <div className="flex flex-col gap-2">
              {planes.map((plan) => (
                <label key={plan.id} className="flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2.5 border border-white/8 bg-white/4 hover:bg-white/8 transition">
                  <input
                    type="checkbox"
                    checked={selectedPlanes.includes(plan.id)}
                    onChange={(e) =>
                      e.target.checked
                        ? setSelectedPlanes([...selectedPlanes, plan.id])
                        : setSelectedPlanes(selectedPlanes.filter((id) => id !== plan.id))
                    }
                    className="w-4 h-4 accent-cyan-400"
                  />
                  <span className="text-sm text-white/80 font-medium">{plan.nombre}</span>
                </label>
              ))}
            </div>
            <button
              onClick={handleSavePlanes}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm transition shadow-lg shadow-cyan-500/20"
            >
              Guardar cambios
            </button>
          </div>
        </Modal>
      )}

      {/* ── Modal: Ver consultas realizadas ── */}
      {showConsultasRealizadasModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/10 shadow-2xl flex flex-col w-full max-w-3xl max-h-[85vh] overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 shrink-0">
              <div>
                <h3 className="text-base font-bold text-white">
                  Consultas de <span className="text-cyan-400">{consultasRealizadasUser?.username}</span>
                </h3>
                <p className="text-xs text-white/35 mt-0.5">{consultasRealizadasTotal} consulta{consultasRealizadasTotal !== 1 ? "s" : ""} registrada{consultasRealizadasTotal !== 1 ? "s" : ""}</p>
              </div>
              <button
                onClick={() => setShowConsultasRealizadasModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition text-xl font-bold"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto p-4">
              {consultasRealizadasLoading ? (
                <div className="flex justify-center items-center py-16 text-cyan-400">
                  <SpinIcon /><span className="ml-2 text-sm">Cargando...</span>
                </div>
              ) : consultasRealizadas.length === 0 ? (
                <div className="text-center py-16 text-white/30 text-sm">
                  Este usuario no tiene consultas registradas.
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto rounded-xl border border-white/8">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-slate-800/60 text-white/40 uppercase tracking-wider">
                          <th className="px-3 py-2.5 font-semibold">#</th>
                          <th className="px-3 py-2.5 font-semibold">Cédula</th>
                          <th className="px-3 py-2.5 font-semibold">Tipo</th>
                          <th className="px-3 py-2.5 font-semibold">Nombre consultado</th>
                          <th className="px-3 py-2.5 font-semibold">Fecha</th>
                          <th className="px-3 py-2.5 font-semibold">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {consultasRealizadas.map((c, i) => (
                          <tr key={c.consulta_id} className="hover:bg-white/3 transition-colors">
                            <td className="px-3 py-2 text-white/30">{(consultasRealizadasPage - 1) * 20 + i + 1}</td>
                            <td className="px-3 py-2 font-mono font-semibold text-cyan-300">{c.cedula || "—"}</td>
                            <td className="px-3 py-2 text-white/40">{c.tipo_doc || "—"}</td>
                            <td className="px-3 py-2 text-white/80">{c.nombre_completo || "—"}</td>
                            <td className="px-3 py-2 text-white/40 whitespace-nowrap">
                              {c.fecha ? new Date(c.fecha).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                            </td>
                            <td className={`px-3 py-2 font-semibold ${estadoColores[c.estado] || "text-white/50"}`}>
                              {c.estado || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {consultasRealizadasTotal > 20 && (
                    <div className="flex justify-center gap-2 items-center pt-3">
                      <button
                        className="px-3 py-1.5 rounded-lg border border-white/10 bg-slate-800/60 text-white/60 text-xs hover:bg-cyan-900/40 hover:text-cyan-300 disabled:opacity-30 transition"
                        disabled={consultasRealizadasPage === 1}
                        onClick={() => fetchConsultasRealizadas(consultasRealizadasUser.id, consultasRealizadasPage - 1)}
                      >
                        ← Anterior
                      </button>
                      <span className="text-white/40 text-xs px-2">
                        {consultasRealizadasPage} / {Math.ceil(consultasRealizadasTotal / 20)}
                      </span>
                      <button
                        className="px-3 py-1.5 rounded-lg border border-white/10 bg-slate-800/60 text-white/60 text-xs hover:bg-cyan-900/40 hover:text-cyan-300 disabled:opacity-30 transition"
                        disabled={consultasRealizadasPage >= Math.ceil(consultasRealizadasTotal / 20)}
                        onClick={() => fetchConsultasRealizadas(consultasRealizadasUser.id, consultasRealizadasPage + 1)}
                      >
                        Siguiente →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminUsuarios;


