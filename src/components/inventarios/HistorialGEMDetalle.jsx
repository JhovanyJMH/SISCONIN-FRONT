import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaFilePdf, FaImage, FaTimes } from 'react-icons/fa';
import { BASE_URL } from '../../services/api';


const HistorialGEMDetalle = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { registro } = location.state || {};
  const [previewModal, setPreviewModal] = useState({ url: null, type: null });

  if (!registro) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No se encontró el registro</p>
      </div>
    );
  }

  const getPublicUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('blob:')) return path;
    if (path.startsWith('http')) return path;
    return `${BASE_URL}/storage/${path}`;
  };

  const handlePreview = (url, type) => {
    setPreviewModal({ url, type });
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Detalle de Asignación Histórica</h2>

      <div className="space-y-6 bg-orange-100 p-4 sm:p-6 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Dependencias */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              type="text"
              value={registro.dependencia?.oficina || 'N/A'}
              readOnly
              className="block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer cursor-not-allowed"
              placeholder=" "
            />
            <label className="absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0]">
              Oficina
            </label>
          </div>

          {/* Usuario */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              type="text"
              value={registro.usuario || 'N/A'}
              readOnly
              className="block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer cursor-not-allowed"
              placeholder=" "
            />
            <label className="absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0]">
              Usuario
            </label>
          </div>

          {/* Correo */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              type="email"
              value={registro.correo || 'N/A'}
              readOnly
              className="block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer cursor-not-allowed"
              placeholder=" "
            />
            <label className="absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0]">
              Correo
            </label>
          </div>

          {/* Puesto */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              type="text"
              value={registro.puesto || 'N/A'}
              readOnly
              className="block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer cursor-not-allowed"
              placeholder=" "
            />
            <label className="absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0]">
              Puesto
            </label>
          </div>

          {/* Teléfono */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              type="tel"
              value={registro.telefono || 'N/A'}
              readOnly
              className="block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer cursor-not-allowed"
              placeholder=" "
            />
            <label className="absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0]">
              Teléfono
            </label>
          </div>

          {/* Extensión */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              type="text"
              value={registro.extension || 'N/A'}
              readOnly
              className="block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer cursor-not-allowed"
              placeholder=" "
            />
            <label className="absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0]">
              Extensión
            </label>
          </div>

          {/* Edificio */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              type="text"
              value={registro.edificio || 'N/A'}
              readOnly
              className="block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer cursor-not-allowed"
              placeholder=" "
            />
            <label className="absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0]">
              Edificio
            </label>
          </div>

          {/* Piso */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              type="text"
              value={registro.piso || 'N/A'}
              readOnly
              className="block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer cursor-not-allowed"
              placeholder=" "
            />
            <label className="absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0]">
              Piso
            </label>
          </div>

          {/* Dirección */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              type="text"
              value={registro.direccion || 'N/A'}
              readOnly
              className="block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer cursor-not-allowed"
              placeholder=" "
            />
            <label className="absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0]">
              Dirección
            </label>
          </div>

          {/* Municipio */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              type="text"
              value={registro.municipio?.municipio || 'N/A'}
              readOnly
              className="block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer cursor-not-allowed"
              placeholder=" "
            />
            <label className="absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0]">
              Municipio
            </label>
          </div>

          {/* Técnico Responsable */}
          <div className="relative mb-4 sm:mb-6 w-full group">
            <input
              type="text"
              value={registro.user?.nombre_completo || 'N/A'}
              readOnly
              className="block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer cursor-not-allowed"
              placeholder=" "
            />
            <label className="absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0]">
              Técnico Responsable
            </label>
          </div>

          {/* Fotos */}
          <div className="relative mb-4 sm:mb-6 w-full group col-span-1 md:col-span-2 lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {['inv_gem_foto1', 'inv_gem_foto2', 'inv_gem_foto3', 'inv_gem_foto4'].map((field, index) => {
                const fileUrl = getPublicUrl(registro[field]);
                const isPdf = fileUrl?.toLowerCase().endsWith('.pdf');
                
                return (
                  <div key={field} className="relative">
                    <div className="flex flex-col items-center">
                      {fileUrl ? (
                        <div className="relative w-full h-48 mb-2">
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
                        </div>
                      ) : (
                        <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded flex items-center justify-center mb-2">
                          <div className="text-center">
                            <FaImage className="mx-auto text-gray-400 text-3xl mb-2" />
                            <span className="text-sm text-gray-500">Sin archivo</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Observaciones */}
          <div className="relative mb-4 sm:mb-6 w-full group col-span-1 md:col-span-2 lg:col-span-3">
            <textarea
              value={registro.inv_gem_obs1 || 'Sin observaciones'}
              readOnly
              className="block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer cursor-not-allowed"
              rows="3"
            />
            <label className="absolute text-lg text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0]">
              Observaciones
            </label>
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

        <div className="flex justify-end">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 bg-colorPrimario text-white px-4 py-2 rounded hover:bg-colorPrimarioDark transition-colors"
          >
            <FaArrowLeft />
            <span>Volver</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default HistorialGEMDetalle; 