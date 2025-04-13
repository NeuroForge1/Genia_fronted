import { GENIA_CONFIG } from '../config.js';

/**
 * Servicio para integración con Twilio (WhatsApp)
 */
const twilioService = {
  /**
   * Enviar mensaje de WhatsApp
   * @param {string} to - Número de teléfono destino (con formato internacional)
   * @param {string} message - Mensaje a enviar
   * @returns {Promise} - Promesa con el resultado del envío
   */
  async sendWhatsAppMessage(to, message) {
    try {
      // Normalizar número de teléfono
      const normalizedNumber = this.normalizePhoneNumber(to);
      
      // Llamar al backend para enviar mensaje
      const response = await fetch('https://genia-backend.onrender.com/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('genia_token')}`
        },
        body: JSON.stringify({
          to: normalizedNumber,
          message: message
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al enviar mensaje de WhatsApp');
      }
      
      const data = await response.json();
      return {
        status: 'success',
        message: 'Mensaje enviado correctamente',
        data: data
      };
    } catch (error) {
      console.error('Error al enviar mensaje de WhatsApp:', error);
      return {
        status: 'error',
        message: 'No se pudo enviar el mensaje de WhatsApp',
        error: error.message
      };
    }
  },
  
  /**
   * Configurar webhook para recibir mensajes
   * @param {string} webhookUrl - URL del webhook
   * @returns {Promise} - Promesa con el resultado de la configuración
   */
  async configureWebhook(webhookUrl) {
    try {
      const response = await fetch('https://genia-backend.onrender.com/api/whatsapp/configure-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('genia_token')}`
        },
        body: JSON.stringify({
          webhookUrl: webhookUrl
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al configurar webhook');
      }
      
      const data = await response.json();
      return {
        status: 'success',
        message: 'Webhook configurado correctamente',
        data: data
      };
    } catch (error) {
      console.error('Error al configurar webhook:', error);
      return {
        status: 'error',
        message: 'No se pudo configurar el webhook',
        error: error.message
      };
    }
  },
  
  /**
   * Verificar estado de la integración con Twilio
   * @returns {Promise} - Promesa con el estado de la integración
   */
  async checkStatus() {
    try {
      const response = await fetch('https://genia-backend.onrender.com/api/whatsapp/status', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('genia_token')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al verificar estado de WhatsApp');
      }
      
      const data = await response.json();
      return {
        status: 'success',
        message: 'Estado de WhatsApp verificado correctamente',
        data: data
      };
    } catch (error) {
      console.error('Error al verificar estado de WhatsApp:', error);
      return {
        status: 'error',
        message: 'No se pudo verificar el estado de WhatsApp',
        error: error.message
      };
    }
  },
  
  /**
   * Normalizar número de teléfono al formato E.164
   * @param {string} phoneNumber - Número de teléfono
   * @returns {string} - Número normalizado
   */
  normalizePhoneNumber(phoneNumber) {
    // Eliminar espacios, guiones y paréntesis
    let normalized = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Asegurarse de que comienza con +
    if (!normalized.startsWith('+')) {
      // Si comienza con 00, reemplazar por +
      if (normalized.startsWith('00')) {
        normalized = '+' + normalized.substring(2);
      } else {
        // Asumir que es un número sin código de país, agregar +34 (España) por defecto
        // Esto debería personalizarse según la región principal de la aplicación
        normalized = '+34' + normalized;
      }
    }
    
    return normalized;
  }
};

export default twilioService;
