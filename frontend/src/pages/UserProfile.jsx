import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPublications, getImageUrl, getUserProfile, getUserRatings, sendMessage, me } from '../api'

export default function UserProfile() {
  const { userId } = useParams()
  const [userPublications, setUserPublications] = useState([])
  const [userInfo, setUserInfo] = useState(null)
  const [userRatings, setUserRatings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('publications')
  const [currentUser, setCurrentUser] = useState(null)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)

  useEffect(() => {
    loadUserData()
    loadCurrentUser()
  }, [userId])

  const loadCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const response = await me()
        if (response.ok && response.data?.logged_in) {
          setCurrentUser(response.data.user)
        }
      }
    } catch (error) {
      console.error('Error loading current user:', error)
    }
  }

  const loadUserData = async () => {
    try {
      setLoading(true)
      
      // Cargar publicaciones
      const publicationsResponse = await getPublications()
      if (publicationsResponse.ok) {
        const publications = publicationsResponse.data.filter(pub => pub.id_usuario === parseInt(userId))
        setUserPublications(publications)
      }

      // Cargar perfil del usuario
      const profileResponse = await getUserProfile(userId)
      if (profileResponse.ok) {
        setUserInfo(profileResponse.data)
      } else {
        // Fallback: usar datos de la primera publicación
        const publicationsResponse = await getPublications()
        if (publicationsResponse.ok) {
          const publications = publicationsResponse.data.filter(pub => pub.id_usuario === parseInt(userId))
          if (publications.length > 0) {
            const firstPub = publications[0]
            setUserInfo({
              id_usuario: firstPub.id_usuario,
              '1_nombre': firstPub['1_nombre'],
              '1_apellido': firstPub['1_apellido'],
              correo_electronico: firstPub.correo_electronico || '',
              talla: firstPub.talla || '',
              fecha_registro: firstPub.fecha_registro || new Date().toISOString()
            })
          }
        }
      }

      // Cargar valoraciones
      const ratingsResponse = await getUserRatings(userId)
      if (ratingsResponse.ok) {
        // Asegurar que sea un array
        const ratingsData = ratingsResponse.data || []
        setUserRatings(Array.isArray(ratingsData) ? ratingsData : [])
      } else {
        setUserRatings([])
      }

    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!messageText.trim()) return
    
    setSendingMessage(true)
    try {
      const response = await sendMessage(parseInt(userId), messageText.trim())
      if (response.ok) {
        setShowMessageModal(false)
        setMessageText('')
        alert('Mensaje enviado exitosamente')
      } else {
        alert('Error al enviar mensaje')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Error al enviar mensaje')
    } finally {
      setSendingMessage(false)
    }
  }

  const calculateStats = () => {
    // Asegurar que sean arrays
    const publications = Array.isArray(userPublications) ? userPublications : []
    const ratings = Array.isArray(userRatings) ? userRatings : []
    
    const availablePublications = publications.filter(pub => pub.estado === 'Disponible').length
    const soldPublications = publications.filter(pub => pub.estado === 'No Disponible').length
    const averagePrice = publications.length > 0 
      ? publications.reduce((sum, pub) => sum + (pub.valor || 0), 0) / publications.length
      : 0
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, rating) => sum + rating.puntaje, 0) / ratings.length
      : 0

    return {
      totalPublications: publications.length,
      availablePublications,
      soldPublications,
      averagePrice,
      averageRating,
      totalRatings: ratings.length
    }
  }

  const stats = calculateStats()

  useEffect(() => {
    loadCurrentUser()
    loadUserData()
  }, [userId])

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {userInfo && (
          <>
            {/* Header del Perfil */}
            <div className="bg-gradient-to-r from-wine-darkest via-wine-dark to-wine-medium rounded-2xl shadow-2xl overflow-hidden mb-8">
              <div className="relative">                
                <div className="relative p-8">
                  <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-32 h-32 bg-gradient-to-br from-wine-light to-wine-lightest rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                        <span className="text-wine-darkest text-4xl font-bold">
                          {userInfo['1_nombre']?.charAt(0)}{userInfo['1_apellido']?.charAt(0)}
                        </span>
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 border-4 border-white rounded-full"></div>
                    </div>

                    {/* Información Principal */}
                    <div className="flex-1 text-white">|
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                        <div>
                          <h1 className="text-4xl font-bold mb-2">
                            {userInfo['1_nombre']} {userInfo['1_apellido']}
                          </h1>
                          <div className="flex items-center space-x-4 text-wine-light mb-4">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              StyleInfinite
                            </span>
                            {userInfo.fecha_registro && (
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Miembro desde {new Date(userInfo.fecha_registro).getFullYear()}
                              </span>
                            )}
                          </div>

                          {/* Talla preferida */}
                          {userInfo.talla && (
                            <div className="flex items-center text-wine-light mb-4">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              Talla preferida: <span className="font-semibold ml-1">{userInfo.talla}</span>
                            </div>
                          )}
                        </div>

                        {/* Botón de mensaje - solo si no es el usuario actual */}
                        {currentUser && currentUser.id_usuario !== parseInt(userId) && (
                          <button
                            onClick={() => setShowMessageModal(true)}
                            className="bg-white text-wine-medium px-6 py-3 rounded-full font-semibold hover:bg-wine-lightest transition-colors shadow-lg flex items-center space-x-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>Enviar Mensaje</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="text-3xl font-bold text-wine-medium mb-2">{stats.totalPublications}</div>
                <div className="text-gray-600 text-sm">Publicaciones</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{stats.availablePublications}</div>
                <div className="text-gray-600 text-sm">Disponibles</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="text-3xl font-bold text-gray-600 mb-2">{stats.soldPublications}</div>
                <div className="text-gray-600 text-sm">Vendidas</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-3xl font-bold text-yellow-500 mr-1">
                    {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}
                  </span>
                  <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
                <div className="text-gray-600 text-sm">
                  Valoración ({stats.totalRatings})
                </div>
              </div>
            </div>

            {/* Pestañas */}
            <div className="bg-white rounded-xl shadow-lg">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('publications')}
                    className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'publications'
                        ? 'border-wine-medium text-wine-medium'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span>Publicaciones ({stats.totalPublications})</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('ratings')}
                    className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'ratings'
                        ? 'border-wine-medium text-wine-medium'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.837-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <span>Valoraciones ({stats.totalRatings})</span>
                    </div>
                  </button>
                </nav>
              </div>

              {/* Contenido de las pestañas */}
              <div className="p-6">
                {activeTab === 'publications' && (
                  <div>
                    {userPublications.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                          <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No hay publicaciones</h3>
                        <p className="text-gray-500">Este usuario no tiene publicaciones disponibles aún.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {userPublications.map((publication) => (
                          <Link
                            key={publication.id_publicacion}
                            to={`/publications/${publication.id_publicacion}`}
                            className="group bg-gray-50 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                          >
                            <div className="aspect-square overflow-hidden">
                              <img
                                src={getImageUrl(publication.foto)}
                                alt={publication.nombre}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-gray-900 truncate flex-1 mr-2">
                                  {publication.nombre}
                                </h3>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  publication.estado === 'Disponible' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {publication.estado}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {publication.descripcion_prenda}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-xl font-bold text-wine-medium">
                                  {publication.tipo_publicacion === 'Intercambio' 
                                    ? 'Intercambio' 
                                    : `$${publication.valor?.toLocaleString()}`
                                  }
                                </span>
                                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  Talla {publication.talla}
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'ratings' && (
                  <div>
                    {(!Array.isArray(userRatings) || userRatings.length === 0) ? (
                      <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                          <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.837-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">Sin valoraciones</h3>
                        <p className="text-gray-500">Este usuario no ha recibido valoraciones aún.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(Array.isArray(userRatings) ? userRatings : []).map((rating) => (
                          <div key={rating.id_valoracion} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-wine-medium rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm font-semibold">
                                    {rating.valorador_nombre?.charAt(0)}
                                  </span>
                                </div>
                                <span className="font-medium text-gray-900">
                                  {rating.valorador_nombre} {rating.valorador_apellido}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`w-4 h-4 ${i < rating.puntaje ? 'text-yellow-400' : 'text-gray-300'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                  </svg>
                                ))}
                                <span className="ml-2 text-sm text-gray-600">
                                  {rating.puntaje}/5
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">
                              {new Date(rating.fecha_valoracion).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Modal de mensaje */}
        {showMessageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-wine-darkest">
                  Enviar mensaje a {userInfo['1_nombre']}
                </h3>
                <button 
                  onClick={() => setShowMessageModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Escribe tu mensaje aquí..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wine-medium focus:border-wine-medium resize-none"
                  rows={4}
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || sendingMessage}
                  className="flex-1 bg-wine-medium text-white px-4 py-2 rounded-lg hover:bg-wine-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingMessage ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}