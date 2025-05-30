// Función para calcular ritmo (mm:ss min/km)
const calculatePace = (time, distance) => {
  if (!time || !distance || isNaN(parseFloat(distance)) || parseFloat(distance) <= 0) return '-';
  try {
    const timeParts = time.split(':').map(Number);
    let totalSeconds = 0;
    if (timeParts.length === 3) { // HH:MM:SS
      totalSeconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
    } else if (timeParts.length === 2) { // MM:SS
      totalSeconds = timeParts[0] * 60 + timeParts[1];
    } else {
      return '-';
    }
    
    const paceSeconds = totalSeconds / parseFloat(distance);
    const paceMinutes = Math.floor(paceSeconds / 60);
    const remainingSeconds = Math.floor(paceSeconds % 60);
    return `${paceMinutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds} min/km`;
  } catch {
    return '-';
  }
};

// Función para calcular velocidad (km/h)
const calculateSpeed = (time, distance) => {
  if (!time || !distance || isNaN(parseFloat(distance)) || parseFloat(distance) <= 0) return '-';
  try {
    const timeParts = time.split(':').map(Number);
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
  while (participant[`vuelta_${i}`]) {
    laps.push({ lap: i, time: participant[`vuelta_${i}`] });
    i++;
  }

  if (laps.length === 0) return '-';

  let fastestTime = Infinity;
  let fastestLapIndex = -1;

  laps.forEach((lap, index) => {
    try {
      const [m, s] = lap.time.split(':').map(Number);
      const totalSeconds = (m * 60) + s;
      if (totalSeconds < fastestTime) {
        fastestTime = totalSeconds;
        fastestLapIndex = index;
      }
    } catch {}
  });

  return laps.map((lap, index) =>
    `Vuelta ${lap.lap}: ${lap.time}${index === fastestLapIndex ? ' (VR)' : ''}`
  ).join('<br>');
};


export const generateReportHTML = (reportType, data, eventName, categoryName = '') => {
  const printWindow = window.open('', '_blank');
  
  let title = '';
  let subtitle = '';
  let participantsToReport = [];

  if (reportType === 'fullEvent') {
    title = 'Resultados Completos';
    subtitle = `Evento: ${eventName}`;
    participantsToReport = data;
  } else if (reportType === 'top5') {
    title = 'Top 5 por Categoría';
    subtitle = `Evento: ${eventName}`;
    participantsToReport = data; // Data ya viene filtrada para top 5
  } else if (reportType === 'category') {
    title = `Resultados Categoría: ${categoryName}`;
    subtitle = `Evento: ${eventName}`;
    participantsToReport = data; // Data ya viene filtrada para la categoría
  }

  // Agrupar participantes por categoría para el reporte
  const categories = {};
  participantsToReport.forEach(participant => {
    const cat = participant.categoria || 'Sin Categoría';
    if (!categories[cat]) {
      categories[cat] = [];
    }
    categories[cat].push(participant);
  });

  const sortedCategories = Object.keys(categories).sort();
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title} - ${eventName}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
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
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 30px;
          font-size: 12px;
        }
        th { 
          background-color: #333; 
          color: white; 
          padding: 8px; 
          text-align: center;
          font-weight: bold;
        }
        td { 
          padding: 8px; 
          border-bottom: 1px solid #ddd; 
          text-align: center;
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
      </style>
    </head>
    <body>
      <div class="header">
        <h1>R&C Resultados Sports</h1>
        <h2>${title}</h2>
        <h3>${subtitle}</h3>
      </div>
      
      ${sortedCategories.map(cat => `
        <div>
          <h3>Categoría: ${cat}</h3>
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
                ${categories[cat][0]?.deporte === 'Running' ? `
                  <th>Tiempo Chip</th>
                  <th>Ritmo</th>
                ` : `
                  <th>Vel. k/h</th>
                  <th>Vueltas</th>
                `}
              </tr>
            </thead>
            <tbody>
              ${categories[cat]
                .sort((a, b) => (a.A || 0) - (b.A || 0)) // Ordenar por Pos. Cat.
                .map(participant => `
                  <tr>
                    <td>${participant.A || '-'}</td>
                    <td>${participant.D || '-'}</td>
                    <td>${participant.C || '-'}</td>
                    <td>${participant.dorsal || '-'}</td>
                    <td class="align-left">${participant.nombre || '-'}</td>
                    <td>${participant.I || '-'}</td>
                    <td>${participant.G || '-'}</td>
                    ${participant.deporte === 'Running' ? `
                      <td>${participant.H || '-'}</td>
                      <td>${calculatePace(participant.G, participant.M)}</td>
                    ` : `
                      <td>${calculateSpeed(participant.G, participant.M)}</td>
                      <td>${getLapsWithFastest(participant)}</td>
                    `}
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
        <p>Generado el ${new Date().toLocaleDateString()}</p>
      </div>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.print(); // Abre la ventana de impresión
};