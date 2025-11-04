import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPublication } from '../api'

export default function CreatePublication() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    nombre: '',
    descripcion_prenda: '',
    talla: '',
    foto: null,
    fotoPreview: '',
    valor: '',
    descripcion: '',
    tipo_publicacion: 'Venta'
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0]
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona un archivo de imagen válido')
        return
      }
      
      // Guardar el archivo directamente
      setForm(prev => ({ ...prev, foto: file }))
      
      // Crear preview
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, fotoPreview: reader.result }))
        setError(null)
      }
      reader.onerror = () => setError('Error al previsualizar la imagen')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const response = await createPublication(form)
      if (response.ok) navigate('/profile')
      else setError(response.data?.error || 'Error al crear la publicación')
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 bg-wine-darkest/5">
          <h2 className="text-2xl font-semibold text-wine-darkest">Crear nueva publicación</h2>
          <p className="text-sm text-wine-dark mt-1">Describe la prenda y añade una foto para publicarla en StyleInfinite.</p>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-wine-dark">Nombre de la prenda</label>
              <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required className="mt-1 block w-full rounded-md border-wine-light shadow-sm focus:border-wine-medium focus:ring-wine-medium sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-wine-dark">Descripción de la prenda</label>
              <textarea name="descripcion_prenda" value={form.descripcion_prenda} onChange={handleChange} required rows={3} className="mt-1 block w-full rounded-md border-wine-light shadow-sm focus:border-wine-medium focus:ring-wine-medium sm:text-sm" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-wine-dark">Talla</label>
                <select name="talla" value={form.talla} onChange={handleChange} required className="mt-1 block w-full rounded-md border-wine-light shadow-sm focus:border-wine-medium focus:ring-wine-medium sm:text-sm">
                  <option value="">Selecciona una talla</option>
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-wine-dark">Valor (COP)</label>
                <input type="number" name="valor" value={form.valor} onChange={handleChange} required min="0" className="mt-1 block w-full rounded-md border-wine-light shadow-sm focus:border-wine-medium focus:ring-wine-medium sm:text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-wine-dark">Tipo de publicación</label>
              <select name="tipo_publicacion" value={form.tipo_publicacion} onChange={handleChange} required className="mt-1 block w-full rounded-md border-wine-light shadow-sm focus:border-wine-medium focus:ring-wine-medium sm:text-sm">
                <option value="Venta">Venta</option>
                <option value="Intercambio">Intercambio</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-wine-dark">Descripción adicional</label>
              <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={4} className="mt-1 block w-full rounded-md border-wine-light shadow-sm focus:border-wine-medium focus:ring-wine-medium sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-wine-dark">Foto de la prenda</label>
              <input type="file" accept="image/*" onChange={handleFileChange} required className="mt-1 block w-full text-sm text-wine-dark
                file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-wine-light file:text-wine-dark hover:file:bg-wine-lightest" />

              {form.fotoPreview && (
                <div className="mt-3 relative">
                  <div className="w-full h-48 bg-gray-50 rounded-lg overflow-hidden">
                    <img 
                      src={form.fotoPreview} 
                      alt="Preview" 
                      className="w-full h-full object-contain" 
                      onError={(e) => {
                        e.target.onerror = null;
                        setError('Error al mostrar la imagen. Verifica que sea un formato válido.');
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, foto: null, fotoPreview: '' }))}
                    className="absolute top-2 right-2 bg-wine-medium text-white rounded-full p-1 hover:bg-wine-dark"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 rounded-md border border-wine-light text-wine-dark bg-white hover:bg-wine-lightest">Cancelar</button>
              <button 
                type="submit" 
                disabled={loading} 
                className={`px-4 py-2 rounded-md text-white flex items-center ${
                  loading 
                    ? 'bg-wine-medium opacity-60 cursor-not-allowed' 
                    : 'bg-wine-medium hover:bg-wine-dark'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  'Crear publicación'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}