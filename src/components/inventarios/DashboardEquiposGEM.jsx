import React, { useEffect, useState } from 'react';
import { equiposGEMService } from '../../services/equiposGEMService';
import LoadingSpinner from '../common/LoadingSpinner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import escudoEdomex from '../../images/escudo-edomex.png';

const DashboardEquiposGEM = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllUsers, setShowAllUsers] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const dashboardData = await equiposGEMService.getDashboardData();
        setData(dashboardData);
      } catch (err) {
        setError('Error al cargar los datos del dashboard GEM');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDownloadPDF = async () => {
    if (!data) return;
    const doc = new jsPDF();
    // Cargar imagen como base64
    const getImageBase64 = (imgPath) => {
      return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.crossOrigin = 'Anonymous';
        img.src = imgPath;
        img.onload = function () {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
      });
    };

    // Fecha actual para el nombre del archivo
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;
    const fileName = `Resumen de Equipos GEM ${formattedDate}.pdf`;

    // Agregar logo y título
    const logoBase64 = await getImageBase64(escudoEdomex);
    doc.addImage(logoBase64, 'PNG', 10, 8, 25, 15);
    // Centrar el título
    const pageWidth = doc.internal.pageSize.getWidth();
    const title = 'Resumen de Equipos GEM';
    const titleFontSize = 16;
    doc.setFontSize(titleFontSize);
    const textWidth = doc.getTextWidth(title);
    const x = (pageWidth - textWidth) / 2;
    doc.text(title, x, 20);

    // Totales
    doc.setFontSize(10);
    doc.text('Totales:', 14, 36);
    autoTable(doc, {
      startY: 40,
      head: [['Total Equipos GEM', 'Sin Asignación']],
      body: [
        [data.total_equipos, data.equipos_sin_asignacion]
      ],
      theme: 'grid',
      styles: { fontSize: 7 },
      headStyles: { fontSize: 7, fillColor: [138, 32, 54] },
    });
    let y = doc.lastAutoTable.finalY + 6;

    // Por Marca
    doc.text('Equipos por Marca:', 14, y);
    autoTable(doc, {
      startY: y + 2,
      head: [['Marca', 'Total']],
      body: data.por_marca.map(item => [item.marca, item.total]),
      theme: 'grid',
      styles: { fontSize: 7 },
      headStyles: { fontSize: 7, fillColor: [138, 32, 54] },
    });
    y = doc.lastAutoTable.finalY + 6;

    // Por Tipo Activo
    doc.text('Equipos por Tipo Activo:', 14, y);
    autoTable(doc, {
      startY: y + 2,
      head: [['Tipo Activo', 'Total']],
      body: data.por_tipo_activo.map(item => [item.tipo_activo || 'Sin tipo', item.total]),
      theme: 'grid',
      styles: { fontSize: 7 },
      headStyles: { fontSize: 7, fillColor: [138, 32, 54] },
    });
    y = doc.lastAutoTable.finalY + 6;

    // Por Dependencia
    doc.text('Asignaciones por Unidad Administrativa:', 14, y);
    autoTable(doc, {
      startY: y + 2,
      head: [['Dependencia', 'Total']],
      body: data.por_dependencia.map(item => [item.dependencia, item.total]),
      theme: 'grid',
      styles: { fontSize: 7 },
      headStyles: { fontSize: 7, fillColor: [138, 32, 54] },
    });
    y = doc.lastAutoTable.finalY + 6;

    // Por Usuario
    if (data.por_usuario && data.por_usuario.length > 0) {
      doc.text('Asignaciones por Usuario:', 14, y);
      autoTable(doc, {
        startY: y + 2,
        head: [['Usuario', 'Total']],
        body: data.por_usuario.map(item => [item.usuario || 'Sin usuario', item.total]),
        theme: 'grid',
        styles: { fontSize: 7 },
        headStyles: { fontSize: 7, fillColor: [138, 32, 54] },
      });
    }

    // Descargar automáticamente
    doc.save(fileName);
  };

  if (loading) return <LoadingSpinner message="Cargando dashboard GEM..." />;
  if (error) return <div className="text-red-600 font-bold">{error}</div>;
  if (!data) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-xl font-bold mb-4 text-colorPrimario text-center">Resumen de Equipos GEM</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-100 rounded p-4 text-center">
          <div className="text-3xl font-bold">{data.total_equipos}</div>
          <div className="text-sm">Total Equipos GEM</div>
        </div>
        <div className="bg-yellow-200 rounded p-4 text-center">
          <div className="text-3xl font-bold">{data.total_equipos - data.equipos_sin_asignacion}</div>
          <div className="text-sm">Asignados</div>
        </div>
        <div className="bg-red-100 rounded p-4 text-center">
          <div className="text-3xl font-bold">{data.equipos_sin_asignacion}</div>
          <div className="text-sm">Sin Asignación</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Por Marca</h3>
          <div className="max-h-[420px] overflow-y-auto scrollbar-hide">
            <ul className="text-sm">
              {data.por_marca.map((item) => (
                <li key={item.marca_id} className="flex justify-between border-b py-1">
                  <span>{item.marca}</span>
                  <span className="font-bold">{item.total}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Por Tipo Activo</h3>
          <div className="max-h-[420px] overflow-y-auto scrollbar-hide">
            <ul className="text-sm">
              {data.por_tipo_activo.map((item, idx) => (
                <li key={idx} className="flex justify-between border-b py-1">
                  <span>{item.tipo_activo || 'Sin tipo'}</span>
                  <span className="font-bold">{item.total}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Por Unidad Administrativa</h3>
          <div className="max-h-[420px] overflow-y-auto scrollbar-hide">
            <ul className="text-sm">
              {data.por_dependencia.map((item) => (
                <li key={item.dependencia_id} className="flex justify-between border-b py-1">
                  <span>{item.dependencia}</span>
                  <span className="font-bold">{item.total}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {/* Conteo por usuario */}
     {/* {data.por_usuario && data.por_usuario.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold mb-2">Por Usuario (Inventarios Activos)</h3>
          <div className="max-h-[420px] overflow-y-auto">
            <ul className="text-sm md:w-1/2 w-full">
              {(showAllUsers ? data.por_usuario : data.por_usuario.slice(0, 5)).map((item, idx) => (
                <li key={idx} className="flex justify-between border-b py-1">
                  <span>{item.usuario || 'Sin usuario'}</span>
                  <span className="font-bold">{item.total}</span>
                </li>
              ))}
            </ul>
          </div>
          {data.por_usuario.length > 5 && (
            <button
              className="mt-2 text-colorPrimario font-semibold hover:underline focus:outline-none"
              onClick={() => setShowAllUsers((prev) => !prev)}
            >
              {showAllUsers ? 'Ver menos' : 'Ver todos'}
            </button>
          )}
        </div>
      )}*/}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleDownloadPDF}
          className="px-4 py-2 bg-colorPrimario text-white rounded-lg hover:bg-colorSecundario transition-colors duration-200 font-semibold shadow"
        >
          Descargar PDF
        </button>
      </div>
    </div>
  );
};

export default DashboardEquiposGEM; 