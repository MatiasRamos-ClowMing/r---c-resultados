import React, { useState } from 'react';

const ParticipantCard = ({ participant }) => {
  const [showMore, setShowMore] = useState(false);

  // Función segura para obtener valores, usando los nombres de campo internos
  const getValue = (field) => {
    if (!participant || participant[field] === undefined || participant[field] === null || participant[field] === '') return 'N/A';
    return participant[field];
  };

  // Datos estructurados con los nombres de campo internos
  const data = {
    nombre: getValue('nombre'),
    categoria: getValue('categoria'),
    posicion_categoria: getValue('posicion_categoria'),
    posicion_genero: getValue('posicion_genero'),
    posicion_general: getValue('posicion_general'),
    club: getValue('club'),
    tiempo: getValue('tiempo'),
    tiempo_chip: getValue('tiempo_chip'),
    distancia: getValue('distancia'),
    deporte: getValue('deporte') || 'Running', // Default a Running si no está definido
    foto_url: getValue('foto_url'),
    certificado_url: getValue('certificado_url'),
    dorsal: getValue('dorsal'),
    evento: getValue('evento')
  };

  // Calcular ritmo/velocidad
  const calculatePerformance = () => {
    if (data.tiempo === 'N/A' || data.distancia === 'N/A' || parseFloat(data.distancia) <= 0) return 'N/A';

    try {
      const timeParts = String(data.tiempo).split(':').map(Number);
      let totalSeconds = 0;
      if (timeParts.length === 3) { // HH:MM:SS
        totalSeconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
      } else if (timeParts.length === 2) { // MM:SS
        totalSeconds = timeParts[0] * 60 + timeParts[1];
      } else {
        return 'N/A'; // Formato de tiempo no reconocido
      }
      
      const distanceKm = parseFloat(data.distancia);
      
      if (data.deporte.toLowerCase() === 'running') {
        const paceSecondsPerKm = totalSeconds / distanceKm;
        const paceMin = Math.floor(paceSecondsPerKm / 60);
        const paceSec = Math.round(paceSecondsPerKm % 60);
        return `${paceMin}:${paceSec < 10 ? '0' : ''}${paceSec} min/km`;
      } else if (data.deporte.toLowerCase() === 'ciclismo') {
        const totalHours = totalSeconds / 3600;
        if (totalHours <= 0) return 'N/A';
        const speed = distanceKm / totalHours;
        return `${speed.toFixed(2)} km/h`;
      }
    } catch {
      return 'N/A';
    }
    return 'N/A';
  };

  // Obtener vueltas para ciclismo
  const getLaps = () => {
    if (data.deporte.toLowerCase() !== 'ciclismo') return null;
    const laps = [];
    let i = 1;
    while (participant[`vuelta_${i}`] !== undefined && participant[`vuelta_${i}`] !== null && participant[`vuelta_${i}`] !== '') {
      laps.push({ time: participant[`vuelta_${i}`], index: i });
      i++;
    }

    if (laps.length === 0) return null;

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

    return (
      <div className="mt-4">
        <p className="font-semibold mb-1">Vueltas:</p>
        <ul className="list-disc list-inside text-gray-700">
          {laps.map((lap, index) => (
            <li key={index} className={index === fastestLapIndex ? 'font-bold text-orange-600' : ''}>
              Vuelta {lap.index}: {lap.time} {index === fastestLapIndex && '(VR)'}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all hover:shadow-xl">
      <div className="p-5 flex items-center space-x-4">
        <div className="flex-shrink-0">
          <img
            src={data.foto_url !== 'N/A' ? data.foto_url : 'https://via.placeholder.com/80?text=Silueta'}
            alt="Participante"
            className="h-16 w-16 rounded-full object-cover border-2 border-orange-500"
            onError={(e) => e.target.src = 'https://via.placeholder.com/80?text=Silueta'}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 uppercase truncate">{data.nombre}</h3>
          <p className="text-orange-500 font-medium text-sm">{data.categoria}</p>
          <p className="text-gray-500 text-xs">{data.evento}</p>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            Pos. Cat. {data.posicion_categoria}
          </span>
        </div>
      </div>

      <div className="border-t border-gray-200 px-5 py-3">
        <button
          onClick={() => setShowMore(!showMore)}
          className="w-full flex items-center justify-between text-sm font-medium text-orange-600 hover:text-orange-800 focus:outline-none"
        >
          <span>{showMore ? 'Ver menos detalles' : 'Ver más detalles'}</span>
          <svg className={`h-5 w-5 transform transition-transform ${showMore ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {showMore && (
        <div className="px-5 pb-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm"><span className="font-medium text-gray-500">Dorsal:</span> {data.dorsal}</p>
              <p className="text-sm"><span className="font-medium text-gray-500">Pos. Gral:</span> {data.posicion_general}</p>
              <p className="text-sm"><span className="font-medium text-gray-500">Club:</span> {data.club}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm"><span className="font-medium text-gray-500">Pos. Género:</span> {data.posicion_genero}</p>
              <p className="text-sm"><span className="font-medium text-gray-500">Tiempo:</span> {data.tiempo}</p>
              {data.deporte.toLowerCase() === 'running' && (
                <p className="text-sm"><span className="font-medium text-gray-500">T. Chip:</span> {data.tiempo_chip}</p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
            <p className="text-sm"><span className="font-medium text-gray-500">Distancia:</span> {data.distancia} km</p>
            <p className="text-sm"><span className="font-medium text-gray-500">{data.deporte.toLowerCase() === 'running' ? 'Ritmo' : 'Velocidad'}:</span> {calculatePerformance()}</p>
          </div>

          {getLaps()}

          {data.certificado_url !== 'N/A' && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <a
                href={data.certificado_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-800"
              >
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                </svg>
                Ver certificado
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ParticipantCard;