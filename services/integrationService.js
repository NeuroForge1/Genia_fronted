import apiClient from './api.js';

/**
 * Servicio para gestionar integraciones con herramientas externas
 */
const integrationService = {
  /**
   * Obtener todas las integraciones de un usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise} - Promesa con la lista de integraciones
   */
  async getUserIntegrations(userId) {
    return apiClient.get(`/api/integrations/user/${userId}`);
  },

  /**
   * Obtener una integración específica
   * @param {string} userId - ID del usuario
   * @param {string} platform - Plataforma de la integración
   * @returns {Promise} - Promesa con los datos de la integración
   */
  async getIntegration(userId, platform) {
    return apiClient.get(`/api/integrations/user/${userId}/platform/${platform}`);
  },

  /**
   * Iniciar flujo OAuth para una plataforma
   * @param {string} platform - Plataforma a integrar
   * @param {string} redirectUri - URI de redirección
   * @returns {string} - URL de autorización
   */
  initiateOAuth(platform, redirectUri) {
    // Configuración de OAuth para cada plataforma
    const oauthConfig = {
      instagram: {
        authUrl: 'https://api.instagram.com/oauth/authorize',
        clientId: process.env.REACT_APP_INSTAGRAM_CLIENT_ID,
        scope: 'user_profile,user_media',
      },
      facebook: {
        authUrl: 'https://www.facebook.com/v16.0/dialog/oauth',
        clientId: process.env.REACT_APP_FACEBOOK_CLIENT_ID,
        scope: 'pages_show_list,pages_read_engagement,pages_manage_posts',
      },
      // Otras plataformas...
    };

    // Verificar si la plataforma está soportada
    if (!oauthConfig[platform]) {
      throw new Error(`Plataforma no soportada: ${platform}`);
    }

    // Generar estado para prevenir CSRF
    const state = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('oauth_state', state);
    localStorage.setItem('oauth_platform', platform);

    // Construir URL de autorización
    const config = oauthConfig[platform];
    const authUrl = new URL(config.authUrl);
    authUrl.searchParams.append('client_id', config.clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('state', state);
    
    if (config.scope) {
      authUrl.searchParams.append('scope', config.scope);
    }

    return authUrl.toString();
  },

  /**
   * Completar flujo OAuth después de la redirección
   * @param {string} userId - ID del usuario
   * @param {string} platform - Plataforma de la integración
   * @param {string} code - Código de autorización
   * @param {string} redirectUri - URI de redirección
   * @returns {Promise} - Promesa con el resultado de la integración
   */
  async completeOAuth(userId, platform, code, redirectUri) {
    return apiClient.post('/api/integrations/oauth/complete', {
      userId,
      platform,
      code,
      redirectUri
    });
  },

  /**
   * Desconectar una integración
   * @param {string} userId - ID del usuario
   * @param {string} platform - Plataforma de la integración
   * @returns {Promise} - Promesa con el resultado de la desconexión
   */
  async disconnectIntegration(userId, platform) {
    return apiClient.post(`/api/integrations/user/${userId}/platform/${platform}/disconnect`);
  },

  /**
   * Ejecutar una acción en una plataforma externa
   * @param {string} userId - ID del usuario
   * @param {string} platform - Plataforma de la integración
   * @param {string} action - Acción a ejecutar
   * @param {Object} params - Parámetros de la acción
   * @returns {Promise} - Promesa con el resultado de la acción
   */
  async executeAction(userId, platform, action, params) {
    return apiClient.post(`/api/integrations/user/${userId}/platform/${platform}/action`, {
      action,
      params
    });
  }
};

export default integrationService;