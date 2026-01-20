import React, { useEffect, useState } from "react";
import Toast from "./Toast";
import Modal from "./Modal";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const AdminUsuarios = () => {
  const [users, setUsers] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPlanes, setSelectedPlanes] = useState([]);
  const [editUserData, setEditUserData] = useState({ username: '', email: '', first_name: '', last_name: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  // ============================
  // ASIGNAR CONSULTAS AL PERFIL
  // ============================
  const [showConsultasModal, setShowConsultasModal] = useState(false);
  const [consultasValue, setConsultasValue] = useState(0);
  const handleOpenConsultasModal = (user) => {
    setSelectedUser(user);
    setConsultasValue(user.perfil?.consultas_disponibles || 0);
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
        body: JSON.stringify({ consultas_disponibles: consultasValue }),
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
      const res = await fetch(`${API_URL}/api/admin/users/`, {
        method: 'PUT',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...editUserData, id: selectedUser.id }),
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
        <table className="w-full text-sm md:text-base text-left text-white/90">
          <thead>
            <tr className="bg-gradient-to-r from-cyan-900/60 to-blue-900/60 text-cyan-300">
              <th className="px-3 py-2">ID</th>
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
            {users.map((u) => (
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
                  <button
                    onClick={() => handleOpenConsultasModal(u)}
                    className="px-3 py-2 rounded-lg bg-blue-700 text-white"
                  >
                    Consultas
                  </button>
                        {showConsultasModal && (
                          <Modal onClose={() => setShowConsultasModal(false)}>
                            <div className="bg-slate-900 rounded-xl p-6 flex flex-col gap-3 min-w-[300px]">
                              <h3 className="text-xl font-bold mb-4 text-cyan-300 text-center">Asignar consultas al perfil</h3>
                              <input
                                type="number"
                                min={0}
                                value={consultasValue === 0 ? '' : consultasValue}
                                onFocus={e => e.target.select()}
                                onChange={e => {
                                  // Eliminar ceros a la izquierda
                                  let val = e.target.value.replace(/^0+(?!$)/, '');
                                  setConsultasValue(val === '' ? 0 : Number(val));
                                }}
                                className="rounded px-2 py-2 border border-cyan-700 bg-slate-800 text-cyan-100 placeholder-cyan-400 text-center text-lg"
                              />
                              <button onClick={handleSaveConsultas} className="mt-2 px-4 py-2 bg-cyan-600 text-white rounded font-semibold hover:bg-cyan-500 transition">Guardar</button>
                            </div>
                          </Modal>
                        )}
                  {u.perfil && (
                    <button
                      onClick={() => handleEditPlanes(u)}
                      className="px-3 py-2 rounded-lg bg-cyan-600 text-white"
                    >
                      Editar Planes
                    </button>
                  )}
                  <button
                    onClick={() => handleEditUser(u)}
                    className="px-3 py-2 rounded-lg bg-yellow-500 text-white"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteUser(u)}
                    className="px-3 py-2 rounded-lg bg-gray-700 text-white"
                  >
                    Eliminar
                  </button>
                  {!u.is_active ? (
                    <button
                      onClick={() => handleToggleActive(u)}
                      className="px-3 py-2 rounded-lg text-white bg-green-600"
                    >
                      Activar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleActive(u)}
                      className="px-3 py-2 rounded-lg text-white bg-red-600"
                    >
                      Desactivar
                    </button>
                  )}
                </td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
    </section>
  );
};

export default AdminUsuarios;
