# DOCUMENTACIÓN DE DESARROLLO - GENIA

Este documento proporciona información detallada sobre el desarrollo del proyecto Genia, incluyendo su arquitectura, componentes principales, y guías para desarrolladores.

## 1. Arquitectura del Proyecto

### 1.1 Estructura de Directorios

```
Genia_fronted/
├── src/
│   ├── app/                    # Páginas y rutas de Next.js
│   ├── components/             # Componentes React
│   │   ├── auth/               # Componentes de autenticación
│   │   └── ui/                 # Componentes de interfaz de usuario
│   ├── hooks/                  # Hooks personalizados
│   │   ├── theme/              # Hooks relacionados con temas
│   │   └── ...                 # Otros hooks funcionales
│   └── lib/                    # Utilidades y configuraciones
├── public/                     # Archivos estáticos
└── ...                         # Archivos de configuración
```

### 1.2 Tecnologías Principales

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Autenticación, Almacenamiento)
- **Pagos**: Stripe
- **Mensajería**: Twilio (WhatsApp)
- **Integraciones**: APIs de múltiples plataformas (Facebook, Instagram, Gmail, etc.)

### 1.3 Flujo de Datos

1. **Autenticación**: Gestionada por Supabase con políticas RLS para seguridad
2. **Estado de la Aplicación**: Gestionado por hooks de React contextualizados
3. **Persistencia**: Datos almacenados en Supabase con sincronización local
4. **Integraciones**: Conexión con APIs externas a través de hooks especializados

## 2. Componentes Principales

### 2.1 Sistema de Autenticación

El sistema de autenticación utiliza Supabase Auth y está implementado en:

- `src/hooks/useAuth.tsx`: Hook principal para gestionar la autenticación
- `src/components/auth/LoginForm.tsx`: Formulario de inicio de sesión
- `src/app/register/page.tsx`: Página de registro
- `src/app/login/page.tsx`: Página de inicio de sesión
- `src/middleware.ts`: Middleware para protección de rutas

### 2.2 Sistema de Suscripciones

El sistema de suscripciones utiliza Stripe y está implementado en:

- `src/lib/stripe.ts`: Configuración de Stripe
- `src/components/subscription/SubscriptionPlans.tsx`: Componente de planes de suscripción
- `src/app/api/create-checkout-session/route.ts`: API para crear sesiones de pago
- `src/app/api/webhook/route.ts`: Webhook para procesar eventos de Stripe

### 2.3 Sistema de Temas y Accesibilidad

El sistema de temas permite personalizar la apariencia de la aplicación:

- `src/hooks/theme/useTheme.tsx`: Hook para gestionar temas y preferencias
- `src/components/ui/ThemeSettings.tsx`: Componente para configurar temas
- `src/components/ui/AccessibilityPanel.tsx`: Panel de opciones de accesibilidad

### 2.4 Sistema de Análisis y Métricas

El sistema de análisis proporciona métricas y visualizaciones:

- `src/hooks/useAnalytics.tsx`: Hook básico para análisis
- `src/hooks/useAdvancedAnalytics.tsx`: Hook para análisis predictivo
- `src/components/ui/Analytics.tsx`: Componente de análisis básico
- `src/components/ui/AdvancedAnalytics.tsx`: Componente de análisis avanzado
- `src/components/ui/BusinessIntelligence.tsx`: Componente para análisis empresarial

### 2.5 Sistema de Rendimiento

El sistema de rendimiento optimiza la aplicación:

- `src/hooks/usePerformance.tsx`: Hook para monitoreo y optimización
- `src/components/ui/PerformanceOptimizer.tsx`: Interfaz para gestionar rendimiento

### 2.6 Sistema de Seguridad

El sistema de seguridad protege la aplicación:

- `src/hooks/useSecurity.tsx`: Hook para gestión de seguridad
- `src/components/ui/SecurityCenter.tsx`: Centro de seguridad

### 2.7 Sistema de Integraciones

El sistema de integraciones conecta con plataformas externas:

- `src/hooks/useIntegrations.tsx`: Hook para gestionar integraciones
- `src/components/ui/IntegrationHub.tsx`: Centro de integraciones

### 2.8 Experiencia Móvil

Componentes optimizados para dispositivos móviles:

- `src/components/ui/MobileOptimizedView.tsx`: Vista optimizada para móviles
- `src/components/ui/ResponsiveNotifications.tsx`: Notificaciones adaptables

## 3. Hooks Personalizados

### 3.1 useAuth

```typescript
// Gestiona la autenticación de usuarios
const { user, signIn, signUp, signOut, loading, error } = useAuth();
```

### 3.2 useTheme

```typescript
// Gestiona temas y preferencias visuales
const { 
  mode, setMode, color, setColor, fontSize, setFontSize,
  animationLevel, setAnimationLevel, highContrast, toggleHighContrast,
  isDarkMode, getThemeClass, getColorClass, resetToDefaults
} = useTheme();
```

### 3.3 useAnalytics

```typescript
// Proporciona análisis y métricas
const {
  clonePerformance, platformUsage, usagePredictions,
  periodComparisons, recommendations, loadAllMetrics,
  fetchClonePerformance, fetchPlatformUsage, exportData
} = useAnalytics();
```

### 3.4 usePerformance

```typescript
// Monitorea y optimiza el rendimiento
const {
  performanceMetrics, slowComponents, resourceUsage,
  optimizationRecommendations, applyOptimizations,
  startMonitoring, stopMonitoring, generateReport
} = usePerformance();
```

### 3.5 useSecurity

```typescript
// Gestiona la seguridad de la aplicación
const {
  securityThreats, securitySettings, securityAudits,
  securityScore, updateSecuritySetting, resolveSecurityThreat,
  generateSecurityReport, getSecurityRecommendations
} = useSecurity();
```

### 3.6 useIntegrations

```typescript
// Gestiona integraciones con plataformas externas
const {
  integrations, recentActions, connectIntegration,
  disconnectIntegration, updateIntegrationSettings,
  executeIntegrationAction, getIntegrationStats
} = useIntegrations();
```

## 4. Políticas de Seguridad (RLS)

### 4.1 Tabla 'users'

```sql
-- Política de lectura: Los usuarios solo pueden ver su propio perfil
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Política de actualización: Los usuarios solo pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);
```

### 4.2 Tabla 'subscriptions'

```sql
-- Política de lectura: Los usuarios solo pueden ver sus propias suscripciones
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);
```

### 4.3 Tabla 'user_actions'

```sql
-- Política de lectura: Los usuarios solo pueden ver sus propias acciones
CREATE POLICY "Users can view own actions" ON public.user_actions
  FOR SELECT USING (auth.uid() = user_id);

-- Política de inserción: Los usuarios solo pueden insertar sus propias acciones
CREATE POLICY "Users can insert own actions" ON public.user_actions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 4.4 Tabla 'clones_history'

```sql
-- Política de lectura: Los usuarios solo pueden ver su propio historial de clones
CREATE POLICY "Users can view own clones history" ON public.clones_history
  FOR SELECT USING (auth.uid() = user_id);

-- Política de inserción: Los usuarios solo pueden insertar en su propio historial
CREATE POLICY "Users can insert own clones history" ON public.clones_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## 5. Guías de Desarrollo

### 5.1 Configuración del Entorno

1. Clonar el repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd Genia_fronted
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   ```
   # Crear archivo .env.local con las siguientes variables
   NEXT_PUBLIC_SUPABASE_URL=<url-de-supabase>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<clave-anónima-de-supabase>
   STRIPE_SECRET_KEY=<clave-secreta-de-stripe>
   STRIPE_WEBHOOK_SECRET=<secreto-de-webhook-de-stripe>
   TWILIO_ACCOUNT_SID=<sid-de-cuenta-de-twilio>
   TWILIO_AUTH_TOKEN=<token-de-autenticación-de-twilio>
   TWILIO_PHONE_NUMBER=<número-de-teléfono-de-twilio>
   ```

4. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

### 5.2 Convenciones de Código

- **Nomenclatura**: Utilizar camelCase para variables y funciones, PascalCase para componentes y tipos
- **Componentes**: Crear componentes funcionales con TypeScript
- **Estilos**: Utilizar Tailwind CSS para estilos
- **Estado**: Preferir hooks personalizados para la gestión de estado
- **Tipos**: Definir interfaces y tipos para todas las props y estados

### 5.3 Flujo de Trabajo Git

1. Crear una rama para cada característica:
   ```bash
   git checkout -b feature/nombre-de-caracteristica
   ```

2. Realizar commits frecuentes con mensajes descriptivos:
   ```bash
   git commit -m "feat: añadir componente de análisis avanzado"
   ```

3. Enviar cambios al repositorio remoto:
   ```bash
   git push origin feature/nombre-de-caracteristica
   ```

4. Crear Pull Request para revisión de código

### 5.4 Pruebas

- **Pruebas Unitarias**: Utilizar Jest para probar funciones y hooks
- **Pruebas de Componentes**: Utilizar React Testing Library para probar componentes
- **Pruebas E2E**: Utilizar Cypress para pruebas de extremo a extremo

## 6. Despliegue

### 6.1 Preparación para Producción

1. Construir la aplicación:
   ```bash
   npm run build
   ```

2. Verificar la construcción localmente:
   ```bash
   npm run start
   ```

### 6.2 Despliegue en Vercel

1. Conectar el repositorio a Vercel
2. Configurar variables de entorno en Vercel
3. Desplegar automáticamente desde la rama principal

### 6.3 Configuración de Webhooks

1. Configurar webhook de Stripe en Vercel
2. Configurar webhook de Twilio para WhatsApp

## 7. Recursos Adicionales

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Supabase](https://supabase.io/docs)
- [Documentación de Stripe](https://stripe.com/docs)
- [Documentación de Twilio](https://www.twilio.com/docs)
- [Documentación de Tailwind CSS](https://tailwindcss.com/docs)

## 8. Solución de Problemas Comunes

### 8.1 Problemas de Autenticación

- **Problema**: Error "JWT expired"
  **Solución**: Asegurarse de que el token se actualiza correctamente en useAuth.tsx

- **Problema**: Políticas RLS no funcionan correctamente
  **Solución**: Verificar que las políticas están correctamente configuradas en Supabase

### 8.2 Problemas de Rendimiento

- **Problema**: Renderizados innecesarios
  **Solución**: Utilizar React.memo, useMemo y useCallback para optimizar

- **Problema**: Carga lenta de datos
  **Solución**: Implementar estrategias de caché y lazy loading

### 8.3 Problemas de Integraciones

- **Problema**: Error de conexión con APIs externas
  **Solución**: Verificar tokens de acceso y permisos

- **Problema**: Límites de tasa excedidos
  **Solución**: Implementar estrategias de limitación de tasa y cola de solicitudes
