# Plan de Rollback para Conectores de GENIA

Este documento describe el procedimiento para revertir cambios en caso de problemas críticos con los conectores de redes sociales y email marketing.

## Escenarios de Rollback

### Escenario 1: Problemas con un conector específico
Si un conector específico presenta problemas (por ejemplo, el conector de Facebook), pero el resto del sistema funciona correctamente:

1. Desactivar temporalmente el conector problemático desde el panel de administración
2. Revertir a la versión anterior del código del conector específico
3. Notificar a los usuarios afectados
4. Investigar y corregir el problema
5. Desplegar la corrección y reactivar el conector

### Escenario 2: Problemas con el ExecutorMCP
Si el ExecutorMCP presenta problemas que afectan a todos los conectores:

1. Activar el modo de solo lectura para todos los conectores
2. Revertir a la versión anterior del ExecutorMCP
3. Notificar a todos los usuarios
4. Investigar y corregir el problema
5. Desplegar la corrección y desactivar el modo de solo lectura

### Escenario 3: Problemas con el panel de administración
Si el panel de administración presenta problemas pero los conectores funcionan correctamente:

1. Desactivar temporalmente el acceso al panel de administración
2. Revertir a la versión anterior del panel
3. Notificar a los administradores
4. Investigar y corregir el problema
5. Desplegar la corrección y reactivar el panel

## Procedimiento de Rollback

### Paso 1: Identificación del problema
- Monitorear alertas de Prometheus/Grafana
- Revisar logs de errores
- Analizar reportes de usuarios
- Determinar la gravedad y alcance del problema

### Paso 2: Decisión de rollback
- El equipo de desarrollo evalúa si es necesario un rollback
- Se decide el tipo de rollback según el escenario
- Se asigna un responsable para coordinar el proceso

### Paso 3: Ejecución del rollback
- Ejecutar el script de rollback correspondiente
- Verificar que el rollback se ha completado correctamente
- Confirmar que el sistema ha vuelto a un estado estable

### Paso 4: Comunicación
- Notificar a los usuarios afectados
- Publicar un aviso en el dashboard
- Enviar email a administradores
- Actualizar el estado del sistema en la página de estado

### Paso 5: Seguimiento
- Investigar la causa raíz del problema
- Desarrollar y probar una solución
- Planificar un nuevo despliegue con la corrección
- Actualizar la documentación y los procedimientos si es necesario

## Scripts de Rollback

### Rollback de un conector específico
```bash
#!/bin/bash
# rollback_connector.sh

CONNECTOR=$1
VERSION=$2

# Verificar parámetros
if [ -z "$CONNECTOR" ] || [ -z "$VERSION" ]; then
  echo "Uso: rollback_connector.sh [connector_name] [version]"
  exit 1
fi

# Desactivar conector
echo "Desactivando conector $CONNECTOR..."
curl -X POST https://api.genia.ai/admin/connectors/$CONNECTOR/disable \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Revertir código
echo "Revirtiendo código a versión $VERSION..."
git checkout $VERSION -- src/lib/connectors/$CONNECTOR.ts

# Reconstruir y desplegar
echo "Reconstruyendo y desplegando..."
npm run build
npm run deploy:staging

echo "Rollback completado. Verificar funcionamiento antes de reactivar."
```

### Rollback del ExecutorMCP
```bash
#!/bin/bash
# rollback_executor.sh

VERSION=$1

# Verificar parámetros
if [ -z "$VERSION" ]; then
  echo "Uso: rollback_executor.sh [version]"
  exit 1
fi

# Activar modo solo lectura
echo "Activando modo solo lectura para todos los conectores..."
curl -X POST https://api.genia.ai/admin/connectors/readonly \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Revertir código
echo "Revirtiendo ExecutorMCP a versión $VERSION..."
git checkout $VERSION -- src/lib/mcp/executor.ts

# Reconstruir y desplegar
echo "Reconstruyendo y desplegando..."
npm run build
npm run deploy:staging

echo "Rollback completado. Verificar funcionamiento antes de desactivar modo solo lectura."
```

## Prevención de Problemas

Para minimizar la necesidad de rollbacks, se implementarán las siguientes medidas:

1. **Pruebas exhaustivas**: Todas las nuevas funcionalidades deben pasar pruebas unitarias, de integración y end-to-end.
2. **Despliegues graduales**: Implementar nuevas funcionalidades para un pequeño porcentaje de usuarios primero.
3. **Feature flags**: Utilizar flags para activar/desactivar funcionalidades sin necesidad de despliegues.
4. **Monitoreo proactivo**: Configurar alertas para detectar problemas antes de que afecten a los usuarios.
5. **Canary releases**: Desplegar primero en entornos de staging y monitorear antes de pasar a producción.

## Responsables

- **Coordinador de Rollback**: [Nombre del responsable]
- **Comunicación con Usuarios**: [Nombre del responsable]
- **Análisis Post-Rollback**: [Nombre del responsable]

## Actualización del Plan

Este plan debe revisarse y actualizarse después de cada incidente que requiera un rollback para incorporar las lecciones aprendidas.
