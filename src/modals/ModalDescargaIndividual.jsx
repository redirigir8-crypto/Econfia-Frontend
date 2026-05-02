import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function ModalDescargaIndividual({ isOpen, onClose, data }) {
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [seleccionados, setSeleccionados] = useState([]);
  const [descargando, setDescargando] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;
  const consultaId = data?.consultaId;

  const fetchResultados = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/resultados/${consultaId}/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      const json = await res.json();
      setResultados(json);
    } catch (error) {
      console.error("Error al obtener resultados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (consultaId && isOpen) {
      fetchResultados();
    }
  }, [consultaId, isOpen]);

  if (!isOpen) return null;

  const datosFiltrados = resultados.filter((item) =>
    Object.values(item).join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const toggleSeleccion = (id) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleTodos = () => {
    if (seleccionados.length === datosFiltrados.length) {
      setSeleccionados([]);
    } else {
      setSeleccionados(datosFiltrados.map((r) => r.id));
    }
  };

  const handleDescargar = async () => {
    if (seleccionados.length === 0) return;
    setDescargando(true);
    const token = localStorage.getItem("token");
    const errores = [];

    for (const id of seleccionados) {
      try {
        const resultado = resultados.find((r) => r.id === id);
        const fuente = resultado?.fuente?.replace(/[^a-zA-Z0-9_-]/g, "_") || String(id);

        const res = await fetch(`${API_URL}/api/descargar-resultado/${id}/`, {
          method: "GET",
          headers: { Authorization: `Token ${token}` },
        });

        if (!res.ok) {
          errores.push(`${fuente}: HTTP ${res.status}`);
          continue;
        }

        const blob = await res.blob();
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `${fuente}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(link.href);

        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (error) {
        console.error(`Error descargando resultado ${id}:`, error);
        errores.push(`ID ${id}: error de red`);
      }
    }

    setDescargando(false);
    if (errores.length > 0) {
      alert(`Algunos archivos no se pudieron descargar:\n${errores.join("\n")}`);
    }
  };

  const todosSeleccionados = datosFiltrados.length > 0 && seleccionados.length === datosFiltrados.length;

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-slate-900/95 via-blue-900/20 to-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-cyan-500/10 flex flex-col max-h-[88vh]">

        {/* Glow decorativo */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <h2 className="text-base font-bold text-white tracking-wide">Descarga Individual</h2>
            {seleccionados.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-medium">
                {seleccionados.length} seleccionado{seleccionados.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-red-500/20 hover:border-red-500/40 transition-all duration-200 flex items-center justify-center text-sm"
          >
            ✕
          </button>
        </div>

        {/* Buscador */}
        <div className="relative z-10 px-6 pt-4 pb-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por fuente, tipo..."
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-white/30 text-xs focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 focus:shadow-lg focus:shadow-cyan-500/10 transition-all backdrop-blur-sm"
          />
        </div>

        {/* Tabla */}
        <div className="relative z-10 flex-1 overflow-y-auto mx-6 mb-2 rounded-xl border border-white/10 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-3">
              <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
              <span className="text-white/50 text-sm">Cargando resultados...</span>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 sticky top-0 z-10 backdrop-blur-sm">
                <tr>
                  <th className="px-4 py-2.5 text-white/60 font-semibold uppercase tracking-wider">Fuente</th>
                  <th className="px-4 py-2.5 text-white/60 font-semibold uppercase tracking-wider">Tipo</th>
                  <th className="px-4 py-2.5 text-white/60 font-semibold uppercase tracking-wider text-center">Score</th>
                  <th className="px-4 py-2.5 text-center">
                    <button
                      onClick={toggleTodos}
                      className="text-cyan-400 hover:text-cyan-300 text-[10px] font-semibold uppercase tracking-wider transition-colors"
                    >
                      {todosSeleccionados ? "Ninguno" : "Todos"}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {datosFiltrados.length > 0 ? (
                  datosFiltrados.map((item, i) => {
                    const seleccionado = seleccionados.includes(item.id);
                    return (
                      <tr
                        key={item.id}
                        onClick={() => toggleSeleccion(item.id)}
                        className={`border-b border-white/5 cursor-pointer transition-all duration-150
                          ${seleccionado ? "bg-cyan-500/10" : i % 2 === 0 ? "bg-white/[0.02]" : ""}
                          hover:bg-white/5`}
                      >
                        <td className="px-4 py-2.5 text-white/90 font-medium">{item.fuente}</td>
                        <td className="px-4 py-2.5">
                          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-[10px]">
                            {item.tipo_fuente}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`font-bold text-sm ${item.score > 0 ? "text-emerald-400" : "text-white/40"}`}>
                            {item.score}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <div className={`w-4 h-4 rounded border mx-auto transition-all duration-150 flex items-center justify-center
                            ${seleccionado
                              ? "bg-cyan-500 border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                              : "border-white/20 bg-white/5"}`}
                          >
                            {seleccionado && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8">
                                <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center text-white/30 py-8 italic text-xs">
                      No se encontraron resultados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between px-6 py-4 border-t border-white/10">
          <span className="text-white/40 text-xs">
            {datosFiltrados.length} resultado{datosFiltrados.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={handleDescargar}
            disabled={seleccionados.length === 0 || descargando}
            className={`px-5 py-2 rounded-lg font-semibold text-xs transition-all duration-300
              ${seleccionados.length === 0 || descargando
                ? "bg-white/10 text-white/30 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 hover:shadow-lg hover:shadow-cyan-500/40 transform hover:scale-105"
              }`}
          >
            {descargando
              ? "Descargando..."
              : `Descargar${seleccionados.length > 0 ? ` (${seleccionados.length})` : ""}`}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
