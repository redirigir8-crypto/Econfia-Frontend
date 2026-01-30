import React, { useState } from "react";

export default function LogOut() {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = () => {
    // Mostrar popup de confirmación
    setShowConfirm(true);
  };

  const confirmLogout = () => {
    // Borrar localStorage y recargar la página
    localStorage.clear();
    window.location.reload();
  };

  const cancelLogout = () => {
    setShowConfirm(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50">
      <div className="bg-gray-800 text-white p-8 rounded-2xl shadow-xl flex flex-col items-center gap-4">
        <h2 className="text-2xl font-bold">Cerrar sesión</h2>
        <p>¿Estás seguro que deseas cerrar sesión?</p>
        <div className="flex gap-4 mt-4">
          <div className="p-[1.5px] rounded-lg bg-gradient-to-r from-transparent via-red-500/40 to-transparent">
          <button
            onClick={confirmLogout}
            className="px-3 py-2 rounded-lg text-white bg-slate-600/60 hover:bg-slate-600/80 transition shadow-none hover:shadow-[0_0_12px_2px_rgba(220,38,38,0.7)]"
          >
            Sí, cerrar sesión
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
