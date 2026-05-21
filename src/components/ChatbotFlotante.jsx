// src/components/ChatbotFlotante.jsx
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Phone, Loader2 } from "lucide-react";
import soporteService from "../services/soporteService";
import polarBear from "../assets/polar-bear.svg";

const WHATSAPP_NUMBER = "573054226582";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20quiero%20m%C3%A1s%20informaci%C3%B3n%20sobre%20ECONFIA`;

// Sugerencias para usuarios autenticados
const SUGERENCIAS_USUARIO = [
	"¿Qué puedo preguntar?",
	"Tengo un error en una consulta",
	"¿Cómo descargo mi PDF?",
	"¿Cómo funcionan las consultas masivas?"
];

// Sugerencias para visitantes sin sesión
const SUGERENCIAS_NO_USUARIO = [
	"¿Cómo me registro?",
	"¿Cuáles son los planes?",
	"¿Qué es ECONFIA?",
	"Quiero más información"
];

// Base de conocimientos para respuestas automáticas
const KNOWLEDGE_BASE = [
	{
		palabras_clave: ["que puedo preguntar", "qué puedo preguntar", "preguntas", "ayuda", "opciones"],
		respuesta: "Puedes preguntarme por planes, errores en consultas, reportes PDF, pagos, consultas masivas, API, seguridad de datos o pedir soporte técnico con un agente."
	},
	{
		palabras_clave: ["qué es econfia", "que es econfia", "econfia", "plataforma", "para qué sirve", "para que sirve"],
		respuesta: "ECONFIA es una plataforma de validación de identidad y antecedentes en Colombia. Consultamos registros de Registraduría, ADRES, Policía, Procuraduría y más fuentes oficiales, de forma rápida y segura."
	},
	{
		palabras_clave: ["cómo me registro", "como me registro", "crear cuenta", "registrarme", "registro"],
		respuesta: "Para registrarte en ECONFIA haz clic en 'Crear cuenta' en la página principal, ingresa tu correo y datos básicos. Una vez verificado tu correo podrás adquirir un plan y comenzar a consultar."
	},
	{
		palabras_clave: ["precio", "costo", "pagar", "tarifa", "plan", "planes", "cuánto cuesta", "cuanto cuesta"],
		respuesta: "Tenemos planes flexibles según tus necesidades:\n• Por Consulta: pagas solo por lo que usas.\n• Plan mensual: consultas ilimitadas al mes.\n\nPara conocer los precios exactos o hablar con un asesor escríbenos por WhatsApp."
	},
	{
		palabras_clave: ["más información", "mas informacion", "más info", "asesor", "contactar", "hablar", "whatsapp"],
		respuesta: "Con gusto te atendemos. Puedes escribirnos directamente por WhatsApp al +57 305 422 6582 y un asesor te responderá de inmediato."
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
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const messagesEndRef = useRef(null);

	// Detectar si hay sesión activa
	useEffect(() => {
		const token = localStorage.getItem("token") || localStorage.getItem("authToken") || localStorage.getItem("access");
		setIsAuthenticated(!!token);
	}, [isOpen]);

	const sugerencias = isAuthenticated ? SUGERENCIAS_USUARIO : SUGERENCIAS_NO_USUARIO;

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

		return "No entendí completamente tu pregunta. ¿Podrías darme más detalles o prefieres hablar con un asesor por WhatsApp?";
	};

	// Enviar mensaje del usuario
	const handleSendMessage = async () => {
		const texto = inputValue.trim();
		if (!texto || isSending) return;

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

			setMessages(prev => [
				...prev,
				{
					id: Date.now(),
					texto: `Ticket creado: ${ticket.ticket_id}\n\nUn agente de soporte podrá ver esta conversación y responder desde el panel administrativo.`,
					sender: "bot",
					timestamp: new Date()
				}
			]);
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

	// Abrir WhatsApp
	const handleWhatsApp = () => {
		window.open(WHATSAPP_URL, "_blank", "noopener,noreferrer");
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
										className={`max-w-xs px-4 py-2 rounded-lg text-sm whitespace-pre-line ${
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

						{/* Sugerencias */}
						{!isEscalated && messages.length <= 2 && (
							<div className="px-4 pb-3">
								<p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300/70">
									Puedes preguntar
								</p>
								<div className="flex flex-wrap gap-2">
									{sugerencias.map((pregunta) => (
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

						{/* Botones de acción */}
						{!isEscalated && (
							<div className="px-4 py-3 border-t border-cyan-500/20 space-y-2">
								{/* WhatsApp — siempre visible */}
								<button
									onClick={handleWhatsApp}
									className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600/20 border border-green-500/50 text-green-300 rounded-lg hover:bg-green-600/30 transition text-sm font-semibold"
								>
									{/* Ícono WhatsApp SVG */}
									<svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
										<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
									</svg>
									Contactar por WhatsApp
								</button>

								{/* Soporte técnico — solo para usuarios con sesión */}
								{isAuthenticated && (
									<button
										onClick={handleEscalar}
										disabled={isSending}
										className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-orange-600/20 border border-orange-500/50 text-orange-300 rounded-lg hover:bg-orange-600/30 transition text-sm font-semibold"
									>
										{isSending ? <Loader2 size={16} className="animate-spin" /> : <Phone size={16} />}
										Hablar con soporte técnico
									</button>
								)}
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
