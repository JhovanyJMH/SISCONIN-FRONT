import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { createEquipoGEM, updateEquipoGEM } from '../../features/equiposGEM/equiposGEMSlice';
import { CATALOGOS } from '../../constants/catalogos';
import { equiposGEMService } from '../../services/equiposGEMService';
import Swal from 'sweetalert2';
import CustomSelect from '../common/CustomSelect';
import LoadingSpinner from '../common/LoadingSpinner';
import SubmitButton from '../common/SubmitButton';

const EquipoGEMForm = ({ initialData }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { user } = useSelector(state => state.auth);
  const isAdmin = user?.profile === '1';

  // Referencias para campos requeridos
  const equipoRef = useRef(null);
  const activoIdRef = useRef(null);
  const marcaIdRef = useRef(null);
  const modeloRef = useRef(null);
  const cpuRef = useRef(null);
  const monitorRef = useRef(null);
  const upsRef = useRef(null);
  const colorRef = useRef(null);
  const materialRef = useRef(null);
  const proveedorRef = useRef(null);
  const placasRef = useRef(null);
  const valorRef = useRef(null);
  const controlIdRef = useRef(null);
  const adqIdRef = useRef(null);
  const adquisisionIdRef = useRef(null);
  const fecAdquisionRef = useRef(null);
  const fecAsignacionRef = useRef(null);
  const fecResguardoRef = useRef(null);
  const fecAltaRef = useRef(null);

  const [formData, setFormData] = useState({
    folio: '',
    cpu: '',
    monitor: '',
    ups: '',
    equipo: '',
    activo_id: '',
    marca_id: '',
    modelo: '',
    color: '',
    material: '',
    proveedor: '',
    placas: '',
    valor: '',
    control_id: '',
    adq_id: '',
    adquisision_id: '',
    fec_adquision: new Date().toISOString().split('T')[0],
    fec_asignacion: new Date().toISOString().split('T')[0],
    fec_resguardo: new Date().toISOString().split('T')[0],
    fec_alta: new Date().toISOString().split('T')[0],
    estado: 1
  });

  // Estado para el valor sin formato durante la edición
  const [editingValue, setEditingValue] = useState('');

  useEffect(() => {
    const loadEquipo = async () => {
      if (isEditing && id) {
        setIsLoading(true);
        try {
          const response = await equiposGEMService.getEquipoGEM(id);
          if (response?.data) {
            const equipo = response.data;
            setFormData({
              ...equipo,
              valor: equipo.valor ? formatCurrency(equipo.valor.toString()) : '',
              fec_adquision: equipo.fec_adquision ? new Date(equipo.fec_adquision).toISOString().split('T')[0] : '',
              fec_asignacion: equipo.fec_asignacion ? new Date(equipo.fec_asignacion).toISOString().split('T')[0] : '',
              fec_resguardo: equipo.fec_resguardo ? new Date(equipo.fec_resguardo).toISOString().split('T')[0] : '',
              fec_alta: equipo.fec_alta ? new Date(equipo.fec_alta).toISOString().split('T')[0] : '',
            });
          }
        } catch (error) {
          console.error('Error al cargar el equipo:', error);
          Swal.fire({
            title: 'Error',
            text: 'Error al cargar los datos del equipo',
            icon: 'error'
          });
        } finally {
          setIsLoading(false);
        }
      } else if (initialData) {
        setFormData({
          ...initialData,
          valor: initialData.valor ? formatCurrency(initialData.valor.toString()) : '',
        });
      }
    };

    loadEquipo();
  }, [id, isEditing]);

  // Función para formatear el valor como moneda
  const formatCurrency = (value) => {
    if (!value) return '';
    
    // Remover cualquier caracter no numérico excepto el punto decimal
    const numericValue = value.replace(/[^0-9.]/g, '');
    if (!numericValue) return '';
    
    const number = parseFloat(numericValue);
    if (isNaN(number)) return '';
    
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(number);
  };

  // Función para obtener el valor numérico sin formato
  const getNumericValue = (formattedValue) => {
    return formattedValue.replace(/[^0-9.]/g, '');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Lista de campos que deben convertirse a mayúsculas
    const uppercaseFields = ['cpu', 'monitor', 'ups', 'equipo', 'modelo', 'color', 'material', 'proveedor', 'placas'];
    
    if (name === 'valor') {
      // Solo permitir números y punto decimal
      const numericValue = value.replace(/[^0-9.]/g, '');
      // Evitar múltiples puntos decimales
      const parts = numericValue.split('.');
      const formattedValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericValue;
      
      setEditingValue(formattedValue);
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else if (uppercaseFields.includes(name)) {
      // Convertir a mayúsculas para los campos especificados
      setFormData(prev => ({
        ...prev,
        [name]: value.toUpperCase()
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Limpiar error cuando el usuario empieza a escribir
    setErrors(prev => ({
      ...prev,
      [name]: null
    }));
  };

  // Manejar el evento de perder el foco
  const handleBlur = (e) => {
    const { name } = e.target;
    
    if (name === 'valor') {
      const formattedValue = formatCurrency(formData.valor);
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
      setEditingValue('');
    }
  };

  // Manejar el evento de obtener el foco
  const handleFocus = (e) => {
    const { name } = e.target;
    
    if (name === 'valor') {
      const numericValue = getNumericValue(formData.valor);
      setEditingValue(numericValue);
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    }
  };

  const handleLabelClick = (ref) => {
    if (ref.current) {
      if (ref.current.focus) {
        ref.current.focus();
      } else if (ref.current.querySelector) {
        const inputElement = ref.current.querySelector('input, select, textarea');
        if (inputElement) {
          inputElement.focus();
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Crear una copia del formData para el envío
    const submitData = {
      ...formData,
      valor: getNumericValue(formData.valor) // Convertir el valor formateado a numérico
    };

    // Validación básica de campos requeridos en el orden de aparición en el formulario
    // 'proveedor', 'placas', 'valor', 'control_id', 'adq_id', 'adquisision_id',
    // 'monitor', 'ups',
    const newErrors = {};
    const requiredFields = ['cpu',  'equipo', 'activo_id', 'marca_id', 'modelo', 'color', 'material',  'fec_adquision', 'fec_asignacion', 'fec_resguardo', 'fec_alta'];
    const fieldRefs = { // Mapeo de nombres de campo a referencias
      equipo: equipoRef,
      activo_id: activoIdRef,
      marca_id: marcaIdRef,
      modelo: modeloRef,
      cpu: cpuRef,
      monitor: monitorRef,
      ups: upsRef,
      color: colorRef,
      material: materialRef,
      proveedor: proveedorRef,
      placas: placasRef,
      valor: valorRef,
      control_id: controlIdRef,
      adq_id: adqIdRef,
      adquisision_id: adquisisionIdRef,
      fec_adquision: fecAdquisionRef,
      fec_asignacion: fecAsignacionRef,
      fec_resguardo: fecResguardoRef,
      fec_alta: fecAltaRef,
    };
    let firstEmptyField = null;

    for (const field of requiredFields) {
      if (!submitData[field] || (typeof submitData[field] === 'string' && submitData[field].trim() === '')) {
        newErrors[field] = 'Este campo es requerido';
        if (!firstEmptyField) {
          firstEmptyField = field; // Guarda el nombre del primer campo vacío
        }
      }
    }

    setErrors(newErrors);

    // Si hay errores, detener el envío del formulario y enfocar el primer campo
    if (Object.keys(newErrors).length > 0) {
      if (firstEmptyField && fieldRefs[firstEmptyField]?.current) {
        // Enfocar el primer campo con error
        const element = fieldRefs[firstEmptyField].current;
        if (element.focus) {
           element.focus();
        } else if (element.querySelector) { // Para CustomSelect u otros con estructura interna
           const inputElement = element.querySelector('input, select, textarea');
           if (inputElement) {
             inputElement.focus();
           }
        }
      }
      return;
    }

    setIsLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const isAdmin = user?.profile === '1';
      
      let response;
      if (isEditing && !isAdmin) {
        // Si está editando y no es admin, redirigir a la vista de inventario
        navigate(`/inventarios/gem/inventario/${id}`);
        return;
      }
      
      if (isEditing) {
        response = await dispatch(updateEquipoGEM({ id, data: submitData })).unwrap();
      } else {
        response = await dispatch(createEquipoGEM(submitData)).unwrap();
      }
      
      const equipoId = response?.id || response?.data?.id || response?.data?.equipo?.id;
      
      if (equipoId) {
        const equipoData = {
          ...submitData,
          id: equipoId
        };
        
        // Redirigir a la vista de inventario después de crear/editar
        navigate(`/inventarios/gem/inventario/${equipoId}`);
        
      } else {
        throw new Error('No se pudo obtener el ID del equipo');
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      Swal.fire({
        title: 'Error',
        text: error.message || 'Error al guardar el equipo',
        icon: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? 'Editar Equipo GEM' : 'Registrar Nuevo Equipo GEM'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6 bg-orange-100 p-4 sm:p-6 rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Folio */}
          {isEditing && (
            <div className="relative mb-4 sm:mb-6 w-full group">
              <input
                type="text"
                name="folio"
                value={formData.folio}
                readOnly
                autoComplete="off"
                className="block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer cursor-not-allowed"
                placeholder=" "
              />
              <label
                htmlFor="folio"
                className="peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
              >
                Folio
              </label>
            </div>
          )}

          {/* CPU */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              type="text"
              name="cpu"
              value={formData.cpu}
              onChange={handleChange}
              readOnly={!isAdmin}
              autoComplete="off"
              className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.cpu ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.cpu ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
              placeholder=" "
              ref={cpuRef}
            />
            <label
              htmlFor="cpu"
              onClick={() => isAdmin && handleLabelClick(cpuRef)}
              className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
            >
              CPU (No. de serie)
            </label>
            {errors.cpu && (
              <p className="mt-1 text-sm text-red-600">{errors.cpu}</p>
            )}
          </div>

          {/* Monitor */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              type="text"
              name="monitor"
              value={formData.monitor}
              onChange={handleChange}
              readOnly={!isAdmin}
              autoComplete="off"
              className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.monitor ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.monitor ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
              placeholder=" "
              ref={monitorRef}
            />
            <label
              htmlFor="monitor"
              onClick={() => isAdmin && handleLabelClick(monitorRef)}
              className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
            >
              Monitor (No. de serie)
            </label>
            {errors.monitor && (
              <p className="mt-1 text-sm text-red-600">{errors.monitor}</p>
            )}
          </div>

          {/* UPS */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              type="text"
              name="ups"
              value={formData.ups}
              onChange={handleChange}
              readOnly={!isAdmin}
              autoComplete="off"
              className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.ups ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.ups ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
              placeholder=" "
              ref={upsRef}
            />
            <label
              htmlFor="ups"
              onClick={() => isAdmin && handleLabelClick(upsRef)}
              className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
            >
              UPS (No. de serie)
            </label>
            {errors.ups && (
              <p className="mt-1 text-sm text-red-600">{errors.ups}</p>
            )}
          </div>

          {/* Equipo */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              type="text"
              name="equipo"
              value={formData.equipo}
              onChange={handleChange}
              readOnly={!isAdmin}
              autoComplete="off"
              className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.equipo ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.equipo ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
              placeholder=" "
              ref={equipoRef}
            />
            <label
              htmlFor="equipo"
              onClick={() => isAdmin && handleLabelClick(equipoRef)}
              className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
            >
              Características del equipo
            </label>
            {errors.equipo && (
              <p className="mt-1 text-sm text-red-600">{errors.equipo}</p>
            )}
          </div>

          {/* Tipo Activo */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <CustomSelect
              id="activo_id"
              name="activo_id"
              value={CATALOGOS.TIPOS_ACTIVO.find(tipo => tipo.id === formData.activo_id)
                ? { value: formData.activo_id, label: CATALOGOS.TIPOS_ACTIVO.find(tipo => tipo.id === formData.activo_id).tipo_activo }
                : null}
              onChange={(option) => handleChange({
                target: {
                  name: 'activo_id',
                  value: option ? option.value : ''
                }
              })}
              options={CATALOGOS.TIPOS_ACTIVO.map(tipo => ({
                value: tipo.id,
                label: tipo.tipo_activo
              }))}
              placeholder="Seleccione un tipo"
              className={errors.activo_id ? 'border-red-500' : ''}
              ref={activoIdRef}
              isDisabled={!isAdmin}
            />
            <label
              htmlFor="activo_id"
              onClick={() => isAdmin && handleLabelClick(activoIdRef)}
              className={`absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] ${isAdmin ? 'cursor-pointer' : ''}`}
            >
              Tipo de Activo
            </label>
            {errors.activo_id && (
              <p className="mt-1 text-sm text-red-600">{errors.activo_id}</p>
            )}
          </div>

          {/* Marca */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <CustomSelect
              id="marca_id"
              name="marca_id"
              value={CATALOGOS.MARCAS.find(marca => marca.id === formData.marca_id)
                ? { value: formData.marca_id, label: CATALOGOS.MARCAS.find(marca => marca.id === formData.marca_id).marca }
                : null}
              onChange={(option) => handleChange({
                target: {
                  name: 'marca_id',
                  value: option ? option.value : ''
                }
              })}
              options={CATALOGOS.MARCAS.map(marca => ({
                value: marca.id,
                label: marca.marca
              }))}
              placeholder="Seleccione una marca"
              className={errors.marca_id ? 'border-red-500' : ''}
              ref={marcaIdRef}
              isDisabled={!isAdmin}
            />
            <label
              htmlFor="marca_id"
              onClick={() => isAdmin && handleLabelClick(marcaIdRef)}
              className={`absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] ${isAdmin ? 'cursor-pointer' : ''}`}
            >
              Marca
            </label>
            {errors.marca_id && (
              <p className="mt-1 text-sm text-red-600">{errors.marca_id}</p>
            )}
          </div>

          {/* Modelo */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              type="text"
              name="modelo"
              value={formData.modelo}
              onChange={handleChange}
              readOnly={!isAdmin}
              autoComplete="off"
              className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.modelo ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.modelo ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
              placeholder=" "
              ref={modeloRef}
            />
            <label
              htmlFor="modelo"
              onClick={() => isAdmin && handleLabelClick(modeloRef)}
              className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
            >
              Modelo
            </label>
            {errors.modelo && (
              <p className="mt-1 text-sm text-red-600">{errors.modelo}</p>
            )}
          </div>

          {/* Color */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              readOnly={!isAdmin}
              autoComplete="off"
              className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.color ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.color ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
              placeholder=" "
              ref={colorRef}
            />
            <label
              htmlFor="color"
              onClick={() => isAdmin && handleLabelClick(colorRef)}
              className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
            >
              Color
            </label>
            {errors.color && (
              <p className="mt-1 text-sm text-red-600">{errors.color}</p>
            )}
          </div>

          {/* Material */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              type="text"
              name="material"
              value={formData.material}
              onChange={handleChange}
              readOnly={!isAdmin}
              autoComplete="off"
              className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.material ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.material ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
              placeholder=" "
              ref={materialRef}
            />
            <label
              htmlFor="material"
              onClick={() => isAdmin && handleLabelClick(materialRef)}
              className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
            >
              Material
            </label>
            {errors.material && (
              <p className="mt-1 text-sm text-red-600">{errors.material}</p>
            )}
          </div>

          {/* Proveedor */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              type="text"
              name="proveedor"
              value={formData.proveedor}
              onChange={handleChange}
              readOnly={!isAdmin}
              autoComplete="off"
              className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.proveedor ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.proveedor ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
              placeholder=" "
              ref={proveedorRef}
            />
            <label
              htmlFor="proveedor"
              onClick={() => isAdmin && handleLabelClick(proveedorRef)}
              className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
            >
              Proveedor
            </label>
            {errors.proveedor && (
              <p className="mt-1 text-sm text-red-600">{errors.proveedor}</p>
            )}
          </div>

          {/* Placas */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              type="text"
              name="placas"
              value={formData.placas}
              onChange={handleChange}
              readOnly={!isAdmin}
              autoComplete="off"
              className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.placas ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.placas ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
              placeholder=" "
              ref={placasRef}
            />
            <label
              htmlFor="placas"
              onClick={() => isAdmin && handleLabelClick(placasRef)}
              className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
            >
              Placas
            </label>
            {errors.placas && (
              <p className="mt-1 text-sm text-red-600">{errors.placas}</p>
            )}
          </div>

          {/* Valor */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              type="text"
              name="valor"
              value={formData.valor}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={handleFocus}
              readOnly={!isAdmin}
              autoComplete="off"
              className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.valor ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.valor ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
              placeholder=" "
              ref={valorRef}
            />
            <label
              htmlFor="valor"
              onClick={() => isAdmin && handleLabelClick(valorRef)}
              className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
            >
              Valor
            </label>
            {errors.valor && (
              <p className="mt-1 text-sm text-red-600">{errors.valor}</p>
            )}
          </div>

          {/* Tipo Control */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <CustomSelect
              id="control_id"
              name="control_id"
              value={CATALOGOS.TIPOS_CONTROL.find(tipo => tipo.id === formData.control_id)
                ? { value: formData.control_id, label: CATALOGOS.TIPOS_CONTROL.find(tipo => tipo.id === formData.control_id).tipo_control }
                : null}
              onChange={(option) => handleChange({
                target: {
                  name: 'control_id',
                  value: option ? option.value : ''
                }
              })}
              options={CATALOGOS.TIPOS_CONTROL.map(tipo => ({
                value: tipo.id,
                label: tipo.tipo_control
              }))}
              placeholder="Seleccione un tipo"
              className={errors.control_id ? 'border-red-500' : ''}
              ref={controlIdRef}
              isDisabled={!isAdmin}
            />
            <label
              htmlFor="control_id"
              onClick={() => isAdmin && handleLabelClick(controlIdRef)}
              className={`absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] ${isAdmin ? 'cursor-pointer' : ''}`}
            >
              Tipo de Control
            </label>
            {errors.control_id && (
              <p className="mt-1 text-sm text-red-600">{errors.control_id}</p>
            )}
          </div>

          {/* Adquisición */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <CustomSelect
              id="adq_id"
              name="adq_id"
              value={CATALOGOS.ADQUISICIONES.find(adq => adq.id === formData.adq_id)
                ? { value: formData.adq_id, label: CATALOGOS.ADQUISICIONES.find(adq => adq.id === formData.adq_id).adquisicion }
                : null}
              onChange={(option) => handleChange({
                target: {
                  name: 'adq_id',
                  value: option ? option.value : ''
                }
              })}
              options={CATALOGOS.ADQUISICIONES.map(adq => ({
                value: adq.id,
                label: adq.adquisicion
              }))}
              placeholder="Seleccione una adquisición"
              className={errors.adq_id ? 'border-red-500' : ''}
              ref={adqIdRef}
              isDisabled={!isAdmin}
            />
            <label
              htmlFor="adq_id"
              onClick={() => isAdmin && handleLabelClick(adqIdRef)}
              className={`absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] ${isAdmin ? 'cursor-pointer' : ''}`}
            >
              Equipo adquirido por el gobierno
            </label>
            {errors.adq_id && (
              <p className="mt-1 text-sm text-red-600">{errors.adq_id}</p>
            )}
          </div>

          {/* Tipo Adquisición */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <CustomSelect
              id="adquisision_id"
              name="adquisision_id"
              value={CATALOGOS.TIPOS_ADQUISICION.find(tipo => tipo.id === formData.adquisision_id)
                ? { value: formData.adquisision_id, label: CATALOGOS.TIPOS_ADQUISICION.find(tipo => tipo.id === formData.adquisision_id).tipo_adquisicion }
                : null}
              onChange={(option) => handleChange({
                target: {
                  name: 'adquisision_id',
                  value: option ? option.value : ''
                }
              })}
              options={CATALOGOS.TIPOS_ADQUISICION.map(tipo => ({
                value: tipo.id,
                label: tipo.tipo_adquisicion
              }))}
              placeholder="Seleccione un tipo"
              className={errors.adquisision_id ? 'border-red-500' : ''}
              ref={adquisisionIdRef}
              isDisabled={!isAdmin}
            />
            <label
              htmlFor="adquisision_id"
              onClick={() => isAdmin && handleLabelClick(adquisisionIdRef)}
              className={`absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] ${isAdmin ? 'cursor-pointer' : ''}`}
            >
              Tipo de Adquisición
            </label>
            {errors.adquisision_id && (
              <p className="mt-1 text-sm text-red-600">{errors.adquisision_id}</p>
            )}
          </div>

          {/* Fecha Adquisición */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              type="date"
              name="fec_adquision"
              value={formData.fec_adquision}
              onChange={handleChange}
              readOnly={!isAdmin}
              autoComplete="off"
              className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.fec_adquision ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.fec_adquision ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
              ref={fecAdquisionRef}
            />
            <label
              htmlFor="fec_adquision"
              onClick={() => isAdmin && handleLabelClick(fecAdquisionRef)}
              className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
            >
              Fecha de Adquisición
            </label>
            {errors.fec_adquision && (
              <p className="mt-1 text-sm text-red-600">{errors.fec_adquision}</p>
            )}
          </div>

          {/* Fecha Asignación */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              type="date"
              name="fec_asignacion"
              value={formData.fec_asignacion}
              onChange={handleChange}
              readOnly={!isAdmin}
              autoComplete="off"
              className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.fec_asignacion ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.fec_asignacion ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
              ref={fecAsignacionRef}
            />
            <label
              htmlFor="fec_asignacion"
              onClick={() => isAdmin && handleLabelClick(fecAsignacionRef)}
              className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
            >
              Fecha de Asignación
            </label>
            {errors.fec_asignacion && (
              <p className="mt-1 text-sm text-red-600">{errors.fec_asignacion}</p>
            )}
          </div>

          {/* Fecha Resguardo */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              type="date"
              name="fec_resguardo"
              value={formData.fec_resguardo}
              onChange={handleChange}
              readOnly={!isAdmin}
              autoComplete="off"
              className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.fec_resguardo ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.fec_resguardo ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
              ref={fecResguardoRef}
            />
            <label
              htmlFor="fec_resguardo"
              onClick={() => isAdmin && handleLabelClick(fecResguardoRef)}
              className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
            >
              Fecha de Resguardo
            </label>
            {errors.fec_resguardo && (
              <p className="mt-1 text-sm text-red-600">{errors.fec_resguardo}</p>
            )}
          </div>

          {/* Fecha Alta */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              type="date"
              name="fec_alta"
              value={formData.fec_alta}
              onChange={handleChange}
              readOnly={!isAdmin}
              autoComplete="off"
              className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.fec_alta ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.fec_alta ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
              ref={fecAltaRef}
            />
            <label
              htmlFor="fec_alta"
              onClick={() => isAdmin && handleLabelClick(fecAltaRef)}
              className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
            >
              Fecha de Alta
            </label>
            {errors.fec_alta && (
              <p className="mt-1 text-sm text-red-600">{errors.fec_alta}</p>
            )}
          </div>

          {/* Estado */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <CustomSelect
              id="estado"
              name="estado"
              value={[{ value: 1, label: 'BUENO' }, { value: 2, label: 'REGULAR' }].find(est => est.value === formData.estado)
                ? { value: formData.estado, label: [{ value: 1, label: 'BUENO' }, { value: 2, label: 'REGULAR' }].find(est => est.value === formData.estado).label }
                : null}
              onChange={(option) => handleChange({
                target: {
                  name: 'estado',
                  value: option ? option.value : ''
                }
              })}
              options={[{ value: 1, label: 'BUENO' }, { value: 2, label: 'REGULAR' }]}
              placeholder="Seleccione un estado"
              isDisabled={!isAdmin}
            />
            <label
              htmlFor="estado"
              className={`absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] ${isAdmin ? 'cursor-pointer' : ''}`}
            >
              Estado del equipo
            </label>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
          <SubmitButton
            type="button"
            variant="secondary"
            onClick={() => navigate('/inventarios/gem')}
            className="w-full sm:w-auto"
          >
            Cancelar
          </SubmitButton>
          
            <SubmitButton
              type="submit"
              loading={isLoading}
              className="w-full sm:w-auto"
            >
              {isEditing ? (isAdmin ? 'Actualizar' : 'Continuar') : 'Siguiente'}
            </SubmitButton>
        
        </div>
      </form>
    </>
  );
};

export default EquipoGEMForm;