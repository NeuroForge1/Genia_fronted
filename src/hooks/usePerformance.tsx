import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

// Tipos para monitoreo de rendimiento
export type PerformanceMetric = {
  component: string;
  renderTime: number;
  timestamp: Date;
};

export type ResourceUsage = {
  memoryUsage: number;
  cpuUsage: number;
  networkRequests: number;
  timestamp: Date;
};

export type LoadingTime = {
  page: string;
  timeToFirstByte: number;
  timeToInteractive: number;
  fullyLoaded: number;
  timestamp: Date;
};

// Hook principal para optimización de rendimiento
export const usePerformance = () => {
  const { user } = useAuth();
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [resourceUsage, setResourceUsage] = useState<ResourceUsage[]>([]);
  const [loadingTimes, setLoadingTimes] = useState<LoadingTime[]>([]);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  
  // Iniciar monitoreo de rendimiento
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    
    // Limpiar métricas anteriores
    setPerformanceMetrics([]);
    setResourceUsage([]);
    setLoadingTimes([]);
    
    // Configurar monitoreo de recursos
    const resourceMonitoringInterval = setInterval(() => {
      // En un entorno real, esto utilizaría APIs del navegador para obtener datos reales
      // Aquí simulamos la recopilación de datos de uso de recursos
      const newResourceUsage: ResourceUsage = {
        memoryUsage: Math.random() * 500 + 200, // Simulación de uso de memoria (MB)
        cpuUsage: Math.random() * 30 + 5, // Simulación de uso de CPU (%)
        networkRequests: Math.floor(Math.random() * 10), // Simulación de solicitudes de red
        timestamp: new Date()
      };
      
      setResourceUsage(prev => [...prev, newResourceUsage]);
    }, 5000); // Monitorear cada 5 segundos
    
    // Guardar referencia al intervalo para limpieza
    return () => {
      clearInterval(resourceMonitoringInterval);
      setIsMonitoring(false);
    };
  }, []);
  
  // Detener monitoreo de rendimiento
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);
  
  // Registrar tiempo de renderizado de un componente
  const trackComponentRender = useCallback((component: string, renderTime: number) => {
    if (!isMonitoring) return;
    
    const newMetric: PerformanceMetric = {
      component,
      renderTime,
      timestamp: new Date()
    };
    
    setPerformanceMetrics(prev => [...prev, newMetric]);
  }, [isMonitoring]);
  
  // Registrar tiempo de carga de una página
  const trackPageLoad = useCallback((page: string, timeToFirstByte: number, timeToInteractive: number, fullyLoaded: number) => {
    if (!isMonitoring) return;
    
    const newLoadingTime: LoadingTime = {
      page,
      timeToFirstByte,
      timeToInteractive,
      fullyLoaded,
      timestamp: new Date()
    };
    
    setLoadingTimes(prev => [...prev, newLoadingTime]);
  }, [isMonitoring]);
  
  // Obtener componentes con peor rendimiento
  const getSlowComponents = useCallback(() => {
    if (performanceMetrics.length === 0) return [];
    
    // Agrupar métricas por componente
    const componentGroups = performanceMetrics.reduce((groups, metric) => {
      if (!groups[metric.component]) {
        groups[metric.component] = [];
      }
      groups[metric.component].push(metric);
      return groups;
    }, {} as Record<string, PerformanceMetric[]>);
    
    // Calcular tiempo promedio de renderizado por componente
    const averageTimes = Object.entries(componentGroups).map(([component, metrics]) => {
      const totalTime = metrics.reduce((sum, metric) => sum + metric.renderTime, 0);
      const averageTime = totalTime / metrics.length;
      return { component, averageTime };
    });
    
    // Ordenar por tiempo promedio (de mayor a menor)
    return averageTimes.sort((a, b) => b.averageTime - a.averageTime);
  }, [performanceMetrics]);
  
  // Obtener recomendaciones de optimización
  const getOptimizationRecommendations = useCallback(() => {
    const recommendations: string[] = [];
    
    // Recomendaciones basadas en componentes lentos
    const slowComponents = getSlowComponents();
    if (slowComponents.length > 0) {
      const worstComponent = slowComponents[0];
      if (worstComponent.averageTime > 100) {
        recommendations.push(`Optimizar el componente "${worstComponent.component}" que tiene un tiempo de renderizado promedio de ${worstComponent.averageTime.toFixed(2)}ms.`);
      }
    }
    
    // Recomendaciones basadas en uso de recursos
    if (resourceUsage.length > 0) {
      const latestUsage = resourceUsage[resourceUsage.length - 1];
      
      if (latestUsage.memoryUsage > 500) {
        recommendations.push(`Reducir el uso de memoria (actualmente ${latestUsage.memoryUsage.toFixed(2)}MB). Considerar implementar virtualización para listas largas.`);
      }
      
      if (latestUsage.cpuUsage > 25) {
        recommendations.push(`Optimizar operaciones intensivas de CPU (actualmente ${latestUsage.cpuUsage.toFixed(2)}%). Considerar mover cálculos complejos a web workers.`);
      }
      
      if (latestUsage.networkRequests > 5) {
        recommendations.push(`Reducir el número de solicitudes de red (actualmente ${latestUsage.networkRequests}). Considerar implementar agrupación de solicitudes o caché.`);
      }
    }
    
    // Recomendaciones basadas en tiempos de carga
    if (loadingTimes.length > 0) {
      const averageTTI = loadingTimes.reduce((sum, time) => sum + time.timeToInteractive, 0) / loadingTimes.length;
      
      if (averageTTI > 3000) {
        recommendations.push(`Mejorar el tiempo hasta interactividad (actualmente ${averageTTI.toFixed(2)}ms). Considerar implementar carga diferida de componentes.`);
      }
    }
    
    // Recomendaciones generales si no hay suficientes datos
    if (recommendations.length === 0) {
      recommendations.push("Implementar code splitting para reducir el tamaño del bundle inicial.");
      recommendations.push("Utilizar React.memo para componentes que no cambian frecuentemente.");
      recommendations.push("Optimizar imágenes y recursos estáticos.");
    }
    
    return recommendations;
  }, [getSlowComponents, resourceUsage, loadingTimes]);
  
  // Aplicar optimizaciones automáticas
  const applyAutomaticOptimizations = useCallback(() => {
    // En una implementación real, esto podría ajustar configuraciones
    // o aplicar técnicas de optimización automáticas
    
    // Aquí simulamos la aplicación de optimizaciones
    console.log("Aplicando optimizaciones automáticas...");
    
    // Simular mejora en métricas
    setTimeout(() => {
      // Simular reducción en uso de recursos
      if (resourceUsage.length > 0) {
        const latestUsage = resourceUsage[resourceUsage.length - 1];
        const optimizedUsage: ResourceUsage = {
          memoryUsage: latestUsage.memoryUsage * 0.8, // 20% de reducción
          cpuUsage: latestUsage.cpuUsage * 0.7, // 30% de reducción
          networkRequests: Math.max(1, Math.floor(latestUsage.networkRequests * 0.6)), // 40% de reducción
          timestamp: new Date()
        };
        
        setResourceUsage(prev => [...prev, optimizedUsage]);
      }
      
      console.log("Optimizaciones aplicadas con éxito.");
    }, 2000);
    
    return true;
  }, [resourceUsage]);
  
  // Generar informe de rendimiento
  const generatePerformanceReport = useCallback(() => {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        averageRenderTime: performanceMetrics.length > 0
          ? performanceMetrics.reduce((sum, metric) => sum + metric.renderTime, 0) / performanceMetrics.length
          : 0,
        slowestComponent: getSlowComponents()[0]?.component || 'N/A',
        averageMemoryUsage: resourceUsage.length > 0
          ? resourceUsage.reduce((sum, usage) => sum + usage.memoryUsage, 0) / resourceUsage.length
          : 0,
        averageCpuUsage: resourceUsage.length > 0
          ? resourceUsage.reduce((sum, usage) => sum + usage.cpuUsage, 0) / resourceUsage.length
          : 0,
        averageLoadTime: loadingTimes.length > 0
          ? loadingTimes.reduce((sum, time) => sum + time.fullyLoaded, 0) / loadingTimes.length
          : 0
      },
      recommendations: getOptimizationRecommendations(),
      detailedMetrics: {
        performanceMetrics,
        resourceUsage,
        loadingTimes
      }
    };
    
    return report;
  }, [performanceMetrics, resourceUsage, loadingTimes, getSlowComponents, getOptimizationRecommendations]);
  
  // Componente de orden superior para medir rendimiento
  const withPerformanceTracking = useCallback((Component: React.ComponentType<any>, componentName: string) => {
    return (props: any) => {
      const startTime = performance.now();
      
      useEffect(() => {
        const renderTime = performance.now() - startTime;
        trackComponentRender(componentName, renderTime);
      }, []);
      
      return <Component {...props} />;
    };
  }, [trackComponentRender]);
  
  return {
    isMonitoring,
    performanceMetrics,
    resourceUsage,
    loadingTimes,
    startMonitoring,
    stopMonitoring,
    trackComponentRender,
    trackPageLoad,
    getSlowComponents,
    getOptimizationRecommendations,
    applyAutomaticOptimizations,
    generatePerformanceReport,
    withPerformanceTracking
  };
};
