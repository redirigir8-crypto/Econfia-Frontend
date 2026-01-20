import React, { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";

import AdminUsers from "../components/AdminUsers";
import AdminFuentes from "../components/AdminFuentes";
import AdminPlanes from "../components/AdminPlanes";
import AdminUsuarios from "../components/AdminUsuarios";

const AdminPanel = () => {
  const [selected, setSelected] = useState("users");

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AdminSidebar onSelect={setSelected} selected={selected} />
      <main style={{ flex: 1, padding: 32, background: "#f5f6fa" }}>
        {selected === "users" && <AdminUsers />}
        {selected === "usuarios" && <AdminUsuarios />}
        {selected === "planes" && <AdminPlanes />}
        {selected === "fuentes" && <AdminFuentes />}
      </main>
    </div>
  );
};

export default AdminPanel;
