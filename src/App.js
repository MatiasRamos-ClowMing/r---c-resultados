import React, { useState, useEffect, useCallback } from 'react';
import { fetchSheetData } from './utils/sheetService';
import FilterControls from './components/FilterControls';
import ParticipantCard from './components/ParticipantCard';
import PDFButtons from './components/PDFButtons';

const App = () => {
  const [allParticipants, setAllParticipants] = useState([]);
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [availableEvents, setAvailableEvents] = useState(['Todos']);
  const [availableCategories, setAvailableCategories] = useState(['Todas']);
  
  const [selectedEvent, setSelectedEvent] = useState('Todos');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [eventSearchTerm, setEventSearchTerm] = useState('');
  const [appliedEventSearchTerm, setAppliedEventSearchTerm] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSheetData();
      
      if (!data.length) throw new Error('La hoja está vacía');
      
      setAllParticipants(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Efecto para actualizar la lista de eventos disponibles en el filtro
  useEffect(() => {
    let currentEvents = ['Todos', ...new Set(allParticipants.map(p => p.evento).filter(Boolean))];
    
    if (appliedEventSearchTerm) {
      const lowerCaseSearchTerm = appliedEventSearchTerm.toLowerCase();
      currentEvents = currentEvents.filter(event => 
        event.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }
    currentEvents.sort((a, b) => {
      if (a === 'Todos') return -1;
      if (b === 'Todos') return 1;
      return a.localeCompare(b);
    });

    setAvailableEvents(currentEvents);
    
    // Si el evento seleccionado ya no está en la lista filtrada, resetearlo
    // Esto es importante para que el dropdown refleje la búsqueda
    if (!currentEvents.includes(selectedEvent)) {
      setSelectedEvent('Todos');
    }
  }, [allParticipants, appliedEventSearchTerm, selectedEvent]);

  // Efecto para filtrar participantes y actualizar categorías disponibles
  useEffect(() => {
    let currentFiltered = [];

    if (selectedEvent !== 'Todos') {
      currentFiltered = allParticipants.filter(p => p.evento === selectedEvent);

      if (selectedCategory !== 'Todas') {
        currentFiltered = currentFiltered.filter(p => p.categoria === selectedCategory);
      }

      if (searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        currentFiltered = currentFiltered.filter(p =>
          p.nombre?.toLowerCase().includes(lowerCaseSearchTerm) ||
          p.dorsal?.toString().includes(lowerCaseSearchTerm)
        );
      }
    }

    currentFiltered.sort((a, b) => (a.posicion_categoria || 0) - (b.posicion_categoria || 0));
    setFilteredParticipants(currentFiltered);

    if (selectedEvent !== 'Todos') {
      const eventCategories = [...new Set(
        allParticipants
          .filter(p => p.evento === selectedEvent)
          .map(p => p.categoria)
          .filter(Boolean)
      )];
      setAvailableCategories(['Todas', ...eventCategories]);
    } else {
      setAvailableCategories(['Todas']);
    }
  }, [allParticipants, selectedEvent, selectedCategory, searchTerm]);

  // Función para aplicar la búsqueda de evento
  const handleApplyEventSearch = () => {
    setAppliedEventSearchTerm(eventSearchTerm);
    // Intentar seleccionar el evento si hay una coincidencia exacta o única
    const exactMatch = availableEvents.find(event => event.toLowerCase() === eventSearchTerm.toLowerCase());
    if (exactMatch) {
      setSelectedEvent(exactMatch);
    } else {
      const matchingEvents = availableEvents.filter(event => 
        event.toLowerCase().includes(eventSearchTerm.toLowerCase()) && event !== 'Todos'
      );
      if (matchingEvents.length === 1) {
        setSelectedEvent(matchingEvents[0]);
      } else {
        setSelectedEvent('Todos'); // Si no hay coincidencia única o exacta, resetear
      }
    }
    setSelectedCategory('Todas');
    setSearchTerm('');
  };

  // Función para manejar el cambio de selección de evento en el dropdown
  const handleEventSelectChange = (eventValue) => {
    setSelectedEvent(eventValue);
    setSelectedCategory('Todas');
    setSearchTerm('');
    setEventSearchTerm(''); // Limpiar búsqueda de evento al seleccionar del dropdown
    setAppliedEventSearchTerm(''); // Limpiar término de búsqueda aplicado
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando resultados deportivos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-4 bg-red-50 rounded-lg">
          <h2 className="text-xl font-bold text-red-600">Error</h2>
          <p className="text-red-500 my-3">{error}</p>
          <button 
            onClick={loadData}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            Reintentar
          </button>
          <p className="mt-3 text-sm text-gray-600">
            Asegúrate que la hoja sea pública y tenga datos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-orange-500 py-6 shadow-md">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white">R&C Resultados Sports</h1>
          <p className="text-white text-opacity-80 mt-2">Resultados oficiales de competencias</p>
        </div>
      </header>

      <main className="flex-grow max-w-4xl mx-auto p-4">
        <FilterControls
          events={availableEvents}
          categories={availableCategories}
          selectedEvent={selectedEvent}
          selectedCategory={selectedCategory}
          searchTerm={searchTerm}
          eventSearchTerm={eventSearchTerm}
          onEventChange={handleEventSelectChange}
          onCategoryChange={setSelectedCategory}
          onSearchChange={setSearchTerm}
          onEventSearchChange={setEventSearchTerm}
          onApplyEventSearch={handleApplyEventSearch}
        />

        {selectedEvent !== 'Todos' && (
          <>
            {allParticipants.length > 0 && (
              <PDFButtons 
                filteredParticipants={filteredParticipants}
                allParticipants={allParticipants}
                selectedEvent={selectedEvent}
                selectedCategory={selectedCategory}
              />
            )}

            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredParticipants.length > 0 ? (
                filteredParticipants.map((participant, index) => (
                  <ParticipantCard key={index} participant={participant} />
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No hay participantes con estos filtros para el evento seleccionado.</p>
                </div>
              )}
            </div>
          </>
        )}

        {selectedEvent === 'Todos' && !loading && !error && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Por favor, selecciona un evento para ver los resultados.</p>
            <p className="text-gray-500 text-sm mt-2">Puedes usar la búsqueda de eventos para encontrarlo más rápido.</p>
          </div>
        )}
      </main>

      <footer className="bg-gray-800 text-white py-6 mt-auto">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm mb-3">© {new Date().getFullYear()} R&C Resultados Sports. Todos los derechos reservados.</p>
          <a 
            href="mailto:ruedaycorre0@gmail.com" 
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-1 12H4a2 2 0 01-2-2V6a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2z"></path>
            </svg>
            Contacto
          </a>
        </div>
      </footer>
    </div>
  );
};

export default App;