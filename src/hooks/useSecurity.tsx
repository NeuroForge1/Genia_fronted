import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

// Tipos para seguridad
export type SecurityThreat = {
  id: string;
  type: 'authentication' | 'authorization' | 'input_validation' | 'rate_limit' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: Date;
  ip_address?: string;
  user_agent?: string;
  resolved: boolean;
};

export type SecuritySetting = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  level: 'basic' | 'enhanced' | 'maximum';
  last_updated: Date;
};

export type SecurityAudit = {
  id: string;
  action: string;
  user_id: string;
  resource: string;
  timestamp: Date;
  ip_address?: string;
  success: boolean;
  details?: string;
};

// Hook principal para seguridad
export const useSecurity = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para diferentes aspectos de seguridad
  const [securityThreats, setSecurityThreats] = useState<SecurityThreat[]>([]);
  const [securitySettings, setSecuritySettings] = useState<SecuritySetting[]>([]);
  const [securityAudits, setSecurityAudits] = useState<SecurityAudit[]>([]);
  const [securityScore, setSecurityScore] = useState<number>(0);
  
  // Cargar datos de seguridad
  const loadSecurityData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchSecurityThreats(),
        fetchSecuritySettings(),
        fetchSecurityAudits()
      ]);
      
      calculateSecurityScore();
    } catch (err) {
      console.error('Error al cargar datos de seguridad:', err);
      setError('Error al cargar datos de seguridad. Por favor, intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  // Cargar automáticamente al montar el componente
  useEffect(() => {
    if (user) {
      loadSecurityData();
    }
  }, [user, loadSecurityData]);
  
  // Obtener amenazas de seguridad
  const fetchSecurityThreats = async () => {
    // En una implementación real, esto obtendría datos de la base de datos
    // Aquí simulamos la obtención de amenazas de seguridad
    
    const { data, error } = await supabase
      .from('security_threats')
      .select('*')
      .eq('user_id', user?.id)
      .order('timestamp', { ascending: false });
      
    if (error) {
      console.error('Error al obtener amenazas de seguridad:', error);
      // Si la tabla no existe, simular datos
      const simulatedThreats: SecurityThreat[] = [
        {
          id: '1',
          type: 'authentication',
          severity: 'medium',
          description: 'Múltiples intentos fallidos de inicio de sesión',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 días atrás
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          resolved: true
        },
        {
          id: '2',
          type: 'authorization',
          severity: 'high',
          description: 'Intento de acceso a recursos no autorizados',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 día atrás
          ip_address: '192.168.1.2',
          user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          resolved: false
        },
        {
          id: '3',
          type: 'input_validation',
          severity: 'low',
          description: 'Entrada potencialmente maliciosa detectada',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 horas atrás
          ip_address: '192.168.1.3',
          user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
          resolved: false
        },
        {
          id: '4',
          type: 'rate_limit',
          severity: 'medium',
          description: 'Exceso de solicitudes API detectado',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
          ip_address: '192.168.1.4',
          user_agent: 'PostmanRuntime/7.28.4',
          resolved: false
        },
        {
          id: '5',
          type: 'suspicious_activity',
          severity: 'critical',
          description: 'Patrón de comportamiento anómalo detectado',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
          ip_address: '192.168.1.5',
          user_agent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
          resolved: false
        }
      ];
      
      setSecurityThreats(simulatedThreats);
      return simulatedThreats;
    }
    
    const threats = data as SecurityThreat[];
    setSecurityThreats(threats);
    return threats;
  };
  
  // Obtener configuraciones de seguridad
  const fetchSecuritySettings = async () => {
    // En una implementación real, esto obtendría datos de la base de datos
    // Aquí simulamos la obtención de configuraciones de seguridad
    
    const { data, error } = await supabase
      .from('security_settings')
      .select('*')
      .eq('user_id', user?.id);
      
    if (error) {
      console.error('Error al obtener configuraciones de seguridad:', error);
      // Si la tabla no existe, simular datos
      const simulatedSettings: SecuritySetting[] = [
        {
          id: '1',
          name: 'two_factor_authentication',
          description: 'Autenticación de dos factores',
          enabled: false,
          level: 'enhanced',
          last_updated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) // 7 días atrás
        },
        {
          id: '2',
          name: 'ip_whitelist',
          description: 'Lista blanca de direcciones IP',
          enabled: false,
          level: 'maximum',
          last_updated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) // 7 días atrás
        },
        {
          id: '3',
          name: 'session_timeout',
          description: 'Tiempo de espera de sesión',
          enabled: true,
          level: 'basic',
          last_updated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) // 7 días atrás
        },
        {
          id: '4',
          name: 'password_policy',
          description: 'Política de contraseñas',
          enabled: true,
          level: 'enhanced',
          last_updated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) // 7 días atrás
        },
        {
          id: '5',
          name: 'activity_logging',
          description: 'Registro de actividad',
          enabled: true,
          level: 'basic',
          last_updated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) // 7 días atrás
        },
        {
          id: '6',
          name: 'rate_limiting',
          description: 'Limitación de tasa',
          enabled: true,
          level: 'basic',
          last_updated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) // 7 días atrás
        },
        {
          id: '7',
          name: 'content_security_policy',
          description: 'Política de seguridad de contenido',
          enabled: false,
          level: 'maximum',
          last_updated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) // 7 días atrás
        }
      ];
      
      setSecuritySettings(simulatedSettings);
      return simulatedSettings;
    }
    
    const settings = data as SecuritySetting[];
    setSecuritySettings(settings);
    return settings;
  };
  
  // Obtener auditorías de seguridad
  const fetchSecurityAudits = async () => {
    // En una implementación real, esto obtendría datos de la base de datos
    // Aquí simulamos la obtención de auditorías de seguridad
    
    const { data, error } = await supabase
      .from('security_audits')
      .select('*')
      .eq('user_id', user?.id)
      .order('timestamp', { ascending: false })
      .limit(50);
      
    if (error) {
      console.error('Error al obtener auditorías de seguridad:', error);
      // Si la tabla no existe, simular datos
      const simulatedAudits: SecurityAudit[] = [
        {
          id: '1',
          action: 'login',
          user_id: user?.id || '',
          resource: 'auth',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 días atrás
          ip_address: '192.168.1.1',
          success: true,
          details: 'Inicio de sesión exitoso'
        },
        {
          id: '2',
          action: 'update_profile',
          user_id: user?.id || '',
          resource: 'users',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 día atrás
          ip_address: '192.168.1.1',
          success: true,
          details: 'Actualización de perfil'
        },
        {
          id: '3',
          action: 'create_clone',
          user_id: user?.id || '',
          resource: 'clones',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 horas atrás
          ip_address: '192.168.1.1',
          success: true,
          details: 'Creación de clon Content'
        },
        {
          id: '4',
          action: 'api_access',
          user_id: user?.id || '',
          resource: 'api/clones',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 horas atrás
          ip_address: '192.168.1.1',
          success: true,
          details: 'Acceso a API de clones'
        },
        {
          id: '5',
          action: 'login',
          user_id: user?.id || '',
          resource: 'auth',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
          ip_address: '192.168.1.2',
          success: false,
          details: 'Intento de inicio de sesión fallido'
        },
        {
          id: '6',
          action: 'login',
          user_id: user?.id || '',
          resource: 'auth',
          timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hora atrás
          ip_address: '192.168.1.1',
          success: true,
          details: 'Inicio de sesión exitoso'
        },
        {
          id: '7',
          action: 'update_settings',
          user_id: user?.id || '',
          resource: 'settings',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
          ip_address: '192.168.1.1',
          success: true,
          details: 'Actualización de configuración de seguridad'
        }
      ];
      
      setSecurityAudits(simulatedAudits);
      return simulatedAudits;
    }
    
    const audits = data as SecurityAudit[];
    setSecurityAudits(audits);
    return audits;
  };
  
  // Calcular puntuación de seguridad
  const calculateSecurityScore = () => {
    // Puntuación base
    let score = 50;
    
    // Puntos por configuraciones habilitadas
    const enabledSettings = securitySettings.filter(setting => setting.enabled);
    score += enabledSettings.length * 5;
    
    // Puntos por nivel de configuración
    const enhancedSettings = securitySettings.filter(setting => setting.level === 'enhanced' && setting.enabled);
    const maximumSettings = securitySettings.filter(setting => setting.level === 'maximum' && setting.enabled);
    score += enhancedSettings.length * 2;
    score += maximumSettings.length * 5;
    
    // Penalización por amenazas no resueltas
    const unresolvedThreats = securityThreats.filter(threat => !threat.resolved);
    const criticalThreats = unresolvedThreats.filter(threat => threat.severity === 'critical');
    const highThreats = unresolvedThreats.filter(threat => threat.severity === 'high');
    const mediumThreats = unresolvedThreats.filter(threat => threat.severity === 'medium');
    
    score -= criticalThreats.length * 15;
    score -= highThreats.length * 10;
    score -= mediumThreats.length * 5;
    
    // Asegurar que la puntuación esté entre 0 y 100
    score = Math.max(0, Math.min(100, score));
    
    setSecurityScore(score);
    return score;
  };
  
  // Actualizar configuración de seguridad
  const updateSecuritySetting = async (settingId: string, enabled: boolean, level?: 'basic' | 'enhanced' | 'maximum') => {
    setLoading(true);
    
    try {
      // En una implementación real, esto actualizaría la base de datos
      // Aquí simulamos la actualización
      
      const updatedSettings = securitySettings.map(setting => {
        if (setting.id === settingId) {
          return {
            ...setting,
            enabled,
            level: level || setting.level,
            last_updated: new Date()
          };
        }
        return setting;
      });
      
      setSecuritySettings(updatedSettings);
      
      // Registrar auditoría
      const newAudit: SecurityAudit = {
        id: Date.now().toString(),
        action: 'update_security_setting',
        user_id: user?.id || '',
        resource: 'security_settings',
        timestamp: new Date(),
        success: true,
        details: `Actualización de configuración de seguridad: ${settingId}`
      };
      
      setSecurityAudits([newAudit, ...securityAudits]);
      
      // Recalcular puntuación
      setTimeout(() => {
        calculateSecurityScore();
        setLoading(false);
      }, 500);
      
      return true;
    } catch (err) {
      console.error('Error al actualizar configuración de seguridad:', err);
      setError('Error al actualizar configuración de seguridad. Por favor, intenta de nuevo más tarde.');
      setLoading(false);
      return false;
    }
  };
  
  // Resolver amenaza de seguridad
  const resolveSecurityThreat = async (threatId: string) => {
    setLoading(true);
    
    try {
      // En una implementación real, esto actualizaría la base de datos
      // Aquí simulamos la resolución
      
      const updatedThreats = securityThreats.map(threat => {
        if (threat.id === threatId) {
          return {
            ...threat,
            resolved: true
          };
        }
        return threat;
      });
      
      setSecurityThreats(updatedThreats);
      
      // Registrar auditoría
      const newAudit: SecurityAudit = {
        id: Date.now().toString(),
        action: 'resolve_security_threat',
        user_id: user?.id || '',
        resource: 'security_threats',
        timestamp: new Date(),
        success: true,
        details: `Resolución de amenaza de seguridad: ${threatId}`
      };
      
      setSecurityAudits([newAudit, ...securityAudits]);
      
      // Recalcular puntuación
      setTimeout(() => {
        calculateSecurityScore();
        setLoading(false);
      }, 500);
      
      return true;
    } catch (err) {
      console.error('Error al resolver amenaza de seguridad:', err);
      setError('Error al resolver amenaza de seguridad. Por favor, intenta de nuevo más tarde.');
      setLoading(false);
      return false;
    }
  };
  
  // Generar informe de seguridad
  const generateSecurityReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      user_id: user?.id,
      security_score: securityScore,
      summary: {
        total_threats: securityThreats.length,
        unresolved_threats: securityThreats.filter(threat => !threat.resolved).length,
        critical_threats: securityThreats.filter(threat => threat.severity === 'critical' && !threat.resolved).length,
        enabled_settings: securitySettings.filter(setting => setting.enabled).length,
        total_settings: securitySettings.length,
        recent_audits: securityAudits.slice(0, 10).length
      },
      recommendations: getSecurityRecommendations(),
      details: {
        threats: securityThreats,
        settings: securitySettings,
        recent_audits: securityAudits.slice(0, 20)
      }
    };
    
    return report;
  };
  
  // Obtener recomendaciones de seguridad
  const getSecurityRecommendations = () => {
    const recommendations: string[] = [];
    
    // Recomendaciones basadas en configuraciones
    const twoFactorSetting = securitySettings.find(setting => setting.name === 'two_factor_authentication');
    if (twoFactorSetting && !twoFactorSetting.enabled) {
      recommendations.push('Habilita la autenticación de dos factores para mejorar la seguridad de tu cuenta.');
    }
    
    const passwordPolicySetting = securitySettings.find(setting => setting.name === 'password_policy');
    if (passwordPolicySetting && (passwordPolicySetting.level === 'basic' || !passwordPolicySetting.enabled)) {
      recommendations.push('Mejora tu política de contraseñas para aumentar la seguridad de tu cuenta.');
    }
    
    const contentSecuritySetting = securitySettings.find(setting => setting.name === 'content_security_policy');
    if (contentSecuritySetting && !contentSecuritySetting.enabled) {
      recommendations.push('Habilita la política de seguridad de contenido para proteger contra ataques XSS.');
    }
    
    // Recomendaciones basadas en amenazas
    const unresolvedThreats = securityThreats.filter(threat => !threat.resolved);
    if (unresolvedThreats.length > 0) {
      recommendations.push(`Resuelve las ${unresolvedThreats.length} amenazas de seguridad pendientes.`);
    }
    
    const criticalThreats = unresolvedThreats.filter(threat => threat.severity === 'critical');
    if (criticalThreats.length > 0) {
      recommendations.push(`Atiende urgentemente las ${criticalThreats.length} amenazas críticas de seguridad.`);
    }
    
    // Recomendaciones generales
    if (recommendations.length === 0) {
      recommendations.push('Tu configuración de seguridad es buena. Continúa monitoreando regularmente.');
    }
    
    return recommendations;
  };
  
  return {
    loading,
    error,
    securityThreats,
    securitySettings,
    securityAudits,
    securityScore,
    loadSecurityData,
    updateSecuritySetting,
    resolveSecurityThreat,
    generateSecurityReport,
    getSecurityRecommendations
  };
};
