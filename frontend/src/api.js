const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5000'

export function getImageUrl(path, bustCache = false) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  // Asegurar que path comience con / para URLs correctas
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const baseUrl = `${API_BASE}${normalizedPath}`
  // Agregar timestamp para evitar cache en actualizaciones
  return bustCache ? `${baseUrl}?t=${Date.now()}` : baseUrl
}

export async function apiFetch(path, options = {}){
  const token = localStorage.getItem('token')
  const headers = options.headers || {}
  if(!(options.body instanceof FormData)){
    headers['Content-Type'] = headers['Content-Type'] || 'application/json'
  }
  if(token){
    headers['Authorization'] = 'Bearer ' + token
  }
  const res = await fetch(API_BASE + path, { ...options, headers })
  let data
  const ct = res.headers.get('content-type') || ''
  if(ct.includes('application/json')) data = await res.json()
  else data = await res.text()
  return { ok: res.ok, status: res.status, data }
}

// Autenticación
export async function register(payload){
  return apiFetch('/api/register', { method: 'POST', body: JSON.stringify(payload) })
}

export async function login(payload){
  return apiFetch('/api/login', { method: 'POST', body: JSON.stringify(payload) })
}

export async function me(){
  return apiFetch('/api/me')
}

export async function verify(payload){
  return apiFetch('/api/verify', { method: 'POST', body: JSON.stringify(payload) })
}

export async function passwordSendCode(payload){
  return apiFetch('/api/password/send-code', { method: 'POST', body: JSON.stringify(payload) })
}

export async function passwordChange(payload){
  return apiFetch('/api/password/change', { method: 'POST', body: JSON.stringify(payload) })
}

export async function changePasswordAuth(payload){
  return apiFetch('/api/password/change-auth', { method: 'POST', body: JSON.stringify(payload) })
}

// Perfil de usuario
export async function updateProfile(payload){
  return apiFetch('/api/profile', { method: 'PUT', body: JSON.stringify(payload) })
}

export async function getUserProfile(userId){
  return apiFetch(`/api/profile/${userId}`)
}

// Publicaciones
export async function getPublications(filters = {}){
  const params = new URLSearchParams(filters)
  return apiFetch(`/api/publications?${params.toString()}`)
}

export async function createPublication(payload){
  const formData = new FormData();
  
  // Añadir el archivo de imagen
  if (payload.foto instanceof File) {
    formData.append('foto', payload.foto);
  } else {
    return { ok: false, error: 'Se requiere un archivo de imagen' };
  }
  
  // Añadir el resto de campos
  Object.keys(payload).forEach(key => {
    if (key !== 'foto') {
      formData.append(key, payload[key]);
    }
  });
  
  return apiFetch('/api/publications', { 
    method: 'POST',
    body: formData
  })
}

export async function updatePublication(id, formData){
  // Enviar como FormData para manejar archivos
  return apiFetch(`/api/publications/${id}`, { 
    method: 'PUT',
    body: formData
  })
}

export async function deletePublication(id){
  return apiFetch(`/api/publications/${id}`, { method: 'DELETE' })
}

// Valoraciones
export async function getUserRatings(userId){
  return apiFetch(`/api/valoraciones/${userId}`)
}

export async function rateUser(userId, rating, comment = '', transactionId = null) {
  return apiFetch(`/api/valoraciones/${userId}`, { 
    method: 'POST', 
    body: JSON.stringify({ 
      puntaje: rating,
      comentario: comment,
      transaction_id: transactionId
    }) 
  })
}

// Funciones de administrador
export async function getUsers(){
  return apiFetch('/api/admin/users')
}

export async function updateUser(userId, payload){
  return apiFetch(`/api/admin/users/${userId}`, { 
    method: 'PUT', 
    body: JSON.stringify(payload) 
  })
}

// Administración completa - Estadísticas
export async function adminGetStats(){
  return apiFetch('/api/admin/stats')
}

// Administración completa - Usuarios
export async function adminGetUsers(page = 1, limit = 10, filters = {}){
  const params = new URLSearchParams({ page, limit, ...filters })
  return apiFetch(`/api/admin/users?${params.toString()}`)
}

export async function adminCreateUser(payload){
  return apiFetch('/api/admin/users', { 
    method: 'POST', 
    body: JSON.stringify(payload) 
  })
}

export async function adminUpdateUser(userId, payload){
  return apiFetch(`/api/admin/users/${userId}`, { 
    method: 'PUT', 
    body: JSON.stringify(payload) 
  })
}

export async function adminDeleteUser(userId){
  return apiFetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
}

// Administración completa - Publicaciones
export async function adminGetPublications(page = 1, limit = 10, filters = {}){
  const params = new URLSearchParams({ page, limit, ...filters })
  return apiFetch(`/api/admin/publications?${params.toString()}`)
}

export async function adminDeletePublication(publicationId){
  return apiFetch(`/api/admin/publications/${publicationId}`, { method: 'DELETE' })
}

// Administración completa - Pagos
export async function adminGetPayments(page = 1, limit = 10, filters = {}){
  const params = new URLSearchParams({ page, limit, ...filters })
  return apiFetch(`/api/admin/payments?${params.toString()}`)
}

export async function adminUpdatePayment(paymentId, payload){
  return apiFetch(`/api/admin/payments/${paymentId}`, { 
    method: 'PUT', 
    body: JSON.stringify(payload) 
  })
}

// Administración completa - Mensajes
export async function adminGetMessages(page = 1, limit = 10){
  const params = new URLSearchParams({ page, limit })
  return apiFetch(`/api/admin/messages?${params.toString()}`)
}

export async function adminDeleteMessage(messageId){
  return apiFetch(`/api/admin/messages/${messageId}`, { method: 'DELETE' })
}

// Administración completa - Valoraciones
export async function adminGetRatings(page = 1, limit = 10){
  const params = new URLSearchParams({ page, limit })
  return apiFetch(`/api/admin/ratings?${params.toString()}`)
}

// Sistema de mensajes
export async function getConversations(){
  return apiFetch('/api/conversations')
}

export async function getMessages(otherUserId){
  return apiFetch(`/api/messages/${otherUserId}`)
}

export async function sendMessage(recipientId, content){
  return apiFetch('/api/messages', {
    method: 'POST',
    body: JSON.stringify({ recipient_id: recipientId, content })
  })
}

export async function markMessagesAsRead(otherUserId){
  return apiFetch(`/api/messages/${otherUserId}/read`, { method: 'PUT' })
}

// Sistema de compras y transacciones
export async function initiateTransaction(publicationId, message = ''){
  return apiFetch('/api/transactions', {
    method: 'POST',
    body: JSON.stringify({ publication_id: publicationId, message })
  })
}

export async function uploadPaymentProof(transactionId, proofFile){
  const formData = new FormData();
  formData.append('proof', proofFile);
  
  return apiFetch(`/api/transactions/${transactionId}/payment-proof`, {
    method: 'POST',
    body: formData
  })
}

export async function confirmPayment(transactionId){
  return apiFetch(`/api/transactions/${transactionId}/confirm-payment`, {
    method: 'PUT'
  })
}

export async function markItemAsShipped(transactionId, trackingInfo = ''){
  return apiFetch(`/api/transactions/${transactionId}/ship`, {
    method: 'PUT',
    body: JSON.stringify({ tracking_info: trackingInfo })
  })
}

export async function confirmDelivery(transactionId){
  return apiFetch(`/api/transactions/${transactionId}/delivered`, {
    method: 'PUT'
  })
}

export async function getMyTransactions(type = 'all'){
  const params = new URLSearchParams({ type })
  return apiFetch(`/api/transactions?${params.toString()}`)
}

export async function getTransactionDetails(transactionId){
  return apiFetch(`/api/transactions/${transactionId}`)
}

// Contact form
export async function sendContact(payload){
  return apiFetch('/api/contact', { method: 'POST', body: JSON.stringify(payload) })
}

// Lista de deseos / Wishlist
export async function getWishlist(){
  return apiFetch('/api/wishlist')
}

export async function addToWishlist(publicationId){
  return apiFetch(`/api/wishlist/${publicationId}`, { method: 'POST' })
}

export async function removeFromWishlist(publicationId){
  return apiFetch(`/api/wishlist/${publicationId}`, { method: 'DELETE' })
}

export async function checkWishlistStatus(publicationId){
  return apiFetch(`/api/wishlist/check/${publicationId}`)
}
