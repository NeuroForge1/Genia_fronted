// Email Service para GENIA con integración de Brevo
// Este archivo maneja el envío de correos electrónicos a través de Brevo SMTP

// Credenciales de Brevo SMTP desde la documentación
const BREVO_SMTP_HOST = 'smtp-relay.brevo.com';
const BREVO_SMTP_PORT = 587;
const BREVO_SMTP_USER = '8a2c1a001@smtp-brevo.com';
const BREVO_SMTP_PASS = 'f0h8ELCZnH32sWcF';
const BREVO_FROM_EMAIL = 'notificaciones@genia.app';
const BREVO_FROM_NAME = 'GENIA';

// Servicio de correo electrónico con Brevo
const emailService = {
  // Enviar correo de bienvenida
  async sendWelcomeEmail(userData) {
    try {
      console.log('Enviando correo de bienvenida a:', userData.email);
      
      // En el frontend, enviamos la solicitud al backend para que maneje el envío SMTP
      const response = await fetch('/api/email/welcome', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
        },
        body: JSON.stringify({
          email: userData.email,
          name: userData.name || '',
          business_type: userData.business_type || ''
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Error al enviar correo de bienvenida: ${errorData.message || response.status}`);
      }
      
      console.log('Correo de bienvenida enviado correctamente');
      return await response.json();
    } catch (error) {
      console.error('Error al enviar correo de bienvenida:', error);
      
      // En desarrollo, simulamos un envío exitoso para no bloquear el flujo
      if (window.ENV && window.ENV.DEBUG_MODE) {
        console.log('Modo debug: Simulando envío de correo exitoso');
        
        // Mostrar en consola cómo se vería el correo
        console.log('----------- SIMULACIÓN DE CORREO -----------');
        console.log('De: GENIA <notificaciones@genia.app>');
        console.log(`Para: ${userData.email}`);
        console.log('Asunto: ¡Bienvenido a GENIA! Tu sistema de crecimiento con IA');
        console.log('Contenido:');
        console.log(`Hola ${userData.name || 'usuario'},\n`);
        console.log('¡Bienvenido a GENIA, tu sistema de crecimiento automatizado con IA!\n');
        console.log('Tu cuenta ha sido activada y tienes acceso a todos los clones de IA durante tu periodo de prueba de 7 días.\n');
        console.log('Para comenzar, inicia sesión en tu cuenta y explora todas las funcionalidades que GENIA tiene para ti.\n');
        console.log('Si tienes alguna pregunta, no dudes en contactarnos respondiendo a este correo.\n');
        console.log('¡Gracias por unirte a GENIA!\n');
        console.log('El equipo de GENIA');
        console.log('----------------------------------------');
        
        return { 
          success: true, 
          message: 'Correo simulado enviado correctamente',
          simulatedEmail: true
        };
      }
      
      // Si no estamos en modo debug, propagamos el error
      throw error;
    }
  },
  
  // Enviar correo de recuperación de contraseña
  async sendPasswordResetEmail(email) {
    try {
      // Generar token de recuperación (en producción, esto se haría en el backend)
      const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      const response = await fetch('/api/email/password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email,
          resetToken
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Error al enviar correo de recuperación: ${errorData.message || response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al enviar correo de recuperación:', error);
      
      // En desarrollo, simulamos un envío exitoso
      if (window.ENV && window.ENV.DEBUG_MODE) {
        console.log('Modo debug: Simulando envío de correo de recuperación');
        return { 
          success: true, 
          message: 'Correo de recuperación simulado enviado correctamente',
          simulatedEmail: true
        };
      }
      
      throw error;
    }
  },
  
  // Enviar correo de notificación
  async sendNotificationEmail(userData, subject, message) {
    try {
      const response = await fetch('/api/email/notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
        },
        body: JSON.stringify({
          email: userData.email,
          name: userData.name || '',
          subject,
          message
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Error al enviar correo de notificación: ${errorData.message || response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al enviar correo de notificación:', error);
      
      // En desarrollo, simulamos un envío exitoso
      if (window.ENV && window.ENV.DEBUG_MODE) {
        console.log('Modo debug: Simulando envío de correo de notificación');
        console.log(`Asunto: ${subject}`);
        console.log(`Mensaje: ${message}`);
        return { 
          success: true, 
          message: 'Correo de notificación simulado enviado correctamente',
          simulatedEmail: true
        };
      }
      
      throw error;
    }
  },
  
  // Enviar correo de fin de prueba
  async sendTrialEndingEmail(userData, daysLeft) {
    try {
      const response = await fetch('/api/email/trial-ending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
        },
        body: JSON.stringify({
          email: userData.email,
          name: userData.name || '',
          daysLeft
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Error al enviar correo de fin de prueba: ${errorData.message || response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al enviar correo de fin de prueba:', error);
      
      // En desarrollo, simulamos un envío exitoso
      if (window.ENV && window.ENV.DEBUG_MODE) {
        console.log('Modo debug: Simulando envío de correo de fin de prueba');
        console.log(`Días restantes: ${daysLeft}`);
        return { 
          success: true, 
          message: 'Correo de fin de prueba simulado enviado correctamente',
          simulatedEmail: true
        };
      }
      
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

// Exportar el servicio de correo
window.emailService = emailService;
