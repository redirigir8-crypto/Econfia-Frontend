import React, { useEffect, useState } from "react";
import Modal from "./Modal";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const AdminFuentes = () => {
  const token = localStorage.getItem("token");

  const [fuentes, setFuentes] = useState([]);
  const [tipos, setTipos] = useState([]);

  const [filterNombre, setFilterNombre] = useState("");
  const [filterTipo, setFilterTipo] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({
    nombre: "",
    nombre_pila: "",
    tipo: "",
  });

  const [newFuente, setNewFuente] = useState({
    nombre: "",
    nombre_pila: "",
    tipo: "",
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState("");

  /* =========================
     FETCH INICIAL
  ========================= */
  useEffect(() => {
    if (!token) {
      setError("No autenticado");
      return;
    }

    const fetchData = async () => {
      try {
        const [fRes, tRes] = await Promise.all([
          fetch(`${API_URL}/api/admin/fuentes/`, {
            headers: { Authorization: `Token ${token}` },
          }),
          fetch(`${API_URL}/api/admin/tipos-fuente/`, {
            headers: { Authorization: `Token ${token}` },
          }),
        ]);

        if (!fRes.ok || !tRes.ok) throw new Error("Error cargando datos");

        setFuentes(await fRes.json());
        setTipos(await tRes.json());
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, [token]);

  /* =========================
     FILTRO + PAGINACIÓN
  ========================= */
  const filteredFuentes = fuentes.filter(
    (f) =>
      (!filterNombre ||
        f.nombre.toLowerCase().includes(filterNombre.toLowerCase())) &&
      (!filterTipo || (f.tipo.id || f.tipo) === parseInt(filterTipo))
  );

  const totalPages = Math.ceil(filteredFuentes.length / pageSize);
  const pageFuentes = filteredFuentes.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  /* =========================
     EDITAR
  ========================= */
  const startEdit = (f) => {
    setEditId(f.id);
    setEditData({
      nombre: f.nombre,
      nombre_pila: f.nombre_pila,
      tipo: f.tipo.id || f.tipo,
    });
  };

  const saveEdit = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/admin/fuentes/${editId}/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...editData,
            tipo: parseInt(editData.tipo),
          }),
        }
      );

      if (!res.ok) throw new Error(await res.text());

      const updated = await res.json();
      setFuentes(fuentes.map((f) => (f.id === editId ? updated : f)));
      setEditId(null);
      setToast({ type: "success", message: "Fuente actualizada" });
    } catch (err) {
      setError(err.message);
    }
  };

  /* =========================
     CREAR
  ========================= */
  const createFuente = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/fuentes/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newFuente,
          tipo: parseInt(newFuente.tipo),
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const created = await res.json();
      setFuentes([...fuentes, created]);
      setNewFuente({ nombre: "", nombre_pila: "", tipo: "" });
      setShowCreateModal(false);
      setToast({ type: "success", message: "Fuente creada" });
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 py-8">
      <div className="max-w-6xl mx-auto px-4">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-bold text-white">
            Administración de Fuentes
          </h2>

          <div className="p-[1px] rounded-xl bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-white font-semibold
              hover:shadow-[0_0_14px_3px_rgba(34,211,238,0.6)] transition-all"
            >
              Crear nueva fuente
            </button>
          </div>
        </div>

        {/* CONTENEDOR CRUD */}
        <div className="bg-slate-800/80 rounded-2xl border border-cyan-900/40 p-6 shadow-2xl">

          {/* FILTROS */}
          <div className="flex gap-4 mb-4">
            <input
              placeholder="Filtrar por nombre..."
              value={filterNombre}
              onChange={(e) => setFilterNombre(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg bg-slate-900 border border-cyan-700/40 text-white"
            />
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="px-4 py-2 rounded-lg bg-slate-900 border border-cyan-700/40 text-white"
            >
              <option value="">Todos</option>
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* TABLA */}
          <table className="w-full text-white text-sm">
            <thead>
              <tr className="bg-cyan-900/40 text-cyan-300">
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Nombre</th>
                <th className="px-3 py-2">Nombre Pila</th>
                <th className="px-3 py-2">Tipo</th>
                <th className="px-3 py-2">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {pageFuentes.map((f) => (
                <tr
                  key={f.id}
                  className="border-b border-slate-700/40 hover:bg-cyan-900/20"
                >
                  <td className="px-3 py-2">{f.id}</td>

                  <td className="px-3 py-2">
                    {editId === f.id ? (
                      <input
                        value={editData.nombre}
                        onChange={(e) =>
                          setEditData({ ...editData, nombre: e.target.value })
                        }
                        className="w-full px-2 py-1 rounded bg-slate-900 border border-cyan-700/40"
                      />
                    ) : (
                      f.nombre
                    )}
                  </td>

                  <td className="px-3 py-2">
                    {editId === f.id ? (
                      <input
                        value={editData.nombre_pila}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            nombre_pila: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1 rounded bg-slate-900 border border-cyan-700/40"
                      />
                    ) : (
                      f.nombre_pila
                    )}
                  </td>

                  <td className="px-3 py-2">
                    {editId === f.id ? (
                      <select
                        value={editData.tipo}
                        onChange={(e) =>
                          setEditData({ ...editData, tipo: e.target.value })
                        }
                        className="w-full px-2 py-1 rounded bg-slate-900 border border-cyan-700/40"
                      >
                        {tipos.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.nombre}
                          </option>
                        ))}
                      </select>
                    ) : (
                      tipos.find(
                        (t) => t.id === (f.tipo.id || f.tipo)
                      )?.nombre
                    )}
                  </td>

                  <td className="px-3 py-2">
                    {editId === f.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={saveEdit}
                          className="px-3 py-1 rounded-lg bg-green-600/80 text-white font-semibold"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          className="px-3 py-1 rounded-lg bg-slate-600 text-white font-semibold"
                        >
                          Cancelar
                        </button>
                      </div>
                      ) : (
                    <div className="inline-block w-fit p-[1px] rounded-lg 
                        bg-gradient-to-r from-transparent via-purple-500/60 to-transparent">
                      <button
                        onClick={() => startEdit(f)}
                        className="px-3 py-1 rounded-lg bg-slate-700 text-white font-semibold
                        hover:shadow-[0_0_12px_2px_rgba(147,51,234,0.7)] transition-all"
                      >
                        Editar
                      </button>
                    </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* PAGINACIÓN */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded bg-slate-700 text-white disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="text-cyan-300 font-semibold">
              Página {currentPage} de {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 rounded bg-slate-700 text-white disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>

        {/* MODAL CREAR */}
        {showCreateModal && (
          <Modal onClose={() => setShowCreateModal(false)}>
            <h3 className="text-lg font-bold mb-4">Crear nueva fuente</h3>
            <div className="flex flex-col gap-3">
              <input
                placeholder="Nombre"
                value={newFuente.nombre}
                onChange={(e) =>
                  setNewFuente({ ...newFuente, nombre: e.target.value })
                }
                className="px-3 py-2 border rounded"
              />
              <input
                placeholder="Nombre pila"
                value={newFuente.nombre_pila}
                onChange={(e) =>
                  setNewFuente({
                    ...newFuente,
                    nombre_pila: e.target.value,
                  })
                }
                className="px-3 py-2 border rounded"
              />
              <select
                value={newFuente.tipo}
                onChange={(e) =>
                  setNewFuente({ ...newFuente, tipo: e.target.value })
                }
                className="px-3 py-2 border rounded"
              >
                <option value="">Tipo...</option>
                {tipos.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
              <button
                onClick={createFuente}
                className="px-4 py-2 rounded bg-cyan-600 text-white font-semibold"
              >
                Crear
              </button>
            </div>
          </Modal>
        )}
      </div>
    </section>
  );
};

export default AdminFuentes;
