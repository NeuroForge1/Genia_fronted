import React, { useState, useEffect } from 'react';
import { usePerformance, PerformanceMetric, ResourceUsage, LoadingTime } from '../../hooks/usePerformance';
import { useTheme } from '../../hooks/theme/useTheme';

const PerformanceOptimizer = () => {
  const { 
    isMonitoring,
    performanceMetrics,
    resourceUsage,
    loadingTimes,
    startMonitoring,
    stopMonitoring,
    getSlowComponents,
    getOptimizationRecommendations,
    applyAutomaticOptimizations,
    generatePerformanceReport
  } = usePerformance();
  
  const { isDarkMode, getColorClass } = useTheme();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [optimizationApplied, setOptimizationApplied] = useState<boolean>(false);
  const [reportGenerated, setReportGenerated] = useState<boolean>(false);
  const [report, setReport] = useState<any>(null);
  
  // Iniciar monitoreo automáticamente al montar el componente
  useEffect(() => {
    const cleanup = startMonitoring();
    
    return () => {
      if (cleanup) cleanup();
    };
  }, [startMonitoring]);
  
  // Manejar aplicación de optimizaciones
  const handleApplyOptimizations = () => {
    const success = applyAutomaticOptimizations();
    if (success) {
      setOptimizationApplied(true);
      
      // Resetear el estado después de un tiempo
      setTimeout(() => {
        setOptimizationApplied(false);
      }, 5000);
    }
  };
  
  // Manejar generación de informe
  const handleGenerateReport = () => {
    const generatedReport = generatePerformanceReport();
    setReport(generatedReport);
    setReportGenerated(true);
    
    // Descargar informe como JSON
    const blob = new Blob([JSON.stringify(generatedReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `genia_performance_report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className={`${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen transition-colors duration-200`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Optimizador de Rendimiento</h1>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
              className={`px-4 py-2 rounded-md ${
                isMonitoring 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : getColorClass('primary')
              } text-white flex items-center`}
              aria-label={isMonitoring ? "Detener monitoreo" : "Iniciar monitoreo"}
            >
              <i className={`fas ${isMonitoring ? 'fa-stop' : 'fa-play'} mr-2`}></i>
              {isMonitoring ? "Detener Monitoreo" : "Iniciar Monitoreo"}
            </button>
            
            <button
              onClick={handleApplyOptimizations}
              disabled={!isMonitoring || optimizationApplied}
              className={`px-4 py-2 rounded-md ${
                optimizationApplied 
                  ? 'bg-green-500' 
                  : !isMonitoring 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : getColorClass('primary')
              } text-white flex items-center`}
              aria-label="Aplicar optimizaciones"
            >
              {optimizationApplied ? (
                <>
                  <i className="fas fa-check mr-2"></i>
                  Optimizaciones Aplicadas
                </>
              ) : (
                <>
                  <i className="fas fa-bolt mr-2"></i>
                  Aplicar Optimizaciones
                </>
              )}
            </button>
            
            <button
              onClick={handleGenerateReport}
              disabled={!isMonitoring}
              className={`px-4 py-2 rounded-md ${
                !isMonitoring 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : getColorClass('primary')
              } text-white flex items-center`}
              aria-label="Generar informe"
            >
              <i className="fas fa-file-export mr-2"></i>
              Generar Informe
            </button>
          </div>
        </div>
        
        {/* Mensaje de estado de monitoreo */}
        {isMonitoring && (
          <div className={`mb-6 p-4 rounded-md ${isDarkMode ? 'bg-blue-900 bg-opacity-20' : 'bg-blue-50'} border border-blue-200 dark:border-blue-800`}>
            <div className="flex items-center">
              <div className="mr-3 animate-pulse">
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
              </div>
              <p className="text-blue-700 dark:text-blue-300">
                Monitoreo de rendimiento activo. Los datos se están recopilando en tiempo real.
              </p>
            </div>
          </div>
        )}
        
        {/* Pestañas de navegación */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <ul className="flex flex-wrap -mb-px">
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`inline-block py-4 px-4 text-sm font-medium text-center rounded-t-lg border-b-2 ${
                  activeTab === 'overview'
                    ? `${getColorClass('border')} ${getColorClass('accent')}`
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                }`}
                aria-label="Ver resumen de rendimiento"
              >
                Resumen
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('components')}
                className={`inline-block py-4 px-4 text-sm font-medium text-center rounded-t-lg border-b-2 ${
                  activeTab === 'components'
                    ? `${getColorClass('border')} ${getColorClass('accent')}`
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                }`}
                aria-label="Ver rendimiento de componentes"
              >
                Componentes
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('resources')}
                className={`inline-block py-4 px-4 text-sm font-medium text-center rounded-t-lg border-b-2 ${
                  activeTab === 'resources'
                    ? `${getColorClass('border')} ${getColorClass('accent')}`
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                }`}
                aria-label="Ver uso de recursos"
              >
                Recursos
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`inline-block py-4 px-4 text-sm font-medium text-center rounded-t-lg border-b-2 ${
                  activeTab === 'recommendations'
                    ? `${getColorClass('border')} ${getColorClass('accent')}`
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                }`}
                aria-label="Ver recomendaciones de optimización"
              >
                Recomendaciones
              </button>
            </li>
          </ul>
        </div>
        
        {/* Contenido de las pestañas */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <OverviewTab 
              performanceMetrics={performanceMetrics} 
              resourceUsage={resourceUsage} 
              loadingTimes={loadingTimes} 
              isDarkMode={isDarkMode} 
              colorClass={getColorClass('primary')} 
            />
          )}
          
          {activeTab === 'components' && (
            <ComponentsTab 
              performanceMetrics={performanceMetrics} 
              slowComponents={getSlowComponents()} 
              isDarkMode={isDarkMode} 
              colorClass={getColorClass('primary')} 
            />
          )}
          
          {activeTab === 'resources' && (
            <ResourcesTab 
              resourceUsage={resourceUsage} 
              isDarkMode={isDarkMode} 
              colorClass={getColorClass('primary')} 
            />
          )}
          
          {activeTab === 'recommendations' && (
            <RecommendationsTab 
              recommendations={getOptimizationRecommendations()} 
              isDarkMode={isDarkMode} 
              colorClass={getColorClass('primary')} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Componente para la pestaña de resumen
const OverviewTab = ({ 
  performanceMetrics, 
  resourceUsage, 
  loadingTimes, 
  isDarkMode, 
  colorClass 
}: { 
  performanceMetrics: PerformanceMetric[], 
  resourceUsage: ResourceUsage[], 
  loadingTimes: LoadingTime[], 
  isDarkMode: boolean, 
  colorClass: string 
}) => {
  // Calcular métricas de resumen
  const averageRenderTime = performanceMetrics.length > 0
    ? performanceMetrics.reduce((sum, metric) => sum + metric.renderTime, 0) / performanceMetrics.length
    : 0;
    
  const averageMemoryUsage = resourceUsage.length > 0
    ? resourceUsage.reduce((sum, usage) => sum + usage.memoryUsage, 0) / resourceUsage.length
    : 0;
    
  const averageCpuUsage = resourceUsage.length > 0
    ? resourceUsage.reduce((sum, usage) => sum + usage.cpuUsage, 0) / resourceUsage.length
    : 0;
    
  const averageLoadTime = loadingTimes.length > 0
    ? loadingTimes.reduce((sum, time) => sum + time.fullyLoaded, 0) / loadingTimes.length
    : 0;
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Resumen de Rendimiento</h2>
      
      {performanceMetrics.length === 0 && resourceUsage.length === 0 && loadingTimes.length === 0 ? (
        <div className={`p-4 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <p className="text-center">No hay datos de rendimiento disponibles. Inicie el monitoreo para recopilar métricas.</p>
        </div>
      ) : (
        <>
          {/* Tarjetas de métricas clave */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-colors duration-200`}>
              <h3 className="text-lg font-semibold mb-2">Tiempo de Renderizado</h3>
              <p className="text-3xl font-bold">{averageRenderTime.toFixed(2)} ms</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Promedio por componente</p>
            </div>
            
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-colors duration-200`}>
              <h3 className="text-lg font-semibold mb-2">Uso de Memoria</h3>
              <p className="text-3xl font-bold">{averageMemoryUsage.toFixed(2)} MB</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Promedio</p>
            </div>
            
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-colors duration-200`}>
              <h3 className="text-lg font-semibold mb-2">Uso de CPU</h3>
              <p className="text-3xl font-bold">{averageCpuUsage.toFixed(2)}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Promedio</p>
            </div>
            
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-colors duration-200`}>
              <h3 className="text-lg font-semibold mb-2">Tiempo de Carga</h3>
              <p className="text-3xl font-bold">{(averageLoadTime / 1000).toFixed(2)} s</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Promedio por página</p>
            </div>
          </div>
          
          {/* Gráfico de tendencias */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-colors duration-200 mb-8`}>
            <h3 className="text-lg font-semibold mb-4">Tendencias de Rendimiento</h3>
            
            {resourceUsage.length > 1 ? (
              <div className="h-64 relative">
                {/* Eje Y */}
                <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>100%</span>
                  <span>75%</span>
                  <span>50%</span>
                  <span>25%</span>
                  <span>0%</span>
                </div>
                
                {/* Área del gráfico */}
                <div className="absolute left-12 right-0 top-0 bottom-0">
                  {/* Líneas de cuadrícula */}
                  <div className="absolute left-0 right-0 top-0 h-px bg-gray-200 dark:bg-gray-700"></div>
                  <div className="absolute left-0 right-0 top-1/4 h-px bg-gray-200 dark:bg-gray-700"></div>
                  <div className="absolute left-0 right-0 top-2/4 h-px bg-gray-200 dark:bg-gray-700"></div>
                  <div className="absolute left-0 right-0 top-3/4 h-px bg-gray-200 dark:bg-gray-700"></div>
                  <div className="absolute left-0 right-0 bottom-0 h-px bg-gray-200 dark:bg-gray-700"></div>
                  
                  {/* Línea de CPU */}
                  <div className="absolute left-0 right-0 bottom-0 h-full flex items-end">
                    {resourceUsage.map((usage, index) => {
                      const nextUsage = resourceUsage[index + 1];
                      if (!nextUsage) return null;
                      
                      const x1 = `${(index / (resourceUsage.length - 1)) * 100}%`;
                      const y1 = `${100 - (usage.cpuUsage / 100) * 100}%`;
                      const x2 = `${((index + 1) / (resourceUsage.length - 1)) * 100}%`;
                      const y2 = `${100 - (nextUsage.cpuUsage / 100) * 100}%`;
                      
                      return (
                        <svg key={`cpu-${index}`} className="absolute left-0 top-0 w-full h-full">
                          <line 
                            x1={x1} 
                            y1={y1} 
                            x2={x2} 
                            y2={y2} 
                            stroke="#ef4444" 
                            strokeWidth="2" 
                          />
                        </svg>
                      );
                    })}
                  </div>
                  
                  {/* Línea de memoria */}
                  <div className="absolute left-0 right-0 bottom-0 h-full flex items-end">
                    {resourceUsage.map((usage, index) => {
                      const nextUsage = resourceUsage[index + 1];
                      if (!nextUsage) return null;
                      
                      const x1 = `${(index / (resourceUsage.length - 1)) * 100}%`;
                      const y1 = `${100 - (usage.memoryUsage / 1000) * 100}%`;
                      const x2 = `${((index + 1) / (resourceUsage.length - 1)) * 100}%`;
                      const y2 = `${100 - (nextUsage.memoryUsage / 1000) * 100}%`;
                      
                      return (
                        <svg key={`mem-${index}`} className="absolute left-0 top-0 w-full h-full">
                          <line 
                            x1={x1} 
                            y1={y1} 
                            x2={x2} 
                            y2={y2} 
                            stroke="#3b82f6" 
                            strokeWidth="2" 
                          />
                        </svg>
                      );
                    })}
                  </div>
                </div>
                
                {/* Leyenda */}
                <div className="absolute bottom-0 left-12 right-0 flex justify-center mt-4">
                  <div className="flex items-center mr-4">
                    <div className="w-3 h-3 bg-red-500 mr-1"></div>
                    <span className="text-xs">CPU</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 mr-1"></div>
                    <span className="text-xs">Memoria</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center py-12 text-gray-500 dark:text-gray-400">
                No hay suficientes datos para mostrar tendencias. Continúe monitoreando para recopilar más datos.
              </p>
            )}
          </div>
          
          {/* Estadísticas de sesión */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-colors duration-200`}>
            <h3 className="text-lg font-semibold mb-4">Estadísticas de Sesión</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium mb-2">Componentes Monitoreados</h4>
                <p className="text-2xl font-bold">
                  {new Set(performanceMetrics.map(metric => metric.component)).size}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Total de métricas: {performanceMetrics.length}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Muestras de Recursos</h4>
                <p className="text-2xl font-bold">
                  {resourceUsage.length}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Intervalo: 5 segundos
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Páginas Monitoreadas</h4>
                <p className="text-2xl font-bold">
                  {new Set(loadingTimes.map(time => time.page)).size}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Total de cargas: {loadingTimes.length}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Componente para la pestaña de componentes
const ComponentsTab = ({ 
  performanceMetrics, 
  slowComponents, 
  isDarkMode, 
  colorClass 
}: { 
  performanceMetrics: PerformanceMetric[], 
  slowComponents: { component: string, averageTime: number }[], 
  isDarkMode: boolean, 
  colorClass: string 
}) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Rendimiento de Componentes</h2>
      
      {performanceMetrics.length === 0 ? (
        <div className={`p-4 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <p className="text-center">No hay datos de componentes disponibles. Inicie el monitoreo para recopilar métricas.</p>
        </div>
      ) : (
        <>
          {/* Componentes más lentos */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Componentes Más Lentos</h3>
            
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden transition-colors duration-200`}>
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Componente</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tiempo Promedio</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {slowComponents.map((component, index) => (
                    <tr key={index} className={index % 2 === 0 ? (isDarkMode ? 'bg-gray-800' : 'bg-white') : (isDarkMode ? 'bg-gray-750' : 'bg-gray-50')}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {component.component}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {component.averageTime.toFixed(2)} ms
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          component.averageTime > 100
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : component.averageTime > 50
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {component.averageTime > 100
                            ? 'Lento'
                            : component.averageTime > 50
                              ? 'Medio'
                              : 'Rápido'
                          }
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Historial de renderizado */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Historial de Renderizado</h3>
            
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden transition-colors duration-200`}>
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Componente</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tiempo</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {performanceMetrics.slice(-10).reverse().map((metric, index) => (
                    <tr key={index} className={index % 2 === 0 ? (isDarkMode ? 'bg-gray-800' : 'bg-white') : (isDarkMode ? 'bg-gray-750' : 'bg-gray-50')}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {metric.component}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {metric.renderTime.toFixed(2)} ms
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Date(metric.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Componente para la pestaña de recursos
const ResourcesTab = ({ 
  resourceUsage, 
  isDarkMode, 
  colorClass 
}: { 
  resourceUsage: ResourceUsage[], 
  isDarkMode: boolean, 
  colorClass: string 
}) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Uso de Recursos</h2>
      
      {resourceUsage.length === 0 ? (
        <div className={`p-4 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <p className="text-center">No hay datos de recursos disponibles. Inicie el monitoreo para recopilar métricas.</p>
        </div>
      ) : (
        <>
          {/* Gráficos de uso de recursos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-colors duration-200`}>
              <h3 className="text-lg font-semibold mb-4">Uso de Memoria</h3>
              
              <div className="h-64 relative">
                {/* Eje Y */}
                <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>1000 MB</span>
                  <span>750 MB</span>
                  <span>500 MB</span>
                  <span>250 MB</span>
                  <span>0 MB</span>
                </div>
                
                {/* Área del gráfico */}
                <div className="absolute left-12 right-0 top-0 bottom-0">
                  {/* Líneas de cuadrícula */}
                  <div className="absolute left-0 right-0 top-0 h-px bg-gray-200 dark:bg-gray-700"></div>
                  <div className="absolute left-0 right-0 top-1/4 h-px bg-gray-200 dark:bg-gray-700"></div>
                  <div className="absolute left-0 right-0 top-2/4 h-px bg-gray-200 dark:bg-gray-700"></div>
                  <div className="absolute left-0 right-0 top-3/4 h-px bg-gray-200 dark:bg-gray-700"></div>
                  <div className="absolute left-0 right-0 bottom-0 h-px bg-gray-200 dark:bg-gray-700"></div>
                  
                  {/* Barras de memoria */}
                  <div className="absolute left-0 right-0 bottom-0 h-full flex items-end">
                    {resourceUsage.slice(-10).map((usage, index) => (
                      <div 
                        key={index} 
                        className="flex-1 mx-1"
                        style={{ height: `${(usage.memoryUsage / 1000) * 100}%` }}
                      >
                        <div 
                          className="w-full h-full bg-blue-500 hover:bg-blue-600 transition-colors rounded-t"
                          title={`${usage.memoryUsage.toFixed(2)} MB`}
                        ></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-colors duration-200`}>
              <h3 className="text-lg font-semibold mb-4">Uso de CPU</h3>
              
              <div className="h-64 relative">
                {/* Eje Y */}
                <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>100%</span>
                  <span>75%</span>
                  <span>50%</span>
                  <span>25%</span>
                  <span>0%</span>
                </div>
                
                {/* Área del gráfico */}
                <div className="absolute left-12 right-0 top-0 bottom-0">
                  {/* Líneas de cuadrícula */}
                  <div className="absolute left-0 right-0 top-0 h-px bg-gray-200 dark:bg-gray-700"></div>
                  <div className="absolute left-0 right-0 top-1/4 h-px bg-gray-200 dark:bg-gray-700"></div>
                  <div className="absolute left-0 right-0 top-2/4 h-px bg-gray-200 dark:bg-gray-700"></div>
                  <div className="absolute left-0 right-0 top-3/4 h-px bg-gray-200 dark:bg-gray-700"></div>
                  <div className="absolute left-0 right-0 bottom-0 h-px bg-gray-200 dark:bg-gray-700"></div>
                  
                  {/* Barras de CPU */}
                  <div className="absolute left-0 right-0 bottom-0 h-full flex items-end">
                    {resourceUsage.slice(-10).map((usage, index) => (
                      <div 
                        key={index} 
                        className="flex-1 mx-1"
                        style={{ height: `${usage.cpuUsage}%` }}
                      >
                        <div 
                          className="w-full h-full bg-red-500 hover:bg-red-600 transition-colors rounded-t"
                          title={`${usage.cpuUsage.toFixed(2)}%`}
                        ></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Historial de uso de recursos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Historial de Uso de Recursos</h3>
            
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden transition-colors duration-200`}>
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Timestamp</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Memoria</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">CPU</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Solicitudes de Red</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {resourceUsage.slice(-10).reverse().map((usage, index) => (
                    <tr key={index} className={index % 2 === 0 ? (isDarkMode ? 'bg-gray-800' : 'bg-white') : (isDarkMode ? 'bg-gray-750' : 'bg-gray-50')}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Date(usage.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {usage.memoryUsage.toFixed(2)} MB
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {usage.cpuUsage.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {usage.networkRequests}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Componente para la pestaña de recomendaciones
const RecommendationsTab = ({ 
  recommendations, 
  isDarkMode, 
  colorClass 
}: { 
  recommendations: string[], 
  isDarkMode: boolean, 
  colorClass: string 
}) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Recomendaciones de Optimización</h2>
      
      {recommendations.length === 0 ? (
        <div className={`p-4 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <p className="text-center">No hay recomendaciones disponibles. Inicie el monitoreo para generar recomendaciones.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((recommendation, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md transition-colors duration-200 border-l-4 border-blue-500`}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <i className="fas fa-lightbulb text-blue-500"></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm">{recommendation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Buenas prácticas generales */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Buenas Prácticas de Rendimiento</h3>
        
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-colors duration-200`}>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">1. Optimización de Componentes</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>Utiliza React.memo para componentes que no cambian frecuentemente</li>
                <li>Evita renderizados innecesarios con useCallback y useMemo</li>
                <li>Implementa virtualización para listas largas</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">2. Optimización de Bundle</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>Implementa code splitting para reducir el tamaño del bundle inicial</li>
                <li>Utiliza lazy loading para componentes pesados</li>
                <li>Optimiza dependencias y elimina código no utilizado</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">3. Optimización de Red</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>Implementa caché para datos frecuentes</li>
                <li>Utiliza compresión de imágenes y recursos estáticos</li>
                <li>Agrupa solicitudes de API cuando sea posible</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceOptimizer;
