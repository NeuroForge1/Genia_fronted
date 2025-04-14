/**
 * Implementación de compatibilidad para apiClient
 * Este archivo resuelve el problema "apiClient is not defined" en las páginas HTML tradicionales
 * redirigiendo las llamadas a la implementación de autenticación de Next.js con Supabase
 */

// Verificar si estamos en un entorno de navegador
(function(global) {
  // Configuración de Supabase
  const SUPABASE_URL = "https://axfcmtrhsvmtzqqhxwul.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4ZmNtdHJoc3ZtdHpxcWh4d3VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4MjA2MzksImV4cCI6MjA1OTM5NjYzOX0.F7X3QI2AL90Q-XZjWceSuW45vDMBjz7txTqge4lwxtQ";

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
      
      try {
        // Verificar si supabase está disponible
        let supabase;
        if (typeof global.supabase !== 'undefined') {
          supabase = global.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } else {
          console.log('Cargando Supabase desde CDN');
          // Cargar Supabase si no está disponible
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@supabase/supabase-js@2';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
          console.log('Supabase cargado correctamente');
          supabase = global.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
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
      } catch (error) {
        console.error('Error en apiClient.post:', error);
        throw error;
      }
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
