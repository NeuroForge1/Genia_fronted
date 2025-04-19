// Sistema de feature flags para despliegue gradual de GENIA
import { useEffect, useState } from 'react';
import { supabaseClient } from './supabase';

// Tipos de feature flags
export type FeatureFlag = 
  | 'social_connectors'  // Conectores de redes sociales
  | 'email_connectors'   // Conectores de email marketing
  | 'admin_panel'        // Panel de administración
  | 'metrics_dashboard'  // Dashboard de métricas
  | 'advanced_scheduling'; // Programación avanzada

// Configuración por defecto de los feature flags según el entorno
const DEFAULT_FLAGS: Record<string, Record<FeatureFlag, boolean>> = {
  development: {
    social_connectors: true,
    email_connectors: true,
    admin_panel: true,
    metrics_dashboard: true,
    advanced_scheduling: true,
  },
  staging: {
    social_connectors: true,
    email_connectors: true,
    admin_panel: true,
    metrics_dashboard: true,
    advanced_scheduling: false,
  },
  production: {
    social_connectors: false, // Desactivado por defecto en producción
    email_connectors: false,  // Desactivado por defecto en producción
    admin_panel: true,
    metrics_dashboard: false,
    advanced_scheduling: false,
  },
};

// Función para obtener el valor de un feature flag
export async function getFeatureFlag(
  flagName: FeatureFlag,
  userId?: string
): Promise<boolean> {
  // Obtener el entorno actual
  const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || 'development';
  
  // Si no hay userId, devolver el valor por defecto según el entorno
  if (!userId) {
    return DEFAULT_FLAGS[environment][flagName] || false;
  }
  
  try {
    // Verificar si el usuario tiene una configuración específica para este flag
    const { data, error } = await supabaseClient
      .from('user_feature_flags')
      .select('enabled')
      .eq('user_id', userId)
      .eq('flag_name', flagName)
      .single();
    
    if (error || !data) {
      // Si hay error o no hay datos, verificar si el usuario está en un grupo beta
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('beta_group')
        .eq('user_id', userId)
        .single();
      
      if (profileError || !profile) {
        return DEFAULT_FLAGS[environment][flagName] || false;
      }
      
      // Si el usuario está en un grupo beta, verificar si el grupo tiene acceso a este flag
      if (profile.beta_group) {
        const { data: groupFlag, error: groupError } = await supabaseClient
          .from('beta_group_flags')
          .select('enabled')
          .eq('group_name', profile.beta_group)
          .eq('flag_name', flagName)
          .single();
        
        if (!groupError && groupFlag) {
          return groupFlag.enabled;
        }
      }
      
      // Si no hay configuración específica para el grupo, usar el valor por defecto
      return DEFAULT_FLAGS[environment][flagName] || false;
    }
    
    // Devolver el valor específico del usuario
    return data.enabled;
  } catch (error) {
    console.error('Error getting feature flag:', error);
    return DEFAULT_FLAGS[environment][flagName] || false;
  }
}

// Hook para usar feature flags en componentes React
export function useFeatureFlag(
  flagName: FeatureFlag,
  userId?: string
): [boolean, boolean] {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    let isMounted = true;
    
    async function loadFeatureFlag() {
      try {
        const enabled = await getFeatureFlag(flagName, userId);
        if (isMounted) {
          setIsEnabled(enabled);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading feature flag:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    
    loadFeatureFlag();
    
    return () => {
      isMounted = false;
    };
  }, [flagName, userId]);
  
  return [isEnabled, isLoading];
}

// Componente para renderizar condicionalmente según feature flags
export function FeatureFlagGuard({
  flagName,
  userId,
  children,
  fallback = null,
}: {
  flagName: FeatureFlag;
  userId?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [isEnabled, isLoading] = useFeatureFlag(flagName, userId);
  
  if (isLoading) {
    return null; // O un componente de carga
  }
  
  return isEnabled ? <>{children}</> : <>{fallback}</>;
}

// Función para habilitar un feature flag para un usuario específico
export async function enableFeatureForUser(
  flagName: FeatureFlag,
  userId: string
): Promise<boolean> {
  try {
    // Verificar si ya existe una entrada para este usuario y flag
    const { data: existingFlag } = await supabaseClient
      .from('user_feature_flags')
      .select('id')
      .eq('user_id', userId)
      .eq('flag_name', flagName)
      .single();
    
    if (existingFlag) {
      // Actualizar la entrada existente
      const { error } = await supabaseClient
        .from('user_feature_flags')
        .update({ enabled: true })
        .eq('id', existingFlag.id);
      
      return !error;
    } else {
      // Crear una nueva entrada
      const { error } = await supabaseClient
        .from('user_feature_flags')
        .insert({
          user_id: userId,
          flag_name: flagName,
          enabled: true,
        });
      
      return !error;
    }
  } catch (error) {
    console.error('Error enabling feature for user:', error);
    return false;
  }
}

// Función para habilitar un feature flag para un grupo beta
export async function enableFeatureForGroup(
  flagName: FeatureFlag,
  groupName: string
): Promise<boolean> {
  try {
    // Verificar si ya existe una entrada para este grupo y flag
    const { data: existingFlag } = await supabaseClient
      .from('beta_group_flags')
      .select('id')
      .eq('group_name', groupName)
      .eq('flag_name', flagName)
      .single();
    
    if (existingFlag) {
      // Actualizar la entrada existente
      const { error } = await supabaseClient
        .from('beta_group_flags')
        .update({ enabled: true })
        .eq('id', existingFlag.id);
      
      return !error;
    } else {
      // Crear una nueva entrada
      const { error } = await supabaseClient
        .from('beta_group_flags')
        .insert({
          group_name: groupName,
          flag_name: flagName,
          enabled: true,
        });
      
      return !error;
    }
  } catch (error) {
    console.error('Error enabling feature for group:', error);
    return false;
  }
}

export default {
  getFeatureFlag,
  useFeatureFlag,
  FeatureFlagGuard,
  enableFeatureForUser,
  enableFeatureForGroup,
};
