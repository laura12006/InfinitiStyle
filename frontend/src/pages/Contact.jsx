import React, { useState } from 'react'
import { sendContact } from '../api'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState({ loading: false, error: null, success: null })

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus({ loading: true, error: null, success: null })
    try {
      const payload = {
        name: form.name,
        email: form.email,
        subject: form.subject || 'Contacto desde sitio',
        message: form.message
      }
      const res = await sendContact(payload)
      if (res.ok) {
        setStatus({ loading: false, error: null, success: 'Mensaje enviado. Gracias.' })
        setForm({ name: '', email: '', subject: '', message: '' })
      } else {
        setStatus({ loading: false, error: res.data?.error || 'Error al enviar mensaje', success: null })
      }
    } catch (err) {
      setStatus({ loading: false, error: err.message || 'Error', success: null })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-wine-lightest via-white to-wine-lightest py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decoración de fondo - blobes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-wine-light/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-wine-medium/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      {/* Header con decoración */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <div className="inline-flex items-center justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-wine-medium/20 blur-xl rounded-full"></div>
            <div className="relative bg-gradient-to-br from-wine-medium to-wine-dark p-4 rounded-full">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-wine-darkest mb-3">
          ¿Tienes alguna pregunta?
        </h1>
        <p className="text-lg text-wine-dark/70 max-w-2xl mx-auto">
          Nos encantaría saber de ti. Envíanos un mensaje y nos pondremos en contacto lo antes posible.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna de información */}
          <div className="lg:col-span-1 space-y-6">
            {/* Tarjeta 1 */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-wine-medium/10 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-br from-wine-lightest to-wine-light/20 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-wine-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-wine-darkest mb-2">Correo Electrónico</h3>
              <p className="text-wine-dark/70 text-sm">styleInfinite90@gmail.com</p>
            </div>

            {/* Tarjeta 2 */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-wine-medium/10 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-br from-wine-lightest to-wine-light/20 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-wine-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-wine-darkest mb-2">Tiempo de Respuesta</h3>
              <p className="text-wine-dark/70 text-sm">Respuesta en 24-48 horas</p>
            </div>

            {/* Tarjeta 3 */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-wine-medium/10 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-br from-wine-lightest to-wine-light/20 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-wine-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-wine-darkest mb-2">Disponibilidad</h3>
              <p className="text-wine-dark/70 text-sm">Disponibles 24/7 en línea</p>
            </div>
          </div>

          {/* Columna del formulario */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8 border border-wine-medium/10">
              {/* Nombre */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-wine-darkest mb-3">
                  Nombre Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-wine-medium/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                    className="block w-full pl-12 pr-4 py-3 border border-wine-medium/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-medium focus:border-transparent bg-white/70 backdrop-blur-sm text-wine-darkest placeholder-wine-medium/60 transition-all duration-200 hover:bg-white/90"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-wine-darkest mb-3">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-wine-medium/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="tu@correo.com"
                    className="block w-full pl-12 pr-4 py-3 border border-wine-medium/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-medium focus:border-transparent bg-white/70 backdrop-blur-sm text-wine-darkest placeholder-wine-medium/60 transition-all duration-200 hover:bg-white/90"
                    required
                  />
                </div>
              </div>

              {/* Asunto */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-wine-darkest mb-3">
                  Asunto
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-wine-medium/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <input
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="¿Cuál es el tema?"
                    className="block w-full pl-12 pr-4 py-3 border border-wine-medium/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-medium focus:border-transparent bg-white/70 backdrop-blur-sm text-wine-darkest placeholder-wine-medium/60 transition-all duration-200 hover:bg-white/90"
                  />
                </div>
              </div>

              {/* Mensaje */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-wine-darkest mb-3">
                  Mensaje
                </label>
                <div className="relative">
                  <div className="absolute top-4 left-4 pointer-events-none">
                    <svg className="h-5 w-5 text-wine-medium/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Cuéntanos tu mensaje..."
                    rows={6}
                    className="block w-full pl-12 pr-4 py-3 border border-wine-medium/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-medium focus:border-transparent bg-white/70 backdrop-blur-sm text-wine-darkest placeholder-wine-medium/60 transition-all duration-200 hover:bg-white/90 resize-none"
                    required
                  />
                </div>
              </div>

              {/* Estados de mensaje */}
              {status.error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-700 font-medium">{status.error}</p>
                  </div>
                </div>
              )}

              {status.success && (
                <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-green-700 font-medium">{status.success}</p>
                  </div>
                </div>
              )}

              {/* Botón de envío */}
              <button
                type="submit"
                disabled={status.loading}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform flex items-center justify-center space-x-2 ${
                  status.loading
                    ? 'bg-gray-400 cursor-not-allowed opacity-60'
                    : 'bg-gradient-to-r from-wine-medium to-wine-dark hover:from-wine-dark hover:to-wine-darkest shadow-lg hover:shadow-xl hover:scale-105'
                }`}
              >
                {status.loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>Enviar Mensaje</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
