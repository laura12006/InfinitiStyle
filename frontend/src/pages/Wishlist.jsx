import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getWishlist, removeFromWishlist, getImageUrl } from '../api';

export default function Wishlist() {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthAndLoadWishlist();
  }, []);

  const checkAuthAndLoadWishlist = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Debes iniciar sesión para ver tu lista de deseos');
      setLoading(false);
      return;
    }

    setIsAuthenticated(true);
    await loadWishlist();
  };

  const loadWishlist = async () => {
    try {
      const response = await getWishlist();
      if (response.ok) {
        setWishlistItems(response.data);
      } else if (response.status === 401) {
        setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        localStorage.removeItem('token'); // Limpiar token inválido
        setIsAuthenticated(false);
      } else {
        setError('Error al cargar la lista de deseos');
      }
    } catch (err) {
      setError('Error de conexión. Verifica que el servidor esté funcionando.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (publicationId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta prenda de tu lista de deseos?')) {
      return;
    }

    try {
      const response = await removeFromWishlist(publicationId);
      if (response.ok) {
        setWishlistItems(prev => prev.filter(item => item.id_publicacion !== publicationId));
      } else if (response.status === 401) {
        setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      } else {
        alert('Error al eliminar de la lista de deseos');
      }
    } catch (err) {
      alert('Error de conexión');
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-wine-darkest mb-4">Mi Lista de Deseos</h1>
        <p className="text-gray-600 text-lg">
          Aquí tienes guardadas todas las prendas que te han gustado
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-6 rounded-lg mb-6">
          <div className="flex items-center mb-3">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
            <h3 className="font-semibold">Error</h3>
          </div>
          <p className="mb-4">{error}</p>
          {!isAuthenticated && (
            <div className="flex space-x-4">
              <Link
                to="/login"
                className="bg-wine-medium text-white px-4 py-2 rounded-lg font-semibold hover:bg-wine-dark transition duration-300"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="border border-wine-medium text-wine-medium px-4 py-2 rounded-lg font-semibold hover:bg-wine-medium hover:text-white transition duration-300"
              >
                Crear Cuenta
              </Link>
            </div>
          )}
        </div>
      )}

      {!error && wishlistItems.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Tu lista de deseos está vacía</h2>
          <p className="text-gray-500 mb-8">
            Explora nuestras publicaciones y guarda las prendas que más te gusten
          </p>
          <Link
            to="/explorar"
            className="bg-wine-medium text-white px-8 py-3 rounded-lg font-semibold hover:bg-wine-dark transition duration-300"
          >
            Explorar Prendas
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id_lista_deseos} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300">
              <div className="aspect-square bg-gradient-to-br from-wine-lightest to-gray-100 flex items-center justify-center">
                {item.foto ? (
                  <img
                    src={getImageUrl(item.foto)}
                    alt={item.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-20 h-20 text-wine-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                )}
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-wine-darkest">{item.nombre}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.descripcion_prenda}</p>
                
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-wine-medium">${item.valor}</span>
                  <span className="bg-wine-lightest text-wine-darkest px-3 py-1 rounded-full text-sm font-medium">
                    {item.tipo_publicacion}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <Link
                    to={`/publications/${item.id_publicacion}`}
                    className="bg-wine-medium text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-wine-dark transition duration-300"
                  >
                    Ver Detalle
                  </Link>
                  <button
                    onClick={() => handleRemoveFromWishlist(item.id_publicacion)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition duration-300"
                    title="Eliminar de la lista de deseos"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}