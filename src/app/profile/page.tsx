import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos del usuario
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setBusinessName(user.business_name || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      // En una implementación real, aquí se haría una llamada a la API para actualizar el perfil
      const token = localStorage.getItem('genia_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          business_name: businessName
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al actualizar perfil');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Perfil de Usuario</h1>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Información Personal</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Actualiza tus datos personales y preferencias.</p>
          </div>

          <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
            {success && (
              <div className="rounded-md bg-green-50 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">Perfil actualizado correctamente</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-md bg-red-50 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={email}
                  disabled
                  className="mt-1 bg-gray-100 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                <p className="mt-1 text-xs text-gray-500">El correo electrónico no se puede cambiar.</p>
              </div>

              <div>
                <label htmlFor="business-name" className="block text-sm font-medium text-gray-700">
                  Nombre de la empresa
                </label>
                <input
                  type="text"
                  name="business-name"
                  id="business-name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label htmlFor="plan" className="block text-sm font-medium text-gray-700">
                  Plan actual
                </label>
                <input
                  type="text"
                  name="plan"
                  id="plan"
                  value={user?.plan === 'free' ? 'Plan Gratuito' : 'Plan Premium'}
                  disabled
                  className="mt-1 bg-gray-100 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                <p className="mt-1 text-xs text-gray-500">
                  <a href="/subscription" className="text-blue-600 hover:text-blue-500">
                    Actualizar plan
                  </a>
                </p>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  'Guardar cambios'
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Seguridad</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Opciones de seguridad para tu cuenta.</p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Cambiar contraseña</h4>
                <p className="mt-1 text-sm text-gray-500">Actualiza tu contraseña para mantener tu cuenta segura.</p>
                <button
                  type="button"
                  className="mt-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cambiar contraseña
                </button>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900">Sesiones activas</h4>
                <p className="mt-1 text-sm text-gray-500">Cierra sesión en todos los dispositivos donde hayas iniciado sesión.</p>
                <button
                  type="button"
                  className="mt-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cerrar todas las sesiones
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
