import React from 'react';
import { useClone } from '@/hooks/useClone';

interface CloneInterfaceProps {
  cloneType: 'content' | 'ads' | 'ceo' | 'voice' | 'funnel' | 'calendar';
  title: string;
  description: string;
  placeholder: string;
}

const CloneInterface: React.FC<CloneInterfaceProps> = ({
  cloneType,
  title,
  description,
  placeholder,
}) => {
  const { loading, error, response, sendRequest, clearResponse } = useClone();
  const [message, setMessage] = React.useState('');
  const [showResponse, setShowResponse] = React.useState(false);

  // Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    await sendRequest(cloneType, message);
    setShowResponse(true);
  };

  // Limpiar respuesta y formulario
  const handleReset = () => {
    clearResponse();
    setMessage('');
    setShowResponse(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600 mb-6">{description}</p>

      {!showResponse ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Tu solicitud
            </label>
            <textarea
              id="message"
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder={placeholder}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </>
              ) : (
                'Enviar'
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          {error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
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
          ) : (
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Respuesta:</h3>
              <div className="prose max-w-none">
                {response?.response.split('\n').map((line, index) => (
                  <p key={index} className="mb-2">{line}</p>
                ))}
              </div>
              {response?.credits_remaining !== undefined && (
                <div className="mt-4 text-sm text-gray-500">
                  Créditos restantes: {response.credits_remaining}
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end">
            <button
              onClick={handleReset}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Nueva consulta
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CloneInterface;
