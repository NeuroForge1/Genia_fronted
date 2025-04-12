import apiClient from './api.js';

/**
 * Servicio para el Motor Central de Procesamiento (MCP)
 */
const mcpService = {
  /**
   * Procesar una acción del MCP
   * @param {Object} actionData - Datos de la acción
   * @returns {Promise} - Promesa con el resultado de la acción
   */
  async processAction(actionData) {
    return apiClient.post('/api/mcp/actions', actionData);
  },

  /**
   * Obtener historial de acciones
   * @param {Object} filters - Filtros para el historial
   * @returns {Promise} - Promesa con el historial de acciones
   */
  async getActionHistory(filters = {}) {
    return apiClient.get('/api/mcp/actions/history', { params: filters });
  },

  /**
   * Generar contenido con el MCP
   * @param {Object} contentRequest - Datos para la generación de contenido
   * @returns {Promise} - Promesa con el contenido generado
   */
  async generateContent(contentRequest) {
    return apiClient.post('/api/mcp/content/generate', contentRequest);
  },

  /**
   * Crear un embudo de ventas
   * @param {Object} funnelData - Datos del embudo
   * @returns {Promise} - Promesa con el embudo creado
   */
  async createFunnel(funnelData) {
    return apiClient.post('/api/mcp/funnels', funnelData);
  },

  /**
   * Obtener estado del MCP
   * @returns {Promise} - Promesa con el estado del MCP
   */
  async getStatus() {
    return apiClient.get('/api/mcp/status');
  }
};

export default mcpService;