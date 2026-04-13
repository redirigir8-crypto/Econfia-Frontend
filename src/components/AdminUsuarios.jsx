import React, { useEffect, useState } from "react";
import Toast from "./Toast";
import Modal from "./Modal";
import { generarInformeAdminPDF } from "../pdf/InformeAdminPDF";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const AdminUsuarios = () => {
      // Filtro de búsqueda
      const [filter, setFilter] = useState("");
    // Paginación y orden
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 6;
    const [orderAsc, setOrderAsc] = useState(true);
  const [users, setUsers] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [toast, setToast] = useState(null);
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPlanes, setSelectedPlanes] = useState([]);
  const [editUserData, setEditUserData] = useState({ username: '', email: '', first_name: '', last_name: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  // ============================
  // VER CONSULTAS REALIZADAS
  // ============================
  const [showConsultasRealizadasModal, setShowConsultasRealizadasModal] = useState(false);
  const [consultasRealizadas, setConsultasRealizadas] = useState([]);
  const [consultasRealizadasTotal, setConsultasRealizadasTotal] = useState(0);
  const [consultasRealizadasPage, setConsultasRealizadasPage] = useState(1);
  const [consultasRealizadasLoading, setConsultasRealizadasLoading] = useState(false);
  const [consultasRealizadasUser, setConsultasRealizadasUser] = useState(null);

  const fetchConsultasRealizadas = async (userId, page = 1) => {
    setConsultasRealizadasLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/consultas/?page=${page}`, {
        headers: { Authorization: `Token ${token}` },
      });
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

  // ============================
  // ASIGNAR CONSULTAS AL PERFIL
  // ============================
  const [showConsultasModal, setShowConsultasModal] = useState(false);
  const [consultasValue, setConsultasValue] = useState(0);
  const [consultasInfinitas, setConsultasInfinitas] = useState(false);
  const handleOpenConsultasModal = (user) => {
    setSelectedUser(user);
    setConsultasValue(user.perfil?.consultas_infinitas ? 0 : (user.perfil?.consultas_disponibles || 0));
    setConsultasInfinitas(!!user.perfil?.consultas_infinitas);
    setShowConsultasModal(true);
  };
  const handleSaveConsultas = async () => {
    try {
      const res = await fetch(`${API_URL}/api/perfiles/${selectedUser.perfil.id}/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          consultas_disponibles: consultasValue,
          consultas_infinitas: consultasInfinitas
        }),
      });
      if (!res.ok) throw new Error();
      setToast({ type: 'success', message: 'Consultas asignadas' });
      setShowConsultasModal(false);
      fetchUsers();
    } catch {
      setToast({ type: 'error', message: 'Error al asignar consultas' });
    }
  };
  // EDITAR USUARIO
  // ============================
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditUserData({
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      password: '',
    });
    setShowEditModal(true);
  };

  const handleEditUserChange = (e) => {
    setEditUserData({ ...editUserData, [e.target.name]: e.target.value });
  };

  const handleSaveEditUser = async () => {
    try {
      // Solo enviar password si tiene valor
      const dataToSend = { ...editUserData, id: selectedUser.id };
      if (!dataToSend.password) {
        delete dataToSend.password;
      }
      const res = await fetch(`${API_URL}/api/admin/users/`, {
        method: 'PUT',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });
      if (!res.ok) throw new Error();
      setToast({ type: 'success', message: 'Usuario actualizado' });
      setShowEditModal(false);
      fetchUsers();
    } catch {
      setToast({ type: 'error', message: 'Error al actualizar usuario' });
    }
  };

  // ============================
  // ELIMINAR USUARIO
  // ============================
  const handleDeleteUser = async (user) => {
    if (!window.confirm('¿Seguro que deseas eliminar este usuario?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/users/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: user.id }),
      });
      if (res.status !== 204) throw new Error();
      setToast({ type: 'success', message: 'Usuario eliminado' });
      fetchUsers();
    } catch {
      setToast({ type: 'error', message: 'Error al eliminar usuario' });
    }
  };

  const token = localStorage.getItem("token");

  // ============================
  // CARGAR USUARIOS
  // ============================
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await res.json();
      setUsers(data);
      setCurrentPage(1); // Resetear página al cargar
    } catch {
      setToast({ type: "error", message: "Error al cargar usuarios" });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  // ============================
  // CARGAR PLANES
  // ============================
  useEffect(() => {
    const fetchPlanes = async () => {
      try {
        const res = await fetch(`${API_URL}/api/planes/`, {
          headers: { Authorization: `Token ${token}` },
        });
        const data = await res.json();
        setPlanes(data);
      } catch {}
    };
    fetchPlanes();
  }, [token]);

  // ============================
  // EDITAR PLANES
  // ============================
  const handleEditPlanes = async (user) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${user.id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!res.ok) throw new Error();
      const updatedUser = await res.json();
      setSelectedUser(updatedUser);
      setSelectedPlanes((updatedUser.perfil?.planes || []).map((p) => p.id));
      setShowModal(true);
    } catch {
      setToast({ type: "error", message: "No se pudo cargar el usuario actualizado" });
    }
  };

  // ============================
  // GUARDAR PLANES
  // ============================
  const handleSavePlanes = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/perfiles/${selectedUser.perfil.id}/asignar-planes/`,
        {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ planes: selectedPlanes }),
        }
      );

      if (!res.ok) throw new Error();

      setToast({ type: "success", message: "Planes actualizados" });
      setShowModal(false);
      setSelectedPlanes([]);
      setSelectedUser(null);
      fetchUsers();
      // Actualizar usuario global en localStorage y disparar evento
      const userRes = await fetch(`${API_URL}/api/profile/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (userRes.ok) {
        const updatedUser = await userRes.json();
        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("user-updated"));
      } else {
        setToast({ type: "error", message: "No se pudo cargar el usuario actualizado" });
      }
    } catch {
      setToast({ type: "error", message: "Error al guardar planes" });
    }
  };

  // ============================
  // ACTIVAR / DESACTIVAR
  // ============================
  const handleToggleActive = async (user) => {
    try {
      const endpoint = user.is_active
        ? `${API_URL}/api/usuarios/${user.id}/desactivar/`
        : `${API_URL}/api/usuarios/${user.id}/activar/`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error();

      // Esperar a que fetchUsers termine antes de mostrar el toast
      await fetchUsers();

      setToast({
        type: "success",
        message: `Usuario ${user.is_active ? "desactivado" : "activado"}`,
      });
    } catch {
      setToast({
        type: "error",
        message: "Error al cambiar estado del usuario",
      });
    }
  };

  // ============================
  // RENDER
  // ============================
  return (
    <section className="p-6">
    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 mt-2 text-center drop-shadow-lg">
          Administración de Usuarios
    </h2>
    {/* Tabla de usuarios con controles integrados */}
      {toast && (
        <Toast
          {...toast}
          onClose={() => setToast(null)}
          sound={
            toast.type === "error"
              ? "/sounds/error-011-352286.mp3"
              : "/sounds/success-1-6297.mp3"
          }
        />
      )}

      <div className="bg-slate-800/80 rounded-2xl shadow-2xl border border-cyan-900/40 p-6 mb-8 overflow-x-auto">
            {/* Filtro de búsqueda global alineado a la izquierda con ícono de lupa */}
            <div className="w-full flex items-center justify-between mb-6 animate-fade-in gap-4 flex-wrap">
              <div className="relative w-full max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4-4m0 0A7 7 0 104 4a7 7 0 0013 13z" /></svg>
                </span>
                <input
                  id="user-filter"
                  type="text"
                  value={filter}
                  onChange={e => { setFilter(e.target.value); setCurrentPage(1); }}
                  placeholder="Buscar por cualquier dato..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-900/80 text-cyan-100 border border-cyan-700/40 focus:border-cyan-400 outline-none text-base shadow"
                  autoComplete="off"
                />
              </div>
              <button
                onClick={async () => {
                  setGenerandoPDF(true);
                  try {
                    const adminName = localStorage.getItem("username") || "Administrador";
                    // Recargar usuarios frescos del servidor antes de generar el PDF
                    let usersParaPDF = users;
                    try {
                      const resUsers = await fetch(`${API_URL}/api/admin/users/`, {
                        headers: { Authorization: `Token ${token}` },
                      });
                      if (resUsers.ok) usersParaPDF = await resUsers.json();
                    } catch {}
                    // Cargar TODAS las consultas de cada usuario (todas las páginas)
                    const consultasPorUsuario = {};
                    await Promise.all(
                      usersParaPDF.map(async (u) => {
                        try {
                          let todas = [];
                          let page = 1;
                          while (true) {
                            const res = await fetch(`${API_URL}/api/admin/users/${u.id}/consultas/?page=${page}`, {
                              headers: { Authorization: `Token ${token}` },
                            });
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
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 disabled:cursor-wait text-white font-semibold rounded-lg transition whitespace-nowrap shadow"
              >
                {generandoPDF ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Generando...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Generar informe PDF
                  </>
                )}
              </button>
            </div>
        <table className="w-full text-sm md:text-base text-left text-white/90">
          <thead>
            <tr className="bg-gradient-to-r from-cyan-900/60 to-blue-900/60 text-cyan-300">
              <th className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <span>ID</span>
                  <button
                    className={`px-1.5 py-0.5 rounded font-bold text-xs border border-cyan-700/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-all
                      ${orderAsc ? 'bg-cyan-600/80 text-white hover:bg-cyan-500/90' : 'bg-blue-700/80 text-white hover:bg-blue-600/90'}`}
                    style={{lineHeight:'1'}}
                    onClick={() => setOrderAsc((v) => !v)}
                  >
                    {orderAsc ? <span>▲</span> : <span>▼</span>}
                  </button>
                </div>
              </th>
              <th className="px-3 py-2">Usuario</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Activo</th>
              <th className="px-3 py-2">Staff</th>
              <th className="px-3 py-2">Superuser</th>
              <th className="px-3 py-2">Planes</th>
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {/* Ordenar y paginar usuarios */}
            {users
              .filter(u => {
                if (!filter.trim()) return true;
                const val = filter.trim().toLowerCase();
                // Buscar en todos los campos visibles
                return (
                  String(u.id).includes(val) ||
                  (u.username && u.username.toLowerCase().includes(val)) ||
                  (u.email && u.email.toLowerCase().includes(val)) ||
                  (u.full_name && u.full_name.toLowerCase().includes(val)) ||
                  (u.is_active ? "sí" : "no").includes(val) ||
                  (u.is_staff ? "sí" : "no").includes(val) ||
                  (u.is_superuser ? "sí" : "no").includes(val) ||
                  ((u.perfil?.planes || []).map(p => p.nombre.toLowerCase()).join(", ").includes(val))
                );
              })
              .slice()
              .sort((a, b) => orderAsc ? a.id - b.id : b.id - a.id)
              .slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage)
              .map((u) => (
              <tr
                key={u.id}
                className="border-b border-slate-700/40 hover:bg-cyan-900/20 transition"
              >
                <td className="px-3 py-2">{u.id}</td>
                <td className="px-3 py-2">{u.username}</td>
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2">{u.full_name}</td>
                <td className="px-3 py-2">{u.is_active ? "Sí" : "No"}</td>
                <td className="px-3 py-2">{u.is_staff ? "Sí" : "No"}</td>
                <td className="px-3 py-2">{u.is_superuser ? "Sí" : "No"}</td>
                <td className="px-3 py-2">
                  {(u.perfil?.planes || []).length > 0 ? (
                    <span className="text-cyan-200 font-semibold text-xs">
                      {u.perfil.planes
                        .map(
                          (p) =>
                            p.nombre.charAt(0).toUpperCase() +
                            p.nombre.slice(1)
                        )
                        .join(", ")}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs">Sin plan</span>
                  )}
                </td>
                <td className="px-3 py-2 flex gap-2 flex-wrap">
                  <div className="p-[1.5px] rounded-lg bg-gradient-to-r from-transparent via-teal-500/40 to-transparent">
                  <button
                    onClick={() => handleVerConsultas(u)}
                    className="px-3 py-2 rounded-lg bg-slate-700/50 text-white hover:bg-slate-700/100 transition shadow-none hover:shadow-[0_0_12px_2px_rgba(20,184,166,0.7)]"
                    title="Ver cédulas y nombres consultados"
                  >
                    🔍 Ver consultas
                  </button>
                  </div>
                  <div className="p-[1.5px] rounded-lg bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent">
                  <button
                    onClick={() => handleOpenConsultasModal(u)}
                    className="px-3 py-2 rounded-lg bg-slate-700/50 text-white hover:bg-slate-700/100 transition shadow-none hover:shadow-[0_0_12px_2px_rgba(21,94,117,0.7)]"
                  >
                    Consultas
                  </button>
                  </div>
                  {u.perfil && (
                    <div className="p-[1.5px] rounded-lg bg-gradient-to-r from-transparent via-sky-500/40 to-transparent">
                    <button
                      onClick={() => handleEditPlanes(u)}
                      className="px-3 py-2 rounded-lg bg-slate-600/50 text-white hover:bg-slate-600/100 transition shadow-none hover:shadow-[0_0_12px_2px_rgba(2,132,199,0.7)]"
                    >
                      Editar Planes
                    </button>
                    </div>
                  )}
                  <div className="p-[1.5px] rounded-lg bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent">
                  <button
                    onClick={() => handleEditUser(u)}
                    className="px-3 py-2 rounded-lg bg-slate-700/50 text-white hover:bg-slate-700/100 transition shadow-none hover:shadow-[0_0_12px_2px_rgba(67,56,202,0.7)]"
                  >
                    Editar
                  </button>
                  </div>
                  <div className="p-[1.5px] rounded-lg bg-gradient-to-r from-transparent via-purple-500/40 to-transparent">
                  <button
                    onClick={() => handleDeleteUser(u)}
                    className="px-3 py-2 rounded-lg bg-slate-700/50 text-white hover:bg-slate-700/100 transition shadow-none hover:shadow-[0_0_12px_2px_rgba(147,51,234,0.7)]"
                  >
                    Eliminar
                  </button>
                  </div>
                  {!u.is_active ? (
                    <div className="p-[1.5px] rounded-lg bg-gradient-to-r from-transparent via-green-500/40 to-transparent">
                    <button
                      onClick={() => handleToggleActive(u)}
                      className="px-3 py-2 rounded-lg text-white bg-slate-600/60 hover:bg-slate-600/80 transition shadow-none hover:shadow-[0_0_12px_2px_rgba(22,163,74,0.7)]"
                    >
                      Activar
                    </button>
                    </div>
                  ) : (
                    <div className="p-[1.5px] rounded-lg bg-gradient-to-r from-transparent via-red-500/40 to-transparent">
                    <button
                      onClick={() => handleToggleActive(u)}
                      className="px-3 py-2 rounded-lg text-white bg-slate-600/50 hover:bg-slate-600/100 transition shadow-none hover:shadow-[0_0_12px_2px_rgba(220,38,38,0.7)]"
                    >
                      Desactivar
                    </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Paginación centrada debajo de la tabla */}
        <div className="flex justify-center mt-6">
          <div className="flex gap-2 items-center bg-gradient-to-r from-cyan-900/70 to-blue-900/70 px-6 py-2 rounded-xl shadow">
            <button
              className="px-3 py-1 rounded-lg font-semibold bg-slate-700/70 text-white hover:bg-cyan-700/80 transition-all shadow-sm border border-cyan-700/30 disabled:opacity-40"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              ◀ Anterior
            </button>
            <span className="text-cyan-200 font-semibold tracking-wide text-base px-2 select-none">
              Página <span className="text-white drop-shadow">{currentPage}</span> / <span className="text-cyan-300">{Math.max(1, Math.ceil(users.length / usersPerPage))}</span>
            </span>
            <button
              className="px-3 py-1 rounded-lg font-semibold bg-slate-700/70 text-white hover:bg-cyan-700/80 transition-all shadow-sm border border-cyan-700/30 disabled:opacity-40"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage >= Math.ceil(users.length / usersPerPage)}
            >
              Siguiente ▶
            </button>
          </div>
        </div>
      </div>

      {/* Modales fuera de la tabla para evitar problemas de nesting */}
      {showConsultasModal && (
        <Modal onClose={() => setShowConsultasModal(false)}>
          <div className="bg-slate-900 rounded-xl p-6 flex flex-col gap-3 min-w-[320px]">
            <h3 className="text-xl font-bold mb-2 text-cyan-300 text-center">Asignar consultas al perfil</h3>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-cyan-400 font-medium">Número de consultas</label>
              <input
                type="number"
                min={0}
                value={consultasValue}
                onChange={e => setConsultasValue(e.target.value === '' ? '' : Number(e.target.value))}
                onBlur={e => { if (e.target.value === '') setConsultasValue(0); }}
                className="rounded px-3 py-2 border border-cyan-700 bg-slate-800 text-cyan-100 placeholder-cyan-400 focus:outline-none focus:border-cyan-400 transition disabled:opacity-40"
                disabled={consultasInfinitas}
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer rounded px-3 py-2 border border-cyan-700 bg-slate-800 hover:border-cyan-400 transition">
              <input
                type="checkbox"
                checked={consultasInfinitas}
                onChange={e => setConsultasInfinitas(e.target.checked)}
                className="w-4 h-4 accent-cyan-400"
              />
              <span className="text-sm text-cyan-100 font-medium">Consultas infinitas (activar/desactivar)</span>
            </label>
            <button
              className="mt-2 px-4 py-2 bg-cyan-600 text-white rounded font-semibold hover:bg-cyan-500 transition"
              onClick={handleSaveConsultas}
            >Guardar</button>
          </div>
        </Modal>
      )}

      {showEditModal && (
        <Modal onClose={() => setShowEditModal(false)}>
          <div className="bg-slate-900 rounded-xl p-6 flex flex-col gap-3 min-w-[300px]">
            <h3 className="text-xl font-bold mb-4 text-cyan-300 text-center">Editar usuario</h3>
            <input name="username" placeholder="Usuario" value={editUserData.username} onChange={handleEditUserChange} className="rounded px-2 py-2 border border-cyan-700 bg-slate-800 text-cyan-100 placeholder-cyan-400" />
            <input name="email" placeholder="Email" value={editUserData.email} onChange={handleEditUserChange} className="rounded px-2 py-2 border border-cyan-700 bg-slate-800 text-cyan-100 placeholder-cyan-400" />
            <input name="first_name" placeholder="Nombre" value={editUserData.first_name} onChange={handleEditUserChange} className="rounded px-2 py-2 border border-cyan-700 bg-slate-800 text-cyan-100 placeholder-cyan-400" />
            <input name="last_name" placeholder="Apellido" value={editUserData.last_name} onChange={handleEditUserChange} className="rounded px-2 py-2 border border-cyan-700 bg-slate-800 text-cyan-100 placeholder-cyan-400" />
            <div className="relative flex items-center">
              <input
                name="password"
                placeholder="Nueva contraseña (opcional)"
                type={showPassword ? "text" : "password"}
                value={editUserData.password}
                onChange={handleEditUserChange}
                className="rounded px-2 py-2 border border-cyan-700 bg-slate-800 text-cyan-100 placeholder-cyan-400 w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-cyan-300 hover:text-cyan-100"
                tabIndex={-1}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575m1.875-2.25A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.403 3.22-1.125 4.575m-1.875 2.25A9.956 9.956 0 0112 21c-2.21 0-4.267-.72-5.925-1.95M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-9.197 4.803A9.956 9.956 0 0112 21c2.21 0 4.267-.72 5.925-1.95M21 12c0 1.657-.403 3.22-1.125 4.575m-1.875 2.25A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575m1.875-2.25A9.956 9.956 0 0112 3c2.21 0 4.267.72 5.925 1.95" /></svg>
                )}
              </button>
            </div>
            <button onClick={handleSaveEditUser} className="mt-2 px-4 py-2 bg-cyan-600 text-white rounded font-semibold hover:bg-cyan-500 transition">Guardar cambios</button>
          </div>
        </Modal>
      )}

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h3 className="text-xl font-bold mb-4">
            Editar planes de {selectedUser?.username}
          </h3>

          {planes.map((plan) => (
            <label key={plan.id} className="flex gap-2 mb-2">
              <input
                type="checkbox"
                checked={selectedPlanes.includes(plan.id)}
                onChange={(e) =>
                  e.target.checked
                    ? setSelectedPlanes([...selectedPlanes, plan.id])
                    : setSelectedPlanes(
                        selectedPlanes.filter((id) => id !== plan.id)
                      )
                }
              />
              {plan.nombre}
            </label>
          ))}

          <button
            onClick={handleSavePlanes}
            className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded"
          >
            Guardar cambios
          </button>
        </Modal>
      )}

      {/* Modal: Ver consultas realizadas */}
      {showConsultasRealizadasModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
          <div className="bg-slate-900 rounded-xl shadow-2xl flex flex-col w-full max-w-3xl max-h-[80vh] relative overflow-hidden">
            <button
              onClick={() => setShowConsultasRealizadasModal(false)}
              className="absolute top-2 right-3 text-slate-400 hover:text-white text-2xl font-bold z-10"
              aria-label="Cerrar"
            >×</button>
            <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-slate-700 shrink-0">
              <h3 className="text-base font-bold text-cyan-300">
                Consultas de <span className="text-white">{consultasRealizadasUser?.username}</span>
              </h3>
              <span className="text-slate-400 text-xs mr-6">{consultasRealizadasTotal} consulta{consultasRealizadasTotal !== 1 ? "s" : ""}</span>
            </div>

            <div className="flex flex-col gap-3 p-3 overflow-y-auto flex-1">
            {consultasRealizadasLoading ? (
              <div className="text-cyan-400 text-center py-8">Cargando...</div>
            ) : consultasRealizadas.length === 0 ? (
              <div className="text-slate-400 text-center py-8">Este usuario no tiene consultas registradas.</div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-lg border border-slate-700">
                  <table className="w-full text-xs text-left text-white/90">
                    <thead>
                      <tr className="bg-slate-800 text-cyan-300 uppercase">
                        <th className="px-2 py-1.5">#</th>
                        <th className="px-2 py-1.5">Cédula</th>
                        <th className="px-2 py-1.5">Tipo</th>
                        <th className="px-2 py-1.5">Nombre consultado</th>
                        <th className="px-2 py-1.5">Fecha</th>
                        <th className="px-2 py-1.5">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consultasRealizadas.map((c, i) => {
                        const estadoColores = {
                          completado: "text-green-400",
                          en_proceso: "text-yellow-400",
                          no_encontrado: "text-red-400",
                          pendiente: "text-indigo-400",
                        };
                        return (
                          <tr key={c.consulta_id} className="border-t border-slate-700/50 hover:bg-slate-800/60 transition">
                            <td className="px-2 py-1.5 text-slate-500">{(consultasRealizadasPage - 1) * 20 + i + 1}</td>
                            <td className="px-2 py-1.5 font-mono font-semibold text-cyan-200">{c.cedula || "—"}</td>
                            <td className="px-2 py-1.5 text-slate-400">{c.tipo_doc || "—"}</td>
                            <td className="px-2 py-1.5">{c.nombre_completo || "—"}</td>
                            <td className="px-2 py-1.5 text-slate-400 whitespace-nowrap">
                              {c.fecha ? new Date(c.fecha).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                            </td>
                            <td className={`px-2 py-1.5 font-semibold ${estadoColores[c.estado] || "text-slate-300"}`}>
                              {c.estado || "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {consultasRealizadasTotal > 20 && (
                  <div className="flex justify-center gap-3 items-center py-1">
                    <button
                      className="px-3 py-1 rounded bg-slate-700 text-white text-xs hover:bg-cyan-700 transition disabled:opacity-40"
                      disabled={consultasRealizadasPage === 1}
                      onClick={() => fetchConsultasRealizadas(consultasRealizadasUser.id, consultasRealizadasPage - 1)}
                    >◀ Anterior</button>
                    <span className="text-cyan-200 text-xs">
                      Página {consultasRealizadasPage} / {Math.ceil(consultasRealizadasTotal / 20)}
                    </span>
                    <button
                      className="px-3 py-1 rounded bg-slate-700 text-white text-xs hover:bg-cyan-700 transition disabled:opacity-40"
                      disabled={consultasRealizadasPage >= Math.ceil(consultasRealizadasTotal / 20)}
                      onClick={() => fetchConsultasRealizadas(consultasRealizadasUser.id, consultasRealizadasPage + 1)}
                    >Siguiente ▶</button>
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
