import api from './api';

export const equiposRentadosService = {
  // Obtener lista de equipos rentados con paginación y búsqueda
  getEquiposRentados: async (page = 1, search = '') => {
    try {
      const response = await api.get('/equipos', {
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

  // Obtener un equipo rentado específico
  getEquipoRentado: async (id) => {
    try {
      const response = await api.get(`/equipos/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Crear un nuevo equipo rentado
  createEquipoRentado: async (equipoData) => {
    try {
      const response = await api.post('/equipos', equipoData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Actualizar un equipo rentado existente
  updateEquipoRentado: async (id, equipoData) => {
    try {
      const response = await api.put(`/equipos/${id}`, equipoData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Eliminar un equipo rentado
  deleteEquipoRentado: async (id) => {
    try {
      const response = await api.delete(`/equipos/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener datos del dashboard de equipos rentados
  getDashboardData: async () => {
    try {
      const response = await api.get('/equipos/dashboard');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

