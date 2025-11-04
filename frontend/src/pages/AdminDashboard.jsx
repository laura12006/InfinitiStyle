import React, { useState, useEffect } from "react";
import { getUsers, updateUser } from "../api";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      if (response.ok) {
        setUsers(response.data);
      } else {
        setError("Error al cargar usuarios");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId, newStatus) => {
    try {
      const response = await updateUser(userId, {
        verified: newStatus === "verified" ? 1 : 0,
      });
      if (response.ok) await loadUsers();
      else setError("Error al actualizar usuario");
    } catch {
      setError("Error de conexión");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#e9ecef]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#8f3d38]"></div>
      </div>
    );
  }

  // Datos para la gráfica
  const totalUsers = users.length;
  const verifiedCount = users.filter((u) => u.verified).length;
  const unverifiedCount = users.filter((u) => !u.verified).length;
  const verifiedPercent = totalUsers ? (verifiedCount / totalUsers) * 100 : 0;
  const unverifiedPercent = totalUsers
    ? (unverifiedCount / totalUsers) * 100
    : 0;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#e9ecef] text-[#350a06]">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#350a06] text-white p-6">
        <h2 className="text-2xl font-bold mb-8">StyleInfinite</h2>
        <nav className="space-y-3">
          <a href="#" className="block bg-[#a64d47] px-3 py-2 rounded-md font-semibold">
            Usuarios
          </a>
          <a href="#" className="block hover:bg-[#a64d47] px-3 py-2 rounded-md">
            Reportes
          </a>
          <a href="#" className="block hover:bg-[#a64d47] px-3 py-2 rounded-md">
            Estadísticas
          </a>
          <a href="#" className="block hover:bg-[#a64d47] px-3 py-2 rounded-md">
            Configuración
          </a>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 md:p-10 pb-20 md:pb-10">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">
          Panel de Administración
        </h1>

        {/* Tarjetas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <h3 className="text-[#8f3d38] font-semibold">Total Usuarios</h3>
            <p className="text-3xl font-bold mt-2">{totalUsers}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <h3 className="text-[#8f3d38] font-semibold">Verificados</h3>
            <p className="text-3xl font-bold mt-2">{verifiedCount}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <h3 className="text-[#8f3d38] font-semibold">No Verificados</h3>
            <p className="text-3xl font-bold mt-2">{unverifiedCount}</p>
          </div>
        </div>

        {/* Gráfica sin dependencias */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <h3 className="text-lg font-semibold text-[#350a06] mb-6 text-center">
            Distribución de Usuarios
          </h3>

          {/* Contenedor de gráfica */}
          <div className="relative w-full h-56 flex items-end justify-around">
            {/* Eje izquierdo */}
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300"></div>

            {/* Barra Verificados */}
            <div className="flex flex-col items-center">
              <div
                className="w-12 bg-[#8f3d38] rounded-t-md transition-all duration-700 shadow-md"
                style={{ height: `${verifiedPercent * 1.5}px` }}
              ></div>
              <p className="mt-2 text-sm font-semibold text-[#8f3d38]">
                Verificados
              </p>
              <span className="text-xs font-medium text-gray-600">
                {verifiedCount} ({verifiedPercent.toFixed(1)}%)
              </span>
            </div>

            {/* Barra No Verificados */}
            <div className="flex flex-col items-center">
              <div
                className="w-12 bg-[#a64d47] rounded-t-md transition-all duration-700 shadow-md"
                style={{ height: `${unverifiedPercent * 1.5}px` }}
              ></div>
              <p className="mt-2 text-sm font-semibold text-[#a64d47]">
                No Verificados
              </p>
              <span className="text-xs font-medium text-gray-600">
                {unverifiedCount} ({unverifiedPercent.toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* Línea base */}
          <div className="mt-4 border-t border-gray-300"></div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 border border-red-400 rounded p-3 mb-6">
            {error}
          </div>
        )}

        {/* Tabla */}
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-[#f8f9fa]">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">
                    Usuario
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">
                    Rol
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden sm:table-cell">
                    Publicaciones
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden md:table-cell">
                    Valoración
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id_usuario}>
                    <td className="px-4 py-3 flex items-center">
                      {user.foto && (
                        <img
                          src={user.foto}
                          alt=""
                          className="h-8 w-8 rounded-full mr-3 object-cover"
                        />
                      )}
                      <span className="font-medium">
                        {user["1_nombre"]} {user["1_apellido"]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 break-all">
                      {user.correo_electronico}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{user.rol}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.verified
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.verified ? "Verificado" : "No verificado"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 hidden sm:table-cell">
                      {user.total_publicaciones}
                    </td>
                    <td className="px-4 py-3 text-gray-700 hidden md:table-cell">
                      {user.promedio_valoraciones
                        ? `${user.promedio_valoraciones.toFixed(1)}/5`
                        : "Sin valoraciones"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          handleUpdateUser(
                            user.id_usuario,
                            user.verified ? "unverified" : "verified"
                          )
                        }
                        className={`px-3 py-1 rounded-md text-white font-semibold transition ${
                          user.verified
                            ? "bg-[#b91c1c] hover:bg-[#7f1d1d]"
                            : "bg-[#8f3d38] hover:bg-[#a64d47]"
                        }`}
                      >
                        {user.verified ? "Desverificar" : "Verificar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Barra inferior (responsive) */}
      <nav className="fixed bottom-0 right-0 left-0 bg-[#350a06] text-white flex justify-around items-center py-3 md:hidden rounded-t-xl shadow-lg">
        <button className="flex flex-col items-center text-sm">
          <span>🏠</span>
          <span>Inicio</span>
        </button>
        <button className="flex flex-col items-center text-sm">
          <span>👥</span>
          <span>Usuarios</span>
        </button>
        <button className="flex flex-col items-center text-sm">
          <span>📊</span>
          <span>Estadísticas</span>
        </button>
        <button className="flex flex-col items-center text-sm">
          <span>⚙️</span>
          <span>Config</span>
        </button>
      </nav>
    </div>
  );
}
