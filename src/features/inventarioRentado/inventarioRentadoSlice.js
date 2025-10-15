import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { asignacionesService } from '../../services/asignacionesService';

// Thunk para verificar si un equipo tiene historial
export const verificarHistorial = createAsyncThunk(
  'inventarioRentado/verificarHistorial',
  async (equipoId) => {
    const response = await asignacionesService.tieneHistorial(equipoId);
    return response;
  }
);

// Thunk para obtener el historial de un equipo
export const getHistorial = createAsyncThunk(
  'inventarioRentado/getHistorial',
  async ({ equipoId, page }) => {
    const response = await asignacionesService.getHistorial(equipoId, page);
    return response;
  }
);

const initialState = {
  historial: [],
  tieneHistorial: false,
  pagination: {
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0
  },
  loading: false,
  error: null
};

const inventarioRentadoSlice = createSlice({
  name: 'inventarioRentado',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Verificar historial
      .addCase(verificarHistorial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verificarHistorial.fulfilled, (state, action) => {
        state.loading = false;
        state.tieneHistorial = action.payload;
      })
      .addCase(verificarHistorial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Obtener historial
      .addCase(getHistorial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getHistorial.fulfilled, (state, action) => {
        state.loading = false;
        state.historial = action.payload.data;
        state.pagination = {
          current_page: action.payload.current_page,
          last_page: action.payload.last_page,
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

export const { clearError, clearSuccessMessage } = inventarioRentadoSlice.actions;
export default inventarioRentadoSlice.reducer; 