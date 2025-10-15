import api from './api';

export const equiposGEMService = {
  getEquiposGEM: async (page = 1, search = '') => {
    try {
      const response = await api.get('/equipos-gem', {
        params: {
          page,
          search
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getEquipoGEM: async (id) => {
    try {
      const response = await api.get(`/equipos-gem/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createEquipoGEM: async (data) => {
    try {
      const response = await api.post('/equipos-gem', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateEquipoGEM: async (id, data) => {
    try {
      const response = await api.put(`/equipos-gem/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteEquipoGEM: async (id) => {
    try {
      const response = await api.delete(`/equipos-gem/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener datos del dashboard de equipos GEM
  getDashboardData: async () => {
    try {
      const response = await api.get('/equipos-gem/dashboard');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}; 