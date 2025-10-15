import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { inventarioGEMService } from '../../services/inventarioGEMService';

export const createInventarioGEM = createAsyncThunk(
  'inventarioGEM/create',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await inventarioGEMService.createInventarioGEM(formData);
      return response;
    } catch (error) {
      // Propagar el error con toda la información disponible
      return rejectWithValue({
        message: error.message || error.response?.data?.error,
        status: error.status || error.response?.status,
        data: error.data || error.response?.data
      });
    }
  }
);

export const getInventarioGEM = createAsyncThunk(
  'inventarioGEM/get',
  async (id) => {
    const response = await inventarioGEMService.getInventarioGEM(id);
    return response;
  }
);

export const updateInventarioGEM = createAsyncThunk(
  'inventarioGEM/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await inventarioGEMService.updateInventarioGEM(id, data);
      return response;
    } catch (error) {
      // Propagar el error con toda la información disponible
      return rejectWithValue({
        message: error.message || error.response?.data?.error,
        status: error.status || error.response?.status,
        data: error.data || error.response?.data
      });
    }
  }
);

export const nuevaAsignacion = createAsyncThunk(
  'inventarioGEM/nuevaAsignacion',
  async (equipo_gem_id) => {
    const response = await inventarioGEMService.nuevaAsignacion(equipo_gem_id);
    return response;
  }
);

export const tieneHistorial = createAsyncThunk(
  'inventarioGEM/tieneHistorial',
  async (equipo_gem_id) => {
    const response = await inventarioGEMService.tieneHistorial(equipo_gem_id);
    return response;
  }
);

export const getHistorial = createAsyncThunk(
  'inventarioGEM/getHistorial',
  async ({ equipoId, page = 1 }) => {
    const response = await inventarioGEMService.getHistorial(equipoId, page);
    return response;
  }
);

const inventarioGEMSlice = createSlice({
  name: 'inventarioGEM',
  initialState: {
    inventario: null,
    historial: [],
    tieneHistorial: false,
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      lastPage: 1,
      perPage: 50,
      total: 0,
      from: 0,
      to: 0
    }
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createInventarioGEM.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInventarioGEM.fulfilled, (state, action) => {
        state.loading = false;
        state.inventario = action.payload;
      })
      .addCase(createInventarioGEM.rejected, (state, action) => {
        state.loading = false;
        // Manejar el nuevo formato de error
        if (action.payload) {
          state.error = action.payload.message;
        } else {
          state.error = action.error.message;
        }
      })
      .addCase(getInventarioGEM.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getInventarioGEM.fulfilled, (state, action) => {
        state.loading = false;
        state.inventario = action.payload;
      })
      .addCase(getInventarioGEM.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateInventarioGEM.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInventarioGEM.fulfilled, (state, action) => {
        state.loading = false;
        state.inventario = action.payload;
      })
      .addCase(updateInventarioGEM.rejected, (state, action) => {
        state.loading = false;
        // Manejar el nuevo formato de error
        if (action.payload) {
          state.error = action.payload.message;
        } else {
          state.error = action.error.message;
        }
      })
      .addCase(tieneHistorial.fulfilled, (state, action) => {
        state.tieneHistorial = action.payload.tiene_historial;
      })
      .addCase(getHistorial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getHistorial.fulfilled, (state, action) => {
        state.loading = false;
        state.historial = action.payload.data;
        state.pagination = {
          currentPage: action.payload.current_page,
          lastPage: action.payload.last_page,
          perPage: action.payload.per_page,
          total: action.payload.total,
          from: action.payload.from,
          to: action.payload.to
        };
      })
      .addCase(getHistorial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { clearError } = inventarioGEMSlice.actions;
export default inventarioGEMSlice.reducer; 