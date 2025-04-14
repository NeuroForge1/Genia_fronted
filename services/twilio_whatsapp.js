// Twilio WhatsApp Integration para GENIA
// Este archivo maneja la integración con Twilio para enviar mensajes de WhatsApp

// Usar las credenciales de Twilio desde las variables de entorno
const TWILIO_SID = window.ENV ? window.ENV.TWILIO_SID : '';
const TWILIO_AUTH_TOKEN = window.ENV ? window.ENV.TWILIO_AUTH_TOKEN : '';

// Servicio de WhatsApp con Twilio
const twilioWhatsappService = {
  // Enviar mensaje de WhatsApp
  async sendWhatsAppMessage(to, message) {
    try {
      // Asegurarse de que el número tenga el formato correcto
      const formattedNumber = this.formatPhoneNumber(to);
      
      // Realizar la solicitud a la API de Twilio
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${TWILIO_SID}:${TWILIO_AUTH_TOKEN}`)}`
        },
        body: new URLSearchParams({
          'To': `whatsapp:${formattedNumber}`,
          'From': 'whatsapp:+14155238886', // Número de WhatsApp de Twilio
          'Body': message
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error en la API de Twilio: ${errorData.message || response.statusText}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        messageId: data.sid,
        status: data.status
      };
    } catch (error) {
      console.error('Error al enviar mensaje de WhatsApp:', error);
      return {
        success: false,
        message: `Error al enviar mensaje de WhatsApp: ${error.message}`
      };
    }
  },
  
  // Formatear número de teléfono
  formatPhoneNumber(phoneNumber) {
    // Eliminar caracteres no numéricos
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Asegurarse de que tenga el código de país
    if (!cleaned.startsWith('1') && !cleaned.startsWith('+1')) {
      cleaned = '1' + cleaned; // Añadir código de país de EE. UU. por defecto
    }
    
    // Eliminar el + si existe
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }
    
    return cleaned;
  },
  
  // Enviar mensaje de WhatsApp con plantilla
  async sendTemplateMessage(to, templateName, variables = {}) {
    try {
      // Asegurarse de que el número tenga el formato correcto
      const formattedNumber = this.formatPhoneNumber(to);
      
      // Construir el cuerpo del mensaje con la plantilla
      let body = '';
      
      switch(templateName) {
        case 'welcome':
          body = `¡Bienvenido a GENIA! 🚀\n\nHola ${variables.name || 'usuario'},\n\nGracias por registrarte en GENIA, tu sistema de crecimiento automatizado con IA.\n\nTu cuenta ha sido activada y tienes acceso a todos los clones de IA durante tu periodo de prueba de 7 días.\n\nSi tienes alguna pregunta, responde a este mensaje y estaremos encantados de ayudarte.`;
          break;
        case 'reminder':
          body = `Recordatorio GENIA ⏰\n\nHola ${variables.name || 'usuario'},\n\nTe recordamos que tu periodo de prueba termina en ${variables.daysLeft || 'pocos'} días.\n\nPara seguir disfrutando de todos los beneficios de GENIA, actualiza tu plan desde el dashboard.`;
          break;
        case 'task_completed':
          body = `Tarea completada ✅\n\nHola ${variables.name || 'usuario'},\n\nTu tarea "${variables.taskName || 'reciente'}" ha sido completada exitosamente.\n\nPuedes ver los resultados en tu dashboard de GENIA.`;
          break;
        default:
          body = variables.message || 'Mensaje de GENIA';
      }
      
      // Realizar la solicitud a la API de Twilio
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${TWILIO_SID}:${TWILIO_AUTH_TOKEN}`)}`
        },
        body: new URLSearchParams({
          'To': `whatsapp:${formattedNumber}`,
          'From': 'whatsapp:+14155238886', // Número de WhatsApp de Twilio
          'Body': body
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error en la API de Twilio: ${errorData.message || response.statusText}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        messageId: data.sid,
        status: data.status
      };
    } catch (error) {
      console.error('Error al enviar mensaje de WhatsApp con plantilla:', error);
      return {
        success: false,
        message: `Error al enviar mensaje de WhatsApp: ${error.message}`
      };
    }
  }
};

// Agregar el servicio de WhatsApp al objeto geniaApi
if (typeof geniaApi !== 'undefined') {
  geniaApi.whatsapp = twilioWhatsappService;
} else {
  console.error('Error: geniaApi no está definido. No se puede agregar el servicio de WhatsApp.');
}

// Exportar el servicio de WhatsApp
window.twilioWhatsappService = twilioWhatsappService;
