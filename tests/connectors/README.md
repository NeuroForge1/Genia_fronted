# Pruebas de Integración para Conectores

Este directorio contiene pruebas automatizadas para verificar el funcionamiento correcto de los conectores de redes sociales y email marketing.

## Estructura

- `social/`: Pruebas para conectores de redes sociales
- `email/`: Pruebas para conectores de email marketing
- `mcp/`: Pruebas para la integración con el MCP

## Ejecución de Pruebas

Para ejecutar todas las pruebas:

```bash
npm run test:connectors
```

Para ejecutar pruebas específicas:

```bash
npm run test:social
npm run test:email
npm run test:mcp
```

## Configuración

Las pruebas utilizan variables de entorno de prueba definidas en `.env.test`. Asegúrese de configurar este archivo con credenciales de prueba válidas antes de ejecutar las pruebas.
