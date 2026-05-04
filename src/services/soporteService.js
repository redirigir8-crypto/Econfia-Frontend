// src/services/soporteService.js

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
const SUPPORT_API = `${API_URL}/api/support`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Token ${token}` } : {};
};

const parseResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error || data?.detail || "Error en la solicitud de soporte";
    throw new Error(message);
  }
  return data;
};

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });
  return parseResponse(response);
};

const requestForm = async (url, formData) => {
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });
  return parseResponse(response);
};

const soporteService = {
  crearTicket: async (asunto, descripcion, categoria = "otro", prioridad = "media") => {
    return requestJson(`${SUPPORT_API}/tickets/`, {
      method: "POST",
      body: JSON.stringify({ asunto, descripcion, categoria, prioridad }),
    });
  },

  obtenerMisTickets: async () => {
    return requestJson(`${SUPPORT_API}/tickets/mis_tickets/`);
  },

  obtenerTicket: async (ticketId) => {
    return requestJson(`${SUPPORT_API}/tickets/${ticketId}/`);
  },

  agregarMensaje: async (ticketId, mensaje, archivo = null) => {
    const formData = new FormData();
    formData.append("mensaje", mensaje);
    if (archivo) formData.append("archivo", archivo);
    return requestForm(`${SUPPORT_API}/tickets/${ticketId}/agregar_mensaje/`, formData);
  },

  obtenerRespuestaAutomatica: async (pregunta) => {
    const params = new URLSearchParams({ pregunta });
    return requestJson(`${SUPPORT_API}/respuestas-automaticas/obtener_respuesta/?${params.toString()}`);
  },

  obtenerTicketsAbiertos: async () => {
    return requestJson(`${SUPPORT_API}/tickets/tickets_abiertos/`);
  },

  obtenerEstadisticas: async () => {
    return requestJson(`${SUPPORT_API}/tickets/estadisticas/`);
  },

  cambiarEstado: async (ticketId, nuevoEstado) => {
    return requestJson(`${SUPPORT_API}/tickets/${ticketId}/cambiar_estado/`, {
      method: "PATCH",
      body: JSON.stringify({ estado: nuevoEstado }),
    });
  },

  asignarAgente: async (ticketId, agenteId) => {
    return requestJson(`${SUPPORT_API}/tickets/${ticketId}/asignar_agente/`, {
      method: "PATCH",
      body: JSON.stringify({ agente_id: agenteId }),
    });
  },

  obtenerTodosTickets: async () => {
    return requestJson(`${SUPPORT_API}/tickets/`);
  },

  crearRespuestaAutomatica: async (categoria, palabrasClave, respuesta) => {
    return requestJson(`${SUPPORT_API}/respuestas-automaticas/`, {
      method: "POST",
      body: JSON.stringify({
        categoria,
        palabras_clave: palabrasClave,
        respuesta,
        activa: true,
      }),
    });
  },
};

export default soporteService;
