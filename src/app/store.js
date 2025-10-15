import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import usersReducer from '../features/users/usersSlice';
import direccionesReducer from '../features/direcciones/direccionesSlice';

import equiposGEMReducer from '../features/equiposGEM/equiposGEMSlice';
import inventarioGEMReducer from '../features/inventarioGEM/inventarioGEMSlice';
import equiposReducer from '../features/equipos/equiposSlice';
import inventarioRentadoReducer from '../features/inventarioRentado/inventarioRentadoSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    direcciones: direccionesReducer,
    equiposGEM: equiposGEMReducer,
    inventarioGEM: inventarioGEMReducer,
    equipos: equiposReducer,
    inventarioRentado: inventarioRentadoReducer,
  },
});
