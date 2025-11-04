import React, {useState} from 'react'
import { passwordSendCode, passwordChange } from '../api'
import { useNavigate } from 'react-router-dom'

export default function ForgotPassword(){
  const [email, setEmail] = useState('')
  const [step, setStep] = useState(1) // 1 = enviar correo, 2 = ingresar código + nueva contraseña
  const [code, setCode] = useState('')
  const [newPass, setNewPass] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const send = async (e)=>{
    e && e.preventDefault()
    setError('')
    setMessage('')
    setIsLoading(true)
    try {
      const res = await passwordSendCode({ correo_electronico: email })
      if(res.ok){
        // redirigir al componente Verify en modo 'password' para ingresar código y nueva contraseña
        navigate('/verify', { state: { email, mode: 'password' } })
      } else {
        setError((res.data && res.data.error) || 'Error')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  const change = async (e)=>{
    e && e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      setMessage('')
      // si el usuario no fue redirigido (por alguna razón), intentar cambiar aquí
      const res = await passwordChange({ correo_electronico: email, code, new_password: newPass })
      if(res.ok){
        setMessage('Contraseña cambiada. Ya puedes iniciar sesión.')
        setTimeout(()=>navigate('/login'), 1500)
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
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold tracking-tight text-wine-darkest">
          Recuperar contraseña
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-md sm:rounded-lg sm:px-10 border border-wine-medium/10">
          {step===1 ? (
            <form onSubmit={send} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-wine-darkest">
                  Correo electrónico
                </label>
                <div className="mt-1">
                  <input 
                    id="email"
                    type="email" 
                    value={email} 
                    onChange={e=>setEmail(e.target.value)} 
                    required 
                    className="mt-1 block w-full rounded-md border-wine-medium/20 shadow-sm 
                             focus:border-wine-darkest focus:ring-wine-darkest/20 
                             bg-white text-wine-darkest"
                  />
                </div>
              </div>
              {message && <div className="bg-green-50 text-green-700 p-3 rounded">{message}</div>}
              {error && <div className="bg-red-50 text-red-700 p-3 rounded">{error}</div>}
              <button 
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isLoading 
                    ? 'bg-wine-darkest opacity-60 cursor-not-allowed' 
                    : 'bg-wine-darkest hover:bg-wine-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wine-darkest'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    Enviando...
                  </>
                ) : (
                  'Enviar código'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={change} className="space-y-6">
              <div>
                <label htmlFor="email2" className="block text-sm font-medium text-wine-darkest">
                  Correo electrónico
                </label>
                <div className="mt-1">
                  <input 
                    id="email2"
                    type="email" 
                    value={email} 
                    onChange={e=>setEmail(e.target.value)} 
                    required 
                    className="mt-1 block w-full rounded-md border-wine-medium/20 shadow-sm 
                             focus:border-wine-darkest focus:ring-wine-darkest/20 
                             bg-white text-wine-darkest"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-wine-darkest">
                  Código de verificación
                </label>
                <div className="mt-1">
                  <input 
                    id="code"
                    type="text" 
                    value={code} 
                    onChange={e=>setCode(e.target.value)} 
                    required 
                    className="mt-1 block w-full rounded-md border-wine-medium/20 shadow-sm 
                             focus:border-wine-darkest focus:ring-wine-darkest/20 
                             bg-white text-wine-darkest"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="newPass" className="block text-sm font-medium text-wine-darkest">
                  Nueva contraseña
                </label>
                <div className="mt-1 relative">
                  <input 
                    id="newPass"
                    type={showPassword ? "text" : "password"} 
                    value={newPass} 
                    onChange={e=>setNewPass(e.target.value)} 
                    required 
                    className="mt-1 block w-full pr-10 rounded-md border-wine-medium/20 shadow-sm 
                             focus:border-wine-darkest focus:ring-wine-darkest/20 
                             bg-white text-wine-darkest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              {message && <div className="bg-green-50 text-green-700 p-3 rounded">{message}</div>}
              {error && <div className="bg-red-50 text-red-700 p-3 rounded">{error}</div>}
              <button 
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isLoading 
                    ? 'bg-wine-darkest opacity-60 cursor-not-allowed' 
                    : 'bg-wine-darkest hover:bg-wine-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wine-darkest'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    Cambiando...
                  </>
                ) : (
                  'Cambiar contraseña'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
