import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function ModalDescargaIndividual({ isOpen, onClose, data }) {
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [seleccionados, setSeleccionados] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL;
  const consultaId = data?.consultaId;

  const fetchResultados = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/api/resultados/${consultaId}/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        }
      );

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
    Object.values(item)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const toggleSeleccion = (id) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

const handleDescargar = async () => {
  if (seleccionados.length === 0) {
    alert("Selecciona al menos un resultado para descargar.");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const ids = seleccionados.join(",");
    const url = `${API_URL}/api/unificar-resultados/?ids=${ids}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Error al descargar: ${res.status}`);
    }

    // ✅ Descargar como archivo
    const blob = await res.blob();
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "resultados_unificados.pdf";
    link.click();
    link.remove();
  } catch (error) {
    console.error("Error en la descarga:", error);
    alert("Ocurrió un error al descargar el PDF");
  }
};


  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-2xl shadow-lg p-6 relative max-h-[90vh] w-[800px] flex flex-col">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600"
        >
          ✕
        </button>

        {/* Título */}
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Descarga Individual
        </h2>

        {/* 🔎 Filtro global */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar en todas las columnas..."
          className="mb-3 px-2 py-1 w-full rounded border border-gray-300 text-sm"
        />

        {/* Tabla con scroll */}
        <div className="flex-1 overflow-y-auto overflow-x-auto border rounded-lg">
          {loading ? (
            <p className="text-gray-500 text-sm p-2">Cargando resultados...</p>
          ) : (
            <table className="table-auto text-left text-sm min-w-full">
              <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
                <tr>
                  <th className="px-2 py-1">Fuente</th>
                  <th className="px-2 py-1">Tipo de Fuente</th>
                  <th className="px-2 py-1">Score</th>
                  <th className="px-2 py-1 text-center">Seleccionar</th>
                </tr>
              </thead>
              <tbody>
                {datosFiltrados.length > 0 ? (
                  datosFiltrados.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition"
                    >
                      <td className="px-2 py-1">{item.fuente}</td>
                      <td className="px-2 py-1">{item.tipo_fuente}</td>
                      <td className="px-2 py-1">{item.score}</td>
                      <td className="px-2 py-1 text-center">
                        <input
                          type="checkbox"
                          checked={seleccionados.includes(item.id)}
                          onChange={() => toggleSeleccion(item.id)}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center text-gray-400 py-2 italic"
                    >
                      No se encontraron resultados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Botón descargar siempre visible */}
        <div className="flex justify-end mt-4">
          <button
            onClick={handleDescargar}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
          >
            Descargar seleccionados
          </button>
        </div>
      </div>
    </div>
  );

  // 👇 Aquí ocurre la magia: el modal se monta directo en <body>
  return createPortal(modalContent, document.body);
}
