import React from 'react';
import { generateFullEventPDF, generateTop5PDF, generateCategoryPDF } from '../utils/pdfGenerator';

const ReportButtons = ({ participants, selectedEvent, selectedCategory }) => {
  const handleFullEventDownload = () => {
    generateFullEventPDF(participants, selectedEvent);
  };

  const handleTop5Download = () => {
    // Agrupar por categoría y tomar top 5
    const byCategory = {};
    participants.forEach(p => {
      if (!byCategory[p.categoria]) byCategory[p.categoria] = [];
      byCategory[p.categoria].push(p);
    });
    
    const top5 = Object.values(byCategory).flatMap(category => 
      category
        .sort((a, b) => parseInt(a.A) - parseInt(b.A))
        .slice(0, 5)
    );
    
    generateTop5PDF(top5, selectedEvent);
  };

  const handleCategoryDownload = () => {
    generateCategoryPDF(participants, selectedEvent, selectedCategory);
  };

  return (
    <div className="flex flex-wrap gap-4 my-6 justify-center">
      {selectedEvent !== 'Todos' && (
        <>
          <button
            onClick={handleFullEventDownload}
            className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Descargar Evento Completo
          </button>
          
          <button
            onClick={handleTop5Download}
            className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Top 5 por Categoría
          </button>
        </>
      )}
      
      {selectedCategory !== 'Todas' && (
        <button
          onClick={handleCategoryDownload}
          className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
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

export default ReportButtons;