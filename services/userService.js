import apiClient from './api.js';

/**
 * Servicio para gestionar usuarios
 */
const userService = {
  /**
   * Obtener todos los usuarios
   * @returns {Promise} - Promesa con la lista de usuarios
   */
  async getUsers() {
    return apiClient.get('/api/users');
  },

  /**
   * Obtener un usuario por ID
   * @param {string} userId - ID del usuario
   * @returns {Promise} - Promesa con los datos del usuario
   */
  async getUserById(userId) {
    return apiClient.get(`/api/users/${userId}`);
  },

  /**
   * Crear un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise} - Promesa con el usuario creado
   */
  async createUser(userData) {
    return apiClient.post('/api/users', userData);
  },

  /**
   * Actualizar un usuario
   * @param {string} userId - ID del usuario
   * @param {Object} userData - Datos actualizados del usuario
   * @returns {Promise} - Promesa con el usuario actualizado
   */
  async updateUser(userId, userData) {
    return apiClient.put(`/api/users/${userId}`, userData);
  },

  /**
   * Eliminar un usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise} - Promesa con el resultado de la eliminación
   */
  async deleteUser(userId) {
    return apiClient.delete(`/api/users/${userId}`);
  },

  /**
   * Obtener usuarios pendientes de aprobación
   * @returns {Promise} - Promesa con la lista de usuarios pendientes
   */
  async getPendingUsers() {
    return apiClient.get('/api/users/pending');
  },

  /**
   * Aprobar un usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise} - Promesa con el resultado de la aprobación
   */
  async approveUser(userId) {
    return apiClient.post(`/api/users/${userId}/approve`);
  },

  /**
   * Rechazar un usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise} - Promesa con el resultado del rechazo
   */
  async rejectUser(userId) {
    return apiClient.post(`/api/users/${userId}/reject`);
  },

  /**
   * Obtener estadísticas de usuarios
   * @returns {Promise} - Promesa con las estadísticas
   */
  async getUserStats() {
    return apiClient.get('/api/users/stats');
  }
};

export default userService;