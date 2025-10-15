import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { equiposRentadosService } from '../../services/equiposRentadosService';

// Async thunks
export const fetchEquipos = createAsyncThunk(
  'equipos/fetchEquipos',
  async ({ page = 1, search = '' }, { rejectWithValue }) => {
    try {
      const response = await equiposRentadosService.getEquiposRentados(page, search);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createEquipo = createAsyncThunk(
  'equipos/createEquipo',
  async (equipoData, { rejectWithValue }) => {
    try {
      const response = await equiposRentadosService.createEquipoRentado(equipoData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateEquipo = createAsyncThunk(
  'equipos/updateEquipo',
  async ({ id, equipoData }, { rejectWithValue }) => {
    try {
      const response = await equiposRentadosService.updateEquipoRentado(id, equipoData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteEquipo = createAsyncThunk(
  'equipos/deleteEquipo',
  async (id, { rejectWithValue }) => {
    try {
      const response = await equiposRentadosService.deleteEquipoRentado(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  items: [],
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
  }
};

const equiposSlice = createSlice({
  name: 'equipos',
  initialState,
  reducers: {
    clearEquipos: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch equipos
      .addCase(fetchEquipos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEquipos.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = {
          currentPage: action.payload.current_page,
          lastPage: action.payload.last_page,
          perPage: action.payload.per_page,
          total: action.payload.total,
          from: action.payload.from,
          to: action.payload.to
        };
      })
      .addCase(fetchEquipos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create equipo
      .addCase(createEquipo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEquipo.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = 'Equipo creado exitosamente';
      })
      .addCase(createEquipo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update equipo
      .addCase(updateEquipo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEquipo.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = 'Equipo actualizado exitosamente';
      })
      .addCase(updateEquipo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete equipo
      .addCase(deleteEquipo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEquipo.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = 'Equipo eliminado exitosamente';
      })
      .addCase(deleteEquipo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearEquipos, clearError, clearSuccessMessage } = equiposSlice.actions;
export default equiposSlice.reducer; 