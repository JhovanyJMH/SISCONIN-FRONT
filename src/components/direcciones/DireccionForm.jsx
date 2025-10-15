import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createDireccion, clearError, clearSuccessMessage } from '../../features/direcciones/direccionesSlice';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import LoadingSpinner from '../common/LoadingSpinner';
import SubmitButton from '../common/SubmitButton';

const DireccionForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, successMessage } = useSelector((state) => state.direcciones);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      direccion: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      // Agregar código postal por defecto y forzar activo como true
      const dataWithCodigoPostal = {
        ...data,
        activo: true,
        codigo_postal: '00000' // Código postal por defecto
      };
      await dispatch(createDireccion(dataWithCodigoPostal)).unwrap();
      navigate('/catalogo-direcciones');
    } catch (error) {
      console.error('Error al crear dirección:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
        Registrar Nueva Dirección
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6 bg-blue-100 p-3 sm:p-4 md:p-6 rounded-lg" noValidate>
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {/* Dirección */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              type="text"
              {...register('direccion', { 
                required: 'Este campo es requerido',
                maxLength: {
                  value: 500,
                  message: 'La dirección no puede exceder los 500 caracteres'
                },
                onChange: (e) => {
                  e.target.value = e.target.value.toUpperCase();
                }
              })}
              className={`block py-2 px-0 w-full text-base sm:text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-500 appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer`}
              placeholder=" "
              id="direccion"
              autoComplete="off"
            />
            <label
              htmlFor="direccion"
              className="peer-focus:font-medium absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 cursor-pointer"
            >
              Dirección *
            </label>
            {errors.direccion && (
              <p className="mt-1 text-sm text-red-600">{errors.direccion.message}</p>
            )}
          </div>

          {/* Estado Activo - Oculto */}
          <input type="hidden" {...register('activo')} value={true} />
        </div>

        <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-3 mt-4">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <SubmitButton
              type="button"
              variant="secondary"
              onClick={() => navigate('/catalogo-direcciones')}
              className="w-full sm:w-auto bg-colorSecundario hover:bg-colorSecundario"
            >
              Atrás
            </SubmitButton>
          </div>
           
          <SubmitButton
            type="submit"
            loading={loading}
            className="w-full sm:w-auto"
          >
            Registrar
          </SubmitButton>
        </div>
      </form>
    </div>
  );
};

export default DireccionForm;
