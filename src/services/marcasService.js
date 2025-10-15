import api from './api';

const ROUTES = {
  MARCAS: '/marcas'
};

export const marcasService = {
  getMarcas: async () => {
    try {
      const response = await api.get(ROUTES.MARCAS);
      if (response.data?.data) {
        return response.data.data;
      }
      console.error('Estructura de respuesta inválida para marcas:', response.data);
      return [];
    } catch (error) {
      console.error('Error al obtener marcas:', error);
      return [];
    }
  },

  getMarcaById: async (id) => {
    try {
      if (!id) {
        throw new Error('ID es requerido para obtener la marca');
      }
      const response = await api.get(`${ROUTES.MARCAS}/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener marca por ID:', error);
      throw error;
    }
  },

  createMarca: async (data) => {
    try {
      const response = await api.post(ROUTES.MARCAS, data);
      return response.data.data;
    } catch (error) {
      console.error('Error al crear marca:', error);
      throw error;
    }
  },

  updateMarca: async (id, data) => {
    try {
      const response = await api.put(`${ROUTES.MARCAS}/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error al actualizar marca:', error);
      throw error;
    }
  },

  deleteMarca: async (id) => {
    try {
      await api.delete(`${ROUTES.MARCAS}/${id}`);
      return id;
    } catch (error) {
      console.error('Error al eliminar marca:', error);
      throw error;
    }
  }
}; 