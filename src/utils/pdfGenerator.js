// Función para calcular ritmo (mm:ss min/km)
const calculatePace = (time, distance) => {
  if (!time || !distance || isNaN(parseFloat(distance)) || parseFloat(distance) <= 0) return '-';
  
  try {
    const timeParts = String(time).split(':').map(Number);
    let totalSeconds = 0;
    if (timeParts.length === 3) { // HH:MM:SS
      totalSeconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
    } else if (timeParts.length === 2) { // MM:SS
      totalSeconds = timeParts[0] * 60 + timeParts[1];
    } else {
      return '-';
    }

    const paceSeconds = totalSeconds / parseFloat(distance);
    const paceMin = Math.floor(paceSeconds / 60);
    const remainingSeconds = Math.round(paceSeconds % 60);
    return `${paceMin}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds} min/km`;
  } catch {
    return '-';
  }
};

// Función para calcular velocidad (km/h)
const calculateSpeed = (time, distance) => {
  if (!time || !distance || isNaN(parseFloat(distance)) || parseFloat(distance) <= 0) return '-';
  
  try {
    const timeParts = String(time).split(':').map(Number);
    let totalHours = 0;
    if (timeParts.length === 3) { // HH:MM:SS
      totalHours = timeParts[0] + timeParts[1] / 60 + timeParts[2] / 3600;
    } else if (timeParts.length === 2) { // MM:SS
      totalHours = timeParts[0] / 60 + timeParts[1] / 3600;
    } else {
      return '-';
    }

    if (totalHours <= 0) return '-';
    
    const speed = parseFloat(distance) / totalHours;
    return `${speed.toFixed(2)} km/h`;
  } catch {
    return '-';
  }
};

// Función para obtener vueltas con la más rápida marcada
const getLapsWithFastest = (participant) => {
  const laps = [];
  let i = 1;
  while (participant[`vuelta_${i}`] !== undefined && participant[`vuelta_${i}`] !== null && participant[`vuelta_${i}`] !== '') {
    laps.push({ time: participant[`vuelta_${i}`], index: i });
    i++;
  }

  if (laps.length === 0) return 'N/A';
  
  let fastestTime = Infinity;
  let fastestLapIndex = -1;
  
  laps.forEach((lap, index) => {
    const timeParts = String(lap.time).split(':').map(Number);
    let lapTotalSeconds = 0;
    if (timeParts.length === 2) { // MM:SS
      lapTotalSeconds = timeParts[0] * 60 + timeParts[1];
    } else if (timeParts.length === 3) { // HH:MM:SS
      lapTotalSeconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
    }
    
    if (lapTotalSeconds < fastestTime) {
      fastestTime = lapTotalSeconds;
      fastestLapIndex = index;
    }
  });
  
  return laps.map((lap, index) => 
    `Vuelta ${lap.index}: ${lap.time}${index === fastestLapIndex ? ' (VR)' : ''}`
  ).join('<br>');
};

// Generar PDF de evento completo
export const generateEventPDF = (participants, eventName, type = 'full') => {
  const printWindow = window.open('', '_blank');
  
  let title = '';
  let subtitle = '';
  let reportParticipants = participants;

  if (type === 'full') {
    title = 'Resultados Completos';
    subtitle = `Evento: ${eventName}`;
  } else if (type === 'top5') {
    title = 'Top 5 por Categoría';
    subtitle = `Evento: ${eventName}`;
  } else if (type === 'category') {
    title = `Resultados Categoría: ${participants[0]?.categoria || 'N/A'}`;
    subtitle = `Evento: ${eventName}`;
  }

  // Agrupar participantes por categoría para el reporte
  const categories = {};
  reportParticipants.forEach(participant => {
    const cat = participant.categoria || 'Sin Categoría';
    if (!categories[cat]) {
      categories[cat] = [];
    }
    categories[cat].push(participant);
  });

  // Ordenar categorías alfabéticamente
  const sortedCategories = Object.keys(categories).sort();
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title} - ${eventName}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; box-sizing: border-box; }
        .header { text-align: center; margin-bottom: 20px; }
        h1 { color: #333; font-size: 24px; margin-bottom: 5px; }
        h2 { color: #666; font-size: 18px; margin-bottom: 20px; }
        h3 { 
          color: #FF5A1F; /* Naranja más intenso para categorías */
          font-size: 16px; 
          margin: 25px 0 10px; 
          padding-bottom: 5px;
          border-bottom: 2px solid #FF5A1F;
        }
        .category-header {
          color: #FF5A1F;
          font-size: 16px;
          margin: 25px 0 10px;
          padding-bottom: 5px;
          border-bottom: 2px solid #FF5A1F;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 30px;
          font-size: 12px;
          table-layout: fixed; /* Asegura que las columnas no se desborden */
        }
        th, td { 
          padding: 8px; 
          border-bottom: 1px solid #ddd; 
          text-align: center;
          word-wrap: break-word; /* Rompe palabras largas */
        }
        th { 
          background-color: #000; /* Fondo negro */
          color: #fff; /* Fuente blanca */
          font-weight: bold;
        }
        td.align-left {
          text-align: left;
        }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .footer { 
          margin-top: 30px; 
          text-align: center; 
          font-size: 12px; 
          color: #777;
          padding-top: 10px;
          border-top: 1px solid #eee;
        }
        .whatsapp-btn {
          display: inline-block;
          background-color: #25D366;
          color: white;
          text-decoration: none;
          padding: 6px 12px;
          border-radius: 4px;
          margin-top: 5px;
          font-weight: bold;
        }
        /* Estilos para la paginación */
        @media print {
          .category-table-container {
            page-break-inside: avoid; /* Evita que la tabla se corte a la mitad si es posible */
          }
          table thead {
            display: table-header-group; /* Repite el encabezado de la tabla en cada página */
          }
        }

        /* Anchos de columna optimizados */
        table th:nth-child(1), /* Pos Cat. */
        table td:nth-child(1) {
          width: 8%; /* Reducido */
        }
        table th:nth-child(2), /* Pos Gral. */
        table td:nth-child(2) {
          width: 8%; /* Reducido */
        }
        table th:nth-child(3), /* Pos Gen. */
        table td:nth-child(3) {
          width: 8%; /* Reducido */
        }
        table th:nth-child(4), /* Dorsal */
        table td:nth-child(4) {
          width: 8%; /* Reducido */
        }
        table th:nth-child(5), /* Nombre */
        table td:nth-child(5) {
          width: 20%; /* Más espacio para el nombre */
        }
        table th:nth-child(6), /* Club */
        table td:nth-child(6) {
          width: 15%; /* Espacio para el club */
        }
        table th:nth-child(7), /* Tiempo Oficial */
        table td:nth-child(7) {
          width: 10%; /* Tiempo */
        }
        /* Las últimas dos columnas (Tiempo Chip/Ritmo o Vel/Vueltas) se ajustarán */
        table th:nth-child(8),
        table td:nth-child(8),
        table th:nth-child(9),
        table td:nth-child(9) {
          width: 11.5%; /* Ajuste para las últimas dos */
        }

        /* Responsividad para pantallas pequeñas (ej. vista previa en móvil) */
        @media screen and (max-width: 600px) {
          body {
            padding: 10px;
          }
          h1 { font-size: 20px; }
          h2 { font-size: 16px; }
          h3 { font-size: 14px; }
          table, th, td {
            font-size: 10px;
            padding: 5px;
          }
          /* Ajustar ancho de columnas para que quepan */
          table {
            display: block;
            overflow-x: auto; /* Permite scroll horizontal si la tabla es muy ancha */
            white-space: nowrap; /* Evita que el contenido se rompa en varias líneas */
          }
          thead, tbody, th, td, tr {
            display: block;
          }
          tr {
            margin-bottom: 10px;
            border: 1px solid #ccc;
          }
          td {
            text-align: right;
            padding-left: 50%;
            position: relative;
          }
          td::before {
            content: attr(data-label);
            position: absolute;
            left: 6px;
            width: 45%;
            padding-right: 10px;
            white-space: nowrap;
            text-align: left;
            font-weight: bold;
          }
          /* Ocultar encabezados de tabla en vista móvil para el truco de td::before */
          thead {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>R&C Resultados Sports</h1>
        <h2>${subtitle}</h2>
        <p>Generado el ${new Date().toLocaleDateString()}</p>
      </div>
      
      ${sortedCategories.map(category => `
        <div class="category-table-container">
          <h3 class="category-header">Categoría: ${category}</h3>
          <table>
            <thead>
              <tr>
                <th>Pos Cat.</th>
                <th>Pos Gral.</th>
                <th>Pos Gen.</th>
                <th>Dorsal</th>
                <th class="align-left">Nombre</th>
                <th>Club</th>
                <th>Tiempo Oficial</th>
                ${reportParticipants[0]?.deporte?.toLowerCase() === 'running' ? '<th>Tiempo Chip</th><th>Ritmo</th>' : '<th>Vel. k/h</th><th>Vueltas</th>'}
              </tr>
            </thead>
            <tbody>
              ${categories[category]
                .sort((a, b) => (a.posicion_categoria || 0) - (b.posicion_categoria || 0)) // Ordenar por Pos Cat.
                .map(participant => `
                  <tr>
                    <td data-label="Pos Cat.">${participant.posicion_categoria || '-'}</td>
                    <td data-label="Pos Gral.">${participant.posicion_general || '-'}</td>
                    <td data-label="Pos Gen.">${participant.posicion_genero || '-'}</td>
                    <td data-label="Dorsal">${participant.dorsal || '-'}</td>
                    <td data-label="Nombre" class="align-left">${participant.nombre || '-'}</td>
                    <td data-label="Club">${participant.club || '-'}</td>
                    <td data-label="Tiempo Oficial">${participant.tiempo || '-'}</td>
                    ${participant.deporte?.toLowerCase() === 'running' ? 
                      `<td data-label="Tiempo Chip">${participant.tiempo_chip || '-'}</td><td data-label="Ritmo">${calculatePace(participant.tiempo, participant.distancia)}</td>` : 
                      `<td data-label="Vel. k/h">${calculateSpeed(participant.tiempo, participant.distancia)}</td><td data-label="Vueltas">${getLapsWithFastest(participant)}</td>`}
                  </tr>
                `).join('')}
            </tbody>
          </table>
        </div>
      `).join('')}
      
      <div class="footer">
        <p>Contacto: </p>
        <a href="https://api.whatsapp.com/send?phone=584249065422&text=Hola%20buen%20d%C3%ADa!%20mi%20nombre%20es%20" class="whatsapp-btn" target="_blank">
          WhatsApp +584249065422
        </a>
      </div>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.print();
};