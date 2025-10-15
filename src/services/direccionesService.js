import api from './api';

const getAuthHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

// Obtener direcciones con paginación y filtros
export const fetchDireccionesApi = async (page = 1, search = '', status = '') => {
  let url = `/direcciones?page=${page}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (status) url += `&status=${status}`;
  
  const response = await api.get(url);
  return response.data;
};

// Obtener dirección por ID
export const getDireccionByIdApi = async (id) => {
  const response = await api.get(`/direcciones/${id}`);
  return response.data;
};

// Crear nueva dirección
export const createDireccionApi = async (direccionData) => {
  const response = await api.post('/direcciones', direccionData);
  return response.data;
};

// Actualizar dirección
export const updateDireccionApi = async (id, direccionData) => {
  const response = await api.put(`/direcciones/${id}`, direccionData);
  return response.data;
};

// Eliminar dirección
export const deleteDireccionApi = async (id) => {
  await api.delete(`/direcciones/${id}`);
  return id;
};

// Obtener solo direcciones activas (para selects)
export const getDireccionesActivasApi = async () => {
  const response = await api.get('/direcciones?status=activo&per_page=1000');
  return response.data;
};

// Cambiar estado activo/inactivo
export const toggleStatusDireccionApi = async (id) => {
  const response = await api.post(`/direcciones/${id}/toggle-status`);
  return response.data;
};

// Obtener estadísticas del dashboard
export const getDireccionesDashboardApi = async () => {
  const response = await api.get('/direcciones/dashboard');
  return response.data;
};
