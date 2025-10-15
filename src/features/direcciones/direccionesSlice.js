import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchDireccionesApi,
  createDireccionApi,
  deleteDireccionApi,
  updateDireccionApi,
  getDireccionByIdApi,
  getDireccionesActivasApi,
  toggleStatusDireccionApi,
  getDireccionesDashboardApi
} from '../../services/direccionesService';

const getAuthHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

// Obtener direcciones con paginación
export const fetchDirecciones = createAsyncThunk(
  'direcciones/fetchDirecciones',
  async ({ page = 1, search = '', status = '' }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      return await fetchDireccionesApi(page, search, status, token);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Error al obtener direcciones');
    }
  }
);

// Crear una dirección
export const createDireccion = createAsyncThunk(
  'direcciones/createDireccion',
  async (direccionData, { getState, rejectWithValue }) => {
    try {
      if (!direccionData.direccion) {
        return rejectWithValue('La dirección es obligatoria');
      }

      const token = getState().auth.token;
      return await createDireccionApi(direccionData, token);
    } catch (err) {
      console.error('Error en createDireccion:', err.response?.data || err);
      const errorMessage = err.response?.data?.message || 
                         err.response?.data?.error || 
                         'Error al crear dirección';
      return rejectWithValue(errorMessage);
    }
  }
);

// Eliminar una dirección
export const deleteDireccion = createAsyncThunk(
  'direcciones/deleteDireccion',
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      return await deleteDireccionApi(id, token);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Error al eliminar dirección');
    }
  }
);

// Editar dirección
export const updateDireccion = createAsyncThunk(
  'direcciones/updateDireccion',
  async ({ id, direccionData }, { getState, rejectWithValue }) => {
    try {
      if (!direccionData.direccion) {
        return rejectWithValue('La dirección es obligatoria');
      }

      const token = getState().auth.token;
      return await updateDireccionApi(id, direccionData, token);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Error al actualizar dirección');
    }
  }
);

// Obtener dirección por ID
export const getDireccionById = createAsyncThunk(
  'direcciones/getDireccionById',
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      return await getDireccionByIdApi(id, token);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Error al obtener dirección');
    }
  }
);

// Obtener direcciones activas
export const getDireccionesActivas = createAsyncThunk(
  'direcciones/getDireccionesActivas',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      return await getDireccionesActivasApi(token);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Error al obtener direcciones activas');
    }
  }
);

// Cambiar estado de dirección
export const toggleStatusDireccion = createAsyncThunk(
  'direcciones/toggleStatusDireccion',
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      return await toggleStatusDireccionApi(id, token);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Error al cambiar estado de dirección');
    }
  }
);

// Obtener estadísticas del dashboard
export const getDireccionesDashboard = createAsyncThunk(
  'direcciones/getDireccionesDashboard',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      return await getDireccionesDashboardApi(token);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Error al obtener estadísticas');
    }
  }
);

const direccionesSlice = createSlice({
  name: 'direcciones',
  initialState: {
    list: [],
    loading: false,
    error: null,
    successMessage: null,
    pagination: {
      currentPage: 1,
      lastPage: 1,
      perPage: 10,
      total: 0,
      from: 0,
      to: 0
    },
    highlightedDireccion: null,
    paginationInfo: null,
    direccionesActivas: [],
    dashboard: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearHighlightedDireccion: (state) => {
      state.highlightedDireccion = null;
      state.paginationInfo = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDirecciones.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDirecciones.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.pagination = {
          currentPage: action.payload.current_page,
          lastPage: action.payload.last_page,
          perPage: action.payload.per_page,
          total: action.payload.total,
          from: action.payload.from,
          to: action.payload.to
        };
      })
      .addCase(fetchDirecciones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createDireccion.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createDireccion.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.pagination_info) {
          state.paginationInfo = action.payload.pagination_info;
          state.highlightedDireccion = action.payload.direccion.id;
        }
        state.successMessage = 'Dirección creada exitosamente';
      })
      .addCase(createDireccion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteDireccion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDireccion.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter(direccion => direccion.id !== action.payload);
        state.successMessage = 'Dirección eliminada exitosamente';
      })
      .addCase(deleteDireccion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateDireccion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDireccion.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.pagination_info) {
          state.paginationInfo = action.payload.pagination_info;
          state.highlightedDireccion = action.payload.direccion.id;
        }
        state.successMessage = 'Dirección actualizada exitosamente';
      })
      .addCase(updateDireccion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getDireccionesActivas.fulfilled, (state, action) => {
        state.direccionesActivas = action.payload.data || action.payload;
      })
      .addCase(toggleStatusDireccion.fulfilled, (state, action) => {
        const direccion = state.list.find(d => d.id === action.payload.id);
        if (direccion) {
          direccion.activo = action.payload.activo;
        }
        state.successMessage = `Dirección ${action.payload.activo ? 'activada' : 'desactivada'} exitosamente`;
      })
      .addCase(getDireccionesDashboard.fulfilled, (state, action) => {
        state.dashboard = action.payload;
      });
  },
});

export const { clearError, clearSuccessMessage, clearHighlightedDireccion } = direccionesSlice.actions;
export default direccionesSlice.reducer;
