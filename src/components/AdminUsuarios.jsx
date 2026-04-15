import React, { useEffect, useState } from "react";
import Toast from "./Toast";
import Modal from "./Modal";
import { generarInformeAdminPDF } from "../pdf/InformeAdminPDF";

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
const ActionBtn = ({ onClick, title, color, children }) => {
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
      className={`px-2.5 py-1.5 rounded-lg border bg-white/5 text-xs font-semibold transition-all duration-200 whitespace-nowrap ${colors[color] || colors.cyan}`}
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


const AdminUsuarios = () => {
  const [filter, setFilter]     = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 6;
  const [orderAsc, setOrderAsc] = useState(true);
  const [users, setUsers]       = useState([]);
  const [planes, setPlanes]     = useState([]);
  const [toast, setToast]       = useState(null);
  const [generandoPDF, setGenerandoPDF] = useState(false);

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
      setToast({ type: "success", message: "Consultas asignadas" });
      setShowConsultasModal(false);
      fetchUsers();
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
      setToast({ type: "success", message: "Usuario actualizado" });
      setShowEditModal(false);
      fetchUsers();
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
      setToast({ type: "success", message: "Planes actualizados" });
      setShowModal(false);
      setSelectedPlanes([]);
      setSelectedUser(null);
      fetchUsers();
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

  // ── Activar / Desactivar ──────────────────────────────────────
  const handleToggleActive = async (user) => {
    try {
      const endpoint = user.is_active
        ? `${API_URL}/api/usuarios/${user.id}/desactivar/`
        : `${API_URL}/api/usuarios/${user.id}/activar/`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Token ${token}`, "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error();
      await fetchUsers();
      setToast({ type: "success", message: `Usuario ${user.is_active ? "desactivado" : "activado"}` });
    } catch {
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

  const estadoColores = {
    completado:    "text-green-400",
    en_proceso:    "text-yellow-400",
    no_encontrado: "text-red-400",
    pendiente:     "text-indigo-400",
  };

  // ── RENDER ─────────────────────────────────────────────────────
  return (
    <section className="p-6 min-h-screen">
      {/* Toast */}
      {toast && (
        <Toast
          {...toast}
          onClose={() => setToast(null)}
          sound={toast.type === "error" ? "/sounds/error-011-352286.mp3" : "/sounds/success-1-6297.mp3"}
        />
      )}

      {/* Encabezado */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-cyan-100 to-blue-300 bg-clip-text text-transparent tracking-tight">
          Administración de Usuarios
        </h2>
        <p className="mt-1 text-sm text-white/50">Gestión completa de cuentas, planes y consultas</p>
      </div>

      {/* Panel principal */}
      <div className="bg-gradient-to-br from-slate-900/90 via-blue-950/20 to-slate-900/90 rounded-2xl border border-white/10 shadow-2xl shadow-cyan-500/5 overflow-hidden">

        {/* Barra de herramientas */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-white/8 bg-slate-800/30">
          {/* Buscador */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/70 pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="text"
              value={filter}
              onChange={(e) => { setFilter(e.target.value); setCurrentPage(1); }}
              placeholder="Buscar por usuario, email, empresa..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/60 text-white/90 border border-white/10 focus:border-cyan-500/60 focus:bg-slate-800 focus:outline-none text-sm transition placeholder-white/30"
              autoComplete="off"
            />
          </div>

          {/* Controles derecha */}
          <div className="flex items-center gap-2">
            {/* Orden */}
            <button
              onClick={() => setOrderAsc((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                orderAsc
                  ? "bg-cyan-900/50 border-cyan-600/40 text-cyan-300 hover:bg-cyan-900/70"
                  : "bg-blue-900/50 border-blue-600/40 text-blue-300 hover:bg-blue-900/70"
              }`}
            >
              {orderAsc ? "ID ▲" : "ID ▼"}
            </button>

            {/* Contador */}
            <span className="px-3 py-2 rounded-xl bg-slate-800/60 border border-white/8 text-xs text-white/50 font-medium select-none">
              {filteredUsers.length} usuarios
            </span>

            {/* PDF */}
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
                        let todas = [];
                        let page  = 1;
                        while (true) {
                          const res  = await fetch(`${API_URL}/api/admin/users/${u.id}/consultas/?page=${page}`, { headers: { Authorization: `Token ${token}` } });
                          const data = await res.json();
                          const resultados = data.results || [];
                          todas = todas.concat(resultados);
                          if (todas.length >= (data.total || 0) || resultados.length === 0) break;
                          page++;
                        }
                        consultasPorUsuario[u.id] = todas;
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
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-wait text-white text-xs font-semibold transition-all shadow-lg shadow-cyan-500/20"
            >
              {generandoPDF ? <><SpinIcon /> Generando...</> : <><DownloadIcon /> Informe PDF</>}
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-white/8 text-xs uppercase tracking-wider text-white/40 bg-slate-800/20">
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Usuario</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Empresa / NIT</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Roles</th>
                <th className="px-4 py-3 font-semibold">Planes</th>
                <th className="px-4 py-3 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pagedUsers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-white/30 text-sm">
                    No se encontraron usuarios con ese filtro.
                  </td>
                </tr>
              ) : pagedUsers.map((u) => (
                <tr key={u.id} className="hover:bg-white/3 transition-colors group">

                  {/* ID */}
                  <td className="px-4 py-3">
                    <span className="text-white/40 text-xs font-mono">#{u.id}</span>
                  </td>

                  {/* Usuario */}
                  <td className="px-4 py-3">
                    <span className="font-semibold text-white/90 text-sm">{u.username}</span>
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3">
                    <span className="text-white/55 text-xs">{u.email || "—"}</span>
                  </td>

                  {/* Nombre */}
                  <td className="px-4 py-3">
                    <span className="text-white/80 text-xs">{u.full_name || "—"}</span>
                  </td>

                  {/* Tipo */}
                  <td className="px-4 py-3">
                    {u.perfil?.tipo_registro === "empresa" ? (
                      <Badge color="violet">🏢 Empresa</Badge>
                    ) : (
                      <Badge color="cyan">👤 Natural</Badge>
                    )}
                  </td>

                  {/* Empresa / NIT */}
                  <td className="px-4 py-3">
                    {u.perfil?.tipo_registro === "empresa" ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-white/85 text-xs font-semibold">
                          {u.perfil.nombre_empresa || <span className="text-white/30 italic">Sin nombre</span>}
                        </span>
                        {u.perfil.nit ? (
                          <span className="text-cyan-400/80 text-xs font-mono">NIT: {u.perfil.nit}</span>
                        ) : (
                          <span className="text-white/25 text-xs italic">Sin NIT</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-white/25 text-xs">—</span>
                    )}
                  </td>

                  {/* Estado */}
                  <td className="px-4 py-3">
                    {u.is_active ? (
                      <Badge color="green">● Activo</Badge>
                    ) : (
                      <Badge color="red">● Inactivo</Badge>
                    )}
                  </td>

                  {/* Roles */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {u.is_superuser && <Badge color="violet">Super</Badge>}
                      {u.is_staff && !u.is_superuser && <Badge color="sky">Staff</Badge>}
                      {!u.is_superuser && !u.is_staff && <span className="text-white/25 text-xs">—</span>}
                    </div>
                  </td>

                  {/* Planes */}
                  <td className="px-4 py-3">
                    {(u.perfil?.planes || []).length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {u.perfil.planes.map((p) => (
                          <span key={p.id} className="px-2 py-0.5 rounded-full text-xs bg-cyan-900/40 text-cyan-300 border border-cyan-700/30 font-medium">
                            {p.nombre.charAt(0).toUpperCase() + p.nombre.slice(1)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-white/25 text-xs italic">Sin plan</span>
                    )}
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <ActionBtn color="teal"   onClick={() => handleVerConsultas(u)}         title="Ver cédulas consultadas">🔍 Consultas</ActionBtn>
                      <ActionBtn color="cyan"   onClick={() => handleOpenConsultasModal(u)}                                  >+ Créditos</ActionBtn>
                      {u.perfil && (
                        <ActionBtn color="sky"  onClick={() => handleEditPlanes(u)}                                          >Planes</ActionBtn>
                      )}
                      <ActionBtn color="indigo" onClick={() => handleEditUser(u)}                                            >Editar</ActionBtn>
                      <ActionBtn color="red"    onClick={() => handleDeleteUser(u)}                                          >Eliminar</ActionBtn>
                      {u.is_active ? (
                        <ActionBtn color="red"    onClick={() => handleToggleActive(u)}>Desactivar</ActionBtn>
                      ) : (
                        <ActionBtn color="green"  onClick={() => handleToggleActive(u)}>Activar</ActionBtn>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/8 bg-slate-800/20">
          <span className="text-xs text-white/30 select-none">
            Mostrando {Math.min((currentPage - 1) * usersPerPage + 1, filteredUsers.length)}–{Math.min(currentPage * usersPerPage, filteredUsers.length)} de {filteredUsers.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-white/10 bg-slate-800/60 text-white/70 text-xs font-semibold hover:bg-cyan-900/40 hover:border-cyan-600/40 hover:text-cyan-300 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              ← Anterior
            </button>
            <span className="px-3 py-1.5 rounded-lg bg-cyan-900/30 border border-cyan-700/30 text-cyan-200 text-xs font-bold select-none">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-white/10 bg-slate-800/60 text-white/70 text-xs font-semibold hover:bg-cyan-900/40 hover:border-cyan-600/40 hover:text-cyan-300 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Siguiente →
            </button>
          </div>
        </div>
      </div>

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
