import React from 'react';
import { generateEventPDF } from '../utils/pdfGenerator';

const PDFButtons = ({ filteredParticipants, allParticipants, selectedEvent, selectedCategory }) => {
  const hasParticipants = filteredParticipants.length > 0;
  
  const handleDownloadFull = () => {
    if (!hasParticipants) return;
    // Usar todos los participantes del evento seleccionado para el reporte completo
    const eventParticipants = allParticipants.filter(p => p.evento === selectedEvent);
    generateEventPDF(eventParticipants, selectedEvent, 'full');
  };

  const handleDownloadTop5 = () => {
    if (!hasParticipants) return;
    
    const top5Data = {};
    allParticipants.filter(p => p.evento === selectedEvent).forEach(p => {
      const cat = p.categoria || 'Sin Categoría';
      if (!top5Data[cat]) {
        top5Data[cat] = [];
      }
      top5Data[cat].push(p);
    });

    let top5Participants = [];
    for (const category in top5Data) {
      const sortedCategory = top5Data[category].sort((a, b) => (a.posicion_categoria || 0) - (b.posicion_categoria || 0));
      top5Participants = top5Participants.concat(sortedCategory.slice(0, 5));
    }
    
    generateEventPDF(top5Participants, selectedEvent, 'top5');
  };

  const handleDownloadCategory = () => {
    if (!hasParticipants) return;
    const categoryParticipants = filteredParticipants.filter(p => p.categoria === selectedCategory);
    generateEventPDF(categoryParticipants, selectedEvent, 'category');
  };

  return (
    <div className="flex flex-wrap justify-center gap-4 my-6 animate-fade-in">
      {selectedEvent !== 'Todos' && (
        <>
          <button
            onClick={handleDownloadFull}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Descargar Evento Completo
          </button>

          <button
            onClick={handleDownloadTop5}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Top 5 por Categoría
          </button>
        </>
      )}

      {selectedCategory !== 'Todas' && selectedEvent !== 'Todos' && (
        <button
          onClick={handleDownloadCategory}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Descargar Categoría Actual
        </button>
      )}
    </div>
  );
};

export default PDFButtons;