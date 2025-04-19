# Configuración de Límites y Cuotas para Conectores de GENIA

Este documento describe los límites y cuotas implementados para los conectores de redes sociales y email marketing en GENIA.

## Propósito de los Límites

Los límites y cuotas tienen varios propósitos:

1. **Prevenir abusos**: Evitar el uso excesivo que podría afectar al rendimiento del sistema
2. **Cumplir con límites de APIs externas**: Respetar los límites impuestos por las plataformas de terceros
3. **Diferenciar planes de suscripción**: Ofrecer diferentes niveles de uso según el plan contratado
4. **Proteger a los usuarios**: Evitar costos inesperados o acciones no deseadas

## Límites por Plan de Suscripción

### Plan Free

| Tipo de Acción | Límite Diario | Límite Mensual |
|----------------|---------------|----------------|
| Publicaciones en redes sociales | 3 | 30 |
| Campañas de email | 1 | 5 |
| Suscriptores gestionados | N/A | 500 |
| Consultas de métricas | 10 | 100 |

### Plan Basic

| Tipo de Acción | Límite Diario | Límite Mensual |
|----------------|---------------|----------------|
| Publicaciones en redes sociales | 10 | 200 |
| Campañas de email | 3 | 20 |
| Suscriptores gestionados | N/A | 2,000 |
| Consultas de métricas | 50 | 500 |

### Plan Pro

| Tipo de Acción | Límite Diario | Límite Mensual |
|----------------|---------------|----------------|
| Publicaciones en redes sociales | 30 | 600 |
| Campañas de email | 10 | 50 |
| Suscriptores gestionados | N/A | 10,000 |
| Consultas de métricas | 100 | 1,500 |

### Plan Enterprise

| Tipo de Acción | Límite Diario | Límite Mensual |
|----------------|---------------|----------------|
| Publicaciones en redes sociales | 100 | 2,000 |
| Campañas de email | 30 | 150 |
| Suscriptores gestionados | N/A | 50,000+ |
| Consultas de métricas | Ilimitado | Ilimitado |

## Implementación Técnica

Los límites se implementan a través de un sistema de cuotas en la base de datos:

```typescript
// Interfaz para la configuración de límites
interface ConnectorLimits {
  socialPostsDaily: number;
  socialPostsMonthly: number;
  emailCampaignsDaily: number;
  emailCampaignsMonthly: number;
  emailSubscribersTotal: number;
  metricsQueriesDaily: number;
  metricsQueriesMonthly: number;
}

// Configuración de límites por plan
const LIMITS_BY_PLAN: Record<SubscriptionPlan, ConnectorLimits> = {
  free: {
    socialPostsDaily: 3,
    socialPostsMonthly: 30,
    emailCampaignsDaily: 1,
    emailCampaignsMonthly: 5,
    emailSubscribersTotal: 500,
    metricsQueriesDaily: 10,
    metricsQueriesMonthly: 100,
  },
  basic: {
    socialPostsDaily: 10,
    socialPostsMonthly: 200,
    emailCampaignsDaily: 3,
    emailCampaignsMonthly: 20,
    emailSubscribersTotal: 2000,
    metricsQueriesDaily: 50,
    metricsQueriesMonthly: 500,
  },
  pro: {
    socialPostsDaily: 30,
    socialPostsMonthly: 600,
    emailCampaignsDaily: 10,
    emailCampaignsMonthly: 50,
    emailSubscribersTotal: 10000,
    metricsQueriesDaily: 100,
    metricsQueriesMonthly: 1500,
  },
  enterprise: {
    socialPostsDaily: 100,
    socialPostsMonthly: 2000,
    emailCampaignsDaily: 30,
    emailCampaignsMonthly: 150,
    emailSubscribersTotal: 50000,
    metricsQueriesDaily: Infinity,
    metricsQueriesMonthly: Infinity,
  },
};
```

## Verificación de Límites

Antes de ejecutar cualquier acción, el sistema verifica si el usuario ha alcanzado sus límites:

```typescript
// Verificar si el usuario puede realizar una acción
async function canPerformAction(
  userId: string,
  actionType: 'social_post' | 'email_campaign' | 'metrics_query'
): Promise<boolean> {
  // Obtener el plan del usuario
  const { data: profile } = await supabaseClient
    .from('profiles')
    .select('plan')
    .eq('user_id', userId)
    .single();
  
  if (!profile) return false;
  
  const plan = profile.plan as SubscriptionPlan;
  const limits = LIMITS_BY_PLAN[plan];
  
  // Obtener el uso actual
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  
  let dailyCount = 0;
  let monthlyCount = 0;
  
  if (actionType === 'social_post') {
    // Contar publicaciones diarias
    const { count: daily } = await supabaseClient
      .from('executed_tasks')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('task_type', 'social_post')
      .gte('created_at', startOfDay);
    
    // Contar publicaciones mensuales
    const { count: monthly } = await supabaseClient
      .from('executed_tasks')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('task_type', 'social_post')
      .gte('created_at', startOfMonth);
    
    dailyCount = daily || 0;
    monthlyCount = monthly || 0;
    
    return dailyCount < limits.socialPostsDaily && monthlyCount < limits.socialPostsMonthly;
  }
  
  // Lógica similar para otros tipos de acciones
  // ...
  
  return false;
}
```

## Notificación a Usuarios

Cuando un usuario se acerca a sus límites o los alcanza, el sistema le notifica:

1. **Advertencia al 80%**: Notificación cuando el usuario alcanza el 80% de su límite
2. **Notificación al 100%**: Mensaje cuando se alcanza el límite
3. **Sugerencia de actualización**: Opción para actualizar a un plan superior

## Monitoreo y Ajuste

El sistema de límites incluye herramientas para monitorear y ajustar los límites:

1. **Dashboard de uso**: Los administradores pueden ver el uso por usuario y plan
2. **Ajustes temporales**: Posibilidad de aumentar temporalmente los límites para usuarios específicos
3. **Análisis de tendencias**: Monitoreo de patrones de uso para ajustar los límites en futuras versiones

## Excepciones

En ciertos casos, se pueden aplicar excepciones a los límites:

1. **Período de prueba**: Durante los primeros 14 días, los nuevos usuarios tienen límites aumentados
2. **Promociones especiales**: Campañas temporales con límites aumentados
3. **Usuarios VIP**: Clientes estratégicos pueden recibir límites personalizados

## Consideraciones Futuras

Para futuras versiones, se considerarán estas mejoras:

1. **Límites dinámicos**: Ajuste automático basado en patrones de uso
2. **Compra de cuotas adicionales**: Permitir a los usuarios comprar cuotas adicionales sin cambiar de plan
3. **Transferencia de cuotas no utilizadas**: Permitir que las cuotas no utilizadas se transfieran al siguiente período
4. **Límites por plataforma**: Establecer límites específicos para cada plataforma de redes sociales o email
