import { createClient } from 'twilio';

// Definición de tipos para los mensajes de WhatsApp
export type WhatsAppMessage = {
  to: string;
  body: string;
  mediaUrl?: string[];
};

// Clase para manejar la integración con Twilio
export class TwilioService {
  private client;

  constructor(accountSid: string, authToken: string, private fromNumber: string) {
    this.client = createClient(accountSid, authToken);
    this.fromNumber = fromNumber;
  }

  // Método para enviar mensajes de WhatsApp
  async sendWhatsAppMessage(message: WhatsAppMessage): Promise<any> {
    try {
      const response = await this.client.messages.create({
        body: message.body,
        from: `whatsapp:${this.fromNumber}`,
        to: `whatsapp:${message.to}`,
        mediaUrl: message.mediaUrl,
      });
      
      return {
        success: true,
        messageId: response.sid,
        status: response.status,
      };
    } catch (error) {
      console.error('Error al enviar mensaje de WhatsApp:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  // Método para verificar el estado de un mensaje
  async checkMessageStatus(messageSid: string): Promise<any> {
    try {
      const message = await this.client.messages(messageSid).fetch();
      return {
        success: true,
        status: message.status,
        dateCreated: message.dateCreated,
        dateSent: message.dateSent,
        dateUpdated: message.dateUpdated,
      };
    } catch (error) {
      console.error('Error al verificar estado del mensaje:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  // Método para obtener historial de mensajes
  async getMessageHistory(phoneNumber: string, limit: number = 10): Promise<any> {
    try {
      const messages = await this.client.messages.list({
        to: `whatsapp:${phoneNumber}`,
        limit,
      });
      
      return {
        success: true,
        messages: messages.map(msg => ({
          sid: msg.sid,
          body: msg.body,
          direction: msg.direction,
          status: msg.status,
          dateCreated: msg.dateCreated,
          dateSent: msg.dateSent,
        })),
      };
    } catch (error) {
      console.error('Error al obtener historial de mensajes:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }
  
  // Método para procesar mensajes entrantes de WhatsApp
  async processIncomingMessage(from: string, body: string): Promise<any> {
    try {
      // Eliminar el prefijo 'whatsapp:' si existe
      const phoneNumber = from.replace('whatsapp:', '');
      
      // Registrar el mensaje entrante
      console.log(`Mensaje recibido de ${phoneNumber}: ${body}`);
      
      // Aquí se implementaría la lógica para procesar el mensaje
      // Por ejemplo, identificar el tipo de solicitud y redirigirla al clon adecuado
      
      // Respuesta automática básica
      const response = await this.sendWhatsAppMessage({
        to: phoneNumber,
        body: `Hemos recibido tu mensaje: "${body}". Un clon de GENIA lo procesará en breve.`,
      });
      
      return {
        success: true,
        messageId: response.messageId,
        status: response.status,
      };
    } catch (error) {
      console.error('Error al procesar mensaje entrante:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }
  
  // Método para verificar si un número está registrado en WhatsApp
  async verifyWhatsAppNumber(phoneNumber: string): Promise<boolean> {
    try {
      // Esta es una implementación simplificada
      // En un entorno real, se utilizaría la API de Twilio para verificar el número
      const testMessage = await this.client.messages.create({
        body: 'Verificación de número de WhatsApp',
        from: `whatsapp:${this.fromNumber}`,
        to: `whatsapp:${phoneNumber}`,
      });
      
      // Si no hay error, asumimos que el número es válido
      return true;
    } catch (error) {
      console.error('Error al verificar número de WhatsApp:', error);
      return false;
    }
  }
}

// Función para crear una instancia del servicio de Twilio
export function createTwilioService(): TwilioService {
  const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
  const authToken = process.env.TWILIO_AUTH_TOKEN || '';
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || '';
  
  if (!accountSid || !authToken || !fromNumber) {
    throw new Error('Faltan credenciales de Twilio en las variables de entorno');
  }
  
  return new TwilioService(accountSid, authToken, fromNumber);
}

// Exportar una instancia por defecto para uso en la aplicación
export default createTwilioService;
