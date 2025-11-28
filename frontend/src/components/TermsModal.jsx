import React, { useEffect } from 'react'

export default function TermsModal({ open, onClose, onAccept }){
  useEffect(() => {
    if (!open) return
    function onKey(e){
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    // Lock scroll
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if(!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative max-w-3xl w-full mx-4 bg-white rounded-2xl shadow-2xl p-6 z-10">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold text-wine-darkest">Términos y Condiciones</h3>
          <button onClick={onClose} aria-label="Cerrar" className="text-wine-medium hover:text-wine-dark">✕</button>
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
          <button onClick={() => { onAccept(); onClose() }} className="px-4 py-2 bg-wine-medium text-white rounded-lg">Aceptar y Cerrar</button>
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">Cerrar</button>
        </div>
      </div>
    </div>
  )
}
