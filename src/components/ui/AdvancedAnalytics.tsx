import React, { useState } from 'react';
import { useAnalytics, ClonePerformance, PlatformUsage, UsagePrediction, PeriodComparison, UserRecommendation } from '../../hooks/useAnalytics';
import { useTheme } from '../../hooks/theme/useTheme';

const AdvancedAnalytics = () => {
  const { 
    loading, 
    error, 
    clonePerformance, 
    platformUsage, 
    usagePredictions, 
    periodComparisons, 
    recommendations,
    loadAllMetrics,
    exportData
  } = useAnalytics();
  
  const { isDarkMode, getColorClass } = useTheme();
  const [dateRange, setDateRange] = useState<string>('month');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'excel'>('csv');
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('performance');
  
  React.useEffect(() => {
    loadAllMetrics(dateRange);
  }, [dateRange, loadAllMetrics]);
  
  const handleExport = async () => {
    setExportLoading(true);
    try {
      const data = await exportData(exportFormat, dateRange);
      if (data) {
        // Crear blob y descargar
        const blob = new Blob([data], { 
          type: exportFormat === 'json' 
            ? 'application/json' 
            : 'text/csv' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `genia_analytics_${dateRange}_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
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
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Análisis Avanzado</h1>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Selector de rango de fechas */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className={`px-4 py-2 rounded-md ${isDarkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'} border`}
              aria-label="Seleccionar rango de fechas"
            >
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
              <option value="quarter">Último trimestre</option>
              <option value="year">Último año</option>
            </select>
            
            {/* Opciones de exportación */}
            <div className="flex gap-2">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as any)}
                className={`px-4 py-2 rounded-md ${isDarkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'} border`}
                aria-label="Seleccionar formato de exportación"
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="excel">Excel</option>
              </select>
              
              <button
                onClick={handleExport}
                disabled={exportLoading}
                className={`px-4 py-2 rounded-md ${getColorClass('primary')} text-white flex items-center`}
                aria-label="Exportar datos"
              >
                {exportLoading ? (
                  <span className="inline-block animate-spin mr-2">⟳</span>
                ) : (
                  <i className="fas fa-download mr-2"></i>
                )}
                Exportar
              </button>
            </div>
          </div>
        </div>
        
        {/* Pestañas de navegación */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <ul className="flex flex-wrap -mb-px">
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('performance')}
                className={`inline-block py-4 px-4 text-sm font-medium text-center rounded-t-lg border-b-2 ${
                  activeTab === 'performance'
                    ? `${getColorClass('border')} ${getColorClass('accent')}`
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                }`}
                aria-label="Ver rendimiento de clones"
              >
                Rendimiento de Clones
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('platforms')}
                className={`inline-block py-4 px-4 text-sm font-medium text-center rounded-t-lg border-b-2 ${
                  activeTab === 'platforms'
                    ? `${getColorClass('border')} ${getColorClass('accent')}`
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                }`}
                aria-label="Ver uso por plataforma"
              >
                Uso por Plataforma
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('predictions')}
                className={`inline-block py-4 px-4 text-sm font-medium text-center rounded-t-lg border-b-2 ${
                  activeTab === 'predictions'
                    ? `${getColorClass('border')} ${getColorClass('accent')}`
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                }`}
                aria-label="Ver predicciones de uso"
              >
                Predicciones de Uso
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('comparisons')}
                className={`inline-block py-4 px-4 text-sm font-medium text-center rounded-t-lg border-b-2 ${
                  activeTab === 'comparisons'
                    ? `${getColorClass('border')} ${getColorClass('accent')}`
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                }`}
                aria-label="Ver comparativas entre períodos"
              >
                Comparativas
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`inline-block py-4 px-4 text-sm font-medium text-center rounded-t-lg border-b-2 ${
                  activeTab === 'recommendations'
                    ? `${getColorClass('border')} ${getColorClass('accent')}`
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                }`}
                aria-label="Ver recomendaciones"
              >
                Recomendaciones
              </button>
            </li>
          </ul>
        </div>
        
        {/* Contenido de las pestañas */}
        <div className="mt-6">
          {activeTab === 'performance' && (
            <ClonePerformanceTab data={clonePerformance} isDarkMode={isDarkMode} colorClass={getColorClass('primary')} />
          )}
          
          {activeTab === 'platforms' && (
            <PlatformUsageTab data={platformUsage} isDarkMode={isDarkMode} colorClass={getColorClass('primary')} />
          )}
          
          {activeTab === 'predictions' && (
            <PredictionsTab data={usagePredictions} isDarkMode={isDarkMode} colorClass={getColorClass('primary')} />
          )}
          
          {activeTab === 'comparisons' && (
            <ComparisonsTab data={periodComparisons} isDarkMode={isDarkMode} colorClass={getColorClass('primary')} />
          )}
          
          {activeTab === 'recommendations' && (
            <RecommendationsTab data={recommendations} isDarkMode={isDarkMode} colorClass={getColorClass('accent')} />
          )}
        </div>
      </div>
    </div>
  );
};

// Componente para la pestaña de rendimiento de clones
const ClonePerformanceTab = ({ 
  data, 
  isDarkMode, 
  colorClass 
}: { 
  data: ClonePerformance[], 
  isDarkMode: boolean, 
  colorClass: string 
}) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Rendimiento de Clones</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Gráfico de mensajes por clon */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-colors duration-200`}>
          <h3 className="text-lg font-semibold mb-4">Mensajes por Clon</h3>
          <div className="h-64 flex items-end space-x-4">
            {data.map((clone, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className={`w-full ${colorClass} opacity-80 hover:opacity-100 transition-opacity rounded-t-md`} 
                  style={{ 
                    height: `${Math.min(100, (clone.messages_count / Math.max(...data.map(c => c.messages_count))) * 100)}%`,
                    minHeight: clone.messages_count > 0 ? '10%' : '2%'
                  }}
                ></div>
                <span className="text-xs mt-2 text-center">{clone.clone_type}</span>
                <span className="text-xs font-bold">{clone.messages_count}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Gráfico de satisfacción del usuario */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-colors duration-200`}>
          <h3 className="text-lg font-semibold mb-4">Satisfacción del Usuario</h3>
          <div className="h-64 flex items-end space-x-4">
            {data.map((clone, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className={`w-full rounded-t-md`} 
                  style={{ 
                    height: `${Math.min(100, (clone.user_satisfaction / 5) * 100)}%`,
                    minHeight: clone.user_satisfaction > 0 ? '10%' : '2%',
                    backgroundColor: getColorForRating(clone.user_satisfaction)
                  }}
                ></div>
                <span className="text-xs mt-2 text-center">{clone.clone_type}</span>
                <span className="text-xs font-bold">{clone.user_satisfaction.toFixed(1)}/5</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Tabla de métricas detalladas */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden transition-colors duration-200`}>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Clon</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Mensajes</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tiempo de Respuesta</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Satisfacción</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tasa de Éxito</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((clone, index) => (
              <tr key={index} className={index % 2 === 0 ? (isDarkMode ? 'bg-gray-800' : 'bg-white') : (isDarkMode ? 'bg-gray-750' : 'bg-gray-50')}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {clone.clone_type.charAt(0).toUpperCase() + clone.clone_type.slice(1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {clone.messages_count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {clone.response_time_avg > 0 ? `${clone.response_time_avg.toFixed(2)}s` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center">
                    <span className="mr-2">{clone.user_satisfaction.toFixed(1)}</span>
                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          width: `${(clone.user_satisfaction / 5) * 100}%`,
                          backgroundColor: getColorForRating(clone.user_satisfaction)
                        }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center">
                    <span className="mr-2">{clone.success_rate.toFixed(1)}%</span>
                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          width: `${clone.success_rate}%`,
                          backgroundColor: getColorForPercentage(clone.success_rate)
                        }}
                      ></div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Componente para la pestaña de uso por plataforma
const PlatformUsageTab = ({ 
  data, 
  isDarkMode, 
  colorClass 
}: { 
  data: PlatformUsage[], 
  isDarkMode: boolean, 
  colorClass: string 
}) => {
  // Ordenar plataformas por uso
  const sortedData = [...data].sort((a, b) => b.usage_count - a.usage_count);
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Uso por Plataforma</h2>
      
      {/* Gráfico de uso por plataforma */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 mb-8 transition-colors duration-200`}>
        <h3 className="text-lg font-semibold mb-4">Acciones por Plataforma</h3>
        <div className="h-64 flex items-end space-x-4">
          {sortedData.map((platform, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className={`w-full ${colorClass} opacity-80 hover:opacity-100 transition-opacity rounded-t-md`} 
                style={{ 
                  height: `${Math.min(100, (platform.usage_count / Math.max(...data.map(p => p.usage_count))) * 100)}%`,
                  minHeight: platform.usage_count > 0 ? '10%' : '2%'
                }}
              ></div>
              <span className="text-xs mt-2 text-center">{platform.platform}</span>
              <span className="text-xs font-bold">{platform.usage_count}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Tabla de métricas por plataforma */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden transition-colors duration-200`}>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Plataforma</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Acciones</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tasa de Éxito</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Engagement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedData.map((platform, index) => (
              <tr key={index} className={index % 2 === 0 ? (isDarkMode ? 'bg-gray-800' : 'bg-white') : (isDarkMode ? 'bg-gray-750' : 'bg-gray-50')}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {platform.platform.charAt(0).toUpperCase() + platform.platform.slice(1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {platform.usage_count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center">
                    <span className="mr-2">{platform.success_rate.toFixed(1)}%</span>
                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          width: `${platform.success_rate}%`,
                          backgroundColor: getColorForPercentage(platform.success_rate)
                        }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center">
                    <span className="mr-2">{(platform.engagement_rate * 100).toFixed(1)}%</span>
                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          width: `${platform.engagement_rate * 100}%`,
                          backgroundColor: getColorForPercentage(platform.engagement_rate * 100)
                        }}
                      ></div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Componente para la pestaña de predicciones
const PredictionsTab = ({ 
  data, 
  isDarkMode, 
  colorClass 
}: { 
  data: UsagePrediction[], 
  isDarkMode: boolean, 
  colorClass: string 
}) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Predicciones de Uso</h2>
      
      {data.length > 0 ? (
        <>
          {/* Gráfico de predicciones */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 mb-8 transition-colors duration-200`}>
            <h3 className="text-lg font-semibold mb-4">Uso Previsto (Próximos 14 días)</h3>
            <div className="h-64 relative">
              {/* Área de confianza */}
              <div className="absolute inset-0 flex items-end">
                {data.map((day, index) => (
                  <div key={index} className="flex-1 h-full flex flex-col justify-end">
                    <div 
                      className={`w-full ${colorClass.replace('bg-', 'bg-').replace('-500', '-200')} dark:opacity-20 rounded-md`}
                      style={{ 
                        height: `${Math.min(100, (day.upper_bound / Math.max(...data.map(d => d.upper_bound))) * 100)}%`
                      }}
                    ></div>
                  </div>
                ))}
              </div>
              
              {/* Línea de predicción */}
              <div className="absolute inset-0 flex items-end">
                {data.map((day, index) => (
                  <div key={index} className="flex-1 h-full flex flex-col justify-end items-center">
                    <div 
                      className={`w-2 ${colorClass} rounded-full`}
                      style={{ 
                        height: `${Math.min(100, (day.predicted_usage / Math.max(...data.map(d => d.upper_bound))) * 100)}%`,
                        minHeight: '2px'
                      }}
                    ></div>
                  </div>
                ))}
              </div>
              
              {/* Eje X (fechas) */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between mt-2">
                {data.filter((_, i) => i % 3 === 0).map((day, index) => (
                  <span key={index} className="text-xs transform -rotate-45 origin-top-left ml-2">
                    {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Tabla de predicciones */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden transition-colors duration-200`}>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Fecha</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Uso Previsto</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Límite Inferior</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Límite Superior</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {data.map((day, index) => (
                  <tr key={index} className={index % 2 === 0 ? (isDarkMode ? 'bg-gray-800' : 'bg-white') : (isDarkMode ? 'bg-gray-750' : 'bg-gray-50')}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {new Date(day.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {day.predicted_usage}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {day.lower_bound}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {day.upper_bound}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-colors duration-200`}>
          <p className="text-center py-8">No hay suficientes datos para generar predicciones.</p>
        </div>
      )}
    </div>
  );
};

// Componente para la pestaña de comparativas
const ComparisonsTab = ({ 
  data, 
  isDarkMode, 
  colorClass 
}: { 
  data: PeriodComparison[], 
  isDarkMode: boolean, 
  colorClass: string 
}) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Comparativas entre Períodos</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {data.map((comparison, index) => (
          <div key={index} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-colors duration-200`}>
            <h3 className="text-lg font-semibold mb-2">{comparison.metric}</h3>
            
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Período actual</p>
                <p className="text-2xl font-bold">{comparison.current_period}</p>
              </div>
              
              <div className={`text-2xl ${
                comparison.trend === 'up' 
                  ? 'text-green-500' 
                  : comparison.trend === 'down' 
                    ? 'text-red-500' 
                    : 'text-gray-500'
              }`}>
                {comparison.trend === 'up' ? '↑' : comparison.trend === 'down' ? '↓' : '→'}
              </div>
              
              <div className="text-right">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Período anterior</p>
                <p className="text-2xl font-bold">{comparison.previous_period}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Cambio</span>
                <span className={`font-medium ${
                  comparison.change_percentage > 0 
                    ? 'text-green-500' 
                    : comparison.change_percentage < 0 
                      ? 'text-red-500' 
                      : 'text-gray-500'
                }`}>
                  {comparison.change_percentage > 0 ? '+' : ''}{comparison.change_percentage.toFixed(1)}%
                </span>
              </div>
              
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    comparison.change_percentage > 0 
                      ? 'bg-green-500' 
                      : comparison.change_percentage < 0 
                        ? 'bg-red-500' 
                        : 'bg-gray-500'
                  }`}
                  style={{ 
                    width: `${Math.min(100, Math.abs(comparison.change_percentage))}%`,
                    minWidth: '2%'
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente para la pestaña de recomendaciones
const RecommendationsTab = ({ 
  data, 
  isDarkMode, 
  colorClass 
}: { 
  data: UserRecommendation[], 
  isDarkMode: boolean, 
  colorClass: string 
}) => {
  // Ordenar recomendaciones por prioridad
  const sortedData = [...data].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Recomendaciones Personalizadas</h2>
      
      <div className="space-y-4">
        {sortedData.map((recommendation, index) => (
          <div 
            key={index} 
            className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 border-l-4 transition-colors duration-200 ${
              recommendation.priority === 'high' 
                ? 'border-red-500' 
                : recommendation.priority === 'medium' 
                  ? 'border-yellow-500' 
                  : 'border-blue-500'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold mb-2">{recommendation.title}</h3>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{recommendation.description}</p>
              </div>
              
              <span className={`px-2 py-1 text-xs rounded-full ${
                recommendation.priority === 'high' 
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                  : recommendation.priority === 'medium' 
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              }`}>
                {recommendation.priority === 'high' 
                  ? 'Alta' 
                  : recommendation.priority === 'medium' 
                    ? 'Media' 
                    : 'Baja'
                }
              </span>
            </div>
            
            {recommendation.action_url && (
              <div className="mt-4">
                <a 
                  href={recommendation.action_url}
                  className={`inline-block px-4 py-2 rounded-md ${colorClass} text-white`}
                >
                  Implementar
                </a>
              </div>
            )}
          </div>
        ))}
        
        {data.length === 0 && (
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-colors duration-200`}>
            <p className="text-center py-8">No hay recomendaciones disponibles en este momento.</p>
          </div>
        )}
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

export default AdvancedAnalytics;
