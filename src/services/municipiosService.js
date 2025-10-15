import api from './api';

const ROUTES = {
  MUNICIPIOS: '/municipios'
};

// Función para reintentar una operación con un número máximo de intentos
const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();
      return result;
    } catch (error) {
      lastError = error;
      console.warn(`Intento ${attempt} fallido al obtener municipios, reintentando...`, error);
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  console.error('Todos los intentos fallaron al obtener municipios:', lastError);
  throw lastError || new Error('No se pudieron obtener los municipios después de varios intentos');
};

export const municipiosService = {
  getMunicipios: async (maxRetries = 3) => {
    try {
      const response = await retryOperation(
        () => api.get(ROUTES.MUNICIPIOS),
        maxRetries
      );
      
      // Asegurarse de que los datos tengan el formato correcto
      if (response?.data && Array.isArray(response.data)) {
        return response.data.map(mun => ({
          id_municipio: mun.id_municipio,
          municipio: mun.municipio
        }));
      }
      
      console.error('Formato de respuesta inesperado:', response?.data);
      return [];
    } catch (error) {
      console.error('Error al obtener municipios después de varios intentos:', error);
      // Retornar un array vacío en lugar de lanzar el error para que la UI no falle
      return [];
    }
  }
};

export default municipiosService;