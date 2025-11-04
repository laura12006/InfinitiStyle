import React, { useState, useEffect } from 'react';
import { adminGetUsers, adminCreateUser, adminUpdateUser, adminDeleteUser, 
         adminGetPublications, adminDeletePublication, 
         adminGetPayments, adminUpdatePayment,
         adminGetMessages, adminDeleteMessage,
         adminGetStats, adminGetRatings } from '../api';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});

  // Estados para cada sección
  const [users, setUsers] = useState({ data: [], total: 0, page: 1 });
  const [publications, setPublications] = useState({ data: [], total: 0, page: 1 });
  const [payments, setPayments] = useState({ data: [], total: 0, page: 1 });
  const [messages, setMessages] = useState({ data: [], total: 0, page: 1 });
  const [ratings, setRatings] = useState({ data: [], total: 0, page: 1 });

  // Estados para formularios
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState({
    '1_nombre': '',
    '2_nombre': '',
    '1_apellido': '',
    '2_apellido': '',
    'correo_electronico': '',
    'contrasena': '',
    'talla': '',
    'fecha_nacimiento': '',
    'rol': 'Usuario',
    'verified': true
  });

  // Filtros
  const [filters, setFilters] = useState({
    users: { search: '', role: '', verified: '' },
    publications: { search: '', tipo: '', estado: '' },
    payments: { estado: '' }
  });

  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadStats();
    } else if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'publications') {
      loadPublications();
    } else if (activeTab === 'payments') {
      loadPayments();
    } else if (activeTab === 'messages') {
      loadMessages();
    } else if (activeTab === 'ratings') {
      loadRatings();
    }
  }, [activeTab, users.page, publications.page, payments.page, messages.page, ratings.page, filters]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await adminGetStats();
      if (response.ok) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await adminGetUsers(users.page, 10, filters.users);
      if (response.ok) {
        setUsers(prev => ({ ...prev, data: response.data.users, total: response.data.total }));
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPublications = async () => {
    setLoading(true);
    try {
      const response = await adminGetPublications(publications.page, 10, filters.publications);
      if (response.ok) {
        setPublications(prev => ({ ...prev, data: response.data.publications, total: response.data.total }));
      }
    } catch (error) {
      console.error('Error loading publications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    setLoading(true);
    try {
      const response = await adminGetPayments(payments.page, 10, filters.payments);
      if (response.ok) {
        setPayments(prev => ({ ...prev, data: response.data.payments, total: response.data.total }));
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      const response = await adminGetMessages(messages.page, 10);
      if (response.ok) {
        setMessages(prev => ({ ...prev, data: response.data.messages, total: response.data.total }));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRatings = async () => {
    setLoading(true);
    try {
      const response = await adminGetRatings(ratings.page, 10);
      if (response.ok) {
        setRatings(prev => ({ ...prev, data: response.data.ratings, total: response.data.total }));
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        const response = await adminDeleteUser(userId);
        if (response.ok) {
          loadUsers();
        } else {
          alert(response.data?.error || 'Error al eliminar usuario');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error al eliminar usuario');
      }
    }
  };

  const handleDeletePublication = async (pubId) => {
    if (window.confirm('¿Estás seguro de eliminar esta publicación?')) {
      try {
        const response = await adminDeletePublication(pubId);
        if (response.ok) {
          loadPublications();
        } else {
          alert(response.data?.error || 'Error al eliminar publicación');
        }
      } catch (error) {
        console.error('Error deleting publication:', error);
        alert('Error al eliminar publicación');
      }
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('¿Estás seguro de eliminar este mensaje?')) {
      try {
        const response = await adminDeleteMessage(messageId);
        if (response.ok) {
          loadMessages();
        } else {
          alert(response.data?.error || 'Error al eliminar mensaje');
        }
      } catch (error) {
        console.error('Error deleting message:', error);
        alert('Error al eliminar mensaje');
      }
    }
  };

  const handleUpdatePaymentStatus = async (paymentId, newStatus) => {
    try {
      const response = await adminUpdatePayment(paymentId, { estado_pago: newStatus });
      if (response.ok) {
        loadPayments();
      } else {
        alert(response.data?.error || 'Error al actualizar pago');
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Error al actualizar pago');
    }
  };

  const handleSaveUser = async () => {
    try {
      let response;
      if (selectedUser) {
        response = await adminUpdateUser(selectedUser.id_usuario, userForm);
      } else {
        response = await adminCreateUser(userForm);
      }
      
      if (response.ok) {
        setShowUserForm(false);
        setSelectedUser(null);
        setUserForm({
          '1_nombre': '',
          '2_nombre': '',
          '1_apellido': '',
          '2_apellido': '',
          'correo_electronico': '',
          'contrasena': '',
          'talla': '',
          'fecha_nacimiento': '',
          'rol': 'Usuario',
          'verified': true
        });
        loadUsers();
      } else {
        alert(response.data?.error || 'Error al guardar usuario');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error al guardar usuario');
    }
  };

  const openUserForm = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setUserForm({
        '1_nombre': user['1_nombre'] || '',
        '2_nombre': user['2_nombre'] || '',
        '1_apellido': user['1_apellido'] || '',
        '2_apellido': user['2_apellido'] || '',
        'correo_electronico': user.correo_electronico || '',
        'contrasena': '',
        'talla': user.talla || '',
        'fecha_nacimiento': user.fecha_nacimiento || '',
        'rol': user.rol || 'Usuario',
        'verified': user.verified || false
      });
    } else {
      setSelectedUser(null);
      setUserForm({
        '1_nombre': '',
        '2_nombre': '',
        '1_apellido': '',
        '2_apellido': '',
        'correo_electronico': '',
        'contrasena': '',
        'talla': '',
        'fecha_nacimiento': '',
        'rol': 'Usuario',
        'verified': true
      });
    }
    setShowUserForm(true);
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-wine-darkest">Panel de Control</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-wine-medium to-wine-dark p-6 rounded-lg text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Usuarios</h3>
              <p className="text-3xl font-bold">{stats.total_users || 0}</p>
              <p className="text-sm opacity-80">Verificados: {stats.verified_users || 0}</p>
            </div>
            <svg className="w-12 h-12 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-wine-darkest to-wine-medium p-6 rounded-lg text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Publicaciones</h3>
              <p className="text-3xl font-bold">{stats.total_publications || 0}</p>
              <p className="text-sm opacity-80">Disponibles: {stats.available_publications || 0}</p>
            </div>
            <svg className="w-12 h-12 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-600 to-gray-700 p-6 rounded-lg text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Pagos</h3>
              <p className="text-3xl font-bold">{stats.total_payments || 0}</p>
              <p className="text-sm opacity-80">Completados: {stats.completed_payments || 0}</p>
            </div>
            <svg className="w-12 h-12 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-wine-dark to-wine-darkest p-6 rounded-lg text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Ingresos</h3>
              <p className="text-3xl font-bold">${(stats.total_revenue || 0).toLocaleString()}</p>
              <p className="text-sm opacity-80">Rating: {stats.average_rating || 0}/5</p>
            </div>
            <svg className="w-12 h-12 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-wine-darkest">Estadísticas Adicionales</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Administradores:</span>
              <span className="font-semibold">{stats.admin_users || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Publicaciones de Venta:</span>
              <span className="font-semibold">{stats.sales_publications || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Publicaciones de Intercambio:</span>
              <span className="font-semibold">{stats.exchange_publications || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Mensajes:</span>
              <span className="font-semibold">{stats.total_messages || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Valoraciones:</span>
              <span className="font-semibold">{stats.total_ratings || 0}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-wine-darkest flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Acciones Rápidas
          </h3>
          <div className="space-y-3">
            <button 
              onClick={() => setActiveTab('users')}
              className="w-full bg-wine-medium text-white px-4 py-3 rounded-lg hover:bg-wine-dark transition-colors flex items-center justify-center space-x-2 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <span>Gestionar Usuarios</span>
            </button>
            <button 
              onClick={() => setActiveTab('publications')}
              className="w-full bg-wine-medium text-white px-4 py-3 rounded-lg hover:bg-wine-dark transition-colors flex items-center justify-center space-x-2 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Ver Publicaciones</span>
            </button>
            <button 
              onClick={() => setActiveTab('payments')}
              className="w-full bg-wine-medium text-white px-4 py-3 rounded-lg hover:bg-wine-dark transition-colors flex items-center justify-center space-x-2 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>Gestionar Pagos</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-wine-darkest">Gestión de Usuarios</h2>
        <button 
          onClick={() => openUserForm()}
          className="bg-wine-medium text-white px-4 py-2 rounded-lg hover:bg-wine-dark transition-colors flex items-center space-x-2 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={filters.users.search}
            onChange={(e) => setFilters(prev => ({ 
              ...prev, 
              users: { ...prev.users, search: e.target.value } 
            }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wine-medium focus:border-wine-medium transition-colors"
          />
          <select
            value={filters.users.role}
            onChange={(e) => setFilters(prev => ({ 
              ...prev, 
              users: { ...prev.users, role: e.target.value } 
            }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wine-medium focus:border-wine-medium transition-colors"
          >
            <option value="">Todos los roles</option>
            <option value="Usuario">Usuario</option>
            <option value="Administrador">Administrador</option>
          </select>
          <select
            value={filters.users.verified}
            onChange={(e) => setFilters(prev => ({ 
              ...prev, 
              users: { ...prev.users, verified: e.target.value } 
            }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wine-medium focus:border-wine-medium transition-colors"
          >
            <option value="">Todos</option>
            <option value="true">Verificados</option>
            <option value="false">No Verificados</option>
          </select>
          <button 
            onClick={loadUsers}
            className="inline-flex items-center bg-wine-medium text-white px-4 py-2 rounded-lg hover:bg-wine-dark transition-colors shadow-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refrescar
          </button>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verificado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.data.map((user) => (
                <tr key={user.id_usuario}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id_usuario}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user['1_nombre']} {user['1_apellido']}
                    </div>
                    {user['2_nombre'] && (
                      <div className="text-sm text-gray-500">
                        {user['2_nombre']} {user['2_apellido']}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.correo_electronico}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.rol === 'Administrador' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.rol}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.verified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.verified ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => openUserForm(user)}
                        className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-wine-medium bg-wine-lightest hover:bg-wine-light hover:text-wine-dark transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id_usuario)}
                        className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPublications = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-wine-darkest">Gestión de Publicaciones</h2>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Buscar publicaciones..."
            value={filters.publications.search}
            onChange={(e) => setFilters(prev => ({ 
              ...prev, 
              publications: { ...prev.publications, search: e.target.value } 
            }))}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-wine-medium"
          />
          <select
            value={filters.publications.tipo}
            onChange={(e) => setFilters(prev => ({ 
              ...prev, 
              publications: { ...prev.publications, tipo: e.target.value } 
            }))}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-wine-medium"
          >
            <option value="">Todos los tipos</option>
            <option value="Venta">Venta</option>
            <option value="Intercambio">Intercambio</option>
          </select>
          <select
            value={filters.publications.estado}
            onChange={(e) => setFilters(prev => ({ 
              ...prev, 
              publications: { ...prev.publications, estado: e.target.value } 
            }))}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-wine-medium"
          >
            <option value="">Todos los estados</option>
            <option value="Disponible">Disponible</option>
            <option value="No Disponible">No Disponible</option>
          </select>
          <button 
            onClick={loadPublications}
            className="inline-flex items-center bg-wine-medium text-white px-4 py-2 rounded-lg hover:bg-wine-dark transition-colors shadow-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refrescar
          </button>
        </div>
      </div>

      {/* Tabla de publicaciones */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prenda</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {publications.data.map((pub) => (
                <tr key={pub.id_publicacion}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pub.id_publicacion}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{pub.nombre}</div>
                    <div className="text-sm text-gray-500">Talla: {pub.talla}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {pub['1_nombre']} {pub['1_apellido']}
                    </div>
                    <div className="text-sm text-gray-500">{pub.correo_electronico}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      pub.tipo_publicacion === 'Venta' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {pub.tipo_publicacion}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pub.valor > 0 ? `$${pub.valor.toLocaleString()}` : 'Intercambio'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      pub.estado === 'Disponible' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {pub.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(pub.fecha_publicacion).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleDeletePublication(pub.id_publicacion)}
                      className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-wine-darkest">Gestión de Pagos</h2>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={filters.payments.estado}
            onChange={(e) => setFilters(prev => ({ 
              ...prev, 
              payments: { ...prev.payments, estado: e.target.value } 
            }))}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-wine-medium"
          >
            <option value="">Todos los estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="PROCESO">En Proceso</option>
            <option value="COMPLETADO">Completado</option>
          </select>
          <button 
            onClick={loadPayments}
            className="inline-flex items-center bg-wine-medium text-white px-4 py-2 rounded-lg hover:bg-wine-dark transition-colors shadow-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refrescar
          </button>
        </div>
      </div>

      {/* Tabla de pagos */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.data.map((payment) => (
                <tr key={payment.id_pago}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.id_pago}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {payment['1_nombre']} {payment['1_apellido']}
                    </div>
                    <div className="text-sm text-gray-500">{payment.correo_electronico}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${payment.monto.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.metodo_pago}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={payment.estado_pago}
                      onChange={(e) => handleUpdatePaymentStatus(payment.id_pago, e.target.value)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border-none outline-none cursor-pointer ${
                        payment.estado_pago === 'COMPLETADO' 
                          ? 'bg-green-100 text-green-800'
                          : payment.estado_pago === 'PROCESO'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      <option value="PENDIENTE">Pendiente</option>
                      <option value="PROCESO">En Proceso</option>
                      <option value="COMPLETADO">Completado</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(payment.fecha_pago).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className="text-gray-500">Sistema</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderMessages = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-wine-darkest">Gestión de Mensajes</h2>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emisor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receptor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contenido</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {messages.data.map((message) => (
                <tr key={message.id_mensaje}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{message.id_mensaje}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {message.emisor_nombre} {message.emisor_apellido}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {message.receptor_nombre} {message.receptor_apellido}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {message.contenido}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(message.fecha_envio).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleDeleteMessage(message.id_mensaje)}
                      className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRatings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-wine-darkest">Valoraciones</h2>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valorador</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valorado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puntaje</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ratings.data.map((rating) => (
                <tr key={rating.id_valoracion}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rating.id_valoracion}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {rating.valorador_nombre} {rating.valorador_apellido}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {rating.valorado_nombre} {rating.valorado_apellido}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-yellow-500 mr-1">{rating.puntaje}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < rating.puntaje ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(rating.fecha_valoracion).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderUserForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h3>
            <button 
              onClick={() => setShowUserForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Primer Nombre *</label>
              <input
                type="text"
                value={userForm['1_nombre']}
                onChange={(e) => setUserForm(prev => ({ ...prev, '1_nombre': e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wine-medium focus:border-wine-medium transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Segundo Nombre</label>
              <input
                type="text"
                value={userForm['2_nombre']}
                onChange={(e) => setUserForm(prev => ({ ...prev, '2_nombre': e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wine-medium focus:border-wine-medium transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Primer Apellido *</label>
              <input
                type="text"
                value={userForm['1_apellido']}
                onChange={(e) => setUserForm(prev => ({ ...prev, '1_apellido': e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wine-medium focus:border-wine-medium transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Segundo Apellido</label>
              <input
                type="text"
                value={userForm['2_apellido']}
                onChange={(e) => setUserForm(prev => ({ ...prev, '2_apellido': e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wine-medium focus:border-wine-medium transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email *</label>
              <input
                type="email"
                value={userForm.correo_electronico}
                onChange={(e) => setUserForm(prev => ({ ...prev, correo_electronico: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wine-medium focus:border-wine-medium transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contraseña {selectedUser ? '(dejar vacío para mantener actual)' : '*'}
              </label>
              <input
                type="password"
                value={userForm.contrasena}
                onChange={(e) => setUserForm(prev => ({ ...prev, contrasena: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wine-medium focus:border-wine-medium transition-colors"
                required={!selectedUser}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Talla</label>
              <select
                value={userForm.talla}
                onChange={(e) => setUserForm(prev => ({ ...prev, talla: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wine-medium focus:border-wine-medium transition-colors"
              >
                <option value="">Seleccionar talla</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
              <input
                type="date"
                value={userForm.fecha_nacimiento}
                onChange={(e) => setUserForm(prev => ({ ...prev, fecha_nacimiento: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wine-medium focus:border-wine-medium transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Rol *</label>
              <select
                value={userForm.rol}
                onChange={(e) => setUserForm(prev => ({ ...prev, rol: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wine-medium focus:border-wine-medium transition-colors"
                required
              >
                <option value="Usuario">Usuario</option>
                <option value="Administrador">Administrador</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="verified"
                checked={userForm.verified}
                onChange={(e) => setUserForm(prev => ({ ...prev, verified: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="verified" className="text-sm font-medium text-gray-700">
                Usuario Verificado
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button 
              onClick={() => setShowUserForm(false)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancelar
            </button>
            <button 
              onClick={handleSaveUser}
              className="inline-flex items-center px-4 py-2 bg-wine-medium text-white rounded-lg hover:bg-wine-dark transition-colors shadow-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-wine-darkest">Panel de Administración</h1>
          <p className="text-gray-600 mt-2">Gestiona todos los aspectos de StyleInfinite</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { 
                  key: 'dashboard', 
                  label: 'Dashboard', 
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  )
                },
                { 
                  key: 'users', 
                  label: 'Usuarios', 
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  )
                },
                { 
                  key: 'publications', 
                  label: 'Publicaciones', 
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  )
                },
                { 
                  key: 'payments', 
                  label: 'Pagos', 
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  )
                },
                { 
                  key: 'messages', 
                  label: 'Mensajes', 
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  )
                },
                { 
                  key: 'ratings', 
                  label: 'Valoraciones', 
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.837-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  )
                }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-wine-medium text-wine-medium'
                      : 'border-transparent text-gray-500 hover:text-wine-dark hover:border-wine-light'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-wine-light border-t-wine-medium"></div>
              <p className="mt-4 text-wine-medium font-medium">Cargando datos...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'users' && renderUsers()}
              {activeTab === 'publications' && renderPublications()}
              {activeTab === 'payments' && renderPayments()}
              {activeTab === 'messages' && renderMessages()}
              {activeTab === 'ratings' && renderRatings()}
            </>
          )}
        </div>

        {/* Pagination */}
        {activeTab !== 'dashboard' && (
          <div className="bg-white rounded-lg shadow-lg p-4 mt-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">
                Mostrando {activeTab === 'users' ? users.data.length : 
                          activeTab === 'publications' ? publications.data.length :
                          activeTab === 'payments' ? payments.data.length :
                          activeTab === 'messages' ? messages.data.length :
                          ratings.data.length} de {
                          activeTab === 'users' ? users.total : 
                          activeTab === 'publications' ? publications.total :
                          activeTab === 'payments' ? payments.total :
                          activeTab === 'messages' ? messages.total :
                          ratings.total} resultados
              </span>
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    const current = activeTab === 'users' ? users :
                                   activeTab === 'publications' ? publications :
                                   activeTab === 'payments' ? payments :
                                   activeTab === 'messages' ? messages : ratings;
                    if (current.page > 1) {
                      if (activeTab === 'users') setUsers(prev => ({ ...prev, page: prev.page - 1 }));
                      else if (activeTab === 'publications') setPublications(prev => ({ ...prev, page: prev.page - 1 }));
                      else if (activeTab === 'payments') setPayments(prev => ({ ...prev, page: prev.page - 1 }));
                      else if (activeTab === 'messages') setMessages(prev => ({ ...prev, page: prev.page - 1 }));
                      else setRatings(prev => ({ ...prev, page: prev.page - 1 }));
                    }
                  }}
                  disabled={activeTab === 'users' ? users.page <= 1 : 
                           activeTab === 'publications' ? publications.page <= 1 :
                           activeTab === 'payments' ? payments.page <= 1 :
                           activeTab === 'messages' ? messages.page <= 1 :
                           ratings.page <= 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="px-3 py-1 text-sm">
                  Página {activeTab === 'users' ? users.page : 
                          activeTab === 'publications' ? publications.page :
                          activeTab === 'payments' ? payments.page :
                          activeTab === 'messages' ? messages.page :
                          ratings.page}
                </span>
                <button 
                  onClick={() => {
                    const current = activeTab === 'users' ? users :
                                   activeTab === 'publications' ? publications :
                                   activeTab === 'payments' ? payments :
                                   activeTab === 'messages' ? messages : ratings;
                    const maxPages = Math.ceil(current.total / 10);
                    if (current.page < maxPages) {
                      if (activeTab === 'users') setUsers(prev => ({ ...prev, page: prev.page + 1 }));
                      else if (activeTab === 'publications') setPublications(prev => ({ ...prev, page: prev.page + 1 }));
                      else if (activeTab === 'payments') setPayments(prev => ({ ...prev, page: prev.page + 1 }));
                      else if (activeTab === 'messages') setMessages(prev => ({ ...prev, page: prev.page + 1 }));
                      else setRatings(prev => ({ ...prev, page: prev.page + 1 }));
                    }
                  }}
                  disabled={(() => {
                    const current = activeTab === 'users' ? users :
                                   activeTab === 'publications' ? publications :
                                   activeTab === 'payments' ? payments :
                                   activeTab === 'messages' ? messages : ratings;
                    return current.page >= Math.ceil(current.total / 10);
                  })()}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de formulario de usuario */}
      {showUserForm && renderUserForm()}
    </div>
  );
}
