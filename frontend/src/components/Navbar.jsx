import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { me } from '../api';

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      me().then(res => {
        if (res.ok && res.data && res.data.logged_in) {
          setUser(res.data.user);
        }
      });
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="bg-gradient-to-r from-wine-darkest via-wine-dark to-wine-darkest shadow-2xl backdrop-blur-sm border-b border-wine-medium/20">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-1 flex items-center justify-start">
            <Link 
              to="/" 
              className="flex items-center space-x-3 group"
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-full flex items-center">
                  <img src="../../Public/Logostyleinfinte.jpg" alt="logo" className=''/>
                </div>
                <div className="absolute inset-0 bg-wine-light/20 rounded-full blur-sm animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-wine-lightest font-bold text-2xl group-hover:text-wine-light transition-all duration-300">
                  StyleInfinite
                </span>
                {user && (
                  <span className="text-xs text-wine-light/80 font-medium tracking-wider flex items-center">
                    {user.rol === 'Administrador' ? (
                      <>
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2M12 15.5A3.5 3.5 0 1015.5 12A3.5 3.5 0 0012 15.5Z"/>
                        </svg>
                        ADMIN
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12C14.21 12 16 10.21 16 8S14.21 4 12 4 8 5.79 8 8 9.79 12 12 12M12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"/>
                        </svg>
                        USUARIO
                      </>
                    )}
                  </span>
                )}
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden sm:flex items-center space-x-2">
            <Link
              to="/explorar"
              className="relative text-wine-light hover:text-wine-lightest px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 group overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                Explorar
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-wine-medium/0 via-wine-medium/20 to-wine-medium/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </Link>
            <Link
              to="/contact"
              className="relative text-wine-light hover:text-wine-lightest px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 group overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12H8m0 0l4-4m-4 4l4 4"/>
                </svg>
                Contacto
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-wine-medium/0 via-wine-medium/20 to-wine-medium/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </Link>
            
            {user?.rol === 'Administrador' && (
              <Link
                to="/admin"
                className="relative text-wine-light hover:text-wine-lightest px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 group overflow-hidden border border-wine-medium/30"
              >
                <span className="relative z-10 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  Panel Admin
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/20 to-yellow-500/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </Link>
            )}

            {token ? (
              <>
                <Link
                  to="/publications/create"
                  className="relative bg-gradient-to-r from-wine-medium to-wine-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 group overflow-hidden shadow-lg hover:shadow-wine-medium/25"
                >
                  <span className="relative z-10 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                    Nueva Publicación
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-wine-light to-wine-medium transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-wine-medium/20 to-wine-dark/20 backdrop-blur-sm border border-wine-medium/30 rounded-xl px-3 py-2 text-sm font-medium text-wine-lightest hover:from-wine-medium/30 hover:to-wine-dark/30 transition-all duration-300 group"
                  >
                    <div className="relative">
                      {user?.foto ? (
                        <img
                          className="h-8 w-8 rounded-full ring-2 ring-wine-medium/50 group-hover:ring-wine-light transition-all duration-300"
                          src={user.foto}
                          alt=""
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full flex items-center justify-center bg-gradient-to-br from-wine-medium to-wine-dark text-white ring-2 ring-wine-medium/50 group-hover:ring-wine-light transition-all duration-300">
                          {user?.['1_nombre']?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-wine-darkest animate-pulse"></div>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-medium">{user?.['1_nombre'] || 'Usuario'}</span>
                      <span className="text-xs text-wine-light/70">{user?.rol || 'Usuario'}</span>
                    </div>
                    <svg className="w-4 h-4 text-wine-light group-hover:text-wine-lightest transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-2xl bg-gradient-to-b from-white to-wine-lightest/50 backdrop-blur-sm border border-wine-medium/20 ring-1 ring-black/5 animate-in slide-in-from-top-2 duration-200">
                      <div className="py-2">
                        <div className="px-4 py-2 border-b border-wine-medium/10">
                          <p className="text-sm font-medium text-wine-darkest">{user?.['1_nombre']} {user?.['1_apellido']}</p>
                          <p className="text-xs text-wine-dark">{user?.correo_electronico}</p>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-wine-medium/10 text-wine-darkest mt-1">
                            {user?.rol === 'Administrador' ? (
                              <>
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2M12 15.5A3.5 3.5 0 1015.5 12A3.5 3.5 0 0012 15.5Z"/>
                                </svg>
                                Administrador
                              </>
                            ) : (
                              <>
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 12C14.21 12 16 10.21 16 8S14.21 4 12 4 8 5.79 8 8 9.79 12 12 12M12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"/>
                                </svg>
                                Usuario
                              </>
                            )}
                          </span>
                        </div>
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-wine-darkest hover:bg-wine-lightest/50 transition-colors duration-200"
                          onClick={() => setMenuOpen(false)}
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                          </svg>
                          Mi Perfil
                        </Link>
                        <Link
                          to="/wishlist"
                          className="flex items-center px-4 py-2 text-sm text-wine-darkest hover:bg-wine-lightest/50 transition-colors duration-200"
                          onClick={() => setMenuOpen(false)}
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                          </svg>
                          Lista de Deseos
                        </Link>
                        <Link
                          to="/transactions"
                          className="flex items-center px-4 py-2 text-sm text-wine-darkest hover:bg-wine-lightest/50 transition-colors duration-200"
                          onClick={() => setMenuOpen(false)}
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                          </svg>
                          Mis Transacciones
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout();
                            setMenuOpen(false);
                          }}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                          </svg>
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="relative text-wine-light hover:text-wine-lightest px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 group overflow-hidden border border-wine-medium/30"
                >
                  <span className="relative z-10 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                    </svg>
                    Iniciar Sesión
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-wine-medium/0 via-wine-medium/20 to-wine-medium/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </Link>
                <Link
                  to="/register"
                  className="relative bg-gradient-to-r from-wine-medium to-wine-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 group overflow-hidden shadow-lg hover:shadow-wine-medium/25"
                >
                  <span className="relative z-10 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                    </svg>
                    Registrarse
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-wine-light to-wine-medium transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex sm:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="relative inline-flex items-center justify-center p-2 rounded-lg bg-gradient-to-r from-wine-medium/20 to-wine-dark/20 backdrop-blur-sm border border-wine-medium/30 text-wine-light hover:text-wine-lightest hover:from-wine-medium/30 hover:to-wine-dark/30 focus:outline-none focus:ring-2 focus:ring-wine-medium/50 transition-all duration-300 group"
            >
              <span className="sr-only">Abrir menú principal</span>
              <svg
                className={`block h-6 w-6 transition-transform duration-300 ${menuOpen ? 'rotate-90' : ''} group-hover:scale-110`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
                />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-r from-wine-light/0 via-wine-light/20 to-wine-light/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="sm:hidden animate-in slide-in-from-top-2 duration-200">
            <div className="px-3 pt-2 pb-3 space-y-2 bg-gradient-to-b from-wine-darkest/95 to-wine-dark/95 backdrop-blur-sm border-t border-wine-medium/20">
              {user && (
                <div className="flex items-center px-3 py-2 mb-3 border-b border-wine-medium/20">
                  <div className="relative">
                    {user?.foto ? (
                      <img className="h-8 w-8 rounded-full ring-2 ring-wine-medium/50" src={user.foto} alt="" />
                    ) : (
                      <div className="h-8 w-8 rounded-full flex items-center justify-center bg-gradient-to-br from-wine-medium to-wine-dark text-white ring-2 ring-wine-medium/50">
                        {user?.['1_nombre']?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-wine-darkest"></div>
                  </div>
                  <div className="ml-3 flex flex-col">
                    <span className="text-sm font-medium text-wine-lightest">{user?.['1_nombre']}</span>
                    <span className="text-xs text-wine-light/70 flex items-center">
                      {user?.rol === 'Administrador' ? (
                        <>
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2M12 15.5A3.5 3.5 0 1015.5 12A3.5 3.5 0 0012 15.5Z"/>
                          </svg>
                          Administrador
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12C14.21 12 16 10.21 16 8S14.21 4 12 4 8 5.79 8 8 9.79 12 12 12M12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"/>
                          </svg>
                          Usuario
                        </>
                      )}
                    </span>
                  </div>
                </div>
              )}
              
              <Link
                to="/explorar"
                className="flex items-center px-3 py-2 rounded-lg text-base font-medium text-wine-light hover:text-wine-lightest hover:bg-wine-medium/20 transition-all duration-200"
                onClick={() => setMenuOpen(false)}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                Explorar
              </Link>
              <Link
                to="/contact"
                className="flex items-center px-3 py-2 rounded-lg text-base font-medium text-wine-light hover:text-wine-lightest hover:bg-wine-medium/20 transition-all duration-200"
                onClick={() => setMenuOpen(false)}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12H8m0 0l4-4m-4 4l4 4"/>
                </svg>
                Contacto
              </Link>
              
              {token && (
                <>
                  <Link
                    to="/publications/create"
                    className="flex items-center px-3 py-2 rounded-lg text-base font-medium text-wine-light hover:text-wine-lightest hover:bg-wine-medium/20 transition-all duration-200"
                    onClick={() => setMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                    Nueva Publicación
                  </Link>
                </>
              )}

              {user?.rol === 'Administrador' && (
                <Link
                  to="/admin"
                  className="flex items-center px-3 py-2 rounded-lg text-base font-medium text-wine-light hover:text-wine-lightest hover:bg-wine-medium/20 transition-all duration-200 border border-wine-medium/30"
                  onClick={() => setMenuOpen(false)}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  Panel Admin
                </Link>
              )}

              {token ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center px-3 py-2 rounded-lg text-base font-medium text-wine-light hover:text-wine-lightest hover:bg-wine-medium/20 transition-all duration-200"
                    onClick={() => setMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    Mi Perfil
                  </Link>
                  <Link
                    to="/wishlist"
                    className="flex items-center px-3 py-2 rounded-lg text-base font-medium text-wine-light hover:text-wine-lightest hover:bg-wine-medium/20 transition-all duration-200"
                    onClick={() => setMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                    Lista de Deseos
                  </Link>
                  <Link
                    to="/transactions"
                    className="flex items-center px-3 py-2 rounded-lg text-base font-medium text-wine-light hover:text-wine-lightest hover:bg-wine-medium/20 transition-all duration-200"
                    onClick={() => setMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                    </svg>
                    Mis Transacciones
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="flex items-center w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center px-3 py-2 rounded-lg text-base font-medium text-wine-light hover:text-wine-lightest hover:bg-wine-medium/20 transition-all duration-200 border border-wine-medium/30"
                    onClick={() => setMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                    </svg>
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center px-3 py-2 rounded-lg text-base font-medium bg-gradient-to-r from-wine-medium to-wine-dark text-white hover:from-wine-light hover:to-wine-medium transition-all duration-200"
                    onClick={() => setMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                    </svg>
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
