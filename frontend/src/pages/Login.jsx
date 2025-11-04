import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api'
import { Link } from 'react-router-dom'

export default function Login(){
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const submit = async (e)=>{
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try{
      const res = await login({ correo_electronico: email, contrasena: pass })
      if(res.ok && res.data && res.data.token){
        localStorage.setItem('token', res.data.token)
        navigate('/')
      } else if(res.ok && res.data && res.data.verification_required){
        // redirigir a verify y pasar el correo para mostrar sólo el input de código
        navigate('/verify', { state: { email: res.data.email || email, mode: 'auth' } })
      } else {
        setError((res.data && res.data.error) || 'Error')
      }
    }catch(err){
      setError('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-wine-lightest via-white to-wine-lightest flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
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
            StyleInfinite
          </h2>
          <p className="mt-2 text-sm text-wine-medium">
            Descubre tu estilo perfecto
          </p>
        </div>

        {/* Formulario con diseño mejorado */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-wine-medium/10 p-8">
          <form className="space-y-6" onSubmit={submit}>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-wine-darkest mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-wine-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="block w-full pl-10 pr-3 py-3 border border-wine-medium/30 rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-wine-medium focus:border-transparent
                           bg-white/70 backdrop-blur-sm text-wine-darkest placeholder-wine-medium/60
                           transition-all duration-200 hover:bg-white/90"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-wine-darkest mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-wine-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={pass}
                  onChange={e => setPass(e.target.value)}
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

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md 
                         shadow-sm text-sm font-medium text-white ${
                           isLoading 
                             ? 'bg-wine-darkest opacity-60 cursor-not-allowed' 
                             : 'bg-wine-darkest hover:bg-wine-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wine-darkest/50'
                         }`}
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    Iniciando sesión...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-wine-darkest hover:text-wine-medium">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="text-sm">
                <Link to="/register" className="font-medium text-wine-darkest hover:text-wine-medium">
                  Crear cuenta
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
