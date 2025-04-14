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
  
  // Integración con Supabase para autenticación
  supabaseAuth: {
    // Iniciar sesión con Google
    async signInWithGoogle() {
      try {
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin + '/dashboard.html'
          }
        });
        
        if (error) {
          throw new Error(error.message);
        }
        
        return {
          success: true
        };
      } catch (error) {
        console.error('Error en inicio de sesión con Google:', error);
        return {
          success: false,
          message: error.message
        };
      }
    },
    
    // Registrar un nuevo usuario
    async register(email, password, userData) {
      try {
        // Registrar usuario en Supabase
        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: userData.fullName,
              business_type: userData.businessType || '',
              plan: 'free_trial',
              credits: 100 // Créditos iniciales para el periodo de prueba
            }
          }
        });
        
        if (error) {
          throw new Error(error.message);
        }
        
        // Guardar información del usuario en localStorage
        if (data.user) {
          localStorage.setItem('genia_user', JSON.stringify(data.user));
          localStorage.setItem('genia_session', JSON.stringify(data.session));
        }
        
        return {
          success: true,
          user: data.user,
          session: data.session
        };
      } catch (error) {
        console.error('Error en registro con Supabase:', error);
        return {
          success: false,
          message: error.message
        };
      }
    }
  },
  
  // Servicio de correo electrónico
  email: {
    // Enviar correo de bienvenida
    async sendWelcomeEmail(userData) {
      try {
        const data = await geniaApi.post('/api/email/welcome', userData);
        return { success: true, data };
      } catch (error) {
        console.error('Error al enviar correo de bienvenida:', error);
        return { success: false, message: error.message };
      }
    },
    
    // Enviar correo de recuperación de contraseña
    async sendPasswordRecoveryEmail(email) {
      try {
        const data = await geniaApi.post('/api/email/password-recovery', { email });
        return { success: true, data };
      } catch (error) {
        console.error('Error al enviar correo de recuperación:', error);
        return { success: false, message: error.message };
      }
    }
  }
};

// Exportar el cliente API
window.geniaApi = geniaApi;
