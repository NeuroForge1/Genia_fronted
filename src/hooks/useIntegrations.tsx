import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

// Tipos para integraciones
export type Integration = {
  id: string;
  name: string;
  platform: 'facebook' | 'instagram' | 'gmail' | 'analytics' | 'youtube' | 'spotify' | 'zoom' | 'tiktok' | 'zapier' | 'applevel' | 'calendar' | 'other';
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  last_synced?: Date;
  error_message?: string;
  settings?: Record<string, any>;
  usage_stats?: {
    requests_count: number;
    success_rate: number;
    last_used?: Date;
  };
};

export type IntegrationAction = {
  id: string;
  integration_id: string;
  action_type: 'post' | 'message' | 'email' | 'schedule' | 'analyze' | 'sync' | 'other';
  status: 'success' | 'failed' | 'pending';
  timestamp: Date;
  details?: string;
  error_message?: string;
};

// Hook principal para integraciones
export const useIntegrations = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para integraciones
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [recentActions, setRecentActions] = useState<IntegrationAction[]>([]);
  
  // Cargar integraciones
  const loadIntegrations = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchIntegrations(),
        fetchRecentActions()
      ]);
    } catch (err) {
      console.error('Error al cargar integraciones:', err);
      setError('Error al cargar integraciones. Por favor, intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  // Cargar automáticamente al montar el componente
  useEffect(() => {
    if (user) {
      loadIntegrations();
    }
  }, [user, loadIntegrations]);
  
  // Obtener integraciones
  const fetchIntegrations = async () => {
    // En una implementación real, esto obtendría datos de la base de datos
    // Aquí simulamos la obtención de integraciones
    
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', user?.id);
      
    if (error) {
      console.error('Error al obtener integraciones:', error);
      // Si la tabla no existe, simular datos
      const simulatedIntegrations: Integration[] = [
        {
          id: '1',
          name: 'Facebook',
          platform: 'facebook',
          status: 'connected',
          last_synced: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
          settings: {
            page_id: '123456789',
            auto_post: true
          },
          usage_stats: {
            requests_count: 145,
            success_rate: 0.98,
            last_used: new Date(Date.now() - 1000 * 60 * 60) // 1 hora atrás
          }
        },
        {
          id: '2',
          name: 'Instagram',
          platform: 'instagram',
          status: 'connected',
          last_synced: new Date(Date.now() - 1000 * 60 * 60), // 1 hora atrás
          settings: {
            account_id: '987654321',
            auto_post: true
          },
          usage_stats: {
            requests_count: 87,
            success_rate: 0.95,
            last_used: new Date(Date.now() - 1000 * 60 * 120) // 2 horas atrás
          }
        },
        {
          id: '3',
          name: 'Gmail',
          platform: 'gmail',
          status: 'connected',
          last_synced: new Date(Date.now() - 1000 * 60 * 120), // 2 horas atrás
          settings: {
            email: 'usuario@gmail.com',
            auto_reply: false
          },
          usage_stats: {
            requests_count: 210,
            success_rate: 0.99,
            last_used: new Date(Date.now() - 1000 * 60 * 30) // 30 minutos atrás
          }
        },
        {
          id: '4',
          name: 'Google Analytics',
          platform: 'analytics',
          status: 'connected',
          last_synced: new Date(Date.now() - 1000 * 60 * 180), // 3 horas atrás
          settings: {
            property_id: 'UA-12345678-1',
            auto_sync: true
          },
          usage_stats: {
            requests_count: 56,
            success_rate: 1.0,
            last_used: new Date(Date.now() - 1000 * 60 * 240) // 4 horas atrás
          }
        },
        {
          id: '5',
          name: 'YouTube',
          platform: 'youtube',
          status: 'error',
          last_synced: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 día atrás
          error_message: 'Error de autenticación. Por favor, reconecta tu cuenta.',
          settings: {
            channel_id: 'UC12345678',
            auto_upload: false
          },
          usage_stats: {
            requests_count: 32,
            success_rate: 0.75,
            last_used: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 día atrás
          }
        },
        {
          id: '6',
          name: 'Spotify',
          platform: 'spotify',
          status: 'disconnected',
          settings: {
            playlist_id: '12345678',
            auto_sync: false
          },
          usage_stats: {
            requests_count: 0,
            success_rate: 0,
          }
        },
        {
          id: '7',
          name: 'Zoom',
          platform: 'zoom',
          status: 'connected',
          last_synced: new Date(Date.now() - 1000 * 60 * 240), // 4 horas atrás
          settings: {
            account_id: 'zoom_12345',
            auto_schedule: true
          },
          usage_stats: {
            requests_count: 18,
            success_rate: 1.0,
            last_used: new Date(Date.now() - 1000 * 60 * 300) // 5 horas atrás
          }
        },
        {
          id: '8',
          name: 'TikTok',
          platform: 'tiktok',
          status: 'pending',
          settings: {
            account_id: 'tiktok_12345',
            auto_post: false
          },
          usage_stats: {
            requests_count: 0,
            success_rate: 0,
          }
        },
        {
          id: '9',
          name: 'Zapier',
          platform: 'zapier',
          status: 'connected',
          last_synced: new Date(Date.now() - 1000 * 60 * 360), // 6 horas atrás
          settings: {
            api_key: 'zap_12345',
            auto_trigger: true
          },
          usage_stats: {
            requests_count: 42,
            success_rate: 0.97,
            last_used: new Date(Date.now() - 1000 * 60 * 400) // 6.6 horas atrás
          }
        },
        {
          id: '10',
          name: 'Google Calendar',
          platform: 'calendar',
          status: 'connected',
          last_synced: new Date(Date.now() - 1000 * 60 * 420), // 7 horas atrás
          settings: {
            calendar_id: 'calendar_12345',
            auto_sync: true
          },
          usage_stats: {
            requests_count: 76,
            success_rate: 0.99,
            last_used: new Date(Date.now() - 1000 * 60 * 60) // 1 hora atrás
          }
        }
      ];
      
      setIntegrations(simulatedIntegrations);
      return simulatedIntegrations;
    }
    
    const integrationData = data as Integration[];
    setIntegrations(integrationData);
    return integrationData;
  };
  
  // Obtener acciones recientes
  const fetchRecentActions = async () => {
    // En una implementación real, esto obtendría datos de la base de datos
    // Aquí simulamos la obtención de acciones recientes
    
    const { data, error } = await supabase
      .from('integration_actions')
      .select('*')
      .eq('user_id', user?.id)
      .order('timestamp', { ascending: false })
      .limit(20);
      
    if (error) {
      console.error('Error al obtener acciones recientes:', error);
      // Si la tabla no existe, simular datos
      const simulatedActions: IntegrationAction[] = [
        {
          id: '1',
          integration_id: '1', // Facebook
          action_type: 'post',
          status: 'success',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
          details: 'Publicación automática en Facebook'
        },
        {
          id: '2',
          integration_id: '2', // Instagram
          action_type: 'post',
          status: 'success',
          timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hora atrás
          details: 'Publicación de imagen en Instagram'
        },
        {
          id: '3',
          integration_id: '3', // Gmail
          action_type: 'email',
          status: 'success',
          timestamp: new Date(Date.now() - 1000 * 60 * 90), // 1.5 horas atrás
          details: 'Envío de correo electrónico a 5 destinatarios'
        },
        {
          id: '4',
          integration_id: '5', // YouTube
          action_type: 'post',
          status: 'failed',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 día atrás
          details: 'Intento de publicación de video en YouTube',
          error_message: 'Error de autenticación'
        },
        {
          id: '5',
          integration_id: '7', // Zoom
          action_type: 'schedule',
          status: 'success',
          timestamp: new Date(Date.now() - 1000 * 60 * 240), // 4 horas atrás
          details: 'Programación de reunión en Zoom'
        },
        {
          id: '6',
          integration_id: '9', // Zapier
          action_type: 'sync',
          status: 'success',
          timestamp: new Date(Date.now() - 1000 * 60 * 360), // 6 horas atrás
          details: 'Sincronización de datos con Zapier'
        },
        {
          id: '7',
          integration_id: '10', // Google Calendar
          action_type: 'schedule',
          status: 'success',
          timestamp: new Date(Date.now() - 1000 * 60 * 420), // 7 horas atrás
          details: 'Creación de evento en Google Calendar'
        },
        {
          id: '8',
          integration_id: '4', // Google Analytics
          action_type: 'analyze',
          status: 'success',
          timestamp: new Date(Date.now() - 1000 * 60 * 180), // 3 horas atrás
          details: 'Análisis de datos de Google Analytics'
        },
        {
          id: '9',
          integration_id: '1', // Facebook
          action_type: 'post',
          status: 'success',
          timestamp: new Date(Date.now() - 1000 * 60 * 150), // 2.5 horas atrás
          details: 'Publicación programada en Facebook'
        },
        {
          id: '10',
          integration_id: '3', // Gmail
          action_type: 'email',
          status: 'pending',
          timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutos atrás
          details: 'Envío de correo electrónico en proceso'
        }
      ];
      
      setRecentActions(simulatedActions);
      return simulatedActions;
    }
    
    const actionData = data as IntegrationAction[];
    setRecentActions(actionData);
    return actionData;
  };
  
  // Conectar integración
  const connectIntegration = async (platform: Integration['platform'], settings?: Record<string, any>) => {
    setLoading(true);
    
    try {
      // En una implementación real, esto conectaría con la API de la plataforma
      // Aquí simulamos la conexión
      
      // Generar ID único
      const id = Date.now().toString();
      
      // Crear nueva integración
      const newIntegration: Integration = {
        id,
        name: getPlatformName(platform),
        platform,
        status: 'connected',
        last_synced: new Date(),
        settings: settings || {},
        usage_stats: {
          requests_count: 0,
          success_rate: 1.0,
          last_used: new Date()
        }
      };
      
      // Actualizar estado
      setIntegrations([...integrations, newIntegration]);
      
      // Registrar acción
      const newAction: IntegrationAction = {
        id: Date.now().toString(),
        integration_id: id,
        action_type: 'sync',
        status: 'success',
        timestamp: new Date(),
        details: `Conexión exitosa con ${getPlatformName(platform)}`
      };
      
      setRecentActions([newAction, ...recentActions]);
      
      setLoading(false);
      return newIntegration;
    } catch (err) {
      console.error(`Error al conectar con ${platform}:`, err);
      setError(`Error al conectar con ${platform}. Por favor, intenta de nuevo más tarde.`);
      setLoading(false);
      return null;
    }
  };
  
  // Desconectar integración
  const disconnectIntegration = async (integrationId: string) => {
    setLoading(true);
    
    try {
      // En una implementación real, esto desconectaría de la API de la plataforma
      // Aquí simulamos la desconexión
      
      // Actualizar estado
      const updatedIntegrations = integrations.map(integration => {
        if (integration.id === integrationId) {
          return {
            ...integration,
            status: 'disconnected' as const,
            last_synced: new Date()
          };
        }
        return integration;
      });
      
      setIntegrations(updatedIntegrations);
      
      // Registrar acción
      const integration = integrations.find(i => i.id === integrationId);
      if (integration) {
        const newAction: IntegrationAction = {
          id: Date.now().toString(),
          integration_id: integrationId,
          action_type: 'sync',
          status: 'success',
          timestamp: new Date(),
          details: `Desconexión exitosa de ${integration.name}`
        };
        
        setRecentActions([newAction, ...recentActions]);
      }
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error(`Error al desconectar integración ${integrationId}:`, err);
      setError(`Error al desconectar integración. Por favor, intenta de nuevo más tarde.`);
      setLoading(false);
      return false;
    }
  };
  
  // Actualizar configuración de integración
  const updateIntegrationSettings = async (integrationId: string, settings: Record<string, any>) => {
    setLoading(true);
    
    try {
      // En una implementación real, esto actualizaría la configuración en la base de datos
      // Aquí simulamos la actualización
      
      // Actualizar estado
      const updatedIntegrations = integrations.map(integration => {
        if (integration.id === integrationId) {
          return {
            ...integration,
            settings: {
              ...integration.settings,
              ...settings
            },
            last_synced: new Date()
          };
        }
        return integration;
      });
      
      setIntegrations(updatedIntegrations);
      
      // Registrar acción
      const integration = integrations.find(i => i.id === integrationId);
      if (integration) {
        const newAction: IntegrationAction = {
          id: Date.now().toString(),
          integration_id: integrationId,
          action_type: 'sync',
          status: 'success',
          timestamp: new Date(),
          details: `Actualización de configuración de ${integration.name}`
        };
        
        setRecentActions([newAction, ...recentActions]);
      }
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error(`Error al actualizar configuración de integración ${integrationId}:`, err);
      setError(`Error al actualizar configuración. Por favor, intenta de nuevo más tarde.`);
      setLoading(false);
      return false;
    }
  };
  
  // Ejecutar acción en integración
  const executeIntegrationAction = async (
    integrationId: string, 
    actionType: IntegrationAction['action_type'], 
    details: string
  ) => {
    setLoading(true);
    
    try {
      // En una implementación real, esto ejecutaría una acción en la API de la plataforma
      // Aquí simulamos la ejecución
      
      // Verificar que la integración existe y está conectada
      const integration = integrations.find(i => i.id === integrationId);
      if (!integration) {
        throw new Error('Integración no encontrada');
      }
      
      if (integration.status !== 'connected') {
        throw new Error('Integración no conectada');
      }
      
      // Simular éxito o fallo aleatorio (90% de éxito)
      const success = Math.random() > 0.1;
      
      // Registrar acción
      const newAction: IntegrationAction = {
        id: Date.now().toString(),
        integration_id: integrationId,
        action_type: actionType,
        status: success ? 'success' : 'failed',
        timestamp: new Date(),
        details,
        error_message: success ? undefined : 'Error al ejecutar acción'
      };
      
      setRecentActions([newAction, ...recentActions]);
      
      // Actualizar estadísticas de uso
      const updatedIntegrations = integrations.map(i => {
        if (i.id === integrationId) {
          const currentStats = i.usage_stats || { requests_count: 0, success_rate: 0 };
          const newRequestsCount = currentStats.requests_count + 1;
          const newSuccessCount = (currentStats.requests_count * currentStats.success_rate) + (success ? 1 : 0);
          
          return {
            ...i,
            last_synced: new Date(),
            usage_stats: {
              requests_count: newRequestsCount,
              success_rate: newSuccessCount / newRequestsCount,
              last_used: new Date()
            }
          };
        }
        return i;
      });
      
      setIntegrations(updatedIntegrations);
      
      setLoading(false);
      return success;
    } catch (err) {
      console.error(`Error al ejecutar acción en integración ${integrationId}:`, err);
      setError(`Error al ejecutar acción. Por favor, intenta de nuevo más tarde.`);
      setLoading(false);
      return false;
    }
  };
  
  // Obtener nombre legible de plataforma
  const getPlatformName = (platform: Integration['platform']) => {
    switch (platform) {
      case 'facebook':
        return 'Facebook';
      case 'instagram':
        return 'Instagram';
      case 'gmail':
        return 'Gmail';
      case 'analytics':
        return 'Google Analytics';
      case 'youtube':
        return 'YouTube';
      case 'spotify':
        return 'Spotify';
      case 'zoom':
        return 'Zoom';
      case 'tiktok':
        return 'TikTok';
      case 'zapier':
        return 'Zapier';
      case 'applevel':
        return 'AppLevel';
      case 'calendar':
        return 'Google Calendar';
      case 'other':
        return 'Otra plataforma';
      default:
        return platform;
    }
  };
  
  // Obtener estadísticas de integraciones
  const getIntegrationStats = () => {
    const connectedCount = integrations.filter(i => i.status === 'connected').length;
    const disconnectedCount = integrations.filter(i => i.status === 'disconnected').length;
    const errorCount = integrations.filter(i => i.status === 'error').length;
    const pendingCount = integrations.filter(i => i.status === 'pending').length;
    
    const totalRequests = integrations.reduce((sum, i) => sum + (i.usage_stats?.requests_count || 0), 0);
    const successfulRequests = integrations.reduce((sum, i) => {
      const stats = i.usage_stats;
      if (!stats) return sum;
      return sum + (stats.requests_count * stats.success_rate);
    }, 0);
    
    const overallSuccessRate = totalRequests > 0 ? successfulRequests / totalRequests : 0;
    
    const mostUsedIntegration = [...integrations].sort((a, b) => {
      return (b.usage_stats?.requests_count || 0) - (a.usage_stats?.requests_count || 0);
    })[0];
    
    const recentSuccessCount = recentActions.filter(a => a.status === 'success').length;
    const recentFailCount = recentActions.filter(a => a.status === 'failed').length;
    const recentPendingCount = recentActions.filter(a => a.status === 'pending').length;
    
    return {
      total: integrations.length,
      connected: connectedCount,
      disconnected: disconnectedCount,
      error: errorCount,
      pending: pendingCount,
      totalRequests,
      successfulRequests,
      overallSuccessRate,
      mostUsedIntegration,
      recentSuccessCount,
      recentFailCount,
      recentPendingCount
    };
  };
  
  return {
    loading,
    error,
    integrations,
    recentActions,
    loadIntegrations,
    connectIntegration,
    disconnectIntegration,
    updateIntegrationSettings,
    executeIntegrationAction,
    getPlatformName,
    getIntegrationStats
  };
};
