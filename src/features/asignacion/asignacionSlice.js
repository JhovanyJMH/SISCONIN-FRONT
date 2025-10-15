import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { asignacionService } from '../../services/asignacionService';

export const createAsignacion = createAsyncThunk(
  'asignacion/create',
  async (formData) => {
    const response = await asignacionService.createAsignacion(formData);
    return response;
  }
);

export const getAsignacion = createAsyncThunk(
  'asignacion/get',
  async (id) => {
    const response = await asignacionService.getAsignacion(id);
    return response;
  }
);

export const updateAsignacion = createAsyncThunk(
  'asignacion/update',
  async ({ id, data }) => {
    const response = await asignacionService.updateAsignacion(id, data);
    return response;
  }
);

export const nuevaAsignacion = createAsyncThunk(
  'asignacion/nuevaAsignacion',
  async (equipo_id) => {
    const response = await asignacionService.nuevaAsignacion(equipo_id);
    return response;
  }
);

export const tieneHistorial = createAsyncThunk(
  'asignacion/tieneHistorial',
  async (equipo_id) => {
    const response = await asignacionService.tieneHistorial(equipo_id);
    return response;
  }
);

export const getHistorial = createAsyncThunk(
  'asignacion/getHistorial',
  async ({ equipoId, page = 1, perPage = 10 }) => {
    const response = await asignacionService.getHistorial(equipoId, page, perPage);
    return response;
  }
);

const asignacionSlice = createSlice({
  name: 'asignacion',
  initialState: {
    asignacion: null,
    historial: [],
    tieneHistorial: false,
    loading: false,
    error: null,
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    total: 0
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createAsignacion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAsignacion.fulfilled, (state, action) => {
        state.loading = false;
        state.asignacion = action.payload;
      })
      .addCase(createAsignacion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(getAsignacion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAsignacion.fulfilled, (state, action) => {
        state.loading = false;
        state.asignacion = action.payload;
      })
      .addCase(getAsignacion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateAsignacion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAsignacion.fulfilled, (state, action) => {
        state.loading = false;
        state.asignacion = action.payload;
      })
      .addCase(updateAsignacion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
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
        state.currentPage = action.payload.current_page;
        state.lastPage = action.payload.last_page;
        state.perPage = action.payload.per_page;
        state.total = action.payload.total;
      })
      .addCase(getHistorial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { clearError } = asignacionSlice.actions;
export default asignacionSlice.reducer; 