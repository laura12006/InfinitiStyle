import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../api'
import TermsModal from '../components/TermsModal'

export default function Register(){
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [first, setFirst] = useState('')
  const [secondName, setSecondName] = useState('')
  const [last, setLast] = useState('')
  const [secondLast, setSecondLast] = useState('')
  const [talla, setTalla] = useState('')
  const [fecha, setFecha] = useState('')
  const [foto, setFoto] = useState('')
  const [error, setError] = useState(null)
  const [ageError, setAgeError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const navigate = useNavigate()

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
    setFecha(selectedDate)
    
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

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    
    // Validar edad mínima de 18 años
    if (fecha) {
      const age = calculateAge(fecha)
      if (age < 18) {
        setError('Debes ser mayor de 18 años para registrarte')
        return
      }
    }

    // Validar aceptación de términos
    if (!acceptedTerms) {
      setError('Debes aceptar los términos y condiciones para registrarte')
      return
    }
    
    setIsLoading(true)
    try {
      const payload = {
        correo_electronico: email,
        contrasena: pass,
        '1_nombre': first,
        '2_nombre': secondName,
        '1_apellido': last,
        '2_apellido': secondLast,
        talla,
        fecha_nacimiento: fecha,
        foto,
        accepted_terms: acceptedTerms
      }
      const res = await register(payload)
      if (res.ok && res.data && res.data.verification_required) {
        // Redirigir a verificación con el email
        navigate('/verify', { state: { email: res.data.email, mode: 'auth' } })
      } else if (res.ok) {
        // Por si acaso el backend cambia y no requiere verificación
        navigate('/login')
      } else {
        setError((res.data && res.data.error) || 'Error')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-wine-lightest via-white to-wine-lightest flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        {/* Logo y título mejorado */}
        <div className="text-center">
          <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg bg-white overflow-hidden">
              <img 
                src="/Public/Logostyleinfinte.jpg" 
                alt="StyleInfinite Logo" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-full h-full bg-gradient-to-br from-wine-medium to-wine-dark rounded-full flex items-center justify-center text-white text-xl font-bold" style={{display: 'none'}}>
                SI
              </div>
            </div>
            <div className="absolute inset-0 bg-wine-light/20 rounded-full blur-sm animate-pulse"></div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-wine-darkest">
            Únete a StyleInfinite
          </h2>
          <p className="mt-2 text-sm text-wine-medium">
            Crea tu cuenta y comienza tu aventura de estilo
          </p>
        </div>

        {/* Formulario con diseño mejorado */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-wine-medium/10 p-8">
          <form className="space-y-6" onSubmit={submit}>
            {/* Nombres */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-wine-darkest mb-2">
                  Primer Nombre *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-wine-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={first}
                    onChange={e => setFirst(e.target.value)}
                    required
                    placeholder="Juan"
                    className="block w-full pl-10 pr-3 py-3 border border-wine-medium/30 rounded-xl 
                             focus:outline-none focus:ring-2 focus:ring-wine-medium focus:border-transparent
                             bg-white/70 backdrop-blur-sm text-wine-darkest placeholder-wine-medium/60
                             transition-all duration-200 hover:bg-white/90"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-wine-darkest mb-2">
                  Segundo Nombre
                </label>
                <input
                  type="text"
                  value={secondName}
                  onChange={e => setSecondName(e.target.value)}
                  placeholder="Carlos (opcional)"
                  className="block w-full px-3 py-3 border border-wine-medium/30 rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-wine-medium focus:border-transparent
                           bg-white/70 backdrop-blur-sm text-wine-darkest placeholder-wine-medium/60
                           transition-all duration-200 hover:bg-white/90"
                />
              </div>
            </div>

            {/* Apellidos */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-wine-darkest mb-2">
                  Primer Apellido *
                </label>
                <input
                  type="text"
                  value={last}
                  onChange={e => setLast(e.target.value)}
                  required
                  placeholder="Pérez"
                  className="block w-full px-3 py-3 border border-wine-medium/30 rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-wine-medium focus:border-transparent
                           bg-white/70 backdrop-blur-sm text-wine-darkest placeholder-wine-medium/60
                           transition-all duration-200 hover:bg-white/90"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-wine-darkest mb-2">
                  Segundo Apellido
                </label>
                <input
                  type="text"
                  value={secondLast}
                  onChange={e => setSecondLast(e.target.value)}
                  placeholder="García (opcional)"
                  className="block w-full px-3 py-3 border border-wine-medium/30 rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-wine-medium focus:border-transparent
                           bg-white/70 backdrop-blur-sm text-wine-darkest placeholder-wine-medium/60
                           transition-all duration-200 hover:bg-white/90"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-wine-darkest mb-2">
                Correo Electrónico *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-wine-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="tu@correo.com"
                  className="block w-full pl-10 pr-3 py-3 border border-wine-medium/30 rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-wine-medium focus:border-transparent
                           bg-white/70 backdrop-blur-sm text-wine-darkest placeholder-wine-medium/60
                           transition-all duration-200 hover:bg-white/90"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-semibold text-wine-darkest mb-2">
                Contraseña *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-wine-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-12 py-3 border border-wine-medium/30 rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-wine-medium focus:border-transparent
                           bg-white/70 backdrop-blur-sm text-wine-darkest placeholder-wine-medium/60
                           transition-all duration-200 hover:bg-white/90"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-wine-lightest/50 rounded-r-xl transition-colors duration-200"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-wine-medium hover:text-wine-dark transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-wine-medium hover:text-wine-dark transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Información adicional */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-wine-darkest mb-2">
                  Talla
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-wine-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10l1 16H6L7 4z" />
                    </svg>
                  </div>
                  <select
                    value={talla}
                    onChange={e => setTalla(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-wine-medium/30 rounded-xl 
                             focus:outline-none focus:ring-2 focus:ring-wine-medium focus:border-transparent
                             bg-white/70 backdrop-blur-sm text-wine-darkest
                             transition-all duration-200 hover:bg-white/90"
                  >
                    <option value="">Selecciona tu talla</option>
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-wine-darkest mb-2">
                  Fecha de Nacimiento *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-wine-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="date"
                    value={fecha}
                    onChange={handleDateChange}
                    required
                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl 
                             focus:outline-none focus:ring-2 focus:ring-wine-medium focus:border-transparent
                             bg-white/70 backdrop-blur-sm text-wine-darkest
                             transition-all duration-200 hover:bg-white/90 ${
                      ageError 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-wine-medium/30'
                    }`}
                  />
                </div>
                {ageError && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {ageError}
                  </p>
                )}
              </div>
            </div>

            {/* Mensajes de error */}
            {error && (
              <div className="rounded-xl bg-gradient-to-r from-red-50 to-red-100 border border-red-200 p-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-red-700 font-medium">
                    {error}
                  </div>
                </div>
              </div>
            )}

            {/* Términos y condiciones */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <label className="inline-flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="h-4 w-4 rounded border-wine-medium/30 text-wine-medium focus:ring-wine-medium"
                      aria-required="true"
                    />
                    <span className="text-sm text-wine-darkest">He leído y acepto los <button type="button" onClick={() => setShowTermsModal(true)} className="text-wine-medium underline ml-1">términos y condiciones</button></span>
                  </label>
                </div>
              <div className="text-xs text-wine-medium">Es necesario aceptar para crear cuenta</div>
            </div>

            {/* Botón de registro */}
            <div>
              <button
                type="submit"
                disabled={ageError || isLoading || !acceptedTerms}
                className={`w-full flex justify-center items-center py-3 px-4 rounded-xl font-semibold text-white
                         transition-all duration-300 transform ${
                  (ageError || isLoading)
                    ? 'bg-gray-400 cursor-not-allowed opacity-60' 
                    : (!acceptedTerms ? 'bg-gray-400 cursor-not-allowed opacity-60' : 'bg-gradient-to-r from-wine-medium to-wine-dark hover:from-wine-dark hover:to-wine-darkest hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-wine-medium focus:ring-offset-2')
                }`}
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Crear Cuenta
                  </>
                )}
              </button>
            </div>

            {/* Modal (componente) */}
            <TermsModal open={showTermsModal} onClose={() => setShowTermsModal(false)} onAccept={() => setAcceptedTerms(true)} />

            {/* Separador */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-wine-medium/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-wine-medium">¿Ya tienes cuenta?</span>
              </div>
            </div>

            {/* Enlace al login */}
            <div className="text-center">
              <Link 
                to="/login" 
                className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl border border-wine-medium/30 text-wine-medium hover:text-wine-dark hover:bg-wine-lightest/30 transition-all duration-200 font-medium"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Iniciar Sesión
              </Link>
            </div>
          </form>

          {/* Modal de Términos y Condiciones */}
          {showTermsModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowTermsModal(false)}></div>
              <div className="relative max-w-3xl w-full mx-4 bg-white rounded-2xl shadow-2xl p-6 z-10">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-bold text-wine-darkest">Términos y Condiciones</h3>
                  <button onClick={() => setShowTermsModal(false)} className="text-wine-medium hover:text-wine-dark">Cerrar</button>
                </div>
                <div className="mt-4 max-h-72 overflow-auto text-sm text-wine-dark/80 space-y-3">
                  <p><strong>1. Aceptación</strong></p>
                  <p>Al crear una cuenta aceptas estos términos y condiciones. Lee cuidadosamente la información antes de continuar.</p>
                  <p><strong>2. Uso del servicio</strong></p>
                  <p>StyleInfinite es una plataforma para la publicación y venta/intercambio de prendas. Eres responsable del contenido que publiques y de cumplir la legislación aplicable.</p>
                  <p><strong>3. Privacidad</strong></p>
                  <p>Tu información será tratada de acuerdo con nuestra política de privacidad. No compartiremos tus datos sin tu consentimiento salvo obligaciones legales.</p>
                  <p><strong>4. Propiedad intelectual</strong></p>
                  <p>Los usuarios conservan derechos sobre sus publicaciones, pero nos concedes una licencia para mostrar y distribuir el contenido dentro del servicio.</p>
                  <p><strong>5. Limitación de responsabilidad</strong></p>
                  <p>No nos hacemos responsables por disputas entre usuarios ni por la calidad de los bienes. Recomendamos comunicación clara y pruebas en transacciones.</p>
                  <p><strong>6. Contacto</strong></p>
                  <p>Para dudas o reclamos, utiliza el formulario de contacto en el sitio.</p>
                  <p className="text-xs text-wine-medium">(Texto de ejemplo. Reemplaza por tus términos legales completos.)</p>
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                  <button onClick={() => { setAcceptedTerms(true); setShowTermsModal(false); }} className="px-4 py-2 bg-wine-medium text-white rounded-lg">Aceptar y Cerrar</button>
                  <button onClick={() => setShowTermsModal(false)} className="px-4 py-2 border rounded-lg">Cerrar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}