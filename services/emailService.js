// Email Service para GENIA
// Este archivo maneja el envío de correos electrónicos a través de la API del backend

// Servicio de correo electrónico
const emailService = {
  // Enviar correo de bienvenida
  async sendWelcomeEmail(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/email/welcome`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
        },
        body: JSON.stringify({
          email: userData.email,
          name: userData.name,
          business_type: userData.business_type
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error al enviar correo de bienvenida: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al enviar correo de bienvenida:', error);
      throw error;
    }
  },
  
  // Enviar correo de recuperación de contraseña
  async sendPasswordResetEmail(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/email/password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      if (!response.ok) {
        throw new Error(`Error al enviar correo de recuperación: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al enviar correo de recuperación:', error);
      throw error;
    }
  },
  
  // Enviar correo de notificación
  async sendNotificationEmail(userId, subject, message) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/email/notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
        },
        body: JSON.stringify({
          userId,
          subject,
          message
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error al enviar correo de notificación: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al enviar correo de notificación:', error);
      throw error;
    }
  }
};

// Agregar el servicio de correo al objeto geniaApi
if (typeof geniaApi !== 'undefined') {
  geniaApi.email = emailService;
} else {
  console.error('Error: geniaApi no está definido. No se puede agregar el servicio de correo.');
}
