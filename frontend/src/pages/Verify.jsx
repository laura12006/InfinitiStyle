import React, { useState } from 'react'
import { verify, passwordChange } from '../api'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Verify() {
  const location = useLocation()
  const state = location.state || {}
  const initialEmail = state.email || ''
  const mode = state.mode || 'auth' // 'auth' para registro/login, 'password' para cambiar contraseña
  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [newPass, setNewPass] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  // Manejo para código por input individual (6 dígitos)
  const handleCodeChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newCode = [...code]
      newCode[index] = value
      setCode(newCode)
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`)
        if (nextInput) nextInput.focus()
      }
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')

    const codeStr = code.join('')

    if (!email) {
      setError('Correo requerido')
      return
    }
    if (codeStr.length !== 6) {
      setError('Código de 6 dígitos requerido')
      return
    }

    setIsLoading(true)
    try {
      if (mode === 'password') {
        if (!newPass) {
          setError('Nueva contraseña requerida')
          return
        }
        const res = await passwordChange({ correo_electronico: email, code: codeStr, new_password: newPass })
        if (res.ok) {
          navigate('/login')
        } else {
          setError((res.data && res.data.error) || 'Error')
        }
        return
      }

      const res = await verify({ correo_electronico: email, code: codeStr })
      if (res.ok) {
        if (res.data && res.data.token) localStorage.setItem('token', res.data.token)
        navigate('/')
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
        <div className="flex justify-center mb-6">
          <img
            src="/Logostyleinfinte.jpg"
            alt="Verificación de correo"
            className="w-20 h-20 rounded-full object-cover"
          />
        </div>

        <h2 className="text-center text-3xl font-bold tracking-tight text-wine-darkest">
          Verifica tu dirección de correo
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Por favor, ingresa el código de 6 dígitos enviado a tu correo para verificar tu cuenta.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-md sm:rounded-lg sm:px-10 border border-wine-medium/10">
          {(mode === 'password' || !initialEmail) && (
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-wine-darkest">
                Correo electrónico
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-wine-medium/20 shadow-sm 
                           focus:border-wine-darkest focus:ring-wine-darkest/20 
                           bg-white text-wine-darkest"
                  placeholder="tucorreo@ejemplo.com"
                />
              </div>
            </div>
          )}

          <form onSubmit={submit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-wine-darkest mb-4">
                Código de verificación
              </label>
              <div className="flex justify-center space-x-3 mb-6">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    id={`code-${i}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleCodeChange(i, e.target.value)}
                    className="w-12 h-12 text-center border-2 border-wine-medium/20 rounded-lg text-xl font-bold text-wine-darkest focus:border-wine-darkest focus:outline-none focus:ring-2 focus:ring-wine-darkest/20"
                  />
                ))}
              </div>
            </div>

            {mode === 'password' && (
              <div>
                <label htmlFor="newPass" className="block text-sm font-medium text-wine-darkest">
                  Nueva contraseña
                </label>
                <div className="mt-1 relative">
                  <input
                    id="newPass"
                    type={showPassword ? "text" : "password"}
                    value={newPass}
                    onChange={e => setNewPass(e.target.value)}
                    className="mt-1 block w-full pr-10 rounded-md border-wine-medium/20 shadow-sm 
                             focus:border-wine-darkest focus:ring-wine-darkest/20 
                             bg-white text-wine-darkest"
                    placeholder="Nueva contraseña"
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
            )}

            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded">
                {error}
              </div>
            )}

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
                  Verificando...
                </>
              ) : (
                mode === 'password' ? 'Cambiar contraseña' : 'Verificar correo'
              )}
            </button>
          </form>

          <div className="mt-6">
            <button 
              onClick={() => alert('Código reenviado')}
              className="w-full text-center text-sm text-wine-medium hover:text-wine-darkest"
            >
              Reenviar código
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
