// src/components/ChatbotFlotante.jsx
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Phone, AlertCircle, Check } from "lucide-react";

// Base de conocimientos para respuestas automáticas
const KNOWLEDGE_BASE = [
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
		palabras_clave: ["validación", "búsqueda", "consulta", "resultado"],
		respuesta: "¿Tienes una consulta específica? Puedo ayudarte a entender cómo funciona o transferirte a un agente especializado."
	},
];

export default function ChatbotFlotante() {
	const [isOpen, setIsOpen] = useState(false);
	const [messages, setMessages] = useState([
		{
			id: 1,
			texto: "¡Hola! Soy el asistente de ECONFIA. ¿En qué puedo ayudarte? 😊",
			sender: "bot",
			timestamp: new Date()
		}
	]);
	const [inputValue, setInputValue] = useState("");
	const [isEscalated, setIsEscalated] = useState(false);
	const [ticketId, setTicketId] = useState(null);
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
		if (!inputValue.trim()) return;

		// Agregar mensaje del usuario
		const newUserMessage = {
			id: messages.length + 1,
			texto: inputValue,
			sender: "user",
			timestamp: new Date()
		};

		setMessages(prev => [...prev, newUserMessage]);
		setInputValue("");

		if (isEscalated) {
			// Si hay ticket abierto, simular envío a servidor
			console.log("Mensaje enviado al ticket:", ticketId);
		} else {
			// Generar respuesta automática después de 500ms
			setTimeout(() => {
				const respuestaBot = obtenerRespuestaAutomatica(inputValue);
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
	const handleEscalar = () => {
		const ticketId = `TKT-${Date.now()}`;
		setTicketId(ticketId);
		setIsEscalated(true);

		const escaladoMessage = {
			id: messages.length + 1,
			texto: `✅ Ticket creado: ${ticketId}\n\nUn agente de soporte te responderá en breve. Tu conversación es privada y segura.`,
			sender: "bot",
			timestamp: new Date()
		};

		setMessages(prev => [...prev, escaladoMessage]);
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
						<MessageCircle size={24} />
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
							<div>
								<h3 className="font-bold text-white">Soporte ECONFIA</h3>
								<p className="text-xs text-cyan-100">
									{isEscalated ? `Ticket: ${ticketId}` : "Respuestas automáticas"}
								</p>
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

						{/* Opciones de acción */}
						{!isEscalated && (
							<div className="px-4 py-3 border-t border-cyan-500/20 space-y-2">
								<button
									onClick={handleEscalar}
									className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-orange-600/20 border border-orange-500/50 text-orange-300 rounded-lg hover:bg-orange-600/30 transition text-sm font-semibold"
								>
									<Phone size={16} /> Hablar con soporte técnico
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
									className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg px-3 py-2 transition"
								>
									<Send size={16} />
								</button>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
