// src/services/soporteService.js

import axiosInstance from './axiosConfig'; // Usando tu configuración existente

const SUPPORT_API = '/api/support';

const soporteService = {
	// ========== TICKETS ==========
	
	/**
	 * Crear un nuevo ticket de soporte
	 */
	crearTicket: async (asunto, descripcion, categoria = 'otro', prioridad = 'media') => {
		try {
			const response = await axiosInstance.post(`${SUPPORT_API}/tickets/`, {
				asunto,
				descripcion,
				categoria,
				prioridad
			});
			return response.data;
		} catch (error) {
			console.error('Error al crear ticket:', error);
			throw error;
		}
	},

	/**
	 * Obtener todos mis tickets
	 */
	obtenerMisTickets: async () => {
		try {
			const response = await axiosInstance.get(`${SUPPORT_API}/tickets/mis_tickets/`);
			return response.data;
		} catch (error) {
			console.error('Error al obtener tickets:', error);
			throw error;
		}
	},

	/**
	 * Obtener detalle de un ticket específico
	 */
	obtenerTicket: async (ticketId) => {
		try {
			const response = await axiosInstance.get(`${SUPPORT_API}/tickets/${ticketId}/`);
			return response.data;
		} catch (error) {
			console.error('Error al obtener ticket:', error);
			throw error;
		}
	},

	/**
	 * Agregar mensaje a un ticket
	 */
	agregarMensaje: async (ticketId, mensaje, archivo = null) => {
		try {
			const formData = new FormData();
			formData.append('mensaje', mensaje);
			if (archivo) {
				formData.append('archivo', archivo);
			}

			const response = await axiosInstance.post(
				`${SUPPORT_API}/tickets/${ticketId}/agregar_mensaje/`,
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data'
					}
				}
			);
			return response.data;
		} catch (error) {
			console.error('Error al agregar mensaje:', error);
			throw error;
		}
	},

	// ========== RESPUESTAS AUTOMÁTICAS ==========

	/**
	 * Obtener respuesta automática para una pregunta
	 */
	obtenerRespuestaAutomatica: async (pregunta) => {
		try {
			const response = await axiosInstance.get(
				`${SUPPORT_API}/respuestas-automaticas/obtener_respuesta/`,
				{
					params: { pregunta }
				}
			);
			return response.data;
		} catch (error) {
			console.error('Error al obtener respuesta automática:', error);
			throw error;
		}
	},

	// ========== ADMIN ONLY ==========

	/**
	 * Obtener todos los tickets abiertos (solo admin)
	 */
	obtenerTicketsAbiertos: async () => {
		try {
			const response = await axiosInstance.get(`${SUPPORT_API}/tickets/tickets_abiertos/`);
			return response.data;
		} catch (error) {
			console.error('Error al obtener tickets abiertos:', error);
			throw error;
		}
	},

	/**
	 * Obtener estadísticas de tickets (solo admin)
	 */
	obtenerEstadisticas: async () => {
		try {
			const response = await axiosInstance.get(`${SUPPORT_API}/tickets/estadisticas/`);
			return response.data;
		} catch (error) {
			console.error('Error al obtener estadísticas:', error);
			throw error;
		}
	},

	/**
	 * Cambiar estado de un ticket (solo admin)
	 */
	cambiarEstado: async (ticketId, nuevoEstado) => {
		try {
			const response = await axiosInstance.patch(
				`${SUPPORT_API}/tickets/${ticketId}/cambiar_estado/`,
				{ estado: nuevoEstado }
			);
			return response.data;
		} catch (error) {
			console.error('Error al cambiar estado:', error);
			throw error;
		}
	},

	/**
	 * Asignar agente a un ticket (solo admin)
	 */
	asignarAgente: async (ticketId, agenteId) => {
		try {
			const response = await axiosInstance.patch(
				`${SUPPORT_API}/tickets/${ticketId}/asignar_agente/`,
				{ agente_id: agenteId }
			);
			return response.data;
		} catch (error) {
			console.error('Error al asignar agente:', error);
			throw error;
		}
	},

	/**
	 * Obtener todos los tickets (sin filtro de usuario, solo admin)
	 */
	obtenerTodosTickets: async () => {
		try {
			const response = await axiosInstance.get(`${SUPPORT_API}/tickets/`);
			return response.data;
		} catch (error) {
			console.error('Error al obtener tickets:', error);
			throw error;
		}
	},

	/**
	 * Gestionar respuestas automáticas (solo admin)
	 */
	crearRespuestaAutomatica: async (categoria, palabrasClave, respuesta) => {
		try {
			const response = await axiosInstance.post(`${SUPPORT_API}/respuestas-automaticas/`, {
				categoria,
				palabras_clave: palabrasClave,
				respuesta,
				activa: true
			});
			return response.data;
		} catch (error) {
			console.error('Error al crear respuesta automática:', error);
			throw error;
		}
	}
};

export default soporteService;
