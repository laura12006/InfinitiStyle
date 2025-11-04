import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPublications, updatePublication, me, getImageUrl } from '../api'

export default function EditPublication() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [publication, setPublication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion_prenda: '',
    talla: '',
    estado: '',
    valor: '',
    tipo_publicacion: '',
    foto: null
  })

  const [previewImage, setPreviewImage] = useState('')

  useEffect(() => {
    loadPublicationData()
  }, [id])

  const loadPublicationData = async () => {
    try {
      setLoading(true)
      
      // Verificar autenticación
      const userResponse = await me()
      if (!userResponse.ok || !userResponse.data.logged_in) {
        navigate('/login')
        return
      }
      setUser(userResponse.data.user)
      
      // Obtener datos de la publicación
      const response = await getPublications()
      if (response.ok) {
        const pub = response.data.find(p => p.id_publicacion === parseInt(id))
        if (pub) {
          // Verificar que el usuario sea el propietario
          if (pub.id_usuario !== userResponse.data.user.id_usuario) {
            setError('No tienes permisos para editar esta publicación')
            return
          }
          
          setPublication(pub)
          setFormData({
            nombre: pub.nombre || '',
            descripcion_prenda: pub.descripcion_prenda || '',
            talla: pub.talla || '',
            estado: pub.estado || '',
            valor: pub.valor || '',
            tipo_publicacion: pub.tipo_publicacion || '',
            foto: null
          })
          if (pub.foto) {
            setPreviewImage(getImageUrl(pub.foto))
          }
        } else {
          setError('Publicación no encontrada')
        }
      } else {
        setError('Error al cargar la publicación')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({ ...prev, foto: file }))
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const submitData = new FormData()
      
      Object.keys(formData).forEach(key => {
        if (key === 'foto' && formData[key]) {
          console.log('[DEBUG] Agregando archivo foto:', formData[key].name || 'archivo sin nombre')
          submitData.append(key, formData[key])
        } else if (key !== 'foto' && formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key])
        }
      })

      const response = await updatePublication(id, submitData)
      
      if (response.ok) {
        // Si la respuesta incluye los datos actualizados, actualizar el preview
        if (response.data && response.data.publication && response.data.publication.foto) {
          setPreviewImage(getImageUrl(response.data.publication.foto, true)) // Cache busting
        }
        // Navegar a la página de detalles
        navigate(`/publications/${id}`)
      } else {
        setError(response.data?.error || 'Error al actualizar la publicación')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wine-medium"></div>
      </div>
    )
  }

  if (error && !publication) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-wine-darkest mb-8">Editar Publicación</h1>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-lg">
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-wine-darkest mb-2">
              Nombre de la prenda
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-wine-medium/20 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-wine-darkest mb-2">
              Descripción
            </label>
            <textarea
              name="descripcion_prenda"
              value={formData.descripcion_prenda}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-wine-medium/20 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-medium"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-wine-darkest mb-2">
                Talla
              </label>
              <select
                name="talla"
                value={formData.talla}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-wine-medium/20 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-medium"
              >
                <option value="">Seleccionar talla</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
                <option value="Única">Única</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-wine-darkest mb-2">
                Estado
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-wine-medium/20 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-medium"
              >
                <option value="">Seleccionar estado</option>
                <option value="Nuevo">Nuevo</option>
                <option value="Seminuevo">Seminuevo</option>
                <option value="Usado">Usado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-wine-darkest mb-2">
                Precio ($)
              </label>
              <input
                type="number"
                name="valor"
                value={formData.valor}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-wine-medium/20 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-wine-darkest mb-2">
                Tipo de publicación
              </label>
              <select
                name="tipo_publicacion"
                value={formData.tipo_publicacion}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-wine-medium/20 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-medium"
              >
                <option value="">Seleccionar tipo</option>
                <option value="Venta">Venta</option>
                <option value="Intercambio">Intercambio</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-wine-darkest mb-2">
              Imagen de la prenda
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-wine-medium/20 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-medium"
            />
            {previewImage && (
              <div className="mt-4">
                <img
                  src={previewImage}
                  alt="Vista previa"
                  className="w-48 h-48 object-cover rounded-lg shadow-md"
                />
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={saving}
              className={`flex-1 py-2 px-4 rounded-md text-white font-medium ${
                saving 
                  ? 'bg-wine-medium/50 cursor-not-allowed' 
                  : 'bg-wine-medium hover:bg-wine-dark focus:outline-none focus:ring-2 focus:ring-wine-medium'
              }`}
            >
              {saving ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  Guardando...
                </div>
              ) : (
                'Guardar Cambios'
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate(`/publications/${id}`)}
              className="flex-1 py-2 px-4 rounded-md border border-wine-medium text-wine-medium hover:bg-wine-lightest focus:outline-none focus:ring-2 focus:ring-wine-medium"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}