# Configuración del Entorno de Staging

Este directorio contiene la configuración necesaria para el entorno de staging de GENIA, que permite probar los cambios antes de desplegarlos a producción.

## Estructura

- `docker-compose.yml`: Configuración para levantar el entorno completo
- `nginx/`: Configuración del proxy inverso
- `supabase/`: Configuración de Supabase local para pruebas
- `scripts/`: Scripts de utilidad para gestionar el entorno

## Uso

### Iniciar el entorno de staging

```bash
cd staging
docker-compose up -d
```

### Detener el entorno

```bash
cd staging
docker-compose down
```

### Reiniciar servicios específicos

```bash
cd staging
docker-compose restart frontend
```

## Variables de Entorno

Crear un archivo `.env` en este directorio con las siguientes variables:

```
# Puertos
FRONTEND_PORT=3000
BACKEND_PORT=8000
SUPABASE_PORT=54321

# Credenciales de prueba
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=testpassword123

# API Keys (usar claves de prueba, nunca de producción)
OPENAI_API_KEY=sk-test-...
STRIPE_TEST_KEY=sk_test_...
```

## Notas Importantes

- Este entorno es solo para pruebas, no usar en producción
- Las credenciales de prueba no deben ser reales
- Los datos se resetean cada vez que se reinicia el entorno
