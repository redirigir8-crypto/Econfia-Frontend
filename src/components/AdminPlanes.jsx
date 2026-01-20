import React, { useEffect, useState } from "react";
import Modal from "./Modal";
import Toast from "./Toast";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
const token = localStorage.getItem("token");

// Después de asignar usuarios a un plan, refresca el usuario en localStorage
const refreshUserProfile = async () => {
  try {
    const res = await fetch(`${API_URL}/api/profile-stats/`, {
      headers: { Authorization: `Token ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("user", JSON.stringify(data));
      window.location.reload(); // Opcional: recarga para reflejar cambios en TaskBar
    }
  } catch {}
};

const AdminPlanes = () => {
  const [planes, setPlanes] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
    // Obtener usuarios para el modal
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
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null);
  const token = localStorage.getItem("token");

  const fetchPlanes = async () => {
    try {
      const res = await fetch(`${API_URL}/api/planes/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await res.json();
      setPlanes(data);
    } catch {
      setToast({ type: "error", message: "Error al cargar planes" });
    }
  };

  useEffect(() => {
    fetchPlanes();
  }, [token]);
  // Abrir modal para asignar usuarios a un plan
  const handleAsignar = (plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
    setSelectedUsers([]);
    fetchUsers();
  };

  // Asignar usuarios seleccionados al plan
  const handleAsignarUsuarios = async () => {
    try {
      const res = await fetch(`${API_URL}/api/planes/${selectedPlan.id}/asignar-usuarios/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usuarios: selectedUsers }),
      });
      if (!res.ok) throw new Error();
      setToast({ type: "success", message: "Usuarios asignados al plan" });
      setShowModal(false);
      fetchPlanes();
      refreshUserProfile();
      // Fuerza recarga de la página de usuarios si el admin está en esa ruta
      if (window.location.pathname === "/admin-usuarios") {
        window.location.reload();
      }
    } catch {
      setToast({ type: "error", message: "Error al asignar usuarios" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editId ? "PUT" : "POST";
      const url = editId
        ? `${API_URL}/api/planes/${editId}/`
        : `${API_URL}/api/planes/`;

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre, descripcion }),
      });

      if (!res.ok) throw new Error("Error al guardar");

      setToast({
        type: "success",
        message: editId ? "Plan actualizado" : "Plan creado",
      });

      setNombre("");
      setDescripcion("");
      setEditId(null);
      fetchPlanes();
    } catch {
      setToast({ type: "error", message: "Error al guardar plan" });
    }
  };

  const handleEdit = (plan) => {
    setEditId(plan.id);
    setNombre(plan.nombre);
    setDescripcion(plan.descripcion);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este plan?")) return;

    try {
      const res = await fetch(`${API_URL}/api/planes/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Token ${token}` },
      });

      if (!res.ok) throw new Error();

      setToast({ type: "success", message: "Plan eliminado" });
      fetchPlanes();
    } catch {
      setToast({ type: "error", message: "Error al eliminar plan" });
    }
  };

  return (
        <section className="relative h-screen py-4 md:py-6 pb-20 md:pb-24 overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950">
      <div className="w-full max-w-5xl mx-auto px-2 md:px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 mt-2 text-center drop-shadow-lg">
          Administración de Planes
        </h2>

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
          <form
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row gap-3 mb-6 items-center"
          >
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre"
              required
              className="px-3 py-2 rounded-lg bg-slate-900/80 text-white border border-cyan-700/40 focus:border-cyan-400 outline-none"
            />

            <input
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción"
              required
              className="px-3 py-2 rounded-lg bg-slate-900/80 text-white border border-cyan-700/40 focus:border-cyan-400 outline-none"
            />

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow hover:from-cyan-400 hover:to-blue-400 transition-all"
            >
              {editId ? "Actualizar" : "Crear"}
            </button>

            {editId && (
              <button
                type="button"
                onClick={() => {
                  setEditId(null);
                  setNombre("");
                  setDescripcion("");
                }}
                className="px-4 py-2 rounded-lg bg-slate-700 text-white font-semibold shadow hover:bg-slate-600 transition-all"
              >
                Cancelar
              </button>
            )}
          </form>

          <table className="w-full text-sm md:text-base text-left text-white/90">
            <thead>
              <tr className="bg-gradient-to-r from-cyan-900/60 to-blue-900/60 text-cyan-300">
                <th className="px-3 py-2 font-semibold">ID</th>
                <th className="px-3 py-2 font-semibold">Nombre</th>
                <th className="px-3 py-2 font-semibold">Descripción</th>
                <th className="px-3 py-2 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {planes.map((plan) => (
                <tr
                  key={plan.id}
                  className="border-b border-slate-700/40 hover:bg-cyan-900/20 transition"
                >
                  <td className="px-3 py-2">{plan.id}</td>
                  <td className="px-3 py-2">{plan.nombre}</td>
                  <td className="px-3 py-2">{plan.descripcion}</td>
                  <td className="px-3 py-2 flex gap-2">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow hover:from-cyan-400 hover:to-blue-400 transition-all"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="px-3 py-1 rounded-lg bg-red-600 text-white font-semibold shadow hover:bg-red-500 transition-all"
                    >
                      Eliminar
                    </button>
                    <button
                      onClick={() => handleAsignar(plan)}
                      className="px-3 py-1 rounded-lg bg-purple-600 text-white font-semibold shadow hover:bg-purple-500 transition-all"
                    >
                      Asignar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal para asignar usuarios (fuera de la tabla) */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h3 className="text-xl font-bold mb-4 text-slate-900">Asignar usuarios al plan: <span className="text-cyan-700">{selectedPlan?.nombre}</span></h3>
          <div className="max-h-64 overflow-y-auto mb-4 bg-slate-800/80 rounded-lg p-4 border border-cyan-900/40">
            {users.length === 0 ? (
              <div className="text-center text-slate-400">No hay usuarios disponibles</div>
            ) : (
              users.map((u) => (
                <label key={u.id} className="flex items-center gap-3 mb-3 p-2 rounded-lg bg-slate-900/80 hover:bg-cyan-900/30 transition border border-cyan-700/20">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(u.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers([...selectedUsers, u.id]);
                      } else {
                        setSelectedUsers(selectedUsers.filter((id) => id !== u.id));
                      }
                    }}
                    className="accent-cyan-500 w-5 h-5"
                  />
                  <span className="text-white font-semibold">{u.username}</span>
                  <span className="text-cyan-300">{u.email}</span>
                </label>
              ))
            )}
          </div>
          <button
            onClick={handleAsignarUsuarios}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow hover:from-cyan-400 hover:to-blue-400 transition-all w-full"
          >
            Asignar usuarios
          </button>
        </Modal>
      )}
    </section>
  );
};

export default AdminPlanes;
