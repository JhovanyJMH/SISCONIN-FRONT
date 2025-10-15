import api from './api';

export const inventarioGEMService = {
  createInventarioGEM: async (formData) => {
    try {
      const response = await api.post('/inventario-gem', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      // Propagar el error con toda la información disponible
      throw {
        message: error.response?.data?.error || error.message,
        status: error.response?.status,
        data: error.response?.data,
        response: error.response
      };
    }
  },

  getInventarioGEM: async (id) => {
    const response = await api.get(`/inventario-gem/${id}`);
    return response.data;
  },

  updateInventarioGEM: async (id, formData) => {
    try {
      const response = await api.post(`/inventario-gem/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      // Propagar el error con toda la información disponible
      throw {
        message: error.response?.data?.error || error.message,
        status: error.response?.status,
        data: error.response?.data,
        response: error.response
      };
    }
  },

  nuevaAsignacion: async (equipo_gem_id) => {
    const response = await api.post(`/inventario-gem/${equipo_gem_id}/nueva-asignacion`);
    return response.data;
  },

  tieneHistorial: async (equipo_gem_id) => {
    const response = await api.get(`/inventario-gem/${equipo_gem_id}/tiene-historial`);
    return response.data;
  },

  getHistorial: async (equipoId, page = 1) => {
    const response = await api.get(`/inventario-gem/${equipoId}/historial`, {
      params: { page }
    });
    return response.data;
  },

  getAsignacionByServiceTag: async (serviceTag) => {
    const response = await api.get(`/inventario-gem/asignacion-by-service-tag/${serviceTag}`);
    return response.data;
  }
}; 