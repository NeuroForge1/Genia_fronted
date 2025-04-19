# Documentación del Desarrollo del Proyecto Genia

## Progreso Actual

### 1. Configuración de Supabase (COMPLETADO)
- Se implementaron todas las políticas RLS para las tablas:
  - `subscriptions`: Políticas SELECT, INSERT, UPDATE y DELETE
  - `user_actions`: Políticas SELECT, INSERT, UPDATE y DELETE
  - `clones_history`: Políticas SELECT, INSERT, UPDATE y DELETE
- Se corrigieron los problemas de recursión infinita en las políticas RLS de:
  - Tabla `users`
  - Tabla `credits`
  - Tabla `referrals`

### 2. Implementación de Autenticación con Supabase (COMPLETADO)
- Se instalaron las bibliotecas necesarias:
  - `@supabase/supabase-js`
  - `@supabase/auth-helpers-nextjs`
- Se creó el archivo de configuración del cliente de Supabase (`src/lib/supabase.ts`)
- Se modificó el hook `useAuth.tsx` para integrar la autenticación con Supabase
- Se actualizó el layout principal para incluir el `AuthProvider`
- Se adaptaron los componentes de registro y login para trabajar con Supabase
- Se creó un middleware para proteger las rutas que requieren autenticación

### 3. Implementación del Sistema de Suscripciones con Stripe (COMPLETADO)
- Se instaló la biblioteca `stripe` y `@stripe/stripe-js`
- Se creó el archivo de configuración de Stripe (`src/lib/stripe.ts`) con definición de planes
- Se implementó el componente para mostrar planes de suscripción (`src/components/subscription/SubscriptionPlans.tsx`)
- Se creó la ruta de API para crear sesiones de checkout (`src/app/api/create-checkout-session/route.ts`)
- Se implementó el webhook para manejar eventos de Stripe (`src/app/api/webhook/route.ts`)
- Se configuró la lógica para actualizar suscripciones en Supabase basado en eventos de Stripe

### 4. Optimización de los Prompts para los Clones de IA (COMPLETADO)
- Se creó el archivo de definición de prompts (`src/lib/prompts.ts`)
- Se implementaron prompts optimizados para todos los clones:
  - Clon Content: Especializado en creación de contenido para marketing digital
  - Clon Ads: Especializado en publicidad digital y creación de anuncios
  - Clon CEO: Especializado en estrategia empresarial y liderazgo
  - Clon Voice: Especializado en comunicación verbal y presentaciones
  - Clon Funnel: Especializado en embudos de conversión y optimización
  - Clon Calendar: Especializado en productividad y gestión del tiempo
- Cada prompt incluye:
  - System prompt detallado con capacidades y limitaciones
  - Ejemplos de conversaciones para mejorar el rendimiento
  - Parámetros optimizados para cada tipo de clon

### 5. Integración de WhatsApp vía Twilio (COMPLETADO)
- Se creó el archivo de configuración de Twilio (`src/lib/twilio.ts`)
- Se implementó la clase TwilioService con métodos para:
  - Enviar mensajes de WhatsApp
  - Verificar el estado de los mensajes
  - Obtener historial de mensajes
- Se creó el webhook para recibir y procesar mensajes de WhatsApp (`src/app/api/webhook/twilio/route.ts`)
- Se implementó la lógica para:
  - Identificar usuarios por número de teléfono
  - Enviar mensajes de bienvenida a usuarios no registrados
  - Procesar mensajes según el tipo de clon adecuado
  - Controlar límites de uso según el plan de suscripción
  - Registrar mensajes en la base de datos

## Tareas Pendientes

### 1. Despliegue de la Aplicación
- Configurar CI/CD para el frontend en Vercel
- Configurar CI/CD para el backend en Render
- Realizar pruebas de integración
- Configurar variables de entorno para producción

## Notas Técnicas

### Configuración de Supabase
- URL de Supabase: `https://axfcmtrhsvmtzqqhxwul.supabase.co`
- La clave anónima está configurada en `src/lib/supabase.ts`
- Se recomienda configurar las variables de entorno en producción:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Configuración de Stripe
- Se deben configurar las siguientes variables de entorno:
  - `STRIPE_SECRET_KEY`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `NEXT_PUBLIC_APP_URL`

### Configuración de Twilio
- Se deben configurar las siguientes variables de entorno:
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_WHATSAPP_NUMBER`

### Próximos Pasos Recomendados
1. Configurar el despliegue de la aplicación
2. Realizar pruebas de integración completas
3. Implementar un panel de administración
4. Mejorar la experiencia de usuario con feedback en tiempo real

## Estado del Repositorio
- Se han realizado cambios locales para implementar todas las funcionalidades mencionadas
- Se ha creado un commit local, pero no se ha podido hacer push debido a la falta de credenciales de GitHub
- El próximo desarrollador debe hacer push de estos cambios o implementarlos manualmente

## Contacto
Para cualquier consulta sobre el desarrollo, contactar a:
- Equipo de Desarrollo de Genia
- Mejorar los prompts para el clon CEO
- Mejorar los prompts para el clon Voice
- Mejorar los prompts para el clon Funnel
- Mejorar los prompts para el clon Calendar
- Implementar la integración con OpenAI

### 3. Integración de WhatsApp vía Twilio
- Configurar la API de Twilio
- Implementar la lógica de comunicación
- Configurar webhooks para recibir mensajes
- Implementar sistema de notificaciones

### 4. Despliegue de la Aplicación
- Configurar CI/CD para el frontend en Vercel
- Configurar CI/CD para el backend en Render
- Realizar pruebas de integración
- Configurar variables de entorno para producción

## Notas Técnicas

### Configuración de Supabase
- URL de Supabase: `https://axfcmtrhsvmtzqqhxwul.supabase.co`
- La clave anónima está configurada en `src/lib/supabase.ts`
- Se recomienda configurar las variables de entorno en producción:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Estructura de la Autenticación
- El hook `useAuth` proporciona las funciones de autenticación:
  - `login(email, password)`
  - `register(email, password, name, businessName)`
  - `logout()`
- El middleware protege las rutas que requieren autenticación
- Las rutas protegidas incluyen: `/dashboard`, `/profile`, `/subscription`, `/clones`, `/integrations`

### Próximos Pasos Recomendados
1. Implementar el sistema de suscripciones con Stripe
2. Optimizar los prompts para los clones de IA
3. Integrar WhatsApp vía Twilio
4. Configurar el despliegue de la aplicación

## Estado del Repositorio
- Se han realizado cambios locales para implementar la autenticación con Supabase
- Se ha creado un commit local, pero no se ha podido hacer push debido a la falta de credenciales de GitHub
- El próximo desarrollador debe hacer push de estos cambios o implementarlos manualmente

## Contacto
Para cualquier consulta sobre el desarrollo, contactar a:
- Equipo de Desarrollo de Genia
