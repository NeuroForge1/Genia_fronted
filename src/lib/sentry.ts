// Configuración de Sentry para monitoreo de errores en GENIA
import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT || 'development';

export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not found. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.2 : 1.0,
    replaysSessionSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      new Sentry.Replay({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Ajustar el nivel de registro según el entorno
    beforeSend(event) {
      // Ignorar errores específicos que no queremos rastrear
      if (event.exception && event.exception.values) {
        const exceptionValue = event.exception.values[0]?.value || '';
        if (
          exceptionValue.includes('ResizeObserver loop limit exceeded') ||
          exceptionValue.includes('Network request failed')
        ) {
          return null;
        }
      }
      return event;
    },
  });

  // Configurar etiquetas globales
  Sentry.configureScope((scope) => {
    scope.setTag('app', 'genia-frontend');
  });

  console.log(`Sentry initialized in ${ENVIRONMENT} environment`);
}

// Función para rastrear errores en los conectores
export function trackConnectorError(
  connectorType: 'social' | 'email',
  platform: string,
  action: string,
  error: Error,
  userId?: string
) {
  Sentry.withScope((scope) => {
    scope.setTag('connector_type', connectorType);
    scope.setTag('platform', platform);
    scope.setTag('action', action);
    
    if (userId) {
      scope.setUser({ id: userId });
    }
    
    scope.setExtra('error_details', {
      message: error.message,
      stack: error.stack,
    });
    
    Sentry.captureException(error);
  });
}

// Función para rastrear eventos de conectores
export function trackConnectorEvent(
  connectorType: 'social' | 'email',
  platform: string,
  action: string,
  result: 'success' | 'failure',
  details?: Record<string, any>,
  userId?: string
) {
  Sentry.addBreadcrumb({
    category: 'connector',
    message: `${connectorType}/${platform}/${action}: ${result}`,
    level: result === 'success' ? 'info' : 'error',
    data: details,
  });
  
  if (userId) {
    Sentry.setUser({ id: userId });
  }
}

// Función para rastrear rendimiento de conectores
export function trackConnectorPerformance(
  connectorType: 'social' | 'email',
  platform: string,
  action: string,
  durationMs: number,
  userId?: string
) {
  Sentry.withScope((scope) => {
    scope.setTag('connector_type', connectorType);
    scope.setTag('platform', platform);
    scope.setTag('action', action);
    
    if (userId) {
      scope.setUser({ id: userId });
    }
    
    Sentry.captureMessage(
      `Connector Performance: ${connectorType}/${platform}/${action} - ${durationMs}ms`,
      durationMs > 5000 ? 'warning' : 'info'
    );
  });
}

export default {
  initSentry,
  trackConnectorError,
  trackConnectorEvent,
  trackConnectorPerformance,
};
