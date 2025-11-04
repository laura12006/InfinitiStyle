import React from 'react'

export default function TestStyles() {
  return (
    <div className="p-8 bg-wine-lightest min-h-screen">
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-wine-medium/10 mb-8">
        <div className="px-4 py-5 sm:px-6 bg-wine-darkest text-white">
          <h2 className="text-xl font-bold">Prueba de Estilos</h2>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-wine-darkest">Campo de texto</label>
              <input 
                type="text" 
                placeholder="Escribe algo..." 
                className="mt-1 block w-full rounded-md border-wine-medium/20 
                         shadow-sm focus:border-wine-darkest focus:ring-wine-darkest/20" 
              />
            </div>
            
            <div className="space-x-4">
              <button className="px-4 py-2 bg-wine-darkest text-white rounded-md 
                               hover:bg-wine-dark transition-colors duration-200">
                Botón Primario
              </button>
              <button className="px-4 py-2 bg-wine-medium text-white rounded-md 
                               hover:bg-wine-dark transition-colors duration-200">
                Botón Secundario
              </button>
            </div>

            <div className="space-x-2">
              <span className="px-2 py-1 text-xs font-semibold rounded-full 
                             bg-wine-darkest text-white">
                Badge Primario
              </span>
              <span className="px-2 py-1 text-xs font-semibold rounded-full 
                             bg-wine-medium text-white">
                Badge Secundario
              </span>
            </div>

            <div className="space-y-2">
              <div className="p-4 rounded-md bg-wine-light text-wine-dark">
                Este es un mensaje de éxito
              </div>
              <div className="p-4 rounded-md bg-wine-darkest/10 text-wine-dark">
                Este es un mensaje de error
              </div>
            </div>

            <div>
              <a href="#" className="text-wine-darkest hover:text-wine-medium 
                                   transition-colors duration-200">
                Este es un enlace
              </a>
            </div>
          </div>
        </div>
        <div className="px-4 py-4 sm:px-6 bg-wine-lightest border-t border-wine-medium/10">
          <p className="text-sm">Footer de la tarjeta</p>
        </div>
      </div>
    </div>
  )
}