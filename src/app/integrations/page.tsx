import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';

const IntegrationsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para las integraciones
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappVerified, setWhatsappVerified] = useState(false);
  
  // Cargar estado de integraciones
  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        const token = localStorage.getItem('genia_token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/integrations/status`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.whatsapp && data.whatsapp.number) {
            setWhatsappNumber(data.whatsapp.number);
            setWhatsappVerified(data.whatsapp.verified);
          }
        }
      } catch (err) {
        console.error('Error fetching integrations:', err);
      }
    };
    
    fetchIntegrations();
  }, []);
  
  // Función para conectar WhatsApp
  const handleConnectWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);
    
    try {
      const token = localStorage.getItem('genia_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/integrations/whatsapp/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phone_number: whatsappNumber })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al conectar WhatsApp');
      }
      
      setSuccess(true);
      // En una implementación real, aquí se enviaría un código de verificación al número
      // y se mostraría un formulario para que el usuario lo ingrese
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Integraciones</h1>
        <p className="text-gray-600 mb-8">
          Conecta Genia con otras plataformas y servicios para maximizar su potencial.
        </p>
        
        {/* WhatsApp Integration */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">WhatsApp</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Conecta tu número de WhatsApp para recibir notificaciones y usar los clones desde tu teléfono.
              </p>
            </div>
            <div className="flex-shrink-0">
              {whatsappVerified ? (
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Conectado
                </span>
              ) : (
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                  No conectado
                </span>
              )}
            </div>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            {success && (
              <div className="rounded-md bg-green-50 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      Hemos enviado un mensaje a tu número de WhatsApp. Por favor, sigue las instrucciones para completar la verificación.
                    </p>
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
            
            {whatsappVerified ? (
              <div>
                <p className="text-sm text-gray-500 mb-4">
                  Tu número de WhatsApp <span className="font-medium text-gray-900">{whatsappNumber}</span> está conectado a Genia.
                </p>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => {
                    setWhatsappVerified(false);
                    setWhatsappNumber('');
                  }}
                >
                  Desconectar WhatsApp
                </button>
              </div>
            ) : (
              <form onSubmit={handleConnectWhatsApp} className="space-y-4">
                <div>
                  <label htmlFor="whatsapp-number" className="block text-sm font-medium text-gray-700">
                    Número de WhatsApp
                  </label>
                  <div className="mt-1">
                    <input
                      type="tel"
                      name="whatsapp-number"
                      id="whatsapp-number"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="+34612345678"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      required
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Ingresa tu número con el código de país (ej. +34 para España)
                  </p>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={loading || !whatsappNumber}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Conectando...
                      </>
                    ) : (
                      'Conectar WhatsApp'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        
        {/* Social Media Integrations */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Redes Sociales</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Conecta tus cuentas de redes sociales para publicar contenido directamente desde Genia.
            </p>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              {/* Facebook */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900">Facebook</h4>
                    <p className="text-xs text-gray-500">No conectado</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => {
                    // En una implementación real, aquí se iniciaría el flujo de OAuth
                    alert('Esta funcionalidad estará disponible próximamente');
                  }}
                >
                  Conectar
                </button>
              </div>
              
              {/* Instagram */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900">Instagram</h4>
                    <p className="text-xs text-gray-500">No conectado</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => {
                    // En una implementación real, aquí se iniciaría el flujo de OAuth
                    alert('Esta funcionalidad estará disponible próximamente');
                  }}
                >
                  Conectar
                </button>
              </div>
              
              {/* Twitter/X */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-black rounded-full flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900">Twitter/X</h4>
                    <p className="text-xs text-gray-500">No conectado</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => {
                    // En una implementación real, aquí se iniciaría el flujo de OAuth
                    alert('Esta funcionalidad estará disponible próximamente');
                  }}
                >
                  Conectar
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* API Keys */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">API Keys</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Gestiona tus claves de API para integrar Genia con tus propias aplicaciones.
            </p>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <p className="text-sm text-gray-500 mb-4">
              {user?.plan === 'premium' ? (
                'Como usuario premium, puedes generar claves de API para integrar Genia con tus propias aplicaciones.'
              ) : (
                'Las claves de API solo están disponibles para usuarios premium. Actualiza tu plan para acceder a esta funcionalidad.'
              )}
            </p>
            
            <button
              type="button"
              disabled={user?.plan !== 'premium'}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              onClick={() => {
                if (user?.plan === 'premium') {
                  // En una implementación real, aquí se generaría una nueva API key
                  alert('Esta funcionalidad estará disponible próximamente');
                }
              }}
            >
              Generar nueva API Key
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default IntegrationsPage;
