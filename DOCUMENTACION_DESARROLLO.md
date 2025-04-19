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

### 13. Mejoras Recientes Implementadas - COMPLETADO
- ✅ Corrección de problemas de compatibilidad con Next.js 14
  - Añadida directiva "use client" en componentes clave
  - Resueltos conflictos de importación y exportación
- ✅ Mejoras en la interfaz de usuario
  - Rediseño de la página de login para mejor legibilidad
  - Ajuste de proporciones entre imágenes y texto
  - Mejora en la jerarquía tipográfica
- ✅ Corrección de problemas de autenticación
  - Implementación de almacenamiento de tokens en localStorage
  - Mejora en la validación de correos electrónicos
  - Soporte para dominios de prueba en entorno de desarrollo
- ✅ Mejora en la persistencia de sesión
  - Implementación de layout.tsx específico para el directorio de clones
  - Optimización del middleware para rutas protegidas
- ✅ Preparación para despliegue
  - Creación de archivo vercel.json para el frontend
  - Creación de archivo render.yaml para el backend
  - Documentación detallada del proceso de despliegue

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

## Pruebas Exhaustivas Antes del Despliegue

Para garantizar que GENIA funcione correctamente en producción, es necesario realizar las siguientes pruebas exhaustivas antes del despliegue final:

### 1. Pruebas de Autenticación y Gestión de Usuarios

- **Registro de Usuarios**
  - Verificar registro con diferentes dominios de correo (Gmail, Outlook, dominios corporativos)
  - Probar validaciones de contraseña (longitud mínima, caracteres especiales)
  - Verificar asignación correcta de créditos iniciales (25 créditos)
  - Comprobar creación correcta del perfil en Supabase

- **Inicio de Sesión**
  - Verificar inicio de sesión con credenciales correctas
  - Probar manejo de errores con credenciales incorrectas
  - Comprobar redirección al dashboard después del login exitoso
  - Verificar persistencia de sesión al navegar entre páginas

- **Gestión de Perfiles**
  - Verificar actualización de datos de perfil
  - Probar cambio de contraseña
  - Comprobar actualización de plan de suscripción
  - Verificar visualización correcta de créditos disponibles

### 2. Pruebas del Módulo Central de Procesos (MCP)

- **Análisis de Intenciones**
  - Probar reconocimiento de intenciones con diferentes tipos de consultas
  - Verificar identificación correcta de entidades (nombres, fechas, cantidades)
  - Comprobar manejo de consultas ambiguas
  - Verificar detección de idioma y adaptación de respuestas

- **Delegación a Clones**
  - Verificar asignación correcta de consultas a cada clon especializado
  - Probar transferencia de contexto entre el MCP y los clones
  - Comprobar manejo de solicitudes que requieren múltiples clones
  - Verificar priorización de tareas cuando hay varias solicitudes

- **Gestión de Errores**
  - Probar manejo de solicitudes mal formadas
  - Verificar respuestas ante servicios externos no disponibles
  - Comprobar recuperación ante fallos de conexión
  - Verificar límites de tokens y manejo de respuestas truncadas

### 3. Pruebas de Clones Especializados

- **Clon Content**
  - Verificar generación de artículos de blog con diferentes longitudes
  - Probar creación de publicaciones para redes sociales (Twitter, LinkedIn, Instagram)
  - Comprobar generación de emails para campañas de marketing
  - Verificar adaptación del tono según la marca del usuario
  - Probar generación de contenido SEO con palabras clave específicas

- **Clon Ads**
  - Verificar creación de anuncios para diferentes plataformas (Google, Facebook, Instagram)
  - Probar generación de copy publicitario con diferentes objetivos (conversión, tráfico, reconocimiento)
  - Comprobar recomendaciones de segmentación
  - Verificar sugerencias de presupuesto y pujas
  - Probar análisis de rendimiento de campañas existentes

- **Clon CEO**
  - Verificar análisis FODA (Fortalezas, Oportunidades, Debilidades, Amenazas)
  - Probar generación de planes estratégicos
  - Comprobar análisis de competencia
  - Verificar recomendaciones de precios
  - Probar sugerencias para optimización de procesos

- **Clon Voice**
  - Verificar reconocimiento de comandos por voz
  - Probar generación de respuestas habladas
  - Comprobar adaptación a diferentes acentos y dialectos
  - Verificar transcripción de audio a texto
  - Probar integración con asistentes virtuales

- **Clon Funnel**
  - Verificar diseño de embudos de conversión
  - Probar análisis de puntos de abandono
  - Comprobar recomendaciones para mejorar tasas de conversión
  - Verificar integración con plataformas de landing pages
  - Probar seguimiento de métricas clave (CTR, tasa de conversión, valor de cliente)

- **Clon Calendar**
  - Verificar programación de tareas y eventos
  - Probar priorización de actividades
  - Comprobar recordatorios y notificaciones
  - Verificar gestión de reuniones y citas
  - Probar optimización de horarios

### 4. Pruebas de Integraciones Externas

- **OpenAI**
  - Verificar conexión con diferentes modelos (GPT-4, GPT-3.5)
  - Probar manejo de límites de tokens
  - Comprobar gestión de errores de la API
  - Verificar tiempos de respuesta y optimizaciones

- **Supabase**
  - Verificar operaciones CRUD en todas las tablas
  - Probar políticas de seguridad RLS (Row Level Security)
  - Comprobar consultas complejas y joins
  - Verificar manejo de transacciones
  - Probar sincronización de datos en tiempo real

- **Stripe**
  - Verificar creación de clientes
  - Probar proceso de checkout completo
  - Comprobar gestión de suscripciones (creación, actualización, cancelación)
  - Verificar procesamiento de webhooks
  - Probar manejo de errores de pago
  - Verificar facturación y recibos

- **Twilio (WhatsApp)**
  - Verificar envío de mensajes
  - Probar recepción y procesamiento de mensajes entrantes
  - Comprobar manejo de archivos multimedia
  - Verificar integración con el MCP para procesar solicitudes
  - Probar límites de mensajes y gestión de errores

- **Email**
  - Verificar envío de correos transaccionales (registro, recuperación de contraseña)
  - Probar envío de newsletters y campañas
  - Comprobar personalización de plantillas
  - Verificar tasas de entrega y rebotes
  - Probar programación de envíos

### 5. Pruebas de Rendimiento y Escalabilidad

- **Tiempos de Respuesta**
  - Medir tiempos de respuesta del MCP bajo diferentes cargas
  - Verificar tiempos de generación de contenido por los clones
  - Comprobar latencia en integraciones con servicios externos
  - Medir tiempos de carga de páginas en el frontend

- **Concurrencia**
  - Probar múltiples usuarios simultáneos
  - Verificar manejo de solicitudes concurrentes al MCP
  - Comprobar límites de conexiones a la base de datos
  - Medir degradación de rendimiento bajo carga

- **Consumo de Recursos**
  - Monitorear uso de CPU y memoria
  - Verificar consumo de ancho de banda
  - Comprobar límites de almacenamiento
  - Medir costos de API de terceros bajo diferentes volúmenes

### 6. Pruebas de Seguridad

- **Autenticación y Autorización**
  - Verificar protección de rutas privadas
  - Probar expiración y renovación de tokens
  - Comprobar separación de datos entre usuarios
  - Verificar políticas de contraseñas

- **Protección de Datos**
  - Verificar cifrado de datos sensibles
  - Probar cumplimiento de GDPR y otras regulaciones
  - Comprobar backups y recuperación de datos
  - Verificar eliminación segura de datos de usuario

- **Vulnerabilidades**
  - Probar protección contra inyección SQL
  - Verificar defensa contra XSS y CSRF
  - Comprobar configuración de encabezados de seguridad
  - Verificar protección contra ataques de fuerza bruta

### 7. Pruebas de Interfaz de Usuario

- **Responsividad**
  - Verificar visualización en diferentes tamaños de pantalla (móvil, tablet, escritorio)
  - Probar interacciones táctiles en dispositivos móviles
  - Comprobar adaptación de layouts
  - Verificar legibilidad de textos en diferentes dispositivos

- **Accesibilidad**
  - Verificar contraste de colores
  - Probar navegación con teclado
  - Comprobar compatibilidad con lectores de pantalla
  - Verificar textos alternativos para imágenes

- **Compatibilidad con Navegadores**
  - Probar en Chrome, Firefox, Safari y Edge
  - Verificar funcionamiento en diferentes versiones de navegadores
  - Comprobar rendimiento en navegadores móviles
  - Verificar carga de fuentes y estilos

### 8. Pruebas de Flujos Completos de Usuario

- **Onboarding de Nuevos Usuarios**
  - Verificar flujo completo desde registro hasta primera tarea
  - Probar tutorial inicial y guía de uso
  - Comprobar configuración inicial de perfil
  - Verificar asignación de créditos de bienvenida

- **Creación y Publicación de Contenido**
  - Verificar flujo desde solicitud hasta publicación en redes sociales
  - Probar programación de publicaciones
  - Comprobar edición y aprobación de contenido
  - Verificar análisis post-publicación

- **Gestión de Campañas Publicitarias**
  - Verificar flujo desde creación hasta lanzamiento de campaña
  - Probar monitoreo de rendimiento
  - Comprobar optimización automática
  - Verificar informes y análisis

- **Análisis Estratégico de Negocio**
  - Verificar flujo desde solicitud hasta entrega de informe
  - Probar implementación de recomendaciones
  - Comprobar seguimiento de KPIs
  - Verificar actualizaciones periódicas

### 9. Pruebas de Recuperación y Resiliencia

- **Recuperación ante Fallos**
  - Verificar comportamiento ante caídas de servicios externos
  - Probar recuperación después de reinicios
  - Comprobar persistencia de datos en caso de fallos
  - Verificar mecanismos de retry para operaciones fallidas

- **Manejo de Errores**
  - Verificar mensajes de error amigables para el usuario
  - Probar registro de errores para diagnóstico
  - Comprobar notificaciones a administradores ante errores críticos
  - Verificar planes de contingencia para servicios no disponibles

### 10. Pruebas de Despliegue

- **Entorno de Staging**
  - Verificar despliegue completo en entorno de staging
  - Probar migración de datos
  - Comprobar configuración de variables de entorno
  - Verificar integración con servicios externos en modo sandbox

- **Proceso de Despliegue**
  - Verificar scripts de despliegue automatizado
  - Probar rollback en caso de fallos
  - Comprobar tiempo de inactividad durante actualizaciones
  - Verificar sincronización entre frontend y backend

- **Monitoreo Post-Despliegue**
  - Verificar alertas y notificaciones
  - Probar dashboards de monitoreo
  - Comprobar logs y diagnóstico
  - Verificar métricas de rendimiento

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

Los conectores de redes sociales permiten a GENIA interactuar con diferentes plataformas para publicar contenido, programar publicaciones y obtener métricas.

### Conectores de Email Marketing

Los conectores de email marketing permiten a GENIA crear y enviar campañas, gestionar listas de suscriptores y analizar métricas de rendimiento.
