import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

// Tipos para las métricas
export type ClonePerformance = {
  clone_type: string;
  messages_count: number;
  response_time_avg: number;
  user_satisfaction: number;
  success_rate: number;
};

export type PlatformUsage = {
  platform: string;
  usage_count: number;
  success_rate: number;
  engagement_rate: number;
};

export type UsagePrediction = {
  date: string;
  predicted_usage: number;
  lower_bound: number;
  upper_bound: number;
};

export type PeriodComparison = {
  metric: string;
  current_period: number;
  previous_period: number;
  change_percentage: number;
  trend: 'up' | 'down' | 'stable';
};

export type UserRecommendation = {
  id: string;
  title: string;
  description: string;
  type: 'clone_usage' | 'platform_integration' | 'feature_usage' | 'subscription';
  priority: 'high' | 'medium' | 'low';
  action_url?: string;
};

// Hook principal de análisis
export const useAnalytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para diferentes tipos de métricas
  const [clonePerformance, setClonePerformance] = useState<ClonePerformance[]>([]);
  const [platformUsage, setPlatformUsage] = useState<PlatformUsage[]>([]);
  const [usagePredictions, setUsagePredictions] = useState<UsagePrediction[]>([]);
  const [periodComparisons, setPeriodComparisons] = useState<PeriodComparison[]>([]);
  const [recommendations, setRecommendations] = useState<UserRecommendation[]>([]);
  
  // Función para cargar todas las métricas
  const loadAllMetrics = async (dateRange: string = 'month') => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchClonePerformance(dateRange),
        fetchPlatformUsage(dateRange),
        generateUsagePredictions(dateRange),
        generatePeriodComparisons(dateRange),
        generateRecommendations()
      ]);
    } catch (err) {
      console.error('Error al cargar métricas:', err);
      setError('Error al cargar métricas. Por favor, intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };
  
  // Función para obtener rendimiento de clones
  const fetchClonePerformance = async (dateRange: string) => {
    const { startDate, endDate } = getDateRange(dateRange);
    
    // Obtener datos de mensajes por tipo de clon
    const { data: messagesData, error: messagesError } = await supabase
      .from('whatsapp_messages')
      .select('clone_type, created_at, response_time, user_feedback')
      .eq('user_id', user?.id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());
      
    if (messagesError) throw messagesError;
    
    // Procesar datos para calcular métricas por tipo de clon
    const cloneTypes = ['content', 'ads', 'ceo', 'voice', 'funnel', 'calendar'];
    const performance: ClonePerformance[] = cloneTypes.map(type => {
      const cloneMessages = messagesData?.filter(msg => msg.clone_type === type) || [];
      const messagesCount = cloneMessages.length;
      
      // Calcular tiempo de respuesta promedio
      const responseTimes = cloneMessages
        .filter(msg => msg.response_time)
        .map(msg => msg.response_time);
      const responseTimeAvg = responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
        : 0;
      
      // Calcular satisfacción del usuario (basado en feedback)
      const feedbackScores = cloneMessages
        .filter(msg => msg.user_feedback)
        .map(msg => msg.user_feedback);
      const userSatisfaction = feedbackScores.length > 0
        ? feedbackScores.reduce((sum, score) => sum + score, 0) / feedbackScores.length
        : 0;
      
      // Calcular tasa de éxito (mensajes con feedback positivo / total)
      const successfulMessages = cloneMessages.filter(msg => msg.user_feedback >= 4).length;
      const successRate = messagesCount > 0 ? (successfulMessages / messagesCount) * 100 : 0;
      
      return {
        clone_type: type,
        messages_count: messagesCount,
        response_time_avg: responseTimeAvg,
        user_satisfaction: userSatisfaction,
        success_rate: successRate
      };
    });
    
    setClonePerformance(performance);
    return performance;
  };
  
  // Función para obtener uso por plataforma
  const fetchPlatformUsage = async (dateRange: string) => {
    const { startDate, endDate } = getDateRange(dateRange);
    
    // Obtener datos de acciones por plataforma
    const { data: actionsData, error: actionsError } = await supabase
      .from('user_actions')
      .select('platform, action_type, success, engagement_score, created_at')
      .eq('user_id', user?.id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());
      
    if (actionsError) throw actionsError;
    
    // Procesar datos para calcular métricas por plataforma
    const platforms = [
      'facebook', 'instagram', 'gmail', 'analytics', 'youtube', 
      'spotify', 'zoom', 'tiktok', 'zapier', 'applevel', 'other'
    ];
    
    const usage: PlatformUsage[] = platforms.map(platform => {
      const platformActions = actionsData?.filter(action => action.platform === platform) || [];
      const usageCount = platformActions.length;
      
      // Calcular tasa de éxito
      const successfulActions = platformActions.filter(action => action.success).length;
      const successRate = usageCount > 0 ? (successfulActions / usageCount) * 100 : 0;
      
      // Calcular tasa de engagement
      const engagementScores = platformActions
        .filter(action => action.engagement_score !== null)
        .map(action => action.engagement_score);
      const engagementRate = engagementScores.length > 0
        ? engagementScores.reduce((sum, score) => sum + score, 0) / engagementScores.length
        : 0;
      
      return {
        platform,
        usage_count: usageCount,
        success_rate: successRate,
        engagement_rate: engagementRate
      };
    });
    
    setPlatformUsage(usage);
    return usage;
  };
  
  // Función para generar predicciones de uso
  const generateUsagePredictions = async (dateRange: string) => {
    const { startDate, endDate } = getDateRange(dateRange);
    
    // Obtener datos históricos de uso
    const { data: historicalData, error: historicalError } = await supabase
      .from('user_actions')
      .select('created_at')
      .eq('user_id', user?.id)
      .gte('created_at', new Date(startDate.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()) // 90 días antes
      .lte('created_at', endDate.toISOString());
      
    if (historicalError) throw historicalError;
    
    // Agrupar datos por día
    const dailyUsage: Record<string, number> = {};
    historicalData?.forEach(action => {
      const date = new Date(action.created_at).toISOString().split('T')[0];
      dailyUsage[date] = (dailyUsage[date] || 0) + 1;
    });
    
    // Convertir a array ordenado por fecha
    const usageArray = Object.entries(dailyUsage)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    // Generar predicciones para los próximos 14 días usando un modelo simple
    const predictions: UsagePrediction[] = [];
    
    if (usageArray.length > 0) {
      // Calcular promedio y desviación estándar de los últimos 30 días
      const recentUsage = usageArray.slice(-30);
      const avgUsage = recentUsage.reduce((sum, day) => sum + day.count, 0) / recentUsage.length;
      const stdDev = Math.sqrt(
        recentUsage.reduce((sum, day) => sum + Math.pow(day.count - avgUsage, 2), 0) / recentUsage.length
      );
      
      // Generar predicciones
      const lastDate = new Date(usageArray[usageArray.length - 1].date);
      
      for (let i = 1; i <= 14; i++) {
        const predictionDate = new Date(lastDate);
        predictionDate.setDate(predictionDate.getDate() + i);
        const dateStr = predictionDate.toISOString().split('T')[0];
        
        // Usar tendencia lineal simple para la predicción
        const trend = recentUsage.length > 10 
          ? (recentUsage[recentUsage.length - 1].count - recentUsage[0].count) / recentUsage.length
          : 0;
        
        const predictedUsage = Math.max(0, Math.round(avgUsage + trend * i));
        const lowerBound = Math.max(0, Math.round(predictedUsage - 1.96 * stdDev));
        const upperBound = Math.round(predictedUsage + 1.96 * stdDev);
        
        predictions.push({
          date: dateStr,
          predicted_usage: predictedUsage,
          lower_bound: lowerBound,
          upper_bound: upperBound
        });
      }
    }
    
    setUsagePredictions(predictions);
    return predictions;
  };
  
  // Función para generar comparativas entre períodos
  const generatePeriodComparisons = async (dateRange: string) => {
    const { startDate, endDate, previousStartDate, previousEndDate } = getDateRangeWithPrevious(dateRange);
    
    // Métricas a comparar
    const metricsToCompare = [
      { name: 'Mensajes totales', table: 'whatsapp_messages', countColumn: '*' },
      { name: 'Acciones realizadas', table: 'user_actions', countColumn: '*' },
      { name: 'Clones utilizados', table: 'clones_history', countColumn: 'DISTINCT clone_type' },
      { name: 'Plataformas integradas', table: 'user_actions', countColumn: 'DISTINCT platform' }
    ];
    
    const comparisons: PeriodComparison[] = [];
    
    // Obtener datos para cada métrica
    for (const metric of metricsToCompare) {
      // Período actual
      const { count: currentCount, error: currentError } = await supabase
        .from(metric.table)
        .select(metric.countColumn, { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
        
      if (currentError) throw currentError;
      
      // Período anterior
      const { count: previousCount, error: previousError } = await supabase
        .from(metric.table)
        .select(metric.countColumn, { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .gte('created_at', previousStartDate.toISOString())
        .lte('created_at', previousEndDate.toISOString());
        
      if (previousError) throw previousError;
      
      // Calcular cambio porcentual
      const current = currentCount || 0;
      const previous = previousCount || 0;
      const changePercentage = previous > 0 
        ? ((current - previous) / previous) * 100 
        : (current > 0 ? 100 : 0);
      
      // Determinar tendencia
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (changePercentage > 5) trend = 'up';
      else if (changePercentage < -5) trend = 'down';
      
      comparisons.push({
        metric: metric.name,
        current_period: current,
        previous_period: previous,
        change_percentage: changePercentage,
        trend
      });
    }
    
    setPeriodComparisons(comparisons);
    return comparisons;
  };
  
  // Función para generar recomendaciones personalizadas
  const generateRecommendations = async () => {
    if (!user) return [];
    
    // Obtener datos relevantes para generar recomendaciones
    const [clonePerf, platformUsg] = await Promise.all([
      clonePerformance.length > 0 ? Promise.resolve(clonePerformance) : fetchClonePerformance('month'),
      platformUsage.length > 0 ? Promise.resolve(platformUsage) : fetchPlatformUsage('month')
    ]);
    
    // Obtener datos de suscripción del usuario
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();
      
    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      throw subscriptionError;
    }
    
    const userRecommendations: UserRecommendation[] = [];
    
    // 1. Recomendaciones basadas en uso de clones
    const unusedClones = clonePerf.filter(clone => clone.messages_count === 0);
    if (unusedClones.length > 0) {
      unusedClones.forEach(clone => {
        userRecommendations.push({
          id: `clone_${clone.clone_type}_unused`,
          title: `Prueba el clon ${clone.clone_type.charAt(0).toUpperCase() + clone.clone_type.slice(1)}`,
          description: `Aún no has utilizado este clon. Descubre cómo puede ayudarte con tareas específicas.`,
          type: 'clone_usage',
          priority: 'medium',
          action_url: `/clones/${clone.clone_type}`
        });
      });
    }
    
    // 2. Recomendaciones basadas en rendimiento de clones
    const lowPerformingClones = clonePerf.filter(clone => 
      clone.messages_count > 0 && clone.success_rate < 70
    );
    
    if (lowPerformingClones.length > 0) {
      lowPerformingClones.forEach(clone => {
        userRecommendations.push({
          id: `clone_${clone.clone_type}_optimize`,
          title: `Optimiza tu clon ${clone.clone_type.charAt(0).toUpperCase() + clone.clone_type.slice(1)}`,
          description: `Este clon tiene una tasa de éxito del ${clone.success_rate.toFixed(1)}%. Aprende a mejorar sus resultados.`,
          type: 'clone_usage',
          priority: 'high',
          action_url: `/guides/optimize/${clone.clone_type}`
        });
      });
    }
    
    // 3. Recomendaciones basadas en plataformas no utilizadas
    const unusedPlatforms = platformUsg.filter(platform => platform.usage_count === 0);
    if (unusedPlatforms.length > 0) {
      // Limitar a 3 recomendaciones de plataformas
      unusedPlatforms.slice(0, 3).forEach(platform => {
        userRecommendations.push({
          id: `platform_${platform.platform}_unused`,
          title: `Conecta con ${platform.platform.charAt(0).toUpperCase() + platform.platform.slice(1)}`,
          description: `Integra tu cuenta de ${platform.platform} para ampliar las capacidades de tus clones.`,
          type: 'platform_integration',
          priority: 'medium',
          action_url: `/integrations/${platform.platform}`
        });
      });
    }
    
    // 4. Recomendación de actualización de suscripción
    const currentPlan = subscriptionData?.plan || 'free';
    if (currentPlan === 'free' || currentPlan === 'basic') {
      const totalUsage = clonePerf.reduce((sum, clone) => sum + clone.messages_count, 0);
      
      if (totalUsage > 50) {
        userRecommendations.push({
          id: 'subscription_upgrade',
          title: 'Actualiza tu plan',
          description: `Tu uso actual sugiere que podrías beneficiarte de un plan superior con más funcionalidades y límites más altos.`,
          type: 'subscription',
          priority: 'high',
          action_url: '/subscription'
        });
      }
    }
    
    // 5. Recomendación de funcionalidades no utilizadas
    userRecommendations.push({
      id: 'feature_analytics',
      title: 'Analiza tu rendimiento',
      description: 'Utiliza las nuevas herramientas de análisis para obtener insights sobre el rendimiento de tus clones.',
      type: 'feature_usage',
      priority: 'low',
      action_url: '/analytics'
    });
    
    setRecommendations(userRecommendations);
    return userRecommendations;
  };
  
  // Función para exportar datos en diferentes formatos
  const exportData = async (format: 'csv' | 'json' | 'excel', dateRange: string = 'month') => {
    if (!user) return null;
    
    const { startDate, endDate } = getDateRange(dateRange);
    
    // Obtener datos para exportar
    const { data: exportData, error: exportError } = await supabase
      .from('whatsapp_messages')
      .select(`
        id, 
        created_at, 
        clone_type, 
        body, 
        response_time, 
        user_feedback,
        user_actions(platform, action_type, success)
      `)
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());
      
    if (exportError) throw exportError;
    
    // Formatear datos según el formato solicitado
    switch (format) {
      case 'csv':
        return convertToCSV(exportData || []);
      case 'json':
        return JSON.stringify(exportData || [], null, 2);
      case 'excel':
        // En un entorno real, se utilizaría una biblioteca como xlsx
        // Aquí simplemente devolvemos CSV como alternativa
        return convertToCSV(exportData || []);
      default:
        return null;
    }
  };
  
  // Función auxiliar para convertir a CSV
  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    
    // Aplanar los datos para CSV
    const flattenedData = data.map(item => {
      const actions = Array.isArray(item.user_actions) ? item.user_actions : [];
      const platforms = actions.map((a: any) => a.platform).join(', ');
      
      return {
        id: item.id,
        created_at: item.created_at,
        clone_type: item.clone_type,
        message: item.body,
        response_time: item.response_time,
        user_feedback: item.user_feedback,
        platforms
      };
    });
    
    // Obtener encabezados
    const headers = Object.keys(flattenedData[0]);
    
    // Crear filas CSV
    const csvRows = [
      headers.join(','), // Encabezados
      ...flattenedData.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row];
          // Escapar comas y comillas en valores de texto
          return typeof value === 'string' 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        }).join(',')
      )
    ];
    
    return csvRows.join('\n');
  };
  
  // Funciones auxiliares para cálculo de rangos de fechas
  const getDateRange = (range: string) => {
    const endDate = new Date();
    let startDate = new Date();
    
    switch (range) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(endDate.getMonth() - 1); // Por defecto, último mes
    }
    
    return { startDate, endDate };
  };
  
  const getDateRangeWithPrevious = (range: string) => {
    const { startDate, endDate } = getDateRange(range);
    
    // Calcular período anterior del mismo tamaño
    const rangeInDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const previousEndDate = new Date(startDate);
    previousEndDate.setDate(previousEndDate.getDate() - 1);
    
    const previousStartDate = new Date(previousEndDate);
    previousStartDate.setDate(previousStartDate.getDate() - rangeInDays);
    
    return { startDate, endDate, previousStartDate, previousEndDate };
  };
  
  return {
    loading,
    error,
    clonePerformance,
    platformUsage,
    usagePredictions,
    periodComparisons,
    recommendations,
    loadAllMetrics,
    fetchClonePerformance,
    fetchPlatformUsage,
    generateUsagePredictions,
    generatePeriodComparisons,
    generateRecommendations,
    exportData
  };
};
