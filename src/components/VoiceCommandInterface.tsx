import React, { useState } from 'react';
import useVoiceCommands from '@/hooks/useVoiceCommands';

// Componente para la interfaz de comandos por voz
const VoiceCommandInterface: React.FC = () => {
  const {
    isSupported,
    status,
    transcript,
    startListening,
    stopListening,
    response,
    loading,
    error
  } = useVoiceCommands();

  const [showTranscript, setShowTranscript] = useState(false);

  // Determinar el color del botón según el estado
  const getButtonColor = () => {
    switch (status) {
      case 'listening':
        return 'bg-red-500 hover:bg-red-600';
      case 'processing':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'error':
        return 'bg-gray-500 hover:bg-gray-600';
      default:
        return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  // Determinar el texto del botón según el estado
  const getButtonText = () => {
    switch (status) {
      case 'listening':
        return 'Escuchando...';
      case 'processing':
        return 'Procesando...';
      case 'error':
        return 'Error - Intentar de nuevo';
      default:
        return 'Hablar con GENIA';
    }
  };

  // Manejar clic en el botón
  const handleButtonClick = () => {
    if (status === 'listening') {
      stopListening();
    } else if (status === 'inactive' || status === 'error') {
      startListening();
      setShowTranscript(true);
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
        Tu navegador no soporta comandos por voz. Por favor, utiliza Chrome, Edge o Safari.
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-center">Comandos por Voz</h2>
      
      <button
        onClick={handleButtonClick}
        disabled={status === 'processing'}
        className={`w-full py-3 px-4 rounded-full text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${getButtonColor()}`}
      >
        {getButtonText()}
      </button>
      
      {showTranscript && transcript && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <p className="text-sm font-medium text-gray-500">Tu mensaje:</p>
          <p className="text-gray-800">{transcript}</p>
        </div>
      )}
      
      {loading && (
        <div className="mt-4 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {response && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-500">Respuesta de GENIA:</p>
          <p className="text-gray-800">{response.response}</p>
          <p className="text-xs text-gray-500 mt-2">
            Procesado por clon: {response.clone_type}
          </p>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg">
          <p className="text-sm font-medium text-red-500">Error:</p>
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      <div className="mt-6 text-xs text-gray-500">
        <p>Puedes dar órdenes como:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>"Crea un artículo sobre marketing digital"</li>
          <li>"Diseña una campaña para Instagram"</li>
          <li>"Analiza el rendimiento de mi negocio"</li>
          <li>"Optimiza mi embudo de ventas"</li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceCommandInterface;
