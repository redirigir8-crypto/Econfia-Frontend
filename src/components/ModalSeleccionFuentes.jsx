/**
 * ModalSeleccionFuentes — Modal genérico para seleccionar fuentes/bots
 * 
 * Props:
 *   isOpen           {boolean}  — muestra/oculta el modal
 *   onClose          {function} — callback al cerrar
 *   onConfirm        {function} — callback al confirmar (recibe array de nombres seleccionados)
 *   title            {string}   — título del modal (ej: "Selecciona las fuentes")
 *   loading          {boolean}  — muestra spinner mientras se cargan fuentes
 */

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function ModalSeleccionFuentes({
  isOpen,
  onClose,
  onConfirm,
  title = "Selecciona las fuentes",
  loading = false,
}) {
  const [fuentes, setFuentes] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [query, setQuery] = useState("");
  const [cargando, setCargando] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;

  // Cargar fuentes al abrir modal
  useEffect(() => {
    if (!isOpen) return;

    const fetchFuentes = async () => {
      try {
        setCargando(true);
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/fuentes/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        });
        const json = await res.json();
        setFuentes(Array.isArray(json) ? json : []);
      } catch (err) {
        console.error("Error cargando fuentes:", err);
        setFuentes([]);
      } finally {
        setCargando(false);
      }
    };

    fetchFuentes();
  }, [isOpen, API_URL]);

  // Filtrar fuentes por texto
  const filteredFuentes = fuentes.filter((f) => {
    const texto = `${f?.nombre ?? ""} ${f?.nombre_pila ?? ""}`.toLowerCase();
    return texto.includes(query.toLowerCase());
  });

  // Manejo de checkboxes (máximo 45 fuentes)
  const handleCheckbox = (nombre) => {
    setSeleccionadas((prev) => {
      if (prev.includes(nombre)) {
        return prev.filter((n) => n !== nombre);
      }
      // Si ya hay 45 seleccionadas, no agregar más
      if (prev.length >= 45) {
        return prev;
      }
      return [...prev, nombre];
    });
  };

  // Seleccionar/deseleccionar todas (respetando límite de 45)
  const allSelected =
    filteredFuentes.length > 0 &&
    filteredFuentes.every((f) => seleccionadas.includes(f.nombre));

  const handleToggleAll = () => {
    if (allSelected) {
      setSeleccionadas([]);
    } else {
      const nuevas = filteredFuentes.map((f) => f.nombre);
      setSeleccionadas(nuevas.slice(0, 45));
    }
  };

  // Confirmar selección
  const handleConfirmar = () => {
    if (seleccionadas.length === 0) {
      alert("Selecciona al menos una fuente");
      return;
    }
    if (onConfirm) onConfirm(seleccionadas);
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setSeleccionadas([]);
    setQuery("");
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
        {/* Elementos decorativos */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

        {/* Modal */}
        <div className="relative bg-gradient-to-br from-slate-900/90 via-blue-900/30 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[20px] shadow-2xl shadow-cyan-500/20 max-w-3xl w-full p-6 text-white max-h-[80vh] overflow-y-auto">
          {/* Glow effect */}
          <div className="absolute inset-0 opacity-50 rounded-[20px] bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none" />

          {/* Botón cerrar */}
          <button
            onClick={handleCloseModal}
            className="absolute top-3 right-3 text-white/60 hover:text-red-400 text-xl font-bold transition-colors z-10"
            aria-label="Cerrar"
          >
            ✕
          </button>

          <div className="relative z-10">
            {/* Título */}
            <div className="text-center mb-4">
              <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 mb-2">
                <span className="text-cyan-300 text-xs font-medium">Personaliza tu consulta</span>
              </div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-white via-cyan-100 to-blue-300 bg-clip-text text-transparent">
                {title}
              </h2>
            </div>

            {/* Filtro y botón "Seleccionar todas" */}
            <div className="mb-3 flex flex-col md:flex-row md:items-center md:gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrar fuentes por nombre..."
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 focus:shadow-lg focus:shadow-cyan-500/10 transition-all backdrop-blur-sm"
              />
              <button
                type="button"
                onClick={handleToggleAll}
                className={`mt-2 md:mt-0 md:ml-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 border border-cyan-400/40 whitespace-nowrap ${
                  allSelected
                    ? "bg-cyan-500/80 text-white hover:bg-cyan-400"
                    : "bg-white/10 text-cyan-300 hover:bg-cyan-500/20"
                }`}
              >
                {allSelected ? "Deseleccionar todas" : "Seleccionar todas"}
              </button>
            </div>

            {/* Contador y aviso de límite */}
            <div className="mb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-cyan-300 font-medium">
                  Fuentes seleccionadas: {seleccionadas.length} / 45
                </span>
                {seleccionadas.length >= 45 && (
                  <span className="text-xs text-orange-400 font-medium">⚠️ Límite máximo alcanzado</span>
                )}
              </div>
            </div>

            {/* Cargando */}
            {cargando ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-400"></div>
              </div>
            ) : (
              <>
                {/* Lista de fuentes */}
                <div className="space-y-2 mb-4 max-h-[40vh] overflow-y-auto">
                  {filteredFuentes.length > 0 ? (
                    filteredFuentes.map((fuente) => {
                      const isDisabled = seleccionadas.length >= 45 && !seleccionadas.includes(fuente.nombre);
                      return (
                      <label
                        key={fuente.nombre}
                        className={`flex items-start gap-3 p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 transition-all group ${
                          isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={seleccionadas.includes(fuente.nombre)}
                          onChange={() => handleCheckbox(fuente.nombre)}
                          disabled={isDisabled}
                          className={`accent-cyan-500 w-4 h-4 mt-0.5 flex-shrink-0 ${
                            isDisabled ? "cursor-not-allowed" : "cursor-pointer"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-white group-hover:text-cyan-200 transition-colors">
                            {fuente.nombre_pila || fuente.nombre}
                          </p>
                        </div>
                      </label>
                    );
                    })
                  ) : (
                    <p className="text-center text-white/50 py-4 text-sm">
                      No hay coincidencias con el filtro.
                    </p>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 rounded-lg font-semibold text-sm border border-white/20 text-white/80 hover:bg-white/10 transition-all duration-300"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmar}
                    disabled={seleccionadas.length === 0 || loading}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                      seleccionadas.length === 0 || loading
                        ? "bg-white/10 text-white/40 cursor-not-allowed"
                        : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 hover:shadow-lg hover:shadow-cyan-500/50"
                    }`}
                  >
                    {loading ? "Confirmar..." : "Confirmar selección"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
