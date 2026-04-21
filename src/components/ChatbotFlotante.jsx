// src/components/ChatbotFlotante.jsx
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Phone, Loader2 } from "lucide-react";
import soporteService from "../services/soporteService";
import polarBear from "../assets/polar-bear.svg";

const SUGERENCIAS_CHAT = [
	"¿Qué puedo preguntar?",
	"Tengo un error en una consulta",
	"¿Cómo descargo mi PDF?",
	"¿Cómo funcionan las consultas masivas?"
];

// Base de conocimientos para respuestas automáticas
const KNOWLEDGE_BASE = [
	{
		palabras_clave: ["que puedo preguntar", "qué puedo preguntar", "preguntas", "ayuda", "opciones"],
		respuesta: "Puedes preguntarme por planes, errores en consultas, reportes PDF, pagos, consultas masivas, API, seguridad de datos o pedir soporte técnico con un agente."
	},
	{
		palabras_clave: ["precio", "costo", "pagar", "tarifa"],
		respuesta: "Tenemos planes flexibles: Por Consulta (paga por validación) e Ilimitado (consultas sin límite al mes). ¿Necesitas más detalles?"
	},
	{
		palabras_clave: ["api", "integración", "conectar", "sistema"],
		respuesta: "Sí, ofrecemos integración por API REST, webhooks y SDKs. ¿Quieres documentación técnica?"
	},
	{
		palabras_clave: ["seguridad", "datos", "privacidad", "encriptación"],
		respuesta: "Usamos encriptación AES-256, cumplimiento GDPR, y auditorías de seguridad trimestrales. Tus datos están protegidos."
	},
	{
		palabras_clave: ["errores", "error", "bug", "no funciona", "problema"],
		respuesta: "Lamento que tengas problemas. Por favor escribe una descripción detallada del error y te transferiré con soporte técnico."
	},
	{
		palabras_clave: ["factura", "recibo", "pago", "comprobante"],
		respuesta: "Las facturas se envían automáticamente por email. Si no la recibiste, te conectaré con nuestro equipo de billing."
	},
	{
		palabras_clave: ["pdf", "reporte", "descargar", "informe"],
		respuesta: "Puedes descargar los reportes desde la vista de resultados o desde la ficha de la consulta. Si el botón falla, dime qué consulta hiciste y qué error aparece."
	},
	{
		palabras_clave: ["masiva", "masivas", "excel", "lote", "archivo"],
		respuesta: "Las consultas masivas procesan registros por archivo en lote. Puedo orientarte con la plantilla, errores de carga o estado del procesamiento."
	},
	{
		palabras_clave: ["validación", "búsqueda", "consulta", "resultado"],
		respuesta: "¿Tienes una consulta específica? Puedo ayudarte a entender cómo funciona o transferirte a un agente especializado."
	},
];

export default function ChatbotFlotante() {
	const [isOpen, setIsOpen] = useState(false);
	const [messages, setMessages] = useState([
		{
			id: 1,
			texto: "Hola. Soy el asistente de ECONFIA. Puedes preguntarme por planes, errores, consultas, reportes, pagos o solicitar soporte técnico.",
			sender: "bot",
			timestamp: new Date()
		}
	]);
	const [inputValue, setInputValue] = useState("");
	const [isEscalated, setIsEscalated] = useState(false);
	const [ticketPk, setTicketPk] = useState(null);
	const [ticketCode, setTicketCode] = useState(null);
	const [isSending, setIsSending] = useState(false);
	const messagesEndRef = useRef(null);

	// Auto-scroll al último mensaje
	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	// Función para encontrar respuesta automática
	const obtenerRespuestaAutomatica = (texto) => {
		const textoLower = texto.toLowerCase();
		
		for (let kb of KNOWLEDGE_BASE) {
			if (kb.palabras_clave.some(palabra => textoLower.includes(palabra))) {
				return kb.respuesta;
			}
		}
		
		return "No entendí completamente tu pregunta. ¿Podrías darme más detalles o prefieres hablar con un agente de soporte?";
	};

	// Enviar mensaje del usuario
	const handleSendMessage = async () => {
		const texto = inputValue.trim();
		if (!texto || isSending) return;

		// Agregar mensaje del usuario
		const newUserMessage = {
			id: messages.length + 1,
			texto,
			sender: "user",
			timestamp: new Date()
		};

		setMessages(prev => [...prev, newUserMessage]);
		setInputValue("");

		if (isEscalated && ticketPk) {
			setIsSending(true);
			try {
				await soporteService.agregarMensaje(ticketPk, texto);
			} catch (error) {
				setMessages(prev => [
					...prev,
					{
						id: Date.now(),
						texto: "No fue posible enviar el mensaje al ticket. Intenta nuevamente en unos segundos.",
						sender: "bot",
						timestamp: new Date()
					}
				]);
			} finally {
				setIsSending(false);
			}
		} else {
			// Generar respuesta automática después de 500ms
			setTimeout(() => {
				const respuestaBot = obtenerRespuestaAutomatica(texto);
				const newBotMessage = {
					id: messages.length + 2,
					texto: respuestaBot,
					sender: "bot",
					timestamp: new Date()
				};
				setMessages(prev => [...prev, newBotMessage]);
			}, 500);
		}
	};

	// Escalar a soporte técnico
	const handleEscalar = async () => {
		if (isSending) return;
		setIsSending(true);

		const descripcion = messages
			.map((msg) => `${msg.sender === "user" ? "Usuario" : "Asistente"}: ${msg.texto}`)
			.join("\n");

		try {
			const ticket = await soporteService.crearTicket(
				"Soporte técnico solicitado desde el chat",
				descripcion || "El usuario solicitó soporte técnico desde el chat.",
				"tecnico",
				"media"
			);

			setTicketPk(ticket.id);
			setTicketCode(ticket.ticket_id);
			setIsEscalated(true);

			const escaladoMessage = {
				id: Date.now(),
				texto: `Ticket creado: ${ticket.ticket_id}\n\nUn agente de soporte podrá ver esta conversación y responder desde el panel administrativo.`,
				sender: "bot",
				timestamp: new Date()
			};

			setMessages(prev => [...prev, escaladoMessage]);
		} catch (error) {
			setMessages(prev => [
				...prev,
				{
					id: Date.now(),
					texto: "No fue posible crear el ticket. Verifica que hayas iniciado sesión e intenta nuevamente.",
					sender: "bot",
					timestamp: new Date()
				}
			]);
		} finally {
			setIsSending(false);
		}
	};

	// Cerrar chat
	const handleClose = () => {
		setIsOpen(false);
	};

	return (
		<div className="fixed bottom-4 right-4 z-50">
			{/* Botón flotante */}
			<AnimatePresence>
				{!isOpen && (
					<motion.button
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						exit={{ scale: 0 }}
						whileHover={{ scale: 1.1 }}
						onClick={() => setIsOpen(true)}
						className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 shadow-2xl flex items-center justify-center text-white hover:shadow-cyan-500/50 transition-all"
					>
						<div className="relative w-10 h-10 flex items-center justify-center">
							<img
								src={polarBear}
								alt="Oso polar"
								className="w-10 h-10 drop-shadow-[0_6px_18px_rgba(0,0,0,0.35)]"
								onError={(e) => {
									e.currentTarget.style.display = "none";
								}}
							/>
							<span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-950/80 border border-white/15 flex items-center justify-center">
								<MessageCircle size={14} className="text-cyan-200" />
							</span>
						</div>
					</motion.button>
				)}
			</AnimatePresence>

			{/* Ventana del chat */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, scale: 0.8, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.8, y: 20 }}
						className="absolute bottom-20 right-0 w-96 h-[600px] bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl shadow-2xl border border-cyan-500/20 flex flex-col overflow-hidden"
					>
						{/* Header */}
						<div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-4 flex items-center justify-between">
							<div className="flex items-center gap-3 min-w-0">
								<div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center overflow-hidden">
									<img
										src={polarBear}
										alt="Oso polar"
										className="w-10 h-10"
										onError={(e) => {
											e.currentTarget.style.display = "none";
										}}
									/>
								</div>
								<div className="min-w-0">
									<h3 className="font-bold text-white leading-tight">Soporte ECONFIA</h3>
								<p className="text-xs text-cyan-100">
									{isEscalated ? `Ticket: ${ticketCode}` : "Respuestas automáticas"}
								</p>
							</div>
							</div>
							<button
								onClick={handleClose}
								className="text-white hover:bg-white/20 p-1 rounded-full transition"
							>
								<X size={20} />
							</button>
						</div>

						{/* Mensajes */}
						<div className="flex-1 overflow-y-auto p-4 space-y-3">
							{messages.map((msg) => (
								<motion.div
									key={msg.id}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
								>
									<div
										className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
											msg.sender === "user"
												? "bg-cyan-600 text-white rounded-br-none"
												: "bg-slate-700 text-cyan-100 rounded-bl-none border border-cyan-500/30"
										}`}
									>
										{msg.texto}
										<div className="text-xs mt-1 opacity-70">
											{msg.timestamp.toLocaleTimeString("es-CO", {
												hour: "2-digit",
												minute: "2-digit"
											})}
										</div>
									</div>
								</motion.div>
							))}
							<div ref={messagesEndRef} />
						</div>

						{!isEscalated && messages.length <= 2 && (
							<div className="px-4 pb-3">
								<p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300/70">
									Puedes preguntar
								</p>
								<div className="flex flex-wrap gap-2">
									{SUGERENCIAS_CHAT.map((pregunta) => (
										<button
											key={pregunta}
											type="button"
											onClick={() => setInputValue(pregunta)}
											className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-100 transition hover:bg-cyan-500/20"
										>
											{pregunta}
										</button>
									))}
								</div>
							</div>
						)}

						{/* Opciones de acción */}
						{!isEscalated && (
							<div className="px-4 py-3 border-t border-cyan-500/20 space-y-2">
								<button
									onClick={handleEscalar}
									disabled={isSending}
									className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-orange-600/20 border border-orange-500/50 text-orange-300 rounded-lg hover:bg-orange-600/30 transition text-sm font-semibold"
								>
									{isSending ? <Loader2 size={16} className="animate-spin" /> : <Phone size={16} />}
									Hablar con soporte técnico
								</button>
							</div>
						)}

						{/* Input */}
						<div className="px-4 py-3 border-t border-cyan-500/20 bg-slate-950">
							<div className="flex gap-2">
								<input
									type="text"
									value={inputValue}
									onChange={(e) => setInputValue(e.target.value)}
									onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
									placeholder="Escribe tu pregunta..."
									className="flex-1 bg-slate-800 text-white rounded-lg px-3 py-2 text-sm outline-none border border-cyan-500/30 focus:border-cyan-500/80 transition placeholder-gray-500"
								/>
								<button
									onClick={handleSendMessage}
									disabled={isSending || !inputValue.trim()}
									className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg px-3 py-2 transition"
								>
									{isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
								</button>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
