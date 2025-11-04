import React, { useState, useEffect, useRef } from 'react';
import { getConversations, getMessages, sendMessage, markMessagesAsRead } from '../api';

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  // Verificar si hay usuario logueado
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          // Verificar si el token no ha expirado
          if (payload.exp * 1000 > Date.now()) {
            setCurrentUser({ 
              id: payload.sub, 
              username: payload.username,
              nombre: payload.nombre 
            });
            return;
          }
        } catch (error) {
          console.error('Error parsing token:', error);
        }
      }
      // Si no hay token válido, limpiar estado
      localStorage.removeItem('token');
      setCurrentUser(null);
    };

    checkAuth();
    
    // Verificar auth cada minuto
    const authInterval = setInterval(checkAuth, 60000);
    
    return () => clearInterval(authInterval);
  }, []);

  // Cargar conversaciones cuando se abre el chat
  useEffect(() => {
    if (isOpen && currentUser) {
      loadConversations();
      // Actualizar conversaciones cada 30 segundos cuando está abierto
      const interval = setInterval(loadConversations, 30000);
      return () => clearInterval(interval);
    }
  }, [isOpen, currentUser]);

  // Auto-scroll a nuevos mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Actualizar contador de no leídos
  useEffect(() => {
    const total = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
    setUnreadCount(total);
  }, [conversations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    try {
      console.log('🔄 Cargando conversaciones...');
      const response = await getConversations();
      console.log('📥 Respuesta de conversaciones:', response);
      
      if (response.ok && response.data) {
        const conversations = Array.isArray(response.data) ? response.data : [];
        console.log('💬 Conversaciones procesadas:', conversations);
        console.log('🔍 Primera conversación:', conversations[0]);
        console.log('🔍 Campos disponibles:', conversations[0] ? Object.keys(conversations[0]) : 'ninguno');
        setConversations(conversations);
      } else {
        console.error('❌ Error en respuesta:', response);
        setConversations([]);
      }
    } catch (error) {
      console.error('💥 Error loading conversations:', error);
      setConversations([]);
    }
  };

  const loadMessages = async (conversationId) => {
    if (!conversationId) return;
    
    try {
      setLoading(true);
      console.log('📨 Cargando mensajes para usuario:', conversationId);
      const response = await getMessages(conversationId);
      console.log('📥 Respuesta de mensajes:', response);
      
      if (response.ok && response.data) {
        const messages = Array.isArray(response.data) ? response.data : [];
        console.log('💬 Mensajes procesados:', messages);
        setMessages(messages);
        
        // Marcar mensajes como leídos
        await markMessagesAsRead(conversationId);
        
        // Actualizar contador en la conversación usando other_user_id
        setConversations(prev => 
          prev.map(conv => 
            conv.other_user_id === conversationId 
              ? { ...conv, unread_count: 0 }
              : conv
          )
        );
      } else {
        console.error('❌ Error en respuesta de mensajes:', response);
        setMessages([]);
      }
    } catch (error) {
      console.error('💥 Error loading messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || loading) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      const response = await sendMessage(selectedConversation.other_user_id, messageText);
      
      // Agregar mensaje inmediatamente a la UI
      const newMsg = {
        id_mensaje: Date.now(),
        contenido: messageText,
        id_emisor: currentUser.id,
        fecha_envio: new Date().toISOString(),
        emisor_nombre: currentUser.nombre || currentUser.username
      };
      
      setMessages(prev => [...prev, newMsg]);
      
      // Recargar mensajes para obtener la versión del servidor
      setTimeout(() => loadMessages(selectedConversation.other_user_id), 500);
      
    } catch (error) {
      console.error('Error sending message:', error);
      // Restaurar el mensaje si falló
      setNewMessage(messageText);
    }
  };

  const selectConversation = (conversation) => {
    console.log('👆 Conversación seleccionada:', conversation);
    const conversationWithId = {
      ...conversation,
      id: conversation.other_user_id // Usar other_user_id como id
    };
    setSelectedConversation(conversationWithId);
    loadMessages(conversation.other_user_id);
  };

  const goBackToConversations = () => {
    setSelectedConversation(null);
    setMessages([]);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return '';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return 'Hoy';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Ayer';
      } else {
        return date.toLocaleDateString('es-ES', { 
          day: 'numeric', 
          month: 'short' 
        });
      }
    } catch (error) {
      return '';
    }
  };

  // Solo mostrar si hay usuario logueado
  if (!currentUser) {
    return null;
  }

  return (
    <>
      {/* Botón flotante del chat */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-gradient-to-r from-wine-medium to-wine-dark text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative"
          >
            {/* Icono de chat */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            
            {/* Contador de mensajes no leídos */}
            {unreadCount > 0 && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-bold animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            )}
          </button>
        )}

        {/* Ventana del chat */}
        {isOpen && (
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-80 h-96 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-wine-darkest via-wine-dark to-wine-darkest text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {selectedConversation && (
                  <button
                    onClick={goBackToConversations}
                    className="text-wine-lightest hover:text-wine-light transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                <div>
                  <h3 className="font-semibold">
                    {selectedConversation ? selectedConversation.other_user_name : 'Mensajes'}
                  </h3>
                </div>
              </div>
              
              <button
                onClick={() => setIsOpen(false)}
                className="text-wine-lightest hover:text-wine-light transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-hidden">
              {!selectedConversation ? (
                // Lista de conversaciones
                <div className="h-full overflow-y-auto">
                  {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                      <svg className="w-12 h-12 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p className="text-sm text-center">No tienes conversaciones aún</p>
                      <p className="text-xs text-center mt-1">Envía un mensaje desde el perfil de un usuario</p>
                    </div>
                  ) : (
                    conversations.map((conversation, index) => (
                      <div
                        key={conversation.other_user_id || index}
                        onClick={() => selectConversation(conversation)}
                        className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          {/* Avatar */}
                          <div className="w-10 h-10 bg-gradient-to-br from-wine-medium to-wine-dark rounded-full flex items-center justify-center text-white font-semibold">
                            {conversation.other_user_name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {conversation.other_user_name || 'Usuario'}
                              </p>
                              {conversation.last_message_time && (
                                <p className="text-xs text-gray-500">
                                  {formatTime(conversation.last_message_time)}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs text-gray-600 truncate">
                                {conversation.last_message || 'Sin mensajes previos'}
                              </p>
                              {parseInt(conversation.unread_count) > 0 && (
                                <div className="bg-gradient-to-r from-wine-medium to-wine-dark text-white text-xs rounded-full min-w-[18px] h-4 flex items-center justify-center font-bold">
                                  {conversation.unread_count}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                // Mensajes de la conversación seleccionada
                <div className="h-full flex flex-col">
                  {/* Área de mensajes */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {loading ? (
                      <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-wine-medium"></div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <p className="text-sm">No hay mensajes aún</p>
                      </div>
                    ) : (
                      messages.map((message, index) => {
                        const isOwn = message.id_emisor === currentUser.id;
                        const showDate = index === 0 || 
                          (messages[index - 1].fecha_envio && message.fecha_envio && 
                           new Date(messages[index - 1].fecha_envio).toDateString() !== 
                           new Date(message.fecha_envio).toDateString());

                        return (
                          <div key={message.id_mensaje || `msg-${index}`}>
                            {showDate && (
                              <div className="text-center mb-2">
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                  {formatDate(message.fecha_envio)}
                                </span>
                              </div>
                            )}
                            
                            <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] p-2 rounded-lg ${
                                isOwn 
                                  ? 'bg-gradient-to-r from-wine-medium to-wine-dark text-white' 
                                  : 'bg-gray-100 text-gray-900'
                              }`}>
                                <p className="text-sm">{message.contenido}</p>
                                <p className={`text-xs mt-1 ${
                                  isOwn ? 'text-wine-light' : 'text-gray-500'
                                }`}>
                                  {formatTime(message.fecha_envio)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input para nuevo mensaje */}
                  <div className="border-t border-gray-200 p-3">
                    <form onSubmit={handleSendMessage} className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wine-medium focus:border-wine-medium"
                        disabled={loading}
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || loading}
                        className="bg-gradient-to-r from-wine-medium to-wine-dark hover:from-wine-light hover:to-wine-medium disabled:bg-gray-300 text-white px-3 py-2 rounded-lg transition-all duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}