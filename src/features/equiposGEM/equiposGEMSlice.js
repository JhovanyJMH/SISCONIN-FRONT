import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { equiposGEMService } from '../../services/equiposGEMService';

export const fetchEquiposGEM = createAsyncThunk(
  'equiposGEM/fetchEquiposGEM',
  async ({ page = 1, search = '' }, { rejectWithValue }) => {
    try {
      const response = await equiposGEMService.getEquiposGEM(page, search);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createEquipoGEM = createAsyncThunk(
  'equiposGEM/createEquipoGEM',
  async (data, { rejectWithValue }) => {
    try {
      const response = await equiposGEMService.createEquipoGEM(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateEquipoGEM = createAsyncThunk(
  'equiposGEM/updateEquipoGEM',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await equiposGEMService.updateEquipoGEM(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteEquipoGEM = createAsyncThunk(
  'equiposGEM/deleteEquipoGEM',
  async (id, { rejectWithValue }) => {
    try {
      const response = await equiposGEMService.deleteEquipoGEM(id);
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
    perPage: 50,
    total: 0,
    from: 0,
    to: 0
  }
};

const equiposGEMSlice = createSlice({
  name: 'equiposGEM',
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
      // Fetch Equipos GEM
      .addCase(fetchEquiposGEM.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEquiposGEM.fulfilled, (state, action) => {
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
      .addCase(fetchEquiposGEM.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Equipo GEM
      .addCase(createEquipoGEM.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEquipoGEM.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(createEquipoGEM.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Equipo GEM
      .addCase(updateEquipoGEM.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEquipoGEM.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(updateEquipoGEM.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Equipo GEM
      .addCase(deleteEquipoGEM.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEquipoGEM.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(deleteEquipoGEM.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearSuccessMessage } = equiposGEMSlice.actions;
export default equiposGEMSlice.reducer;