import React, { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const AdminFuentes = () => {
  const [fuentes, setFuentes] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ nombre: "", nombre_pila: "", tipo: "" });
  const [newTipo, setNewTipo] = useState({ nombre: "", peso: 1, probabilidad: 1 });
  const token = localStorage.getItem("token");


  useEffect(() => {
    if (!token) {
      setError("No autenticado. Inicia sesión como admin.");
      return;
    }
    // Obtener fuentes
    fetch(`${API_URL}/api/admin/fuentes/`, {
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then(setFuentes)
      .catch((err) => setError("Error: " + err.message));
    // Obtener tipos de fuente
    fetch(`${API_URL}/api/admin/tipos-fuente/`, {
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then(setTipos)
      .catch((err) => setError("Error: " + err.message));
  }, [token]);


  const startEdit = (fuente) => {
    setEditId(fuente.id);
    setEditData({
      nombre: fuente.nombre,
      nombre_pila: fuente.nombre_pila,
      tipo: fuente.tipo.id || fuente.tipo // Puede venir como objeto o id
    });
  };


  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
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

  return (
    <div>
      <h3>Fuentes</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Nombre Pila</th>
            <th>Tipo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {fuentes.map((f) => (
            <tr key={f.id}>
              <td>{f.id}</td>
              <td>{editId === f.id ? <input name="nombre" value={editData.nombre} onChange={handleEditChange} /> : f.nombre}</td>
              <td>{editId === f.id ? <input name="nombre_pila" value={editData.nombre_pila} onChange={handleEditChange} /> : f.nombre_pila}</td>
              <td>
                {editId === f.id ? (
                  <select name="tipo" value={editData.tipo} onChange={handleEditChange}>
                    {tipos.map(t => (
                      <option key={t.id} value={t.id}>{t.nombre}</option>
                    ))}
                  </select>
                ) : (
                  tipos.find(t => t.id === (f.tipo.id || f.tipo))?.nombre || f.tipo
                )}
              </td>
              <td>
                {editId === f.id ? (
                  <>
                    <button onClick={saveEdit}>Guardar</button>
                    <button onClick={() => setEditId(null)}>Cancelar</button>
                  </>
                ) : (
                  <button onClick={() => startEdit(f)}>Editar</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4>Crear nuevo tipo de fuente</h4>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input name="nombre" placeholder="Nombre" value={newTipo.nombre} onChange={handleNewTipoChange} />
        <input name="peso" type="number" min="1" max="5" placeholder="Peso" value={newTipo.peso} onChange={handleNewTipoChange} />
        <input name="probabilidad" type="number" min="1" max="5" placeholder="Probabilidad" value={newTipo.probabilidad} onChange={handleNewTipoChange} />
        <button onClick={createTipo}>Crear tipo</button>
      </div>
    </div>
  );
};

export default AdminFuentes;
