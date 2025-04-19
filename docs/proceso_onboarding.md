# Proceso de Onboarding para Conectores de GENIA

Este documento describe el flujo de onboarding para nuevos usuarios que deseen utilizar los conectores de GENIA para redes sociales y email marketing.

## Flujo de Onboarding

### Paso 1: Bienvenida y Explicación
- Mostrar pantalla de bienvenida a los conectores
- Explicar brevemente qué son y para qué sirven
- Mostrar ejemplos de uso con animaciones

### Paso 2: Selección de Plataformas
- Presentar las plataformas disponibles
- Permitir al usuario seleccionar las que desea configurar
- Explicar los beneficios de cada plataforma

### Paso 3: Configuración de Credenciales
- Guiar al usuario paso a paso para obtener las credenciales necesarias
- Proporcionar enlaces directos a las páginas de desarrolladores de cada plataforma
- Mostrar capturas de pantalla del proceso

### Paso 4: Verificación de Conexiones
- Verificar que las credenciales sean válidas
- Mostrar estado de conexión para cada plataforma
- Ofrecer soluciones para problemas comunes

### Paso 5: Tutorial Interactivo
- Guiar al usuario para realizar su primera acción con los conectores
- Proporcionar ejemplos de comandos para cada plataforma
- Celebrar el éxito de la primera acción

### Paso 6: Configuración de Límites y Preferencias
- Permitir al usuario establecer límites de uso
- Configurar preferencias de notificación
- Establecer horarios preferidos para publicaciones programadas

## Implementación Técnica

El flujo de onboarding se implementará como un componente React que se mostrará a los usuarios nuevos o cuando se active manualmente desde el panel de administración.

```tsx
// Componente principal de onboarding
import { useState } from 'react';
import WelcomeStep from './steps/WelcomeStep';
import PlatformSelectionStep from './steps/PlatformSelectionStep';
import CredentialsStep from './steps/CredentialsStep';
import VerificationStep from './steps/VerificationStep';
import TutorialStep from './steps/TutorialStep';
import PreferencesStep from './steps/PreferencesStep';
import CompletionStep from './steps/CompletionStep';

export default function ConnectorsOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [credentials, setCredentials] = useState({});
  const [preferences, setPreferences] = useState({});
  
  const steps = [
    <WelcomeStep onNext={() => setCurrentStep(1)} />,
    <PlatformSelectionStep 
      onNext={(platforms) => {
        setSelectedPlatforms(platforms);
        setCurrentStep(2);
      }}
      onBack={() => setCurrentStep(0)}
    />,
    <CredentialsStep 
      platforms={selectedPlatforms}
      onNext={(creds) => {
        setCredentials(creds);
        setCurrentStep(3);
      }}
      onBack={() => setCurrentStep(1)}
    />,
    <VerificationStep 
      credentials={credentials}
      onNext={() => setCurrentStep(4)}
      onBack={() => setCurrentStep(2)}
    />,
    <TutorialStep 
      platforms={selectedPlatforms}
      onNext={() => setCurrentStep(5)}
      onBack={() => setCurrentStep(3)}
    />,
    <PreferencesStep 
      onNext={(prefs) => {
        setPreferences(prefs);
        setCurrentStep(6);
      }}
      onBack={() => setCurrentStep(4)}
    />,
    <CompletionStep 
      platforms={selectedPlatforms}
      onFinish={() => {
        // Guardar preferencias y redirigir al dashboard
      }}
    />
  ];
  
  return (
    <div className="onboarding-container">
      <div className="progress-bar">
        {steps.map((_, index) => (
          <div 
            key={index} 
            className={`progress-step ${index <= currentStep ? 'active' : ''}`}
            onClick={() => index < currentStep && setCurrentStep(index)}
          />
        ))}
      </div>
      
      <div className="step-content">
        {steps[currentStep]}
      </div>
    </div>
  );
}
```

## Métricas de Éxito

Para medir la efectividad del proceso de onboarding, se rastrearán las siguientes métricas:

1. Tasa de finalización del onboarding
2. Tiempo promedio para completar cada paso
3. Porcentaje de usuarios que configuran al menos un conector
4. Número de acciones ejecutadas en la primera semana
5. Tasa de retención después de 30 días

## Próximas Mejoras

- Personalización del onboarding según el plan de suscripción
- Integración con asistente virtual para guiar el proceso
- Soporte para más plataformas
- Detección automática de problemas y sugerencias de solución
