import React from 'react';
import VoiceCommandInterface from '@/components/VoiceCommandInterface';

// Componente para integrar comandos por voz en el dashboard
const VoiceCommandPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Comandos por Voz GENIA</h1>
      
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">¿Cómo funciona?</h2>
          <p className="mb-4">
            Los comandos por voz te permiten interactuar con GENIA de forma natural y eficiente.
            Simplemente haz clic en el botón "Hablar con GENIA" y di lo que necesitas.
          </p>
          
          <h3 className="text-lg font-medium mt-6 mb-2">Ejemplos de comandos:</h3>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li><strong>Creación de contenido:</strong> "Crea un artículo sobre tendencias de marketing para 2025"</li>
            <li><strong>Publicidad:</strong> "Diseña una campaña para promocionar mi nuevo producto en Instagram"</li>
            <li><strong>Estrategia:</strong> "Analiza el rendimiento de mi negocio y sugiere mejoras"</li>
            <li><strong>Embudos:</strong> "Optimiza mi embudo de ventas para aumentar conversiones"</li>
            <li><strong>Calendario:</strong> "Organiza mi agenda para la próxima semana"</li>
          </ul>
          
          <p className="text-sm text-gray-600 italic">
            Nota: GENIA procesará tu comando y determinará automáticamente qué clon especializado
            debe encargarse de ejecutar la tarea solicitada.
          </p>
        </div>
        
        <VoiceCommandInterface />
        
        <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-100">
          <h2 className="text-lg font-semibold mb-3 text-blue-800">Consejos para mejores resultados</h2>
          <ul className="space-y-2 text-blue-700">
            <li>• Habla con claridad y a un ritmo normal</li>
            <li>• Especifica la acción que deseas realizar</li>
            <li>• Incluye detalles relevantes en tu solicitud</li>
            <li>• Utiliza un ambiente con poco ruido de fondo</li>
            <li>• Si GENIA no entiende correctamente, intenta reformular tu solicitud</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VoiceCommandPage;
