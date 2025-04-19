import React from 'react';
import Link from 'next/link';
import VoiceCommandInterface from '@/components/VoiceCommandInterface';

// Componente para integrar comandos por voz en el dashboard
const DashboardVoiceWidget: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Comandos por Voz</h2>
        <Link 
          href="/voice-commands" 
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          Ver página completa
        </Link>
      </div>
      
      <VoiceCommandInterface />
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Prueba diciendo: "Crea un post para Instagram sobre mi producto"</p>
      </div>
    </div>
  );
};

export default DashboardVoiceWidget;
