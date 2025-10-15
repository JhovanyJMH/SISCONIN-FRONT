import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { fetchDirecciones, clearError, clearSuccessMessage } from '../features/direcciones/direccionesSlice';
import DireccionesList from '../components/direcciones/DireccionesList';
import DireccionForm from '../components/direcciones/DireccionForm';
import DireccionEdit from '../components/direcciones/DireccionEdit';
import Swal from 'sweetalert2';

const DireccionesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { error, successMessage } = useSelector((state) => state.direcciones);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchDirecciones({ page: 1, search: '' }));
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Swal.fire({
        title: 'Error',
        text: error,
        icon: 'error',
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'Entendido'
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (successMessage) {
      Swal.fire({
        title: '¡Éxito!',
        text: successMessage,
        icon: 'success',
        confirmButtonColor: '#059669',
        confirmButtonText: 'Entendido',
        timer: 2000,
        showConfirmButton: false
      });
      dispatch(clearSuccessMessage());
    }
  }, [successMessage, dispatch]);

  // Solo mostrar en la lista
  const isListPage = location.pathname === "/catalogo-direcciones" || location.pathname === "/catalogo-direcciones/";

  return (
    <div className="bg-[#f4f7fa] w-full">
      <div className="w-full bg-white rounded-xl shadow-lg p-4 md:p-8 lg:p-12">
        {/* Título en una fila independiente */}
        <h1 className="text-5xl font-extrabold text-colorPrimario mb-1 md:mb-0 text-left">
          Administración de<span className="text-gray-500 font-normal"> direcciones</span>
        </h1>
        {/* Breadcrumb en otra fila */}
        <nav className="text-sm text-gray-500 flex items-center gap-2 mt-2 md:mt-0 justify-start md:justify-end w-full md:w-auto mb-8">
          <Link to="/catalogo-direcciones" className="text-colorPrimario font-semibold hover:underline">Lista de direcciones</Link>
          <span className="mx-1">&gt;</span>
          <Link to="/catalogo-direcciones/registrar" className="hover:underline">Registrar dirección</Link>
        </nav>
       
        {/* Tabla de direcciones */}
        <Routes>
          <Route path="/" element={<DireccionesList search={search} />} />
          <Route path="registrar" element={<DireccionForm />} />
          <Route path="editar/:id" element={<DireccionEdit />} />
        </Routes>
      </div>
    </div>
  );
};

export default DireccionesPage;
