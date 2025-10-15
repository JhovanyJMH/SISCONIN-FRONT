import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { updateUser, clearError, clearSuccessMessage } from '../../features/users/usersSlice';
import { dependenciasService } from '../../services/dependenciasService';
import { useForm } from 'react-hook-form';
import CustomSelect from '../common/CustomSelect';
import Swal from 'sweetalert2';
import SubmitButton from '../common/SubmitButton';
import LoadingSpinner from '../common/LoadingSpinner';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const UsuarioEdit = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { list: users, loading, error, successMessage } = useSelector((state) => state.users);
  const { register, handleSubmit: handleFormSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      name: '',
      ap_paterno: '',
      ap_materno: '',
      email: '',
      password: '',
      repeatPassword: '',
      profile: '',
      status: true,
      secretaria_id: '',
      direccion_id: '',
      oficina_id: '',
      dependencia_id: ''
    }
  });

  // Estados para los campos de dependencias
  const [secretarias, setSecretarias] = useState([]);
  const [direcciones, setDirecciones] = useState([]);
  const [oficinas, setOficinas] = useState([]);
  const [selectedSecretaria, setSelectedSecretaria] = useState('');
  const [selectedDireccion, setSelectedDireccion] = useState('');
  const [selectedOficina, setSelectedOficina] = useState('');
  const [isLoadingDependencias, setIsLoadingDependencias] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const [form, setForm] = useState({
    name: '',
    ap_paterno: '',
    ap_materno: '',
    email: '',
    password: '',
    repeatPassword: '',
    profile: 'user',
    status: true,
    secretaria_id: '',
    direccion_id: '',
    oficina_id: '',
    dependencia_id: ''
  });

  // Registrar los campos requeridos
  useEffect(() => {
    register('name', { required: 'Este campo es requerido' });
    register('ap_paterno', { required: 'Este campo es requerido' });
    register('ap_materno', { required: 'Este campo es requerido' });
    register('email', { 
      required: 'Este campo es requerido',
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: 'Email inválido'
      }
    });
    register('password', {
      minLength: {
        value: 8,
        message: 'La contraseña debe tener al menos 8 caracteres'
      },
      validate: (value) => {
        if (value && value.length > 0 && value.length < 8) {
          return 'La contraseña debe tener al menos 8 caracteres';
        }
        return true;
      }
    });
    register('repeatPassword', {
      validate: (value) => {
        if (value !== form.password) {
          return 'Las contraseñas no coinciden';
        }
        return true;
      }
    });
    register('profile', { required: 'Este campo es requerido' });
    register('secretaria_id', { required: 'Este campo es requerido' });
    register('direccion_id', { required: 'Este campo es requerido' });
    register('oficina_id', { required: 'Este campo es requerido' });
  }, [register, form.password]);

  // Cargar secretarías
  useEffect(() => {
    const loadSecretarias = async () => {
      try {
        const data = await dependenciasService.getSecretarias();
        setSecretarias(data);
      } catch (error) {
        console.error('Error al cargar secretarías:', error);
      }
    };
    loadSecretarias();
  }, []);

  // Cargar direcciones cuando se selecciona una secretaría
  useEffect(() => {
    const loadDirecciones = async () => {
      if (selectedSecretaria) {
        try {
          const data = await dependenciasService.getDirecciones(selectedSecretaria);
          setDirecciones(data);
        } catch (error) {
          console.error('Error al cargar direcciones:', error);
          setDirecciones([]);
        }
      }
    };
    loadDirecciones();
  }, [selectedSecretaria]);

  // Cargar oficinas cuando se selecciona una dirección
  useEffect(() => {
    const loadOficinas = async () => {
      if (selectedDireccion && selectedSecretaria) {
        try {
          const data = await dependenciasService.getOficinas(selectedDireccion, selectedSecretaria);
          setOficinas(data);
        } catch (error) {
          console.error('Error al cargar oficinas:', error);
          setOficinas([]);
        }
      }
    };
    loadOficinas();
  }, [selectedDireccion, selectedSecretaria]);

  // Cargar datos del usuario
  useEffect(() => {
    const user = users.find(u => u.id === parseInt(id));
    if (user) {
      const profileVal = user.profile !== undefined && user.profile !== null ? String(user.profile) : '';
      setForm(prev => ({
        ...prev,
        name: user.name,
        ap_paterno: user.ap_paterno || '',
        ap_materno: user.ap_materno || '',
        email: user.email,
        password: user.password,
        repeatPassword: user.password,
        profile: profileVal,
        status: user.status,
        dependencia_id: user.dependencia_id?.toString() || ''
      }));
      setValue('profile', profileVal, { shouldValidate: true });

      // Si el usuario tiene una dependencia, cargamos sus datos
      if (user.dependencia_id) {
        const loadDependenciaData = async () => {
          setIsLoadingDependencias(true);
          try {
            // Obtener la dependencia específica por su ID
            const response = await dependenciasService.getDependenciaById(user.dependencia_id);
            
            if (response?.JsonResponse?.data?.dependencia) {
              const depData = response.JsonResponse.data.dependencia;
              
              // Establecer los valores iniciales
              setSelectedSecretaria(depData.secretaria_id);
              setSelectedDireccion(depData.direccion_id);
              setSelectedOficina(depData.oficina_id);

              // Cargar todas las dependencias necesarias en paralelo
              const [secretariasData, direccionesData, oficinasData] = await Promise.all([
                dependenciasService.getSecretarias(),
                dependenciasService.getDirecciones(depData.secretaria_id),
                dependenciasService.getOficinas(depData.direccion_id, depData.secretaria_id)
              ]);

              // Actualizar los estados con los datos obtenidos
              setSecretarias(secretariasData || []);
              setDirecciones(direccionesData || []);
              setOficinas(oficinasData || []);

            }
          } catch (error) {
            console.error('Error al cargar datos de dependencia:', error);
          } finally {
            setIsLoadingDependencias(false);
          }
        };

        loadDependenciaData();
      }
    }
  }, [id, users]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'secretaria_id') {
      setSelectedSecretaria(value);
      setSelectedDireccion('');
      setSelectedOficina('');
      setDirecciones([]);
      setOficinas([]);
      
      // Cargar nuevas direcciones
      const loadNewDirecciones = async () => {
        try {
          const data = await dependenciasService.getDirecciones(value);
          setDirecciones(data || []);
        } catch (error) {
          console.error('Error al cargar direcciones:', error);
          setDirecciones([]);
        }
      };
      loadNewDirecciones();

      setForm(prev => ({
        ...prev,
        secretaria_id: value,
        direccion_id: '',
        oficina_id: '',
        dependencia_id: ''
      }));
      setValue('secretaria_id', value, { shouldValidate: true });
    } else if (name === 'direccion_id') {
      setSelectedDireccion(value);
      setSelectedOficina('');
      setOficinas([]);
      
      // Cargar nuevas oficinas
      const loadNewOficinas = async () => {
        try {
          const data = await dependenciasService.getOficinas(value, selectedSecretaria);
          setOficinas(data || []);
        } catch (error) {
          console.error('Error al cargar oficinas:', error);
          setOficinas([]);
        }
      };
      loadNewOficinas();

      setForm(prev => ({
        ...prev,
        direccion_id: value,
        oficina_id: '',
        dependencia_id: ''
      }));
      setValue('direccion_id', value, { shouldValidate: true });
    } else if (name === 'oficina_id') {
      setSelectedOficina(value);
      const oficinaSeleccionada = oficinas.find(ofi => ofi.oficina_id === value);
      setForm(prev => ({
        ...prev,
        oficina_id: value,
        dependencia_id: oficinaSeleccionada ? oficinaSeleccionada.id.toString() : ''
      }));
      setValue('oficina_id', value, { shouldValidate: true });
    } else {
      // Convertir a mayúsculas para nombre y apellidos
      const newValue = (name === 'name' || name === 'ap_paterno' || name === 'ap_materno') 
        ? value.toUpperCase() 
        : (type === 'checkbox' ? checked : value);

      setForm(prev => ({
        ...prev,
        [name]: newValue
      }));
      setValue(name, newValue, { shouldValidate: true });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que las contraseñas coincidan si se está actualizando la contraseña
    if (form.password && form.password !== form.repeatPassword) {
      Swal.fire({
        title: 'Error',
        text: 'Las contraseñas no coinciden',
        icon: 'error'
      });
      return;
    }
    
    try {
      const userData = { ...form };
      
      // Solo incluir la contraseña si se proporcionó una nueva
      if (!userData.password) {
        delete userData.password;
      } else {
        // Validar longitud mínima de contraseña
        if (userData.password.length < 8) {
          Swal.fire({
            title: 'Error',
            text: 'La contraseña debe tener al menos 8 caracteres',
            icon: 'error'
          });
          return;
        }
      }
      
      // Eliminar el campo de repetición de contraseña antes de enviar
      delete userData.repeatPassword;

      // Convertir a mayúsculas antes de enviar
      userData.name = userData.name.toUpperCase();
      userData.ap_paterno = userData.ap_paterno.toUpperCase();
      userData.ap_materno = userData.ap_materno.toUpperCase();

      // Agregar información de paginación para el backend
      userData.per_page = 50; // Valor por defecto
      userData.search = ''; // Búsqueda vacía por defecto
     
      const result = await dispatch(updateUser({ id: parseInt(id), userData }));
      
      if (result.meta.requestStatus === 'fulfilled') {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Usuario actualizado correctamente',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        navigate('/catalogo-usuarios');
      }
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: error || 'Ocurrió un error al actualizar el usuario',
        icon: 'error'
      });
    }
  };

  // Estilos para el formulario
  const formStyles = {
    section: "bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200",
    sectionTitle: "text-lg font-semibold text-gray-800 mb-4 flex items-center",
    sectionIcon: "mr-2 text-blue-600 w-5 h-5",
    inputGroup: "relative mb-6 group",
    inputLabel: "block text-sm font-medium text-gray-700 mb-1.5 flex items-center",
    inputField: (hasError) => `block w-full px-4 py-2.5 rounded-lg border ${hasError ? 'border-red-500' : 'border-gray-300'} 
      focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`,
    errorText: "mt-1.5 text-sm text-red-600",
    buttonPrimary: `w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white font-medium 
      rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 
      focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200`,
    buttonSecondary: `w-full sm:w-auto px-6 py-2.5 bg-white border border-gray-300 
      text-gray-700 font-medium rounded-lg hover:bg-gray-50 
      focus:outline-none focus:ring-2 focus:ring-blue-500 
      focus:ring-offset-2 transition-all duration-200`,
    passwordToggle: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Editar Usuario</h1>
        <button
          onClick={() => navigate('/catalogo-usuarios')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Volver
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-8">
        {/* Sección de Información Personal */}
        <div className={formStyles.section}>
          <h2 className={formStyles.sectionTitle}>
            <svg className={formStyles.sectionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Información Personal
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Nombre */}
            <div className={formStyles.inputGroup}>
              <label htmlFor="name" className={formStyles.inputLabel}>
                <svg className="w-4 h-4 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Nombre(s)
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={form.name}
                onChange={handleChange}
                className={`${formStyles.inputField(!!errors.name)} uppercase`}
                required
                autoComplete="off"
              />
              {errors.name && (
                <p className={formStyles.errorText}>{errors.name.message}</p>
              )}
            </div>

            {/* Apellido Paterno */}
            <div className={formStyles.inputGroup}>
              <label htmlFor="ap_paterno" className={formStyles.inputLabel}>
                <svg className="w-4 h-4 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Apellido Paterno
              </label>
              <input
                type="text"
                name="ap_paterno"
                id="ap_paterno"
                value={form.ap_paterno}
                onChange={handleChange}
                className={`${formStyles.inputField(!!errors.ap_paterno)} uppercase`}
                required
                autoComplete="off"
              />
              {errors.ap_paterno && (
                <p className={formStyles.errorText}>{errors.ap_paterno.message}</p>
              )}
            </div>

            {/* Apellido Materno */}
            <div className={formStyles.inputGroup}>
              <label htmlFor="ap_materno" className={formStyles.inputLabel}>
                <svg className="w-4 h-4 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Apellido Materno
              </label>
              <input
                type="text"
                name="ap_materno"
                id="ap_materno"
                value={form.ap_materno}
                onChange={handleChange}
                className={`${formStyles.inputField(!!errors.ap_materno)} uppercase`}
                required
                autoComplete="off"
              />
              {errors.ap_materno && (
                <p className={formStyles.errorText}>{errors.ap_materno.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sección de Credenciales */}
        <div className={formStyles.section}>
          <div className="mb-6">
            <h2 className={formStyles.sectionTitle}>
              <svg className={formStyles.sectionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Credenciales de Acceso
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div className={formStyles.inputGroup}>
              <label htmlFor="email" className={formStyles.inputLabel}>
                <svg className="w-4 h-4 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Correo Electrónico
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={form.email}
                onChange={handleChange}
                className={formStyles.inputField(!!errors.email)}
                required
                autoComplete="email"
              />
              {errors.email && (
                <p className={formStyles.errorText}>{errors.email.message}</p>
              )}
            </div>

            {/* Botón para mostrar/ocultar campos de contraseña */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => setShowPasswordFields(!showPasswordFields)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                {showPasswordFields ? (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                    Ocultar contraseña
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Cambiar contraseña
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Campos de contraseña */}
          {showPasswordFields && (
            <div className="mt-4 space-y-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-md font-medium text-gray-700">Cambiar contraseña</h3>
              <p className="text-sm text-gray-500 mb-4">Deja estos campos en blanco si no deseas cambiar la contraseña.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contraseña */}
                <div className={formStyles.inputGroup}>
                  <label htmlFor="password" className={formStyles.inputLabel}>
                    <svg className="w-4 h-4 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      id="password"
                      value={form.password}
                      onChange={handleChange}
                      className={`${formStyles.inputField(!!errors.password)} pr-10`}
                      placeholder="Ingresa la nueva contraseña"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className={formStyles.passwordToggle}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  {errors.password ? (
                    <p className={formStyles.errorText}>{errors.password.message}</p>
                  ) : (
                    <p className="mt-1 text-xs text-gray-500">Mínimo 8 caracteres</p>
                  )}
                </div>

              {/* Repetir Contraseña */}
              <div className={formStyles.inputGroup}>
                <label htmlFor="repeatPassword" className={formStyles.inputLabel}>
                  <svg className="w-4 h-4 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showRepeatPassword ? "text" : "password"}
                    name="repeatPassword"
                    id="repeatPassword"
                    value={form.repeatPassword}
                    onChange={handleChange}
                    className={`${formStyles.inputField(!!errors.repeatPassword)} pr-10`}
                    placeholder="Confirma la nueva contraseña"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className={formStyles.passwordToggle}
                    onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                    aria-label={showRepeatPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showRepeatPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                {errors.repeatPassword && (
                  <p className={formStyles.errorText}>{errors.repeatPassword.message}</p>
                )}
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Sección de Rol y Estado */}
        <div className={formStyles.section}>
          <h2 className={formStyles.sectionTitle}>
            <svg className={formStyles.sectionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Rol y Estado
          </h2>
          <div className="space-y-6">
            {/* Perfil */}
            <div className={formStyles.inputGroup}>
            {(() => {
              const profileOptions = [
                { value: "1", label: "Administrador" },
                { value: "2", label: "Operativo" },
                { value: "3", label: "Enlace" },
              ];
              const selectedProfile = profileOptions.find(o => o.value === String(form.profile)) || null;
              return (
              <CustomSelect
                id="profile"
                name="profile"
                value={selectedProfile}
                onChange={(option) => handleChange({
                  target: {
                    name: 'profile',
                    value: option.value
                  }
                })}
                options={profileOptions}
                isMulti={false}
                placeholder="Seleccione un perfil"
                error={errors.profile}
              />
              );
            })()}
            <label
              htmlFor="profile"
              className="absolute text-base sm:text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0]"
            >
              Perfil
            </label>
            {errors.profile && (
              <p className="mt-1 text-sm text-red-600">{errors.profile.message}</p>
            )}
          </div>

          {/* Estado */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <CustomSelect
              id="status"
              name="status"
              value={{
                value: form.status,
                label: form.status ? "Activo" : "Inactivo"
              }}
              onChange={(option) => handleChange({
                target: {
                  name: 'status',
                  value: option.value
                }
              })}
              options={[
                { value: true, label: "Activo" },
                { value: false, label: "Inactivo" }
              ]}
              isMulti={false}
              placeholder="Seleccione un estado"
            />
            <label
              htmlFor="status"
              className="absolute text-base sm:text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0]"
            >
              Estado
            </label>
          </div>

          {/* Secretaría */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <CustomSelect
              id="secretaria_id"
              name="secretaria_id"
              value={secretarias.find(sec => sec.secretaria_id === selectedSecretaria)
                ? { value: selectedSecretaria, label: secretarias.find(sec => sec.secretaria_id === selectedSecretaria).secretaria }
                : null}
              onChange={(option) => handleChange({
                target: {
                  name: 'secretaria_id',
                  value: option ? option.value : ''
                }
              })}
              options={secretarias.map(sec => ({
                value: sec.secretaria_id,
                label: sec.secretaria
              }))}
              isMulti={false}
              placeholder="Seleccione una secretaría"
              isDisabled={isLoadingDependencias}
              error={errors.secretaria_id}
            />
            <label
              htmlFor="secretaria_id"
              className="absolute text-base sm:text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0]"
            >
              Secretaría
            </label>
            {errors.secretaria_id && (
              <p className="mt-1 text-sm text-red-600">{errors.secretaria_id.message}</p>
            )}
          </div>

          {/* Dirección */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <CustomSelect
              id="direccion_id"
              name="direccion_id"
              value={direcciones.find(dir => dir.direccion_id === selectedDireccion)
                ? { value: selectedDireccion, label: direcciones.find(dir => dir.direccion_id === selectedDireccion).direccion }
                : null}
              onChange={(option) => handleChange({
                target: {
                  name: 'direccion_id',
                  value: option ? option.value : ''
                }
              })}
              options={direcciones.map(dir => ({
                value: dir.direccion_id,
                label: dir.direccion
              }))}
              isMulti={false}
              placeholder="Seleccione una dirección"
              isDisabled={!selectedSecretaria || isLoadingDependencias}
              error={errors.direccion_id}
            />
            <label
              htmlFor="direccion_id"
              className="absolute text-base sm:text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0]"
            >
              Unidad administrativa
            </label>
            {errors.direccion_id && (
              <p className="mt-1 text-sm text-red-600">{errors.direccion_id.message}</p>
            )}
          </div>

          {/* Oficina */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <CustomSelect
              id="oficina_id"
              name="oficina_id"
              value={oficinas.find(ofi => ofi.oficina_id === selectedOficina)
                ? { value: selectedOficina, label: oficinas.find(ofi => ofi.oficina_id === selectedOficina).oficina }
                : null}
              onChange={(option) => handleChange({
                target: {
                  name: 'oficina_id',
                  value: option ? option.value : ''
                }
              })}
              options={oficinas.map(ofi => ({
                value: ofi.oficina_id,
                label: ofi.oficina
              }))}
              isMulti={false}
              placeholder="Seleccione una oficina"
              isDisabled={!selectedDireccion || isLoadingDependencias}
              error={errors.oficina_id}
            />
            <label
              htmlFor="oficina_id"
              className="absolute text-base sm:text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0]"
            >
              Área
            </label>
            {errors.oficina_id && (
              <p className="mt-1 text-sm text-red-600">{errors.oficina_id.message}</p>
            )}
          </div>
        </div>

        {/* Campo oculto para dependencia_id */}
        <input type="hidden" name="dependencia_id" value={form.dependencia_id} />
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <SubmitButton
          type="button"
          variant="secondary"
          onClick={() => navigate('/catalogo-usuarios')}
          className="px-6 py-2.5"
        >
          Cancelar
        </SubmitButton>
        <SubmitButton
          type="submit"
          loading={loading}
          className="px-6 py-2.5"
        >
          Guardar Cambios
        </SubmitButton>
      </div>
    </form>
    {isLoadingDependencias && <LoadingSpinner overlay />}
  </div>
);
};

export default UsuarioEdit;