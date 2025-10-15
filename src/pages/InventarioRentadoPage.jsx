import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearError, clearSuccessMessage } from '../features/equipos/equiposSlice';
import EquiposRentadosList from '../components/inventarios/EquiposRentadosList';
import EquipoRentadoForm from '../components/inventarios/EquipoRentadoForm';
import AsignacionForm from '../components/inventarios/AsignacionForm';
import Swal from 'sweetalert2';
import { equiposRentadosService } from '../services/equiposRentadosService';
import HistorialRentadoList from '../components/inventarios/HistorialRentadoList';
import HistorialRentadoDetalle from '../components/inventarios/HistorialRentadoDetalle';

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

// Wrapper para EquipoRentadoForm
const EquipoRentadoFormWrapper = () => {
  const { id } = useParams();
  const location = useLocation();
  const [equipoData, setEquipoData] = useState(null);
  const isEditing = location.pathname.includes('/editar/');

  useEffect(() => {
    const loadEquipoData = async () => {
      if (id) {
        try {
          const response = await equiposRentadosService.getEquipoRentado(id);
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
    <EquipoRentadoForm 
      equipoId={id} 
      isEditing={isEditing}
      initialData={equipoData}
    />
  );
};

// Wrapper para AsignacionForm
const AsignacionFormWrapper = ({ onObligadoCompletarChange }) => {
  const { id } = useParams();
  const location = useLocation();
  const isEditing = location.pathname.includes('/editar/');
  const [serviceTag, setServiceTag] = useState('');

  useEffect(() => {
    const fetchServiceTag = async () => {
      if (id) {
        try {
          const response = await equiposRentadosService.getEquipoRentado(id);
          if (response?.data?.service_tag) {
            setServiceTag(response.data.service_tag);
          }
        } catch (error) {
          console.error('Error al cargar el service tag del equipo:', error);
        }
      }
    };

    fetchServiceTag();
  }, [id]);

  return (
    <AsignacionForm 
      equipoId={id} 
      isEditing={isEditing}
      serviceTag={serviceTag}
      onObligadoCompletarChange={onObligadoCompletarChange}
    />
  );
};

const InventarioRentadoPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { id } = useParams();
  const { error, successMessage } = useSelector((state) => state.equipos);
  const [search, setSearch] = useState("");
  const [currentBackground, setCurrentBackground] = useState(0);
  const [isObligadoCompletar, setIsObligadoCompletar] = useState(false);

  const isListPage = location.pathname === "/inventarios/rentado" || location.pathname === "/inventarios/rentado/";

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
    const isNuevoPage = location.pathname.includes('/nuevo');
    const isAsignacionPage = location.pathname.includes('/asignacion/');
    
    // Ocultar breadcrumb si el usuario está obligado a completar la asignación
    if (isObligadoCompletar) {
      return null;
    }
    
    // Extraer el ID de la URL actual
    const currentId = location.pathname.split('/').pop();

    const steps = [
      {
        path: "/inventarios/rentado",
        label: "Lista de inventario",
        show: true
      },
      {
        path: isAsignacionPage ? `/inventarios/rentado/editar/${currentId}` : (isEditing && currentId ? `/inventarios/rentado/editar/${currentId}` : "/inventarios/rentado/nuevo"),
        label: isAsignacionPage ? "Editar equipo" : (isEditing ? "Editar equipo" : "Registrar equipo"),
        show: isEditing || isNuevoPage || isAsignacionPage
      },
      {
        path: currentId ? `/inventarios/rentado/asignacion/${currentId}` : "",
        label: "Asignación y datos del usuario",
        show: isAsignacionPage
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
          Inventario<span className="text-gray-500 font-normal"> Rentado</span>
        </h1>

        {/* Breadcrumb */}
        {renderBreadcrumb()}

        {/* Mensajes de error y éxito */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Rutas */}
        <Routes>
          <Route path="/" element={<EquiposRentadosList search={search} />} />
          <Route path="/registrar" element={<EquipoRentadoForm />} />
          <Route path="/editar/:id" element={<EquipoRentadoFormWrapper />} />
          <Route path="/asignacion/:id" element={<AsignacionFormWrapper onObligadoCompletarChange={setIsObligadoCompletar} />} />
          <Route path="/historial/:equipoId" element={<HistorialRentadoList />} />
          <Route path="/historial/:equipoId/detalle/:id" element={<HistorialRentadoDetalle />} />
        </Routes>
      </div>
    </div>
  );
};

export default InventarioRentadoPage; 