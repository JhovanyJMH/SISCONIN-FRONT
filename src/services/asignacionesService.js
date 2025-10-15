import api from './api';

export const asignacionesService = {
  // Verificar si un equipo tiene historial
  tieneHistorial: async (equipoId) => {
    try {
      const response = await api.get(`/asignaciones/${equipoId}/tiene-historial`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener historial de asignaciones de un equipo
  getHistorial: async (equipoId, page = 1) => {
    try {
      const response = await api.get(`/asignaciones/${equipoId}/historial`, {
        params: {
          page
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}; 