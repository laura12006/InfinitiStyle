import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { me, getPublications } from '../api';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentPublications, setRecentPublications] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const userRes = await me();
        if (userRes.ok && userRes.data && userRes.data.logged_in) {
          setUser(userRes.data.user);
        }
      }
      
      // Cargar algunas publicaciones recientes para mostrar
      const pubRes = await getPublications();
      if (pubRes.ok) {
        setRecentPublications(pubRes.data.slice(0, 3)); // Solo las primeras 3
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wine-medium"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-wine-lightest via-white to-wine-lightest min-h-screen flex items-center">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-7xl font-bold text-wine-darkest mb-8 leading-tight">
              StyleInfinite
            </h1>
            <p className="text-2xl md:text-3xl text-wine-dark mb-12 leading-relaxed">
              La plataforma líder en moda sostenible
            </p>
            <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Compra, vende e intercambia prendas únicas mientras contribuyes a un futuro más sostenible. 
              Únete a nuestra comunidad de moda consciente.
            </p>
            
            {user ? (
              <div className="space-y-8">
                <h2 className="text-3xl font-semibold text-wine-darkest mb-8">
                  ¡Hola {user['1_nombre']}! 👋
                </h2>
                <div className="flex flex-col sm:flex-row justify-center gap-6">
                  <Link
                    to="/explorar"
                    className="bg-wine-medium text-white px-10 py-4 rounded-xl text-xl font-semibold hover:bg-wine-dark transition duration-300 shadow-xl transform hover:scale-105"
                  >
                    Explorar Prendas
                  </Link>
                  <Link
                    to="/publications/create"
                    className="border-3 border-wine-medium text-wine-medium px-10 py-4 rounded-xl text-xl font-semibold hover:bg-wine-medium hover:text-white transition duration-300 transform hover:scale-105"
                  >
                    Publicar Prenda
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row justify-center gap-6">
                  <Link
                    to="/register"
                    className="bg-wine-medium text-white px-10 py-4 rounded-xl text-xl font-semibold hover:bg-wine-dark transition duration-300 shadow-xl transform hover:scale-105"
                  >
                    Únete Ahora
                  </Link>
                  <Link
                    to="/login"
                    className="border-3 border-wine-medium text-wine-medium px-10 py-4 rounded-xl text-xl font-semibold hover:bg-wine-medium hover:text-white transition duration-300 transform hover:scale-105"
                  >
                    Iniciar Sesión
                  </Link>
                </div>
                <div className="mt-8">
                  <Link
                    to="/explorar"
                    className="inline-block text-lg text-wine-dark hover:text-wine-darkest transition duration-300 font-medium"
                  >
                    O explora sin registrarte →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-wine-darkest mb-6">
              ¿Por qué elegir StyleInfinite?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubre las ventajas de formar parte de nuestra comunidad de moda sostenible
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center p-8 bg-wine-lightest/30 rounded-2xl hover:shadow-lg transition duration-300">
              <div className="w-20 h-20 bg-wine-medium rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-wine-darkest mb-4">Moda Sostenible</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Contribuye al medio ambiente dando nueva vida a prendas pre-amadas y reduce tu huella ecológica
              </p>
            </div>
            <div className="text-center p-8 bg-wine-lightest/30 rounded-2xl hover:shadow-lg transition duration-300">
              <div className="w-20 h-20 bg-wine-medium rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-wine-darkest mb-4">Intercambia o Vende</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Elige entre vender tus prendas para ganar dinero o intercambiarlas por algo completamente nuevo
              </p>
            </div>
            <div className="text-center p-8 bg-wine-lightest/30 rounded-2xl hover:shadow-lg transition duration-300">
              <div className="w-20 h-20 bg-wine-medium rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-wine-darkest mb-4">Comunidad Verificada</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Conecta con una comunidad de personas que aman la moda consciente y el consumo responsable
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Estadísticas */}
      <div className="py-20 bg-gradient-to-r from-wine-darkest to-wine-medium text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl md:text-5xl font-bold mb-3">10K+</div>
              <div className="text-lg md:text-xl opacity-90">Usuarios Activos</div>
              <div className="text-sm opacity-75 mt-2">Y creciendo cada día</div>
            </div>
            <div className="p-6">
              <div className="text-4xl md:text-5xl font-bold mb-3">50K+</div>
              <div className="text-lg md:text-xl opacity-90">Prendas Vendidas</div>
              <div className="text-sm opacity-75 mt-2">Moda circular en acción</div>
            </div>
            <div className="p-6">
              <div className="text-4xl md:text-5xl font-bold mb-3">95%</div>
              <div className="text-lg md:text-xl opacity-90">Satisfacción</div>
              <div className="text-sm opacity-75 mt-2">Clientes felices</div>
            </div>
            <div className="p-6">
              <div className="text-4xl md:text-5xl font-bold mb-3">2.5T</div>
              <div className="text-lg md:text-xl opacity-90">CO² Ahorrado</div>
              <div className="text-sm opacity-75 mt-2">Impacto positivo real</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección Sobre Nosotros */}
      <div className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-wine-darkest mb-8">
                Nuestra Misión: Revolucionar la Moda
              </h2>
              <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                <p>
                  En StyleInfinite creemos que la moda debe ser <strong className="text-wine-darkest">accesible, sostenible y única</strong>. 
                  Nuestra plataforma conecta personas que buscan darle una nueva vida a sus prendas favoritas con aquellos 
                  que buscan piezas únicas y de calidad.
                </p>
                <p>
                  Cada prenda que se compra y vende en nuestra plataforma contribuye a reducir el desperdicio textil y 
                  promueve un consumo más consciente. <strong className="text-wine-darkest">No es solo moda, es un movimiento.</strong>
                </p>
                <div className="bg-wine-lightest/30 p-6 rounded-xl border-l-4 border-wine-medium">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                      </svg>
                    </div>
                    <p className="font-semibold text-wine-darkest">¿Sabías que...?</p>
                  </div>
                  <p className="text-gray-600">
                    La industria de la moda es la segunda más contaminante del mundo. Al comprar ropa de segunda mano, 
                    reduces tu huella de carbono hasta en un 82%.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-wine-medium to-wine-darkest rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">Nuestros Valores</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex-shrink-0 flex items-center justify-center mt-1">
                      <span className="text-xs">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Sostenibilidad</h4>
                      <p className="text-sm opacity-90">Cuidamos el planeta con cada transacción</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex-shrink-0 flex items-center justify-center mt-1">
                      <span className="text-xs">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Comunidad</h4>
                      <p className="text-sm opacity-90">Construimos conexiones auténticas</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex-shrink-0 flex items-center justify-center mt-1">
                      <span className="text-xs">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Accesibilidad</h4>
                      <p className="text-sm opacity-90">Moda de calidad para todos los presupuestos</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex-shrink-0 flex items-center justify-center mt-1">
                      <span className="text-xs">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Innovación</h4>
                      <p className="text-sm opacity-90">Tecnología al servicio de la moda consciente</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Testimonios */}
      <div className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-wine-darkest mb-6">
              Lo que dicen nuestros usuarios
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Miles de personas ya forman parte de la comunidad StyleInfinite
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
              </div>
              <blockquote className="text-gray-700 mb-6 text-lg leading-relaxed">
                "He encontrado piezas únicas que no conseguiría en ningún otro lugar. La calidad es excelente y los precios increíbles."
              </blockquote>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-wine-medium rounded-full flex items-center justify-center text-white font-bold mr-4">
                  M
                </div>
                <div>
                  <div className="font-semibold text-wine-darkest">María González</div>
                  <div className="text-sm text-gray-500">Compradora frecuente</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
              </div>
              <blockquote className="text-gray-700 mb-6 text-lg leading-relaxed">
                "Vender mi ropa nunca había sido tan fácil. La plataforma es intuitiva y he generado buenos ingresos extra."
              </blockquote>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-wine-medium rounded-full flex items-center justify-center text-white font-bold mr-4">
                  C
                </div>
                <div>
                  <div className="font-semibold text-wine-darkest">Carlos Ruiz</div>
                  <div className="text-sm text-gray-500">Vendedor activo</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
              </div>
              <blockquote className="text-gray-700 mb-6 text-lg leading-relaxed">
                "Me encanta formar parte de esta comunidad sostenible. Cada compra tiene un propósito y eso se siente genial."
              </blockquote>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-wine-medium rounded-full flex items-center justify-center text-white font-bold mr-4">
                  A
                </div>
                <div>
                  <div className="font-semibold text-wine-darkest">Ana Martínez</div>
                  <div className="text-sm text-gray-500">Miembro desde 2023</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección FAQ */}
      <div className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-wine-darkest mb-6">
              Preguntas Frecuentes
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Resolvemos tus dudas sobre StyleInfinite
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-wine-lightest/20 rounded-xl p-6">
              <h3 className="font-semibold text-wine-darkest text-lg mb-3">¿Cómo funciona StyleInfinite?</h3>
              <p className="text-gray-700">
                StyleInfinite es una plataforma donde puedes vender, comprar o intercambiar ropa de segunda mano. 
                Simplemente crea tu cuenta, sube fotos de tus prendas, y comienza a conectar con otros usuarios.
              </p>
            </div>

            <div className="bg-wine-lightest/20 rounded-xl p-6">
              <h3 className="font-semibold text-wine-darkest text-lg mb-3">¿Es seguro comprar en StyleInfinite?</h3>
              <p className="text-gray-700">
                Sí, todos nuestros usuarios están verificados y contamos con un sistema de calificaciones. 
                Además, ofrecemos protección al comprador y políticas de devolución claras.
              </p>
            </div>

            <div className="bg-wine-lightest/20 rounded-xl p-6">
              <h3 className="font-semibold text-wine-darkest text-lg mb-3">¿Qué tipos de prendas puedo encontrar?</h3>
              <p className="text-gray-700">
                Tenemos una gran variedad: desde ropa casual hasta prendas de diseñador, accesorios, zapatos, 
                y piezas vintage únicas. Todas las tallas y estilos están representados.
              </p>
            </div>

            <div className="bg-wine-lightest/20 rounded-xl p-6">
              <h3 className="font-semibold text-wine-darkest text-lg mb-3">¿Cómo puedo vender mis prendas?</h3>
              <p className="text-gray-700">
                Crear una publicación es muy fácil: toma fotos de calidad, describe la prenda detalladamente, 
                establece un precio justo y elige si quieres vender o intercambiar. Nosotros te ayudamos con el resto.
              </p>
            </div>

            <div className="bg-wine-lightest/20 rounded-xl p-6">
              <h3 className="font-semibold text-wine-darkest text-lg mb-3">¿Hay algún costo por usar la plataforma?</h3>
              <p className="text-gray-700">
                Registrarse y navegar es completamente gratis. Solo cobramos una pequeña comisión cuando realizas una venta exitosa, 
                lo que nos ayuda a mantener la plataforma funcionando perfectamente.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Impacto Ambiental */}
      <div className="py-24 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-wine-darkest mb-6">
              Nuestro Impacto Ambiental
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Juntos estamos creando un impacto positivo real en el medio ambiente
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                </svg>
              </div>
              <h3 className="font-bold text-2xl text-wine-darkest mb-2">2.5 Toneladas</h3>
              <p className="text-gray-600">CO² evitado por reutilización de prendas</p>
            </div>

            <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path>
                </svg>
              </div>
              <h3 className="font-bold text-2xl text-wine-darkest mb-2">500M Litros</h3>
              <p className="text-gray-600">Agua ahorrada en producción textil</p>
            </div>

            <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
              </div>
              <h3 className="font-bold text-2xl text-wine-darkest mb-2">50K Prendas</h3>
              <p className="text-gray-600">Rescatadas de terminar en vertederos</p>
            </div>

            <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="font-bold text-2xl text-wine-darkest mb-2">10K Personas</h3>
              <p className="text-gray-600">Comprometidas con moda sostenible</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Publications Preview */}
      {recentPublications.length > 0 && (
        <div className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-wine-darkest mb-6">
                Publicaciones Destacadas
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Descubre las últimas prendas agregadas a nuestra plataforma
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {recentPublications.map((pub) => (
                <div key={pub.id_publicacion} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
                  <div className="aspect-square bg-gradient-to-br from-wine-lightest to-gray-100 rounded-xl mb-6 flex items-center justify-center">
                    <svg className="w-20 h-20 text-wine-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-wine-darkest">{pub.nombre}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">{pub.descripcion_prenda}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-wine-medium">${pub.valor}</span>
                    <span className="bg-wine-lightest text-wine-darkest px-3 py-1 rounded-full text-sm font-medium">
                      {pub.tipo_publicacion}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link
                to="/explorar"
                className="bg-wine-medium text-white px-10 py-4 rounded-xl text-xl font-semibold hover:bg-wine-dark transition duration-300 shadow-lg transform hover:scale-105"
              >
                Ver Todas las Publicaciones
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Cómo Empezar */}
      <div className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-wine-darkest mb-6">
              Comienza en 3 Simples Pasos
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Únete a la revolución de la moda sostenible en minutos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-wine-medium rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold">
                1
              </div>
              <h3 className="text-2xl font-semibold text-wine-darkest mb-4">Regístrate Gratis</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Crea tu cuenta en menos de 2 minutos. Solo necesitas tu email y ya podrás comenzar a explorar.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-wine-medium rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold">
                2
              </div>
              <h3 className="text-2xl font-semibold text-wine-darkest mb-4">Explora o Publica</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Descubre miles de prendas únicas o sube fotos de tu ropa para vender o intercambiar.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-wine-medium rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold">
                3
              </div>
              <h3 className="text-2xl font-semibold text-wine-darkest mb-4">Conecta y Disfruta</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Conecta con otros usuarios, realiza transacciones seguras y disfruta de tu nueva moda sostenible.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Beneficios Premium */}
      <div className="py-24 bg-gradient-to-br from-wine-lightest/50 to-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-wine-darkest mb-8">
              ¿Por qué elegir StyleInfinite sobre otras plataformas?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-wine-medium">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-wine-darkest">Transacciones Seguras</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Sistema de pagos protegido, verificación de usuarios y políticas claras de devolución.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-wine-medium">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-wine-darkest">Fácil de Usar</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Interface intuitiva diseñada para que cualquier persona pueda usarla sin complicaciones.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-wine-medium">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-wine-darkest">Comunidad Activa</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Únete a una comunidad vibrante de amantes de la moda sostenible y consciente.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-wine-medium">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-wine-darkest">Impacto Real</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Cada transacción contribuye directamente a reducir el desperdicio textil y cuidar el planeta.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-wine-darkest text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
            ¿Listo para comenzar tu viaje en la moda sostenible?
          </h2>
          <p className="text-xl text-wine-lightest mb-12 max-w-3xl mx-auto leading-relaxed">
            Únete a miles de personas que ya forman parte de nuestra comunidad y descubre 
            una nueva forma de experimentar la moda responsable y consciente.
          </p>
          {!user && (
            <Link
              to="/register"
              className="bg-white text-wine-darkest px-10 py-4 rounded-xl text-xl font-semibold hover:bg-gray-100 transition duration-300 shadow-lg transform hover:scale-105"
            >
              Crear Cuenta
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
