import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { fetchEquipos, deleteEquipo } from '../../features/equipos/equiposSlice';
import Swal from 'sweetalert2';
import { SearchBar } from '../SearchBar';
import { FaFilePdf, FaFileCsv } from 'react-icons/fa';
import api, { BASE_URL } from '../../services/api';

// Campos exportables según el backend actualizado
const exportableFields = [
  { value: 'id', label: 'ID' },
  { value: 'consecutivo', label: 'CONSECUTIVO' },
  { value: 'service_tag', label: 'SERVICE TAG' },
  { value: 'equipo', label: 'EQUIPO' },
  { value: 'marca', label: 'MARCA' },
  { value: 'eq_modelo', label: 'MODELO' },
  { value: 'eq_noserie', label: 'NO. SERIE' },
  { value: 'disco_duro', label: 'DISCO DURO' },
  { value: 'procesador', label: 'PROCESADOR' },
  { value: 'velocidad_procesador', label: 'VELOCIDAD PROCESADOR' },
  { value: 'no_cores', label: 'NO. CORES' },
  { value: 'memoria_ram', label: 'MEMORIA RAM' },
  { value: 'marca_monitor', label: 'MARCA MONITOR' },
  { value: 'monitor_modelo', label: 'MODELO MONITOR' },
  { value: 'monitor_noserie', label: 'NO. SERIE MONITOR' },
  { value: 'marca_teclado', label: 'MARCA TECLADO' },
  { value: 'teclado_modelo', label: 'MODELO TECLADO' },
  { value: 'teclado_noserie', label: 'NO. SERIE TECLADO' },
  { value: 'marca_mouse', label: 'MARCA MOUSE' },
  { value: 'mouse_modelo', label: 'MODELO MOUSE' },
  { value: 'mouse_noserie', label: 'NO. SERIE MOUSE' },
  { value: 'marca_maletin', label: 'MARCA MALETÍN' },
  { value: 'maletin_modelo', label: 'MODELO MALETÍN' },
  { value: 'maletin_noserie', label: 'NO. SERIE MALETÍN' },
  { value: 'marca_candado', label: 'MARCA CANDADO' },
  { value: 'candado_modelo', label: 'MODELO CANDADO' },
  { value: 'candado_noserie', label: 'NO. SERIE CANDADO' },
  { value: 'marca_cargador', label: 'MARCA CARGADOR' },
  { value: 'cargador_modelo', label: 'MODELO CARGADOR' },
  { value: 'cargador_noserie', label: 'NO. SERIE CARGADOR' },
  { value: 'marca_tarjeta_grafica', label: 'MARCA TARJETA GRÁFICA' },
  { value: 'tarjeta_graf_modelo', label: 'MODELO TARJETA GRÁFICA' },
  { value: 'tarjeta_graf_noserie', label: 'NO. SERIE TARJETA GRÁFICA' },
  { value: 'marca_tarjeta_wifi', label: 'MARCA TARJETA WIFI' },
  { value: 'tarjeta_wifi_modelo', label: 'MODELO TARJETA WIFI' },
  { value: 'tarjeta_wifi_noserie', label: 'NO. SERIE TARJETA WIFI' },
  { value: 'marca_ups', label: 'MARCA UPS' },
  { value: 'ups_modelo', label: 'MODELO UPS' },
  { value: 'ups_noserie', label: 'NO. SERIE UPS' },
  { value: 'dominio', label: 'DOMINIO' },
  { value: 'mac_addres_ethernet', label: 'MAC ADDRESS ETHERNET' },
  { value: 'mac_addres_wifi', label: 'MAC ADDRESS WIFI' },
  { value: 'fec_alta', label: 'FECHA ALTA' },
  { value: 'equipo_rentado', label: 'EQUIPO RENTADO' },
  { value: 'usuario', label: 'USUARIO' },
  { value: 'correo', label: 'CORREO' },
  { value: 'puesto', label: 'PUESTO' },
  { value: 'telefono', label: 'TELÉFONO' },
  { value: 'extension', label: 'EXTENSIÓN' },
  { value: 'edificio', label: 'EDIFICIO' },
  { value: 'piso', label: 'PISO' },
  { value: 'direccion', label: 'DIRECCIÓN' },
  { value: 'unidad', label: 'UNIDAD ADMINISTRATIVA' },
  { value: 'area', label: 'ÁREA' },
  { value: 'municipio', label: 'MUNICIPIO' },
  { value: 'responsable', label: 'RESPONSABLE' },
];

const EquiposRentadosList = ({ search }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { items: equipos, loading, error, pagination } = useSelector((state) => state.equipos);
  const { user } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState(search || '');
  const [currentPage, setCurrentPage] = useState(1);
  const highlightedRowRef = useRef(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedFields, setSelectedFields] = useState(['id', 'consecutivo']);

  // Obtener parámetros de la URL
  const searchParams = new URLSearchParams(location.search);
  const pageParam = searchParams.get('page');
  const highlightParam = searchParams.get('highlight');

  useEffect(() => {
    // Si hay un parámetro de página en la URL, actualizar el estado
    if (pageParam) {
      const page = parseInt(pageParam);
      setCurrentPage(page);
      dispatch(fetchEquipos({ page, search: searchTerm }));
    }
  }, [pageParam, dispatch, searchTerm]);

  useEffect(() => {
    // Solo cargar datos si no hay un parámetro de página en la URL
    if (!pageParam) {
      dispatch(fetchEquipos({ page: currentPage, search: searchTerm }));
    }
  }, [dispatch, searchTerm, currentPage, pageParam]);

  useEffect(() => {
    // Efecto para resaltar el registro
    if (highlightParam && !loading && equipos.length > 0) {
      setTimeout(() => {
        if (highlightedRowRef.current) {
          highlightedRowRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100);
    }
  }, [highlightParam, loading, equipos]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    // Reiniciar SIEMPRE a la primera página y reflejarlo en la URL
    setCurrentPage(1);
    const newSearchParams = new URLSearchParams(location.search);
    if (newSearchParams.has('page')) {
      newSearchParams.set('page', 1);
    } else {
      newSearchParams.append('page', 1);
    }
    navigate(`${location.pathname}?${newSearchParams.toString()}`);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Actualizar la URL con el nuevo número de página
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.set('page', pageNumber);
    navigate(`${location.pathname}?${newSearchParams.toString()}`);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteEquipo(id)).unwrap();
        dispatch(fetchEquipos({ page: currentPage, search: searchTerm }));
        Swal.fire(
          '¡Eliminado!',
          'El equipo ha sido eliminado exitosamente.',
          'success'
        );
      } catch (error) {
        Swal.fire(
          'Error',
          'Ocurrió un error al eliminar el equipo.',
          'error'
        );
      }
    }
  };

  const handleViewPDF = (id) => {
    window.open(`${BASE_URL}/api/equipo/${id}/pdf`, '_blank');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const handleDownloadCSV = async () => {
    try {
      const response = await api.post(
        '/equipos/export-csv',
        { fields: selectedFields },
        {
          responseType: 'blob',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'text/csv'
          }
        }
      );

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;
      const filename = `CAT_EQUIPOS_RENTADOS_${formattedDate}.csv`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al descargar el archivo CSV',
      });
    }
  };

  const handleFieldChange = (field) => {
    setSelectedFields((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field]
    );
  };

  const handleSelectAll = () => {
    setSelectedFields(exportableFields.map(field => field.value));
  };

  const handleDeselectAll = () => {
    setSelectedFields([]);
  };

  const openExportModal = () => setShowExportModal(true);
  const closeExportModal = () => setShowExportModal(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-colorPrimario"></div>
      </div>
    );
  }

  return (
    <>
      <SearchBar 
        searchPath="/get-search-equipos-rentados"
        normalPath="/get-equipos-rentados"
        showButton={false}
        onSearch={handleSearch}
        placeholder="Buscar por service tag, equipo, marca, modelo, número de serie..."
      />
       {user?.profile === '1' && (
      <div className="flex justify-end mb-4">
        <button
          onClick={openExportModal}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          title="Descargar CSV"
        >
          <FaFileCsv className="mr-2" />
          Descargar
        </button>
      </div>
      )}
      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="text-base text-white uppercase bg-colorPrimario">
            <tr>
              
              <th scope="col" className="py-2 px-4">ID</th>
              <th scope="col" className="py-2 px-4">Opciones</th>
              <th scope="col" className="py-2 px-4">ALTUM</th>
              <th scope="col" className="py-2 px-4">Equipo</th>
              <th scope="col" className="py-2 px-4">Usuario</th>
              <th scope="col" className="py-2 px-4">Modelo</th>
              <th scope="col" className="py-2 px-4">No. Serie</th>
              <th scope="col" className="py-2 px-4">Unidad Administrativa</th>
              <th scope="col" className="py-2 px-4">Área</th>

              {/* <th scope="col" className="py-2 px-4">Procesador</th>
              <th scope="col" className="py-2 px-4">RAM</th>
              <th scope="col" className="py-2 px-4">Disco Duro</th> */}
              <th scope="col" className="py-2 px-4">PDF</th>
            </tr>
          </thead>
          <tbody className={`${loading ? 'hidden' : ''} uppercase text-xs`}>
            {equipos.map((equipo) => (
              <tr
                key={equipo.id}
                ref={equipo.id.toString() === highlightParam ? highlightedRowRef : null}
                className={`bg-gray-50 border-b hover:bg-orange-100 border-colorTerciario cursor-pointer transition-colors duration-200 ${
                  equipo.id.toString() === highlightParam ? 'bg-orange-200' : ''
                }`}
                >
                <td className="py-1 px-4">{equipo.id}</td>
                <th scope="row" className="flex items-center py-1 px-4 space-x-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex items-center">
                      <Link
                        to={`/inventarios/rentado/editar/${equipo.id}`}
                        title="Editar"
                        className="text-[#bc955b] hover:text-white border-2 border-[#bc955b] hover:bg-[#bc955b] focus:ring-2 focus:outline-none focus:ring-[#bc955b] font-medium rounded-lg text-sm px-3 py-2.5 text-center mr-2 mb-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 icon icon-tabler icon-tabler-pencil" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                          <path d="M4 20h4l10.5 -10.5a1.5 1.5 0 0 0 -4 -4l-10.5 10.5v4"></path>
                          <path d="M13.5 6.5l4 4"></path>
                        </svg>
                      </Link>
                      {/* Botón para ir directamente a la asignación del equipo (icono usuario +) */}
                      <button
                        onClick={() => navigate(`/inventarios/rentado/asignacion/${equipo.id}`)}
                        title="Asignar Equipo"
                        className="text-orange-500 bg-transparent border-2 border-orange-500 hover:bg-orange-500 hover:text-white focus:ring-2 focus:outline-none focus:ring-orange-500 font-medium rounded-lg text-sm px-3 py-2.5 text-center mr-2 mb-2 transition-colors duration-200"
                      >
                        {/* Icono: usuario con '+' */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                          <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
                          <path d="M16 19h6" />
                          <path d="M19 16v6" />
                          <path d="M6 21v-2a4 4 0 0 1 4 -4h4" />
                        </svg>
                      </button>
                      {user?.profile === '1' && (
                        <button
                          onClick={() => handleDelete(equipo.id)}
                          title="Eliminar"
                          className="text-colorPrimario bg-white border-2 border-colorPrimario hover:bg-colorPrimario hover:text-white focus:ring-2 focus:outline-none focus:ring-colorPrimario font-medium rounded-lg text-sm px-3 py-2.5 text-center mb-2 transition-colors duration-200"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 icon icon-tabler icon-tabler-trash" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                            <path d="M4 7h16"></path>
                            <path d="M10 11v6"></path>
                            <path d="M14 11v6"></path>
                            <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"></path>
                            <path d="M9 7V4a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"></path>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </th>
                <td className="py-1 px-4">{equipo.service_tag}</td>
                <td className="py-1 px-4">{equipo.equipo}</td>
                <td className="py-1 px-4">{equipo.asignacion?.usuario || 'NO ASIGNADO'}</td>
                <td className="py-1 px-4">{equipo.eq_modelo || 'NO ASIGNADO'}</td>
                <td className="py-1 px-4">{equipo.eq_noserie || 'NO ASIGNADO'}</td>
                <td className="py-1 px-4">{equipo.asignacion?.dependencia?.direccion || 'NO ASIGNADO'}</td>
                <td className="py-1 px-4">{equipo.asignacion?.dependencia?.oficina || 'NO ASIGNADO'}</td>
                {/* <td className="py-1 px-4">{equipo.procesador || 'NO ASIGNADO'}</td>
                <td className="py-1 px-4">{equipo.memoria_ram || 'NO ASIGNADO'}</td>
                <td className="py-1 px-4">{equipo.disco_duro || 'NO ASIGNADO'}</td> */}
                <td className="py-1 px-4">
                  {equipo.asignacion?.status === 1 && (
                    <button
                      onClick={() => handleViewPDF(equipo.id)}
                      title="Ver PDF"
                      className="text-red-600 hover:text-red-800 transition-colors duration-200"
                    >
                      <FaFilePdf size={24} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={`${loading ? 'w-full h-32' : ''} flex items-center justify-center mt-9`}>
          <div role="status" className={`${ loading ? '' : 'hidden' } absolute opacity-100 -translate-x-1/2 -translate-y-1/2 top-2/4 left-1/2 p-96`}>
            <svg aria-hidden="true" className="w-28 h-28 mr-2 text-gray-400 animate-spin fill-colorPrimario" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
            <span className="sr-only">Loading...</span>
          </div>
        </div>
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

      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[32rem]">
            <h2 className="text-lg font-bold mb-4">Selecciona los campos a exportar</h2>
            <div className="flex gap-2 mb-4">
              <button
                onClick={handleSelectAll}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200 text-sm"
              >
                Seleccionar Todo
              </button>
              <button
                onClick={handleDeselectAll}
                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors duration-200 text-sm"
              >
                Deseleccionar Todo
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto mb-4">
              {exportableFields.map((field) => (
                <label key={field.value} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(field.value)}
                    onChange={() => handleFieldChange(field.value)}
                    className="mr-2"
                  />
                  {field.label}
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={closeExportModal}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  closeExportModal();
                  handleDownloadCSV();
                }}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <FaFileCsv className="mr-2" />
                Descargar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EquiposRentadosList; 