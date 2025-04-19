# Configuración de Despliegue para Genia Frontend

Este archivo contiene las instrucciones y configuraciones necesarias para desplegar la aplicación Genia Frontend en entornos de producción.

## Configuración de Vercel

### Archivo vercel.json

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["cdg1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@next_public_supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@next_public_supabase_anon_key",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY": "@next_public_stripe_publishable_key",
    "NEXT_PUBLIC_APP_URL": "@next_public_app_url"
  },
  "build": {
    "env": {
      "NEXT_PUBLIC_SUPABASE_URL": "@next_public_supabase_url",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@next_public_supabase_anon_key",
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY": "@next_public_stripe_publishable_key",
      "NEXT_PUBLIC_APP_URL": "@next_public_app_url"
    }
  }
}
```

### Variables de Entorno en Vercel

Las siguientes variables de entorno deben configurarse en el panel de Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`: URL de tu proyecto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Clave anónima de Supabase
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Clave pública de Stripe
- `NEXT_PUBLIC_APP_URL`: URL base de la aplicación desplegada
- `STRIPE_SECRET_KEY`: Clave secreta de Stripe (para APIs serverless)
- `STRIPE_WEBHOOK_SECRET`: Secreto del webhook de Stripe
- `TWILIO_ACCOUNT_SID`: SID de la cuenta de Twilio
- `TWILIO_AUTH_TOKEN`: Token de autenticación de Twilio
- `TWILIO_WHATSAPP_NUMBER`: Número de WhatsApp de Twilio (con formato internacional)

## Configuración de GitHub Actions

### Archivo .github/workflows/deploy.yml

```yaml
name: Deploy to Vercel

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./
          vercel-args: '--prod'
```

## Instrucciones para el Despliegue Manual

1. **Preparación del Proyecto**:
   ```bash
   # Instalar dependencias
   npm install
   
   # Construir la aplicación
   npm run build
   ```

2. **Despliegue con Vercel CLI**:
   ```bash
   # Instalar Vercel CLI
   npm install -g vercel
   
   # Iniciar sesión en Vercel
   vercel login
   
   # Desplegar a producción
   vercel --prod
   ```

3. **Configuración de Webhooks**:
   - Configurar el webhook de Stripe para apuntar a: `https://[tu-dominio]/api/webhook`
   - Configurar el webhook de Twilio para apuntar a: `https://[tu-dominio]/api/webhook/twilio`

## Pruebas Post-Despliegue

Después del despliegue, verificar:

1. **Autenticación**:
   - Registro de nuevos usuarios
   - Inicio de sesión
   - Recuperación de contraseña

2. **Suscripciones**:
   - Visualización de planes
   - Proceso de checkout
   - Actualización de suscripciones

3. **Integración con WhatsApp**:
   - Envío de mensajes de prueba
   - Recepción de respuestas
   - Verificación de límites según plan

## Solución de Problemas Comunes

- **Error 500 en APIs**: Verificar configuración de variables de entorno
- **Problemas con Webhooks**: Comprobar que las URLs estén correctamente configuradas
- **Fallos en Autenticación**: Verificar configuración de Supabase y permisos RLS

## Contacto para Soporte

Para problemas relacionados con el despliegue, contactar a:
- Equipo de Desarrollo de Genia
