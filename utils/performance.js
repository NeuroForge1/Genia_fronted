// Optimizaciones de rendimiento para Next.js
import { useEffect } from 'react';

/**
 * Utilidad para optimizar el rendimiento de la aplicación
 * Incluye funciones para:
 * - Carga diferida de componentes
 * - Optimización de imágenes
 * - Prefetching inteligente
 * - Monitoreo de rendimiento
 */

/**
 * Hook para monitorear el rendimiento de la aplicación
 * @param {string} componentName - Nombre del componente a monitorear
 */
export function usePerformanceMonitoring(componentName) {
  useEffect(() => {
    // Registrar tiempo de montaje del componente
    const mountTime = performance.now();
    
    // Reportar métricas de Web Vitals cuando estén disponibles
    if (typeof window !== 'undefined' && 'web-vitals' in window) {
      import('web-vitals').then(({ getCLS, getFID, getLCP }) => {
        getCLS(metric => logMetric('CLS', metric, componentName));
        getFID(metric => logMetric('FID', metric, componentName));
        getLCP(metric => logMetric('LCP', metric, componentName));
      });
    }
    
    return () => {
      // Registrar tiempo total de vida del componente
      const unmountTime = performance.now();
      const lifetimeDuration = unmountTime - mountTime;
      
      // En producción, enviar estos datos a un servicio de análisis
      if (process.env.NODE_ENV === 'production' && process.env.ANALYTICS_ID) {
        console.log(`[Performance] ${componentName} lifetime: ${lifetimeDuration.toFixed(2)}ms`);
      }
    };
  }, [componentName]);
}

/**
 * Función para registrar métricas de rendimiento
 * @param {string} name - Nombre de la métrica
 * @param {Object} metric - Objeto de métrica
 * @param {string} componentName - Nombre del componente
 */
function logMetric(name, metric, componentName) {
  // En producción, enviar estos datos a un servicio de análisis
  if (process.env.NODE_ENV === 'production' && process.env.ANALYTICS_ID) {
    console.log(`[Performance] ${componentName} - ${name}: ${metric.value}`);
    
    // Aquí se enviaría a un servicio de análisis real
    // analytics.send({
    //   metric: name,
    //   value: metric.value,
    //   component: componentName
    // });
  }
}

/**
 * Configuración para optimizar la carga de imágenes
 */
export const imageOptimizationConfig = {
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  domains: ['genia.app', 'assets.genia.app', 'supabase.co'],
  path: '/_next/image',
  loader: 'default',
  formats: ['image/webp'],
};

/**
 * Función para precargar rutas críticas basadas en el comportamiento del usuario
 * @param {Array} routes - Rutas a precargar
 */
export function prefetchCriticalRoutes(routes = []) {
  if (typeof window === 'undefined') return;
  
  // Importar Next.js router
  import('next/router').then(({ default: router }) => {
    // Precargar rutas especificadas
    routes.forEach(route => {
      router.prefetch(route);
    });
    
    // Precargar rutas adicionales basadas en el comportamiento del usuario
    if ('connection' in navigator) {
      // Solo precargar rutas adicionales si la conexión es buena
      if (navigator.connection.effectiveType === '4g' && !navigator.connection.saveData) {
        const additionalRoutes = ['/dashboard', '/profile', '/settings'];
        additionalRoutes.forEach(route => {
          router.prefetch(route);
        });
      }
    }
  });
}

/**
 * Función para optimizar el rendimiento de la aplicación
 * @param {Object} config - Configuración de optimización
 */
export function optimizeAppPerformance(config = {}) {
  if (typeof window === 'undefined') return;
  
  // Configuración predeterminada
  const defaultConfig = {
    prefetchRoutes: true,
    lazyLoadImages: true,
    monitorPerformance: process.env.NODE_ENV === 'production',
    cacheAPIResponses: true
  };
  
  // Combinar configuración predeterminada con la proporcionada
  const finalConfig = { ...defaultConfig, ...config };
  
  // Precargar rutas críticas
  if (finalConfig.prefetchRoutes) {
    const criticalRoutes = ['/dashboard', '/login', '/register'];
    prefetchCriticalRoutes(criticalRoutes);
  }
  
  // Configurar lazy loading para imágenes
  if (finalConfig.lazyLoadImages) {
    if ('loading' in HTMLImageElement.prototype) {
      document.querySelectorAll('img').forEach(img => {
        if (!img.loading) {
          img.loading = 'lazy';
        }
      });
    } else {
      // Fallback para navegadores que no soportan lazy loading nativo
      import('lazysizes').then(() => {
        // lazysizes se inicializa automáticamente
      });
    }
  }
  
  // Configurar caché para respuestas de API
  if (finalConfig.cacheAPIResponses) {
    // Implementar estrategia de caché para fetch
    const originalFetch = window.fetch;
    window.fetch = async (url, options = {}) => {
      // Solo cachear peticiones GET
      if (options.method && options.method !== 'GET') {
        return originalFetch(url, options);
      }
      
      // Solo cachear URLs específicas
      if (typeof url === 'string' && url.includes('/api/')) {
        try {
          // Intentar obtener de caché primero
          const cache = await caches.open('genia-api-cache');
          const cachedResponse = await cache.match(url);
          
          if (cachedResponse) {
            // Verificar si la caché es reciente (menos de 5 minutos)
            const cachedAt = cachedResponse.headers.get('cached-at');
            if (cachedAt) {
              const cachedTime = new Date(cachedAt).getTime();
              const now = Date.now();
              const fiveMinutes = 5 * 60 * 1000;
              
              if (now - cachedTime < fiveMinutes) {
                return cachedResponse;
              }
            }
          }
          
          // Si no hay caché o está obsoleta, hacer la petición
          const response = await originalFetch(url, options);
          
          // Clonar la respuesta para poder modificarla
          const responseToCache = response.clone();
          
          // Añadir timestamp a la respuesta
          const headers = new Headers(responseToCache.headers);
          headers.append('cached-at', new Date().toISOString());
          
          // Crear nueva respuesta con headers modificados
          const modifiedResponse = new Response(await responseToCache.blob(), {
            status: responseToCache.status,
            statusText: responseToCache.statusText,
            headers: headers
          });
          
          // Guardar en caché
          cache.put(url, modifiedResponse);
          
          return response;
        } catch (error) {
          console.error('Error en caché de API:', error);
          return originalFetch(url, options);
        }
      }
      
      return originalFetch(url, options);
    };
  }
  
  // Monitorear rendimiento
  if (finalConfig.monitorPerformance) {
    // Registrar tiempo de carga inicial
    window.addEventListener('load', () => {
      setTimeout(() => {
        const timing = performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        
        console.log(`[Performance] Página cargada en ${loadTime}ms`);
        
        // Aquí se enviaría a un servicio de análisis real
        if (process.env.ANALYTICS_ID) {
          // analytics.send({
          //   metric: 'page_load',
          //   value: loadTime,
          //   page: window.location.pathname
          // });
        }
      }, 0);
    });
  }
}

export default {
  usePerformanceMonitoring,
  imageOptimizationConfig,
  prefetchCriticalRoutes,
  optimizeAppPerformance
};
