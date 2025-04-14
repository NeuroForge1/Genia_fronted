// API Integration para GENIA
// Este archivo conecta el frontend con el backend utilizando las rutas API correctas

// URL base del backend
const API_BASE_URL = 'https://genia-backend.onrender.com';

// Cliente API para realizar llamadas al backend
const geniaApi = {
  // Función para realizar solicitudes GET
  async get(endpoint) {
    try {
      // Asegurarse de que el endpoint comience con /api/ si es necesario
      const url = endpoint.startsWith('/api/') 
        ? `${API_BASE_URL}${endpoint}` 
        : `${API_BASE_URL}/api${endpoint}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en la solicitud GET:', error);
      throw error;
    }
  },
  
  // Función para realizar solicitudes POST
  async post(endpoint, data) {
    try {
      // Asegurarse de que el endpoint comience con /api/ si es necesario
      const url = endpoint.startsWith('/api/') 
        ? `${API_BASE_URL}${endpoint}` 
        : `${API_BASE_URL}/api${endpoint}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en la solicitud POST:', error);
      throw error;
    }
  },
  
  // Servicios de autenticación
  auth: {
    // Iniciar sesión
    async login(email, password) {
      try {
        const data = await geniaApi.post('/api/auth/login', { email, password });
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        return data;
      } catch (error) {
        console.error('Error en login:', error);
        throw error;
      }
    },
    
    // Cerrar sesión
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    },
    
    // Registrar nuevo usuario
    async register(email, password, userData) {
      try {
        const data = await geniaApi.post('/api/auth/register', { email, password, ...userData });
        return { success: true, data };
      } catch (error) {
        console.error('Error en registro:', error);
        return { success: false, message: error.message };
      }
    },
    
    // Iniciar sesión con Google
    async signInWithGoogle() {
      try {
        // Redireccionar a la página de autenticación de Google
        window.location.href = `${API_BASE_URL}/api/auth/google`;
        return { success: true };
      } catch (error) {
        console.error('Error en inicio de sesión con Google:', error);
        return { success: false, message: error.message };
      }
    },
    
    // Obtener usuario actual
    getCurrentUser() {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    },
    
    // Verificar si el usuario está autenticado
    isAuthenticated() {
      return !!localStorage.getItem('token');
    }
  },
  
  // Servicios de usuario
  users: {
    // Obtener todos los usuarios
    async getAll() {
      return await geniaApi.get('/api/users');
    },
    
    // Obtener usuario por ID
    async getById(userId) {
      return await geniaApi.get(`/api/users/${userId}`);
    },
    
    // Obtener usuarios pendientes
    async getPending() {
      return await geniaApi.get('/api/users/pending');
    },
    
    // Aprobar usuario
    async approve(userId) {
      return await geniaApi.post(`/api/users/${userId}/approve`);
    },
    
    // Rechazar usuario
    async reject(userId) {
      return await geniaApi.post(`/api/users/${userId}/reject`);
    },
    
    // Obtener estadísticas de usuarios
    async getStats() {
      return await geniaApi.get('/api/users/stats');
    }
  },
  
  // Servicios del MCP (Motor Central de Procesamiento)
  mcp: {
    // Ejecutar acción en el MCP
    async executeAction(action, params) {
      return await geniaApi.post('/api/mcp/actions', { action, params });
    },
    
    // Obtener historial de acciones
    async getActionHistory(userId) {
      return await geniaApi.get(`/api/mcp/actions/history/${userId}`);
    },
    
    // Procesar comando de voz
    async processVoiceCommand(audioData, userId) {
      const formData = new FormData();
      formData.append('audio', audioData);
      formData.append('userId', userId);
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/mcp/voice-command`, {
          method: 'POST',
          headers: {
            'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
          },
          body: formData
        });
        
        if (!response.ok) {
          throw new Error(`Error en la solicitud: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error al procesar comando de voz:', error);
        throw error;
      }
    }
  },
  
  // Servicios de integración
  integrations: {
    // Obtener integraciones disponibles
    async getAvailable() {
      return await geniaApi.get('/api/integrations/available');
    },
    
    // Obtener integraciones de un usuario
    async getUserIntegrations(userId) {
      return await geniaApi.get(`/api/integrations/user/${userId}`);
    },
    
    // Conectar una integración
    async connect(userId, platform, authData) {
      return await geniaApi.post(`/api/integrations/user/${userId}/platform/${platform}/connect`, authData);
    },
    
    // Desconectar una integración
    async disconnect(userId, platform) {
      return await geniaApi.post(`/api/integrations/user/${userId}/platform/${platform}/disconnect`);
    }
  }
};

// Exportar el cliente API
window.geniaApi = geniaApi;
