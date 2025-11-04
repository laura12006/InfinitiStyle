import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublications } from '../api';

const PublicationCard = ({ publication }) => {
  const { nombre, descripcion_prenda, talla, foto, valor, tipo_publicacion, estado } = publication;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <img 
        src={getImageUrl(publication.foto)} 
        alt={nombre} 
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{nombre}</h3>
        <p className="text-gray-600 text-sm mb-2">{descripcion_prenda}</p>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Talla: {talla}</span>
          <span className="text-lg font-bold">${valor}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className={`px-2 py-1 rounded ${tipo_publicacion === 'Venta' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
            {tipo_publicacion}
          </span>
          <span className={`px-2 py-1 rounded ${estado === 'Disponible' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {estado}
          </span>
        </div>
      </div>
    </div>
  );
};

const Filters = ({ filters, onFilterChange }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h2 className="text-lg font-semibold mb-4">Filtros</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Talla</label>
          <select 
            value={filters.talla || ''} 
            onChange={(e) => onFilterChange('talla', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Todas</option>
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Estado</label>
          <select 
            value={filters.estado || ''} 
            onChange={(e) => onFilterChange('estado', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Todos</option>
            <option value="Disponible">Disponible</option>
            <option value="No Disponible">No Disponible</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Tipo</label>
          <select 
            value={filters.tipo_publicacion || ''} 
            onChange={(e) => onFilterChange('tipo_publicacion', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Todos</option>
            <option value="Venta">Venta</option>
            <option value="Intercambio">Intercambio</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default function Publications() {
  const [publications, setPublications] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPublications();
  }, [filters]);

  const loadPublications = async () => {
    try {
      setLoading(true);
      const response = await getPublications(filters);
      if (response.ok) {
        setPublications(response.data);
      } else {
        setError('Error cargando publicaciones');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>;
  }

  if (error) {
    return <div className="text-center text-red-600 p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Filters filters={filters} onFilterChange={handleFilterChange} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {publications.map(publication => (
          <Link 
            key={publication.id_publicacion} 
            to={`/publications/${publication.id_publicacion}`}
          >
            <PublicationCard publication={publication} />
          </Link>
        ))}
      </div>
      
      {publications.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No se encontraron publicaciones
        </div>
      )}
    </div>
  );
}