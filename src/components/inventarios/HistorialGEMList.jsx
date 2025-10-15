import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getHistorial } from '../../features/inventarioGEM/inventarioGEMSlice';
import LoadingSpinner from '../common/LoadingSpinner';
import { FaArrowLeft, FaFilePdf, FaEye } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { BASE_URL } from '../../services/api';


const HistorialGEMList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { equipoId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const { historial, pagination } = useSelector(state => state.inventarioGEM);
  const [currentPage, setCurrentPage] = useState(1);

  // Obtener parámetros de la URL
  const searchParams = new URLSearchParams(location.search);
  const pageParam = searchParams.get('page');

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        setIsLoading(true);
        // Si hay un parámetro de página en la URL, usarlo
        const page = pageParam ? parseInt(pageParam) : currentPage;
        await dispatch(getHistorial({ equipoId, page })).unwrap();
      } catch (error) {
        console.error('Error al cargar el historial:', error);
        Swal.fire({
          title: 'Error',
          text: 'Error al cargar el historial de asignaciones',
          icon: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    cargarHistorial();
  }, [equipoId, dispatch, currentPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    navigate(`/inventarios/gem/historial/${equipoId}?page=${pageNumber}`);
  };

  const handleVerPDF = async (inventarioId) => {
    try {
      const pdfResponse = await fetch(`${BASE_URL}/api/equipo-gem/${equipoId}/ficha-pdf-historial/${inventarioId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf'
        }
      });

      if (pdfResponse.ok) {
        const pdfBlob = await pdfResponse.blob();
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');
      } else {
        throw new Error('Error al generar el PDF');
      }
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      Swal.fire({
        title: 'Error',
        text: 'Error al generar el PDF del historial',
        icon: 'error'
      });
    }
  };

  const handleVerDetalle = (registro) => {
    navigate(`/inventarios/gem/historial/${equipoId}/detalle/${registro.id}`, { state: { registro } });
  };

  if (isLoading) {
    return <LoadingSpinner message="Cargando historial..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Historial de Asignaciones</h2>
        <button
          onClick={() => navigate(`/inventarios/gem/inventario/${equipoId}`)}
          className="flex items-center space-x-2 bg-colorPrimario text-white px-4 py-2 rounded hover:bg-colorPrimarioDark transition-colors"
        >
          <FaArrowLeft />
          <span>Volver</span>
        </button>
      </div>

      {historial.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay registros en el historial</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="text-base text-white uppercase bg-colorPrimario">
                <tr>
                  <th scope="col" className="py-2 px-4">Opciones</th>
                  <th scope="col" className="py-2 px-4">Fecha</th>
                  <th scope="col" className="py-2 px-4">Usuario</th>
                  <th scope="col" className="py-2 px-4">Dependencia</th>
                  <th scope="col" className="py-2 px-4">Municipio</th>
                  <th scope="col" className="py-2 px-4">Técnico</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historial.map((registro) => (
                  <tr key={registro.id} className="hover:bg-blue-50">
                    <td className="py-2 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleVerDetalle(registro)}
                          title="Ver detalle"
                          className="text-[#bc955b] hover:text-white border-2 border-[#bc955b] hover:bg-[#bc955b] focus:ring-2 focus:outline-none focus:ring-[#bc955b] font-medium rounded-lg text-sm px-3 py-2.5 text-center"
                        >
                          <FaEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleVerPDF(registro.id)}
                          title="Ver PDF"
                          className="text-red-600 hover:text-red-800 transition-colors duration-200"
                        >
                          <FaFilePdf size={24} />
                        </button>
                      </div>
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(registro.fecha_m).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap text-sm text-gray-900">
                      {registro.usuario}
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap text-sm text-gray-500">
                      {registro.dependencia?.oficina || 'N/A'}
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap text-sm text-gray-500">
                      {registro.municipio?.municipio || 'N/A'}
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap text-sm text-gray-500">
                      {registro.user?.nombre_completo || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación y contador de resultados */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
            <div className="text-sm text-gray-600 text-center sm:text-left">
              Mostrando <span className="font-medium">{pagination.from || 0}</span> a <span className="font-medium">{pagination.to || 0}</span> de <span className="font-medium">{pagination.total || 0}</span> resultados
            </div>
            
            {pagination.lastPage > 1 && (
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2 sm:px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Anterior
                </button>
                
                {/* Generate page numbers to display */}
                {(() => {
                  const pages = [];
                  const pagesToShow = window.innerWidth < 640 ? 5 : 10; // Menos páginas en móvil
                  let startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
                  let endPage = Math.min(pagination.lastPage, startPage + pagesToShow - 1);

                  // Adjust startPage and endPage if they hit the boundaries
                  if (endPage - startPage + 1 < pagesToShow) {
                    startPage = Math.max(1, endPage - pagesToShow + 1);
                  }

                  if (startPage > 1) {
                    pages.push(1);
                    if (startPage > 2) {
                      pages.push('...');
                    }
                  }

                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(i);
                  }

                  if (endPage < pagination.lastPage) {
                    if (endPage < pagination.lastPage - 1) {
                      pages.push('...');
                    }
                    pages.push(pagination.lastPage);
                  }

                  return pages.map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === 'number' && handlePageChange(page)}
                      disabled={typeof page !== 'number' || currentPage === page}
                      className={`px-2 sm:px-3 py-1 rounded-md text-sm ${typeof page === 'number' ?
                        (currentPage === page
                          ? 'bg-colorPrimario text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50')
                        : 'bg-white border border-gray-300 text-gray-700 opacity-50 cursor-default' // Style for ellipsis
                      }`}
                    >
                      {page}
                    </button>
                  ));
                })()}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.lastPage}
                  className="px-2 sm:px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default HistorialGEMList; 