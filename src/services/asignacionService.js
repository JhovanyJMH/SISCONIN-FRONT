import api from './api';

export const asignacionService = {
  createAsignacion: async (formData) => {
    const response = await api.post('/asignaciones', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getAsignacion: async (id) => {
    const response = await api.get(`/asignaciones/${id}`);
    return response.data;
  },

  updateAsignacion: async (id, formData) => {
    const response = await api.post(`/asignaciones/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  nuevaAsignacion: async (equipo_id) => {
    const response = await api.post(`/asignaciones/${equipo_id}/nueva-asignacion`);
    return response.data;
  },

  tieneHistorial: async (equipo_id) => {
    const response = await api.get(`/asignaciones/${equipo_id}/tiene-historial`);
    return response.data;
  },

  getHistorial: async (equipo_id, page = 1, perPage = 10) => {
    const response = await api.get(`/asignaciones/${equipo_id}/historial`, {
      params: {
        page,
        per_page: perPage
      }
    });
    return response.data;
  }
}; 