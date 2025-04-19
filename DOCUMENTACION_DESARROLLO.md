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

## Lo que falta por hacer

### 1. Mejora del Análisis de Intenciones - PENDIENTE
- ⬜ Implementar un sistema más sofisticado de NLP
- ⬜ Entrenar modelos específicos para cada dominio de los clones
- ⬜ Añadir soporte para múltiples idiomas
- ⬜ Implementar un sistema de retroalimentación para mejorar continuamente

### 2. Ejecución de Tareas Reales - PENDIENTE
- ⬜ Implementar conectores para plataformas de redes sociales (Facebook, Instagram, LinkedIn)
- ⬜ Desarrollar integraciones con herramientas de email marketing (Mailchimp, SendGrid)
- ⬜ Crear conectores para plataformas publicitarias (Google Ads, Facebook Ads)
- ⬜ Implementar integraciones con herramientas de análisis (Google Analytics, Mixpanel)

### 3. Panel de Administración - PENDIENTE
- ⬜ Desarrollar interfaz para administradores
- ⬜ Implementar gestión de usuarios y suscripciones
- ⬜ Crear dashboard de métricas y analíticas
- ⬜ Añadir herramientas de soporte y atención al cliente

### 4. Mejoras de Experiencia de Usuario - PENDIENTE
- ⬜ Implementar feedback en tiempo real durante la ejecución de tareas
- ⬜ Desarrollar tutoriales interactivos para nuevos usuarios
- ⬜ Crear dashboards personalizados según el tipo de usuario
- ⬜ Mejorar la visualización de resultados y estadísticas

### 5. Escalabilidad y Optimización - PENDIENTE
- ⬜ Implementar sistema de caché para respuestas comunes
- ⬜ Optimizar consultas a la base de datos
- ⬜ Desarrollar un sistema de colas para tareas de larga duración
- ⬜ Configurar auto-escalado en la infraestructura

### 6. Aplicación Móvil - PENDIENTE
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

## Prioridades para Desarrollo Futuro

1. **Alta Prioridad**:
   - Implementación de conectores para ejecución de tareas reales
   - Mejora del sistema de análisis de intenciones
   - Desarrollo del panel de administración

2. **Media Prioridad**:
   - Mejoras de experiencia de usuario
   - Implementación de análisis y métricas
   - Optimización de rendimiento y escalabilidad

3. **Baja Prioridad**:
   - Desarrollo de aplicación móvil
   - Soporte para idiomas adicionales
   - Integraciones con plataformas adicionales

## Documentación Adicional
- Guía de Usuario: Disponible en `/docs/guia_usuario.md`
- Configuración de Producción: Disponible en `/docs/configuracion_produccion.md`
- Recomendaciones Finales: Disponible en `/docs/recomendaciones_finales.md`

## Contacto
Para cualquier consulta sobre el desarrollo, contactar a:
- Equipo de Desarrollo de GENIA
