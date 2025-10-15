import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UsersPage from '../pages/UsersPage';
import DireccionesPage from '../pages/DireccionesPage';
import DashboardPage from '../pages/DashboardPage';
import Layout from '../components/Layout';
import InventarioGEMPage from '../pages/InventarioGEMPage';
import InventarioRentadoPage from '../pages/InventarioRentadoPage';

const ProtectedRoutes = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/catalogo-usuarios/*" element={<UsersPage />} />
        <Route path="/catalogo-direcciones/*" element={<DireccionesPage />} />
        <Route path="/inventarios/gem/*" element={<InventarioGEMPage />} />
        <Route path="/inventarios/rentado/*" element={<InventarioRentadoPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default ProtectedRoutes; 