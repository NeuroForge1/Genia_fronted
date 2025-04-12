/**
 * API Client para GENIA
 * Configuración centralizada para todas las llamadas a la API del backend
 */

// URL base del backend
const API_BASE_URL = 'https://genia-backend.onrender.com';

// Opciones por defecto para fetch
const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Cliente API para realizar llamadas al backend
 */
const apiClient = {
  /**
   * Realiza una solicitud GET
   * @param {string} endpoint - Ruta del endpoint (debe incluir /api/ si es necesario)
   * @param {Object} options - Opciones adicionales para fetch
   * @returns {Promise} - Promesa con la respuesta
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'GET',
    });
  },

  /**
   * Realiza una solicitud POST
   * @param {string} endpoint - Ruta del endpoint (debe incluir /api/ si es necesario)
   * @param {Object} data - Datos a enviar en el cuerpo de la solicitud
   * @param {Object} options - Opciones adicionales para fetch
   * @returns {Promise} - Promesa con la respuesta
   */
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Realiza una solicitud PUT
   * @param {string} endpoint - Ruta del endpoint (debe incluir /api/ si es necesario)
   * @param {Object} data - Datos a enviar en el cuerpo de la solicitud
   * @param {Object} options - Opciones adicionales para fetch
   * @returns {Promise} - Promesa con la respuesta
   */
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Realiza una solicitud DELETE
   * @param {string} endpoint - Ruta del endpoint (debe incluir /api/ si es necesario)
   * @param {Object} options - Opciones adicionales para fetch
   * @returns {Promise} - Promesa con la respuesta
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'DELETE',
    });
  },

  /**
   * Método base para realizar solicitudes
   * @param {string} endpoint - Ruta del endpoint
   * @param {Object} options - Opciones para fetch
   * @returns {Promise} - Promesa con la respuesta
   */
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const requestOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    // Añadir token de autenticación si existe
    const token = localStorage.getItem('genia_token');
    if (token) {
      requestOptions.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, requestOptions);
      
      // Manejar errores HTTP
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          status: response.status,
          statusText: response.statusText,
          data: errorData,
        };
      }
      
      // Verificar si la respuesta está vacía
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }
};

export default apiClient;