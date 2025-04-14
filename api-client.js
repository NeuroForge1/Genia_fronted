/**
 * Implementación de compatibilidad para apiClient
 * Este archivo resuelve el problema "apiClient is not defined" en las páginas HTML tradicionales
 * redirigiendo las llamadas a la implementación de autenticación de Next.js con Supabase
 */

// Verificar si estamos en un entorno de navegador
(function(global) {
  // Importar configuración
  let GENIA_CONFIG;
  try {
    // Intentar importar como módulo ES6
    if (typeof require !== 'undefined') {
      GENIA_CONFIG = require('./config.js').GENIA_CONFIG;
    } else if (typeof window !== 'undefined' && window.GENIA_CONFIG) {
      // Usar configuración global si está disponible
      GENIA_CONFIG = window.GENIA_CONFIG;
    } else {
      // Configuración por defecto
      GENIA_CONFIG = {
        supabase: {
          url: "https://axfcmtrhsvmtzqqhxwul.supabase.co",
          anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4ZmNtdHJoc3ZtdHpxcWh4d3VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4MjA2MzksImV4cCI6MjA1OTM5NjYzOX0.F7X3QI2AL90Q-XZjWceSuW45vDMBjz7txTqge4lwxtQ"
        }
      };
    }
  } catch (e) {
    console.warn('Error al cargar configuración:', e);
    // Configuración por defecto
    GENIA_CONFIG = {
      supabase: {
        url: "https://axfcmtrhsvmtzqqhxwul.supabase.co",
        anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4ZmNtdHJoc3ZtdHpxcWh4d3VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4MjA2MzksImV4cCI6MjA1OTM5NjYzOX0.F7X3QI2AL90Q-XZjWceSuW45vDMBjz7txTqge4lwxtQ"
      }
    };
  }

  // Implementación del cliente API para compatibilidad con páginas HTML tradicionales
  const apiClient = {
    /**
     * Realiza una solicitud POST
     * @param {string} endpoint - Ruta del endpoint
     * @param {Object} data - Datos a enviar en el cuerpo de la solicitud
     * @returns {Promise} - Promesa con la respuesta
     */
    post: async (endpoint, data) => {
      console.log('apiClient.post llamado con endpoint:', endpoint);
      
      // Verificar si tenemos acceso a Supabase
      let supabase;
      try {
        if (typeof global.supabase !== 'undefined') {
          supabase = global.supabase.createClient(
            GENIA_CONFIG.supabase.url,
            GENIA_CONFIG.supabase.anonKey
          );
        } else {
          console.error('Supabase no está disponible');
          throw new Error('Supabase no está disponible');
        }
      } catch (error) {
        console.error('Error al inicializar Supabase:', error);
        throw error;
      }
      
      // Manejar autenticación
      if (endpoint === '/auth/login') {
        try {
          const { data: authData, error } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password
          });
          
          console.log('Resultado de login con Supabase:', authData);
          
          if (error) throw error;
          
          if (authData && authData.session) {
            // Guardar token en localStorage
            localStorage.setItem('genia_token', authData.session.access_token);
            localStorage.setItem('genia_user', JSON.stringify(authData.user));
            
            // Redirigir al dashboard después de login exitoso
            window.location.href = '/dashboard';
            return {
              token: authData.session.access_token,
              user: authData.user
            };
          } else {
            throw new Error('Error de autenticación');
          }
        } catch (error) {
          console.error('Error en login con Supabase:', error);
          throw error;
        }
      } 
      // Manejar registro
      else if (endpoint === '/api/users/register') {
        try {
          const { data: authData, error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
              data: {
                nombre: data.nombre,
                negocio: data.negocio,
                telefono: data.telefono
              }
            }
          });
          
          console.log('Resultado de registro con Supabase:', authData);
          
          if (error) throw error;
          
          // Redirigir al dashboard o página de confirmación después de registro exitoso
          window.location.href = '/dashboard';
          return { status: 'success' };
        } catch (error) {
          console.error('Error en registro con Supabase:', error);
          
          // Manejar errores específicos
          if (error.message && error.message.includes('already registered')) {
            throw {
              status: 400,
              data: { detail: 'El email ya está registrado' }
            };
          }
          
          throw error;
        }
      }
      
      // Para otros endpoints, implementar según sea necesario
      console.error('Endpoint no implementado:', endpoint);
      return Promise.reject(new Error('Endpoint no implementado'));
    },
    
    /**
     * Realiza una solicitud GET
     * @param {string} endpoint - Ruta del endpoint
     * @returns {Promise} - Promesa con la respuesta
     */
    get: async (endpoint) => {
      console.log('apiClient.get llamado con endpoint:', endpoint);
      
      // Implementar según sea necesario
      console.error('Endpoint GET no implementado:', endpoint);
      return Promise.reject(new Error('Endpoint GET no implementado'));
    }
  };

  // Exponer globalmente para los archivos HTML
  if (typeof window !== 'undefined') {
    window.apiClient = apiClient;
  }
  
  // Exponer como módulo CommonJS
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = apiClient;
  }
  
  // Exponer como módulo ES6
  if (typeof exports !== 'undefined') {
    exports.default = apiClient;
  }
  
})(typeof window !== 'undefined' ? window : global);
