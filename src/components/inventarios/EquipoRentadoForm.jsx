import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { createEquipo, updateEquipo } from '../../features/equipos/equiposSlice';
import { CATALOGOS } from '../../constants/catalogos';
import Swal from 'sweetalert2';
import CustomSelect from '../common/CustomSelect';
import LoadingSpinner from '../common/LoadingSpinner';
import SubmitButton from '../common/SubmitButton';
import { equiposRentadosService } from '../../services/equiposRentadosService';


const EquipoRentadoForm = ({ initialData }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { user } = useSelector(state => state.auth);
  const isAdmin = user?.profile === '1';

  // Referencias para campos requeridos
  const consecutivoRef = useRef(null);
  const serviceTagRef = useRef(null);
  const equipoRef = useRef(null);
  const marcaIdRef = useRef(null);
  const modeloRef = useRef(null);
  const noSerieRef = useRef(null);
  const discoDuroRef = useRef(null);
  const procesadorRef = useRef(null);
  const velocidadProcesadorRef = useRef(null);
  const noCoresRef = useRef(null);
  const memoriaRamRef = useRef(null);
  const dominioRef = useRef(null);
  const macEthernetRef = useRef(null);
  const macWifiRef = useRef(null);
  const fecAltaRef = useRef(null);

  // Agregar refs para los inputs de periféricos
  const monitorModeloRef = useRef(null);
  const monitorNoSerieRef = useRef(null);
  const tecladoModeloRef = useRef(null);
  const tecladoNoSerieRef = useRef(null);
  const mouseModeloRef = useRef(null);
  const mouseNoSerieRef = useRef(null);
  const maletinModeloRef = useRef(null);
  const maletinNoSerieRef = useRef(null);
  const candadoModeloRef = useRef(null);
  const candadoNoSerieRef = useRef(null);
  const cargadorModeloRef = useRef(null);
  const cargadorNoSerieRef = useRef(null);
  const tarjetaGrafModeloRef = useRef(null);
  const tarjetaGrafNoSerieRef = useRef(null);
  const tarjetaWifiModeloRef = useRef(null);
  const tarjetaWifiNoSerieRef = useRef(null);
  const upsModeloRef = useRef(null);
  const upsNoSerieRef = useRef(null);

  const [formData, setFormData] = useState({
    consecutivo: '',
    service_tag: '',
    equipo: '',
    marca_id: '',
    eq_modelo: '',
    eq_noserie: '',
    disco_duro: '',
    procesador: '',
    velocidad_procesador: '',
    no_cores: '',
    memoria_ram: '',
    marca_idm: '',
    monitor_modelo: '',
    monitor_noserie: '',
    marca_idt: '',
    teclado_modelo: '',
    teclado_noserie: '',
    marca_idmo: '',
    mouse_modelo: '',
    mouse_noserie: '',
    marca_idma: '',
    maletin_modelo: '',
    maletin_noserie: '',
    marca_idca: '',
    candado_modelo: '',
    candado_noserie: '',
    marca_idba: '',
    cargador_modelo: '',
    cargador_noserie: '',
    marca_idtg: '',
    tarjeta_graf_modelo: '',
    tarjeta_graf_noserie: '',
    marca_idwi: '',
    tarjeta_wifi_modelo: '',
    tarjeta_wifi_noserie: '',
    marca_idup: '',
    ups_modelo: '',
    ups_noserie: '',
    dominio: '',
    mac_addres_ethernet: '',
    mac_addres_wifi: '',
    fec_alta: new Date().toISOString().split('T')[0],
    equipo_rentado: 'SI'
  });

  useEffect(() => {
    let isMounted = true;

    const loadEquipo = async () => {
      if (!isEditing || !id) {
        if (initialData) {
          setFormData(initialData);
        }
        return;
      }

      setIsLoading(true);
      try {
        const response = await equiposRentadosService.getEquipoRentado(id);
        if (isMounted && response?.data) {
          const equipo = response.data;
          setFormData({
            ...equipo,
            fec_alta: equipo.fec_alta ? new Date(equipo.fec_alta).toISOString().split('T')[0] : '',
          });
        }
      } catch (error) {
        console.error('Error al cargar el equipo:', error);
        if (isMounted) {
          Swal.fire({
            title: 'Error',
            text: 'Error al cargar los datos del equipo',
            icon: 'error'
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadEquipo();

    return () => {
      isMounted = false;
    };
  }, [id, isEditing, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Lista de campos que deben convertirse a mayúsculas
    const uppercaseFields = [
      'consecutivo', 'service_tag', 'equipo', 'eq_modelo', 'eq_noserie', 'disco_duro', 'procesador',
      'velocidad_procesador', 'no_cores', 'memoria_ram', 'monitor_modelo',
      'monitor_noserie', 'teclado_modelo', 'teclado_noserie', 'mouse_modelo',
      'mouse_noserie', 'maletin_modelo', 'maletin_noserie', 'candado_modelo',
      'candado_noserie', 'cargador_modelo', 'cargador_noserie', 'tarjeta_graf_modelo',
      'tarjeta_graf_noserie', 'tarjeta_wifi_modelo', 'tarjeta_wifi_noserie',
      'ups_modelo', 'ups_noserie', 'mac_addres_ethernet', 'mac_addres_wifi',
      'equipo_rentado'
    ];
    
    if (uppercaseFields.includes(name)) {
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

    // Validación básica de campos requeridos
    const newErrors = {};
    const requiredFields = [
      'consecutivo', 'service_tag', 'equipo', 'marca_id', 'eq_modelo',
      'eq_noserie', 'disco_duro', 'procesador', 'velocidad_procesador',
      'no_cores', 'memoria_ram'
    ];
    const fieldRefs = {
      consecutivo: consecutivoRef,
      service_tag: serviceTagRef,
      equipo: equipoRef,
      marca_id: marcaIdRef,
      eq_modelo: modeloRef,
      eq_noserie: noSerieRef,
      disco_duro: discoDuroRef,
      procesador: procesadorRef,
      velocidad_procesador: velocidadProcesadorRef,
      no_cores: noCoresRef,
      memoria_ram: memoriaRamRef
    };
    let firstEmptyField = null;

    for (const field of requiredFields) {
      if (!formData[field] || (typeof formData[field] === 'string' && formData[field].trim() === '')) {
        newErrors[field] = 'Este campo es requerido';
        if (!firstEmptyField) {
          firstEmptyField = field;
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (firstEmptyField && fieldRefs[firstEmptyField]) {
        fieldRefs[firstEmptyField].current?.focus();
      }
      return;
    }

    setIsLoading(true);
    try {
      // Redirigir si está editando y no es administrador
      if (isEditing && !isAdmin) {
        navigate(`/inventarios/rentado/asignacion/${id}`);
        return;
      }

      // Asegurarse de que equipo_rentado sea 'SI' o 'NO'
      const formDataToSubmit = {
        ...formData,
        equipo_rentado: formData.equipo_rentado === 'SI' ? 'SI' : 'NO'
      };

      let equipoId;
      if (isEditing) {
        await dispatch(updateEquipo({ id, equipoData: formDataToSubmit })).unwrap();
        equipoId = id;
      } else {
        const response = await dispatch(createEquipo(formDataToSubmit)).unwrap();
        equipoId = response.data?.id || response.id;
        if (!equipoId) {
          throw new Error('No se pudo obtener el ID del equipo creado');
        }
      }
      navigate(`/inventarios/rentado/asignacion/${equipoId}`);
    } catch (error) {
      console.error('Error al guardar el equipo:', error);
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
        {isEditing ? 'Editar Equipo Rentado' : 'Registrar Nuevo Equipo Rentado'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6 bg-blue-100 p-4 sm:p-6 rounded-lg">
        {/* Información Principal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Consecutivo */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              type="text"
              name="consecutivo"
              value={formData.consecutivo}
              onChange={handleChange}
              readOnly={!isAdmin}
              autoComplete="off"
              className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.consecutivo ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.consecutivo ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
              placeholder=" "
              ref={consecutivoRef}
            />
            <label
              htmlFor="consecutivo"
              onClick={() => isAdmin && handleLabelClick(consecutivoRef)}
              className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
            >
              Consecutivo
            </label>
            {errors.consecutivo && (
              <p className="mt-1 text-sm text-red-600">{errors.consecutivo}</p>
            )}
          </div>

          {/* Service Tag */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              type="text"
              name="service_tag"
              value={formData.service_tag}
              onChange={handleChange}
              readOnly={!isAdmin}
              autoComplete="off"
              className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.service_tag ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.service_tag ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
              placeholder=" "
              ref={serviceTagRef}
            />
            <label
              htmlFor="service_tag"
              onClick={() => isAdmin && handleLabelClick(serviceTagRef)}
              className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
            >
              ALTUM
            </label>
            {errors.service_tag && (
              <p className="mt-1 text-sm text-red-600">{errors.service_tag}</p>
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
              Perfil del equipo
            </label>
            {errors.equipo && (
              <p className="mt-1 text-sm text-red-600">{errors.equipo}</p>
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
              name="eq_modelo"
              value={formData.eq_modelo}
              onChange={handleChange}
              readOnly={!isAdmin}
              autoComplete="off"
              className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.eq_modelo ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.eq_modelo ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
              placeholder=" "
              ref={modeloRef}
            />
            <label
              htmlFor="eq_modelo"
              onClick={() => isAdmin && handleLabelClick(modeloRef)}
              className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
            >
              Modelo
            </label>
            {errors.eq_modelo && (
              <p className="mt-1 text-sm text-red-600">{errors.eq_modelo}</p>
            )}
          </div>

          {/* No. Serie */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              type="text"
              name="eq_noserie"
              value={formData.eq_noserie}
              onChange={handleChange}
              readOnly={!isAdmin}
              autoComplete="off"
              className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.eq_noserie ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.eq_noserie ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
              placeholder=" "
              ref={noSerieRef}
            />
            <label
              htmlFor="eq_noserie"
              onClick={() => isAdmin && handleLabelClick(noSerieRef)}
              className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
            >
              No. Serie
            </label>
            {errors.eq_noserie && (
              <p className="mt-1 text-sm text-red-600">{errors.eq_noserie}</p>
            )}
          </div>

          {/* Disco Duro */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              type="text"
              name="disco_duro"
              value={formData.disco_duro}
              onChange={handleChange}
              readOnly={!isAdmin}
              autoComplete="off"
              className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.disco_duro ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.disco_duro ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
              placeholder=" "
              ref={discoDuroRef}
            />
            <label
              htmlFor="disco_duro"
              onClick={() => isAdmin && handleLabelClick(discoDuroRef)}
              className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
            >
              Disco Duro
            </label>
            {errors.disco_duro && (
              <p className="mt-1 text-sm text-red-600">{errors.disco_duro}</p>
            )}
          </div>

          {/* Procesador */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              type="text"
              name="procesador"
              value={formData.procesador}
              onChange={handleChange}
              readOnly={!isAdmin}
              autoComplete="off"
              className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.procesador ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.procesador ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
              placeholder=" "
              ref={procesadorRef}
            />
            <label
              htmlFor="procesador"
              onClick={() => isAdmin && handleLabelClick(procesadorRef)}
              className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
            >
              Procesador
            </label>
            {errors.procesador && (
              <p className="mt-1 text-sm text-red-600">{errors.procesador}</p>
            )}
          </div>

          {/* Velocidad Procesador */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              type="text"
              name="velocidad_procesador"
              value={formData.velocidad_procesador}
              onChange={handleChange}
              readOnly={!isAdmin}
              autoComplete="off"
              className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.velocidad_procesador ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.velocidad_procesador ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
              placeholder=" "
              ref={velocidadProcesadorRef}
            />
            <label
              htmlFor="velocidad_procesador"
              onClick={() => isAdmin && handleLabelClick(velocidadProcesadorRef)}
              className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
            >
              Velocidad Procesador
            </label>
            {errors.velocidad_procesador && (
              <p className="mt-1 text-sm text-red-600">{errors.velocidad_procesador}</p>
            )}
          </div>

          {/* No. Cores */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              type="text"
              name="no_cores"
              value={formData.no_cores}
              onChange={handleChange}
              readOnly={!isAdmin}
              autoComplete="off"
              className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.no_cores ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.no_cores ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
              placeholder=" "
              ref={noCoresRef}
            />
            <label
              htmlFor="no_cores"
              onClick={() => isAdmin && handleLabelClick(noCoresRef)}
              className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
            >
              No. Cores
            </label>
            {errors.no_cores && (
              <p className="mt-1 text-sm text-red-600">{errors.no_cores}</p>
            )}
          </div>

          {/* Memoria RAM */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              type="text"
              name="memoria_ram"
              value={formData.memoria_ram}
              onChange={handleChange}
              readOnly={!isAdmin}
              autoComplete="off"
              className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.memoria_ram ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.memoria_ram ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
              placeholder=" "
              ref={memoriaRamRef}
            />
            <label
              htmlFor="memoria_ram"
              onClick={() => isAdmin && handleLabelClick(memoriaRamRef)}
              className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
            >
              Memoria RAM
            </label>
            {errors.memoria_ram && (
              <p className="mt-1 text-sm text-red-600">{errors.memoria_ram}</p>
            )}
          </div>
        </div>

        {/* Periféricos */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Periféricos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Monitor */}
            <div className="col-span-full">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Monitor</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="relative mb-4 sm:mb-6 w-full group">
                  <CustomSelect
                    id="marca_idm"
                    name="marca_idm"
                    value={CATALOGOS.MARCAS.find(marca => marca.id === formData.marca_idm)
                      ? { value: formData.marca_idm, label: CATALOGOS.MARCAS.find(marca => marca.id === formData.marca_idm).marca }
                      : null}
                    onChange={(option) => handleChange({
                      target: {
                        name: 'marca_idm',
                        value: option ? option.value : ''
                      }
                    })}
                    options={CATALOGOS.MARCAS.map(marca => ({
                      value: marca.id,
                      label: marca.marca
                    }))}
                    placeholder="Seleccione una marca"
                    isDisabled={!isAdmin}
                  />
                  <label className="absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0]">
                    Marca
                  </label>
                </div>

                <div className="relative mb-4 sm:mb-6 w-full group">
                  <input
                    type="text"
                    name="monitor_modelo"
                    value={formData.monitor_modelo}
                    onChange={handleChange}
                    readOnly={!isAdmin}
                    autoComplete="off"
                    className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.monitor_modelo ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.monitor_modelo ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
                    placeholder=" "
                    ref={monitorModeloRef}
                  />
                  <label
                    htmlFor="monitor_modelo"
                    onClick={() => isAdmin && handleLabelClick(monitorModeloRef)}
                    className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
                  >
                    Modelo
                  </label>
                </div>

                <div className="relative mb-4 sm:mb-6 w-full group">
                  <input
                    type="text"
                    name="monitor_noserie"
                    value={formData.monitor_noserie}
                    onChange={handleChange}
                    readOnly={!isAdmin}
                    autoComplete="off"
                    className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.monitor_noserie ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.monitor_noserie ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
                    placeholder=" "
                    ref={monitorNoSerieRef}
                  />
                  <label
                    htmlFor="monitor_noserie"
                    onClick={() => isAdmin && handleLabelClick(monitorNoSerieRef)}
                    className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
                  >
                    No. Serie
                  </label>
                </div>
              </div>
            </div>

            {/* Teclado */}
            <div className="col-span-full">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Teclado</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="relative mb-4 sm:mb-6 w-full group">
                  <CustomSelect
                    id="marca_idt"
                    name="marca_idt"
                    value={CATALOGOS.MARCAS.find(marca => marca.id === formData.marca_idt)
                      ? { value: formData.marca_idt, label: CATALOGOS.MARCAS.find(marca => marca.id === formData.marca_idt).marca }
                      : null}
                    onChange={(option) => handleChange({
                      target: {
                        name: 'marca_idt',
                        value: option ? option.value : ''
                      }
                    })}
                    options={CATALOGOS.MARCAS.map(marca => ({
                      value: marca.id,
                      label: marca.marca
                    }))}
                    placeholder="Seleccione una marca"
                    isDisabled={!isAdmin}
                  />
                  <label className="absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0]">
                    Marca
                  </label>
                </div>

                <div className="relative mb-4 sm:mb-6 w-full group">
                  <input
                    type="text"
                    name="teclado_modelo"
                    value={formData.teclado_modelo}
                    onChange={handleChange}
                    readOnly={!isAdmin}
                    autoComplete="off"
                    className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.teclado_modelo ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.teclado_modelo ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
                    placeholder=" "
                    ref={tecladoModeloRef}
                  />
                  <label
                    htmlFor="teclado_modelo"
                    onClick={() => isAdmin && handleLabelClick(tecladoModeloRef)}
                    className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
                  >
                    Modelo
                  </label>
                </div>

                <div className="relative mb-4 sm:mb-6 w-full group">
                  <input
                    type="text"
                    name="teclado_noserie"
                    value={formData.teclado_noserie}
                    onChange={handleChange}
                    readOnly={!isAdmin}
                    autoComplete="off"
                    className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.teclado_noserie ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.teclado_noserie ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
                    placeholder=" "
                    ref={tecladoNoSerieRef}
                  />
                  <label
                    htmlFor="teclado_noserie"
                    onClick={() => isAdmin && handleLabelClick(tecladoNoSerieRef)}
                    className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
                  >
                    No. Serie
                  </label>
                </div>
              </div>
            </div>

            {/* Mouse */}
            <div className="col-span-full">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Mouse</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="relative mb-4 sm:mb-6 w-full group">
                  <CustomSelect
                    id="marca_idmo"
                    name="marca_idmo"
                    value={CATALOGOS.MARCAS.find(marca => marca.id === formData.marca_idmo)
                      ? { value: formData.marca_idmo, label: CATALOGOS.MARCAS.find(marca => marca.id === formData.marca_idmo).marca }
                      : null}
                    onChange={(option) => handleChange({
                      target: {
                        name: 'marca_idmo',
                        value: option ? option.value : ''
                      }
                    })}
                    options={CATALOGOS.MARCAS.map(marca => ({
                      value: marca.id,
                      label: marca.marca
                    }))}
                    placeholder="Seleccione una marca"
                    isDisabled={!isAdmin}
                  />
                  <label className="absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0]">
                    Marca
                  </label>
                </div>

                <div className="relative mb-4 sm:mb-6 w-full group">
                  <input
                    type="text"
                    name="mouse_modelo"
                    value={formData.mouse_modelo}
                    onChange={handleChange}
                    readOnly={!isAdmin}
                    autoComplete="off"
                    className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.mouse_modelo ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.mouse_modelo ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
                    placeholder=" "
                    ref={mouseModeloRef}
                  />
                  <label
                    htmlFor="mouse_modelo"
                    onClick={() => isAdmin && handleLabelClick(mouseModeloRef)}
                    className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
                  >
                    Modelo
                  </label>
                </div>

                <div className="relative mb-4 sm:mb-6 w-full group">
                  <input
                    type="text"
                    name="mouse_noserie"
                    value={formData.mouse_noserie}
                    onChange={handleChange}
                    readOnly={!isAdmin}
                    autoComplete="off"
                    className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.mouse_noserie ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.mouse_noserie ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
                    placeholder=" "
                    ref={mouseNoSerieRef}
                  />
                  <label
                    htmlFor="mouse_noserie"
                    onClick={() => isAdmin && handleLabelClick(mouseNoSerieRef)}
                    className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
                  >
                    No. Serie
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Maletín */}
        <div className="col-span-full">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Maletín</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="relative mb-4 sm:mb-6 w-full group">
              <CustomSelect
                id="marca_idma"
                name="marca_idma"
                value={CATALOGOS.MARCAS.find(marca => marca.id === formData.marca_idma)
                  ? { value: formData.marca_idma, label: CATALOGOS.MARCAS.find(marca => marca.id === formData.marca_idma).marca }
                  : null}
                onChange={(option) => handleChange({
                  target: {
                    name: 'marca_idma',
                    value: option ? option.value : ''
                  }
                })}
                options={CATALOGOS.MARCAS.map(marca => ({
                  value: marca.id,
                  label: marca.marca
                }))}
                placeholder="Seleccione una marca"
                isDisabled={!isAdmin}
              />
              <label className="absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0]">
                Marca
              </label>
            </div>

            <div className="relative mb-4 sm:mb-6 w-full group">
              <input
                type="text"
                name="maletin_modelo"
                value={formData.maletin_modelo}
                onChange={handleChange}
                readOnly={!isAdmin}
                autoComplete="off"
                className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.maletin_modelo ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.maletin_modelo ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
                placeholder=" "
                ref={maletinModeloRef}
              />
              <label
                htmlFor="maletin_modelo"
                onClick={() => isAdmin && handleLabelClick(maletinModeloRef)}
                className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
              >
                Modelo
              </label>
            </div>

            <div className="relative mb-4 sm:mb-6 w-full group">
              <input
                type="text"
                name="maletin_noserie"
                value={formData.maletin_noserie}
                onChange={handleChange}
                readOnly={!isAdmin}
                autoComplete="off"
                className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.maletin_noserie ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.maletin_noserie ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
                placeholder=" "
                ref={maletinNoSerieRef}
              />
              <label
                htmlFor="maletin_noserie"
                onClick={() => isAdmin && handleLabelClick(maletinNoSerieRef)}
                className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
              >
                No. Serie
              </label>
            </div>
          </div>
        </div>

        {/* Candado */}
        <div className="col-span-full">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Candado</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="relative mb-4 sm:mb-6 w-full group">
              <CustomSelect
                id="marca_idca"
                name="marca_idca"
                value={CATALOGOS.MARCAS.find(marca => marca.id === formData.marca_idca)
                  ? { value: formData.marca_idca, label: CATALOGOS.MARCAS.find(marca => marca.id === formData.marca_idca).marca }
                  : null}
                onChange={(option) => handleChange({
                  target: {
                    name: 'marca_idca',
                    value: option ? option.value : ''
                  }
                })}
                options={CATALOGOS.MARCAS.map(marca => ({
                  value: marca.id,
                  label: marca.marca
                }))}
                placeholder="Seleccione una marca"
                isDisabled={!isAdmin}
              />
              <label className="absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0]">
                Marca
              </label>
            </div>

            <div className="relative mb-4 sm:mb-6 w-full group">
              <input
                type="text"
                name="candado_modelo"
                value={formData.candado_modelo}
                onChange={handleChange}
                readOnly={!isAdmin}
                autoComplete="off"
                className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.candado_modelo ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.candado_modelo ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
                placeholder=" "
                ref={candadoModeloRef}
              />
              <label
                htmlFor="candado_modelo"
                onClick={() => isAdmin && handleLabelClick(candadoModeloRef)}
                className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
              >
                Modelo
              </label>
            </div>

            <div className="relative mb-4 sm:mb-6 w-full group">
              <input
                type="text"
                name="candado_noserie"
                value={formData.candado_noserie}
                onChange={handleChange}
                readOnly={!isAdmin}
                autoComplete="off"
                className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.candado_noserie ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.candado_noserie ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
                placeholder=" "
                ref={candadoNoSerieRef}
              />
              <label
                htmlFor="candado_noserie"
                onClick={() => isAdmin && handleLabelClick(candadoNoSerieRef)}
                className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
              >
                No. Serie
              </label>
            </div>
          </div>
        </div>

        {/* Cargador */}
        <div className="col-span-full">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Cargador</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="relative mb-4 sm:mb-6 w-full group">
              <CustomSelect
                id="marca_idba"
                name="marca_idba"
                value={CATALOGOS.MARCAS.find(marca => marca.id === formData.marca_idba)
                  ? { value: formData.marca_idba, label: CATALOGOS.MARCAS.find(marca => marca.id === formData.marca_idba).marca }
                  : null}
                onChange={(option) => handleChange({
                  target: {
                    name: 'marca_idba',
                    value: option ? option.value : ''
                  }
                })}
                options={CATALOGOS.MARCAS.map(marca => ({
                  value: marca.id,
                  label: marca.marca
                }))}
                placeholder="Seleccione una marca"
                isDisabled={!isAdmin}
              />
              <label className="absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0]">
                Marca
              </label>
            </div>

            <div className="relative mb-4 sm:mb-6 w-full group">
              <input
                type="text"
                name="cargador_modelo"
                value={formData.cargador_modelo}
                onChange={handleChange}
                readOnly={!isAdmin}
                autoComplete="off"
                className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.cargador_modelo ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.cargador_modelo ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
                placeholder=" "
                ref={cargadorModeloRef}
              />
              <label
                htmlFor="cargador_modelo"
                onClick={() => isAdmin && handleLabelClick(cargadorModeloRef)}
                className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
              >
                Modelo
              </label>
            </div>

            <div className="relative mb-4 sm:mb-6 w-full group">
              <input
                type="text"
                name="cargador_noserie"
                value={formData.cargador_noserie}
                onChange={handleChange}
                readOnly={!isAdmin}
                autoComplete="off"
                className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.cargador_noserie ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.cargador_noserie ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
                placeholder=" "
                ref={cargadorNoSerieRef}
              />
              <label
                htmlFor="cargador_noserie"
                onClick={() => isAdmin && handleLabelClick(cargadorNoSerieRef)}
                className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
              >
                No. Serie
              </label>
            </div>
          </div>
        </div>

        {/* Tarjeta Gráfica */}
        <div className="col-span-full">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Tarjeta Gráfica</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="relative mb-4 sm:mb-6 w-full group">
              <CustomSelect
                id="marca_idtg"
                name="marca_idtg"
                value={CATALOGOS.MARCAS.find(marca => marca.id === formData.marca_idtg)
                  ? { value: formData.marca_idtg, label: CATALOGOS.MARCAS.find(marca => marca.id === formData.marca_idtg).marca }
                  : null}
                onChange={(option) => handleChange({
                  target: {
                    name: 'marca_idtg',
                    value: option ? option.value : ''
                  }
                })}
                options={CATALOGOS.MARCAS.map(marca => ({
                  value: marca.id,
                  label: marca.marca
                }))}
                placeholder="Seleccione una marca"
                isDisabled={!isAdmin}
              />
              <label className="absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0]">
                Marca
              </label>
            </div>

            <div className="relative mb-4 sm:mb-6 w-full group">
              <input
                type="text"
                name="tarjeta_graf_modelo"
                value={formData.tarjeta_graf_modelo}
                onChange={handleChange}
                readOnly={!isAdmin}
                autoComplete="off"
                className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.tarjeta_graf_modelo ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.tarjeta_graf_modelo ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
                placeholder=" "
                ref={tarjetaGrafModeloRef}
              />
              <label
                htmlFor="tarjeta_graf_modelo"
                onClick={() => isAdmin && handleLabelClick(tarjetaGrafModeloRef)}
                className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
              >
                Modelo
              </label>
            </div>

            <div className="relative mb-4 sm:mb-6 w-full group">
              <input
                type="text"
                name="tarjeta_graf_noserie"
                value={formData.tarjeta_graf_noserie}
                onChange={handleChange}
                readOnly={!isAdmin}
                autoComplete="off"
                className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.tarjeta_graf_noserie ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.tarjeta_graf_noserie ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
                placeholder=" "
                ref={tarjetaGrafNoSerieRef}
              />
              <label
                htmlFor="tarjeta_graf_noserie"
                onClick={() => isAdmin && handleLabelClick(tarjetaGrafNoSerieRef)}
                className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
              >
                No. Serie
              </label>
            </div>
          </div>
        </div>

        {/* Tarjeta WiFi */}
        <div className="col-span-full">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Tarjeta WiFi</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="relative mb-4 sm:mb-6 w-full group">
              <CustomSelect
                id="marca_idwi"
                name="marca_idwi"
                value={CATALOGOS.MARCAS.find(marca => marca.id === formData.marca_idwi)
                  ? { value: formData.marca_idwi, label: CATALOGOS.MARCAS.find(marca => marca.id === formData.marca_idwi).marca }
                  : null}
                onChange={(option) => handleChange({
                  target: {
                    name: 'marca_idwi',
                    value: option ? option.value : ''
                  }
                })}
                options={CATALOGOS.MARCAS.map(marca => ({
                  value: marca.id,
                  label: marca.marca
                }))}
                placeholder="Seleccione una marca"
                isDisabled={!isAdmin}
              />
              <label className="absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0]">
                Marca
              </label>
            </div>

            <div className="relative mb-4 sm:mb-6 w-full group">
              <input
                type="text"
                name="tarjeta_wifi_modelo"
                value={formData.tarjeta_wifi_modelo}
                onChange={handleChange}
                readOnly={!isAdmin}
                autoComplete="off"
                className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.tarjeta_wifi_modelo ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.tarjeta_wifi_modelo ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
                placeholder=" "
                ref={tarjetaWifiModeloRef}
              />
              <label
                htmlFor="tarjeta_wifi_modelo"
                onClick={() => isAdmin && handleLabelClick(tarjetaWifiModeloRef)}
                className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
              >
                Modelo
              </label>
            </div>

            <div className="relative mb-4 sm:mb-6 w-full group">
              <input
                type="text"
                name="tarjeta_wifi_noserie"
                value={formData.tarjeta_wifi_noserie}
                onChange={handleChange}
                readOnly={!isAdmin}
                autoComplete="off"
                className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.tarjeta_wifi_noserie ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.tarjeta_wifi_noserie ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
                placeholder=" "
                ref={tarjetaWifiNoSerieRef}
              />
              <label
                htmlFor="tarjeta_wifi_noserie"
                onClick={() => isAdmin && handleLabelClick(tarjetaWifiNoSerieRef)}
                className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
              >
                No. Serie
              </label>
            </div>
          </div>
        </div>

        {/* UPS */}
        <div className="col-span-full">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">UPS</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="relative mb-4 sm:mb-6 w-full group">
              <CustomSelect
                id="marca_idup"
                name="marca_idup"
                value={CATALOGOS.MARCAS.find(marca => marca.id === formData.marca_idup)
                  ? { value: formData.marca_idup, label: CATALOGOS.MARCAS.find(marca => marca.id === formData.marca_idup).marca }
                  : null}
                onChange={(option) => handleChange({
                  target: {
                    name: 'marca_idup',
                    value: option ? option.value : ''
                  }
                })}
                options={CATALOGOS.MARCAS.map(marca => ({
                  value: marca.id,
                  label: marca.marca
                }))}
                placeholder="Seleccione una marca"
                isDisabled={!isAdmin}
              />
              <label className="absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0]">
                Marca
              </label>
            </div>

            <div className="relative mb-4 sm:mb-6 w-full group">
              <input
                type="text"
                name="ups_modelo"
                value={formData.ups_modelo}
                onChange={handleChange}
                readOnly={!isAdmin}
                autoComplete="off"
                className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.ups_modelo ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.ups_modelo ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
                placeholder=" "
                ref={upsModeloRef}
              />
              <label
                htmlFor="ups_modelo"
                onClick={() => isAdmin && handleLabelClick(upsModeloRef)}
                className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
              >
                Modelo
              </label>
            </div>

            <div className="relative mb-4 sm:mb-6 w-full group">
              <input
                type="text"
                name="ups_noserie"
                value={formData.ups_noserie}
                onChange={handleChange}
                readOnly={!isAdmin}
                autoComplete="off"
                className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.ups_noserie ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.ups_noserie ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
                placeholder=" "
                ref={upsNoSerieRef}
              />
              <label
                htmlFor="ups_noserie"
                onClick={() => isAdmin && handleLabelClick(upsNoSerieRef)}
                className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
              >
                No. Serie
              </label>
            </div>
          </div>
        </div>

        {/* Información Adicional */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Información Adicional</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="relative mb-4 sm:mb-6 w-full group">
              <input
                type="text"
                name="dominio"
                value={formData.dominio}
                onChange={handleChange}
                readOnly={!isAdmin}
                autoComplete="off"
                className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.dominio ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.dominio ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
                placeholder=" "
                ref={dominioRef}
              />
              <label
                htmlFor="dominio"
                onClick={() => isAdmin && handleLabelClick(dominioRef)}
                className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
              >
                Dominio
              </label>
            </div>

            <div className="relative mb-4 sm:mb-6 w-full group">
              <input
                type="text"
                name="mac_addres_ethernet"
                value={formData.mac_addres_ethernet}
                onChange={handleChange}
                readOnly={!isAdmin}
                autoComplete="off"
                className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.mac_addres_ethernet ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.mac_addres_ethernet ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
                placeholder=" "
                ref={macEthernetRef}
              />
              <label
                htmlFor="mac_addres_ethernet"
                onClick={() => isAdmin && handleLabelClick(macEthernetRef)}
                className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
              >
                MAC Address Ethernet
              </label>
            </div>

            <div className="relative mb-4 sm:mb-6 w-full group">
              <input
                type="text"
                name="mac_addres_wifi"
                value={formData.mac_addres_wifi}
                onChange={handleChange}
                readOnly={!isAdmin}
                autoComplete="off"
                className={`block py-2.5 px-0 w-full text-lg text-gray-900 ${!formData.mac_addres_wifi ? 'bg-white' : 'bg-transparent'} border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${errors.mac_addres_wifi ? 'border-red-500' : 'border-gray-500 focus:border-colorPrimario'} ${!isAdmin ? 'cursor-not-allowed' : ''}`}
                placeholder=" "
                ref={macWifiRef}
              />
              <label
                htmlFor="mac_addres_wifi"
                onClick={() => isAdmin && handleLabelClick(macWifiRef)}
                className={`peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${isAdmin ? 'cursor-pointer' : ''}`}
              >
                MAC Address WiFi
              </label>
            </div>

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
                Fecha Alta
              </label>
            </div>

            <div className="relative mb-4 sm:mb-6 w-full group">
              <CustomSelect
                id="equipo_rentado"
                name="equipo_rentado"
                value={[{ value: 'SI', label: 'SI' }, { value: 'NO', label: 'NO' }].find(rent => rent.value === formData.equipo_rentado)
                  ? { value: formData.equipo_rentado, label: [{ value: 'SI', label: 'SI' }, { value: 'NO', label: 'NO' }].find(rent => rent.value === formData.equipo_rentado).label }
                  : null}
                onChange={(option) => handleChange({
                  target: {
                    name: 'equipo_rentado',
                    value: option ? option.value : ''
                  }
                })}
                options={[{ value: 'SI', label: 'SI' }, { value: 'NO', label: 'NO' }]}
                placeholder="Seleccione una opción"
                isDisabled={!isAdmin}
              />
              <label
                htmlFor="equipo_rentado"
                className={`absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] ${isAdmin ? 'cursor-pointer' : ''}`}
              >
                Equipo Rentado
              </label>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
          <SubmitButton
            type="button"
            variant="secondary"
            onClick={() => navigate('/inventarios/rentado')}
            className="w-full sm:w-auto"
          >
            Cancelar
          </SubmitButton>
          
          <SubmitButton
            type="submit"
            loading={isLoading}
            className="w-full sm:w-auto"
          >
            {isEditing ? (isAdmin ? 'Actualizar' : 'Continuar') : 'Guardar'}
          </SubmitButton>
        </div>
      </form>
    </>
  );
};

export default EquipoRentadoForm; 