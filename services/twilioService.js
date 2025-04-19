/**
 * Integración con Twilio para GENIA
 * 
 * Este módulo proporciona funcionalidades para enviar y recibir mensajes
 * a través de WhatsApp utilizando la API de Twilio.
 */

const twilio = require('twilio');
const { supabaseClient } = require('../lib/supabase');
const { OpenAIService } = require('./openAIService');
const { MCP } = require('../lib/mcp');

// Configuración de Twilio
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;

// Instancia de OpenAI para procesar mensajes
const openAIService = new OpenAIService();

// Instancia del MCP para enrutar solicitudes
const mcp = new MCP();

/**
 * Clase principal para interactuar con Twilio
 */
class TwilioService {
  constructor(accountSid = TWILIO_ACCOUNT_SID, authToken = TWILIO_AUTH_TOKEN) {
    if (!accountSid || !authToken) {
      throw new Error('Se requieren credenciales de Twilio');
    }
    this.client = twilio(accountSid, authToken);
    this.whatsappNumber = TWILIO_WHATSAPP_NUMBER;
  }

  /**
   * Envía un mensaje de WhatsApp
   * @param {string} to - Número de teléfono del destinatario (formato: +1234567890)
   * @param {string} body - Contenido del mensaje
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} - Resultado del envío
   */
  async sendWhatsAppMessage(to, body, options = {}) {
    try {
      // Formatear el número para WhatsApp si no tiene el prefijo
      const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      const formattedFrom = this.whatsappNumber.startsWith('whatsapp:') 
        ? this.whatsappNumber 
        : `whatsapp:${this.whatsappNumber}`;
      
      // Configurar opciones del mensaje
      const messageOptions = {
        from: formattedFrom,
        to: formattedTo,
        body
      };
      
      // Añadir medios si se proporcionan
      if (options.mediaUrl) {
        messageOptions.mediaUrl = Array.isArray(options.mediaUrl) 
          ? options.mediaUrl 
          : [options.mediaUrl];
      }
      
      // Enviar el mensaje
      const message = await this.client.messages.create(messageOptions);
      
      // Registrar el mensaje en Supabase
      if (options.userId) {
        await this.logMessageToSupabase({
          userId: options.userId,
          direction: 'outbound',
          channel: 'whatsapp',
          from: formattedFrom,
          to: formattedTo,
          body,
          mediaUrl: options.mediaUrl,
          twilioMessageSid: message.sid,
          metadata: options.metadata
        });
      }
      
      return {
        success: true,
        message
      };
    } catch (error) {
      console.error('Error al enviar mensaje de WhatsApp:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Procesa un mensaje entrante de WhatsApp
   * @param {Object} webhookData - Datos del webhook de Twilio
   * @returns {Promise<Object>} - Respuesta al mensaje
   */
  async processIncomingWhatsAppMessage(webhookData) {
    try {
      const {
        From: from,
        To: to,
        Body: body,
        MessageSid: messageSid,
        NumMedia: numMedia,
        MediaUrl0: mediaUrl,
        WaId: whatsappId,
        ProfileName: profileName
      } = webhookData;
      
      // Buscar o crear usuario basado en el número de WhatsApp
      const user = await this.findOrCreateUserByWhatsApp(whatsappId, profileName);
      
      // Registrar el mensaje entrante en Supabase
      await this.logMessageToSupabase({
        userId: user.id,
        direction: 'inbound',
        channel: 'whatsapp',
        from,
        to,
        body,
        mediaUrl: numMedia > 0 ? mediaUrl : null,
        twilioMessageSid: messageSid,
        metadata: { whatsappId, profileName }
      });
      
      // Procesar el mensaje con el MCP
      const mcpResponse = await mcp.processMessage(body, user.id);
      
      // Si el MCP no pudo procesar el mensaje, usar OpenAI como fallback
      let responseText;
      if (!mcpResponse.success || !mcpResponse.response) {
        const openAIResponse = await openAIService.generateText(body, {
          systemMessage: `Eres GENIA, un asistente de IA especializado en marketing y negocios. 
            Estás respondiendo a un mensaje de WhatsApp de ${profileName}. 
            Sé conciso pero útil en tus respuestas.`
        });
        
        responseText = openAIResponse.success 
          ? openAIResponse.text 
          : 'Lo siento, no pude procesar tu mensaje en este momento. Por favor, inténtalo de nuevo más tarde.';
      } else {
        responseText = mcpResponse.response;
      }
      
      // Enviar respuesta
      const response = await this.sendWhatsAppMessage(from, responseText, {
        userId: user.id,
        metadata: { 
          inReplyTo: messageSid,
          mcpClone: mcpResponse.success ? mcpResponse.selectedClone : 'fallback'
        }
      });
      
      return {
        success: true,
        response,
        user
      };
    } catch (error) {
      console.error('Error al procesar mensaje entrante de WhatsApp:', error);
      
      // Intentar enviar mensaje de error al remitente
      try {
        if (webhookData && webhookData.From) {
          await this.sendWhatsAppMessage(
            webhookData.From,
            'Lo siento, ocurrió un error al procesar tu mensaje. Por favor, inténtalo de nuevo más tarde.'
          );
        }
      } catch (sendError) {
        console.error('Error al enviar mensaje de error:', sendError);
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Busca o crea un usuario basado en su número de WhatsApp
   * @param {string} whatsappId - ID de WhatsApp (número de teléfono)
   * @param {string} profileName - Nombre del perfil de WhatsApp
   * @returns {Promise<Object>} - Usuario encontrado o creado
   */
  async findOrCreateUserByWhatsApp(whatsappId, profileName) {
    try {
      // Buscar usuario existente por WhatsApp ID
      const { data: existingUser, error: searchError } = await supabaseClient
        .from('user_profiles')
        .select('*')
        .eq('whatsapp_id', whatsappId)
        .single();
      
      if (!searchError && existingUser) {
        return existingUser;
      }
      
      // Crear un nuevo usuario si no existe
      const { data: auth, error: authError } = await supabaseClient.auth.signUp({
        email: `whatsapp_${whatsappId}@genia.ai`,
        password: `${whatsappId}_${Date.now()}`, // Contraseña temporal
        options: {
          data: {
            whatsapp_id: whatsappId,
            name: profileName || 'Usuario de WhatsApp'
          }
        }
      });
      
      if (authError) {
        throw new Error(`Error al crear usuario: ${authError.message}`);
      }
      
      // Crear perfil de usuario
      const { data: profile, error: profileError } = await supabaseClient
        .from('user_profiles')
        .insert({
          user_id: auth.user.id,
          name: profileName || 'Usuario de WhatsApp',
          whatsapp_id: whatsappId,
          registration_channel: 'whatsapp',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (profileError) {
        throw new Error(`Error al crear perfil: ${profileError.message}`);
      }
      
      return profile;
    } catch (error) {
      console.error('Error al buscar o crear usuario por WhatsApp:', error);
      throw error;
    }
  }

  /**
   * Registra un mensaje en Supabase
   * @param {Object} messageData - Datos del mensaje
   * @returns {Promise<Object>} - Resultado del registro
   */
  async logMessageToSupabase(messageData) {
    try {
      const {
        userId,
        direction,
        channel,
        from,
        to,
        body,
        mediaUrl,
        twilioMessageSid,
        metadata = {}
      } = messageData;
      
      const { data, error } = await supabaseClient
        .from('messages')
        .insert({
          user_id: userId,
          direction,
          channel,
          from_address: from,
          to_address: to,
          content: body,
          media_url: mediaUrl,
          provider_message_id: twilioMessageSid,
          metadata,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        throw new Error(`Error al registrar mensaje: ${error.message}`);
      }
      
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error al registrar mensaje en Supabase:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verifica si un número está registrado en WhatsApp
   * @param {string} phoneNumber - Número de teléfono a verificar
   * @returns {Promise<Object>} - Resultado de la verificación
   */
  async checkWhatsAppRegistration(phoneNumber) {
    try {
      // Formatear el número si es necesario
      const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      // Verificar si el número está registrado en WhatsApp
      const verification = await this.client.lookups.v2
        .phoneNumbers(formattedNumber)
        .fetch({ fields: 'line_type_intelligence' });
      
      // Determinar si es probable que esté en WhatsApp basado en el tipo de línea
      const isLikelyWhatsApp = verification.lineTypeIntelligence?.type === 'mobile';
      
      return {
        success: true,
        phoneNumber: formattedNumber,
        isLikelyWhatsApp,
        verification
      };
    } catch (error) {
      console.error('Error al verificar registro en WhatsApp:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Envía un mensaje de plantilla de WhatsApp
   * @param {string} to - Número de teléfono del destinatario
   * @param {string} templateName - Nombre de la plantilla
   * @param {Array} parameters - Parámetros para la plantilla
   * @returns {Promise<Object>} - Resultado del envío
   */
  async sendWhatsAppTemplate(to, templateName, parameters = [], options = {}) {
    try {
      // Formatear el número para WhatsApp si no tiene el prefijo
      const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      const formattedFrom = this.whatsappNumber.startsWith('whatsapp:') 
        ? this.whatsappNumber 
        : `whatsapp:${this.whatsappNumber}`;
      
      // Crear el mensaje con la plantilla
      const message = await this.client.messages.create({
        from: formattedFrom,
        to: formattedTo,
        body: '', // El cuerpo se ignora cuando se usa una plantilla
        contentSid: templateName,
        contentVariables: JSON.stringify(parameters)
      });
      
      // Registrar el mensaje en Supabase
      if (options.userId) {
        await this.logMessageToSupabase({
          userId: options.userId,
          direction: 'outbound',
          channel: 'whatsapp',
          from: formattedFrom,
          to: formattedTo,
          body: `[Template: ${templateName}]`,
          twilioMessageSid: message.sid,
          metadata: { 
            ...options.metadata,
            template: templateName,
            parameters
          }
        });
      }
      
      return {
        success: true,
        message
      };
    } catch (error) {
      console.error('Error al enviar plantilla de WhatsApp:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Configura un webhook para recibir mensajes de WhatsApp
   * @param {string} url - URL del webhook
   * @returns {Promise<Object>} - Resultado de la configuración
   */
  async configureWebhook(url) {
    try {
      // Obtener el número de teléfono de WhatsApp
      const phoneNumber = this.whatsappNumber.replace('whatsapp:', '');
      
      // Configurar el webhook para el número
      const webhook = await this.client.incomingPhoneNumbers
        .list({ phoneNumber })
        .then(incomingPhoneNumbers => {
          if (incomingPhoneNumbers.length === 0) {
            throw new Error(`No se encontró el número ${phoneNumber}`);
          }
          
          return this.client.incomingPhoneNumbers(incomingPhoneNumbers[0].sid)
            .update({
              smsUrl: url,
              smsMethod: 'POST'
            });
        });
      
      return {
        success: true,
        webhook
      };
    } catch (error) {
      console.error('Error al configurar webhook:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Exportar la clase
module.exports = {
  TwilioService
};

// Crear una instancia por defecto para uso en la aplicación
const twilioService = new TwilioService();
module.exports.default = twilioService;
