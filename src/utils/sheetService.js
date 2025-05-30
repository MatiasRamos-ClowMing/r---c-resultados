export const fetchSheetData = async () => {
  const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQWjDAx17rze56_4sq8mIxro5u1-lTVS6MYe3v6wDqrbG12ARK3b_lPI387qJIfl56fCjHaHEHXQsfi/pub?output=csv";

  try {
    const response = await fetch(sheetUrl);
    if (!response.ok) throw new Error(`Error ${response.status} al cargar datos del CSV.`);
    
    const csvData = await response.text();
    const lines = csvData.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length < 2) throw new Error('La hoja no contiene datos o solo tiene encabezados.');
    
    // Mapeo de encabezados de columna a nombres de campo internos
    // Asegúrate de que estos nombres coincidan con los de tu hoja, en minúsculas
    const rawHeaders = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());
    
    // Definimos un mapeo explícito de los encabezados de tu hoja a nombres de campo internos
    // Esto es CRÍTICO para la consistencia
    const headerMap = {
      'posición categoria': 'posicion_categoria', // Columna A
      'dorsal': 'dorsal',
      'posición genero': 'posicion_genero',     // Columna C
      'posición general': 'posicion_general',   // Columna D
      'nombre': 'nombre',
      'categoria': 'categoria',
      'tiempo': 'tiempo',                       // Columna G
      'tiempo chip': 'tiempo_chip',             // Columna H
      'club': 'club',                           // Columna I
      'foto_url': 'foto_url',
      'certificado_url': 'certificado_url',
      'evento': 'evento',
      'distancia': 'distancia',                 // Columna M
      'deporte': 'deporte',
      // Si tienes vueltas, asegúrate de que los encabezados sean 'vuelta_1', 'vuelta_2', etc.
      'vuelta_1': 'vuelta_1',
      'vuelta_2': 'vuelta_2',
      'vuelta_3': 'vuelta_3',
      'vuelta_4': 'vuelta_4',
      'vuelta_5': 'vuelta_5',
      // Añade más vueltas si es necesario
    };

    // Crear los encabezados finales usando el mapeo
    const headers = rawHeaders.map(rawHeader => headerMap[rawHeader] || rawHeader);

    return lines.slice(1).map(line => {
      const values = line.split(',');
      const rowData = {};
      
      headers.forEach((header, index) => {
        let value = values[index] ? values[index].trim().replace(/"/g, '') : '';
        
        // Convertir a número si es posible y si no es una URL
        if (!isNaN(value) && value !== '' && !value.startsWith('http')) {
          value = Number(value);
        }
        
        rowData[header] = value;
      });
      
      return rowData;
    });
    
  } catch (error) {
    console.error('Error en fetchSheetData:', error);
    throw new Error('No se pudieron cargar los datos. Verifica que la hoja sea pública y tenga el formato CSV correcto.');
  }
};