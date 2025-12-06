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
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-slate-900/90 to-slate-800/90 hover:from-slate-800/90 hover:to-slate-700/90
                     text-white border border-white/20 backdrop-blur-xl shadow-lg shadow-black/20 transition-all hover:shadow-cyan-500/20 hover:border-cyan-500/30 group"
          title="Regresar"
        >
          <ArrowLeft size={16} className="group-hover:text-cyan-400 transition-colors" />
          <span className="text-sm font-semibold">Regresar</span>
        </button>

        {/* PDF + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400
                       text-white border border-white/20 backdrop-blur-xl shadow-lg shadow-cyan-500/30 transition-all hover:shadow-cyan-500/50 hover:scale-105"
            title="Descargar PDF"
          >
            <FileDown size={16} />
            <span className="text-sm font-semibold">PDF</span>
          </button>

          {open && (
            <div className="absolute left-0 mt-2 w-56 rounded-lg overflow-hidden border border-white/20
                            bg-gradient-to-br from-slate-900/95 via-blue-900/40 to-slate-900/95 backdrop-blur-xl shadow-2xl shadow-cyan-500/20 animate-in fade-in duration-200">
              <button
                onClick={() => downloadPdf(1)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white hover:bg-cyan-500/20 transition-all border-b border-white/10 group"
              >
                <FileText size={16} className="group-hover:text-cyan-400 transition-colors" /> 
                <span className="group-hover:text-cyan-300">Descargar PDF Completo</span>
              </button>
              <button
                onClick={() => downloadPdf(3)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white hover:bg-blue-500/20 transition-all border-b border-white/10 group"
              >
                <Images size={16} className="group-hover:text-blue-400 transition-colors" /> 
                <span className="group-hover:text-blue-300">Descargar PDF Resumen</span>
              </button>
              <button
                onClick={() => { setOpen(false); onOpenIndividual?.(); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white hover:bg-purple-500/20 transition-all group"
              >
                <FileText size={16} className="group-hover:text-purple-400 transition-colors" /> 
                <span className="group-hover:text-purple-300">Descarga individual</span>
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
    <section className="relative min-h-screen py-8 pb-36 overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="w-full px-4 relative z-10">
        {!consultaSeleccionada ? (
          <div className="w-full max-w-7xl mx-auto">
            {/* Título */}
            <div className="mb-6">
              <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 mb-3">
                <span className="text-cyan-300 text-xs font-medium">Panel de resultados</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-cyan-100 to-blue-300 bg-clip-text text-transparent">
                Resultados de Consultas
              </h1>
            </div>

            {/* Barra de búsqueda y filtros */}
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center mb-6 gap-4">
              <input
                type="text"
                placeholder="Buscar por ID, Cédula o Estado..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-1/2 px-4 py-2.5 rounded-lg bg-white/5 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 focus:shadow-lg focus:shadow-cyan-500/20 transition-all backdrop-blur-sm"
              />

              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={filters.estado}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, estado: e.target.value }))
                  }
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-white/5 border border-white/15 text-white focus:outline-none focus:border-blue-400/50 focus:bg-white/10 focus:shadow-lg focus:shadow-blue-500/20 transition-all backdrop-blur-sm appearance-none cursor-pointer"
                >
                  <option className="bg-slate-900 text-white" value="">Todos los estados</option>
                  <option className="bg-slate-900 text-white" value="en_proceso">En proceso</option>
                  <option className="bg-slate-900 text-white" value="finalizado">Finalizado</option>
                  <option className="bg-slate-900 text-white" value="error">Error</option>
                </select>

                <input
                  type="date"
                  value={filters.fecha}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, fecha: e.target.value }))
                  }
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-white/5 border border-white/15 text-white focus:outline-none focus:border-purple-400/50 focus:bg-white/10 focus:shadow-lg focus:shadow-purple-500/20 transition-all backdrop-blur-sm"
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
    </section>
  );
}
