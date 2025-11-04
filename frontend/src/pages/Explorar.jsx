import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { me, getPublications, getImageUrl } from '../api';

export default function Explorar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publications, setPublications] = useState([]);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    loadInitialData();
  }, [filters]); // React a cambios en filtros

  const loadInitialData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const userRes = await me();
        if (userRes.ok && userRes.data && userRes.data.logged_in) {
          setUser(userRes.data.user);
        }
      }
      const pubRes = await getPublications(filters);
      if (pubRes.ok) {
        setPublications(pubRes.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wine-medium"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Encabezado Explorar */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-3xl font-bold mb-4 text-wine-darkest">Explorar Publicaciones</h2>
        <p className="text-gray-600 mb-4">
          Descubre las últimas prendas disponibles en nuestra comunidad de moda sostenible.
        </p>
        {user && (
          <div className="flex space-x-4">
            <Link
              to="/publications/create"
              className="bg-wine-medium text-white px-4 py-2 rounded-md hover:bg-wine-dark"
            >
              Nueva Publicación
            </Link>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Talla</label>
            <select
              className="mt-1 block w-full rounded-md border-wine-light shadow-sm focus:border-wine-medium focus:ring-wine-medium"
              value={filters.talla || ''}
              onChange={(e) =>
                setFilters({ ...filters, talla: e.target.value || undefined })
              }
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
            <label className="block text-sm font-medium text-gray-700">Tipo de Publicación</label>
            <select
              className="mt-1 block w-full rounded-md border-wine-light shadow-sm focus:border-wine-medium focus:ring-wine-medium"
              value={filters.tipo_publicacion || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  tipo_publicacion: e.target.value || undefined,
                })
              }
            >
              <option value="">Todos</option>
              <option value="Venta">Venta</option>
              <option value="Intercambio">Intercambio</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Estado</label>
            <select
              className="mt-1 block w-full rounded-md border-wine-light shadow-sm focus:border-wine-medium focus:ring-wine-medium"
              value={filters.estado || ''}
              onChange={(e) =>
                setFilters({ ...filters, estado: e.target.value || undefined })
              }
            >
              <option value="">Todos</option>
              <option value="Disponible">Disponible</option>
              <option value="No Disponible">No Disponible</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de publicaciones estilo catálogo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {publications.map((pub) => (
          <div
            key={pub.id_publicacion}
            className="bg-white rounded-lg shadow-md p-4 flex flex-col"
          >
            {/* Imagen */}
            <div className="flex justify-center mb-4">
              <img
                src={getImageUrl(pub.foto)}
                alt={pub.nombre}
                className="w-48 h-40 object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/150?text=No+disponible';
                }}
              />
            </div>

            {/* Nombre */}
            <h3 className="font-semibold text-base mb-1">{pub.nombre}</h3>

            {/* Descripción */}
            <p className="text-xs text-gray-600 mb-3 line-clamp-3">{pub.descripcion_prenda}</p>

            {/* Precio y tipo publicación */}
            <div className="flex justify-between items-center text-sm font-semibold text-[#372a28] mb-4">
              <span>${pub.valor}</span>
              <span className="px-2 py-0.5 border border-[#372a28] rounded text-xs">
                {pub.tipo_publicacion}
              </span>
            </div>

            {/* Botón */}
            <Link
              to={`/publications/${pub.id_publicacion}`}
              className="block bg-[#372a28] hover:bg-[#250f0d] text-white text-center rounded-md py-2 font-semibold transition"
            >
              Ver Detalles
            </Link>
          </div>
        ))}
      </div>

      {publications.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No hay publicaciones disponibles
        </div>
      )}
    </div>
  );
}