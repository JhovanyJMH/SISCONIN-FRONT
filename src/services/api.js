import axios from 'axios';

// Definir la URL base
// const BASE_URL = import.meta.env.VITE_API_URL || 'http://187.216.191.89:1350';
// const BASE_URL = import.meta.env.VITE_API_URL || 'http://187.189.134.198:1350';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://10.8.4.121:8000';
const API_URL = `${BASE_URL}/api`;

// Crear una instancia de axios con la configuración base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Manejar error de autenticación
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { BASE_URL, API_URL };
export default api; 