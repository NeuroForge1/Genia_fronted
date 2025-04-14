/**
 * Cliente API para GENIA
 * Este archivo proporciona una interfaz unificada para interactuar con los servicios de backend
 * Funciona tanto en entornos de módulos ES6 como en páginas HTML tradicionales
 */

// Función autoejecutable para crear un ámbito aislado
(function() {
  // Intentar cargar Supabase si no está disponible
  if (typeof supabase === 'undefined' && typeof window !== 'undefined') {
    // Verificar si el script de Supabase ya está cargado
    if (!document.querySelector('script[src*="supabase-js"]')) {
      console.log('Cargando Supabase desde CDN...');
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@supabase/supabase-js@2';
      script.async = true;
      document.head.appendChild(script);
    }
  }

  // Configuración de GENIA
  const GENIA_CONFIG = {
    supabase: {
      url: 'https://axfcmtrhsvmtzqqhxwul.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4ZmNtdHJoc3ZtdHpxcWh4d3VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI4NzM1NzAsImV4cCI6MjAyODQ0OTU3MH0.Nt8YuKDLCCK-QaU9c1ZcqvIpJXVCvRYNGrNQXGLYRXY'
    },
    api: {
      baseUrl: 'https://genia-backend.onrender.com'
    }
  };

  // Crear cliente de Supabase
  let supabaseClient;
  
  // Función para inicializar el cliente de Supabase
  function initSupabase() {
    try {
      // Verificar si Supabase está disponible
      if (typeof supabase !== 'undefined') {
        console.log('Inicializando cliente Supabase...');
        const { createClient } = supabase;
        supabaseClient = createClient(
          GENIA_CONFIG.supabase.url,
          GENIA_CONFIG.supabase.anonKey
        );
        return supabaseClient;
      } else {
        console.error('Supabase no está disponible. Asegúrate de cargar el script de Supabase.');
        return null;
      }
    } catch (error) {
      console.error('Error al inicializar Supabase:', error);
      return null;
    }
  }

  // Cliente API
  const apiClient = {
    // Inicializar el cliente
    init: function() {
      if (!supabaseClient) {
        supabaseClient = initSupabase();
      }
      return this;
    },

    // Realizar solicitud GET
    get: async function(endpoint, params = {}) {
      try {
        const url = new URL(GENIA_CONFIG.api.baseUrl + endpoint);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getToken()}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error(`Error en GET ${endpoint}:`, error);
        throw error;
      }
    },

    // Realizar solicitud POST
    post: async function(endpoint, data = {}) {
      try {
        // Manejar endpoints de autenticación
        if (endpoint === '/auth/login') {
          return await this.login(data.email, data.password);
        } else if (endpoint === '/api/users/register') {
          return await this.register(data);
        }
        
        const response = await fetch(GENIA_CONFIG.api.baseUrl + endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getToken()}`
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error(`Error en POST ${endpoint}:`, error);
        throw error;
      }
    },

    // Iniciar sesión
    login: async function(email, password) {
      try {
        console.log('Iniciando sesión con:', email);
        
        if (!supabaseClient) {
          this.init();
        }
        
        if (!supabaseClient) {
          throw new Error('No se pudo inicializar el cliente de Supabase');
        }
        
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        
        console.log('Sesión iniciada correctamente');
        
        // Guardar token en localStorage
        localStorage.setItem('genia_auth_token', data.session.access_token);
        
        // Redirigir al dashboard
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
        
        return data;
      } catch (error) {
        console.error('Error de autenticación:', error);
        throw error;
      }
    },

    // Registrar usuario
    register: async function(userData) {
      try {
        console.log('Registrando usuario:', userData.email);
        
        if (!supabaseClient) {
          this.init();
        }
        
        if (!supabaseClient) {
          throw new Error('No se pudo inicializar el cliente de Supabase');
        }
        
        // Registrar usuario en Supabase
        const { data, error } = await supabaseClient.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              nombre: userData.nombre,
              negocio: userData.negocio,
              telefono: userData.telefono || ''
            }
          }
        });
        
        if (error) throw error;
        
        console.log('Usuario registrado correctamente');
        
        // Guardar token en localStorage si está disponible
        if (data.session) {
          localStorage.setItem('genia_auth_token', data.session.access_token);
        }
        
        // Redirigir al dashboard
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
        
        return data;
      } catch (error) {
        console.error('Error de registro:', error);
        throw error;
      }
    },

    // Cerrar sesión
    logout: async function() {
      try {
        if (!supabaseClient) {
          this.init();
        }
        
        if (!supabaseClient) {
          throw new Error('No se pudo inicializar el cliente de Supabase');
        }
        
        const { error } = await supabaseClient.auth.signOut();
        
        if (error) throw error;
        
        // Eliminar token de localStorage
        localStorage.removeItem('genia_auth_token');
        
        // Redirigir a la página de inicio
        window.location.href = '/';
        
        return true;
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
        throw error;
      }
    },

    // Obtener token de autenticación
    getToken: function() {
      return localStorage.getItem('genia_auth_token') || '';
    },

    // Verificar si el usuario está autenticado
    isAuthenticated: function() {
      return !!this.getToken();
    },

    // Obtener usuario actual
    getCurrentUser: async function() {
      try {
        if (!this.isAuthenticated()) {
          return null;
        }
        
        if (!supabaseClient) {
          this.init();
        }
        
        if (!supabaseClient) {
          throw new Error('No se pudo inicializar el cliente de Supabase');
        }
        
        const { data, error } = await supabaseClient.auth.getUser();
        
        if (error) throw error;
        
        return data.user;
      } catch (error) {
        console.error('Error al obtener usuario actual:', error);
        return null;
      }
    }
  };

  // Inicializar el cliente
  apiClient.init();

  // Exponer globalmente
  if (typeof window !== 'undefined') {
    window.apiClient = apiClient;
    console.log('API Client inicializado y disponible globalmente como window.apiClient');
  }

  // Soporte para módulos ES6
  if (typeof exports !== 'undefined') {
    exports.apiClient = apiClient;
  }
  
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { apiClient };
  }
})();
