# Documentación del Desarrollo del Proyecto GENIA

## ¿Qué es GENIA?

GENIA es una plataforma SaaS (Software as a Service) de inteligencia artificial ejecutora diseñada específicamente para negocios y emprendedores. A diferencia de los chatbots tradicionales que solo proporcionan respuestas textuales, GENIA es un sistema completo que:

1. **Analiza las intenciones del usuario** a través de su Módulo Central de Procesos (MCP)
2. **Delega tareas** a clones especializados según el tipo de solicitud
3. **Ejecuta acciones reales** mediante integraciones con herramientas externas
4. **Automatiza procesos completos** de marketing, ventas, estrategia y productividad

En esencia, GENIA funciona como un equipo virtual de especialistas que no solo responden preguntas, sino que realizan tareas concretas para impulsar el crecimiento de negocios.

## ¿Para qué sirve GENIA?

GENIA está diseñada para resolver los siguientes problemas:

1. **Escasez de recursos humanos** en pequeñas y medianas empresas
2. **Falta de conocimientos especializados** en áreas críticas como marketing digital
3. **Necesidad de automatización** de tareas repetitivas pero complejas
4. **Dificultad para ejecutar estrategias** de crecimiento por limitaciones de tiempo o conocimiento

La plataforma permite a los usuarios:

- **Crear contenido** para blogs, redes sociales y email marketing
- **Diseñar y ejecutar campañas publicitarias** en diferentes plataformas
- **Analizar el rendimiento del negocio** y recibir recomendaciones estratégicas
- **Optimizar embudos de conversión** para aumentar ventas
- **Gestionar comunicaciones** a través de múltiples canales
- **Organizar agendas y priorizar tareas** para mejorar la productividad

## ¿Cómo debería funcionar GENIA cuando esté terminada?

El flujo de funcionamiento ideal de GENIA es:

1. **Interacción del usuario**: El usuario interactúa con GENIA a través de:
   - Interfaz web (texto)
   - Comandos por voz
   - Mensajes de WhatsApp
   - Integraciones con otras plataformas

2. **Procesamiento por el MCP**: El Módulo Central de Procesos:
   - Analiza la intención del usuario mediante NLP avanzado
   - Identifica entidades y contexto relevantes
   - Determina qué clon especializado debe manejar la solicitud
   - Registra la solicitud en la base de datos

3. **Delegación a clones especializados**: El clon seleccionado:
   - Recibe la solicitud con el contexto necesario
   - Procesa la información según su especialidad
   - Genera un plan de acción para ejecutar la tarea

4. **Ejecución de tareas reales**: GENIA ejecuta acciones como:
   - Publicar contenido en redes sociales
   - Configurar campañas publicitarias
   - Enviar emails o mensajes
   - Analizar datos de rendimiento
   - Crear informes o documentos

5. **Retroalimentación y aprendizaje**: El sistema:
   - Informa al usuario sobre el resultado de las acciones
   - Aprende de las preferencias y patrones del usuario
   - Mejora continuamente su rendimiento

6. **Monitoreo y optimización**: GENIA:
   - Monitorea el rendimiento de las acciones ejecutadas
   - Sugiere optimizaciones basadas en resultados
   - Automatiza ajustes para mejorar el rendimiento

## Arquitectura del Sistema

### Componentes Principales

1. **Frontend**:
   - Framework: Next.js 14 con React y TypeScript
   - Estilos: Tailwind CSS
   - Despliegue: Vercel
   - Estructura de Directorios:
     - `/src/app`: Rutas y páginas de Next.js
     - `/src/components`: Componentes reutilizables
     - `/src/hooks`: Hooks personalizados de React
     - `/src/lib`: Utilidades y configuraciones
     - `/src/lib/mcp`: Módulo Central de Procesos
     - `/src/lib/connectors`: Conectores para plataformas externas
     - `/tests`: Pruebas de integración

2. **Backend**:
   - Framework: FastAPI (Python)
   - Despliegue: Render
   - Base de Datos: Supabase (PostgreSQL)

3. **Integraciones**:
   - Autenticación: Supabase Auth
   - Pagos: Stripe
   - Mensajería: Twilio (WhatsApp)
   - IA: OpenAI
   - Herramientas externas: APIs de redes sociales, email marketing, etc.

### Flujo de Datos

1. Las solicitudes del usuario llegan a través de la interfaz web, comandos por voz o WhatsApp
2. El frontend envía estas solicitudes al endpoint del MCP (`/api/mcp`)
3. El MCP analiza la intención y determina el clon adecuado
4. La solicitud se procesa y se ejecutan acciones a través de integraciones
5. Los resultados se almacenan en Supabase y se devuelven al usuario

## Estado Actual del Proyecto: Lo que se ha hecho

### 1. Módulo Central de Procesos (MCP) - COMPLETADO
- ✅ Implementación del cerebro central en `/src/lib/mcp/index.ts`
- ✅ Funciones para análisis de intenciones
- ✅ Sistema de delegación a clones especializados
- ✅ Endpoint API centralizado en `/src/app/api/mcp/route.ts`
- ✅ Integración con el hook `useClone` para comunicación con el frontend

### 2. Autenticación con Supabase - COMPLETADO
- ✅ Configuración del cliente de Supabase
- ✅ Implementación del hook `useAuth.tsx`
- ✅ Componentes de registro e inicio de sesión
- ✅ Middleware para protección de rutas
- ✅ Gestión de perfiles de usuario

### 3. Sistema de Suscripciones con Stripe - COMPLETADO
- ✅ Configuración de Stripe en `/src/lib/stripe.ts`
- ✅ Definición de planes de suscripción
- ✅ Implementación de checkout de Stripe
- ✅ Webhook para procesar eventos de Stripe
- ✅ Actualización de suscripciones en Supabase

### 4. Integración de WhatsApp vía Twilio - COMPLETADO
- ✅ Configuración de Twilio en `/src/lib/twilio.ts`
- ✅ Funciones para envío y recepción de mensajes
- ✅ Webhook para procesar mensajes entrantes
- ✅ Integración con el MCP para procesamiento de solicitudes

### 5. Comandos por Voz - COMPLETADO
- ✅ Hook personalizado `useVoiceCommands.tsx`
- ✅ Componente de interfaz `VoiceCommandInterface.tsx`
- ✅ Página dedicada `/voice-commands/page.tsx`
- ✅ Widget para el dashboard `DashboardVoiceWidget.tsx`
- ✅ Integración con Web Speech API para reconocimiento y síntesis

### 6. Clones Especializados - COMPLETADO
- ✅ Definición de prompts optimizados en `/src/lib/prompts.ts`
- ✅ Implementación de 6 clones especializados:
  - Clon Content: Creación de contenido
  - Clon Ads: Publicidad digital
  - Clon CEO: Estrategia empresarial
  - Clon Voice: Comunicación verbal
  - Clon Funnel: Embudos de conversión
  - Clon Calendar: Productividad

### 7. Pruebas de Integración - COMPLETADO
- ✅ Configuración de Playwright para pruebas
- ✅ Pruebas del MCP y su integración con los clones
- ✅ Pruebas de comandos por voz
- ✅ Pruebas de integración con Stripe y Supabase

### 8. Configuración de Despliegue - COMPLETADO
- ✅ Archivo `vercel.json` para configuración de Vercel
- ✅ Configuración de GitHub Actions en `.github/workflows/deploy.yml`
- ✅ Script de despliegue manual `deploy.sh`
- ✅ Documentación de variables de entorno

### 9. Documentación - COMPLETADO
- ✅ Guía de usuario
- ✅ Configuración de entornos de producción
- ✅ Recomendaciones para desarrollo futuro
- ✅ Documentación para desarrolladores

### 10. Conectores para Plataformas Externas - COMPLETADO
- ✅ Implementación de conectores para redes sociales en `/src/lib/connectors/social.ts`
  - Facebook
  - Twitter
  - Instagram
  - LinkedIn
- ✅ Implementación de conectores para email marketing en `/src/lib/connectors/email.ts`
  - Mailchimp
  - SendGrid
  - ConvertKit
  - MailerLite
- ✅ Integración con el MCP a través del ExecutorMCP en `/src/lib/mcp/executor.ts`
- ✅ Pruebas de integración para todos los conectores en `/tests/connectors/`

### 11. Panel de Administración - COMPLETADO
- ✅ Interfaz principal en `/src/app/admin/page.tsx`
- ✅ Gestión de credenciales de redes sociales en `/src/app/admin/social/[action]/page.tsx`
- ✅ Gestión de credenciales de email marketing en `/src/app/admin/email/[action]/page.tsx`
- ✅ Monitoreo de tareas ejecutadas en `/src/app/admin/tasks/[id]/page.tsx`
- ✅ Esquema de base de datos para conectores en `/supabase/migrations/20250419_connectores_schema.sql`

### 12. Elementos para Versión Beta - COMPLETADO
- ✅ Configuración de entorno de staging con Docker Compose
- ✅ Herramientas de monitoreo (Prometheus y Grafana)
- ✅ Documentación para usuarios de los conectores
- ✅ Proceso de onboarding para nuevos usuarios
- ✅ Plan de rollback para manejar problemas críticos
- ✅ Programa de beta testers
- ✅ Configuración de límites y cuotas por plan de suscripción

## Lo que falta por hacer

### 1. Mejora del Análisis de Intenciones - PENDIENTE
- ⬜ Implementar un sistema más sofisticado de NLP
- ⬜ Entrenar modelos específicos para cada dominio de los clones
- ⬜ Añadir soporte para múltiples idiomas
- ⬜ Implementar un sistema de retroalimentación para mejorar continuamente

### 2. Mejoras de Experiencia de Usuario - PENDIENTE
- ⬜ Implementar feedback en tiempo real durante la ejecución de tareas
- ⬜ Desarrollar tutoriales interactivos para nuevos usuarios
- ⬜ Crear dashboards personalizados según el tipo de usuario
- ⬜ Mejorar la visualización de resultados y estadísticas

### 3. Escalabilidad y Optimización - PENDIENTE
- ⬜ Implementar sistema de caché para respuestas comunes
- ⬜ Optimizar consultas a la base de datos
- ⬜ Desarrollar un sistema de colas para tareas de larga duración
- ⬜ Configurar auto-escalado en la infraestructura

### 4. Aplicación Móvil - PENDIENTE
- ⬜ Desarrollar aplicación nativa para iOS y Android
- ⬜ Implementar notificaciones push
- ⬜ Añadir soporte para comandos por voz en móvil
- ⬜ Sincronizar datos entre plataformas

## Configuración del Entorno de Desarrollo

### Requisitos Previos
- Node.js 18+
- npm o pnpm
- Git

### Instalación
1. Clonar el repositorio:
   ```bash
   git clone https://github.com/NeuroForge1/Genia_fronted.git
   cd Genia_fronted
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   - Crear archivo `.env.local` basado en `.env.production`
   - Configurar las claves de API necesarias

4. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

### Variables de Entorno
Para el desarrollo local, se requieren las siguientes variables de entorno:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://axfcmtrhsvmtzqqhxwul.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[SUPABASE_ANON_KEY]

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[STRIPE_PUBLISHABLE_KEY]
STRIPE_SECRET_KEY=[STRIPE_SECRET_KEY]
STRIPE_WEBHOOK_SECRET=[STRIPE_WEBHOOK_SECRET]

# OpenAI
OPENAI_API_KEY=[OPENAI_API_KEY]

# Twilio (opcional para desarrollo local)
TWILIO_ACCOUNT_SID=[TWILIO_ACCOUNT_SID]
TWILIO_AUTH_TOKEN=[TWILIO_AUTH_TOKEN]
TWILIO_WHATSAPP_NUMBER=[TWILIO_WHATSAPP_NUMBER]

# Facebook (para conectores de redes sociales)
FACEBOOK_APP_ID=[FACEBOOK_APP_ID]
FACEBOOK_APP_SECRET=[FACEBOOK_APP_SECRET]

# Twitter (para conectores de redes sociales)
TWITTER_API_KEY=[TWITTER_API_KEY]
TWITTER_API_SECRET=[TWITTER_API_SECRET]

# Mailchimp (para conectores de email marketing)
MAILCHIMP_API_KEY=[MAILCHIMP_API_KEY]
```

## Estructura de la Base de Datos

### Tablas Principales en Supabase

1. **users**: Información básica de usuarios (gestionada por Supabase Auth)
   - `id`: UUID (clave primaria)
   - `email`: Email del usuario
   - `created_at`: Fecha de creación

2. **profiles**: Perfiles extendidos de usuarios
   - `id`: UUID (clave primaria, relacionada con users.id)
   - `user_id`: UUID (clave foránea a users.id)
   - `name`: Nombre completo
   - `business_name`: Nombre del negocio
   - `credits`: Número de créditos disponibles
   - `plan`: Plan de suscripción ('free', 'basic', 'pro', 'enterprise')
   - `created_at`: Fecha de creación
   - `updated_at`: Fecha de actualización

3. **subscriptions**: Información de suscripciones
   - `id`: UUID (clave primaria)
   - `user_id`: UUID (clave foránea a users.id)
   - `stripe_customer_id`: ID del cliente en Stripe
   - `stripe_subscription_id`: ID de la suscripción en Stripe
   - `plan`: Plan de suscripción
   - `status`: Estado de la suscripción
   - `current_period_end`: Fecha de fin del período actual
   - `created_at`: Fecha de creación
   - `updated_at`: Fecha de actualización

4. **clones_history**: Historial de interacciones con clones
   - `id`: UUID (clave primaria)
   - `user_id`: UUID (clave foránea a users.id)
   - `clone_type`: Tipo de clon utilizado
   - `request`: Solicitud del usuario
   - `response`: Respuesta del clon
   - `status`: Estado de la tarea ('pending', 'processing', 'completed', 'failed')
   - `created_at`: Fecha de creación
   - `updated_at`: Fecha de actualización

5. **user_actions**: Registro de acciones de usuarios
   - `id`: UUID (clave primaria)
   - `user_id`: UUID (clave foránea a users.id)
   - `action_type`: Tipo de acción
   - `details`: Detalles de la acción (JSONB)
   - `created_at`: Fecha de creación

6. **social_credentials**: Credenciales para conectores de redes sociales
   - `id`: UUID (clave primaria)
   - `user_id`: UUID (clave foránea a users.id)
   - `platform`: Plataforma ('facebook', 'twitter', 'instagram', 'linkedin')
   - `access_token`: Token de acceso
   - `refresh_token`: Token de actualización (opcional)
   - `expires_at`: Fecha de expiración del token
   - `platform_user_id`: ID del usuario en la plataforma
   - `page_id`: ID de la página (para Facebook/Instagram)
   - `created_at`: Fecha de creación
   - `updated_at`: Fecha de actualización

7. **email_credentials**: Credenciales para conectores de email marketing
   - `id`: UUID (clave primaria)
   - `user_id`: UUID (clave foránea a users.id)
   - `platform`: Plataforma ('mailchimp', 'sendgrid', 'convertkit', 'mailerlite')
   - `api_key`: Clave API
   - `server_prefix`: Prefijo del servidor (para Mailchimp)
   - `platform_user_id`: ID del usuario en la plataforma
   - `created_at`: Fecha de creación
   - `updated_at`: Fecha de actualización

8. **executed_tasks**: Registro de tareas ejecutadas por los conectores
   - `id`: UUID (clave primaria)
   - `user_id`: UUID (clave foránea a users.id)
   - `task_type`: Tipo de tarea ('social_post', 'social_schedule', 'social_metrics', 'email_campaign', 'email_subscriber', 'email_metrics')
   - `status`: Estado de la tarea ('pending', 'processing', 'completed', 'failed')
   - `parameters`: Parámetros de la tarea (JSONB)
   - `result`: Resultado de la tarea (JSONB)
   - `error`: Mensaje de error (si aplica)
   - `created_at`: Fecha de creación
   - `updated_at`: Fecha de actualización
   - `completed_at`: Fecha de finalización

### Políticas RLS (Row Level Security)

Todas las tablas tienen políticas RLS configuradas para garantizar que:
- Los usuarios solo pueden ver y modificar sus propios datos
- Los administradores pueden ver y modificar todos los datos
- Las operaciones de inserción, actualización y eliminación están correctamente restringidas

## Guía para Contribuir

### Flujo de Trabajo
1. Crear una rama a partir de `main` para cada nueva funcionalidad
2. Desarrollar y probar la funcionalidad
3. Crear un Pull Request a `main`
4. Esperar revisión y aprobación

### Estándares de Código
- Utilizar TypeScript para todo el código
- Seguir las convenciones de ESLint configuradas
- Escribir pruebas para nuevas funcionalidades
- Documentar componentes y funciones con JSDoc

### Estructura de Commits
- Usar mensajes descriptivos en español o inglés
- Formato recomendado: `[tipo]: descripción breve`
- Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Despliegue

### Frontend (Vercel)
- El despliegue se realiza automáticamente mediante GitHub Actions
- Configuración en `.github/workflows/deploy.yml`
- Variables de entorno configuradas en el panel de Vercel

### Backend (Render)
- Despliegue manual o mediante CI/CD configurado en Render
- Variables de entorno configuradas en el panel de Render

### Entorno de Staging
- Configurado con Docker Compose en `/staging/`
- Incluye servicios para frontend, backend, Supabase, Prometheus y Grafana
- Instrucciones detalladas en `/staging/README.md`

## Conectores para Plataformas Externas

### Conectores de Redes Sociales

Los conectores de redes sociales permiten a GENIA publicar contenido, programar publicaciones y obtener métricas de diferentes plataformas.

#### Plataformas Soportadas
- Facebook
- Twitter
- Instagram
- LinkedIn

#### Arquitectura
- Clase base `SocialConnector` en `/src/lib/connectors/social.ts`
- Factory pattern para crear conectores específicos según la plataforma
- Integración con el MCP a través del `ExecutorMCP`

#### Funcionalidades
- Verificación de credenciales
- Publicación de contenido (texto, imágenes, videos, enlaces)
- Programación de publicaciones
- Obtención de métricas (likes, comentarios, compartidos, alcance)

#### Ejemplo de Uso
```typescript
// Crear un conector para Facebook
const connector = await SocialConnectorFactory.createConnector(userId, 'facebook');

// Publicar contenido
const result = await connector.publishContent({
  type: 'text',
  text: 'Contenido de prueba',
});

// Obtener métricas
const metrics = await connector.getPostMetrics(result.postId);
```

### Conectores de Email Marketing

Los conectores de email marketing permiten a GENIA crear y enviar campañas, gestionar listas de suscriptores y obtener métricas de diferentes plataformas.

#### Plataformas Soportadas
- Mailchimp
- SendGrid
- ConvertKit
- MailerLite

#### Arquitectura
- Clase base `EmailConnector` en `/src/lib/connectors/email.ts`
- Factory pattern para crear conectores específicos según la plataforma
- Integración con el MCP a través del `ExecutorMCP`

#### Funcionalidades
- Verificación de credenciales
- Obtención de listas de suscriptores
- Añadir/eliminar suscriptores
- Creación y envío de campañas
- Obtención de métricas (aperturas, clics, rebotes)

#### Ejemplo de Uso
```typescript
// Crear un conector para Mailchimp
const connector = await EmailConnectorFactory.createConnector(userId, 'mailchimp');

// Obtener listas
const lists = await connector.getLists();

// Crear una campaña
const result = await connector.createCampaign({
  name: 'Campaña de prueba',
  subject: 'Asunto de prueba',
  fromName: 'GENIA',
  fromEmail: 'noreply@genia.ai',
  content: '<p>Contenido de prueba</p>',
  listId: lists[0].id,
});
```

### Integración con el MCP

El `ExecutorMCP` extiende el MCP base para permitir la ejecución de tareas reales a través de los conectores.

#### Arquitectura
- Clase `ExecutorMCP` en `/src/lib/mcp/executor.ts`
- Análisis de intenciones ejecutables
- Delegación a conectores específicos
- Registro de tareas ejecutadas

#### Tipos de Tareas Ejecutables
- `SOCIAL_POST`: Publicación en redes sociales
- `SOCIAL_SCHEDULE`: Programación de publicaciones
- `SOCIAL_METRICS`: Obtención de métricas de redes sociales
- `EMAIL_CAMPAIGN`: Creación de campañas de email
- `EMAIL_SUBSCRIBER`: Gestión de suscriptores
- `EMAIL_METRICS`: Obtención de métricas de email

#### Ejemplo de Uso
```typescript
// Analizar intención ejecutable
const task = await executorMCP.analyzeExecutableIntent(
  'Publica en Facebook: Contenido de prueba',
  userId
);

// Ejecutar tarea
const result = await executorMCP.executeTask(task);

// Procesar con clones (integración completa)
const response = await executorMCP.processWithClones(
  'Publica en Facebook: Contenido de prueba',
  userId
);
```

### Panel de Administración

El panel de administración permite a los usuarios gestionar sus credenciales y monitorear las tareas ejecutadas.

#### Componentes Principales
- Página principal en `/src/app/admin/page.tsx`
- Gestión de credenciales de redes sociales en `/src/app/admin/social/[action]/page.tsx`
- Gestión de credenciales de email marketing en `/src/app/admin/email/[action]/page.tsx`
- Detalles de tareas ejecutadas en `/src/app/admin/tasks/[id]/page.tsx`

#### Funcionalidades
- Ver, añadir, editar y eliminar credenciales
- Monitorear tareas ejecutadas
- Ver detalles de tareas específicas
- Reintentar tareas fallidas

#### Acceso
El panel está disponible en la ruta `/admin` y requiere autenticación.

## Límites y Cuotas

Los conectores tienen límites de uso según el plan de suscripción del usuario.

### Límites por Plan
- **Free**: Límites básicos para pruebas
- **Basic**: Límites adecuados para pequeños negocios
- **Pro**: Límites para negocios medianos con uso intensivo
- **Enterprise**: Límites elevados o personalizados

### Implementación
- Verificación de límites antes de ejecutar tareas
- Notificaciones cuando se acerca a los límites
- Sugerencias para actualizar el plan cuando se alcanzan los límites

### Documentación Detallada
Ver `/docs/limites_cuotas.md` para información completa sobre límites y cuotas.

## Pruebas

### Pruebas de Conectores
- Pruebas unitarias para cada conector en `/tests/connectors/`
- Mocks para APIs externas
- Verificación de manejo de errores
- Cobertura de todas las funcionalidades principales

### Ejecución de Pruebas
```bash
# Ejecutar todas las pruebas
npm run test

# Ejecutar pruebas específicas de conectores
npm run test:connectors
```

## Prioridades para Desarrollo Futuro

1. **Alta Prioridad**:
   - Mejora del sistema de análisis de intenciones
   - Optimización de rendimiento y escalabilidad
   - Ampliación de conectores a más plataformas

2. **Media Prioridad**:
   - Mejoras de experiencia de usuario
   - Implementación de análisis y métricas avanzadas
   - Desarrollo de plantillas predefinidas para tareas comunes

3. **Baja Prioridad**:
   - Desarrollo de aplicación móvil
   - Soporte para idiomas adicionales
   - Integraciones con plataformas adicionales

## Documentación Adicional
- Guía de Usuario de Conectores: `/docs/guia_usuario_conectores.md`
- Proceso de Onboarding: `/docs/proceso_onboarding.md`
- Plan de Rollback: `/docs/plan_rollback.md`
- Programa de Beta Testers: `/docs/programa_beta_testers.md`
- Límites y Cuotas: `/docs/limites_cuotas.md`
- Configuración de Staging: `/staging/README.md`

## Contacto
Para cualquier consulta sobre el desarrollo, contactar a:
- Equipo de Desarrollo de GENIA
