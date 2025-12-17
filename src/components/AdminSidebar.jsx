import React from "react";

const AdminSidebar = ({ onSelect, selected }) => (
  <aside style={{ width: 220, background: "#222", color: "#fff", height: "100vh", padding: 20 }}>
    <h2>Admin</h2>
    <ul style={{ listStyle: "none", padding: 0 }}>
      <li style={{ margin: "16px 0", cursor: "pointer", fontWeight: selected === "users" ? "bold" : "normal" }} onClick={() => onSelect("users")}>Usuarios</li>
      <li style={{ margin: "16px 0", cursor: "pointer", fontWeight: selected === "fuentes" ? "bold" : "normal" }} onClick={() => onSelect("fuentes")}>Fuentes</li>
    </ul>
  </aside>
);

export default AdminSidebar;
