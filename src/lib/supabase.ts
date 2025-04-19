import { createClient } from '@supabase/supabase-js';

// Inicializar el cliente de Supabase con las variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://axfcmtrhsvmtzqqhxwul.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4ZmNtdHJoc3ZtdHpxcWh4d3VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4MjA2MzksImV4cCI6MjA1OTM5NjYzOX0.F7X3QI2AL90Q-XZjWceSuW45vDMBjz7txTqge4lwxtQ';

// Crear y exportar el cliente de Supabase con opciones mejoradas para persistencia
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'genia-auth-token',
  }
});

// Tipos para los usuarios de Supabase
export type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    business_name?: string;
  };
};

// Tipos para los perfiles de usuario
export type UserProfile = {
  id: string;
  user_id: string;
  name?: string;
  business_name?: string;
  plan?: string;
  credits?: number;
  created_at?: string;
  updated_at?: string;
};

// Función para obtener el perfil de usuario
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data as UserProfile;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
};

// Función para actualizar el perfil de usuario
export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return false;
  }
};

// Función para validar si un correo electrónico es válido
export const isValidEmail = (email: string): boolean => {
  // Expresión regular para validar correos electrónicos
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Función para manejar errores de autenticación con mensajes más descriptivos
export const handleAuthError = (error: any): string => {
  if (!error) return 'Error desconocido';
  
  // Errores comunes de Supabase Auth
  switch (error.message) {
    case 'Invalid login credentials':
      return 'Credenciales inválidas. Por favor verifica tu correo y contraseña.';
    case 'Email not confirmed':
      return 'Por favor confirma tu correo electrónico antes de iniciar sesión.';
    case 'User already registered':
      return 'Este correo ya está registrado. Intenta iniciar sesión.';
    case 'Password should be at least 6 characters':
      return 'La contraseña debe tener al menos 6 caracteres.';
    default:
      // Para errores de validación de correo, permitir dominios de ejemplo en desarrollo
      if (error.message.includes('invalid') && error.message.includes('email')) {
        if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ALLOW_TEST_EMAILS === 'true') {
          // En desarrollo, ignorar errores de validación para dominios de ejemplo
          return '';
        }
        return 'Formato de correo electrónico inválido.';
      }
      return error.message || 'Error en la autenticación';
  }
};
