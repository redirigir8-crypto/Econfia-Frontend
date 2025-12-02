import TablaResultados from "../components/TablaResultados";
import CardDni from "../components/CardDni";
import DetalleResultados from "../components/DetalleResultados";
import RadarRiesgo from "../components/RadarRiesgo";
import MapaCalorResultados from "../components/MapaCalorResultados";
import ModalDescargaIndividual from "../modals/ModalDescargaIndividual";
import ConsultaSlide from "../components/ConsultaSlide";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, FileDown, FileText, Images } from "lucide-react";

/** --- BOTONES FLOTANTES (portal) --- */
function FloatingActionsPortal({
  apiUrl,
  consultaId,
  onBack,
  onOpenIndividual, // abre tu ModalDescargaIndividual
}) {
  const [el, setEl] = useState(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const node = document.createElement("div");
    node.id = "econfia-resultados-actions";
    document.body.appendChild(node);
    setEl(node);
    return () => document.body.removeChild(node);
  }, []);

  // cerrar al hacer click fuera o con ESC
  useEffect(() => {
    const handleClick = (e) => {
      if (open && menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    const handleKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const goBack = () => (typeof onBack === "function" ? onBack() : window.history.back());

  const downloadPdf = (tipo) => {
    const url = `${apiUrl}/api/generar_consolidado_full/${consultaId}/${tipo}/`;
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  if (!el) return null;

  return createPortal(
    <div className="fixed top-4 left-4 z-[10000]">
      <div className="flex items-start gap-2">
        {/* Regresar */}
        <button
          onClick={goBack}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20
                     text-gray-100 border border-white/10 backdrop-blur-md shadow-lg transition"
          title="Regresar"
        >
          <ArrowLeft size={16} />
          <span className="text-sm font-semibold">Regresar</span>
        </button>

        {/* PDF + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600/80 hover:bg-blue-500
                       text-white border border-white/10 backdrop-blur-md shadow-lg transition"
            title="Descargar PDF"
          >
            <FileDown size={16} />
            <span className="text-sm font-semibold">PDF</span>
          </button>

          {open && (
            <div className="absolute left-0 mt-2 w-56 rounded-xl overflow-hidden border border-white/10
                            bg-black/70 backdrop-blur-md shadow-2xl">
              <button
                onClick={() => downloadPdf(1)}  // Completo
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-100 hover:bg-white/10 transition"
              >
                <FileText size={16} /> Descargar PDF Completo
              </button>
              <button
                onClick={() => downloadPdf(3)}  // Resumen
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-100 hover:bg-white/10 transition"
              >
                <Images size={16} /> Descargar PDF Resumen
              </button>
              <button
                onClick={() => { setOpen(false); onOpenIndividual?.(); }} // Abre tu modal
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-100 hover:bg-white/10 transition"
              >
                <FileText size={16} /> Descarga individual
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    el
  );
}

export default function Resultados() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [consultaSeleccionada, setConsultaSeleccionada] = useState(null);
  const [riesgo, setRiesgo] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ estado: "", fecha: "" });
  const [showModalIndividual, setShowModalIndividual] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;
  // ---- Obtener todas las consultas ----
  const fetchResultados = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log(API_URL)
      const res = await fetch(`${API_URL}/api/consultas/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Error al obtener resultados:", error);
    } finally {
      setLoading(false);
    }
  };

  // ---- Obtener riesgo de la consulta seleccionada ----
  const fetchRiesgo = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/api/calcular_riesgo/${id}/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      const json = await res.json();
      setRiesgo(json);
    } catch (error) {
      console.error("Error al obtener riesgo:", error);
    }
  };

  // ---- Al seleccionar consulta, cargo su riesgo ----
  useEffect(() => {
    if (consultaSeleccionada) {
      fetchRiesgo(consultaSeleccionada);
    }
  }, [consultaSeleccionada]);

  // ---- Cargar consultas periódicamente ----
  useEffect(() => {
    fetchResultados();
    const interval = setInterval(fetchResultados, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return <p className="text-center text-gray-300">Cargando...</p>;

  // ---- Filtrar datos ----
  const filteredData = data.filter((item) => {
    const matchSearch =
      search === "" ||
      item.id.toString().includes(search) ||
      item.cedula?.toString().includes(search) ||
      item.estado?.toLowerCase().includes(search.toLowerCase());

    const matchEstado =
      filters.estado === "" || item.estado === filters.estado;

    const matchFecha =
      filters.fecha === "" || item.fecha?.startsWith(filters.fecha);

    return matchSearch && matchEstado && matchFecha;
  });

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-8 pb-32">
      {!consultaSeleccionada ? (
        <div className="w-full max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-white">Resultados</h1>

          {/* Barra de búsqueda y filtros */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center mb-6 gap-4">
            <input
              type="text"
              placeholder="Buscar por ID, Cédula o Estado..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-1/2 px-4 py-2 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-inner"
            />

            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={filters.estado}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, estado: e.target.value }))
                }
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Todos los estados</option>
                <option value="en_proceso">En proceso</option>
                <option value="finalizado">Finalizado</option>
                <option value="error">Error</option>
              </select>

              <input
                type="date"
                value={filters.fecha}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, fecha: e.target.value }))
                }
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Tabla de resultados */}
          <TablaResultados
            data={filteredData}
            onVerResultados={setConsultaSeleccionada}
          />
        </div>
      ) : (
        <div className="w-full max-w-7xl mx-auto h-[75vh]">
          <FloatingActionsPortal
            apiUrl={API_URL}
            consultaId={consultaSeleccionada}
            onBack={() => setConsultaSeleccionada(null)}
            onOpenIndividual={() => setShowModalIndividual(true)}
          />
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={20}
            slidesPerView={1}
            pagination={{ clickable: true }}
            navigation
            className="h-full"
          >

            {/* Slide 2: Detalles con botones abajo */}
            <SwiperSlide className="flex flex-col">
              {/* 🔹 Detalle primero */}
              <div className="flex-1">
                <DetalleResultados consultaId={consultaSeleccionada} />
              </div>

            </SwiperSlide>

            <SwiperSlide className="flex flex-row h-full">
            <ConsultaSlide consultaId={consultaSeleccionada} />
            </SwiperSlide>
            {/* Slide 3 */}
          </Swiper>

          {/* Modal fuera del Swiper */}
          <ModalDescargaIndividual
            isOpen={showModalIndividual}
            onClose={() => setShowModalIndividual(false)}
            data={{ consultaId: consultaSeleccionada }}
          />
        </div>
      )}
    </div>
  );
}
