import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createInventarioGEM, getInventarioGEM, updateInventarioGEM, nuevaAsignacion, tieneHistorial } from '../../features/inventarioGEM/inventarioGEMSlice';
import { useForm } from 'react-hook-form';
import { dependenciasService } from '../../services/dependenciasService';
import { municipiosService } from '../../services/municipiosService';
import Swal from 'sweetalert2';
import CustomSelect from '../common/CustomSelect';
import LoadingSpinner from '../common/LoadingSpinner';
import SubmitButton from '../common/SubmitButton';
import { FaFilePdf, FaImage, FaTimes } from 'react-icons/fa';
import { BASE_URL } from '../../services/api';
import { inventarioGEMService } from '../../services/inventarioGEMService';
import { CATALOGOS } from '../../constants/catalogos';
import { getDireccionesActivas } from '../../features/direcciones/direccionesSlice';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const InventarioGEMForm = ({ equipoId, isEditing, initialData }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [tieneHistorialData, setTieneHistorialData] = useState(false);
  const [showFieldHelp, setShowFieldHelp] = useState(true);

  // Referencias para los CustomSelect
  const secretariaRef = useRef(null);
  const direccionRef = useRef(null);
  const oficinaRef = useRef(null);
  const municipioRef = useRef(null);

  // Estados para dependencias
  const [secretarias, setSecretarias] = useState([]);
  const [direcciones, setDirecciones] = useState([]);
  const [oficinas, setOficinas] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [direccionesActivas, setDireccionesActivas] = useState([]);
  const [selectedSecretaria, setSelectedSecretaria] = useState('');
  const [selectedDireccion, setSelectedDireccion] = useState('');
  const [selectedOficina, setSelectedOficina] = useState('');
  const [isLoadingDependencias, setIsLoadingDependencias] = useState(true);
  const [isLoadingMunicipios, setIsLoadingMunicipios] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Estados para archivos
  const [selectedFiles, setSelectedFiles] = useState({
    inv_gem_foto1: null,
    inv_gem_foto2: null,
    inv_gem_foto3: null,
    inv_gem_foto4: null
  });
  const [previewUrls, setPreviewUrls] = useState({
    inv_gem_foto1: null,
    inv_gem_foto2: null,
    inv_gem_foto3: null,
    inv_gem_foto4: null
  });
  const [filesToDelete, setFilesToDelete] = useState({});
  const [previewModal, setPreviewModal] = useState({ url: null, type: null });

  const { register, handleSubmit, formState: { errors }, setValue, reset, trigger, watch, setError, clearErrors } = useForm();

  // Registrar los campos requeridos
  useEffect(() => {
    register('secretaria_id', { 
      required: 'Este campo es requerido',
      validate: value => value !== '' || 'Este campo es requerido'
    });
    register('direccion_id', { 
      required: 'Este campo es requerido',
      validate: value => value !== '' || 'Este campo es requerido'
    });
    register('oficina_id', { 
      required: 'Este campo es requerido',
      validate: value => value !== '' || 'Este campo es requerido'
    });
    register('equipo_completo', { 
      required: 'Este campo es requerido',
      validate: value => value !== '' || 'Este campo es requerido'
    });
    register('direccion', { 
      required: 'Este campo es requerido',
      validate: value => value !== '' || 'Este campo es requerido'
    });
  }, [register]);

  const [form, setForm] = useState({
    dependencia_id: '',
    id_municipio: '126',
    user_id: '',
  });

  // Determinar si es edición basado en isEditing o si existe el inventario
  const [isEditMode, setIsEditMode] = useState(isEditing);
  const [userData, setUserData] = useState(null);

  // Función para reintentar una operación con un número máximo de intentos
  const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        return result;
      } catch (error) {
        lastError = error;
        console.warn(`Intento ${attempt} fallido, reintentando...`, error);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
      }
    }
    throw lastError || new Error('Operación fallida después de múltiples intentos');
  };

  // Console log para el equipoId
  useEffect(() => {
    if (!equipoId) {
      console.error('No se recibió el ID del equipo en InventarioGEMForm');
      Swal.fire({
        title: 'Error',
        text: 'No se recibió el ID del equipo',
        icon: 'error'
      });
    }
  }, [equipoId]);

  // Función para obtener la URL pública del archivo
  const getPublicUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('blob:')) return path; // Para archivos recién seleccionados
    if (path.startsWith('http')) return path;
    return `${BASE_URL}/storage/${path}`;
  };

  // Cargar datos del inventario si existe
  useEffect(() => {
    const loadInventarioData = async () => {
      try {
        if (!equipoId) {
          console.error('No hay ID de equipo para cargar el inventario');
          return;
        }

        // Cargar datos del inventario con reintentos
        const response = await retryOperation(
          () => dispatch(getInventarioGEM(equipoId)).unwrap()
        );
        
        if (response && Object.keys(response).length > 0) {
          setIsEditMode(true);
          // Establecer valores en el formulario
          for (const key of Object.keys(response)) {
            if (response[key] !== null && response[key] !== undefined) {
              setValue(key, response[key]);
              if (key === 'id_municipio') {
                setForm(prev => ({
                  ...prev,
                  id_municipio: response[key].toString()
                }));
              }
              if (key === 'user_id') {
                setForm(prev => ({
                  ...prev,
                  user_id: response[key]
                }));
              }
              // Establecer URLs de vista previa para archivos
              if (key.startsWith('inv_gem_foto') && response[key]) {
                setPreviewUrls(prev => ({
                  ...prev,
                  [key]: getPublicUrl(response[key])
                }));
                setFilesToDelete(prev => ({ 
                  ...prev, 
                  [key]: null
                }));
              }
            }
          }

          // Establecer los datos del usuario si están disponibles
          if (response.user) {
            setUserData(response.user);
          }

          // Si tenemos la dependencia_id, cargar la jerarquía completa con reintentos
          if (response.dependencia_id) {
            try {
              const depResponse = await retryOperation(
                () => dependenciasService.getDependenciaById(response.dependencia_id)
              );
              
              if (depResponse?.JsonResponse?.data?.dependencia) {
                const depData = depResponse.JsonResponse.data.dependencia;
                
                // Establecer los valores en el estado y en el formulario
                setSelectedSecretaria(depData.secretaria_id);
                setSelectedDireccion(depData.direccion_id);
                setSelectedOficina(depData.oficina_id);

                // Establecer los valores en react-hook-form
                setValue('secretaria_id', depData.secretaria_id, { shouldValidate: true });
                setValue('direccion_id', depData.direccion_id, { shouldValidate: true });
                setValue('oficina_id', depData.oficina_id, { shouldValidate: true });

                // Cargar direcciones con reintentos
                const direccionesData = await retryOperation(
                  () => dependenciasService.getDirecciones(depData.secretaria_id)
                );
                setDirecciones(direccionesData || []);

                // Cargar oficinas con reintentos
                const oficinasData = await retryOperation(
                  () => dependenciasService.getOficinas(depData.direccion_id, depData.secretaria_id)
                );
                setOficinas(oficinasData || []);
              }
            } catch (error) {
              console.error('Error al cargar la jerarquía de dependencias después de reintentos:', error);
              // Continuar sin fallar completamente, pero con datos parciales
              setDirecciones([]);
              setOficinas([]);
            }
          }
        }
      } catch (error) {
        setIsEditMode(false);
        console.error('Error al cargar datos del inventario después de reintentos:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron cargar los datos del inventario después de varios intentos. Por favor, intente de nuevo más tarde.',
          icon: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadInventarioData();
  }, [equipoId, dispatch, setValue]);

  // Si tenemos datos iniciales, establecerlos
  useEffect(() => {
    if (initialData) {
      Object.keys(initialData).forEach(key => {
        if (initialData[key] !== null && initialData[key] !== undefined) {
          setValue(key, initialData[key]);
        }
      });
    }
  }, [initialData, setValue]);

  // Cargar secretarías, municipios y direcciones activas
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingDependencias(true);
      setIsLoadingMunicipios(true);
      try {
        // Cargar secretarías
        const secretariasData = await dependenciasService.getSecretarias();
        setSecretarias(secretariasData);

        // Cargar municipios
        const municipiosData = await municipiosService.getMunicipios();
        setMunicipios(municipiosData);

        // Cargar direcciones activas
        const direccionesResponse = await dispatch(getDireccionesActivas()).unwrap();
        setDireccionesActivas(direccionesResponse.data || direccionesResponse);
        
        // Establecer el valor por defecto en el formulario
        setValue('id_municipio', '126');
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        Swal.fire({
          title: 'Error',
          text: 'Error al cargar los datos necesarios',
          icon: 'error'
        });
      } finally {
        setIsLoadingDependencias(false);
        setIsLoadingMunicipios(false);
        setIsInitialLoading(false);
      }
    };
    loadInitialData();
  }, [dispatch, setValue]);

  // Cargar direcciones
  useEffect(() => {
    const loadDirecciones = async () => {
      if (selectedSecretaria) {
        setIsLoadingDependencias(true);
        try {
          const data = await dependenciasService.getDirecciones(selectedSecretaria);
          setDirecciones(data);
        } catch (error) {
          console.error('Error al cargar direcciones:', error);
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
          console.error('Error al cargar oficinas:', error);
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

  // Verificar si tiene historial
  useEffect(() => {
    const verificarHistorial = async () => {
      if (equipoId) {
        try {
          const response = await dispatch(tieneHistorial(equipoId)).unwrap();
          setTieneHistorialData(response.tiene_historial);
        } catch (error) {
          console.error('Error al verificar historial:', error);
        }
      }
    };

    verificarHistorial();
  }, [equipoId, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'secretaria_id') {
      setSelectedSecretaria(value);
      setSelectedDireccion('');
      setSelectedOficina('');
      setDirecciones([]);
      setOficinas([]);
      setValue('dependencia_id', '');
      setValue('direccion_id', '');
      setValue('oficina_id', '');
      
      // Cargar direcciones inmediatamente si hay un valor
      if (value) {
        dependenciasService.getDirecciones(value)
          .then(data => {
            setDirecciones(data || []);
          })
          .catch(error => {
            console.error('Error al cargar direcciones:', error);
            setDirecciones([]);
          });
      }
    } else if (name === 'direccion_id') {
      setSelectedDireccion(value);
      setSelectedOficina('');
      setOficinas([]);
      setValue('dependencia_id', '');
      setValue('oficina_id', '');
      
      // Cargar oficinas inmediatamente si hay un valor
      if (value && selectedSecretaria) {
        dependenciasService.getOficinas(value, selectedSecretaria)
          .then(data => {
            setOficinas(data || []);
          })
          .catch(error => {
            console.error('Error al cargar oficinas:', error);
            setOficinas([]);
          });
      }
    } else if (name === 'oficina_id') {
      setSelectedOficina(value);
      const oficinaSeleccionada = oficinas.find(ofi => ofi.oficina_id === value);
      if (oficinaSeleccionada) {
        setValue('dependencia_id', oficinaSeleccionada.id.toString());
      }
    } else if (name === 'id_municipio') {
      const municipioValue = value.toString();
      setForm(prev => ({
        ...prev,
        id_municipio: municipioValue
      }));
      setValue('id_municipio', municipioValue);
    }
  };

  // Función para manejar la selección de archivos
  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tamaño del archivo
    if (file.size > MAX_FILE_SIZE) {
      Swal.fire({
        title: 'Error',
        text: 'El archivo no debe superar los 2MB',
        icon: 'error'
      });
      return;
    }

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      Swal.fire({
        title: 'Error',
        text: 'Solo se permiten archivos PDF e imágenes (JPEG, PNG, GIF)',
        icon: 'error'
      });
      return;
    }

    setSelectedFiles(prev => ({
      ...prev,
      [fieldName]: file
    }));

    // Crear URL de vista previa
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrls(prev => ({
      ...prev,
      [fieldName]: fileUrl
    }));

    // Si seleccionamos un nuevo archivo, asegúrate de que no esté marcado para eliminar
    setFilesToDelete(prev => ({ ...prev, [fieldName]: null }));
  };

  // Función para eliminar archivo
  const handleRemoveFile = (fieldName) => {
    // Si hay un archivo existente (no una URL de blob), marcarlo para eliminar
    if (previewUrls[fieldName] && !previewUrls[fieldName].startsWith('blob:')) {
      setFilesToDelete(prev => ({ ...prev, [fieldName]: previewUrls[fieldName] }));
    } else {
      // Si es una URL de blob, simplemente la eliminamos localmente
      setFilesToDelete(prev => ({ ...prev, [fieldName]: null })); // Asegurarse de que no quede marcado para eliminar si era blob
    }
    // Eliminar el archivo de la vista previa y los archivos seleccionados localmente
    setSelectedFiles(prev => ({
      ...prev,
      [fieldName]: null
    }));
    setPreviewUrls(prev => ({
      ...prev,
      [fieldName]: null
    }));
    // Opcional: Limpiar el valor del campo en react-hook-form si es necesario,
    // pero con FormData no es estrictamente necesario si no lo añadimos
    // setValue(fieldName, null);
  };

  // Función para mostrar el modal de vista previa
  const handlePreview = (url, type) => {
    setPreviewModal({ url, type });
  };

  // Modificar la función limpiarDatos para incluir los archivos
  const limpiarDatos = (data) => {
    const formData = new FormData();
    
    // Agregar campos de texto
    Object.keys(data).forEach(key => {
      if (key !== 'inv_gem_foto1' && key !== 'inv_gem_foto2' && 
          key !== 'inv_gem_foto3' && key !== 'inv_gem_foto4') {
        formData.append(key, data[key]);
      }
    });

    // Agregar archivos
    Object.keys(selectedFiles).forEach(key => {
      if (selectedFiles[key]) {
        formData.append(key, selectedFiles[key]);
      }
    });

    // Agregar campos para indicar qué archivos existentes deben ser eliminados
    Object.keys(filesToDelete).forEach(key => {
      if (filesToDelete[key] !== null) { // Si no es null, significa que fue marcado para eliminar
        // Le decimos al backend que elimine el archivo asociado a este campo
        formData.append(`${key}_eliminar`, 'true');
      }
    });

    return formData;
  };

  // Función para encontrar el primer campo vacío
  const findFirstEmptyField = (data) => {
    const requiredFields = [
      'secretaria_id',
      'direccion_id',
      'oficina_id',
      'usuario',
      'equipo_completo'
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return field;
      }
    }
    return null;
  };

  // Exclusión mutua entre ALTUM, no_inventario y obs_no_inventario
  const altumValue = watch('service_tag');
  const folioValue = watch('no_inventario');
  const obsValue = watch('obs_no_inventario');
  
  // Resetear el estado del mensaje de ayuda cuando todos los campos estén vacíos
  useEffect(() => {
    if (!altumValue && !folioValue && !obsValue) {
      setShowFieldHelp(true);
    }
  }, [altumValue, folioValue, obsValue]);

  useEffect(() => {
    // Si ALTUM tiene valor, limpiar folio y obs y limpiar errores
    if (altumValue) {
      if (folioValue) setValue('no_inventario', '');
      if (obsValue) setValue('obs_no_inventario', '');
      clearErrors(['no_inventario', 'obs_no_inventario']);
    }
  }, [altumValue]);

  useEffect(() => {
    // Si folio tiene valor, limpiar ALTUM y obs
    if (folioValue) {
      if (altumValue) setValue('service_tag', '');
      if (obsValue) setValue('obs_no_inventario', '');
      clearErrors(['service_tag', 'obs_no_inventario']);
    }
  }, [folioValue]);

  useEffect(() => {
    // Si obs_no_inventario tiene valor, limpiar ALTUM y folio
    if (obsValue) {
      if (altumValue) setValue('service_tag', '');
      if (folioValue) setValue('no_inventario', '');
      clearErrors(['service_tag', 'no_inventario']);
    }
  }, [obsValue]);

  // Modificar onSubmit para validar y enfocar campos vacíos
  const onSubmit = async (data) => {
    try {
      // Validar todos los campos
      const isValid = await trigger();
      if (!isValid) {
        const firstEmptyField = findFirstEmptyField(data);
        if (firstEmptyField) {
          let elementToFocus = null;
          
          // Manejar campos específicos de CustomSelect
          switch (firstEmptyField) {
            case 'secretaria_id':
              elementToFocus = secretariaRef.current?.querySelector('input');
              break;
            case 'direccion_id':
              elementToFocus = direccionRef.current?.querySelector('input');
              break;
            case 'oficina_id':
              elementToFocus = oficinaRef.current?.querySelector('input');
              break;
            case 'id_municipio':
              elementToFocus = municipioRef.current?.querySelector('input');
              break;
            default:
              elementToFocus = document.getElementById(firstEmptyField);
          }

          if (elementToFocus) {
            elementToFocus.focus();
          }
        }
        return;
      }

      // Requerir al menos uno: ALTUM (service_tag), no_inventario o obs_no_inventario
      if (!data.service_tag && !data.no_inventario && !data.obs_no_inventario) {
        // Limpiar errores previos para evitar mensajes duplicados
        clearErrors(['service_tag', 'no_inventario', 'obs_no_inventario']);
        
        // Establecer errores en los campos correspondientes
        setError('service_tag', { 
          type: 'required', 
          message: 'Se requiere ALTUM' 
        });
        setError('no_inventario', { 
          type: 'required', 
          message: 'Se requiere Número de inventario' 
        });
        setError('obs_no_inventario', { 
          type: 'required', 
          message: 'Se requiere Observaciónes (si no hay número de inventario)' 
        });
        
        // Hacer scroll al mensaje de error
        const errorElement = document.querySelector('[role="alert"]');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        return;
      }

      setIsLoading(true);
      
      if (!equipoId) {
        throw new Error('No se ha proporcionado el ID del equipo');
      }

      const formData = limpiarDatos({
        ...data,
        no_inventario: data.no_inventario || '',
        obs_no_inventario: data.obs_no_inventario || '',
        id_municipio: form.id_municipio,
        equipo_gem_id: equipoId,
        oficina_id: selectedOficina
      });

      if (isEditMode) {
        await dispatch(updateInventarioGEM({ id: equipoId, data: formData })).unwrap();
        Swal.fire({
          title: 'Éxito',
          text: 'Inventario actualizado exitosamente',
          icon: 'success'
        }).then(() => {
          generateAndShowPDF(equipoId);
          // Calcular la página donde se encuentra el registro
          const page = Math.ceil(equipoId / 50); // Asumiendo 10 registros por página
          navigate(`/inventarios/gem?page=${page}&highlight=${equipoId}`);
        });
      } else {
        await dispatch(createInventarioGEM(formData)).unwrap();
        Swal.fire({
          title: 'Éxito',
          text: 'Inventario creado exitosamente',
          icon: 'success'
        }).then(() => {
          generateAndShowPDF(equipoId);
          // Calcular la página donde se encuentra el registro
          const page = Math.ceil(equipoId / 50); // Asumiendo 10 registros por página
          navigate(`/inventarios/gem?page=${page}&highlight=${equipoId}`);
        });
      }
    } catch (error) {
      console.error('Error completo:', error);
      console.error('Error status:', error.status);
      console.error('Error data:', error.data);
      console.error('Error payload:', error.payload);
      
      // Manejar específicamente el error de service tag duplicado (tanto para crear como actualizar)
      if (error.status === 409 || error.payload?.status === 409) {
        
        // El error ya viene con la estructura correcta desde el slice
        const errorMessage = error.message || error.payload?.message || 'El ALTUM ya está en uso';
        const inventarioExistente = error.data?.inventario_existente || error.payload?.data?.inventario_existente;
        
        
        
        // Mostrar el mensaje de error específico
        await Swal.fire({
          title: 'ALTUM Duplicado',
          text: errorMessage,
          icon: 'warning',
          confirmButtonText: 'Entiendo',
          confirmButtonColor: '#3085d6'
        });
      } else {
        // Manejar otros errores normalmente
        const errorMessage = error.message || error.payload?.message || 'Ocurrió un error al procesar el inventario';
        Swal.fire({
          title: 'Error',
          text: errorMessage,
          icon: 'error'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Función para generar y mostrar el PDF
  const generateAndShowPDF = async (equipoId) => {
    try {
      const pdfResponse = await fetch(`${BASE_URL}/api/equipo-gem/${equipoId}/pdf`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf'
        }
      });

      if (pdfResponse.ok) {
        const pdfBlob = await pdfResponse.blob();
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        // Abrir el PDF en una nueva pestaña
        window.open(pdfUrl, '_blank');
      } else {
        throw new Error('Error al generar el PDF');
      }
    } catch (pdfError) {
      console.error('Error al generar el PDF:', pdfError);
      Swal.fire({
        title: 'Advertencia',
        text: 'El inventario se guardó correctamente, pero hubo un error al generar el PDF',
        icon: 'warning'
      });
    }
  };

  // Función para manejar la nueva asignación
  const handleNuevaAsignacion = async () => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta asignación pasará a formar parte del registro histórico del equipo',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        setIsLoading(true);
        await dispatch(nuevaAsignacion(equipoId)).unwrap();
        
        Swal.fire({
          title: 'Éxito',
          text: 'La asignación se ha movido al histórico exitosamente',
          icon: 'success'
        }).then(() => {
          // Recargar la página actual
          window.location.reload();
        });
      }
    } catch (error) {
      console.error('Error al procesar la nueva asignación:', error);
      Swal.fire({
        title: 'Error',
        text: error.message || 'Ocurrió un error al procesar la nueva asignación',
        icon: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [serviceTag, setServiceTag] = useState('');
  const [isLoadingServiceTag, setIsLoadingServiceTag] = useState(false);

  const handleBuscarPorServiceTag = async () => {
    setIsLoadingServiceTag(true);
    try {
      // Normalizar a ALTUM-xxxxx (solo dígitos, máximo 5)
      const digits = (serviceTag || '').replace(/\D/g, '').slice(0, 5);
      const tag = digits ? `ALTUM-${digits}` : '';
      setServiceTag(tag);

      if (!/^ALTUM-\d{5}$/.test(tag)) {
        throw new Error('El ALTUM debe tener el formato ALTUM-12345 (5 dígitos)');
      }

      const response = await inventarioGEMService.getAsignacionByServiceTag(tag);
      const asignacion = response.asignacion; // Acceder al objeto asignacion dentro de la respuesta
      
      if (asignacion) {
        // Dependencias
        setSelectedSecretaria(asignacion.dependencia.secretaria_id);
        setSelectedDireccion(asignacion.dependencia.direccion_id);
        setSelectedOficina(asignacion.dependencia.oficina_id);
        setValue('secretaria_id', asignacion.dependencia.secretaria_id, { shouldValidate: true });
        setValue('direccion_id', asignacion.dependencia.direccion_id, { shouldValidate: true });
        setValue('oficina_id', asignacion.dependencia.oficina_id, { shouldValidate: true });
        setValue('dependencia_id', asignacion.dependencia.id);
        
        // Municipio
        setForm(prev => ({ ...prev, id_municipio: asignacion.id_municipio.toString() }));
        setValue('id_municipio', asignacion.id_municipio.toString());
        
        // Service Tag
        setValue('service_tag', response.equipo?.service_tag || '');
        
        // Usuario y datos personales
        setValue('usuario', asignacion.usuario || '');
        setValue('correo', asignacion.correo || '');
        setValue('puesto', asignacion.puesto || '');
        setValue('telefono', asignacion.telefono || '');
        setValue('extension', asignacion.extension || '');
        setValue('edificio', asignacion.edificio || '');
        setValue('piso', asignacion.piso || '');
        setValue('direccion', asignacion.direccion || '');
        setValue('user_id', asignacion.user_id || '');
        
        // Equipo completo (puedes establecer un valor por defecto o dejarlo vacío)
        setValue('equipo_completo', '');
        
        Swal.fire({
          title: '¡Listo!',
          text: 'Datos cargados desde la asignación',
          icon: 'success'
        });
      }
    } catch (error) {
      let errorMsg = 'No se encontró la asignación para este ALTUM';
      if (error.response && error.response.data && error.response.data.error) {
        errorMsg = error.response.data.error;
      } else if (error.message) {
        errorMsg = error.message;
      }
      Swal.fire({
        title: 'Error',
        text: errorMsg,
        icon: 'error'
      });
    } finally {
      setIsLoadingServiceTag(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message={isEditMode ? "Cargando datos, por favor espera..." : "Cargando..."} />;
  }

  return (
    <>
      {!isEditMode && (
        <div className="mb-6 flex items-center gap-2">
          <input
            type="text"
            value={serviceTag}
            onChange={e => {
              // Tomar sólo dígitos, limitar a 5 y anteponer ALTUM-
              const digits = (e.target.value || '').replace(/\D/g, '').slice(0, 5);
              const final = digits ? `ALTUM-${digits}` : '';
              setServiceTag(final);
            }}
            placeholder="Número de ALTUM"
            className="border rounded px-3 py-2 w-64"
            disabled={isLoadingServiceTag}
            inputMode="numeric"
            maxLength={11} // "ALTUM-" (6) + 5 dígitos = 11
          />
          <button
            type="button"
            onClick={handleBuscarPorServiceTag}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={isLoadingServiceTag || !/^ALTUM-\d{5}$/.test(serviceTag)}
          >
            {isLoadingServiceTag ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-6">
        {isEditMode ? 'Editar Ubicación y datos del usuario' : 'Registrar Ubicación y datos del usuario'}
      </h2>
      
      {/* Mensaje de ayuda para campos excluyentes */}
      {showFieldHelp && (altumValue || folioValue || obsValue) && (
        <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded relative" role="alert">
          <button 
            onClick={() => setShowFieldHelp(false)}
            className="absolute top-2 right-2 text-blue-500 hover:text-blue-700"
            aria-label="Cerrar mensaje"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <p className="font-bold">Información importante</p>
          
          <ul className="mt-2 text-sm list-disc pl-5">
            {altumValue && <li>Para usar Número de Inventario u Observaciones (si no hay Número de Inventario), primero borre el campo ALTUM</li>}
            {folioValue && <li>Para usar ALTUM u Observaciones (si no hay Número de Inventario), primero borre el campo Número de Inventario</li>}
            {obsValue && <li>Para usar ALTUM o Número de Inventario, primero borre el campo Observaciones (si no hay Número de Inventario)</li>}
          </ul>
        </div>
      )}
      {/* Mensaje de error para campos requeridos */}
      {errors.service_tag?.type === 'required' && errors.no_inventario?.type === 'required' && errors.obs_no_inventario?.type === 'required' && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
          <p className="font-bold">¡Atención!</p>
          <p>Debe completar al menos uno de los siguientes campos: ALTUM, Número de Inventario o Observaciónes (si no hay Número de Inventario).</p>
        </div>
      )}

      {isInitialLoading ? (
        <LoadingSpinner overlay />
      ) : (
      
        <form onSubmit={handleSubmit(onSubmit)}  className="space-y-6 bg-orange-100 p-4 sm:p-6 rounded-lg" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Dependencias */}
            <div className="relative mb-4 sm:mb-6 w-full group">
              <CustomSelect
                id="secretaria_id"
                name="secretaria_id"
                value={secretarias.find(sec => sec.secretaria_id === selectedSecretaria)
                  ? { value: selectedSecretaria, label: secretarias.find(sec => sec.secretaria_id === selectedSecretaria).secretaria }
                  : null}
                onChange={(option) => {
                  const newValue = option ? option.value : '';
                  // Siempre disparar el cambio, incluso si es el mismo valor
                  handleChange({
                    target: {
                      name: 'secretaria_id',
                      value: newValue
                    }
                  });
                  setValue('secretaria_id', newValue, { shouldValidate: true });
                }}
                options={secretarias.map(sec => ({
                  value: sec.secretaria_id,
                  label: sec.secretaria
                }))}
                isMulti={false}
                placeholder="Seleccione una secretaría"
                isDisabled={isLoadingDependencias}
                className={errors.secretaria_id ? 'border-red-500' : ''}
                ref={secretariaRef}
              />
              <label
                htmlFor="secretaria_id"
                className="absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0]"
              >
                Secretaría *
              </label>
              {errors.secretaria_id && (
                <p className="mt-1 text-sm text-red-600">Este campo es requerido</p>
              )}
            </div>

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
                className={errors.direccion_id ? 'border-red-500' : ''}
                ref={direccionRef}
              />
              <label
                htmlFor="direccion_id"
                className="absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0]"
              >
                Unidad administrativa *
              </label>
              {errors.direccion_id && (
                <p className="mt-1 text-sm text-red-600">Este campo es requerido</p>
              )}
            </div>

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
                className={errors.oficina_id ? 'border-red-500' : ''}
                ref={oficinaRef}
              />
              <label
                htmlFor="oficina_id"
                className="absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0]"
              >
                Área *
              </label>
              {errors.oficina_id && (
                <p className="mt-1 text-sm text-red-600">Este campo es requerido</p>
              )}
            </div>

            {/* Campo oculto para dependencia_id */}
            <input type="hidden" {...register('dependencia_id', { required: 'Este campo es requerido' })} />

            {/* Service Tag */}
            <div className="relative mb-4 sm:mb-6 w-full group">
              <input
                type="text"
                {...register('service_tag', { 
                  pattern: {
                    value: /^ALTUM-\d{5}$/,
                    message: 'El ALTUM debe tener el formato ALTUM-12345 (5 dígitos)'
                  },
                  validate: {
                    existsInCatalog: (value) => {
                      // Solo validar si el campo tiene valor
                      if (value) {
                        const exists = CATALOGOS.ALTUM_CODES.some(item => item.codigo === value);
                        return exists || 'ALTUM NO ENCONTRADO';
                      }
                      return true;
                    }
                  },
                  onChange: (e) => {
                    // Tomar sólo dígitos, limitar a 5
                    const digits = (e.target.value || '').replace(/\D/g, '').slice(0, 5);
                    const final = digits ? `ALTUM-${digits}` : '';
                    e.target.value = final;
                    setValue('service_tag', final, { shouldValidate: true });
                  }
                })}
                disabled={!!watch('no_inventario') || !!watch('obs_no_inventario')}
                autoComplete="off"
                inputMode="numeric"
                maxLength={11} // "ALTUM-" (6) + 5 dígitos = 11
                className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!watch('service_tag') ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 border-gray-500 appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer`}
                placeholder=" "
                id="service_tag"
              />
              <label
                htmlFor="service_tag"
                className="peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 cursor-pointer"
              >
                ALTUM *
              </label>
              {errors.service_tag && (
                <p className="mt-1 text-sm text-red-600">{errors.service_tag.message}</p>
              )}
            </div>

            <div className="relative mb-4 sm:mb-6 w-full group">
              <input
                type="text"
                {...register('no_inventario', {
                  maxLength: {
                    value: 20,
                    message: 'El folio no puede exceder 20 caracteres'
                  },
                  pattern: {
                    value: /^\d*$/,
                    message: 'Solo se permiten números'
                  },
                  onChange: (e) => {
                    const onlyDigits = (e.target.value || '').replace(/\D/g, '').slice(0, 15);
                    e.target.value = onlyDigits;
                    setValue('no_inventario', onlyDigits, { shouldValidate: true });
                  }
                })}
                autoComplete="off"
                inputMode="numeric"
                pattern="\d*"
                onKeyPress={(e) => { if (!/[0-9]/.test(e.key)) { e.preventDefault(); } }}
                maxLength={20}
                disabled={!!altumValue || !!obsValue}
                className={`block py-2.5 px-0 w-full text-lg ${!!altumValue || !!obsValue ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-900'} ${!watch('no_inventario') ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 border-gray-500 appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer`}
                placeholder=" "
                id="no_inventario"
              />
              <label
                htmlFor="no_inventario"
                className="peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 cursor-pointer"
              >
                Número de Inventario
              </label>
              <div className="flex justify-end mt-1">
                <span className={`text-sm ${watch('no_inventario')?.length >= 15 ? 'text-red-500' : 'text-gray-500'}`}>
                  {watch('no_inventario')?.length || 0}/15
                </span>
              </div>
              {errors.no_inventario && (
                <p className="mt-1 text-sm text-red-600">{errors.no_inventario.message}</p>
              )}
            </div>

            {/* Usuario */}
            <div className="relative mb-4 sm:mb-6 w-full group">
              <input
                type="text"
                {...register('usuario', { 
                  required: 'Este campo es requerido',
                  onChange: (e) => {
                    e.target.value = e.target.value.toUpperCase();
                    setValue('usuario', e.target.value);
                  }
                })}
                autoComplete="off"
                className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!watch('usuario') ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 border-gray-500 appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer`}
                placeholder=" "
                id="usuario"
              />
              <label
                htmlFor="usuario"
                className="peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 cursor-pointer"
              >
                Usuario (Nombre y Apellidos)
              </label>
              {errors.usuario && (
                <p className="mt-1 text-sm text-red-600">{errors.usuario.message}</p>
              )}
            </div>

            {/* Correo */}
            <div className="relative mb-4 sm:mb-6 w-full group">
              <input
                type="email"
                {...register('correo', { 
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: 'Ingrese un correo electrónico válido (ejemplo: usuario@dominio.com)'
                  }
                })}
                autoComplete="off"
                className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!watch('correo') ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 border-gray-500 appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer`}
                placeholder=" "
                id="correo"
              />
              <label
                htmlFor="correo"
                className="peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 cursor-pointer"
              >
                Correo
              </label>
              {errors.correo && (
                <p className="mt-1 text-sm text-red-600">{errors.correo.message}</p>
              )}
            </div>

            {/* Puesto */}
            <div className="relative mb-4 sm:mb-6 w-full group">
              <input
                type="text"
                {...register('puesto', { 
                  onChange: (e) => {
                    e.target.value = e.target.value.toUpperCase();
                    setValue('puesto', e.target.value);
                  }
                })}
                autoComplete="off"
                className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!watch('puesto') ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 border-gray-500 appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer`}
                placeholder=" "
                id="puesto"
              />
              <label
                htmlFor="puesto"
                className="peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 cursor-pointer"
              >
                Puesto
              </label>
              {errors.puesto && (
                <p className="mt-1 text-sm text-red-600">{errors.puesto.message}</p>
              )}
            </div>

           
            {/* Teléfono */}
            <div className="relative mb-4 sm:mb-6 w-full group">
              <input
                type="tel"
                {...register('telefono', { 
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: 'El teléfono debe tener exactamente 10 dígitos numéricos'
                  }
                })}
                autoComplete="off"
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                maxLength={10}
                className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!watch('telefono') ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 border-gray-500 appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer`}
                placeholder=" "
                id="telefono"
              />
              <label
                htmlFor="telefono"
                className="peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 cursor-pointer"
              >
                Teléfono
              </label>
              {errors.telefono && (
                <p className="mt-1 text-sm text-red-600">{errors.telefono.message}</p>
              )}
            </div>

            {/* Extensión */}
            <div className="relative mb-4 sm:mb-6 w-full group">
              <input
                type="text"
                {...register('extension', { 
                  maxLength: 10,
                  pattern: {
                    value: /^[0-9]+$/,
                    message: 'Solo se permiten números'
                  }
                })}
                autoComplete="off"
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!watch('extension') ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 border-gray-500 appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer`}
                placeholder=" "
                id="extension"
              />
              <label
                htmlFor="extension"
                className="peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 cursor-pointer"
              >
                Extensión
              </label>
              {errors.extension && (
                <p className="mt-1 text-sm text-red-600">{errors.extension.message}</p>
              )}
            </div>

            {/* Edificio */}
            <div className="relative mb-4 sm:mb-6 w-full group">
              <input
                type="text"
                {...register('edificio', { 
                  maxLength: 255,
                  onChange: (e) => {
                    e.target.value = e.target.value.toUpperCase();
                    setValue('edificio', e.target.value);
                  }
                })}
                autoComplete="off"
                className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!watch('edificio') ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 border-gray-500 appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer`}
                placeholder=" "
                id="edificio"
              />
              <label
                htmlFor="edificio"
                className="peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 cursor-pointer"
              >
                Edificio
              </label>
              {errors.edificio && (
                <p className="mt-1 text-sm text-red-600">{errors.edificio.message}</p>
              )}
            </div>

            {/* Piso */}
            <div className="relative mb-4 sm:mb-6 w-full group">
              <input
                type="text"
                {...register('piso', { 
                  maxLength: 50,
                  onChange: (e) => {
                    e.target.value = e.target.value.toUpperCase();
                    setValue('piso', e.target.value);
                  }
                })}
                autoComplete="off"
                className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!watch('piso') ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 border-gray-500 appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer`}
                placeholder=" "
                id="piso"
              />
              <label
                htmlFor="piso"
                className="peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 cursor-pointer"
              >
                Piso
              </label>
              {errors.piso && (
                <p className="mt-1 text-sm text-red-600">{errors.piso.message}</p>
              )}
            </div>

            {/* Dirección */}
            <div className="relative mb-4 sm:mb-6 w-full group">
              <CustomSelect
                options={direccionesActivas.map(dir => ({
                  value: dir.direccion,
                  label: dir.direccion
                }))}
                value={watch('direccion') ? {
                  value: watch('direccion'),
                  label: watch('direccion')
                } : null}
                onChange={(selectedOption) => {
                  const newValue = selectedOption ? selectedOption.value : '';
                  const newDireccionId = selectedOption ? 
                    direccionesActivas.find(dir => dir.direccion === selectedOption.value)?.id || '' : '';
                  
                  // Actualizar ambos valores de manera atómica
                  setValue('direccion', newValue, { shouldValidate: true });
                  setValue('direccion_id', newDireccionId, { shouldValidate: true });
                  
                  // Forzar validación después de la actualización
                  trigger('direccion');
                }}
                onBlur={() => trigger('direccion')}
                placeholder="Selecciona una dirección"
                isSearchable
                isClearable
                className={errors.direccion ? 'border-red-500' : ''}
              />
              <label
                className="absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 cursor-pointer"
              >
                Dirección
              </label>
              {errors.direccion && (
                <p className="mt-1 text-sm text-red-600">{errors.direccion.message}</p>
              )}
            </div>

            {/* Municipio */}
            <div className="relative mb-4 sm:mb-6 w-full group">
              <CustomSelect
                id="id_municipio"
                name="id_municipio"
                value={municipios.find(mun => mun.id_municipio.toString() === form.id_municipio?.toString())
                  ? { 
                      value: form.id_municipio, 
                      label: municipios.find(mun => mun.id_municipio.toString() === form.id_municipio?.toString()).municipio 
                    }
                  : null}
                onChange={(option) => {
                  const selectedMunicipio = option ? option.value.toString() : '';
                  handleChange({
                    target: {
                      name: 'id_municipio',
                      value: selectedMunicipio
                    }
                  });
                  // Actualizar el valor en react-hook-form
                  setValue('id_municipio', selectedMunicipio);
                }}
                options={municipios.map(mun => ({
                  value: mun.id_municipio,
                  label: mun.municipio
                }))}
                isDisabled={isLoadingMunicipios}
                placeholder="Seleccione un municipio"
                ref={municipioRef}
              />
              <label
                htmlFor="id_municipio"
                className="absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0]"
              >
                Municipio
              </label>
              {errors.id_municipio && !form.id_municipio && (
                <p className="mt-1 text-sm text-red-600">{errors.id_municipio.message}</p>
              )}
            </div>

            {/* Equipo Completo */}
            <div className="relative mb-4 sm:mb-6 w-full group">
              <CustomSelect
                id="equipo_completo"
                name="equipo_completo"
                value={watch('equipo_completo') ? { value: watch('equipo_completo'), label: watch('equipo_completo') } : null}
                onChange={(option) => {
                  setValue('equipo_completo', option ? option.value : '');
                  // Trigger validation for observaciones when equipo_completo changes
                  trigger('inv_gem_obs1');
                }}
                options={[
                  { value: 'SI', label: 'SI' },
                  { value: 'NO', label: 'NO' }
                ]}
                isMulti={false}
                placeholder="Seleccione una opción"
                className={errors.equipo_completo ? 'border-red-500' : ''}
              />
              <label
                htmlFor="equipo_completo"
                className="absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0]"
              >
                Equipo Completo *
              </label>
              {errors.equipo_completo && (
                <p className="mt-1 text-sm text-red-600">{errors.equipo_completo.message}</p>
              )}
            </div>

            {/* Técnico Responsable (Solo Lectura) */}
            {isEditMode && (
              <div className="relative mb-4 sm:mb-6 w-full group">
                <input
                  type="text"
                  value={userData?.nombre_completo || ''}
                  readOnly
                  className="block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer cursor-not-allowed"
                  placeholder=" "
                />
                <label
                  htmlFor="nombre_completo"
                  className="peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  Técnico Responsable
                </label>
              </div>
            )}

            {/* Campo oculto para user_id */}
            <input type="hidden" {...register('user_id')} />

            {/* Fotos */}
            {/* Observaciones sin folio (antes de la nota de archivos) */}
            <div className="relative mb-4 sm:mb-6 w-full group col-span-1 md:col-span-2 lg:col-span-3">
              <textarea
                {...register('obs_no_inventario', {
                  maxLength: {
                    value: 150,
                    message: 'Las observaciones sin folio no pueden exceder los 150 caracteres'
                  }
                })}
                disabled={!!altumValue || !!folioValue}
                className={`block py-2.5 px-0 w-full text-lg ${!!altumValue || !!folioValue ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-900'} ${!watch('obs_no_inventario') ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 border-gray-500 appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer`}
                placeholder=" "
                rows="2"
                id="obs_no_inventario"
                maxLength={150}
              />
              <label
                htmlFor="obs_no_inventario"
                className="peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 cursor-pointer"
              >
                Observaciones (si no hay Número de Inventario)
              </label>
              <div className="flex justify-end mt-1">
                <span className={`text-sm ${watch('obs_no_inventario')?.length >= 150 ? 'text-red-500' : 'text-gray-500'}`}>
                  {watch('obs_no_inventario')?.length || 0}/150 caracteres
                </span>
              </div>
              {errors.obs_no_inventario && (
                <p className="mt-1 text-sm text-red-600">{errors.obs_no_inventario.message}</p>
              )}
            </div>
            <div className="relative mb-4 sm:mb-6 w-full group col-span-1 md:col-span-2 lg:col-span-3 text-center">
              {/* Nota de archivos permitidos */}
              <div className="mb-2">
                <span className="text-red-600 font-semibold text-sm">
                  Archivos permitidos: PDF, JPG, PNG, GIF. Tamaño máximo por archivo: 2MB.
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {['inv_gem_foto1', 'inv_gem_foto2', 'inv_gem_foto3', 'inv_gem_foto4'].map((field, index) => {
                  const fileUrl = previewUrls[field];
                  // Determinar si es PDF basado en la extensión o el tipo de archivo seleccionado
                  const isPdf = fileUrl?.toLowerCase().endsWith('.pdf') || (selectedFiles[field]?.type === 'application/pdf');
                  
                  return (
                    <div key={field} className="relative">
                      <div className="flex flex-col items-center">
                        {fileUrl ? (
                          <div className="relative w-full h-48 mb-2">
                            {/* Mostrar ícono de PDF o imagen según el tipo */}
                            {isPdf ? (
                              <div 
                                className="w-full h-full bg-gray-100 rounded cursor-pointer flex items-center justify-center"
                                onClick={() => handlePreview(fileUrl, 'pdf')}
                              >
                                <FaFilePdf className="text-red-500 text-4xl" />
                              </div>
                            ) : (
                              <img
                                src={fileUrl}
                                alt={`Vista previa ${index + 1}`}
                                className="w-full h-full object-cover rounded cursor-pointer"
                                onClick={() => handlePreview(fileUrl, 'image')}
                              />
                            )}
                            <button
                              type="button"
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                              onClick={() => handleRemoveFile(field)}
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ) : (
                          <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded flex items-center justify-center mb-2">
                            <div className="text-center">
                              <FaImage className="mx-auto text-gray-400 text-3xl mb-2" />
                              <span className="text-sm text-gray-500">Sin archivo</span>
                            </div>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange(e, field)}
                          className="hidden"
                          id={field}
                        />
                        <label
                          htmlFor={field}
                          className="cursor-pointer bg-colorPrimario text-white px-4 py-2 rounded hover:bg-colorPrimarioDark transition-colors"
                        >
                          Seleccionar archivo
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Observaciones */}
            <div className="relative mb-4 sm:mb-6 w-full group col-span-1 md:col-span-2 lg:col-span-3">
              <textarea
                {...register('inv_gem_obs1', {
                  required: watch('equipo_completo') === 'NO' ? 'Las observaciones son obligatorias cuando el equipo no está completo' : false,
                  maxLength: {
                    value: 1500,
                    message: 'Las observaciones no pueden exceder los 1500 caracteres'
                  }
                })}
                className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!watch('inv_gem_obs1') ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 border-gray-500 appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer`}
                placeholder=" "
                rows="3"
                id="inv_gem_obs1"
                maxLength={1500}
              />
              <label
                htmlFor="inv_gem_obs1"
                className="peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 cursor-pointer"
              >
                Observaciones {watch('equipo_completo') === 'NO' ? '*' : ''}
              </label>
              <div className="flex justify-end mt-1">
                <span className={`text-sm ${watch('inv_gem_obs1')?.length >= 1500 ? 'text-red-500' : 'text-gray-500'}`}>
                  {watch('inv_gem_obs1')?.length || 0}/1500 caracteres
                </span>
              </div>
              {errors.inv_gem_obs1 && (
                <p className="mt-1 text-sm text-red-600">{errors.inv_gem_obs1.message}</p>
              )}
            </div>
          </div>

          {/* Modal de vista previa */}
          {previewModal.url && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Vista previa</h3>
                  <button
                    onClick={() => setPreviewModal({ url: null, type: null })}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="bg-gray-100 rounded-lg overflow-hidden">
                  {previewModal.type === 'pdf' ? (
                    <iframe
                      src={previewModal.url}
                      className="w-full h-[70vh]"
                      title="PDF Preview"
                    />
                  ) : (
                    <div className="w-full h-[70vh] flex items-center justify-center bg-gray-800">
                      <img
                        src={previewModal.url}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              {isEditMode && (
                <SubmitButton
                  type="button"
                  variant="secondary"
                  onClick={handleNuevaAsignacion}
                  className="w-full sm:w-auto bg-colorSecundario hover:bg-colorTerciario "
                >
                  Nueva Asignación
                </SubmitButton>
              )}
              {tieneHistorialData && (
                <SubmitButton
                  type="button"
                  variant="info"
                  onClick={() => navigate(`/inventarios/gem/historial/${equipoId}`)}
                  className="w-full sm:w-auto bg-colorSecundario hover:bg-orange-700 text-white"
                >
                  Ver Historial
                </SubmitButton>
              )}
              <SubmitButton
                type="button"
                variant="secondary"
                onClick={() => navigate(`/inventarios/gem/editar/${equipoId}`)}
                className="w-full sm:w-auto bg-colorSecundario hover:bg-colorSecundario "
              >
                Atrás
              </SubmitButton>
            </div>
           
            <SubmitButton
              type="submit"
              loading={isLoading}
              className="w-full sm:w-auto"
            >
              {isEditMode ? 'Actualizar' : 'Finalizar'}
            </SubmitButton>
          </div>
        </form>
      )}
    </>
  );
};

export default InventarioGEMForm;