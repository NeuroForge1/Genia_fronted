// Integración con Supabase para autenticación
// Este archivo maneja la autenticación directa con Supabase

// Importar la biblioteca de Supabase (cargada desde CDN en el HTML)
const supabase = window.supabaseClient;

// Asegurarse de que geniaApi esté definido
window.geniaApi = window.geniaApi || {};

// Implementar funciones de autenticación con Supabase
geniaApi.supabaseAuth = {
  // Iniciar sesión con Google
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
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
      const { data, error } = await supabase.auth.signUp({
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
      
      // Enviar correo de bienvenida
      if (data.user && geniaApi.emailService) {
        geniaApi.emailService.sendWelcomeEmail(data.user.email, userData.fullName);
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
  },
  
  // Iniciar sesión
  async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
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
      console.error('Error en login con Supabase:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },
  
  // Cerrar sesión
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Limpiar información del usuario en localStorage
      localStorage.removeItem('genia_user');
      localStorage.removeItem('genia_session');
      
      // Redirigir a la página principal
      window.location.href = '/index.html';
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Error en logout con Supabase:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },
  
  // Verificar si el usuario está autenticado
  isAuthenticated() {
    return !!localStorage.getItem('genia_session');
  },
  
  // Obtener el usuario actual
  getCurrentUser() {
    const userStr = localStorage.getItem('genia_user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  // Obtener la sesión actual
  getCurrentSession() {
    const sessionStr = localStorage.getItem('genia_session');
    return sessionStr ? JSON.parse(sessionStr) : null;
  },
  
  // Actualizar perfil del usuario
  async updateProfile(userData) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: userData
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Actualizar información del usuario en localStorage
      if (data.user) {
        localStorage.setItem('genia_user', JSON.stringify(data.user));
      }
      
      return {
        success: true,
        user: data.user
      };
    } catch (error) {
      console.error('Error al actualizar perfil con Supabase:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },
  
  // Restablecer contraseña
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password.html'
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Error al restablecer contraseña con Supabase:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
};

// Agregar las funciones de autenticación de Supabase al objeto geniaApi
if (typeof geniaApi !== 'undefined') {
  // Reemplazar las funciones de autenticación existentes con las de Supabase
  geniaApi.auth = geniaApi.supabaseAuth;
  console.log('Autenticación con Supabase inicializada correctamente');
} else {
  console.error('Error: geniaApi no está definido. No se puede agregar la autenticación con Supabase.');
}

// Verificar si el usuario está autenticado y redirigir según corresponda
document.addEventListener('DOMContentLoaded', function() {
  // Si estamos en la página de login o registro y el usuario ya está autenticado, redirigir al dashboard
  if ((window.location.pathname === '/index.html' || window.location.pathname === '/login.html' || window.location.pathname === '/') && geniaApi.auth.isAuthenticated()) {
    window.location.href = '/dashboard.html';
  }
  
  // Si estamos en el dashboard o páginas protegidas y el usuario no está autenticado, redirigir al login
  if ((window.location.pathname === '/dashboard.html' || window.location.pathname.includes('/clones/')) && !geniaApi.auth.isAuthenticated()) {
    window.location.href = '/login.html';
  }
});

// Manejar el formulario de registro en la página principal
if (document.querySelector('form')) {
  document.querySelector('form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const fullName = document.querySelector('input[placeholder="Tu nombre completo"]').value;
    const email = document.querySelector('input[placeholder="Tu correo electrónico"]').value;
    const businessType = document.querySelector('input[placeholder="¿Qué vendes? (opcional)"]').value;
    
    // Generar una contraseña aleatoria para el registro inicial
    const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    
    // Mostrar mensaje de carga
    const submitButton = document.querySelector('button');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Procesando...';
    submitButton.disabled = true;
    
    try {
      // Registrar usuario con Supabase
      const result = await geniaApi.auth.register(email, password, {
        fullName,
        businessType
      });
      
      if (result.success) {
        // Redirigir al dashboard
        window.location.href = '/dashboard.html';
      } else {
        // Mostrar mensaje de error
        alert('Error al registrar: ' + result.message);
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
      }
    } catch (error) {
      console.error('Error en el proceso de registro:', error);
      alert('Error al registrar: ' + error.message);
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    }
  });
}
