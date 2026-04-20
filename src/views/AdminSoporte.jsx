// src/views/AdminSoporte.jsx

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, Clock, Inbox, MessageSquare, Send } from "lucide-react";
import soporteService from "../services/soporteService";

export default function AdminSoporte({ embedded = false }) {
	const [tickets, setTickets] = useState([]);
	const [estadisticas, setEstadisticas] = useState(null);
	const [ticketSeleccionado, setTicketSeleccionado] = useState(null);
	const [filtroEstado, setFiltroEstado] = useState("abierto");
	const [nuevoMensaje, setNuevoMensaje] = useState("");
	const [loading, setLoading] = useState(true);
	const [enviando, setEnviando] = useState(false);

	useEffect(() => {
		cargarDatos();
	}, [filtroEstado]);

	const cargarDatos = async () => {
		setLoading(true);
		try {
			const [ticketsData, estadisticasData] = await Promise.all([
				soporteService.obtenerTodosTickets(),
				soporteService.obtenerEstadisticas()
			]);
			setTickets(ticketsData);
			setEstadisticas(estadisticasData);
		} catch (error) {
			console.error("Error al cargar datos:", error);
		} finally {
			setLoading(false);
		}
	};

	const seleccionarTicket = async (ticket) => {
		setTicketSeleccionado(ticket);
		try {
			const detalle = await soporteService.obtenerTicket(ticket.id);
			setTicketSeleccionado(detalle);
		} catch (error) {
			console.error("Error al cargar detalle del ticket:", error);
		}
	};

	const handleResponder = async () => {
		if (!nuevoMensaje.trim() || !ticketSeleccionado) return;

		setEnviando(true);
		try {
			await soporteService.agregarMensaje(ticketSeleccionado.id, nuevoMensaje);
			setNuevoMensaje("");
			
			// Recargar ticket
			const ticketActualizado = await soporteService.obtenerTicket(ticketSeleccionado.id);
			setTicketSeleccionado(ticketActualizado);
			
			// Recargar lista
			await cargarDatos();
		} catch (error) {
			console.error("Error al responder:", error);
		} finally {
			setEnviando(false);
		}
	};

	const ticketsFiltrados = tickets.filter((ticket) => {
		if (filtroEstado === "todos") return true;
		if (filtroEstado === "abierto") {
			return ["abierto", "en_progreso", "reabierto"].includes(ticket.estado);
		}
		return ticket.estado === filtroEstado;
	});

	const handleCambiarEstado = async (nuevoEstado) => {
		try {
			const ticketActualizado = await soporteService.cambiarEstado(ticketSeleccionado.id, nuevoEstado);
			setTicketSeleccionado(ticketActualizado);
			await cargarDatos();
		} catch (error) {
			console.error("Error al cambiar estado:", error);
		}
	};

	const getEstadoColor = (estado) => {
		const colores = {
			abierto: "bg-orange-500/20 text-orange-400 border-orange-500/30",
			en_progreso: "bg-blue-500/20 text-blue-400 border-blue-500/30",
			resuelto: "bg-green-500/20 text-green-400 border-green-500/30",
			cerrado: "bg-gray-500/20 text-gray-400 border-gray-500/30",
			reabierto: "bg-red-500/20 text-red-400 border-red-500/30"
		};
		return colores[estado] || colores.abierto;
	};

	const getPrioridadColor = (prioridad) => {
		const colores = {
			baja: "bg-green-500/20 text-green-300",
			media: "bg-yellow-500/20 text-yellow-300",
			alta: "bg-orange-500/20 text-orange-300",
			critica: "bg-red-500/20 text-red-300"
		};
		return colores[prioridad] || colores.media;
	};

	const getCategoriaColor = (categoria) => {
		const colores = {
			tecnico: "bg-cyan-500/20 text-cyan-300",
			facturacion: "bg-green-500/20 text-green-300",
			cuenta: "bg-blue-500/20 text-blue-300",
			consulta: "bg-purple-500/20 text-purple-300",
			otro: "bg-gray-500/20 text-gray-300"
		};
		return colores[categoria] || colores.otro;
	};

	return (
		<section className={`${embedded ? "w-full text-white" : "w-screen min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 text-white pt-20 pb-20"}`}>
			<div className={`${embedded ? "w-full" : "max-w-7xl mx-auto px-6"}`}>
				{/* Header */}
				<div className={embedded ? "mb-5" : "mb-8"}>
					<h1 className={`${embedded ? "text-2xl" : "text-4xl"} font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2`}>
						Panel de Soporte Técnico
					</h1>
					<p className="text-gray-400">Gestiona todos los tickets de soporte de usuarios</p>
				</div>

				{/* Estadísticas */}
				{estadisticas && (
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
						<motion.div
							whileHover={{ scale: 1.05 }}
							className="bg-white/5 border border-cyan-500/20 rounded-lg p-4 backdrop-blur"
						>
							<div className="flex items-center justify-between">
								<div>
									<p className="text-gray-400 text-sm">Total Tickets</p>
									<p className="text-3xl font-bold text-cyan-400">{estadisticas.total}</p>
								</div>
								<Inbox size={32} className="text-cyan-400 opacity-50" />
							</div>
						</motion.div>

						<motion.div
							whileHover={{ scale: 1.05 }}
							className="bg-white/5 border border-orange-500/20 rounded-lg p-4 backdrop-blur"
						>
							<div className="flex items-center justify-between">
								<div>
									<p className="text-gray-400 text-sm">Abiertos</p>
									<p className="text-3xl font-bold text-orange-400">{estadisticas.abiertos}</p>
								</div>
								<AlertCircle size={32} className="text-orange-400 opacity-50" />
							</div>
						</motion.div>

						<motion.div
							whileHover={{ scale: 1.05 }}
							className="bg-white/5 border border-blue-500/20 rounded-lg p-4 backdrop-blur"
						>
							<div className="flex items-center justify-between">
								<div>
									<p className="text-gray-400 text-sm">En Progreso</p>
									<p className="text-3xl font-bold text-blue-400">{estadisticas.en_progreso}</p>
								</div>
								<Clock size={32} className="text-blue-400 opacity-50" />
							</div>
						</motion.div>

						<motion.div
							whileHover={{ scale: 1.05 }}
							className="bg-white/5 border border-green-500/20 rounded-lg p-4 backdrop-blur"
						>
							<div className="flex items-center justify-between">
								<div>
									<p className="text-gray-400 text-sm">Resueltos</p>
									<p className="text-3xl font-bold text-green-400">{estadisticas.resueltos}</p>
									<p className="text-xs text-gray-500 mt-1">{estadisticas.tasa_resolucion}% resueltos</p>
								</div>
								<CheckCircle size={32} className="text-green-400 opacity-50" />
							</div>
						</motion.div>
					</div>
				)}

				{/* Contenido Principal */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Lista de Tickets */}
					<div className="lg:col-span-1">
						<div className="bg-white/5 border border-cyan-500/20 rounded-lg backdrop-blur overflow-hidden">
							{/* Header de lista */}
							<div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 px-4 py-3 border-b border-cyan-500/20">
								<h2 className="font-bold text-cyan-300">Tickets Abiertos</h2>
								<div className="flex flex-wrap gap-2 mt-3">
									{[
										["abierto", "Activos"],
										["resuelto", "Resueltos"],
										["cerrado", "Cerrados"],
										["todos", "Todos"],
									].map(([key, label]) => (
										<button
											key={key}
											type="button"
											onClick={() => setFiltroEstado(key)}
											className={`text-xs px-2 py-1 rounded-full border transition ${
												filtroEstado === key
													? "bg-cyan-500/25 border-cyan-400/60 text-cyan-100"
													: "bg-white/5 border-white/10 text-gray-400 hover:text-cyan-200"
											}`}
										>
											{label}
										</button>
									))}
								</div>
							</div>

							{/* Items */}
							<div className="divide-y divide-cyan-500/10 max-h-96 overflow-y-auto">
								{loading ? (
									<div className="p-4 text-center text-gray-500">Cargando...</div>
								) : ticketsFiltrados.length === 0 ? (
									<div className="p-4 text-center text-gray-500">No hay tickets abiertos</div>
								) : (
									ticketsFiltrados.map((ticket) => (
										<motion.div
											key={ticket.id}
											whileHover={{ backgroundColor: "rgba(34, 211, 238, 0.1)" }}
											onClick={() => seleccionarTicket(ticket)}
											className={`p-3 cursor-pointer transition ${
												ticketSeleccionado?.id === ticket.id
													? "bg-cyan-500/20 border-l-2 border-cyan-400"
													: "hover:bg-white/5"
											}`}
										>
											<div className="flex items-start justify-between gap-2 mb-2">
												<p className="text-sm font-mono text-cyan-300">{ticket.ticket_id}</p>
												<span className={`text-xs px-2 py-1 rounded-full ${getPrioridadColor(ticket.prioridad)}`}>
													{ticket.prioridad}
												</span>
											</div>
											<p className="text-sm text-white font-semibold truncate">{ticket.asunto}</p>
											<p className="text-xs text-gray-500 mt-1">{ticket.usuario_nombre}</p>
										</motion.div>
									))
								)}
							</div>
						</div>
					</div>

					{/* Detalle del Ticket */}
					<div className="lg:col-span-2">
						{ticketSeleccionado ? (
							<motion.div
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								className="bg-white/5 border border-cyan-500/20 rounded-lg backdrop-blur h-96 flex flex-col overflow-hidden"
							>
								{/* Header */}
								<div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 px-4 py-3 border-b border-cyan-500/20">
									<div className="flex items-center justify-between mb-2">
										<h3 className="font-bold text-cyan-300">{ticketSeleccionado.ticket_id}</h3>
										<span className={`text-xs px-2 py-1 rounded-full border ${getEstadoColor(ticketSeleccionado.estado)}`}>
											{ticketSeleccionado.estado.replace('_', ' ').toUpperCase()}
										</span>
									</div>
									<p className="text-white font-semibold">{ticketSeleccionado.asunto}</p>
									<div className="flex gap-2 mt-2">
										<span className={`text-xs px-2 py-1 rounded border ${getCategoriaColor(ticketSeleccionado.categoria)}`}>
											{ticketSeleccionado.categoria}
										</span>
										<span className={`text-xs px-2 py-1 rounded border ${getPrioridadColor(ticketSeleccionado.prioridad)}`}>
											{ticketSeleccionado.prioridad}
										</span>
									</div>
									<div className="flex flex-wrap gap-2 mt-3">
										{[
											["en_progreso", "En progreso"],
											["resuelto", "Resuelto"],
											["cerrado", "Cerrado"],
										].map(([estado, label]) => (
											<button
												key={estado}
												type="button"
												onClick={() => handleCambiarEstado(estado)}
												className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:border-cyan-400/50 hover:text-cyan-100 transition"
											>
												{label}
											</button>
										))}
									</div>
								</div>

								{/* Mensajes */}
								<div className="flex-1 overflow-y-auto p-4 space-y-3">
									{ticketSeleccionado.mensajes?.map((msg, idx) => (
										<div key={idx} className={`flex ${msg.es_agente ? 'justify-end' : 'justify-start'}`}>
											<div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
												msg.es_agente
													? 'bg-cyan-600/30 text-cyan-100 rounded-br-none'
													: 'bg-slate-700 text-gray-200 rounded-bl-none'
											}`}>
												<p className="font-semibold text-xs mb-1 opacity-75">{msg.remitente_nombre}</p>
												<p>{msg.mensaje}</p>
												<p className="text-xs mt-1 opacity-70">{msg.creado_en_formateado}</p>
											</div>
										</div>
									))}
								</div>

								{/* Input de Mensaje */}
								<div className="border-t border-cyan-500/20 p-3 bg-slate-900/50">
									<div className="flex gap-2">
										<input
											type="text"
											value={nuevoMensaje}
											onChange={(e) => setNuevoMensaje(e.target.value)}
											onKeyPress={(e) => e.key === 'Enter' && handleResponder()}
											placeholder="Escribe tu respuesta..."
											className="flex-1 bg-slate-800 text-white rounded px-3 py-2 text-sm outline-none border border-cyan-500/30 focus:border-cyan-500 transition"
										/>
										<button
											onClick={handleResponder}
											disabled={enviando || !nuevoMensaje.trim()}
											className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded px-3 py-2 transition"
										>
											<Send size={16} />
										</button>
									</div>
								</div>
							</motion.div>
						) : (
							<div className="bg-white/5 border border-cyan-500/20 rounded-lg backdrop-blur p-6 flex items-center justify-center h-96">
								<div className="text-center">
									<MessageSquare size={48} className="mx-auto text-gray-500 mb-2" />
									<p className="text-gray-500">Selecciona un ticket para ver detalles</p>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
