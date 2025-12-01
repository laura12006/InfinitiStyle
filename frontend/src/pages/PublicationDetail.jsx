import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getPublications, deletePublication, me, getImageUrl, checkWishlistStatus, addToWishlist, removeFromWishlist } from '../api'
import BuyButton from '../components/BuyButton'

export default function PublicationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [publication, setPublication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [inWishlist, setInWishlist] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)

  useEffect(() => {
    loadPublication()
  }, [id])

  const loadPublication = async () => {
    try {
      setLoading(true)
      const response = await getPublications()
      if (response.ok) {
        const pub = response.data.find(p => p.id_publicacion === parseInt(id))
        if (pub) {
          setPublication(pub)
          const token = localStorage.getItem('token')
          if (token) {
            const userResponse = await me()
            if (userResponse.ok && userResponse.data && userResponse.data.logged_in) {
              setUser(userResponse.data.user)
            }
          }
          const wishlistResponse = await checkWishlistStatus(parseInt(id))
          if (wishlistResponse.ok) {
            setInWishlist(wishlistResponse.data.in_wishlist)
          }
        } else {
          setError('Publicación no encontrada')
        }
      } else {
        setError('Error cargando la publicación')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta publicación?')) {
      try {
        const response = await deletePublication(id)
        if (response.ok) {
          navigate('/profile')
        } else {
          setError('Error al eliminar la publicación')
        }
      } catch (err) {
        setError('Error de conexión')
      }
    }
  }

  const handleToggleWishlist = async () => {
    if (!user) {
      alert('Debes iniciar sesión para usar la lista de deseos')
      return
    }

    if (publication.id_usuario === user.id_usuario) {
      alert('No puedes agregar tu propia publicación a la lista de deseos')
      return
    }

    setWishlistLoading(true)
    try {
      if (inWishlist) {
        const response = await removeFromWishlist(publication.id_publicacion)
        if (response.ok) {
          setInWishlist(false)
        } else {
          alert('Error al eliminar de la lista de deseos')
        }
      } else {
        const response = await addToWishlist(publication.id_publicacion)
        if (response.ok) {
          setInWishlist(true)
        } else {
          alert(response.data.error || 'Error al agregar a la lista de deseos')
        }
      }
    } catch (err) {
      alert('Error de conexión')
    } finally {
      setWishlistLoading(false)
    }
  }

  const handleOpenChat = () => {
    if (!user) {
      alert('Debes iniciar sesión para chatear');
      return;
    }

    try {
      const ownerId = publication?.id_usuario;
      if (!ownerId) {
        alert('No se pudo obtener el ID del propietario. Intenta nuevamente.');
        return;
      }

      let ownerName = 'Vendedor';
      if (publication['1_nombre'] && publication['1_apellido']) {
        ownerName = `${publication['1_nombre']} ${publication['1_apellido']}`.trim();
      } else if (publication['1_nombre']) {
        ownerName = publication['1_nombre'];
      } else if (publication.username) {
        ownerName = publication.username;
      }

      const defaultMsg = `Hola, me interesa ${publication.tipo_publicacion === 'Intercambio' ? 'intercambiar' : 'comprar'} "${publication.nombre}". ¿Disponible?`;

      console.log('[Chat Debug]', { ownerId, ownerName, message: defaultMsg });

      window.dispatchEvent(new CustomEvent('openChat', {
        detail: {
          other_user_id: ownerId,
          other_user_name: ownerName,
          message: defaultMsg
        }
      }));
    } catch (err) {
      console.error('Error opening chat:', err);
      alert('No se pudo abrir el chat. Intenta nuevamente.');
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wine-medium"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      </div>
    )
  }

  if (!publication) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Publicación no encontrada</h2>
          <Link to="/" className="text-wine-medium hover:text-wine-dark">
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  const isOwner = user && user.id_usuario === publication.id_usuario

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:flex-shrink-0">
              <img
                className="h-96 w-full object-cover md:w-96"
                src={getImageUrl(publication.foto)}
                alt={publication.nombre}
              />
            </div>
            <div className="p-8">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {publication.nombre}
                  </h2>
                  <p className="mt-2 text-sm text-gray-500 flex items-center">
                    <span>Publicado por:</span>
                    <Link 
                      to={`/user/${publication.id_usuario}`}
                      className="ml-1 text-wine-medium hover:text-wine-dark font-medium hover:underline transition-colors duration-200 flex items-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{publication['1_nombre']} {publication['1_apellido']}</span>
                    </Link>
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  {user && !isOwner && (
                    <button
                      onClick={handleToggleWishlist}
                      disabled={wishlistLoading}
                      className={`p-2 rounded-full transition-all duration-300 ${
                        inWishlist
                          ? 'bg-red-100 text-red-500 hover:bg-red-200'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-500'
                      } ${wishlistLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title={inWishlist ? 'Eliminar de lista de deseos' : 'Agregar a lista de deseos'}
                    >
                      {wishlistLoading ? (
                        <div className="w-6 h-6 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      ) : (
                        <svg 
                          className="w-6 h-6" 
                          fill={inWishlist ? 'currentColor' : 'none'} 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="2" 
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      )}
                    </button>
                  )}
                  <span className="px-2 py-1 text-sm rounded-full bg-wine-lightest text-wine-darkest">
                    {publication.tipo_publicacion}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900">Detalles</h3>
                <dl className="mt-2 border-t border-b border-gray-200 divide-y divide-gray-200">
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Talla</dt>
                    <dd className="text-sm text-gray-900">{publication.talla}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Estado</dt>
                    <dd className="text-sm text-gray-900">{publication.estado}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Precio</dt>
                    <dd className="text-sm text-gray-900">${publication.valor}</dd>
                  </div>
                </dl>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900">Descripción</h3>
                <p className="mt-2 text-gray-600">
                  {publication.descripcion_prenda}
                </p>
              </div>

              {/* Botón de compra - solo si no es el propietario y está disponible */}
              {!isOwner && publication.estado === 'Disponible' && (
                <div className="mt-8 space-y-3">
                  <BuyButton 
                    publication={publication}
                    onTransactionStart={(transactionId) => {
                      // Redirigir a mis transacciones o mostrar mensaje
                      navigate('/transactions');
                    }}
                  />
                  {publication.tipo_publicacion === 'Intercambio' && user && (
                    <button
                      onClick={handleOpenChat}
                      className="w-full bg-white border-2 border-wine-medium text-wine-medium py-3 px-6 rounded-lg hover:bg-wine-medium/10 transition-colors font-semibold flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>Chatear con propietario</span>
                    </button>
                  )}
                </div>
              )}

              {isOwner && (
                <div className="mt-8 flex space-x-4">
                  <Link
                    to={`/publications/${publication.id_publicacion}/edit`}
                    className="flex-1 bg-wine-medium text-white px-4 py-2 rounded-md hover:bg-wine-dark text-center"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

}
