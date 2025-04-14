// Twilio WhatsApp Integration para GENIA
// Este archivo maneja la integración con Twilio para enviar y recibir mensajes de WhatsApp

// Usar las credenciales de Twilio desde las variables de entorno
const TWILIO_SID = window.ENV ? window.ENV.TWILIO_SID : '';
const TWILIO_AUTH_TOKEN = window.ENV ? window.ENV.TWILIO_AUTH_TOKEN : '';
const TWILIO_WHATSAPP_NUMBER = window.ENV ? window.ENV.TWILIO_WHATSAPP_NUMBER : '+14155238886';

// Servicio de WhatsApp con Twilio
const twilioWhatsappService = {
  // Enviar mensaje de WhatsApp
  async sendWhatsAppMessage(to, message) {
    try {
      // Verificar si las credenciales están disponibles
      if (!TWILIO_SID || !TWILIO_AUTH_TOKEN || TWILIO_SID === 'AC00000000000000000000000000000000') {
        console.warn('Usando credenciales de Twilio de prueba. Esto puede afectar la funcionalidad.');
      }
      
      // Asegurarse de que el número tenga el formato correcto
      const formattedNumber = this.formatPhoneNumber(to);
      
      // Implementar mecanismo de reintentos
      let attempts = 0;
      const maxAttempts = 3;
      let lastError = null;
      
      while (attempts < maxAttempts) {
        try {
          // Realizar la solicitud a la API de Twilio
          const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Basic ${btoa(`${TWILIO_SID}:${TWILIO_AUTH_TOKEN}`)}`
            },
            body: new URLSearchParams({
              'To': `whatsapp:${formattedNumber}`,
              'From': `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
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
          lastError = error;
          console.warn(`Intento ${attempts + 1} fallido: ${error.message}`);
          attempts++;
          
          // Esperar antes de reintentar (backoff exponencial)
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts)));
          }
        }
      }
      
      // Si llegamos aquí, todos los intentos fallaron
      throw lastError || new Error('Error desconocido al comunicarse con Twilio');
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
      // Verificar si las credenciales están disponibles
      if (!TWILIO_SID || !TWILIO_AUTH_TOKEN || TWILIO_SID === 'AC00000000000000000000000000000000') {
        console.warn('Usando credenciales de Twilio de prueba. Esto puede afectar la funcionalidad.');
      }
      
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
      
      // Implementar mecanismo de reintentos
      let attempts = 0;
      const maxAttempts = 3;
      let lastError = null;
      
      while (attempts < maxAttempts) {
        try {
          // Realizar la solicitud a la API de Twilio
          const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Basic ${btoa(`${TWILIO_SID}:${TWILIO_AUTH_TOKEN}`)}`
            },
            body: new URLSearchParams({
              'To': `whatsapp:${formattedNumber}`,
              'From': `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
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
          lastError = error;
          console.warn(`Intento ${attempts + 1} fallido: ${error.message}`);
          attempts++;
          
          // Esperar antes de reintentar (backoff exponencial)
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts)));
          }
        }
      }
      
      // Si llegamos aquí, todos los intentos fallaron
      throw lastError || new Error('Error desconocido al comunicarse con Twilio');
    } catch (error) {
      console.error('Error al enviar mensaje de WhatsApp con plantilla:', error);
      return {
        success: false,
        message: `Error al enviar mensaje de WhatsApp: ${error.message}`
      };
    }
  },
  
  // Procesar mensaje entrante de WhatsApp
  async processIncomingMessage(from, body, mediaUrl = null) {
    try {
      // Obtener el número de teléfono sin el prefijo "whatsapp:"
      const phoneNumber = from.startsWith('whatsapp:') ? from.substring(9) : from;
      
      // Verificar si el número está registrado
      const isRegistered = await this.isPhoneNumberRegistered(phoneNumber);
      
      if (!isRegistered) {
        // Si el número no está registrado, enviar mensaje de bienvenida
        return await this.handleUnregisteredUser(phoneNumber, body);
      }
      
      // Procesar el mensaje según su contenido
      if (body.toLowerCase() === 'hola' || body.toLowerCase() === 'hello') {
        return await this.handleGreeting(phoneNumber);
      } else if (body.toLowerCase().includes('ayuda') || body.toLowerCase().includes('help')) {
        return await this.handleHelpRequest(phoneNumber);
      } else {
        // Procesar como consulta para OpenAI
        return await this.handleOpenAIQuery(phoneNumber, body);
      }
    } catch (error) {
      console.error('Error al procesar mensaje entrante de WhatsApp:', error);
      return {
        success: false,
        message: `Error al procesar mensaje: ${error.message}`
      };
    }
  },
  
  // Verificar si un número de teléfono está registrado
  async isPhoneNumberRegistered(phoneNumber) {
    // En una implementación real, esto verificaría en la base de datos
    // Por ahora, verificamos en localStorage como ejemplo
    const verifiedNumber = localStorage.getItem('whatsapp_verified_number');
    const formattedNumber = this.formatPhoneNumber(phoneNumber);
    
    return verifiedNumber === formattedNumber;
  },
  
  // Manejar usuario no registrado
  async handleUnregisteredUser(phoneNumber, message) {
    const welcomeMessage = `¡Hola! Gracias por contactar a GENIA. Para utilizar nuestro servicio, necesitas registrarte en nuestra plataforma: https://v0-genia-fronted.vercel.app/\n\nUna vez registrado, podrás vincular este número de WhatsApp a tu cuenta.`;
    
    return await this.sendWhatsAppMessage(phoneNumber, welcomeMessage);
  },
  
  // Manejar saludo
  async handleGreeting(phoneNumber) {
    // Obtener información del usuario si está disponible
    let userName = 'usuario';
    try {
      const user = geniaApi.auth.getCurrentUser();
      if (user && user.name) {
        userName = user.name.split(' ')[0]; // Usar solo el primer nombre
      }
    } catch (error) {
      console.warn('No se pudo obtener información del usuario:', error);
    }
    
    const greetingMessage = `¡Hola ${userName}! 👋\n\nSoy GENIA, tu asistente de IA. Estoy aquí para ayudarte a crecer tu negocio.\n\n¿En qué puedo ayudarte hoy?\n\n- Puedes pedirme ideas para contenido\n- Consultar estrategias de marketing\n- Solicitar análisis de datos\n- O cualquier otra consulta relacionada con tu negocio`;
    
    return await this.sendWhatsAppMessage(phoneNumber, greetingMessage);
  },
  
  // Manejar solicitud de ayuda
  async handleHelpRequest(phoneNumber) {
    const helpMessage = `Comandos disponibles en GENIA WhatsApp:\n\n- *Hola*: Iniciar conversación\n- *Ayuda*: Ver esta lista de comandos\n- *Status*: Ver estado de tu cuenta\n- *Clones*: Ver lista de clones disponibles\n\nPara hablar con un clon específico, escribe el nombre del clon seguido de dos puntos y tu mensaje. Por ejemplo:\n*Content: Necesito ideas para mi próximo post*`;
    
    return await this.sendWhatsAppMessage(phoneNumber, helpMessage);
  },
  
  // Manejar consulta para OpenAI
  async handleOpenAIQuery(phoneNumber, message) {
    try {
      // Determinar qué clon usar
      let cloneType = 'general';
      let userMessage = message;
      
      // Verificar si el mensaje especifica un clon
      const cloneMatch = message.match(/^(content|ads|ceo|voice):\s*(.*)/i);
      if (cloneMatch) {
        cloneType = cloneMatch[1].toLowerCase();
        userMessage = cloneMatch[2];
      }
      
      // Verificar si el servicio de OpenAI está disponible
      if (typeof openaiChatService === 'undefined' || typeof openaiChatService.sendMessage !== 'function') {
        throw new Error('El servicio de OpenAI no está disponible en este momento.');
      }
      
      // Enviar mensaje a OpenAI
      const openaiResponse = await openaiChatService.sendMessage(userMessage, cloneType, []);
      
      if (!openaiResponse.success) {
        throw new Error(openaiResponse.message || 'Error al procesar tu consulta con IA.');
      }
      
      // Enviar respuesta de OpenAI por WhatsApp
      return await this.sendWhatsAppMessage(phoneNumber, openaiResponse.message);
    } catch (error) {
      console.error('Error al procesar consulta para OpenAI:', error);
      
      // Enviar mensaje de error al usuario
      const errorMessage = `Lo siento, tuve un problema al procesar tu consulta: ${error.message}\n\nPor favor, intenta nuevamente más tarde o contacta a soporte si el problema persiste.`;
      return await this.sendWhatsAppMessage(phoneNumber, errorMessage);
    }
  },
  
  // Configurar webhook para recibir mensajes
  setupWebhook() {
    // Esta función sería implementada en el backend
    // En el frontend solo podemos simular la recepción de mensajes
    console.log('Configuración de webhook para Twilio debe implementarse en el backend');
    
    // Ejemplo de cómo se procesaría un mensaje entrante
    return {
      success: true,
      message: 'La configuración del webhook debe realizarse en el backend'
    };
  },
  
  // Simular recepción de mensaje (para pruebas)
  async simulateIncomingMessage(from, body) {
    console.log(`Simulando mensaje entrante de ${from}: ${body}`);
    return await this.processIncomingMessage(from, body);
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
