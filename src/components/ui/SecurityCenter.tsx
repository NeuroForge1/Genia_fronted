import React, { useState, useEffect } from 'react';
import { useSecurity, SecurityThreat, SecuritySetting, SecurityAudit } from '../../hooks/useSecurity';
import { useTheme } from '../../hooks/theme/useTheme';

const SecurityCenter = () => {
  const { 
    loading, 
    error, 
    securityThreats, 
    securitySettings, 
    securityAudits, 
    securityScore,
    updateSecuritySetting,
    resolveSecurityThreat,
    generateSecurityReport,
    getSecurityRecommendations
  } = useSecurity();
  
  const { isDarkMode, getColorClass } = useTheme();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [reportGenerated, setReportGenerated] = useState<boolean>(false);
  
  // Manejar generación de informe
  const handleGenerateReport = () => {
    const report = generateSecurityReport();
    setReportGenerated(true);
    
    // Descargar informe como JSON
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `genia_security_report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Resetear estado después de un tiempo
    setTimeout(() => {
      setReportGenerated(false);
    }, 3000);
  };
  
  // Obtener color según puntuación de seguridad
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  // Obtener texto según puntuación de seguridad
  const getScoreText = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Buena';
    if (score >= 40) return 'Regular';
    return 'Deficiente';
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
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Centro de Seguridad</h1>
          
          <button
            onClick={handleGenerateReport}
            className={`px-4 py-2 rounded-md ${
              reportGenerated 
                ? 'bg-green-500' 
                : getColorClass('primary')
            } text-white flex items-center`}
            aria-label="Generar informe de seguridad"
          >
            {reportGenerated ? (
              <>
                <i className="fas fa-check mr-2"></i>
                Informe Generado
              </>
            ) : (
              <>
                <i className="fas fa-file-export mr-2"></i>
                Generar Informe
              </>
            )}
          </button>
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
                aria-label="Ver resumen de seguridad"
              >
                Resumen
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('threats')}
                className={`inline-block py-4 px-4 text-sm font-medium text-center rounded-t-lg border-b-2 ${
                  activeTab === 'threats'
                    ? `${getColorClass('border')} ${getColorClass('accent')}`
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                }`}
                aria-label="Ver amenazas de seguridad"
              >
                Amenazas
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('settings')}
                className={`inline-block py-4 px-4 text-sm font-medium text-center rounded-t-lg border-b-2 ${
                  activeTab === 'settings'
                    ? `${getColorClass('border')} ${getColorClass('accent')}`
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                }`}
                aria-label="Ver configuración de seguridad"
              >
                Configuración
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('audit')}
                className={`inline-block py-4 px-4 text-sm font-medium text-center rounded-t-lg border-b-2 ${
                  activeTab === 'audit'
                    ? `${getColorClass('border')} ${getColorClass('accent')}`
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                }`}
                aria-label="Ver registro de auditoría"
              >
                Auditoría
              </button>
            </li>
          </ul>
        </div>
        
        {/* Contenido de las pestañas */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <OverviewTab 
              securityScore={securityScore} 
              securityThreats={securityThreats} 
              securitySettings={securitySettings} 
              recommendations={getSecurityRecommendations()} 
              isDarkMode={isDarkMode} 
              getScoreColor={getScoreColor}
              getScoreText={getScoreText}
            />
          )}
          
          {activeTab === 'threats' && (
            <ThreatsTab 
              securityThreats={securityThreats} 
              resolveSecurityThreat={resolveSecurityThreat} 
              isDarkMode={isDarkMode} 
            />
          )}
          
          {activeTab === 'settings' && (
            <SettingsTab 
              securitySettings={securitySettings} 
              updateSecuritySetting={updateSecuritySetting} 
              isDarkMode={isDarkMode} 
              colorClass={getColorClass('primary')} 
            />
          )}
          
          {activeTab === 'audit' && (
            <AuditTab 
              securityAudits={securityAudits} 
              isDarkMode={isDarkMode} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Componente para la pestaña de resumen
const OverviewTab = ({ 
  securityScore, 
  securityThreats, 
  securitySettings, 
  recommendations, 
  isDarkMode, 
  getScoreColor,
  getScoreText
}: { 
  securityScore: number, 
  securityThreats: SecurityThreat[], 
  securitySettings: SecuritySetting[], 
  recommendations: string[], 
  isDarkMode: boolean, 
  getScoreColor: (score: number) => string,
  getScoreText: (score: number) => string
}) => {
  // Calcular estadísticas
  const unresolvedThreats = securityThreats.filter(threat => !threat.resolved);
  const criticalThreats = unresolvedThreats.filter(threat => threat.severity === 'critical');
  const highThreats = unresolvedThreats.filter(threat => threat.severity === 'high');
  const enabledSettings = securitySettings.filter(setting => setting.enabled);
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Resumen de Seguridad</h2>
      
      {/* Puntuación de seguridad */}
      <div className="mb-8">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-colors duration-200`}>
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold mb-2">Puntuación de Seguridad</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Basada en tu configuración y amenazas activas
              </p>
            </div>
            
            <div className="flex items-center">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={isDarkMode ? '#374151' : '#E5E7EB'}
                    strokeWidth="3"
                    strokeDasharray="100, 100"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={getScoreColor(securityScore)}
                    strokeWidth="3"
                    strokeDasharray={`${securityScore}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-3xl font-bold">{securityScore}</span>
                  <span className="text-sm">{getScoreText(securityScore)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Estadísticas de seguridad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-colors duration-200`}>
          <h3 className="text-lg font-semibold mb-4">Amenazas</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Total</span>
              <span className="font-bold">{securityThreats.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Sin resolver</span>
              <span className={`font-bold ${unresolvedThreats.length > 0 ? 'text-red-500' : ''}`}>
                {unresolvedThreats.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Críticas</span>
              <span className={`font-bold ${criticalThreats.length > 0 ? 'text-red-500' : ''}`}>
                {criticalThreats.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Altas</span>
              <span className={`font-bold ${highThreats.length > 0 ? 'text-orange-500' : ''}`}>
                {highThreats.length}
              </span>
            </div>
          </div>
        </div>
        
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-colors duration-200`}>
          <h3 className="text-lg font-semibold mb-4">Configuración</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Total</span>
              <span className="font-bold">{securitySettings.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Habilitadas</span>
              <span className={`font-bold ${
                enabledSettings.length < securitySettings.length / 2 
                  ? 'text-red-500' 
                  : enabledSettings.length < securitySettings.length 
                    ? 'text-yellow-500' 
                    : 'text-green-500'
              }`}>
                {enabledSettings.length} / {securitySettings.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Básicas</span>
              <span className="font-bold">
                {securitySettings.filter(s => s.level === 'basic' && s.enabled).length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Avanzadas</span>
              <span className="font-bold">
                {securitySettings.filter(s => (s.level === 'enhanced' || s.level === 'maximum') && s.enabled).length}
              </span>
            </div>
          </div>
        </div>
        
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-colors duration-200`}>
          <h3 className="text-lg font-semibold mb-4">Estado</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${
                unresolvedThreats.length === 0 ? 'bg-green-500' : 'bg-red-500'
              } mr-2`}></div>
              <span>Amenazas</span>
              <span className="ml-auto font-medium">
                {unresolvedThreats.length === 0 ? 'Resueltas' : 'Pendientes'}
              </span>
            </div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${
                enabledSettings.length >= securitySettings.length * 0.7 ? 'bg-green-500' : 'bg-yellow-500'
              } mr-2`}></div>
              <span>Configuración</span>
              <span className="ml-auto font-medium">
                {enabledSettings.length >= securitySettings.length * 0.7 ? 'Óptima' : 'Mejorable'}
              </span>
            </div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${
                securityScore >= 70 ? 'bg-green-500' : securityScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              } mr-2`}></div>
              <span>Puntuación</span>
              <span className="ml-auto font-medium">
                {securityScore >= 70 ? 'Buena' : securityScore >= 50 ? 'Regular' : 'Baja'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recomendaciones */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-colors duration-200`}>
        <h3 className="text-lg font-semibold mb-4">Recomendaciones</h3>
        
        {recommendations.length > 0 ? (
          <ul className="space-y-3">
            {recommendations.map((recommendation, index) => (
              <li key={index} className="flex">
                <div className="flex-shrink-0 mt-1">
                  <i className="fas fa-shield-alt text-blue-500"></i>
                </div>
                <p className="ml-3 text-sm text-gray-600 dark:text-gray-300">{recommendation}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No hay recomendaciones en este momento. Tu configuración de seguridad es óptima.
          </p>
        )}
      </div>
    </div>
  );
};

// Componente para la pestaña de amenazas
const ThreatsTab = ({ 
  securityThreats, 
  resolveSecurityThreat, 
  isDarkMode 
}: { 
  securityThreats: SecurityThreat[], 
  resolveSecurityThreat: (threatId: string) => Promise<boolean>, 
  isDarkMode: boolean 
}) => {
  const [resolvingThreat, setResolvingThreat] = useState<string | null>(null);
  
  // Manejar resolución de amenaza
  const handleResolveThreat = async (threatId: string) => {
    setResolvingThreat(threatId);
    await resolveSecurityThreat(threatId);
    setResolvingThreat(null);
  };
  
  // Obtener color según severidad
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };
  
  // Obtener texto según severidad
  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'Crítica';
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
      default:
        return severity;
    }
  };
  
  // Obtener icono según tipo
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'authentication':
        return 'fa-user-lock';
      case 'authorization':
        return 'fa-user-shield';
      case 'input_validation':
        return 'fa-code';
      case 'rate_limit':
        return 'fa-tachometer-alt';
      case 'suspicious_activity':
        return 'fa-exclamation-triangle';
      default:
        return 'fa-shield-alt';
    }
  };
  
  // Filtrar amenazas no resueltas primero
  const sortedThreats = [...securityThreats].sort((a, b) => {
    // Primero por estado (no resueltas primero)
    if (a.resolved !== b.resolved) {
      return a.resolved ? 1 : -1;
    }
    
    // Luego por severidad (críticas primero)
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity as keyof typeof severityOrder] - severityOrder[b.severity as keyof typeof severityOrder];
  });
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Amenazas de Seguridad</h2>
      
      {securityThreats.length === 0 ? (
        <div className={`p-4 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <p className="text-center">No hay amenazas de seguridad registradas.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedThreats.map((threat) => (
            <div 
              key={threat.id} 
              className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-colors duration-200 ${
                !threat.resolved ? 'border-l-4 border-red-500' : ''
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <i className={`fas ${getTypeIcon(threat.type)} text-lg ${
                      threat.severity === 'critical' ? 'text-red-500' :
                      threat.severity === 'high' ? 'text-orange-500' :
                      threat.severity === 'medium' ? 'text-yellow-500' :
                      'text-blue-500'
                    }`}></i>
                  </div>
                  <div className="ml-3">
                    <div className="flex items-center">
                      <h3 className="text-lg font-semibold">{threat.description}</h3>
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getSeverityColor(threat.severity)}`}>
                        {getSeverityText(threat.severity)}
                      </span>
                      {threat.resolved && (
                        <span className="ml-2 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Resuelta
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(threat.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {!threat.resolved && (
                  <button
                    onClick={() => handleResolveThreat(threat.id)}
                    disabled={resolvingThreat === threat.id}
                    className={`mt-4 md:mt-0 px-4 py-2 rounded-md ${
                      resolvingThreat === threat.id
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600'
                    } text-white flex items-center`}
                    aria-label="Resolver amenaza"
                  >
                    {resolvingThreat === threat.id ? (
                      <span className="inline-block animate-spin mr-2">⟳</span>
                    ) : (
                      <i className="fas fa-check mr-2"></i>
                    )}
                    Resolver
                  </button>
                )}
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-sm">
                  <span className="font-medium">Tipo:</span>{' '}
                  {threat.type === 'authentication' ? 'Autenticación' :
                   threat.type === 'authorization' ? 'Autorización' :
                   threat.type === 'input_validation' ? 'Validación de entrada' :
                   threat.type === 'rate_limit' ? 'Límite de tasa' :
                   threat.type === 'suspicious_activity' ? 'Actividad sospechosa' :
                   threat.type}
                </div>
                
                {threat.ip_address && (
                  <div className="text-sm">
                    <span className="font-medium">Dirección IP:</span> {threat.ip_address}
                  </div>
                )}
                
                {threat.user_agent && (
                  <div className="text-sm col-span-1 md:col-span-2">
                    <span className="font-medium">Agente de usuario:</span> {threat.user_agent}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Componente para la pestaña de configuración
const SettingsTab = ({ 
  securitySettings, 
  updateSecuritySetting, 
  isDarkMode, 
  colorClass 
}: { 
  securitySettings: SecuritySetting[], 
  updateSecuritySetting: (settingId: string, enabled: boolean, level?: 'basic' | 'enhanced' | 'maximum') => Promise<boolean>, 
  isDarkMode: boolean, 
  colorClass: string 
}) => {
  const [updatingSetting, setUpdatingSetting] = useState<string | null>(null);
  
  // Manejar cambio de estado
  const handleToggleSetting = async (settingId: string, enabled: boolean) => {
    setUpdatingSetting(settingId);
    await updateSecuritySetting(settingId, enabled);
    setUpdatingSetting(null);
  };
  
  // Manejar cambio de nivel
  const handleChangeLevel = async (settingId: string, level: 'basic' | 'enhanced' | 'maximum', enabled: boolean) => {
    setUpdatingSetting(settingId);
    await updateSecuritySetting(settingId, enabled, level);
    setUpdatingSetting(null);
  };
  
  // Obtener nombre legible
  const getReadableName = (name: string) => {
    switch (name) {
      case 'two_factor_authentication':
        return 'Autenticación de dos factores';
      case 'ip_whitelist':
        return 'Lista blanca de direcciones IP';
      case 'session_timeout':
        return 'Tiempo de espera de sesión';
      case 'password_policy':
        return 'Política de contraseñas';
      case 'activity_logging':
        return 'Registro de actividad';
      case 'rate_limiting':
        return 'Limitación de tasa';
      case 'content_security_policy':
        return 'Política de seguridad de contenido';
      default:
        return name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  };
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Configuración de Seguridad</h2>
      
      <div className="space-y-6">
        {securitySettings.map((setting) => (
          <div 
            key={setting.id} 
            className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-colors duration-200`}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold">{getReadableName(setting.name)}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {setting.description}
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 flex items-center">
                <span className="mr-3 text-sm font-medium">
                  {setting.enabled ? 'Activado' : 'Desactivado'}
                </span>
                <button
                  onClick={() => handleToggleSetting(setting.id, !setting.enabled)}
                  disabled={updatingSetting === setting.id}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    setting.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  aria-pressed={setting.enabled}
                  aria-label={`${setting.enabled ? 'Desactivar' : 'Activar'} ${getReadableName(setting.name)}`}
                >
                  <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                      setting.enabled ? 'translate-x-6' : 'translate-x-1'
                    } ${updatingSetting === setting.id ? 'animate-pulse' : ''}`}
                  />
                </button>
              </div>
            </div>
            
            {setting.enabled && (
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Nivel de protección</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleChangeLevel(setting.id, 'basic', true)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      setting.level === 'basic' 
                        ? colorClass + ' text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                    } ${updatingSetting === setting.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={updatingSetting === setting.id}
                    aria-pressed={setting.level === 'basic'}
                  >
                    Básico
                  </button>
                  <button
                    onClick={() => handleChangeLevel(setting.id, 'enhanced', true)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      setting.level === 'enhanced' 
                        ? colorClass + ' text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                    } ${updatingSetting === setting.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={updatingSetting === setting.id}
                    aria-pressed={setting.level === 'enhanced'}
                  >
                    Mejorado
                  </button>
                  <button
                    onClick={() => handleChangeLevel(setting.id, 'maximum', true)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      setting.level === 'maximum' 
                        ? colorClass + ' text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                    } ${updatingSetting === setting.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={updatingSetting === setting.id}
                    aria-pressed={setting.level === 'maximum'}
                  >
                    Máximo
                  </button>
                </div>
              </div>
            )}
            
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Última actualización: {new Date(setting.last_updated).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente para la pestaña de auditoría
const AuditTab = ({ 
  securityAudits, 
  isDarkMode 
}: { 
  securityAudits: SecurityAudit[], 
  isDarkMode: boolean 
}) => {
  // Obtener color según éxito
  const getSuccessColor = (success: boolean) => {
    return success 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };
  
  // Obtener icono según acción
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login':
        return 'fa-sign-in-alt';
      case 'logout':
        return 'fa-sign-out-alt';
      case 'update_profile':
        return 'fa-user-edit';
      case 'create_clone':
        return 'fa-robot';
      case 'api_access':
        return 'fa-code';
      case 'update_settings':
        return 'fa-cog';
      case 'update_security_setting':
        return 'fa-shield-alt';
      case 'resolve_security_threat':
        return 'fa-check-circle';
      default:
        return 'fa-history';
    }
  };
  
  // Obtener nombre legible de acción
  const getReadableAction = (action: string) => {
    switch (action) {
      case 'login':
        return 'Inicio de sesión';
      case 'logout':
        return 'Cierre de sesión';
      case 'update_profile':
        return 'Actualización de perfil';
      case 'create_clone':
        return 'Creación de clon';
      case 'api_access':
        return 'Acceso a API';
      case 'update_settings':
        return 'Actualización de configuración';
      case 'update_security_setting':
        return 'Actualización de seguridad';
      case 'resolve_security_threat':
        return 'Resolución de amenaza';
      default:
        return action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  };
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Registro de Auditoría</h2>
      
      {securityAudits.length === 0 ? (
        <div className={`p-4 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <p className="text-center">No hay registros de auditoría disponibles.</p>
        </div>
      ) : (
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden transition-colors duration-200`}>
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Acción</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Recurso</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Fecha</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Estado</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {securityAudits.map((audit, index) => (
                <tr key={audit.id} className={index % 2 === 0 ? (isDarkMode ? 'bg-gray-800' : 'bg-white') : (isDarkMode ? 'bg-gray-750' : 'bg-gray-50')}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center">
                      <i className={`fas ${getActionIcon(audit.action)} mr-2 ${
                        audit.success ? 'text-green-500' : 'text-red-500'
                      }`}></i>
                      {getReadableAction(audit.action)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {audit.resource}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(audit.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getSuccessColor(audit.success)}`}>
                      {audit.success ? 'Exitoso' : 'Fallido'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {audit.details || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SecurityCenter;
