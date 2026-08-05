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
      if (window.location.pathname === "/7b3f9d1e") {
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
    <section className="relative min-h-screen overflow-hidden bg-transparent px-3 py-4 pb-28 sm:px-5 md:py-6">
      <div className="pointer-events-none absolute left-[16%] top-[18%] h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[18%] top-[28%] h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="mb-5 overflow-hidden rounded-[26px] border border-line/15 bg-surface/90 px-5 py-5 shadow-2xl shadow-black/5 backdrop-blur-xl md:px-7">
          <div className="inline-flex rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-brand">
            Centro administrativo
          </div>
          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-content md:text-4xl">
                Administración de Planes
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Crea, edita y asigna planes operativos a usuarios desde una vista centralizada.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-2xl border border-line/15 bg-surface-2/70 px-5 py-3">
                <div className="text-2xl font-black text-content">{planes.length}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Planes</div>
              </div>
              <div className="rounded-2xl border border-line/15 bg-surface-2/70 px-5 py-3">
                <div className="text-2xl font-black text-brand">{editId ? "Edit" : "New"}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Modo</div>
              </div>
            </div>
          </div>
        </div>

        {toast && (
          <Toast
            {...toast}
            onClose={() => setToast(null)}
            sound={
              toast.type === "error"
                ? "/sounds/error-011-352286.mp3"
                : "/sounds/econfia-bot/econfia-1.wav"
            }
          />
        )}

        <div className="mb-8 overflow-hidden rounded-[28px] border border-line/15 bg-surface/90 shadow-2xl shadow-black/5 backdrop-blur-xl">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 border-b border-line/15 bg-surface-2/60 px-5 py-5 md:flex-row md:items-center"
          >
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre"
              required
              className="w-full rounded-xl border border-line/15 bg-surface px-4 py-3 text-sm text-content outline-none transition placeholder:text-muted/70 focus:border-brand/50 md:max-w-xs"
            />

            <input
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción"
              required
              className="w-full rounded-xl border border-line/15 bg-surface px-4 py-3 text-sm text-content outline-none transition placeholder:text-muted/70 focus:border-brand/50 md:flex-1"
            />

            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:to-blue-400"
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
                className="rounded-xl border border-line/15 bg-surface px-5 py-3 text-sm font-bold text-content transition-all hover:bg-surface-2"
              >
                Cancelar
              </button>
            )}
          </form>

          <div className="overflow-x-auto px-5 py-5">
          <table className="w-full min-w-[780px] text-left text-sm text-content">
            <thead>
              <tr className="border-b border-line/15 bg-surface-2/80 text-[11px] uppercase tracking-[0.18em] text-muted">
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
                  className="border-b border-line/10 transition hover:bg-cyan-500/[0.06]"
                >
                  <td className="px-3 py-3 font-mono text-muted">#{plan.id}</td>
                  <td className="px-3 py-3 font-bold text-content">{plan.nombre}</td>
                  <td className="px-3 py-3 text-muted">{plan.descripcion || "Sin descripción"}</td>
                  <td className="flex gap-2 px-3 py-3">

                    <button
                      onClick={() => handleEdit(plan)}
                      className="rounded-lg border border-cyan-400/25 bg-cyan-500/10 px-3 py-1.5 font-semibold text-brand transition-all hover:bg-cyan-500/20"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-1.5 font-semibold text-red-600 transition-all hover:bg-red-500/20 dark:text-red-300"
                    >
                      Eliminar
                    </button>

                    <button
                      onClick={() => handleAsignar(plan)}
                      className="rounded-lg border border-violet-400/25 bg-violet-500/10 px-3 py-1.5 font-semibold text-violet-600 transition-all hover:bg-violet-500/20 dark:text-violet-300"
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
      </div>
      {/* Modal para asignar usuarios (fuera de la tabla) */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h3 className="mb-4 text-xl font-bold text-content">Asignar usuarios al plan: <span className="text-brand">{selectedPlan?.nombre}</span></h3>
          <div className="mb-4 max-h-64 overflow-y-auto rounded-xl border border-line/15 bg-surface-2/70 p-4">
            {users.length === 0 ? (
              <div className="text-center text-muted">No hay usuarios disponibles</div>
            ) : (
              users.map((u) => (
                <label key={u.id} className="mb-3 flex items-center gap-3 rounded-lg border border-line/15 bg-surface p-2 transition hover:border-brand/30 hover:bg-surface-2">
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
                  <span className="font-semibold text-content">{u.username}</span>
                  <span className="text-brand">{u.email}</span>
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
