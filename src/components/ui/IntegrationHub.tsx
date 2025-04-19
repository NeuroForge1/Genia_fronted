import React, { useState, useEffect } from 'react';
import { useIntegrations, Integration, IntegrationAction } from '../../hooks/useIntegrations';
import { useTheme } from '../../hooks/theme/useTheme';

const IntegrationHub = () => {
  const { 
    loading, 
    error, 
    integrations, 
    recentActions, 
    connectIntegration,
    disconnectIntegration,
    updateIntegrationSettings,
    executeIntegrationAction,
    getPlatformName,
    getIntegrationStats
  } = useIntegrations();
  
  const { isDarkMode, getColorClass } = useTheme();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  
  // Obtener estadísticas
  const stats = getIntegrationStats();
  
  // Manejar conexión de integración
  const handleConnect = async (platform: Integration['platform']) => {
    setConnectingPlatform(platform);
    
    // Simular configuración básica
    const settings = {
      auto_sync: true,
      auto_post: platform === 'facebook' || platform === 'instagram',
      auto_schedule: platform === 'zoom' || platform === 'calendar'
    };
    
    await connectIntegration(platform, settings);
    setConnectingPlatform(null);
  };
  
  // Manejar desconexión de integración
  const handleDisconnect = async (integrationId: string) => {
    setActionInProgress(integrationId);
    await disconnectIntegration(integrationId);
    setActionInProgress(null);
  };
  
  // Manejar actualización de configuración
  const handleUpdateSettings = async (integrationId: string, settings: Record<string, any>) => {
    setActionInProgress(integrationId);
    await updateIntegrationSettings(integrationId, settings);
    setActionInProgress(null);
  };
  
  // Manejar ejecución de acción
  const handleExecuteAction = async (
    integrationId: string, 
    actionType: IntegrationAction['action_type'], 
    details: string
  ) => {
    setActionInProgress(integrationId);
    await executeIntegrationAction(integrationId, actionType, details);
    setActionInProgress(null);
  };
  
  // Obtener icono según plataforma
  const getPlatformIcon = (platform: Integration['platform']) => {
    switch (platform) {
      case 'facebook':
        return 'fa-facebook';
      case 'instagram':
        return 'fa-instagram';
      case 'gmail':
        return 'fa-envelope';
      case 'analytics':
        return 'fa-chart-line';
      case 'youtube':
        return 'fa-youtube';
      case 'spotify':
        return 'fa-spotify';
      case 'zoom':
        return 'fa-video';
      case 'tiktok':
        return 'fa-music';
      case 'zapier':
        return 'fa-bolt';
      case 'applevel':
        return 'fa-layer-group';
      case 'calendar':
        return 'fa-calendar-alt';
      case 'other':
        return 'fa-link';
      default:
        return 'fa-plug';
    }
  };
  
  // Obtener color según plataforma
  const getPlatformColor = (platform: Integration['platform']) => {
    switch (platform) {
      case 'facebook':
        return 'bg-blue-600';
      case 'instagram':
        return 'bg-pink-600';
      case 'gmail':
        return 'bg-red-500';
      case 'analytics':
        return 'bg-yellow-500';
      case 'youtube':
        return 'bg-red-600';
      case 'spotify':
        return 'bg-green-600';
      case 'zoom':
        return 'bg-blue-500';
      case 'tiktok':
        return 'bg-black';
      case 'zapier':
        return 'bg-orange-500';
      case 'applevel':
        return 'bg-purple-600';
      case 'calendar':
        return 'bg-blue-400';
      case 'other':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  // Obtener color según estado
  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'disconnected':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };
  
  // Obtener texto según estado
  const getStatusText = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return 'Conectado';
      case 'disconnected':
        return 'Desconectado';
      case 'pending':
        return 'Pendiente';
      case 'error':
        return 'Error';
      default:
        return status;
    }
  };
  
  if (loading && integrations.length === 0) {
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
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Centro de Integraciones</h1>
        </div>
        
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
                aria-label="Ver resumen de integraciones"
              >
                Resumen
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('integrations')}
                className={`inline-block py-4 px-4 text-sm font-medium text-center rounded-t-lg border-b-2 ${
                  activeTab === 'integrations'
                    ? `${getColorClass('border')} ${getColorClass('accent')}`
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                }`}
                aria-label="Ver integraciones"
              >
                Integraciones
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('activity')}
                className={`inline-block py-4 px-4 text-sm font-medium text-center rounded-t-lg border-b-2 ${
                  activeTab === 'activity'
                    ? `${getColorClass('border')} ${getColorClass('accent')}`
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                }`}
                aria-label="Ver actividad reciente"
              >
                Actividad Reciente
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('connect')}
                className={`inline-block py-4 px-4 text-sm font-medium text-center rounded-t-lg border-b-2 ${
                  activeTab === 'connect'
                    ? `${getColorClass('border')} ${getColorClass('accent')}`
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                }`}
                aria-label="Conectar nuevas integraciones"
              >
                Conectar
              </button>
            </li>
          </ul>
        </div>
        
        {/* Contenido de las pestañas */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <OverviewTab 
              stats={stats} 
              integrations={integrations} 
              recentActions={recentActions} 
              isDarkMode={isDarkMode} 
              getPlatformIcon={getPlatformIcon}
              getPlatformColor={getPlatformColor}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
            />
          )}
          
          {activeTab === 'integrations' && (
            <IntegrationsTab 
              integrations={integrations} 
              handleDisconnect={handleDisconnect} 
              handleUpdateSettings={handleUpdateSettings} 
              handleExecuteAction={handleExecuteAction} 
              actionInProgress={actionInProgress} 
              isDarkMode={isDarkMode} 
              getPlatformIcon={getPlatformIcon}
              getPlatformColor={getPlatformColor}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
            />
          )}
          
          {activeTab === 'activity' && (
            <ActivityTab 
              recentActions={recentActions} 
              integrations={integrations} 
              isDarkMode={isDarkMode} 
              getPlatformIcon={getPlatformIcon}
              getPlatformColor={getPlatformColor}
            />
          )}
          
          {activeTab === 'connect' && (
            <ConnectTab 
              integrations={integrations} 
              handleConnect={handleConnect} 
              connectingPlatform={connectingPlatform} 
              isDarkMode={isDarkMode} 
              getPlatformIcon={getPlatformIcon}
              getPlatformName={getPlatformName}
              getPlatformColor={getPlatformColor}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Componente para la pestaña de resumen
const OverviewTab = ({ 
  stats, 
  integrations, 
  recentActions, 
  isDarkMode, 
  getPlatformIcon,
  getPlatformColor,
  getStatusColor,
  getStatusText
}: { 
  stats: ReturnType<ReturnType<typeof useIntegrations>['getIntegrationStats']>, 
  integrations: Integration[], 
  recentActions: IntegrationAction[], 
  isDarkMode: boolean, 
  getPlatformIcon: (platform: Integration['platform']) => string,
  getPlatformColor: (platform: Integration['platform']) => string,
  getStatusColor: (status: Integration['status']) => string,
  getStatusText: (status: Integration['status']) => string
}) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Resumen de Integraciones</h2>
      
      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-colors duration-200`}>
          <h3 className="text-lg font-semibold mb-2">Total de Integraciones</h3>
          <p className="text-3xl font-bold">{stats.total}</p>
          <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span className="mr-1">{stats.connected} conectadas</span>
            <span className="mx-1">•</span>
            <span>{stats.disconnected + stats.error + stats.pending} inactivas</span>
          </div>
        </div>
        
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-colors duration-200`}>
          <h3 className="text-lg font-semibold mb-2">Tasa de Éxito</h3>
          <p className="text-3xl font-bold">{(stats.overallSuccessRate * 100).toFixed(1)}%</p>
          <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span>{stats.successfulRequests} exitosas</span>
            <span className="mx-1">•</span>
            <span>{stats.totalRequests - stats.successfulRequests} fallidas</span>
          </div>
        </div>
        
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-colors duration-200`}>
          <h3 className="text-lg font-semibold mb-2">Actividad Reciente</h3>
          <p className="text-3xl font-bold">{recentActions.length}</p>
          <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span className="text-green-500">{stats.recentSuccessCount} exitosas</span>
            <span className="mx-1">•</span>
            <span className="text-red-500">{stats.recentFailCount} fallidas</span>
            <span className="mx-1">•</span>
            <span className="text-yellow-500">{stats.recentPendingCount} pendientes</span>
          </div>
        </div>
        
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-colors duration-200`}>
          <h3 className="text-lg font-semibold mb-2">Más Utilizada</h3>
          {stats.mostUsedIntegration ? (
            <>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full ${getPlatformColor(stats.mostUsedIntegration.platform)} flex items-center justify-center text-white`}>
                  <i className={`fab ${getPlatformIcon(stats.mostUsedIntegration.platform)}`}></i>
                </div>
                <p className="ml-2 text-xl font-bold">{stats.mostUsedIntegration.name}</p>
              </div>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {stats.mostUsedIntegration.usage_stats?.requests_count || 0} solicitudes
              </div>
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No hay datos</p>
          )}
        </div>
      </div>
      
      {/* Estado de integraciones */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Estado de Integraciones</h3>
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-colors duration-200`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gráfico de estado */}
            <div>
              <h4 className="font-medium mb-4">Distribución por Estado</h4>
              <div className="h-64 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                    {/* Segmento conectado */}
                    {stats.connected > 0 && (
                      <div 
                        className="absolute bg-green-500" 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          clipPath: `polygon(50% 50%, 50% 0%, ${
                            50 + 50 * Math.cos((stats.connected / stats.total) * Math.PI * 2)
                          }% ${
                            50 - 50 * Math.sin((stats.connected / stats.total) * Math.PI * 2)
                          }%)` 
                        }}
                      ></div>
                    )}
                    
                    {/* Segmento error */}
                    {stats.error > 0 && (
                      <div 
                        className="absolute bg-red-500" 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          clipPath: `polygon(50% 50%, ${
                            50 + 50 * Math.cos((stats.connected / stats.total) * Math.PI * 2)
                          }% ${
                            50 - 50 * Math.sin((stats.connected / stats.total) * Math.PI * 2)
                          }%, ${
                            50 + 50 * Math.cos(((stats.connected + stats.error) / stats.total) * Math.PI * 2)
                          }% ${
                            50 - 50 * Math.sin(((stats.connected + stats.error) / stats.total) * Math.PI * 2)
                          }%)` 
                        }}
                      ></div>
                    )}
                    
                    {/* Segmento pendiente */}
                    {stats.pending > 0 && (
                      <div 
                        className="absolute bg-yellow-500" 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          clipPath: `polygon(50% 50%, ${
                            50 + 50 * Math.cos(((stats.connected + stats.error) / stats.total) * Math.PI * 2)
                          }% ${
                            50 - 50 * Math.sin(((stats.connected + stats.error) / stats.total) * Math.PI * 2)
                          }%, ${
                            50 + 50 * Math.cos(((stats.connected + stats.error + stats.pending) / stats.total) * Math.PI * 2)
                          }% ${
                            50 - 50 * Math.sin(((stats.connected + stats.error + stats.pending) / stats.total) * Math.PI * 2)
                          }%)` 
                        }}
                      ></div>
                    )}
                    
                    {/* Segmento desconectado */}
                    {stats.disconnected > 0 && (
                      <div 
                        className="absolute bg-gray-500" 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          clipPath: `polygon(50% 50%, ${
                            50 + 50 * Math.cos(((stats.connected + stats.error + stats.pending) / stats.total) * Math.PI * 2)
                          }% ${
                            50 - 50 * Math.sin(((stats.connected + stats.error + stats.pending) / stats.total) * Math.PI * 2)
                          }%, 50% 0%)` 
                        }}
                      ></div>
                    )}
                    
                    {/* Círculo central */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`w-16 h-16 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} flex items-center justify-center`}>
                        <span className="text-lg font-bold">{stats.total}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Leyenda */}
                <div className="absolute bottom-0 left-0 right-0">
                  <div className="flex flex-wrap justify-center gap-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                      <span className="text-sm">Conectadas ({stats.connected})</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                      <span className="text-sm">Error ({stats.error})</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
                      <span className="text-sm">Pendientes ({stats.pending})</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-500 rounded-full mr-1"></div>
                      <span className="text-sm">Desconectadas ({stats.disconnected})</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Lista de integraciones */}
            <div>
              <h4 className="font-medium mb-4">Integraciones Activas</h4>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {integrations
                  .filter(integration => integration.status === 'connected')
                  .map(integration => (
                    <div 
                      key={integration.id} 
                      className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-between`}
                    >
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full ${getPlatformColor(integration.platform)} flex items-center justify-center text-white`}>
                          <i className={`fab ${getPlatformIcon(integration.platform)}`}></i>
                        </div>
                        <span className="ml-2 font-medium">{integration.name}</span>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(integration.status)}`}>
                        {getStatusText(integration.status)}
                      </span>
                    </div>
                  ))}
                
                {integrations.filter(integration => integration.status === 'connected').length === 0 && (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                    No hay integraciones activas
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Actividad reciente */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Actividad Reciente</h3>
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden transition-colors duration-200`}>
          <div className="max-h-80 overflow-y-auto">
            {recentActions.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentActions.slice(0, 5).map((action) => {
                  const integration = integrations.find(i => i.id === action.integration_id);
                  
                  return (
                    <div key={action.id} className="p-4">
                      <div className="flex items-start">
                        {integration && (
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full ${getPlatformColor(integration.platform)} flex items-center justify-center text-white`}>
                            <i className={`fab ${getPlatformIcon(integration.platform)}`}></i>
                          </div>
                        )}
                        
                        <div className="ml-3 flex-1">
                          <div className="flex items-center">
                            <p className="text-sm font-medium">
                              {integration ? integration.name : 'Integración desconocida'}
                            </p>
                            <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                              action.status === 'success' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                : action.status === 'pending' 
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {action.status === 'success' ? 'Exitoso' : action.status === 'pending' ? 'Pendiente' : 'Fallido'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {action.details}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {new Date(action.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center py-6 text-gray-500 dark:text-gray-400">
                No hay actividad reciente
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para la pestaña de integraciones
const IntegrationsTab = ({ 
  integrations, 
  handleDisconnect, 
  handleUpdateSettings, 
  handleExecuteAction, 
  actionInProgress, 
  isDarkMode, 
  getPlatformIcon,
  getPlatformColor,
  getStatusColor,
  getStatusText
}: { 
  integrations: Integration[], 
  handleDisconnect: (integrationId: string) => Promise<void>, 
  handleUpdateSettings: (integrationId: string, settings: Record<string, any>) => Promise<void>, 
  handleExecuteAction: (integrationId: string, actionType: IntegrationAction['action_type'], details: string) => Promise<void>, 
  actionInProgress: string | null, 
  isDarkMode: boolean, 
  getPlatformIcon: (platform: Integration['platform']) => string,
  getPlatformColor: (platform: Integration['platform']) => string,
  getStatusColor: (status: Integration['status']) => string,
  getStatusText: (status: Integration['status']) => string
}) => {
  const [expandedIntegration, setExpandedIntegration] = useState<string | null>(null);
  const [settingsEditing, setSettingsEditing] = useState<Record<string, any>>({});
  
  // Manejar expansión de integración
  const toggleExpand = (integrationId: string) => {
    if (expandedIntegration === integrationId) {
      setExpandedIntegration(null);
    } else {
      setExpandedIntegration(integrationId);
      
      // Inicializar edición de configuración
      const integration = integrations.find(i => i.id === integrationId);
      if (integration && integration.settings) {
        setSettingsEditing(integration.settings);
      }
    }
  };
  
  // Manejar cambio de configuración
  const handleSettingChange = (key: string, value: any) => {
    setSettingsEditing(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Manejar guardado de configuración
  const handleSaveSettings = async (integrationId: string) => {
    await handleUpdateSettings(integrationId, settingsEditing);
  };
  
  // Obtener nombre legible de configuración
  const getSettingName = (key: string) => {
    switch (key) {
      case 'auto_post':
        return 'Publicación automática';
      case 'auto_sync':
        return 'Sincronización automática';
      case 'auto_reply':
        return 'Respuesta automática';
      case 'auto_schedule':
        return 'Programación automática';
      case 'auto_upload':
        return 'Subida automática';
      case 'auto_trigger':
        return 'Activación automática';
      default:
        return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  };
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Gestión de Integraciones</h2>
      
      {integrations.length === 0 ? (
        <div className={`p-4 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <p className="text-center">No hay integraciones configuradas.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {integrations.map((integration) => (
            <div 
              key={integration.id} 
              className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden transition-colors duration-200`}
            >
              {/* Encabezado de integración */}
              <div 
                className={`p-4 flex items-center justify-between cursor-pointer ${
                  expandedIntegration === integration.id ? 'border-b border-gray-200 dark:border-gray-700' : ''
                }`}
                onClick={() => toggleExpand(integration.id)}
              >
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full ${getPlatformColor(integration.platform)} flex items-center justify-center text-white`}>
                    <i className={`fab ${getPlatformIcon(integration.platform)}`}></i>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold">{integration.name}</h3>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(integration.status)}`}>
                        {getStatusText(integration.status)}
                      </span>
                      {integration.last_synced && (
                        <span className="ml-2">
                          Última sincronización: {new Date(integration.last_synced).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  {integration.status === 'connected' && (
                    <div className="mr-4 text-sm text-gray-500 dark:text-gray-400">
                      {integration.usage_stats?.requests_count || 0} solicitudes
                    </div>
                  )}
                  <button
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                    aria-label={expandedIntegration === integration.id ? "Contraer" : "Expandir"}
                  >
                    <i className={`fas fa-chevron-${expandedIntegration === integration.id ? 'up' : 'down'}`}></i>
                  </button>
                </div>
              </div>
              
              {/* Contenido expandido */}
              {expandedIntegration === integration.id && (
                <div className="p-4">
                  {/* Estadísticas de uso */}
                  {integration.usage_stats && (
                    <div className="mb-6">
                      <h4 className="font-medium mb-2">Estadísticas de Uso</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Solicitudes</div>
                          <div className="text-xl font-bold">{integration.usage_stats.requests_count}</div>
                        </div>
                        <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Tasa de éxito</div>
                          <div className="text-xl font-bold">{(integration.usage_stats.success_rate * 100).toFixed(1)}%</div>
                        </div>
                        <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Último uso</div>
                          <div className="text-xl font-bold">
                            {integration.usage_stats.last_used 
                              ? new Date(integration.usage_stats.last_used).toLocaleDateString() 
                              : 'Nunca'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Configuración */}
                  {integration.settings && (
                    <div className="mb-6">
                      <h4 className="font-medium mb-2">Configuración</h4>
                      <div className={`p-4 rounded-md ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div className="space-y-4">
                          {Object.entries(integration.settings)
                            .filter(([key]) => !key.includes('id') && !key.includes('key'))
                            .map(([key, value]) => (
                              <div key={key} className="flex items-center justify-between">
                                <span>{getSettingName(key)}</span>
                                {typeof value === 'boolean' ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSettingChange(key, !settingsEditing[key]);
                                    }}
                                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                      settingsEditing[key] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                                    aria-pressed={settingsEditing[key]}
                                    aria-label={`${settingsEditing[key] ? 'Desactivar' : 'Activar'} ${getSettingName(key)}`}
                                    disabled={actionInProgress === integration.id}
                                  >
                                    <span
                                      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                                        settingsEditing[key] ? 'translate-x-6' : 'translate-x-1'
                                      }`}
                                    />
                                  </button>
                                ) : (
                                  <input
                                    type="text"
                                    value={settingsEditing[key] || ''}
                                    onChange={(e) => handleSettingChange(key, e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className={`px-2 py-1 rounded-md ${
                                      isDarkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-800'
                                    } border border-gray-300 dark:border-gray-600`}
                                    disabled={actionInProgress === integration.id}
                                  />
                                )}
                              </div>
                            ))}
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveSettings(integration.id);
                            }}
                            className={`px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors ${
                              actionInProgress === integration.id ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            disabled={actionInProgress === integration.id}
                          >
                            {actionInProgress === integration.id ? (
                              <span className="inline-block animate-spin mr-2">⟳</span>
                            ) : null}
                            Guardar Configuración
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Acciones */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Acciones</h4>
                    <div className="flex flex-wrap gap-2">
                      {integration.platform === 'facebook' || integration.platform === 'instagram' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExecuteAction(integration.id, 'post', 'Publicación de prueba');
                          }}
                          className={`px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors ${
                            actionInProgress === integration.id || integration.status !== 'connected' 
                              ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          disabled={actionInProgress === integration.id || integration.status !== 'connected'}
                        >
                          <i className="fas fa-paper-plane mr-2"></i>
                          Publicar
                        </button>
                      ) : null}
                      
                      {integration.platform === 'gmail' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExecuteAction(integration.id, 'email', 'Correo electrónico de prueba');
                          }}
                          className={`px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors ${
                            actionInProgress === integration.id || integration.status !== 'connected' 
                              ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          disabled={actionInProgress === integration.id || integration.status !== 'connected'}
                        >
                          <i className="fas fa-envelope mr-2"></i>
                          Enviar Correo
                        </button>
                      ) : null}
                      
                      {integration.platform === 'zoom' || integration.platform === 'calendar' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExecuteAction(integration.id, 'schedule', 'Programación de evento de prueba');
                          }}
                          className={`px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors ${
                            actionInProgress === integration.id || integration.status !== 'connected' 
                              ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          disabled={actionInProgress === integration.id || integration.status !== 'connected'}
                        >
                          <i className="fas fa-calendar-plus mr-2"></i>
                          Programar
                        </button>
                      ) : null}
                      
                      {integration.platform === 'analytics' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExecuteAction(integration.id, 'analyze', 'Análisis de datos de prueba');
                          }}
                          className={`px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors ${
                            actionInProgress === integration.id || integration.status !== 'connected' 
                              ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          disabled={actionInProgress === integration.id || integration.status !== 'connected'}
                        >
                          <i className="fas fa-chart-bar mr-2"></i>
                          Analizar
                        </button>
                      ) : null}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExecuteAction(integration.id, 'sync', 'Sincronización manual');
                        }}
                        className={`px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600 transition-colors ${
                          actionInProgress === integration.id || integration.status !== 'connected' 
                            ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={actionInProgress === integration.id || integration.status !== 'connected'}
                      >
                        <i className="fas fa-sync mr-2"></i>
                        Sincronizar
                      </button>
                      
                      {integration.status === 'error' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExecuteAction(integration.id, 'sync', 'Intento de reconexión');
                          }}
                          className={`px-4 py-2 rounded-md bg-yellow-500 text-white hover:bg-yellow-600 transition-colors ${
                            actionInProgress === integration.id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          disabled={actionInProgress === integration.id}
                        >
                          <i className="fas fa-redo mr-2"></i>
                          Reintentar
                        </button>
                      ) : null}
                    </div>
                  </div>
                  
                  {/* Mensaje de error */}
                  {integration.error_message && (
                    <div className="mb-6">
                      <div className="p-4 rounded-md bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <i className="fas fa-exclamation-circle"></i>
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-medium">Error</h4>
                            <p className="text-sm mt-1">{integration.error_message}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Botón de desconexión */}
                  <div className="flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDisconnect(integration.id);
                      }}
                      className={`px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors ${
                        actionInProgress === integration.id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={actionInProgress === integration.id}
                    >
                      {actionInProgress === integration.id ? (
                        <span className="inline-block animate-spin mr-2">⟳</span>
                      ) : null}
                      {integration.status === 'connected' ? 'Desconectar' : 'Eliminar'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Componente para la pestaña de actividad
const ActivityTab = ({ 
  recentActions, 
  integrations, 
  isDarkMode, 
  getPlatformIcon,
  getPlatformColor
}: { 
  recentActions: IntegrationAction[], 
  integrations: Integration[], 
  isDarkMode: boolean, 
  getPlatformIcon: (platform: Integration['platform']) => string,
  getPlatformColor: (platform: Integration['platform']) => string
}) => {
  // Obtener icono según tipo de acción
  const getActionIcon = (actionType: IntegrationAction['action_type']) => {
    switch (actionType) {
      case 'post':
        return 'fa-paper-plane';
      case 'message':
        return 'fa-comment';
      case 'email':
        return 'fa-envelope';
      case 'schedule':
        return 'fa-calendar-plus';
      case 'analyze':
        return 'fa-chart-bar';
      case 'sync':
        return 'fa-sync';
      case 'other':
        return 'fa-cog';
      default:
        return 'fa-cog';
    }
  };
  
  // Obtener nombre legible de acción
  const getActionName = (actionType: IntegrationAction['action_type']) => {
    switch (actionType) {
      case 'post':
        return 'Publicación';
      case 'message':
        return 'Mensaje';
      case 'email':
        return 'Correo electrónico';
      case 'schedule':
        return 'Programación';
      case 'analyze':
        return 'Análisis';
      case 'sync':
        return 'Sincronización';
      case 'other':
        return 'Otra acción';
      default:
        return actionType;
    }
  };
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Actividad Reciente</h2>
      
      {recentActions.length === 0 ? (
        <div className={`p-4 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <p className="text-center">No hay actividad reciente.</p>
        </div>
      ) : (
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden transition-colors duration-200`}>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentActions.map((action) => {
              const integration = integrations.find(i => i.id === action.integration_id);
              
              return (
                <div key={action.id} className="p-4">
                  <div className="flex items-start">
                    {integration && (
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${getPlatformColor(integration.platform)} flex items-center justify-center text-white`}>
                        <i className={`fab ${getPlatformIcon(integration.platform)}`}></i>
                      </div>
                    )}
                    
                    <div className="ml-3 flex-1">
                      <div className="flex items-center">
                        <p className="text-lg font-medium">
                          {integration ? integration.name : 'Integración desconocida'}
                        </p>
                        <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                          action.status === 'success' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : action.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {action.status === 'success' ? 'Exitoso' : action.status === 'pending' ? 'Pendiente' : 'Fallido'}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm mt-1">
                        <i className={`fas ${getActionIcon(action.action_type)} mr-1 ${
                          action.status === 'success' 
                            ? 'text-green-500' 
                            : action.status === 'pending' 
                              ? 'text-yellow-500' 
                              : 'text-red-500'
                        }`}></i>
                        <span className="font-medium">{getActionName(action.action_type)}</span>
                      </div>
                      
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {action.details}
                      </p>
                      
                      {action.error_message && (
                        <p className="text-sm text-red-500 mt-1">
                          Error: {action.error_message}
                        </p>
                      )}
                      
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {new Date(action.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para la pestaña de conexión
const ConnectTab = ({ 
  integrations, 
  handleConnect, 
  connectingPlatform, 
  isDarkMode, 
  getPlatformIcon,
  getPlatformName,
  getPlatformColor
}: { 
  integrations: Integration[], 
  handleConnect: (platform: Integration['platform']) => Promise<void>, 
  connectingPlatform: string | null, 
  isDarkMode: boolean, 
  getPlatformIcon: (platform: Integration['platform']) => string,
  getPlatformName: (platform: Integration['platform']) => string,
  getPlatformColor: (platform: Integration['platform']) => string
}) => {
  // Lista de plataformas disponibles
  const availablePlatforms: Integration['platform'][] = [
    'facebook', 'instagram', 'gmail', 'analytics', 'youtube', 
    'spotify', 'zoom', 'tiktok', 'zapier', 'applevel', 'calendar'
  ];
  
  // Verificar si una plataforma ya está conectada
  const isPlatformConnected = (platform: Integration['platform']) => {
    return integrations.some(i => i.platform === platform && i.status === 'connected');
  };
  
  // Verificar si una plataforma está en proceso de conexión
  const isPlatformConnecting = (platform: Integration['platform']) => {
    return connectingPlatform === platform;
  };
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Conectar Nuevas Integraciones</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availablePlatforms.map((platform) => (
          <div 
            key={platform} 
            className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-colors duration-200`}
          >
            <div className="flex items-center mb-4">
              <div className={`w-12 h-12 rounded-full ${getPlatformColor(platform)} flex items-center justify-center text-white`}>
                <i className={`fab ${getPlatformIcon(platform)} text-xl`}></i>
              </div>
              <h3 className="ml-3 text-lg font-semibold">{getPlatformName(platform)}</h3>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {platform === 'facebook' && 'Conecta con Facebook para publicar contenido y gestionar tus páginas.'}
              {platform === 'instagram' && 'Conecta con Instagram para publicar fotos y gestionar tu cuenta.'}
              {platform === 'gmail' && 'Conecta con Gmail para enviar y recibir correos electrónicos.'}
              {platform === 'analytics' && 'Conecta con Google Analytics para analizar el tráfico de tu sitio web.'}
              {platform === 'youtube' && 'Conecta con YouTube para gestionar y publicar videos.'}
              {platform === 'spotify' && 'Conecta con Spotify para gestionar listas de reproducción y contenido.'}
              {platform === 'zoom' && 'Conecta con Zoom para programar y gestionar reuniones.'}
              {platform === 'tiktok' && 'Conecta con TikTok para publicar videos y gestionar tu cuenta.'}
              {platform === 'zapier' && 'Conecta con Zapier para automatizar flujos de trabajo entre aplicaciones.'}
              {platform === 'applevel' && 'Conecta con AppLevel para gestionar y analizar tus aplicaciones.'}
              {platform === 'calendar' && 'Conecta con Google Calendar para programar y gestionar eventos.'}
            </p>
            
            <button
              onClick={() => handleConnect(platform)}
              disabled={isPlatformConnected(platform) || isPlatformConnecting(platform)}
              className={`w-full px-4 py-2 rounded-md ${
                isPlatformConnected(platform)
                  ? 'bg-green-500 cursor-not-allowed'
                  : isPlatformConnecting(platform)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : getPlatformColor(platform)
              } text-white hover:opacity-90 transition-colors`}
            >
              {isPlatformConnecting(platform) ? (
                <span className="inline-block animate-spin mr-2">⟳</span>
              ) : null}
              {isPlatformConnected(platform) 
                ? 'Conectado' 
                : isPlatformConnecting(platform) 
                  ? 'Conectando...' 
                  : 'Conectar'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IntegrationHub;
