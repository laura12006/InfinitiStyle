import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { me, updateProfile, changePasswordAuth, getPublications, deletePublication, getImageUrl } from '../api'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [publications, setPublications] = useState([])
  const [loadingPublications, setLoadingPublications] = useState(false)
  const [form, setForm] = useState({})
  const [message, setMessage] = useState('')
  const [oldPass, setOldPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [error, setError] = useState('')
  const [previewImage, setPreviewImage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [ageError, setAgeError] = useState('')
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  // Función para calcular la edad
  const calculateAge = (birthDate) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  // Función para validar la fecha en tiempo real
  const handleDateChange = (e) => {
    const selectedDate = e.target.value
    setForm({...form, fecha_nacimiento: selectedDate})
    
    if (selectedDate) {
      const age = calculateAge(selectedDate)
      if (age < 18) {
        setAgeError(`Tienes ${age} años. Debes ser mayor de 18 años.`)
      } else {
        setAgeError('')
      }
    } else {
      setAgeError('')
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const res = await me()
      if (res.ok && res.data && res.data.logged_in) {
        const userData = res.data.user
        setUser(userData)
        
        // Formatear la fecha para el input de tipo date (YYYY-MM-DD)
        const formData = { ...userData }
        if (formData.fecha_nacimiento) {
          const date = new Date(formData.fecha_nacimiento)
          if (!isNaN(date.getTime())) {
            formData.fecha_nacimiento = date.toISOString().split('T')[0]
          }
        }
        
        setForm(formData)
        
        // Validar edad al cargar
        if (formData.fecha_nacimiento) {
          const age = calculateAge(formData.fecha_nacimiento)
          if (age < 18) {
            setAgeError(`Tienes ${age} años. Debes ser mayor de 18 años.`)
          }
        }
        
        await loadUserPublications(userData)
      }
    } catch (err) {
      setError('Error cargando perfil')
    } finally {
      setLoading(false)
    }
  }

  const loadUserPublications = async (usr) => {
    try {
      setLoadingPublications(true)
      const res = await getPublications()
      if (res.ok) {
        const userPubs = res.data.filter(pub => pub.id_usuario === (usr ? usr.id_usuario : user.id_usuario))
        console.log('Publicaciones del usuario:', userPubs)
        // Formatear las URLs de las imágenes antes de guardar
        const pubsWithFormattedUrls = userPubs.map(pub => ({
          ...pub,
          foto: getImageUrl(pub.foto)
        }))
        setPublications(pubsWithFormattedUrls)
      } else {
        console.error('Error en respuesta:', res)
      }
    } catch (err) {
      console.error('Error cargando publicaciones:', err)
      setError('Error cargando publicaciones')
    } finally {
      setLoadingPublications(false)
    }
  }

  const save = async () => {
    setIsSaving(true)
    setError('')
    setMessage('')
    
    // Validar edad mínima de 18 años
    if (form.fecha_nacimiento) {
      const age = calculateAge(form.fecha_nacimiento)
      if (age < 18) {
        setError('Debes ser mayor de 18 años')
        setIsSaving(false)
        return
      }
    }
    
    // Formatear la fecha correctamente para MySQL (YYYY-MM-DD)
    let fechaNacimiento = form.fecha_nacimiento
    if (fechaNacimiento) {
      // Si la fecha está en formato Date object o string, convertirla a YYYY-MM-DD
      const date = new Date(fechaNacimiento)
      if (!isNaN(date.getTime())) {
        fechaNacimiento = date.toISOString().split('T')[0] // YYYY-MM-DD
      }
    }

    const payload = {
      '1_nombre': form['1_nombre'],
      '2_nombre': form['2_nombre'],
      '1_apellido': form['1_apellido'],
      '2_apellido': form['2_apellido'],
      talla: form.talla,
      fecha_nacimiento: fechaNacimiento,
      foto: previewImage || form.foto // Usar la imagen en base64 si hay una nueva, sino la existente
    }
    
    console.log('Enviando payload:', payload) // Para debug

    try {
      const res = await updateProfile(payload)
      if (res.ok) {
        setMessage('Perfil actualizado correctamente')
        // Actualizar el usuario con los nuevos datos
        setUser({...user, ...payload})
        // Limpiar la vista previa
        setPreviewImage('')
        // Recargar perfil para obtener los datos actualizados
        await loadProfile()
      } else {
        console.error('Error del servidor:', res.data)
        setMessage((res.data && res.data.error) || 'Error actualizando perfil')
      }
    } catch (err) {
      console.error('Error actualizando perfil:', err)
      setMessage('Error de conexión')
    } finally {
      setIsSaving(false)
    }
  }

  const compressImage = (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo aspect ratio
        let { width, height } = img
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxWidth) {
            width = (width * maxWidth) / height
            height = maxWidth
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        // Dibujar imagen comprimida
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convertir a base64 con compresión
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedDataUrl)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona un archivo de imagen válido')
        return
      }
      
      // Validar tamaño (máximo 10MB para el archivo original)
      if (file.size > 10 * 1024 * 1024) {
        setError('La imagen no debe superar los 10MB')
        return
      }

      try {
        // Comprimir imagen antes de convertir a base64
        const compressedImage = await compressImage(file, 800, 0.8)
        setPreviewImage(compressedImage)
        setError('') // Limpiar errores previos
      } catch (error) {
        console.error('Error comprimiendo imagen:', error)
        setError('Error procesando la imagen')
      }
    }
  }

  const changePass = async () => {
    const res = await changePasswordAuth({ old_password: oldPass, new_password: newPass })
    if (res.ok) {
      setMessage('Contraseña cambiada')
      setOldPass('')
      setNewPass('')
    } else {
      setMessage((res.data && res.data.error) || 'Error')
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  if (!user) return <div className="min-h-screen flex items-center justify-center">No autenticado</div>

  const handleDeletePublication = async (pubId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta publicación?')) {
      try {
        const res = await deletePublication(pubId)
        if (res.ok) {
          await loadUserPublications()
          setMessage('Publicación eliminada exitosamente')
        } else {
          setError('Error al eliminar la publicación')
        }
      } catch (err) {
        setError('Error de conexión')
      }
    }
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded mb-6">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Perfil (columna izquierda) */}
          <aside className="lg:col-span-1 bg-white rounded-lg shadow p-6">
            <div className="flex flex-col items-center text-center">
              {previewImage || user.foto ? (
                <img src={previewImage || user.foto} alt="avatar" className="w-32 h-32 rounded-full object-cover mb-4" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-wine-medium text-white flex items-center justify-center mb-4 text-2xl font-bold">{(user['1_nombre']||'U').charAt(0)}</div>
              )}
              <h3 className="text-xl font-semibold text-wine-darkest">{user['1_nombre']} {user['1_apellido']}</h3>
              <p className="text-sm text-wine-dark mt-1">{user.correo_electronico}</p>
              <div className="mt-4 w-full">
                <div className="flex justify-between text-sm text-wine-dark">
                  <span className="font-medium">Talla</span>
                  <span>{user.talla || '-'}</span>
                </div>
                <div className="flex justify-between text-sm text-wine-dark mt-2">
                  <span className="font-medium">Nacimiento</span>
                  <span>{user.fecha_nacimiento ? new Date(user.fecha_nacimiento).toLocaleDateString() : '-'}</span>
                </div>
              </div>
              <div className="mt-6 w-full">
                <Link to="/publications/create" className="block text-center bg-wine-medium text-white py-2 rounded-md hover:bg-wine-dark">Crear publicación</Link>
              </div>
            </div>
          </aside>

          {/* Formulario y contraseña (columna central) */}
          <main className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold text-wine-darkest mb-4">Editar Perfil</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-wine-dark">Primer nombre</label>
                  <input type="text" value={form['1_nombre']||''} onChange={e => setForm({...form, '1_nombre': e.target.value})} className="mt-1 block w-full rounded-md border-wine-light shadow-sm focus:border-wine-medium focus:ring-wine-medium sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-wine-dark">Segundo nombre</label>
                  <input type="text" value={form['2_nombre']||''} onChange={e => setForm({...form, '2_nombre': e.target.value})} className="mt-1 block w-full rounded-md border-wine-light shadow-sm focus:border-wine-medium focus:ring-wine-medium sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-wine-dark">Primer apellido</label>
                  <input type="text" value={form['1_apellido']||''} onChange={e => setForm({...form, '1_apellido': e.target.value})} className="mt-1 block w-full rounded-md border-wine-light shadow-sm focus:border-wine-medium focus:ring-wine-medium sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-wine-dark">Segundo apellido</label>
                  <input type="text" value={form['2_apellido']||''} onChange={e => setForm({...form, '2_apellido': e.target.value})} className="mt-1 block w-full rounded-md border-wine-light shadow-sm focus:border-wine-medium focus:ring-wine-medium sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-wine-dark">Talla</label>
                  <select value={form.talla||''} onChange={e => setForm({...form, talla: e.target.value})} className="mt-1 block w-full rounded-md border-wine-light shadow-sm focus:border-wine-medium focus:ring-wine-medium sm:text-sm">
                    <option value="">Seleccionar talla</option>
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-wine-dark">Fecha de nacimiento</label>
                  <input 
                    type="date" 
                    value={form.fecha_nacimiento||''} 
                    onChange={handleDateChange}
                    className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                      ageError 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-wine-light focus:border-wine-medium focus:ring-wine-medium'
                    }`}
                  />
                  {ageError && (
                    <p className="mt-1 text-sm text-red-600">{ageError}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-wine-dark">Foto de perfil</label>
                  <div className="mt-1 flex items-center space-x-4">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange}
                      className="block w-full text-sm text-wine-dark file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-wine-medium file:text-white hover:file:bg-wine-dark"
                    />
                    {previewImage && (
                      <button 
                        type="button" 
                        onClick={() => setPreviewImage('')}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Formatos permitidos: JPG, PNG, GIF. Máximo 5MB.</p>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={save}
                  disabled={isSaving || ageError}
                  className={`flex items-center justify-center bg-wine-medium text-white px-4 py-2 rounded-md ${
                    (isSaving || ageError) ? 'opacity-60 cursor-not-allowed' : 'hover:bg-wine-dark'
                  }`}
                  aria-busy={isSaving}
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                      Guardando...
                    </>
                  ) : (
                    'Guardar cambios'
                  )}
                </button>

                <button
                  onClick={() => { setForm(user); setMessage(''); setPreviewImage(''); }}
                  disabled={isSaving}
                  className={`bg-gray-100 text-wine-dark px-4 py-2 rounded-md ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  Revertir
                </button>
              </div>
              {message && <div className="mt-3 text-sm text-wine-dark">{message}</div>}
            </section>

            <section className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold text-wine-darkest mb-4">Cambiar contraseña</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-wine-dark">Contraseña actual</label>
                  <div className="relative">
                    <input 
                      type={showOldPassword ? "text" : "password"} 
                      value={oldPass} 
                      onChange={e => setOldPass(e.target.value)} 
                      className="mt-1 block w-full rounded-md border-wine-light shadow-sm focus:border-wine-medium focus:ring-wine-medium sm:text-sm pr-10" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-wine-medium hover:text-wine-dark"
                    >
                      {showOldPassword ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L15 15M9.878 9.878L6.757 6.757M15 15l3.121 3.121M15 15l-4.121-4.121" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-wine-dark">Nueva contraseña</label>
                  <div className="relative">
                    <input 
                      type={showNewPassword ? "text" : "password"} 
                      value={newPass} 
                      onChange={e => setNewPass(e.target.value)} 
                      className="mt-1 block w-full rounded-md border-wine-light shadow-sm focus:border-wine-medium focus:ring-wine-medium sm:text-sm pr-10" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-wine-medium hover:text-wine-dark"
                    >
                      {showNewPassword ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L15 15M9.878 9.878L6.757 6.757M15 15l3.121 3.121M15 15l-4.121-4.121" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <button onClick={changePass} className="bg-wine-medium text-white px-4 py-2 rounded-md hover:bg-wine-dark">Cambiar contraseña</button>
              </div>
            </section>
          </main>
        </div>

        {/* Publicaciones del usuario */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-wine-darkest">Mis Publicaciones</h2>
            <Link to="/publications/create" className="bg-wine-medium text-white py-2 px-4 rounded-md hover:bg-wine-dark">Nueva Publicación</Link>
          </div>

          {loadingPublications ? (
            <div className="text-center">Cargando publicaciones...</div>
          ) : publications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publications.map(pub => (
                <div key={pub.id_publicacion} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative h-48 bg-gray-100">
                    <img 
                      src={getImageUrl(pub.foto)} 
                      alt={pub.nombre} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log('Error cargando imagen:', pub.foto);
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x300?text=No+disponible';
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`px-3 py-1 text-sm rounded-full ${
                        pub.tipo_publicacion === 'Venta' 
                          ? 'bg-wine-lightest text-wine-darkest' 
                          : 'bg-wine-lightest text-wine-darkest'
                      }`}>
                        {pub.tipo_publicacion}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-wine-darkest">{pub.nombre}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{pub.descripcion_prenda}</p>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-wine-medium font-semibold">${pub.valor}</span>
                      <span className="text-sm text-gray-500">
                        {pub.estado || 'Disponible'}
                      </span>
                    </div>
                    <div className="mt-4 space-x-2 flex">
                      <Link
                        to={`/publications/${pub.id_publicacion}/edit`}
                        className="flex-1 bg-wine-medium text-white px-4 py-2 rounded-md hover:bg-wine-dark text-center text-sm"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDeletePublication(pub.id_publicacion)}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">No tienes publicaciones aún</div>
          )}
        </div>
      </div>
    </div>
  )
}