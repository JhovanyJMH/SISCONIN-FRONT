import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginApi, getMeApi, checkUserStatusApi } from './authAPI';

// Función helper para detectar errores de conectividad
const isNetworkError = (error) => {
  return (
    error.code === 'ERR_NETWORK' ||
    error.message === 'Network Error' ||
    error.code === 'ERR_CONNECTION_TIMED_OUT' ||
    error.code === 'ECONNABORTED' ||
    error.message?.includes('timeout') ||
    error.message?.includes('network')
  );
};

// Función para establecer la expiración de la sesión
const setSessionExpiry = () => {
  const expiryTime = Date.now() + (12 * 60 * 60 * 1000); // 12 horas
  localStorage.setItem('sessionExpiry', expiryTime.toString());
};

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await loginApi(email, password);
      
      if (!response.token) {
        return rejectWithValue('No se recibió el token de autenticación');
      }

      localStorage.setItem('token', response.token);
      setSessionExpiry();

      // Obtener información del usuario
      const user = await getMeApi();
      localStorage.setItem('user', JSON.stringify(user));

      return { token: response.token, user };
    } catch (err) {
      console.error('Error en login:', err);
      return rejectWithValue(err.message || 'Error al iniciar sesión');
    }
  }
);

// Thunk para verificar el status del usuario
export const checkUserStatus = createAsyncThunk(
  'auth/checkUserStatus',
  async (_, { getState, dispatch }) => {
    try {
      const { token } = getState().auth;
      if (!token) return false;

      const currentUser = await checkUserStatusApi();
      
      // Si hay error de conectividad, mantener la sesión local
      if (currentUser === null) {
        console.warn('Manteniendo sesión local debido a problemas de conectividad');
        dispatch(setOfflineStatus(true));
        return getState().auth.user; // Mantener usuario actual
      }
      
      // Si la conexión se restableció, actualizar estado
      dispatch(setOfflineStatus(false));
      
      if (!currentUser.status) {
        dispatch(logout());
        return false;
      }

      // Actualizar el usuario en el store y localStorage
      localStorage.setItem('user', JSON.stringify(currentUser));
      return currentUser;
    } catch (err) {
      console.error('Error al verificar estado:', err);
      // Solo cerrar sesión si no es un error de red
      if (!isNetworkError(err)) {
        dispatch(logout());
      } else {
        console.warn('Error de conectividad. Manteniendo sesión local.');
        dispatch(setOfflineStatus(true));
        return getState().auth.user; // Mantener usuario actual
      }
      return false;
    }
  }
);

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,
  isOffline: false, // Nuevo estado para problemas de conectividad
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('sessionExpiry');
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = null;
      state.isOffline = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setOfflineStatus: (state, action) => {
      state.isOffline = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(checkUserStatus.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload;
        } else {
          state.user = null;
          state.token = null;
        }
      });
  },
});

export const { logout, clearError, setOfflineStatus } = authSlice.actions;
export default authSlice.reducer;
