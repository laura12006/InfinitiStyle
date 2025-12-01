import React, { useState } from 'react';
import { initiateTransaction } from '../api';

export default function BuyButton({ publication, onTransactionStart }) {
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBuyClick = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Debes iniciar sesión para realizar esta acción');
      return;
    }
    
    if (publication.tipo_publicacion === 'Intercambio') {
      handleProposeExchange();
    } else {
      setShowModal(true);
    }
  };

  const handleProposeExchange = () => {
    // Para intercambios, abrimos el modal con mensaje específico
    setMessage(''); // Limpiar mensaje previo
    setShowModal(true);
  };

  const handleConfirmPurchase = async (e) => {
    e.preventDefault();
    
    // Validar que se incluya un mensaje para intercambios
    if (publication.tipo_publicacion === 'Intercambio' && !message.trim()) {
      alert('Por favor, describe qué quieres intercambiar');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await initiateTransaction(publication.id_publicacion, message);
      if (response.ok) {
        setShowModal(false);
        setMessage('');
        onTransactionStart && onTransactionStart(response.data.transaction_id);
        
        if (publication.tipo_publicacion === 'Intercambio') {
          alert('¡Propuesta de intercambio enviada! El propietario recibirá tu mensaje y podrán coordinar el intercambio.');
        } else {
          alert('¡Compra iniciada! Ahora puedes contactar al vendedor para coordinar el pago.');
        }
      } else {
        alert(response.data?.error || 'Error al procesar la solicitud');
      }
    } catch (error) {
      console.error('Error starting transaction:', error);
      alert('Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const openChatWithOwner = () => {
    try {
      const ownerId = publication?.id_usuario;
      if (!ownerId) {
        alert('No se pudo obtener el ID del propietario. Intenta nuevamente.');
        return;
      }
      
      // Obtener nombre del propietario desde varios campos posibles
      let ownerName = 'Vendedor';
      if (publication['1_nombre'] && publication['1_apellido']) {
        ownerName = `${publication['1_nombre']} ${publication['1_apellido']}`.trim();
      } else if (publication['1_nombre']) {
        ownerName = publication['1_nombre'];
      } else if (publication.username) {
        ownerName = publication.username;
      }
      
      const defaultMsg = `Hola, me interesa intercambiar por "${publication.nombre}". ¿Te interesa mi prenda?`;
      
      console.log('[Chat Debug]', { ownerId, ownerName, message: defaultMsg });
      
      window.dispatchEvent(new CustomEvent('openChat', { 
        detail: { 
          other_user_id: ownerId, 
          other_user_name: ownerName, 
          message: defaultMsg 
        } 
      }));
      
      // Cerrar modal para enfocarse en el chat
      setShowModal(false);
    } catch (err) {
      console.error('Error opening chat:', err);
      alert('No se pudo abrir el chat. Intenta nuevamente.');
    }
  };

  if (publication.tipo_publicacion === 'Intercambio') {
    return null; // No mostrar nada para intercambios en la página de detalle
  }

  return (
    <>
      <button
        onClick={handleBuyClick}
        className="w-full bg-wine-medium text-white py-3 px-6 rounded-lg hover:bg-wine-dark transition-colors font-semibold flex items-center justify-center space-x-2 shadow-lg"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6.5-5v5a2 2 0 01-2 2H9a2 2 0 01-2-2v-5m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
        </svg>
        <span>Comprar Ahora - ${publication.valor?.toLocaleString()}</span>
      </button>

      {/* Modal de confirmación */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" 
          style={{ zIndex: 9999 }}
        >
          <div 
            className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl border border-gray-200" 
            style={{ zIndex: 10000 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-wine-darkest">
                {publication.tipo_publicacion === 'Intercambio' ? 'Proponer Intercambio' : 'Confirmar Compra'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <div className="bg-wine-lightest p-4 rounded-lg mb-4">
                <h4 className="font-medium text-wine-darkest">{publication.nombre}</h4>
                {publication.tipo_publicacion === 'Intercambio' ? (
                  <div>
                    <p className="text-wine-medium font-semibold">Intercambio disponible</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Al confirmar, enviarás una propuesta de intercambio al propietario. 
                      Podrán coordinar el intercambio por mensaje directo.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-wine-medium">Precio: ${publication.valor?.toLocaleString()}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Al confirmar, se iniciará el proceso de compra. Podrás contactar al vendedor 
                      para coordinar el pago y la entrega.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {publication.tipo_publicacion === 'Intercambio' 
                    ? 'Describe qué quieres intercambiar' 
                    : 'Mensaje para el vendedor (opcional)'}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={publication.tipo_publicacion === 'Intercambio' 
                    ? "Ej: Hola, tengo una blusa azul talla M que me gustaría intercambiar..." 
                    : "Ej: Hola, me interesa comprar esta prenda..."}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wine-medium focus:border-wine-medium resize-none"
                  rows={3}
                  required={publication.tipo_publicacion === 'Intercambio'}
                />
                {publication.tipo_publicacion === 'Intercambio' && (
                  <p className="text-xs text-gray-500 mt-1">
                    * Describe detalladamente qué prenda quieres intercambiar (talla, color, estado, etc.)
                  </p>
                )}
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              {publication.tipo_publicacion === 'Intercambio' && (
                <button
                  onClick={openChatWithOwner}
                  className="flex-1 px-4 py-2 bg-white border border-wine-medium text-wine-medium rounded-lg hover:bg-wine-medium/5 transition-colors flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Chatear con propietario
                </button>
              )}
              <button
                onClick={handleConfirmPurchase}
                disabled={loading}
                className="flex-1 bg-wine-medium text-white px-4 py-2 rounded-lg hover:bg-wine-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>
                      {publication.tipo_publicacion === 'Intercambio' ? 'Enviar Propuesta' : 'Confirmar Compra'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}