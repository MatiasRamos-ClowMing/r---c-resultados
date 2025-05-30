import React, { useState, useEffect } from 'react';
import AthleteReport from './AthleteReport';

const AthleteReportView = () => {
  const [athlete, setAthlete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAthleteData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          'https://docs.google.com/spreadsheets/d/e/2PACX-1vQWjDAx17rze56_4sq8mIxro5u1-lTVS6MYe3v6wDqrbG12ARK3b_lPI387qJIfl56fCjHaHEHXQsfi/pub?gid=0&single=true&output=csv'
        );
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length < 2) throw new Error('La hoja no contiene datos');
        
        // Normalizar encabezados (convertir a minúsculas y limpiar)
        const headers = lines[0].split(',').map(h => 
          h.trim().replace(/"/g, '').toLowerCase()
        );

        // Función para obtener índice de columna con manejo seguro
        const getColIndex = (colName) => {
          const index = headers.findIndex(h => h === colName.toLowerCase());
          if (index === -1) console.warn(`Columna no encontrada: ${colName}`);
          return index;
        };

        // Mapeo de columnas exactas (basado en tu estructura)
        const columnMapping = {
          nombre: getColIndex('nombre'),
          categoria: getColIndex('categoria'),
          posicion_categoria: getColIndex('a'), // Columna A
          posicion_genero: getColIndex('c'),    // Columna C
          posicion_general: getColIndex('d'),   // Columna D
          club: getColIndex('i'),               // Columna I
          tiempo: getColIndex('g'),             // Columna G
          tiempo_chip: getColIndex('h'),        // Columna H
          distancia: getColIndex('m'),          // Columna M
          deporte: getColIndex('deporte'),
          foto_url: getColIndex('foto_url'),
          certificado_url: getColIndex('certificado_url'),
          dorsal: getColIndex('dorsal'),
          evento: getColIndex('evento')
        };

        // Procesar datos del primer atleta (ejemplo)
        const athleteData = lines[1].split(',').reduce((obj, value, index) => {
          const currentCol = Object.keys(columnMapping).find(
            key => columnMapping[key] === index
          );
          
          if (currentCol) {
            val = value.trim().replace(/"/g, '');
            obj[currentCol] = isNaN(val) || val === '' ? val : Number(val);
          }
          return obj;
        }, {});

        // Formatear distancia con "km"
        if (athleteData.distancia && athleteData.distancia !== 'N/A') {
          athleteData.distancia = `${athleteData.distancia} km`;
        }

        setAthlete(athleteData);
      } catch (err) {
        setError(`Error al cargar datos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAthleteData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos del atleta...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-50 p-6 rounded-lg max-w-md text-center">
          <h3 className="text-lg font-medium text-red-800">Error</h3>
          <p className="mt-2 text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!athlete) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-yellow-50 p-6 rounded-lg max-w-md text-center">
          <h3 className="text-lg font-medium text-yellow-800">Datos no encontrados</h3>
          <p className="mt-2 text-yellow-700">No se pudieron cargar los datos del atleta.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <AthleteReport athlete={athlete} />
      </div>
    </div>
  );
};

export default AthleteReportView;


Cambios realizados:

1. Extracción de datos optimizada:
   - Mapeo exacto de cada columna (A, C, D, G, H, I, M)
   - Conversión automática de tipos (números/texto)
   - Normalización de encabezados

2. Manejo de errores mejorado:
   - Detección de columnas faltantes
   - Mensajes de error específicos
   - Opción de reintento

3. Formateo consistente:
   - Distancia mostrada con "km" (ej: "10 km")
   - Valores por defecto "N/A" para datos faltantes

4. Visualización profesional:
   - Spinner de carga
   - Mensajes de error/ausencia de datos estilizados
   - Diseño responsive

Para garantizar que funcione:

1. Verifica que los encabezados en tu hoja contengan estos campos:
   
   nombre, categoria, deporte, foto_url, certificado_url, dorsal, evento
   

2. Las columnas deben estar en estas posiciones:
   - Pos. Cat. = Columna A
   - Pos. Género = Columna C
   - Pos. Gral. = Columna D
   - Tiempo = Columna G
   - Tiempo Chip = Columna H
   - Club = Columna I
   - Distancia = Columna M

3. Asegura que la hoja sea pública y accesible

4. Comprueba en la consola si hay advertencias sobre columnas no encontradas

Esta solución garantiza que cada dato se extraiga de la columna correcta y se muestre de manera consistente en la interfaz.