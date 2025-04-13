import apiClient from './api.js';
import supabaseService from './supabaseService.js';

/**
 * Servicio para integración con backend y verificación de conexión
 */
const integrationService = {
  /**
   * Verificar conexión con el backend
   * @returns {Promise} - Promesa con el estado de la conexión
   */
  async checkBackendConnection() {
    try {
      const response = await apiClient.get('/health');
      return {
        status: 'success',
        message: 'Conexión con backend establecida correctamente',
        data: response
      };
    } catch (error) {
      console.error('Error al verificar conexión con backend:', error);
      return {
        status: 'error',
        message: 'No se pudo establecer conexión con el backend',
        error: error
      };
    }
  },

  /**
   * Verificar conexión con Supabase
   * @returns {Promise} - Promesa con el estado de la conexión
   */
  async checkSupabaseConnection() {
    try {
      const supabase = supabaseService.getClient();
      const { data, error } = await supabase.from('health_check').select('*').limit(1);
      
      if (error) throw error;
      
      return {
        status: 'success',
        message: 'Conexión con Supabase establecida correctamente',
        data: data
      };
    } catch (error) {
      console.error('Error al verificar conexión con Supabase:', error);
      return {
        status: 'error',
        message: 'No se pudo establecer conexión con Supabase',
        error: error
      };
    }
  },

  /**
   * Sincronizar usuario entre Supabase y backend
   * @param {string} userId - ID del usuario en Supabase
   * @param {Object} userData - Datos del usuario
   * @returns {Promise} - Promesa con el resultado de la sincronización
   */
  async syncUserWithBackend(userId, userData) {
    try {
      const response = await apiClient.post('/users/sync', {
        supabase_id: userId,
        ...userData
      });
      
      return {
        status: 'success',
        message: 'Usuario sincronizado correctamente',
        data: response
      };
    } catch (error) {
      console.error('Error al sincronizar usuario con backend:', error);
      return {
        status: 'error',
        message: 'No se pudo sincronizar el usuario con el backend',
        error: error
      };
    }
  },

  /**
   * Verificar todas las conexiones e integraciones
   * @returns {Promise} - Promesa con el estado de todas las conexiones
   */
  async checkAllConnections() {
    const results = {
      backend: await this.checkBackendConnection(),
      supabase: await this.checkSupabaseConnection()
    };
    
    return {
      status: Object.values(results).every(r => r.status === 'success') ? 'success' : 'error',
      message: 'Verificación de conexiones completada',
      results: results
    };
  }
};

export default integrationService;
