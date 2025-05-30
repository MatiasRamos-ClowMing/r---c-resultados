export const parseSheetData = (data) => {
  const headers = data[0];
  const rows = data.slice(1);

  return rows.map(row => {
    const rowData = {};
    headers.forEach((header, index) => {
      rowData[header] = row[index];
    });
    return rowData;
  });
};

export const calculatePace = (timeStr, distance) => {
  if (!timeStr || !distance) return 'N/A';
  const parts = timeStr.split(':').map(Number);
  let totalSeconds = 0;
  if (parts.length === 3) { // HH:MM:SS
    totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) { // MM:SS
    totalSeconds = parts[0] * 60 + parts[1];
  } else {
    return 'N/A';
  }

  if (distance === 0) return 'N/A';
  const paceSecondsPerKm = totalSeconds / distance;
  const minutes = Math.floor(paceSecondsPerKm / 60);
  const seconds = Math.round(paceSecondsPerKm % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds} min/km`;
};

export const calculateSpeed = (timeStr, distance) => {
  if (!timeStr || !distance) return 'N/A';
  const parts = timeStr.split(':').map(Number);
  let totalHours = 0;
  if (parts.length === 3) { // HH:MM:SS
    totalHours = parts[0] + parts[1] / 60 + parts[2] / 3600;
  } else if (parts.length === 2) { // MM:SS
    totalHours = parts[0] / 60 + parts[1] / 3600;
  } else {
    return 'N/A';
  }

  if (totalHours === 0) return 'N/A';
  const speed = distance / totalHours;
  return `${speed.toFixed(2)} km/h`;
};

export const findFastestLap = (laps) => {
  let fastestTime = Infinity;
  let fastestLapIndex = -1;

  laps.forEach((lapTime, index) => {
    if (lapTime) {
      const parts = lapTime.split(':').map(Number);
      let totalSeconds = 0;
      if (parts.length === 3) {
        totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else if (parts.length === 2) {
        totalSeconds = parts[0] * 60 + parts[1];
      }

      if (totalSeconds < fastestTime) {
        fastestTime = totalSeconds;
        fastestLapIndex = index;
      }
    }
  });
  return fastestLapIndex;
};

export const getUniqueEvents = (data) => {
  const events = new Set();
  data.forEach(row => {
    if (row.evento) {
      events.add(row.evento);
    }
  });
  return ['Todos', ...Array.from(events)];
};

export const getUniqueCategories = (data, eventName) => {
  const categories = new Set();
  data.forEach(row => {
    if ((eventName === 'Todos' || row.evento === eventName) && row.categoria) {
      categories.add(row.categoria);
    }
  });
  return ['Todas', ...Array.from(categories)];
};