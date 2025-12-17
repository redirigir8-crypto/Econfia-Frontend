import React, { useEffect, useState } from "react";


const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const AdminUsers = () => {

  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setError("No autenticado. Inicia sesión como admin.");
      return;
    }
    fetch(`${API_URL}/api/admin/users/`, {
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        return res.json();
      })
      .then(setUsers)
      .catch((err) => {
        setError("Error: " + (err.message.includes('<!DOCTYPE') ? "No autorizado o backend caído." : err.message));
      });
  }, [token]);

  if (error) return <div style={{color: 'red'}}>{error}</div>;
  if (!users.length) return <div>Cargando usuarios...</div>;

  return (
    <div>
      <h3>Usuarios</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Usuario</th>
            <th>Email</th>
            <th>Nombre</th>
            <th>Staff</th>
            <th>Superuser</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.full_name}</td>
              <td>{u.is_staff ? "Sí" : "No"}</td>
              <td>{u.is_superuser ? "Sí" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsers;
