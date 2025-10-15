import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createUser, clearError, clearSuccessMessage } from '../../features/users/usersSlice';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import CustomSelect from '../common/CustomSelect';
import Swal from 'sweetalert2';
import { dependenciasService } from '../../services/dependenciasService';
import LoadingSpinner from '../common/LoadingSpinner';
import SubmitButton from '../common/SubmitButton';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const UsuarioForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, successMessage } = useSelector((state) => state.users);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      name: '',
      ap_paterno: '',
      ap_materno: '',
      email: '',
      password: '',
      repeatPassword: '',
      profile: '2',
      dependencia_id: '',
      secretaria_id: '',
      direccion_id: '',
      oficina_id: ''
    }
  });

  // Registrar los campos requeridos
  useEffect(() => {
    register('secretaria_id', { required: 'Este campo es requerido' });
    register('direccion_id', { required: 'Este campo es requerido' });
    register('oficina_id', { required: 'Este campo es requerido' });
  }, [register]);

  // Estados para los nuevos campos
  const [secretarias, setSecretarias] = useState([]);
  const [direcciones, setDirecciones] = useState([]);
  const [oficinas, setOficinas] = useState([]);
  const [selectedSecretaria, setSelectedSecretaria] = useState('');
  const [selectedDireccion, setSelectedDireccion] = useState('');
  const [selectedOficina, setSelectedOficina] = useState('');
  const [isLoadingDependencias, setIsLoadingDependencias] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Función para encontrar el primer campo vacío
  const findFirstEmptyField = (data) => {
    const requiredFields = [
      'name',
      'ap_paterno',
      'ap_materno',
      'email',
      'password',
      'repeatPassword',
      'profile',
      'dependencia_id',
      'secretaria_id',
      'direccion_id',
      'oficina_id'
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return field;
      }
    }
    return null;
  };

  // Cargar secretarías
  useEffect(() => {
    const loadSecretarias = async () => {
      setIsLoadingDependencias(true);
      try {
        const data = await dependenciasService.getSecretarias();
        setSecretarias(data);
      } catch (error) {
        setSecretarias([]);
      } finally {
        setIsLoadingDependencias(false);
      }
    };
    loadSecretarias();
  }, []);

  // Cargar direcciones
  useEffect(() => {
    const loadDirecciones = async () => {
      if (selectedSecretaria) {
        setIsLoadingDependencias(true);
        try {
          const data = await dependenciasService.getDirecciones(selectedSecretaria);
          setDirecciones(data);
        } catch (error) {
          console.error('Error al cargar direcciones en el componente:', error);
          setDirecciones([]);
        } finally {
          setIsLoadingDependencias(false);
        }
      } else {
        setDirecciones([]);
      }
    };
    loadDirecciones();
  }, [selectedSecretaria]);

  // Cargar oficinas
  useEffect(() => {
    const loadOficinas = async () => {
      if (selectedDireccion && selectedSecretaria) {
        setIsLoadingDependencias(true);
        try {
          const data = await dependenciasService.getOficinas(selectedDireccion, selectedSecretaria);
          setOficinas(data);
        } catch (error) {
          setOficinas([]);
        } finally {
          setIsLoadingDependencias(false);
        }
      } else {
        setOficinas([]);
      }
    };
    loadOficinas();
  }, [selectedDireccion, selectedSecretaria]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'secretaria_id') {
      setSelectedSecretaria(value);
      setSelectedDireccion('');
      setSelectedOficina('');
      setDirecciones([]);
      setOficinas([]);
      setValue('dependencia_id', '');
    } else if (name === 'direccion_id') {
      setSelectedDireccion(value);
      setSelectedOficina('');
      setOficinas([]);
      setValue('dependencia_id', '');
    } else if (name === 'oficina_id') {
      setSelectedOficina(value);
      const oficinaSeleccionada = oficinas.find(ofi => ofi.oficina_id === value);
      setValue('dependencia_id', oficinaSeleccionada ? oficinaSeleccionada.id.toString() : '');
    } else {
      // Convertir a mayúsculas para nombre y apellidos
      if (name === 'name' || name === 'ap_paterno' || name === 'ap_materno') {
        setValue(name, value.toUpperCase());
      } else {
        setValue(name, type === 'checkbox' ? checked : value);
      }
    }

    if (name === 'password' || name === 'repeatPassword') {
      const password = name === 'password' ? value : watch('password');
      const repeatPassword = name === 'repeatPassword' ? value : watch('repeatPassword');
      
      if (password && repeatPassword && password !== repeatPassword) {
        setPasswordError('Las contraseñas no coinciden');
      } else {
        setPasswordError('');
      }
    }
  };

  const onSubmit = async (data) => {
    if (data.password !== data.repeatPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    // Convertir a mayúsculas antes de enviar
    const formData = {
      ...data,
      name: data.name.toUpperCase(),
      ap_paterno: data.ap_paterno.toUpperCase(),
      ap_materno: data.ap_materno.toUpperCase(),
      // Agregar información de paginación para el backend
      per_page: 50, // Valor por defecto
      search: '' // Búsqueda vacía por defecto
    };

    try {
      const result = await dispatch(createUser(formData));
      
      if (result.meta.requestStatus === 'fulfilled') {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Usuario creado correctamente',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        navigate('/catalogo-usuarios');
      }
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: error || 'Ocurrió un error al crear el usuario',
        icon: 'error'
      });
    }
  };

  return (
    <>
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Crear Usuario</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6 bg-blue-100 p-3 sm:p-4 md:p-6 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {/* Nombre */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              id="name"
              type="text"
              {...register('name', { required: 'Este campo es requerido' })}
              className={`block py-2 sm:py-2.5 px-0 w-full text-base sm:text-lg text-gray-900 uppercase ${!watch('name') ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 ${errors.name ? 'border-red-500' : 'border-gray-500'} appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer placeholder-transparent`}
              placeholder=" "
              autoComplete="off"
            />
            <label
              htmlFor="name"
              className="peer-focus:font-medium absolute text-base sm:text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 cursor-pointer"
            >
              Nombre
            </label>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Apellido Paterno */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              id="ap_paterno"
              type="text"
              {...register('ap_paterno', { required: 'Este campo es requerido' })}
              className={`block py-2 sm:py-2.5 px-0 w-full text-base sm:text-lg text-gray-900 uppercase ${!watch('ap_paterno') ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 ${errors.ap_paterno ? 'border-red-500' : 'border-gray-500'} appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer placeholder-transparent`}
              placeholder=" "
              autoComplete="off"
            />
            <label
              htmlFor="ap_paterno"
              className="peer-focus:font-medium absolute text-base sm:text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 cursor-pointer"
            >
              Apellido Paterno
            </label>
            {errors.ap_paterno && (
              <p className="mt-1 text-sm text-red-600">{errors.ap_paterno.message}</p>
            )}
          </div>

          {/* Apellido Materno */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              id="ap_materno"
              type="text"
              {...register('ap_materno', { required: 'Este campo es requerido' })}
              className={`block py-2 sm:py-2.5 px-0 w-full text-base sm:text-lg text-gray-900 uppercase ${!watch('ap_materno') ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 ${errors.ap_materno ? 'border-red-500' : 'border-gray-500'} appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer placeholder-transparent`}
              placeholder=" "
              autoComplete="off"
            />
            <label
              htmlFor="ap_materno"
              className="peer-focus:font-medium absolute text-base sm:text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 cursor-pointer"
            >
              Apellido Materno
            </label>
            {errors.ap_materno && (
              <p className="mt-1 text-sm text-red-600">{errors.ap_materno.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              id="email"
              type="email"
              {...register('email', { 
                required: 'Este campo es requerido',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido'
                }
              })}
              className={`block py-2 sm:py-2.5 px-0 w-full text-base sm:text-lg text-gray-900 ${!watch('email') ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 ${errors.email ? 'border-red-500' : 'border-gray-500'} appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer placeholder-transparent`}
              placeholder=" "
              autoComplete="off"
            />
            <label
              htmlFor="email"
              className="peer-focus:font-medium absolute text-base sm:text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 cursor-pointer"
            >
              Email
            </label>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Perfil */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <CustomSelect
              id="profile"
              name="profile"
              value={{
                value: watch('profile') || "2",
                label: watch('profile') === "1" ? "Administrador" : "Operativo"
              }}
              onChange={(option) => {
                setValue('profile', option.value);
                handleChange({
                  target: {
                    name: 'profile',
                    value: option.value
                  }
                });
              }}
              options={[
                { value: "1", label: "Administrador" },
                { value: "2", label: "Operativo" },
                { value: "3", label: "Enlace" },
              ]}
              isMulti={false}
              placeholder="Seleccione un perfil"
            />
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

          {/* Contraseña */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register('password', { 
                required: 'Este campo es requerido',
                minLength: {
                  value: 6,
                  message: 'La contraseña debe tener al menos 6 caracteres'
                }
              })}
              className={`block py-2 sm:py-2.5 px-0 w-full text-base sm:text-lg text-gray-900 ${!watch('password') ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 ${errors.password ? 'border-red-500' : 'border-gray-500'} appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer placeholder-transparent`}
              placeholder=" "
              autoComplete="new-password"
            />
            <label
              htmlFor="password"
              className="peer-focus:font-medium absolute text-base sm:text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 cursor-pointer"
            >
              Contraseña
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Repetir Contraseña */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              id="repeatPassword"
              type={showRepeatPassword ? "text" : "password"}
              {...register('repeatPassword', { 
                required: 'Este campo es requerido',
                validate: value => value === watch('password') || 'Las contraseñas no coinciden'
              })}
              className={`block py-2 sm:py-2.5 px-0 w-full text-base sm:text-lg text-gray-900 ${!watch('repeatPassword') ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 ${errors.repeatPassword ? 'border-red-500' : 'border-gray-500'} appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer placeholder-transparent`}
              placeholder=" "
              autoComplete="new-password"
            />
            <label
              htmlFor="repeatPassword"
              className="peer-focus:font-medium absolute text-base sm:text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 cursor-pointer"
            >
              Repetir Contraseña
            </label>
            <button
              type="button"
              onClick={() => setShowRepeatPassword(!showRepeatPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showRepeatPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
            {errors.repeatPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.repeatPassword.message}</p>
            )}
          </div>

          {/* Secretaría */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <CustomSelect
              id="secretaria_id"
              name="secretaria_id"
              value={secretarias.find(sec => sec.secretaria_id === selectedSecretaria)
                ? { value: selectedSecretaria, label: secretarias.find(sec => sec.secretaria_id === selectedSecretaria).secretaria }
                : null}
              onChange={(option) => {
                handleChange({
                  target: {
                    name: 'secretaria_id',
                    value: option ? option.value : ''
                  }
                });
                setValue('secretaria_id', option ? option.value : '', { shouldValidate: true });
              }}
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
              <p className="mt-1 text-sm text-red-600">Este campo es requerido</p>
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
              onChange={(option) => {
                handleChange({
                  target: {
                    name: 'direccion_id',
                    value: option ? option.value : ''
                  }
                });
                setValue('direccion_id', option ? option.value : '', { shouldValidate: true });
              }}
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
              <p className="mt-1 text-sm text-red-600">Este campo es requerido</p>
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
              onChange={(option) => {
                handleChange({
                  target: {
                    name: 'oficina_id',
                    value: option ? option.value : ''
                  }
                });
                setValue('oficina_id', option ? option.value : '', { shouldValidate: true });
              }}
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
              <p className="mt-1 text-sm text-red-600">Este campo es requerido</p>
            )}
          </div>

          {/* Campo oculto para dependencia_id */}
          <input type="hidden" name="dependencia_id" value={watch('dependencia_id')} />
        </div>

        <div className="flex justify-end space-x-3">
          <SubmitButton
            type="button"
            variant="secondary"
            onClick={() => navigate('/catalogo-usuarios')}
          >
            Cancelar
          </SubmitButton>
          <SubmitButton
            type="submit"
            loading={loading}
            disabled={!!passwordError}
          >
            Guardar
          </SubmitButton>
        </div>
      </form>
      {isLoadingDependencias && <LoadingSpinner overlay />}
    </>
  );
};

export default UsuarioForm; 