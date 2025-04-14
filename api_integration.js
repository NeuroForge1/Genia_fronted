// Inicialización del objeto geniaApi
window.geniaApi = window.geniaApi || {};

// Configuración básica de la API
geniaApi.config = {
  baseUrl: 'https://genia-backend.onrender.com',
  version: 'v1',
  timeout: 30000
};

// Funciones de autenticación
geniaApi.auth = {
  // Registrar un nuevo usuario
  async register(userData) {
    try {
      const response = await fetch(`${geniaApi.config.baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en el registro');
      }
      
      const data = await response.json();
      
      // Guardar token en localStorage
      if (data.token) {
        localStorage.setItem('genia_token', data.token);
        localStorage.setItem('genia_user', JSON.stringify(data.user));
      }
      
      return {
        success: true,
        user: data.user,
        token: data.token
      };
    } catch (error) {
      console.error('Error en registro:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },
  
  // Iniciar sesión
  async login(email, password) {
    try {
      const response = await fetch(`${geniaApi.config.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en el inicio de sesión');
      }
      
      const data = await response.json();
      
      // Guardar token en localStorage
      if (data.token) {
        localStorage.setItem('genia_token', data.token);
        localStorage.setItem('genia_user', JSON.stringify(data.user));
      }
      
      return {
        success: true,
        user: data.user,
        token: data.token
      };
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },
  
  // Cerrar sesión
  logout() {
    localStorage.removeItem('genia_token');
    localStorage.removeItem('genia_user');
    window.location.href = '/index.html';
  },
  
  // Verificar si el usuario está autenticado
  isAuthenticated() {
    return !!localStorage.getItem('genia_token');
  },
  
  // Obtener el token actual
  getToken() {
    return localStorage.getItem('genia_token');
  },
  
  // Obtener el usuario actual
  getCurrentUser() {
    const userStr = localStorage.getItem('genia_user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

// Funciones para gestionar usuarios
geniaApi.users = {
  // Obtener perfil del usuario
  async getProfile() {
    try {
      const token = geniaApi.auth.getToken();
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch(`${geniaApi.config.baseUrl}/users/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener perfil');
      }
      
      const data = await response.json();
      return {
        success: true,
        profile: data
      };
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },
  
  // Actualizar perfil del usuario
  async updateProfile(profileData) {
    try {
      const token = geniaApi.auth.getToken();
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch(`${geniaApi.config.baseUrl}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar perfil');
      }
      
      const data = await response.json();
      
      // Actualizar usuario en localStorage
      localStorage.setItem('genia_user', JSON.stringify(data));
      
      return {
        success: true,
        profile: data
      };
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
};

// Funciones para gestionar créditos
geniaApi.credits = {
  // Obtener créditos del usuario
  async getCredits() {
    try {
      const token = geniaApi.auth.getToken();
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch(`${geniaApi.config.baseUrl}/credits`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener créditos');
      }
      
      const data = await response.json();
      return {
        success: true,
        credits: data.credits,
        plan: data.plan
      };
    } catch (error) {
      console.error('Error al obtener créditos:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },
  
  // Usar créditos
  async useCredits(amount, description) {
    try {
      const token = geniaApi.auth.getToken();
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch(`${geniaApi.config.baseUrl}/credits/use`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount, description })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al usar créditos');
      }
      
      const data = await response.json();
      return {
        success: true,
        remainingCredits: data.remainingCredits
      };
    } catch (error) {
      console.error('Error al usar créditos:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
};

// Funciones para gestionar clones
geniaApi.clones = {
  // Obtener todos los clones disponibles
  async getClones() {
    try {
      const token = geniaApi.auth.getToken();
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch(`${geniaApi.config.baseUrl}/clones`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener clones');
      }
      
      const data = await response.json();
      return {
        success: true,
        clones: data
      };
    } catch (error) {
      console.error('Error al obtener clones:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },
  
  // Obtener un clon específico
  async getClone(cloneId) {
    try {
      const token = geniaApi.auth.getToken();
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch(`${geniaApi.config.baseUrl}/clones/${cloneId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener clon');
      }
      
      const data = await response.json();
      return {
        success: true,
        clone: data
      };
    } catch (error) {
      console.error('Error al obtener clon:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
};

// Funciones para gestionar tareas
geniaApi.tasks = {
  // Crear una nueva tarea
  async createTask(taskData) {
    try {
      const token = geniaApi.auth.getToken();
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch(`${geniaApi.config.baseUrl}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear tarea');
      }
      
      const data = await response.json();
      return {
        success: true,
        task: data
      };
    } catch (error) {
      console.error('Error al crear tarea:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },
  
  // Obtener todas las tareas del usuario
  async getTasks() {
    try {
      const token = geniaApi.auth.getToken();
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch(`${geniaApi.config.baseUrl}/tasks`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener tareas');
      }
      
      const data = await response.json();
      return {
        success: true,
        tasks: data
      };
    } catch (error) {
      console.error('Error al obtener tareas:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },
  
  // Obtener una tarea específica
  async getTask(taskId) {
    try {
      const token = geniaApi.auth.getToken();
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch(`${geniaApi.config.baseUrl}/tasks/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener tarea');
      }
      
      const data = await response.json();
      return {
        success: true,
        task: data
      };
    } catch (error) {
      console.error('Error al obtener tarea:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },
  
  // Actualizar una tarea
  async updateTask(taskId, taskData) {
    try {
      const token = geniaApi.auth.getToken();
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch(`${geniaApi.config.baseUrl}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar tarea');
      }
      
      const data = await response.json();
      return {
        success: true,
        task: data
      };
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },
  
  // Eliminar una tarea
  async deleteTask(taskId) {
    try {
      const token = geniaApi.auth.getToken();
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch(`${geniaApi.config.baseUrl}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar tarea');
      }
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
};

// Funciones de utilidad
geniaApi.utils = {
  // Formatear fecha
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },
  
  // Formatear número con separador de miles
  formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  },
  
  // Validar email
  validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
};

// Exportar el objeto geniaApi globalmente
window.geniaApi = geniaApi;

console.log('API de GENIA inicializada correctamente');
