/**
 * Integración con Twilio para GENIA
 * 
 * Este módulo proporciona funcionalidades para enviar y recibir mensajes
 * a través de WhatsApp utilizando la API de Twilio.
 */

import twilio from 'twilio';
import { supabaseClient } from '../supabase';
import openAIService from './openai';
import { MCP } from '../mcp';

// Interfaces para datos de mensajes
export interface MessageData {
  userId: string;
  direction: 'inbound' | 'outbound';
  channel: 'whatsapp' | 'sms' | 'email';
  from: string;
  to: string;
  body: string;
  mediaUrl?: string | null;
  twilioMessageSid?: string;
  metadata?: Record<string, any>;
}

// Interfaces para opciones de mensajes
export interface MessageOptions {
  userId?: string;
  mediaUrl?: string | string[];
  metadata?: Record<string, any>;
}

// Interfaces para datos de webhook
export interface WhatsAppWebhookData {
  From: string;
  To: string;
  Body: string;
  MessageSid: string;
  NumMedia: string;
  MediaUrl0?: string;
  WaId: string;
  ProfileName?: string;
  [key: string]: any;
}

// Interfaces para resultados
export interface TwilioResult<T> {
  success: boolean;
  error?: string;
  [key: string]: any;
}

export interface MessageResult extends TwilioResult<twilio.Response<twilio.MessageInstance>> {
  message?: twilio.MessageInstance;
}

export interface ProcessMessageResult extends TwilioResult<any> {
  response?: any;
  user?: any;
}

export interface VerificationResult extends TwilioResult<any> {
  phoneNumber?: string;
  isLikelyWhatsApp?: boolean;
  verification?: any;
}

export interface WebhookResult extends TwilioResult<any> {
  webhook?: any;
}

/**
 * Clase principal para interactuar con Twilio
 */
export class TwilioService {
  private client: twilio.Twilio;
  private whatsappNumber: string;
  private mcp: MCP;

  constructor(accountSid?: string, authToken?: string) {
    const TWILIO_ACCOUNT_SID = accountSid || process.env.TWILIO_ACCOUNT_SID || '';
    const TWILIO_AUTH_TOKEN = authToken || process.env.TWILIO_AUTH_TOKEN || '';
    const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || '';
    
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      throw new Error('Se requieren credenciales de Twilio');
    }
    
    this.client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    this.whatsappNumber = TWILIO_WHATSAPP_NUMBER;
    this.mcp = new MCP();
  }

  /**
   * Envía un mensaje de WhatsApp
   */
  async sendWhatsAppMessage(to: string, body: string, options: MessageOptions = {}): Promise<MessageResult> {
    try {
      // Formatear el número para WhatsApp si no tiene el prefijo
      const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      const formattedFrom = this.whatsappNumber.startsWith('whatsapp:') 
        ? this.whatsappNumber 
        : `whatsapp:${this.whatsappNumber}`;
      
      // Configurar opciones del mensaje
      const messageOptions: twilio.MessageListInstanceCreateOptions = {
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
          mediaUrl: options.mediaUrl as string,
          twilioMessageSid: message.sid,
          metadata: options.metadata
        });
      }
      
      return {
        success: true,
        message
      };
    } catch (error: any) {
      console.error('Error al enviar mensaje de WhatsApp:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Procesa un mensaje entrante de WhatsApp
   */
  async processIncomingWhatsAppMessage(webhookData: WhatsAppWebhookData): Promise<ProcessMessageResult> {
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
      const user = await this.findOrCreateUserByWhatsApp(whatsappId, profileName || 'Usuario de WhatsApp');
      
      // Registrar el mensaje entrante en Supabase
      await this.logMessageToSupabase({
        userId: user.id,
        direction: 'inbound',
        channel: 'whatsapp',
        from,
        to,
        body,
        mediaUrl: numMedia && parseInt(numMedia) > 0 ? mediaUrl : null,
        twilioMessageSid: messageSid,
        metadata: { whatsappId, profileName }
      });
      
      // Procesar el mensaje con el MCP
      const mcpResponse = await this.mcp.processMessage(body, user.id);
      
      // Si el MCP no pudo procesar el mensaje, usar OpenAI como fallback
      let responseText;
      if (!mcpResponse.success || !mcpResponse.response) {
        const openAIResponse = await openAIService.generateText(body, {
          systemMessage: `Eres GENIA, un asistente de IA especializado en marketing y negocios. 
            Estás respondiendo a un mensaje de WhatsApp de ${profileName || 'un usuario'}. 
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
    } catch (error: any) {
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
   */
  private async findOrCreateUserByWhatsApp(whatsappId: string, profileName: string): Promise<any> {
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
    } catch (error: any) {
      console.error('Error al buscar o crear usuario por WhatsApp:', error);
      throw error;
    }
  }

  /**
   * Registra un mensaje en Supabase
   */
  private async logMessageToSupabase(messageData: MessageData): Promise<TwilioResult<any>> {
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
    } catch (error: any) {
      console.error('Error al registrar mensaje en Supabase:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verifica si un número está registrado en WhatsApp
   */
  async checkWhatsAppRegistration(phoneNumber: string): Promise<VerificationResult> {
    try {
      // Formatear el número si es necesario
      const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      // Verificar si el número está registrado en WhatsApp
      const verification = await this.client.lookups.v2
        .phoneNumbers(formattedNumber)
        .fetch({ fields: 'line_type_intelligence' });
      
      // Determinar si es probable que esté en WhatsApp basado en el tipo de línea
      const lineTypeIntelligence = verification.lineTypeIntelligence as any;
      const isLikelyWhatsApp = lineTypeIntelligence?.type === 'mobile';
      
      return {
        success: true,
        phoneNumber: formattedNumber,
        isLikelyWhatsApp,
        verification
      };
    } catch (error: any) {
      console.error('Error al verificar registro en WhatsApp:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Envía un mensaje de plantilla de WhatsApp
   */
  async sendWhatsAppTemplate(to: string, templateName: string, parameters: any[] = [], options: MessageOptions = {}): Promise<MessageResult> {
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
    } catch (error: any) {
      console.error('Error al enviar plantilla de WhatsApp:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Configura un webhook para recibir mensajes de WhatsApp
   */
  async configureWebhook(url: string): Promise<WebhookResult> {
    try {
      // Obtener el número de teléfono de WhatsApp
      const phoneNumber = this.whatsappNumber.replace('whatsapp:', '');
      
      // Configurar el webhook para el número
      const incomingPhoneNumbers = await this.client.incomingPhoneNumbers.list({ phoneNumber });
      
      if (incomingPhoneNumbers.length === 0) {
        throw new Error(`No se encontró el número ${phoneNumber}`);
      }
      
      const webhook = await this.client.incomingPhoneNumbers(incomingPhoneNumbers[0].sid)
        .update({
          smsUrl: url,
          smsMethod: 'POST'
        });
      
      return {
        success: true,
        webhook
      };
    } catch (error: any) {
      console.error('Error al configurar webhook:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Crear una instancia por defecto para uso en la aplicación
const twilioService = new TwilioService();
export default twilioService;
