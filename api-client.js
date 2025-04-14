/**
 * Implementación de compatibilidad para apiClient
 * Este archivo resuelve el problema "apiClient is not defined" en las páginas HTML tradicionales
 * redirigiendo las llamadas a la implementación de autenticación de Next.js con Supabase
 */

import supabaseService from './services/supabaseService.js';

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
    
    // Manejar autenticación
    if (endpoint === '/auth/login') {
      try {
        const result = await supabaseService.signIn(data.email, data.password);
        console.log('Resultado de login con Supabase:', result);
        
        if (result.session) {
          // Redirigir al dashboard después de login exitoso
          window.location.href = '/dashboard';
          return {
            token: result.session.access_token,
            user: result.user
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
        const result = await supabaseService.signUp(data.email, data.password, {
          nombre: data.nombre,
          negocio: data.negocio,
          telefono: data.telefono
        });
        
        console.log('Resultado de registro con Supabase:', result);
        
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
window.apiClient = apiClient;

export default apiClient;
