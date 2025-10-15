import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearError, clearSuccessMessage } from '../features/equiposGEM/equiposGEMSlice';
import EquiposGEMList from '../components/inventarios/EquiposGEMList';
import EquipoGEMForm from '../components/inventarios/EquipoGEMForm';
import InventarioGEMForm from '../components/inventarios/InventarioGEMForm';
import HistorialGEMList from '../components/inventarios/HistorialGEMList';
import HistorialGEMDetalle from '../components/inventarios/HistorialGEMDetalle';
import { equiposGEMService } from '../services/equiposGEMService';
import Swal from 'sweetalert2';

// Importar imágenes locales
import bg1 from '../assets/images/backgrounds/bg1.jpg';
import bg2 from '../assets/images/backgrounds/bg2.jpg';
import bg3 from '../assets/images/backgrounds/bg3.jpg';
import bg4 from '../assets/images/backgrounds/bg4.jpg';
import bg5 from '../assets/images/backgrounds/bg5.jpg';
import bg6 from '../assets/images/backgrounds/bg6.jpg';
import bg7 from '../assets/images/backgrounds/bg7.jpg';
import bg8 from '../assets/images/backgrounds/bg8.jpg';
import bg9 from '../assets/images/backgrounds/bg9.jpg';
import bg10 from '../assets/images/backgrounds/bg10.jpg';
import bg11 from '../assets/images/backgrounds/bg11.jpg';
import bg12 from '../assets/images/backgrounds/bg12.jpg';

// Array de imágenes de fondo
const backgroundImages = [
  bg1, // Laptop moderna
  bg2, // Setup gaming
  bg3, // Computadora de escritorio
  bg4, // Laptop en escritorio
  bg5, // MacBook
  bg6, // Código en laptop
  bg7, // Setup minimalista
  bg8, // Laptop y café
  bg9, // Laptop en la noche
  bg10, // Programación
  bg11, // Setup moderno
  bg12  // Laptop y auriculares
];

// Wrapper para InventarioGEMForm
const InventarioGEMFormWrapper = () => {
  const { id } = useParams();
  const location = useLocation();
  const [equipoData, setEquipoData] = useState(null);
  const isEditing = location.pathname.includes('/editar/');

  useEffect(() => {
    const loadEquipoData = async () => {
      if (id) {
        try {
          const response = await equiposGEMService.getEquipoGEM(id);
          if (response?.data) {
            setEquipoData(response.data);
          }
        } catch (error) {
          console.error('Error al cargar datos del equipo:', error);
          Swal.fire({
            title: 'Error',
            text: 'Error al cargar los datos del equipo',
            icon: 'error'
          });
        }
      }
    };

    loadEquipoData();
  }, [id]);

  return (
    <InventarioGEMForm 
      equipoId={id} 
      isEditing={isEditing}
      initialData={equipoData}
    />
  );
};

const InventarioGEMPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { id } = useParams();
  const { error, successMessage } = useSelector((state) => state.equiposGEM);
  const [search, setSearch] = useState("");
  const [currentBackground, setCurrentBackground] = useState(0);

  const isListPage = location.pathname === "/inventarios/gem" || location.pathname === "/inventarios/gem/";

  // Efecto para cambiar el fondo cuando cambia la ruta
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * backgroundImages.length);
    setCurrentBackground(randomIndex);
  }, [location.pathname]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  const renderBreadcrumb = () => {
    const isEditing = location.pathname.includes('/editar/');
    const isRegistrarPage = location.pathname.includes('/registrar');
    const isInventarioPage = location.pathname.includes('/inventario/');
    const mostrarEquipoPaso = isRegistrarPage || isEditing || isInventarioPage;
    
    // Extraer el ID de la URL actual
    const currentId = location.pathname.split('/').pop();

    const steps = [
      {
        path: "/inventarios/gem",
        label: "Lista de inventario",
        show: true
      },
      {
        path: isInventarioPage ? `/inventarios/gem/editar/${currentId}` : (isEditing && currentId ? `/inventarios/gem/editar/${currentId}` : "/inventarios/gem/registrar"),
        label: isInventarioPage ? "Editar equipo" : (isEditing ? "Editar equipo" : "Registrar equipo"),
        show: mostrarEquipoPaso
      },
      {
        path: currentId ? `/inventarios/gem/inventario/${currentId}` : "",
        label: "Ubicación y datos del usuario",
        show: isInventarioPage
      }
    ];

    return (
      <nav className="text-sm text-gray-500 flex items-center gap-2 mt-2 md:mt-0 justify-start md:justify-end w-full md:w-auto mb-8">
        {steps.filter(step => step.show).map((step, index) => (
          <React.Fragment key={step.path}>
            {index > 0 && <span className="mx-1">&gt;</span>}
            <Link
              to={step.path}
              className={`${location.pathname === step.path ? 'text-colorPrimario font-semibold' : 'hover:underline'}`}
            >
              {step.label}
            </Link>
          </React.Fragment>
        ))}
      </nav>
    );
  };

  return (
    <div className="bg-[#f4f7fa] w-full min-h-screen relative">
      {/* Fondo con imagen */}
      <div 
        className="absolute inset-0 w-full h-full opacity-10 z-0"
        style={{
          backgroundImage: `url(${backgroundImages[currentBackground]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      <div className="w-full bg-white rounded-xl shadow-lg p-4 md:p-8 lg:p-12 relative z-10">
        {/* Título */}
        <h1 className="text-5xl font-extrabold text-colorPrimario mb-1 md:mb-0 text-left">
          Inventario<span className="text-gray-500 font-normal"> GEM</span>
        </h1>

        {/* Breadcrumb */}
        
        {renderBreadcrumb()}

        {/* Mensajes de error y éxito */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {/* 
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}
        */}

        {/* Rutas */}
        <Routes>
          <Route path="/" element={<EquiposGEMList search={search} />} />
          <Route path="/registrar" element={<EquipoGEMForm />} />
          <Route path="/editar/:id" element={<EquipoGEMForm />} />
          <Route path="/inventario/:id" element={<InventarioGEMFormWrapper />} />
          <Route path="/historial/:equipoId" element={<HistorialGEMList />} />
          <Route path="/historial/:equipoId/detalle/:id" element={<HistorialGEMDetalle />} />
        </Routes>
      </div>
    </div>
  );
};

export default InventarioGEMPage;