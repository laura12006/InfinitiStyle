import React, { useState, useEffect } from 'react';
import { 
  getMyTransactions, 
  uploadPaymentProof, 
  confirmPayment, 
  markItemAsShipped, 
  confirmDelivery, 
  rateUser,
  getImageUrl
} from '../api';

export default function MyTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all'); // all, buying, selling
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [trackingInfo, setTrackingInfo] = useState('');
  const [uploading, setUploading] = useState(false);
  const [ratingTransaction, setRatingTransaction] = useState(null);
  const [rating, setRating] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [viewingProof, setViewingProof] = useState(null);

  useEffect(() => {
    loadTransactions();
  }, [filter]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const response = await getMyTransactions(filter);
      if (response.ok) {
        setTransactions(response.data);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadProof = async (transactionId) => {
    if (!proofFile) {
      alert('Selecciona un archivo de comprobante');
      return;
    }
    setUploading(true);
    try {
      const response = await uploadPaymentProof(transactionId, proofFile);
      if (response.ok) {
        alert('Comprobante enviado exitosamente');
        loadTransactions();
        setSelectedTransaction(null);
        setProofFile(null);
      } else {
        alert(response.data?.error || 'Error al subir comprobante');
      }
    } catch (error) {
      console.error('Error uploading proof:', error);
      alert('Error al subir comprobante');
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmPayment = async (transactionId) => {
    if (window.confirm('¿Confirmas que recibiste el pago correctamente?')) {
      try {
        const response = await confirmPayment(transactionId);
        if (response.ok) {
          alert('Pago confirmado exitosamente');
          loadTransactions();
        } else {
          alert(response.data?.error || 'Error al confirmar pago');
        }
      } catch (error) {
        console.error('Error confirming payment:', error);
        alert('Error al confirmar pago');
      }
    }
  };

  const handleMarkAsShipped = async (transactionId) => {
    try {
      const response = await markItemAsShipped(transactionId, trackingInfo);
      if (response.ok) {
        alert('Producto marcado como enviado');
        loadTransactions();
        setSelectedTransaction(null);
        setTrackingInfo('');
      } else {
        alert(response.data?.error || 'Error al marcar como enviado');
      }
    } catch (error) {
      console.error('Error marking as shipped:', error);
      alert('Error al marcar como enviado');
    }
  };

  const handleConfirmDelivery = async (transactionId) => {
    if (window.confirm('¿Confirmas que recibiste el producto en buen estado?')) {
      try {
        const response = await confirmDelivery(transactionId);
        if (response.ok) {
          // Buscar la transacción para abrir el modal de calificación
          const transaction = transactions.find(t => t.id_transaccion === transactionId);
          if (transaction) {
            setRatingTransaction(transaction);
          }
          loadTransactions();
        } else {
          alert(response.data?.error || 'Error al confirmar entrega');
        }
      } catch (error) {
        console.error('Error confirming delivery:', error);
        alert('Error al confirmar entrega');
      }
    }
  };

  const handleRateUser = async () => {
    if (rating === 0) {
      alert('Por favor selecciona una calificación');
      return;
    }
    setSubmittingRating(true);
    try {
      // Obtener el ID del vendedor desde la transacción
      const isMyPurchase = ratingTransaction.id_comprador === getCurrentUserId();
      const vendorId = isMyPurchase ? ratingTransaction.id_usuario : ratingTransaction.id_comprador;
      const response = await rateUser(vendorId, rating, '', ratingTransaction.id_transaccion);
      if (response.ok) {
        alert('¡Calificación enviada exitosamente!');
        setRatingTransaction(null);
        setRating(0);
        loadTransactions();
      } else {
        alert(response.data?.error || 'Error al enviar calificación');
      }
    } catch (error) {
      console.error('Error rating user:', error);
      alert('Error al enviar calificación');
    } finally {
      setSubmittingRating(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDIENTE_PAGO': 'bg-yellow-100 text-yellow-800',
      'PAGO_ENVIADO': 'bg-blue-100 text-blue-800',
      'PAGO_CONFIRMADO': 'bg-green-100 text-green-800',
      'ENVIADO': 'bg-purple-100 text-purple-800',
      'ENTREGADO': 'bg-green-200 text-green-900',
      'CANCELADO': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      'PENDIENTE_PAGO': 'Pendiente de Pago',
      'PAGO_ENVIADO': 'Pago Enviado',
      'PAGO_CONFIRMADO': 'Pago Confirmado',
      'ENVIADO': 'Enviado',
      'ENTREGADO': 'Entregado',
      'CANCELADO': 'Cancelado'
    };
    return texts[status] || status;
  };

  const getCurrentUserId = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub;
      } catch (error) {
        return null;
      }
    }
    return null;
  };

  const currentUserId = getCurrentUserId();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-wine-darkest">Mis Transacciones</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all' 
                  ? 'bg-wine-medium text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('buying')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'buying' 
                  ? 'bg-wine-medium text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Mis Compras
            </button>
            <button
              onClick={() => setFilter('selling')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'selling' 
                  ? 'bg-wine-medium text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Mis Ventas
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-wine-light border-t-wine-medium"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p>No hay transacciones</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => {
              const isMyPurchase = transaction.id_comprador === currentUserId;
              const otherPersonName = isMyPurchase 
                ? `${transaction.vendedor_nombre} ${transaction.vendedor_apellido}`
                : `${transaction.comprador_nombre} ${transaction.comprador_apellido}`;

              return (
                <div key={transaction.id_transaccion} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 flex-shrink-0">
                      <img
                        src={getImageUrl(transaction.foto)}
                        alt={transaction.nombre}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{transaction.nombre}</h3>
                          <p className="text-sm text-gray-600">
                            {isMyPurchase ? 'Comprando a' : 'Vendiendo a'}: {otherPersonName}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.estado)}`}>
                            {getStatusText(transaction.estado)}
                          </span>
                          <p className="text-sm font-semibold text-gray-900 mt-1">
                            ${transaction.valor?.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">
                        Iniciado: {new Date(transaction.fecha_inicio).toLocaleDateString()}
                      </p>

                      {/* Botón ver comprobante */}
                      {transaction.comprobante_pago && (
                        <button
                          onClick={() => setViewingProof(transaction)}
                          className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300 mb-2"
                        >
                          Ver Comprobante
                        </button>
                      )}

                      <div className="flex space-x-2">
                        {isMyPurchase && transaction.estado === 'PENDIENTE_PAGO' && (
                          <button
                            onClick={() => setSelectedTransaction(transaction)}
                            className="bg-wine-medium text-white px-3 py-1 rounded text-sm hover:bg-wine-dark transition-colors"
                          >
                            Enviar Comprobante
                          </button>
                        )}

                        {isMyPurchase && transaction.estado === 'ENVIADO' && (
                          <button
                            onClick={() => handleConfirmDelivery(transaction.id_transaccion)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                          >
                            Confirmar Recepción
                          </button>
                        )}

                        {isMyPurchase && transaction.estado === 'ENTREGADO' && !transaction.calificado && (
                          <button
                            onClick={() => setRatingTransaction(transaction)}
                            className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors"
                          >
                            Calificar Vendedor
                          </button>
                        )}

                        {!isMyPurchase && transaction.estado === 'PAGO_ENVIADO' && (
                          <button
                            onClick={() => handleConfirmPayment(transaction.id_transaccion)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                          >
                            Confirmar Pago
                          </button>
                        )}

                        {!isMyPurchase && transaction.estado === 'PAGO_CONFIRMADO' && (
                          <button
                            onClick={() => setSelectedTransaction(transaction)}
                            className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors"
                          >
                            Marcar como Enviado
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL SUBIR COMPROBANTE */}
      {selectedTransaction && (selectedTransaction.estado === 'PENDIENTE_PAGO' || selectedTransaction.estado === 'PAGO_CONFIRMADO') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            {selectedTransaction.estado === 'PENDIENTE_PAGO' && (
              <>
                <h3 className="text-lg font-semibold mb-4">Enviar Comprobante de Pago</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comprobante de Pago
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setProofFile(e.target.files[0])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wine-medium"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Formatos admitidos: JPG, PNG, PDF
                  </p>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleUploadProof(selectedTransaction.id_transaccion)}
                    disabled={!proofFile || uploading}
                    className="flex-1 bg-wine-medium text-white px-4 py-2 rounded-lg hover:bg-wine-dark disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Subiendo...' : 'Enviar'}
                  </button>
                </div>
              </>
            )}
            {selectedTransaction.estado === 'PAGO_CONFIRMADO' && (
              <>
                <h3 className="text-lg font-semibold mb-4">Marcar como Enviado</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Información de Seguimiento (Opcional)
                  </label>
                  <textarea
                    value={trackingInfo}
                    onChange={(e) => setTrackingInfo(e.target.value)}
                    placeholder="Ej: Número de guía, empresa de envío, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wine-medium resize-none"
                    rows={3}
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleMarkAsShipped(selectedTransaction.id_transaccion)}
                    className="flex-1 bg-wine-medium text-white px-4 py-2 rounded-lg hover:bg-wine-dark"
                  >
                    Marcar como Enviado
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL CALIFICAR */}
      {ratingTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Calificar Vendedor</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                ¿Cómo fue tu experiencia comprando <strong>{ratingTransaction.nombre}</strong> a <strong>{ratingTransaction.nombre_vendedor}</strong>?
              </p>
              <div className="flex justify-center space-x-2 mb-4">
                {[1,2,3,4,5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-2xl transition-colors ${star <= rating ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <div className="text-center text-sm text-gray-500">
                {rating === 0 && 'Selecciona una calificación'}
                {rating === 1 && 'Muy malo'}
                {rating === 2 && 'Malo'}
                {rating === 3 && 'Regular'}
                {rating === 4 && 'Bueno'}
                {rating === 5 && 'Excelente'}
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => { setRatingTransaction(null); setRating(0); }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleRateUser}
                disabled={rating === 0 || submittingRating}
                className="flex-1 bg-wine-medium text-white px-4 py-2 rounded-lg hover:bg-wine-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingRating ? 'Enviando...' : 'Enviar Calificación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VER COMPROBANTE */}
      {viewingProof && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full p-4 relative">
            <button
              onClick={() => setViewingProof(null)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-xl font-bold"
            >
              ×
            </button>
            <h3 className="text-lg font-semibold mb-4">Comprobante de Pago</h3>
            {viewingProof.comprobante_pago.endsWith('.pdf') ? (
              <iframe
                src={getImageUrl(viewingProof.comprobante_pago)}
                className="w-full h-96"
                title="Comprobante de Pago"
              />
            ) : (
              <img
                src={getImageUrl(viewingProof.comprobante_pago)}
                alt="Comprobante de Pago"
                className="w-full h-auto max-h-96 object-contain"
              />
            )}
            <div className="mt-4 text-center">
              <a
                href={getImageUrl(viewingProof.comprobante_pago)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                Abrir en nueva pestaña
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
