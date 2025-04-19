"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, SupabaseUser, UserProfile, handleAuthError, isValidEmail } from '../lib/supabase';

// Definir tipos para el contexto de autenticación
type User = {
  id: string;
  email: string;
  name?: string;
  plan?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, businessName?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  error: string | null;
  clearError: () => void;
};

// Crear el contexto de autenticación
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const clearError = () => setError(null);

  // Verificar si el usuario está autenticado al cargar la página
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Obtener la sesión actual de Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error);
          setLoading(false);
          return;
        }

        if (!session) {
          setLoading(false);
          return;
        }

        // Obtener datos del usuario
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData.user) {
          console.error('Error getting user:', userError);
          setLoading(false);
          return;
        }

        // Obtener perfil del usuario desde la tabla profiles
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userData.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error getting profile:', profileError);
        }

        setUser({
          id: userData.user.id,
          email: userData.user.email || '',
          name: profileData?.name || userData.user.user_metadata?.name || '',
          plan: profileData?.plan || 'free',
        });
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setLoading(false);
      }
    };

    // Configurar listener para cambios en la autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Obtener datos del usuario
          const { data: userData, error: userError } = await supabase.auth.getUser();
          
          if (userError || !userData.user) {
            console.error('Error getting user:', userError);
            return;
          }

          // Obtener perfil del usuario desde la tabla profiles
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userData.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error getting profile:', profileError);
          }

          setUser({
            id: userData.user.id,
            email: userData.user.email || '',
            name: profileData?.name || userData.user.user_metadata?.name || '',
            plan: profileData?.plan || 'free',
          });
          
          // Redirigir al dashboard si no estamos ya allí
          if (window.location.pathname !== '/dashboard') {
            router.push('/dashboard');
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          router.push('/login');
        }
      }
    );

    checkAuth();

    // Limpiar listener al desmontar
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  // Función para iniciar sesión
  const login = async (email: string, password: string) => {
    setLoading(true);
    clearError();
    
    try {
      if (!email || !password) {
        throw new Error('Por favor ingresa tu correo y contraseña');
      }
      
      if (!isValidEmail(email)) {
        throw new Error('Por favor ingresa un correo electrónico válido');
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const errorMessage = handleAuthError(error);
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      if (!data.user) {
        throw new Error('No se pudo obtener la información del usuario');
      }

      // Obtener perfil del usuario desde la tabla profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error getting profile:', profileError);
      }

      setUser({
        id: data.user.id,
        email: data.user.email || '',
        name: profileData?.name || data.user.user_metadata?.name || '',
        plan: profileData?.plan || 'free',
      });

      // Almacenar token en localStorage para mejorar persistencia
      localStorage.setItem('supabase.auth.token', JSON.stringify(data.session));
      
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Error al iniciar sesión');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para registrar un nuevo usuario
  const register = async (email: string, password: string, name: string, businessName?: string) => {
    setLoading(true);
    clearError();
    
    try {
      // Validaciones básicas
      if (!email || !password || !name) {
        throw new Error('Por favor completa todos los campos requeridos');
      }
      
      if (!isValidEmail(email)) {
        throw new Error('Por favor ingresa un correo electrónico válido');
      }
      
      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }
      
      // En desarrollo, permitir dominios de ejemplo
      if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ALLOW_TEST_EMAILS === 'true') {
        // Continuar con el registro incluso con dominios de ejemplo
      }
      
      // Registrar usuario en Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            business_name: businessName,
          },
        },
      });

      if (error) {
        const errorMessage = handleAuthError(error);
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      if (!data.user) {
        throw new Error('No se pudo obtener la información del usuario');
      }

      // Crear perfil en la tabla profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            user_id: data.user.id,
            name,
            business_name: businessName,
            plan: 'free', // Plan por defecto para nuevos usuarios
            credits: 25, // Créditos iniciales para nuevos usuarios
          },
        ]);

      if (profileError) {
        console.error('Error creating profile:', profileError);
        setError('Error al crear el perfil de usuario');
      }

      setUser({
        id: data.user.id,
        email: data.user.email || '',
        name: name,
        plan: 'free', // Plan por defecto para nuevos usuarios
      });

      // Almacenar token en localStorage para mejorar persistencia
      if (data.session) {
        localStorage.setItem('supabase.auth.token', JSON.stringify(data.session));
      }
      
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Error al registrar usuario');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        setError('Error al cerrar sesión');
      }
      
      // Limpiar token del localStorage
      localStorage.removeItem('supabase.auth.token');
      
      setUser(null);
      router.push('/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      setError(error.message || 'Error al cerrar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
