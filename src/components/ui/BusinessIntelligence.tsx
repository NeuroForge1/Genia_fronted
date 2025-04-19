import React, { useState, useEffect } from 'react';
import { useAdvancedAnalytics, CloneInsight, PlatformInsight, UserSegment, PredictiveModel } from '../../hooks/useAdvancedAnalytics';
import { useTheme } from '../../hooks/theme/useTheme';

const BusinessIntelligence = () => {
  const { 
    loading, 
    error, 
    predictiveModels, 
    cloneInsights, 
    platformInsights, 
    userSegments,
    loadAdvancedAnalytics,
    exportAdvancedAnalytics
  } = useAdvancedAnalytics();
  
  const { isDarkMode, getColorClass } = useTheme();
  const [activeTab, setActiveTab] = useState<string>('insights');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'json'>('pdf');
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  
  useEffect(() => {
    loadAdvancedAnalytics();
  }, [loadAdvancedAnalytics]);
  
  const handleExport = async () => {
    setExportLoading(true);
    try {
      const data = await exportAdvancedAnalytics(exportFormat);
      if (data) {
        // Crear blob y descargar
        const blob = new Blob([data], { 
          type: exportFormat === 'json' 
            ? 'application/json' 
            : 'application/octet-stream' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `genia_business_intelligence_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error al exportar datos:', err);
    } finally {
      setExportLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${getColorClass('border')}`}></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`p-4 rounded-md ${isDarkMode ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-800'}`}>
        <p>{error}</p>
      </div>
    );
  }
  
  return (
    <div className={`${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen transition-colors duration-200`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Business Intelligence</h1>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Opciones de exportación */}
            <div className="flex gap-2">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as any)}
                className={`px-4 py-2 rounded-md ${isDarkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'} border`}
                aria-label="Seleccionar formato de exportación"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="json">JSON</option>
              </select>
              
              <button
                onClick={handleExport}
                disabled={exportLoading}
                className={`px-4 py-2 rounded-md ${getColorClass('primary')} text-white flex items-center`}
                aria-label="Exportar informe"
              >
                {exportLoading ? (
                  <span className="inline-block animate-spin mr-2">⟳</span>
                ) : (
                  <i className="fas fa-file-export mr-2"></i>
                )}
                Exportar Informe
              </button>
            </div>
          </div>
        </div>
        
        {/* Pestañas de navegación */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <ul className="flex flex-wrap -mb-px">
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('insights')}
                className={`inline-block py-4 px-4 text-sm font-medium text-center rounded-t-lg border-b-2 ${
                  activeTab === 'insights'
                    ? `${getColorClass('border')} ${getColorClass('accent')}`
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                }`}
                aria-label="Ver insights de negocio"
              >
                Insights de Negocio
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('predictive')}
                className={`inline-block py-4 px-4 text-sm font-medium text-center rounded-t-lg border-b-2 ${
                  activeTab === 'predictive'
                    ? `${getColorClass('border')} ${getColorClass('accent')}`
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                }`}
                aria-label="Ver análisis predictivo"
              >
                Análisis Predictivo
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('segments')}
                className={`inline-block py-4 px-4 text-sm font-medium text-center rounded-t-lg border-b-2 ${
                  activeTab === 'segments'
                    ? `${getColorClass('border')} ${getColorClass('accent')}`
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                }`}
                aria-label="Ver segmentación de usuarios"
              >
                Segmentación de Usuarios
              </button>
            </li>
          </ul>
        </div>
        
        {/* Contenido de las pestañas */}
        <div className="mt-6">
          {activeTab === 'insights' && (
            <InsightsTab 
              cloneInsights={cloneInsights} 
              platformInsights={platformInsights} 
              isDarkMode={isDarkMode} 
              colorClass={getColorClass('primary')} 
            />
          )}
          
          {activeTab === 'predictive' && (
            <PredictiveTab 
              predictiveModels={predictiveModels} 
              isDarkMode={isDarkMode} 
              colorClass={getColorClass('primary')} 
            />
          )}
          
          {activeTab === 'segments' && (
            <SegmentsTab 
              userSegments={userSegments} 
              isDarkMode={isDarkMode} 
              colorClass={getColorClass('primary')} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Componente para la pestaña de insights
const InsightsTab = ({ 
  cloneInsights, 
  platformInsights, 
  isDarkMode, 
  colorClass 
}: { 
  cloneInsights: CloneInsight[], 
  platformInsights: PlatformInsight[], 
  isDarkMode: boolean, 
  colorClass: string 
}) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Insights de Negocio</h2>
      
      {/* Insights de clones */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Análisis FODA de Clones</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {cloneInsights.map((insight, index) => (
            <div 
              key={index} 
              className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-colors duration-200`}
            >
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-medium">
                  Clon {insight.clone_type.charAt(0).toUpperCase() + insight.clone_type.slice(1)}
                </h4>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  insight.potential_impact === 'high' 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                    : insight.potential_impact === 'medium' 
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}>
                  Impacto {
                    insight.potential_impact === 'high' 
                      ? 'Alto' 
                      : insight.potential_impact === 'medium' 
                        ? 'Medio' 
                        : 'Bajo'
                  }
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-green-900 bg-opacity-20' : 'bg-green-50'}`}>
                  <h5 className="font-medium text-green-600 dark:text-green-400 mb-1">Fortaleza</h5>
                  <p className="text-sm">{insight.strength}</p>
                </div>
                
                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-red-900 bg-opacity-20' : 'bg-red-50'}`}>
                  <h5 className="font-medium text-red-600 dark:text-red-400 mb-1">Debilidad</h5>
                  <p className="text-sm">{insight.weakness}</p>
                </div>
                
                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-blue-900 bg-opacity-20' : 'bg-blue-50'}`}>
                  <h5 className="font-medium text-blue-600 dark:text-blue-400 mb-1">Oportunidad</h5>
                  <p className="text-sm">{insight.opportunity}</p>
                </div>
                
                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-purple-900 bg-opacity-20' : 'bg-purple-50'}`}>
                  <h5 className="font-medium text-purple-600 dark:text-purple-400 mb-1">Recomendación</h5>
                  <p className="text-sm">{insight.recommendation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Insights de plataformas */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Rendimiento por Plataforma</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platformInsights.map((insight, index) => (
            <div 
              key={index} 
              className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-colors duration-200`}
            >
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-medium">
                  {insight.platform.charAt(0).toUpperCase() + insight.platform.slice(1)}
                </h4>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  insight.engagement_trend === 'increasing' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : insight.engagement_trend === 'stable' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {insight.engagement_trend === 'increasing' 
                    ? '↑ Creciendo' 
                    : insight.engagement_trend === 'stable' 
                      ? '→ Estable' 
                      : '↓ Decreciendo'
                  }
                </span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Sentimiento del usuario</span>
                    <span className="font-medium">{insight.user_sentiment.toFixed(1)}/5</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        width: `${(insight.user_sentiment / 5) * 100}%`,
                        backgroundColor: getColorForRating(insight.user_sentiment)
                      }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Rendimiento del contenido</span>
                    <span className="font-medium">{insight.content_performance.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        width: `${insight.content_performance}%`,
                        backgroundColor: getColorForPercentage(insight.content_performance)
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className={`mt-4 p-3 rounded-md ${isDarkMode ? 'bg-blue-900 bg-opacity-20' : 'bg-blue-50'}`}>
                  <h5 className="font-medium text-blue-600 dark:text-blue-400 mb-1">Recomendación</h5>
                  <p className="text-sm">{insight.recommendation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Componente para la pestaña de análisis predictivo
const PredictiveTab = ({ 
  predictiveModels, 
  isDarkMode, 
  colorClass 
}: { 
  predictiveModels: PredictiveModel[], 
  isDarkMode: boolean, 
  colorClass: string 
}) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Análisis Predictivo</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {predictiveModels.map((model, index) => (
          <div 
            key={index} 
            className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-colors duration-200`}
          >
            <h3 className="text-lg font-semibold mb-2">
              Modelo {model.model_type.charAt(0).toUpperCase() + model.model_type.slice(1)}
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Precisión</span>
                  <span className="font-medium">{(model.accuracy * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full" 
                    style={{ width: `${model.accuracy * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Intervalo de confianza</span>
                  <span className="font-medium">±{(model.confidence_interval * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${(1 - model.confidence_interval) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Última actualización: {new Date(model.last_updated).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-colors duration-200`}>
        <h3 className="text-lg font-semibold mb-4">Interpretación de Modelos Predictivos</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Modelo Lineal</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              El modelo lineal predice tendencias futuras asumiendo una relación lineal entre variables. Es útil para predecir métricas con crecimiento o decrecimiento constante, como el uso de créditos o la frecuencia de mensajes.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Modelo Exponencial</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              El modelo exponencial es adecuado para métricas que muestran crecimiento acelerado o desacelerado. Es especialmente útil para predecir la adopción de nuevas funcionalidades o el crecimiento de usuarios.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Modelo Estacional</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              El modelo estacional identifica patrones cíclicos en los datos, como variaciones por día de la semana o mes. Es ideal para predecir métricas con comportamiento repetitivo, como el uso de clones específicos en determinados momentos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para la pestaña de segmentación de usuarios
const SegmentsTab = ({ 
  userSegments, 
  isDarkMode, 
  colorClass 
}: { 
  userSegments: UserSegment[], 
  isDarkMode: boolean, 
  colorClass: string 
}) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Segmentación de Usuarios</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {userSegments.map((segment, index) => (
          <div 
            key={index} 
            className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-colors duration-200`}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">{segment.name}</h3>
              <span className={`px-2 py-1 text-sm rounded-full ${colorClass} text-white`}>
                {segment.size} usuarios
              </span>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {segment.description}
            </p>
            
            <div className="mb-4">
              <h4 className="font-medium mb-2">Características comunes</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
                {segment.common_traits.map((trait, i) => (
                  <li key={i}>{trait}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Clones recomendados</h4>
              <div className="flex flex-wrap gap-2">
                {segment.recommended_clones.map((clone, i) => (
                  <span 
                    key={i} 
                    className={`px-2 py-1 text-xs rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                  >
                    {clone.charAt(0).toUpperCase() + clone.slice(1)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Funciones auxiliares para colores
const getColorForRating = (rating: number): string => {
  if (rating >= 4) return '#22c55e'; // green-500
  if (rating >= 3) return '#eab308'; // yellow-500
  if (rating >= 2) return '#f97316'; // orange-500
  return '#ef4444'; // red-500
};

const getColorForPercentage = (percentage: number): string => {
  if (percentage >= 80) return '#22c55e'; // green-500
  if (percentage >= 60) return '#84cc16'; // lime-500
  if (percentage >= 40) return '#eab308'; // yellow-500
  if (percentage >= 20) return '#f97316'; // orange-500
  return '#ef4444'; // red-500
};

export default BusinessIntelligence;
