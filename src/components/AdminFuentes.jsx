
import React, { useEffect, useState } from "react";
import Modal from "./Modal";
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const AdminFuentes = () => {
  const [fuentes, setFuentes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [tipos, setTipos] = useState([]);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ nombre: "", nombre_pila: "", tipo: "" });
  const [newTipo, setNewTipo] = useState({ nombre: "", peso: 1, probabilidad: 1 });
  const [newFuente, setNewFuente] = useState({ nombre: "", nombre_pila: "", tipo: "" });
  const [toast, setToast] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const token = localStorage.getItem("token");

  // Cargar fuentes y tipos
  useEffect(() => {
    if (!token) {
      setError("No autenticado. Inicia sesión como admin.");
      return;
    }
    const fetchAll = async () => {
      try {
        const resF = await fetch(`${API_URL}/api/admin/fuentes/`, {
          headers: { "Authorization": `Token ${token}` }
        });
        if (!resF.ok) throw new Error(await resF.text());
        setFuentes(await resF.json());
        const resT = await fetch(`${API_URL}/api/admin/tipos-fuente/`, {
          headers: { "Authorization": `Token ${token}` }
        });
        if (!resT.ok) throw new Error(await resT.text());
        setTipos(await resT.json());
      } catch (err) {
        setError("Error: " + err.message);
      }
    };
    fetchAll();
  }, [token]);



  const startEdit = (fuente) => {
    setEditId(fuente.id);
    setEditData({
      nombre: fuente.nombre,
      nombre_pila: fuente.nombre_pila,
      tipo: fuente.tipo.id || fuente.tipo
    });
  };



  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };
  const handleNewFuenteChange = (e) => {
    setNewFuente({ ...newFuente, [e.target.name]: e.target.value });
  };

  const handleNewTipoChange = (e) => {
    setNewTipo({ ...newTipo, [e.target.name]: e.target.value });
  };



  const saveEdit = () => {
    fetch(`${API_URL}/api/admin/fuentes/${editId}/`, {
      method: "PUT",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ...editData, tipo: parseInt(editData.tipo) })
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((updated) => {
        setFuentes(fuentes.map(f => f.id === editId ? updated : f));
        setEditId(null);
        setToast({ type: "success", message: "Fuente actualizada" });
      })
      .catch((err) => setError("Error: " + err.message));
  };

  const createFuente = () => {
    fetch(`${API_URL}/api/admin/fuentes/`, {
      method: "POST",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ...newFuente, tipo: parseInt(newFuente.tipo) })
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((created) => {
        setFuentes([...fuentes, created]);
        setNewFuente({ nombre: "", nombre_pila: "", tipo: "" });
        setToast({ type: "success", message: "Fuente creada" });
        setShowCreateModal(false);
      })
      .catch((err) => setError("Error: " + err.message));
  };

  const createTipo = () => {
    fetch(`${API_URL}/api/admin/tipos-fuente/`, {
      method: "POST",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ...newTipo, peso: parseInt(newTipo.peso), probabilidad: parseInt(newTipo.probabilidad) })
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((created) => {
        setTipos([...tipos, created]);
        setNewTipo({ nombre: "", peso: 1, probabilidad: 1 });
      })
      .catch((err) => setError("Error: " + err.message));
  };



  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!fuentes.length || !tipos.length) return <div>Cargando fuentes...</div>;

  // Paginación local
  const totalPages = Math.ceil(fuentes.length / pageSize);
  const pageFuentes = fuentes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <section className="relative h-screen py-4 md:py-6 pb-20 md:pb-24 overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950">
      <div className="w-full max-w-5xl mx-auto px-2 md:px-6">
        {toast && <div className={`mb-4 px-4 py-2 rounded-lg text-white font-semibold ${toast.type === "success" ? "bg-green-600/80" : "bg-red-600/80"}`}>{toast.message}</div>}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">Administración de Fuentes</h2>
          <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow hover:from-cyan-400 hover:to-blue-400 transition-all">Crear nueva fuente</button>
        </div>
        <div className="bg-slate-800/80 rounded-2xl shadow-2xl border border-cyan-900/40 p-6 mb-8 overflow-x-auto">
          <table className="w-full text-sm md:text-base text-left text-white/90">
            <thead>
              <tr className="bg-gradient-to-r from-cyan-900/60 to-blue-900/60 text-cyan-300">
                <th className="px-3 py-2 font-semibold">ID</th>
                <th className="px-3 py-2 font-semibold">Nombre</th>
                <th className="px-3 py-2 font-semibold">Nombre Pila</th>
                <th className="px-3 py-2 font-semibold">Tipo</th>
                <th className="px-3 py-2 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pageFuentes.map(f => (
                <tr key={f.id} className="border-b border-slate-700/40 hover:bg-cyan-900/20 transition">
                  <td className="px-3 py-2">{f.id}</td>
                  <td className="px-3 py-2">{editId === f.id ? <input name="nombre" value={editData.nombre} onChange={handleEditChange} className="rounded px-2 py-1 bg-slate-900/60 border border-cyan-700/30" /> : f.nombre}</td>
                  <td className="px-3 py-2">{editId === f.id ? <input name="nombre_pila" value={editData.nombre_pila} onChange={handleEditChange} className="rounded px-2 py-1 bg-slate-900/60 border border-cyan-700/30" /> : f.nombre_pila}</td>
                  <td className="px-3 py-2">
                    {editId === f.id ? (
                      <select name="tipo" value={editData.tipo} onChange={handleEditChange} className="rounded px-2 py-1 bg-slate-900/60 border border-cyan-700/30">
                        {tipos.map(t => (
                          <option key={t.id} value={t.id}>{t.nombre}</option>
                        ))}
                      </select>
                    ) : (
                      tipos.find(t => t.id === (f.tipo.id || f.tipo))?.nombre || f.tipo
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {editId === f.id ? (
                      <>
                        <button onClick={saveEdit} className="px-2 py-1 rounded bg-cyan-600 text-white font-semibold mr-2">Guardar</button>
                        <button onClick={() => setEditId(null)} className="px-2 py-1 rounded bg-slate-600 text-white font-semibold">Cancelar</button>
                      </>
                    ) : (
                      <button onClick={() => startEdit(f)} className="px-2 py-1 rounded bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow hover:from-cyan-400 hover:to-blue-400 transition-all text-xs md:text-sm min-w-[80px]">Editar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Paginación */}
          <div className="flex justify-center items-center gap-2 mt-4">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-2 py-1 rounded bg-slate-700 text-white font-semibold disabled:opacity-50">Anterior</button>
            <span className="text-cyan-200 font-bold">Página {currentPage} de {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-2 py-1 rounded bg-slate-700 text-white font-semibold disabled:opacity-50">Siguiente</button>
          </div>
        </div>
        {showCreateModal && (
          <Modal onClose={() => setShowCreateModal(false)}>
            <h3 className="text-lg font-bold text-cyan-700 mb-4">Crear nueva fuente</h3>
            <div className="flex flex-col gap-4">
              <input name="nombre" placeholder="Nombre" value={newFuente.nombre} onChange={handleNewFuenteChange} className="rounded px-2 py-1 bg-slate-100 border border-cyan-700/30 text-slate-900" />
              <input name="nombre_pila" placeholder="Nombre Pila" value={newFuente.nombre_pila} onChange={handleNewFuenteChange} className="rounded px-2 py-1 bg-slate-100 border border-cyan-700/30 text-slate-900" />
              <select name="tipo" value={newFuente.tipo} onChange={handleNewFuenteChange} className="rounded px-2 py-1 bg-slate-100 border border-cyan-700/30 text-slate-900">
                <option value="">Tipo...</option>
                {tipos.map(t => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
              <button onClick={createFuente} className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow hover:from-cyan-400 hover:to-blue-400 transition-all">Crear Fuente</button>
            </div>
          </Modal>
        )}
      </div>
    </section>
  );
};

export default AdminFuentes;
