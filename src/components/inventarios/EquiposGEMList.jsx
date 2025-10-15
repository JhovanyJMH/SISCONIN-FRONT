import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { fetchEquiposGEM, deleteEquipoGEM } from '../../features/equiposGEM/equiposGEMSlice';
import Swal from 'sweetalert2';
import { SearchBar } from '../SearchBar';
import { FaFilePdf, FaFileCsv } from 'react-icons/fa';
import api, { BASE_URL } from '../../services/api';
import QRCode from 'react-qr-code';
import { FaQrcode } from 'react-icons/fa';
import QRCodeLib from 'qrcode';

const exportableFields = [
  { value: 'id', label: 'ID' },
  { value: 'folio', label: 'FOLIO' },
  { value: 'equipo', label: 'EQUIPO' },
  { value: 'cpu', label: 'CPU' },
  { value: 'monitor', label: 'MONITOR' },
  { value: 'ups', label: 'UPS' },
  { value: 'tipo_activo', label: 'TIPO DE ACTIVO' },
  { value: 'marca', label: 'MARCA' },
  { value: 'modelo', label: 'MODELO' },
  { value: 'color', label: 'COLOR' },
  { value: 'material', label: 'MATERIAL' },
  { value: 'proveedor', label: 'PROVEEDOR' },
  { value: 'placas', label: 'PLACAS' },
  { value: 'valor', label: 'VALOR' },
  { value: 'tipo_control', label: 'TIPO DE CONTROL' },
  { value: 'adquisicion', label: 'ADQUISICIÓN' },
  { value: 'tipo_adquisicion', label: 'TIPO DE ADQUISICIÓN' },
  { value: 'fec_adquision', label: 'FECHA DE ADQUISICIÓN' },
  { value: 'fec_asignacion', label: 'FECHA DE ASIGNACIÓN' },
  { value: 'fec_resguardo', label: 'FECHA DE RESGUARDO' },
  { value: 'fec_alta', label: 'FECHA DE ALTA' },
  { value: 'usuario', label: 'USUARIO' },
  { value: 'service_tag', label: 'ALTUM' },
  { value: 'no_inventario', label: 'NUMERO INVENTARIO' },
  { value: 'obs_no_inventario', label: 'OBSERVACION SIN NUMERO DE INVENTARIO' },
  { value: 'correo', label: 'CORREO' },
  { value: 'puesto', label: 'PUESTO' },
  { value: 'telefono', label: 'TELÉFONO' },
  { value: 'direccion', label: 'DIRECCIÓN' },
  { value: 'dependencia', label: 'DEPENDENCIA' },
  { value: 'municipio', label: 'MUNICIPIO' },
  { value: 'responsable', label: 'RESPONSABLE' },
];

// Función para armar el string de datos para el QR
const getQRData = (equipo) => `
Secretaría: ${equipo.inventario_gem?.dependencia?.secretaria || ''}
Unidad: ${equipo.inventario_gem?.dependencia?.direccion || ''}
Área: ${equipo.inventario_gem?.dependencia?.oficina || ''}
Nombre: ${equipo.inventario_gem?.usuario || ''}
Correo: ${equipo.inventario_gem?.correo || ''}
Puesto: ${equipo.inventario_gem?.puesto || ''}
Edificio: ${equipo.inventario_gem?.edificio || ''}
Piso: ${equipo.inventario_gem?.piso || ''}
Dirección: ${equipo.inventario_gem?.direccion || ''}
Municipio: ${equipo.inventario_gem?.municipio?.municipio || ''}
Tel: ${equipo.inventario_gem?.telefono || ''} Ext: ${equipo.inventario_gem?.extension || ''}
`.trim();

// Función para imprimir el QR y los datos
const printQR = (qrData) => {
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>Imprimir QR</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .qr { text-align: center; margin-bottom: 20px; }
          pre { font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="qr" id="qrcode"></div>
        <pre>${qrData}</pre>
        <script src="https://unpkg.com/qrcode/build/qrcode.min.js"></script>
        <script>
          QRCode.toCanvas(document.getElementById('qrcode'), \`${qrData}\`, { width: 200, margin: 2, errorCorrectionLevel: 'H' });
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

const EquiposGEMList = ({ search }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { items: equipos, loading, error, pagination } = useSelector((state) => state.equiposGEM);
  const { user } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState(search || '');
  const [currentPage, setCurrentPage] = useState(1);
  const highlightedRowRef = useRef(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedFields, setSelectedFields] = useState(['id', 'folio']);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrEquipo, setQREquipo] = useState(null);
  const [showQRDataModal, setShowQRDataModal] = useState(false);

  // Obtener parámetros de la URL
  const searchParams = new URLSearchParams(location.search);
  const pageParam = searchParams.get('page');
  const highlightParam = searchParams.get('highlight');

  useEffect(() => {
    // Si hay un parámetro de página en la URL, actualizar el estado
    if (pageParam) {
      const page = parseInt(pageParam);
      setCurrentPage(page);
      dispatch(fetchEquiposGEM({ page, search: searchTerm }));
    }
  }, [pageParam, dispatch, searchTerm]);

  useEffect(() => {
    // Solo cargar datos si no hay un parámetro de página en la URL
    if (!pageParam) {
      dispatch(fetchEquiposGEM({ page: currentPage, search: searchTerm }));
    }
  }, [dispatch, searchTerm, currentPage, pageParam]);

  // Efecto para resaltar el registro
  useEffect(() => {
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
        await dispatch(deleteEquipoGEM(id)).unwrap();
        dispatch(fetchEquiposGEM({ page: currentPage, search: searchTerm }));
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
    window.open(`${BASE_URL}/api/equipo-gem/${id}/pdf`, '_blank');
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

  const openQRModal = (equipo) => {
    setQREquipo(equipo);
    setShowQRModal(true);
  };
  const closeQRModal = () => {
    setShowQRModal(false);
    setQREquipo(null);
  };

  const handleDownloadCSV = async () => {
    try {
      const response = await api.post(
        '/equipos-gem/export-csv',
        { fields: selectedFields },
        {
          responseType: 'blob',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'text/csv'
          }
        }
      );

      // Crear un blob con la respuesta
      const blob = new Blob([response.data], { type: 'text/csv' });
      // Crear un enlace temporal para la descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // Obtener la fecha actual y formatearla
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;
      // Establecer el nombre del archivo con la fecha
      const filename = `CAT_INVANTARIO_GEM_${formattedDate}.csv`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      // Limpiar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al descargar el CSV:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al descargar el archivo CSV',
      });
    }
  };

  const handleDownloadQR = () => {
    const size = 200; // Tamaño del QR a descargar (igual que el modal)
    const value = `${BASE_URL}/qr/${qrEquipo.id}`;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    QRCodeLib.toCanvas(
      canvas,
      value,
      { width: size, margin: 2, color: { dark: '#000', light: '#FFF' }, errorCorrectionLevel: 'H' },
      function (error) {
        if (error) {
          console.error(error);
          return;
        }
        // Dibujar texto centrado "DGDITI" y debajo "SISCONIN" (más pequeño para mejorar lectura)
        const ctx = canvas.getContext('2d');
        const centerX = size / 2;
        const centerY = size / 2;

        const topText = 'DGDITI';
        const bottomText = 'SISCONIN';

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Medir ancho de textos para caja de fondo
        ctx.font = 'bold 18px Arial';
        const topWidth = ctx.measureText(topText).width;
        ctx.font = 'bold 12px Arial';
        const bottomWidth = ctx.measureText(bottomText).width;
        let boxWidth = Math.max(topWidth, bottomWidth) + 14; // padding horizontal
        let boxHeight = 18 + 10 + 12 + 8; // top line + gap + bottom line + padding vertical

        // Limitar caja a un % del tamaño para no cubrir demasiado (<= 45% del ancho)
        const maxBoxWidth = size * 0.45;
        if (boxWidth > maxBoxWidth) boxWidth = maxBoxWidth;

        // Caja blanca semitransparente para legibilidad
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        const boxX = centerX - boxWidth / 2;
        const boxY = centerY - boxHeight / 2;
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

        // Dibujar textos
        ctx.fillStyle = '#000';
        ctx.font = 'bold 18px Arial';
        ctx.fillText(topText, centerX, centerY - 6);
        ctx.font = 'bold 12px Arial';
        ctx.fillText(bottomText, centerX, centerY + 12);

        const link = document.createElement('a');
        link.download = 'qr.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const handleShowQRDataPage = () => {
    const qrData = getQRData(qrEquipo);
    const logoUrl = window.location.origin + '/images/Recurso.png';
    const lines = qrData.split('\n').map(line => {
      const idx = line.indexOf(':');
      if (idx !== -1) {
        return {
          label: line.slice(0, idx + 1),
          value: line.slice(idx + 1)
        };
      }
      return { label: '', value: line };
    });

    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
      <html>
        <head>
          <title>Datos del QR</title>
          <style>
            body { font-family: Arial, sans-serif; background: #BC955B; margin: 0; padding: 0; }
            .container { max-width: 540px; margin: 40px auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px #0002; padding: 32px 24px; text-align: center; }
            .logo-row { display: flex; justify-content: center; align-items: center; gap: 32px; margin-bottom: 8px; }
            img { height: 64px; }
            h2 { font-size: 1.4rem; margin-bottom: 18px; }
            .datos-bg {
              background: #F3F4F6;
              border-radius: 12px;
              padding: 18px 18px 18px 18px;
              font-size: 1rem;
              text-align: left;
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #000;
              margin-bottom: 0;
              word-break: break-word;
              white-space: pre-wrap;
              overflow-wrap: break-word;
            }
            .dato-row {
              display: grid;
              grid-template-columns: auto 1fr;
              gap: 0.5em;
              align-items: start;
              margin-bottom: 2px;
            }
            .dato-label { font-weight: bold; min-width: 110px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo-row">
              <img src="${logoUrl}" alt="Logo" />
            </div>
            <h2>Sistema de Control de Inventarios</h2>
            <div class="datos-bg">
              ${lines.map(line =>
                line.label
                  ? `<div class="dato-row"><span class="dato-label">${line.label}</span><span>${line.value}</span></div>`
                  : `<div class="dato-row"><span></span><span>${line.value}</span></div>`
              ).join('')}
            </div>
          </div>
        </body>
      </html>
    `);
    newWindow.document.close();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-colorPrimario"></div>
      </div>
    );
  }

  return (
    <>
      {/* Modal de selección de campos para exportar */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[32rem]">
            <h2 className="text-lg font-bold mb-4">Selecciona los campos a exportar</h2>
            
            {/* Botones de Seleccionar Todo y Deseleccionar Todo */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={handleSelectAll}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors duration-200"
              >
                Seleccionar Todo
              </button>
              <button
                onClick={handleDeselectAll}
                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors duration-200"
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
      <SearchBar 
        searchPath="/get-search-equipos-gem"
        normalPath="/get-equipos-gem"
        showButton={false}
        onSearch={handleSearch}
        placeholder="Buscar por folio, equipo, marca, modelo, número de serie..."
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
              <th scope="col" className="py-2 px-4">Folio</th>
              <th scope="col" className="py-2 px-4">ALTUM</th>
             {/*<th scope="col" className="py-2 px-4">Dependencia</th>*/}
              <th scope="col" className="py-2 px-4">Usuario</th>
             {/* <th scope="col" className="py-2 px-4">Equipo</th>*/}
              <th scope="col" className="py-2 px-4">Tipo</th>
              <th scope="col" className="py-2 px-4">Marca</th>
              <th scope="col" className="py-2 px-4">CPU</th>
              <th scope="col" className="py-2 px-4">UPS</th>
              <th scope="col" className="py-2 px-4">Monitor</th>
             {/* <th scope="col" className="py-2 px-4">Monitor</th>
              <th scope="col" className="py-2 px-4">Fecha Alta</th>*/}
              <th scope="col" className="py-2 px-4">PDF</th>
              <th scope="col" className="py-2 px-4">QR</th>
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
                        to={`/inventarios/gem/editar/${equipo.id}`}
                        title="Editar"
                        className="text-[#bc955b] hover:text-white border-2 border-[#bc955b] hover:bg-[#bc955b] focus:ring-2 focus:outline-none focus:ring-[#bc955b] font-medium rounded-lg text-sm px-3 py-2.5 text-center mr-2 mb-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 icon icon-tabler icon-tabler-pencil" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                          <path d="M4 20h4l10.5 -10.5a1.5 1.5 0 0 0 -4 -4l-10.5 10.5v4"></path>
                          <path d="M13.5 6.5l4 4"></path>
                        </svg>
                      </Link>
                      <Link
                        to={`/inventarios/gem/inventario/${equipo.id}`}
                        title="Asignar Equipo"
                        className="text-blue-600 hover:text-white border-2 border-blue-600 hover:bg-blue-600 focus:ring-2 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-2.5 text-center mr-2 mb-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                          <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
                          <path d="M16 19h6" />
                          <path d="M19 16v6" />
                          <path d="M6 21v-2a4 4 0 0 1 4 -4h4" />
                        </svg>
                      </Link>
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
                <td className="py-1 px-4">{equipo.folio}</td>
{/*                 <td className="py-1 px-4">{equipo.inventario_gem?.dependencia?.oficina || 'NO ASIGNADO'}</td>*/}
                <td className="py-1 px-4">{equipo.inventario_gem?.service_tag || 'NO ASIGNADO'}</td>
                <td className="py-1 px-4">{equipo.inventario_gem?.usuario || 'NO ASIGNADO'}</td>
               {/* <td className="py-1 px-4">{equipo.equipo}</td>*/}
                <td className="py-1 px-4">{equipo.tipo_activo?.tipo_activo || 'NO ASIGNADO'}</td>
                <td className="py-1 px-4">{equipo.marca?.marca || 'NO ASIGNADO'}</td>
                <td className="py-1 px-4">{equipo.cpu || 'NO ASIGNADO'}</td>
                <td className="py-1 px-4">{equipo.ups || 'NO ASIGNADO'}</td>
                <td className="py-1 px-4">{equipo.monitor || 'NO ASIGNADO'}</td>
              {/*<td className="py-1 px-4">{formatDate(equipo.fec_alta)}</td>*/}
                <td className="py-1 px-4">
                  {equipo.inventario_gem?.status === 1 && (
                    <button
                      onClick={() => handleViewPDF(equipo.id)}
                      title="Ver PDF"
                      className="text-red-600 hover:text-red-800 transition-colors duration-200"
                    >
                      <FaFilePdf size={24} />
                    </button>
                  )}
                </td>
                <td className="py-1 px-4">
                  <button
                    onClick={() => openQRModal(equipo)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="Ver QR"
                  >
                    <FaQrcode size={24} />
                  </button>
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

      {showQRModal && qrEquipo && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[22rem] flex flex-col items-center">
            <h2 className="text-lg font-bold mb-4">Código QR del usuario</h2>
            <div className="relative bg-white p-2" style={{ width: 204, height: 204 }}>
              <QRCode value={`${BASE_URL}/qr/${qrEquipo.id}`} size={200} level="H" bgColor="#FFFFFF" fgColor="#000000" />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="bg-white/90 px-2 py-1 rounded text-center leading-tight">
                  <div className="text-black font-bold" style={{ fontSize: 16, lineHeight: '16px' }}>DGDITI</div>
                  <div className="text-black font-bold" style={{ fontSize: 10, lineHeight: '12px' }}>SISCONIN</div>
                </div>
              </div>
            </div>
            <pre className="mt-4 text-xs text-left whitespace-pre-wrap">{getQRData(qrEquipo)}</pre>
            <div className="flex gap-2 mt-4">
              <button
                onClick={closeQRModal}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors duration-200"
              >
                Cerrar
              </button>
              <button
                onClick={handleDownloadQR}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200"
              >
                Descargar
              </button>
              <button
                onClick={handleShowQRDataPage}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
              >
                Ver datos
              </button>
            </div>
          </div>
        </div>
      )}

      {showQRDataModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[26rem] flex flex-col items-center relative">
            <button
              onClick={() => setShowQRDataModal(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              title="Cerrar"
            >
              ×
            </button>
            <img src="/images/Recurso 6.png" alt="Logo" className="h-16 mb-2" />
            <h2 className="text-xl font-bold mb-4 text-center">Sistema de Control de Inventarios</h2>
            <pre className="bg-gray-100 rounded p-4 text-sm w-full whitespace-pre-wrap text-left font-mono mb-2" style={{lineHeight: '1.5'}}>
              {getQRData(qrEquipo)}
            </pre>
          </div>
        </div>
      )}
    </>
  );
};

export default EquiposGEMList; 