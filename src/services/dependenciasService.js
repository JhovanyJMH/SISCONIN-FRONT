import api from './api';

// Rutas específicas para el módulo de dependencias
const ROUTES = {
  SECRETARIAS: '/catalogo/dependencias/secretarias',
  DIRECCIONES: '/catalogo/dependencias/direcciones',
  OFICINAS: '/catalogo/dependencias/oficinas',
  DEPENDENCIA: '/catalogo/dependencias'
};

export const dependenciasService = {
  getSecretarias: async () => {
    try {
      const response = await api.get(ROUTES.SECRETARIAS);
      if (response.data?.JsonResponse?.data?.secretarias) {
        return response.data.JsonResponse.data.secretarias;
      }
      console.error('Estructura de respuesta inválida para secretarías:', response.data);
      return [];
    } catch (error) {
      console.error('Error al obtener secretarías:', error);
      return [];
    }
  },

  getDirecciones: async (secretariaId) => {
    try {
      if (!secretariaId) {
        console.error('secretaria_id es requerido para obtener direcciones');
        return [];
      }
      
      const response = await api.post(ROUTES.DIRECCIONES, {
        secretaria_id: secretariaId
      });
      
      if (response.data?.JsonResponse?.data?.direcciones) {
        return response.data.JsonResponse.data.direcciones;
      }
      console.error('Estructura de respuesta inválida para direcciones:', response.data);
      return [];
    } catch (error) {
      console.error('Error al obtener direcciones:', error);
      return [];
    }
  },

  getOficinas: async (direccionId, secretariaId) => {
    try {
      if (!direccionId || !secretariaId) {
        console.error('direccion_id y secretaria_id son requeridos para obtener oficinas');
        return [];
      }

      const response = await api.post(ROUTES.OFICINAS, {
        direccion_id: direccionId,
        secretaria_id: secretariaId
      });
      
      if (response.data?.JsonResponse?.data?.oficinas) {
        return response.data.JsonResponse.data.oficinas;
      }
      console.error('Estructura de respuesta inválida para oficinas:', response.data);
      return [];
    } catch (error) {
      console.error('Error al obtener oficinas:', error);
      return [];
    }
  },

  getDependenciaById: async (id) => {
    try {
      if (!id) {
        throw new Error('ID es requerido para obtener la dependencia');
      }
      const response = await api.get(`${ROUTES.DEPENDENCIA}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener dependencia por ID:', error);
      throw error;
    }
  }
};

export default dependenciasService; 