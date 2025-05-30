import React from 'react';

const FilterControls = ({
  events,
  selectedEvent,
  onEventChange,
  categories,
  selectedCategory,
  onCategoryChange,
  searchTerm,
  onSearchChange,
  eventSearchTerm,
  onEventSearchChange,
  onApplyEventSearch
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6 border border-gray-200">
      {/* Sección de Búsqueda de Eventos */}
      <div className="mb-4 flex items-end space-x-2">
        <div className="flex-grow">
          <label htmlFor="event-search-input" className="block text-sm font-medium text-gray-700 mb-1">
            Buscar Evento:
          </label>
          <input
            type="text"
            id="event-search-input"
            placeholder="Ej. Maratón de la Ciudad"
            value={eventSearchTerm}
            onChange={(e) => onEventSearchChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
          />
        </div>
        <button
          onClick={onApplyEventSearch}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
        >
          Buscar
        </button>
      </div>

      {/* Filtro de Evento */}
      <div className="mb-4">
        <label htmlFor="event-select" className="block text-sm font-medium text-gray-700 mb-1">
          Seleccionar Evento:
        </label>
        <select
          id="event-select"
          value={selectedEvent}
          onChange={(e) => onEventChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
        >
          {events.map(event => (
            <option key={event} value={event}>{event}</option>
          ))}
        </select>
      </div>

      {/* Filtro por Categoría (siempre visible si hay un evento seleccionado) */}
      {selectedEvent !== 'Todos' && (
        <div className="mb-4">
          <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-1">
            Filtrar por Categoría:
          </label>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      )}

      {/* Búsqueda por Nombre o Dorsal (siempre visible si hay un evento seleccionado) */}
      {selectedEvent !== 'Todos' && (
        <div>
          <label htmlFor="search-input" className="block text-sm font-medium text-gray-700 mb-1">
            Buscar Participante (Nombre o Dorsal):
          </label>
          <input
            type="text"
            id="search-input"
            placeholder="Ej. Juan Pérez o 123"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
          />
        </div>
      )}
    </div>
  );
};

export default FilterControls;