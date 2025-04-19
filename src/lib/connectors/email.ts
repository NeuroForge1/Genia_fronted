/**
 * Conectores para plataformas de email marketing
 * 
 * Este módulo proporciona conectores para interactuar con diferentes plataformas
 * de email marketing, permitiendo a GENIA ejecutar tareas reales como enviar campañas,
 * gestionar listas de suscriptores, analizar métricas, etc.
 */

import axios from 'axios';
import { supabaseClient } from '../supabase';

// Tipos de plataformas soportadas
export type EmailPlatform = 'mailchimp' | 'sendgrid' | 'convertkit' | 'mailerlite';

// Interfaz para credenciales de email marketing
export interface EmailCredentials {
  platform: EmailPlatform;
  apiKey: string;
  serverPrefix?: string; // Para Mailchimp
  userId?: string;
}

// Interfaz para suscriptor
export interface Subscriber {
  email: string;
  firstName?: string;
  lastName?: string;
  tags?: string[];
  customFields?: Record<string, string | number | boolean>;
}

// Interfaz para lista/audiencia
export interface EmailList {
  id: string;
  name: string;
  subscriberCount: number;
  createdAt: Date;
}

// Interfaz para campaña de email
export interface EmailCampaign {
  name: string;
  subject: string;
  fromName: string;
  fromEmail: string;
  content: string;
  listId: string;
  scheduledTime?: Date;
  isHtml?: boolean;
}

// Interfaz para respuesta de campaña
export interface CampaignResponse {
  success: boolean;
  campaignId?: string;
  error?: string;
}

// Interfaz para métricas de campaña
export interface CampaignMetrics {
  sent: number;
  opens: number;
  clicks: number;
  bounces: number;
  unsubscribes: number;
  openRate: number;
  clickRate: number;
}

/**
 * Clase principal para gestionar conectores de email marketing
 */
export class EmailConnector {
  private credentials: EmailCredentials;
  private baseUrls: Record<EmailPlatform, string> = {
    mailchimp: 'https://{serverPrefix}.api.mailchimp.com/3.0',
    sendgrid: 'https://api.sendgrid.com/v3',
    convertkit: 'https://api.convertkit.com/v3',
    mailerlite: 'https://connect.mailerlite.com/api'
  };

  constructor(credentials: EmailCredentials) {
    this.credentials = credentials;
  }

  /**
   * Obtiene credenciales de email marketing desde Supabase
   */
  static async getCredentialsFromSupabase(userId: string, platform: EmailPlatform): Promise<EmailCredentials | null> {
    const { data, error } = await supabaseClient
      .from('email_credentials')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', platform)
      .single();

    if (error || !data) {
      console.error('Error al obtener credenciales:', error);
      return null;
    }

    return {
      platform: data.platform as EmailPlatform,
      apiKey: data.api_key,
      serverPrefix: data.server_prefix,
      userId: data.platform_user_id
    };
  }

  /**
   * Obtiene la URL base para la plataforma
   */
  private getBaseUrl(): string {
    let baseUrl = this.baseUrls[this.credentials.platform];
    
    if (this.credentials.platform === 'mailchimp' && this.credentials.serverPrefix) {
      baseUrl = baseUrl.replace('{serverPrefix}', this.credentials.serverPrefix);
    }
    
    return baseUrl;
  }

  /**
   * Verifica si las credenciales son válidas
   */
  async verifyCredentials(): Promise<boolean> {
    try {
      switch (this.credentials.platform) {
        case 'mailchimp':
          const mcResponse = await axios.get(
            `${this.getBaseUrl()}/ping`,
            { 
              headers: { 
                'Authorization': `Basic ${Buffer.from(`anystring:${this.credentials.apiKey}`).toString('base64')}` 
              } 
            }
          );
          return mcResponse.status === 200;

        case 'sendgrid':
          const sgResponse = await axios.get(
            `${this.baseUrls.sendgrid}/user/profile`,
            { 
              headers: { 
                'Authorization': `Bearer ${this.credentials.apiKey}` 
              } 
            }
          );
          return sgResponse.status === 200;

        case 'convertkit':
          const ckResponse = await axios.get(
            `${this.baseUrls.convertkit}/account`,
            { params: { api_key: this.credentials.apiKey } }
          );
          return !!ckResponse.data.name;

        case 'mailerlite':
          const mlResponse = await axios.get(
            `${this.baseUrls.mailerlite}/account`,
            { 
              headers: { 
                'Authorization': `Bearer ${this.credentials.apiKey}` 
              } 
            }
          );
          return mlResponse.status === 200;

        default:
          return false;
      }
    } catch (error) {
      console.error('Error al verificar credenciales:', error);
      return false;
    }
  }

  /**
   * Obtiene listas/audiencias disponibles
   */
  async getLists(): Promise<EmailList[]> {
    try {
      switch (this.credentials.platform) {
        case 'mailchimp':
          return await this.getMailchimpLists();
        case 'sendgrid':
          return await this.getSendgridLists();
        case 'convertkit':
          return await this.getConvertkitLists();
        case 'mailerlite':
          return await this.getMailerliteLists();
        default:
          return [];
      }
    } catch (error) {
      console.error(`Error al obtener listas de ${this.credentials.platform}:`, error);
      return [];
    }
  }

  /**
   * Obtiene listas de Mailchimp
   */
  private async getMailchimpLists(): Promise<EmailList[]> {
    const response = await axios.get(
      `${this.getBaseUrl()}/lists`,
      { 
        headers: { 
          'Authorization': `Basic ${Buffer.from(`anystring:${this.credentials.apiKey}`).toString('base64')}` 
        } 
      }
    );

    return response.data.lists.map((list: any) => ({
      id: list.id,
      name: list.name,
      subscriberCount: list.stats.member_count,
      createdAt: new Date(list.date_created)
    }));
  }

  /**
   * Obtiene listas de SendGrid
   */
  private async getSendgridLists(): Promise<EmailList[]> {
    const response = await axios.get(
      `${this.baseUrls.sendgrid}/marketing/lists`,
      { 
        headers: { 
          'Authorization': `Bearer ${this.credentials.apiKey}` 
        } 
      }
    );

    return response.data.result.map((list: any) => ({
      id: list.id,
      name: list.name,
      subscriberCount: list.contact_count,
      createdAt: new Date(list.created_at)
    }));
  }

  /**
   * Obtiene listas de ConvertKit
   */
  private async getConvertkitLists(): Promise<EmailList[]> {
    // ConvertKit usa "forms" y "sequences" en lugar de listas
    const response = await axios.get(
      `${this.baseUrls.convertkit}/forms`,
      { params: { api_key: this.credentials.apiKey } }
    );

    return response.data.map((form: any) => ({
      id: form.id.toString(),
      name: form.name,
      subscriberCount: form.total_subscriptions,
      createdAt: new Date() // ConvertKit no proporciona fecha de creación en la API
    }));
  }

  /**
   * Obtiene listas de MailerLite
   */
  private async getMailerliteLists(): Promise<EmailList[]> {
    const response = await axios.get(
      `${this.baseUrls.mailerlite}/groups`,
      { 
        headers: { 
          'Authorization': `Bearer ${this.credentials.apiKey}` 
        } 
      }
    );

    return response.data.data.map((group: any) => ({
      id: group.id,
      name: group.name,
      subscriberCount: group.active_count,
      createdAt: new Date(group.created_at)
    }));
  }

  /**
   * Añade un suscriptor a una lista
   */
  async addSubscriber(listId: string, subscriber: Subscriber): Promise<boolean> {
    try {
      switch (this.credentials.platform) {
        case 'mailchimp':
          return await this.addMailchimpSubscriber(listId, subscriber);
        case 'sendgrid':
          return await this.addSendgridSubscriber(listId, subscriber);
        case 'convertkit':
          return await this.addConvertkitSubscriber(listId, subscriber);
        case 'mailerlite':
          return await this.addMailerliteSubscriber(listId, subscriber);
        default:
          return false;
      }
    } catch (error) {
      console.error(`Error al añadir suscriptor en ${this.credentials.platform}:`, error);
      return false;
    }
  }

  /**
   * Añade un suscriptor a Mailchimp
   */
  private async addMailchimpSubscriber(listId: string, subscriber: Subscriber): Promise<boolean> {
    // Crear hash MD5 del email en minúsculas para Mailchimp
    const crypto = require('crypto');
    const emailHash = crypto
      .createHash('md5')
      .update(subscriber.email.toLowerCase())
      .digest('hex');

    const data = {
      email_address: subscriber.email,
      status: 'subscribed',
      merge_fields: {
        FNAME: subscriber.firstName || '',
        LNAME: subscriber.lastName || ''
      }
    };

    if (subscriber.tags && subscriber.tags.length > 0) {
      // Primero añadir el suscriptor
      const response = await axios.put(
        `${this.getBaseUrl()}/lists/${listId}/members/${emailHash}`,
        data,
        { 
          headers: { 
            'Authorization': `Basic ${Buffer.from(`anystring:${this.credentials.apiKey}`).toString('base64')}` 
          } 
        }
      );

      if (response.status !== 200) {
        return false;
      }

      // Luego añadir tags
      const tagData = {
        tags: subscriber.tags.map(tag => ({ name: tag, status: 'active' }))
      };

      const tagResponse = await axios.post(
        `${this.getBaseUrl()}/lists/${listId}/members/${emailHash}/tags`,
        tagData,
        { 
          headers: { 
            'Authorization': `Basic ${Buffer.from(`anystring:${this.credentials.apiKey}`).toString('base64')}` 
          } 
        }
      );

      return tagResponse.status === 204;
    } else {
      const response = await axios.put(
        `${this.getBaseUrl()}/lists/${listId}/members/${emailHash}`,
        data,
        { 
          headers: { 
            'Authorization': `Basic ${Buffer.from(`anystring:${this.credentials.apiKey}`).toString('base64')}` 
          } 
        }
      );

      return response.status === 200;
    }
  }

  /**
   * Añade un suscriptor a SendGrid
   */
  private async addSendgridSubscriber(listId: string, subscriber: Subscriber): Promise<boolean> {
    const data = {
      list_ids: [listId],
      contacts: [
        {
          email: subscriber.email,
          first_name: subscriber.firstName || '',
          last_name: subscriber.lastName || '',
          custom_fields: subscriber.customFields || {}
        }
      ]
    };

    const response = await axios.put(
      `${this.baseUrls.sendgrid}/marketing/contacts`,
      data,
      { 
        headers: { 
          'Authorization': `Bearer ${this.credentials.apiKey}`,
          'Content-Type': 'application/json'
        } 
      }
    );

    return response.status === 202;
  }

  /**
   * Añade un suscriptor a ConvertKit
   */
  private async addConvertkitSubscriber(listId: string, subscriber: Subscriber): Promise<boolean> {
    const data: any = {
      api_key: this.credentials.apiKey,
      email: subscriber.email,
      first_name: subscriber.firstName,
      fields: subscriber.customFields
    };

    if (subscriber.tags && subscriber.tags.length > 0) {
      data.tags = subscriber.tags;
    }

    const response = await axios.post(
      `${this.baseUrls.convertkit}/forms/${listId}/subscribe`,
      data
    );

    return !!response.data.subscription;
  }

  /**
   * Añade un suscriptor a MailerLite
   */
  private async addMailerliteSubscriber(listId: string, subscriber: Subscriber): Promise<boolean> {
    const data = {
      email: subscriber.email,
      fields: {
        name: subscriber.firstName,
        last_name: subscriber.lastName,
        ...subscriber.customFields
      },
      groups: [listId]
    };

    const response = await axios.post(
      `${this.baseUrls.mailerlite}/subscribers`,
      data,
      { 
        headers: { 
          'Authorization': `Bearer ${this.credentials.apiKey}`,
          'Content-Type': 'application/json'
        } 
      }
    );

    return response.status === 200;
  }

  /**
   * Crea y envía una campaña de email
   */
  async createCampaign(campaign: EmailCampaign): Promise<CampaignResponse> {
    try {
      switch (this.credentials.platform) {
        case 'mailchimp':
          return await this.createMailchimpCampaign(campaign);
        case 'sendgrid':
          return await this.createSendgridCampaign(campaign);
        case 'convertkit':
          return await this.createConvertkitCampaign(campaign);
        case 'mailerlite':
          return await this.createMailerliteCampaign(campaign);
        default:
          return { success: false, error: 'Plataforma no soportada' };
      }
    } catch (error) {
      console.error(`Error al crear campaña en ${this.credentials.platform}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  }

  /**
   * Crea una campaña en Mailchimp
   */
  private async createMailchimpCampaign(campaign: EmailCampaign): Promise<CampaignResponse> {
    // Primero crear la campaña
    const campaignData = {
      type: 'regular',
      recipients: {
        list_id: campaign.listId
      },
      settings: {
        subject_line: campaign.subject,
        title: campaign.name,
        from_name: campaign.fromName,
        reply_to: campaign.fromEmail
      }
    };

    const campaignResponse = await axios.post(
      `${this.getBaseUrl()}/campaigns`,
      campaignData,
      { 
        headers: { 
          'Authorization': `Basic ${Buffer.from(`anystring:${this.credentials.apiKey}`).toString('base64')}` 
        } 
      }
    );

    if (!campaignResponse.data.id) {
      return { success: false, error: 'Error al crear campaña' };
    }

    const campaignId = campaignResponse.data.id;

    // Luego establecer el contenido
    const contentData = {
      html: campaign.content
    };

    const contentResponse = await axios.put(
      `${this.getBaseUrl()}/campaigns/${campaignId}/content`,
      contentData,
      { 
        headers: { 
          'Authorization': `Basic ${Buffer.from(`anystring:${this.credentials.apiKey}`).toString('base64')}` 
        } 
      }
    );

    if (contentResponse.status !== 200) {
      return { success: false, error: 'Error al establecer contenido de la campaña' };
    }

    // Si hay una fecha programada
    if (campaign.scheduledTime) {
      const scheduleData = {
        schedule_time: campaign.scheduledTime.toISOString()
      };

      const scheduleResponse = await axios.post(
        `${this.getBaseUrl()}/campaigns/${campaignId}/actions/schedule`,
        scheduleData,
        { 
          headers: { 
            'Authorization': `Basic ${Buffer.from(`anystring:${this.credentials.apiKey}`).toString('base64')}` 
          } 
        }
      );

      if (scheduleResponse.status !== 204) {
        return { success: false, error: 'Error al programar la campaña' };
      }

      return { success: true, campaignId };
    } else {
      // Enviar inmediatamente
      const sendResponse = await axios.post(
        `${this.getBaseUrl()}/campaigns/${campaignId}/actions/send`,
        {},
        { 
          headers: { 
            'Authorization': `Basic ${Buffer.from(`anystring:${this.credentials.apiKey}`).toString('base64')}` 
          } 
        }
      );

      if (sendResponse.status !== 204) {
        return { success: false, error: 'Error al enviar la campaña' };
      }

      return { success: true, campaignId };
    }
  }

  /**
   * Crea una campaña en SendGrid
   */
  private async createSendgridCampaign(campaign: EmailCampaign): Promise<CampaignResponse> {
    // Crear el diseño de email
    const designData = {
      name: `Design for ${campaign.name}`,
      html_content: campaign.content
    };

    const designResponse = await axios.post(
      `${this.baseUrls.sendgrid}/designs`,
      designData,
      { 
        headers: { 
          'Authorization': `Bearer ${this.credentials.apiKey}`,
          'Content-Type': 'application/json'
        } 
      }
    );

    if (!designResponse.data.id) {
      return { success: false, error: 'Error al crear diseño de email' };
    }

    // Crear la campaña
    const campaignData = {
      name: campaign.name,
      sender_id: 1, // Esto debería venir de la configuración del usuario
      subject: campaign.subject,
      list_ids: [campaign.listId],
      design_id: designResponse.data.id,
      suppression_group_id: 1, // Esto debería venir de la configuración del usuario
      custom_unsubscribe_url: '',
      send_at: campaign.scheduledTime ? Math.floor(campaign.scheduledTime.getTime() / 1000) : null
    };

    const campaignResponse = await axios.post(
      `${this.baseUrls.sendgrid}/marketing/singlesends`,
      campaignData,
      { 
        headers: { 
          'Authorization': `Bearer ${this.credentials.apiKey}`,
          'Content-Type': 'application/json'
        } 
      }
    );

    if (!campaignResponse.data.id) {
      return { success: false, error: 'Error al crear campaña' };
    }

    // Si no hay fecha programada, enviar inmediatamente
    if (!campaign.scheduledTime) {
      const sendResponse = await axios.post(
        `${this.baseUrls.sendgrid}/marketing/singlesends/${campaignResponse.data.id}/schedule`,
        { send_at: 'now' },
        { 
          headers: { 
            'Authorization': `Bearer ${this.credentials.apiKey}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      if (sendResponse.status !== 200) {
        return { success: false, error: 'Error al enviar la campaña' };
      }
    }

    return { success: true, campaignId: campaignResponse.data.id };
  }

  /**
   * Crea una campaña en ConvertKit
   */
  private async createConvertkitCampaign(campaign: EmailCampaign): Promise<CampaignResponse> {
    // ConvertKit usa "broadcasts" en lugar de campañas
    const data = {
      api_key: this.credentials.apiKey,
      broadcast: {
        subject: campaign.subject,
        content: campaign.content,
        email_layout_template: 'default',
        recipients: [
          {
            type: 'form',
            id: campaign.listId
          }
        ]
      }
    };

    const response = await axios.post(
      `${this.baseUrls.convertkit}/broadcasts`,
      data
    );

    if (!response.data.id) {
      return { success: false, error: 'Error al crear broadcast' };
    }

    // Si hay una fecha programada
    if (campaign.scheduledTime) {
      const scheduleData = {
        api_key: this.credentials.apiKey,
        broadcast: {
          published_at: campaign.scheduledTime.toISOString()
        }
      };

      await axios.put(
        `${this.baseUrls.convertkit}/broadcasts/${response.data.id}`,
        scheduleData
      );
    } else {
      // Enviar inmediatamente
      const sendData = {
        api_key: this.credentials.apiKey
      };

      await axios.post(
        `${this.baseUrls.convertkit}/broadcasts/${response.data.id}/send`,
        sendData
      );
    }

    return { success: true, campaignId: response.data.id.toString() };
  }

  /**
   * Crea una campaña en MailerLite
   */
  private async createMailerliteCampaign(campaign: EmailCampaign): Promise<CampaignResponse> {
    const data = {
      name: campaign.name,
      subject: campaign.subject,
      from: campaign.fromEmail,
      from_name: campaign.fromName,
      groups: [campaign.listId],
      html: campaign.content,
      type: 'regular'
    };

    const response = await axios.post(
      `${this.baseUrls.mailerlite}/campaigns`,
      data,
      { 
        headers: { 
          'Authorization': `Bearer ${this.credentials.apiKey}`,
          'Content-Type': 'application/json'
        } 
      }
    );

    if (!response.data.id) {
      return { success: false, error: 'Error al crear campaña' };
    }

    // Si hay una fecha programada
    if (campaign.scheduledTime) {
      const scheduleData = {
        delivery: {
          type: 'scheduled',
          schedule: {
            date: campaign.scheduledTime.toISOString().split('T')[0],
            hours: campaign.scheduledTime.getHours(),
            minutes: campaign.scheduledTime.getMinutes()
          }
        }
      };

      await axios.put(
        `${this.baseUrls.mailerlite}/campaigns/${response.data.id}`,
        scheduleData,
        { 
          headers: { 
            'Authorization': `Bearer ${this.credentials.apiKey}`,
            'Content-Type': 'application/json'
          } 
        }
      );
    } else {
      // Enviar inmediatamente
      await axios.post(
        `${this.baseUrls.mailerlite}/campaigns/${response.data.id}/actions/send`,
        {},
        { 
          headers: { 
            'Authorization': `Bearer ${this.credentials.apiKey}`,
            'Content-Type': 'application/json'
          } 
        }
      );
    }

    return { success: true, campaignId: response.data.id.toString() };
  }

  /**
   * Obtiene métricas de una campaña
   */
  async getCampaignMetrics(campaignId: string): Promise<CampaignMetrics | null> {
    try {
      switch (this.credentials.platform) {
        case 'mailchimp':
          return await this.getMailchimpCampaignMetrics(campaignId);
        // Implementaciones para otras plataformas
        // Omitidas por brevedad
        default:
          return null;
      }
    } catch (error) {
      console.error(`Error al obtener métricas de campaña en ${this.credentials.platform}:`, error);
      return null;
    }
  }

  /**
   * Obtiene métricas de una campaña en Mailchimp
   */
  private async getMailchimpCampaignMetrics(campaignId: string): Promise<CampaignMetrics | null> {
    const response = await axios.get(
      `${this.getBaseUrl()}/reports/${campaignId}`,
      { 
        headers: { 
          'Authorization': `Basic ${Buffer.from(`anystring:${this.credentials.apiKey}`).toString('base64')}` 
        } 
      }
    );

    const data = response.data;
    
    return {
      sent: data.emails_sent,
      opens: data.opens.unique_opens,
      clicks: data.clicks.unique_clicks,
      bounces: data.bounces.hard_bounces + data.bounces.soft_bounces,
      unsubscribes: data.unsubscribes,
      openRate: data.opens.open_rate,
      clickRate: data.clicks.click_rate
    };
  }
}

/**
 * Fábrica de conectores de email marketing
 */
export class EmailConnectorFactory {
  /**
   * Crea un conector para la plataforma especificada
   */
  static async createConnector(userId: string, platform: EmailPlatform): Promise<EmailConnector | null> {
    const credentials = await EmailConnector.getCredentialsFromSupabase(userId, platform);
    
    if (!credentials) {
      console.error(`No se encontraron credenciales para ${platform}`);
      return null;
    }
    
    const connector = new EmailConnector(credentials);
    const isValid = await connector.verifyCredentials();
    
    if (!isValid) {
      console.error(`Credenciales inválidas para ${platform}`);
      return null;
    }
    
    return connector;
  }
}
