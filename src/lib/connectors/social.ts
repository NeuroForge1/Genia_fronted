/**
 * Conectores para redes sociales
 * 
 * Este módulo proporciona conectores para interactuar con diferentes plataformas
 * de redes sociales, permitiendo a GENIA ejecutar tareas reales como publicar
 * contenido, programar publicaciones, analizar métricas, etc.
 */

import axios from 'axios';
import { supabaseClient } from '../supabase';

// Tipos de plataformas soportadas
export type SocialPlatform = 'facebook' | 'twitter' | 'instagram' | 'linkedin';

// Tipos de contenido que se pueden publicar
export type ContentType = 'text' | 'image' | 'video' | 'link';

// Interfaz para credenciales de redes sociales
export interface SocialCredentials {
  platform: SocialPlatform;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  userId?: string;
  pageId?: string;
}

// Interfaz para contenido a publicar
export interface SocialContent {
  type: ContentType;
  text?: string;
  mediaUrl?: string;
  linkUrl?: string;
  scheduledTime?: Date;
}

// Interfaz para respuesta de publicación
export interface PostResponse {
  success: boolean;
  postId?: string;
  url?: string;
  error?: string;
}

// Interfaz para métricas de publicación
export interface PostMetrics {
  likes: number;
  shares: number;
  comments: number;
  reach: number;
  engagement: number;
}

/**
 * Clase principal para gestionar conectores de redes sociales
 */
export class SocialConnector {
  private credentials: SocialCredentials;
  private baseUrls: Record<SocialPlatform, string> = {
    facebook: 'https://graph.facebook.com/v16.0',
    twitter: 'https://api.twitter.com/2',
    instagram: 'https://graph.instagram.com/v16.0',
    linkedin: 'https://api.linkedin.com/v2'
  };

  constructor(credentials: SocialCredentials) {
    this.credentials = credentials;
  }

  /**
   * Obtiene credenciales de redes sociales desde Supabase
   */
  static async getCredentialsFromSupabase(userId: string, platform: SocialPlatform): Promise<SocialCredentials | null> {
    const { data, error } = await supabaseClient
      .from('social_credentials')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', platform)
      .single();

    if (error || !data) {
      console.error('Error al obtener credenciales:', error);
      return null;
    }

    return {
      platform: data.platform as SocialPlatform,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_at,
      userId: data.platform_user_id,
      pageId: data.page_id
    };
  }

  /**
   * Verifica si las credenciales son válidas
   */
  async verifyCredentials(): Promise<boolean> {
    try {
      switch (this.credentials.platform) {
        case 'facebook':
          const fbResponse = await axios.get(
            `${this.baseUrls.facebook}/me`,
            { params: { access_token: this.credentials.accessToken } }
          );
          return !!fbResponse.data.id;

        case 'twitter':
          const twitterResponse = await axios.get(
            `${this.baseUrls.twitter}/users/me`,
            { 
              headers: { 
                'Authorization': `Bearer ${this.credentials.accessToken}` 
              } 
            }
          );
          return !!twitterResponse.data.data.id;

        case 'instagram':
          const igResponse = await axios.get(
            `${this.baseUrls.instagram}/me`,
            { params: { access_token: this.credentials.accessToken, fields: 'id,username' } }
          );
          return !!igResponse.data.id;

        case 'linkedin':
          const liResponse = await axios.get(
            `${this.baseUrls.linkedin}/me`,
            { 
              headers: { 
                'Authorization': `Bearer ${this.credentials.accessToken}` 
              } 
            }
          );
          return !!liResponse.data.id;

        default:
          return false;
      }
    } catch (error) {
      console.error('Error al verificar credenciales:', error);
      return false;
    }
  }

  /**
   * Publica contenido en la red social
   */
  async publishContent(content: SocialContent): Promise<PostResponse> {
    try {
      switch (this.credentials.platform) {
        case 'facebook':
          return await this.publishToFacebook(content);
        case 'twitter':
          return await this.publishToTwitter(content);
        case 'instagram':
          return await this.publishToInstagram(content);
        case 'linkedin':
          return await this.publishToLinkedin(content);
        default:
          return { success: false, error: 'Plataforma no soportada' };
      }
    } catch (error) {
      console.error(`Error al publicar en ${this.credentials.platform}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  }

  /**
   * Publica contenido en Facebook
   */
  private async publishToFacebook(content: SocialContent): Promise<PostResponse> {
    const endpoint = this.credentials.pageId 
      ? `${this.baseUrls.facebook}/${this.credentials.pageId}/feed`
      : `${this.baseUrls.facebook}/me/feed`;

    const params: Record<string, any> = {
      access_token: this.credentials.accessToken,
      message: content.text || ''
    };

    if (content.linkUrl) {
      params.link = content.linkUrl;
    }

    if (content.scheduledTime) {
      params.published = false;
      params.scheduled_publish_time = Math.floor(content.scheduledTime.getTime() / 1000);
    }

    // Para imágenes y videos, se requiere un proceso diferente con upload
    if (content.type === 'image' || content.type === 'video') {
      // Implementación simplificada - en producción se necesitaría manejar uploads
      if (content.mediaUrl) {
        params.link = content.mediaUrl; // Esto es una simplificación
      }
    }

    const response = await axios.post(endpoint, null, { params });

    return {
      success: !!response.data.id,
      postId: response.data.id,
      url: `https://facebook.com/${response.data.id}`,
    };
  }

  /**
   * Publica contenido en Twitter
   */
  private async publishToTwitter(content: SocialContent): Promise<PostResponse> {
    const endpoint = `${this.baseUrls.twitter}/tweets`;
    
    const data: Record<string, any> = {
      text: content.text || ''
    };

    // Para medios, se necesitaría primero subirlos y obtener media_ids
    // Esta es una implementación simplificada

    const response = await axios.post(
      endpoint, 
      data,
      { 
        headers: { 
          'Authorization': `Bearer ${this.credentials.accessToken}`,
          'Content-Type': 'application/json'
        } 
      }
    );

    return {
      success: !!response.data.data.id,
      postId: response.data.data.id,
      url: `https://twitter.com/user/status/${response.data.data.id}`,
    };
  }

  /**
   * Publica contenido en Instagram
   */
  private async publishToInstagram(content: SocialContent): Promise<PostResponse> {
    // Instagram requiere un proceso más complejo con Facebook Graph API
    // Esta es una implementación simplificada
    
    if (!this.credentials.pageId) {
      return { success: false, error: 'Se requiere un Instagram Business Account vinculado a una página de Facebook' };
    }

    // Para publicar en Instagram, primero se crea un contenedor
    const containerEndpoint = `${this.baseUrls.facebook}/${this.credentials.pageId}/media`;
    
    const containerParams: Record<string, any> = {
      access_token: this.credentials.accessToken,
      caption: content.text || ''
    };

    if (content.type === 'image' && content.mediaUrl) {
      containerParams.image_url = content.mediaUrl;
    } else if (content.type === 'video' && content.mediaUrl) {
      containerParams.media_type = 'VIDEO';
      containerParams.video_url = content.mediaUrl;
    } else {
      return { success: false, error: 'Instagram requiere una imagen o video' };
    }

    const containerResponse = await axios.post(containerEndpoint, null, { params: containerParams });
    
    if (!containerResponse.data.id) {
      return { success: false, error: 'Error al crear contenedor de medios' };
    }

    // Luego se publica el contenedor
    const publishEndpoint = `${this.baseUrls.facebook}/${this.credentials.pageId}/media_publish`;
    const publishParams = {
      access_token: this.credentials.accessToken,
      creation_id: containerResponse.data.id
    };

    const publishResponse = await axios.post(publishEndpoint, null, { params: publishParams });

    return {
      success: !!publishResponse.data.id,
      postId: publishResponse.data.id,
      // Instagram no proporciona URL directa en la API
      url: `https://instagram.com/p/${publishResponse.data.id}`,
    };
  }

  /**
   * Publica contenido en LinkedIn
   */
  private async publishToLinkedin(content: SocialContent): Promise<PostResponse> {
    const endpoint = `${this.baseUrls.linkedin}/ugcPosts`;
    
    const data: Record<string, any> = {
      author: `urn:li:person:${this.credentials.userId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content.text || ''
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    if (content.linkUrl) {
      data.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'ARTICLE';
      data.specificContent['com.linkedin.ugc.ShareContent'].media = [
        {
          status: 'READY',
          originalUrl: content.linkUrl
        }
      ];
    }

    // Para imágenes y videos, se requiere un proceso más complejo
    // Esta es una implementación simplificada

    const response = await axios.post(
      endpoint, 
      data,
      { 
        headers: { 
          'Authorization': `Bearer ${this.credentials.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        } 
      }
    );

    return {
      success: !!response.data.id,
      postId: response.data.id,
      url: `https://www.linkedin.com/feed/update/${response.data.id}`,
    };
  }

  /**
   * Obtiene métricas de una publicación
   */
  async getPostMetrics(postId: string): Promise<PostMetrics | null> {
    try {
      switch (this.credentials.platform) {
        case 'facebook':
          const fbResponse = await axios.get(
            `${this.baseUrls.facebook}/${postId}/insights`,
            { 
              params: { 
                access_token: this.credentials.accessToken,
                metric: 'post_impressions,post_engagements,post_reactions_by_type_total,post_clicks'
              } 
            }
          );
          
          // Procesamiento simplificado de métricas
          return {
            likes: this.extractMetricValue(fbResponse.data, 'post_reactions_by_type_total', 'like') || 0,
            shares: this.extractMetricValue(fbResponse.data, 'post_reactions_by_type_total', 'share') || 0,
            comments: this.extractMetricValue(fbResponse.data, 'post_reactions_by_type_total', 'comment') || 0,
            reach: this.extractMetricValue(fbResponse.data, 'post_impressions', 'unique') || 0,
            engagement: this.extractMetricValue(fbResponse.data, 'post_engagements', 'total') || 0
          };

        // Implementaciones similares para otras plataformas
        // Omitidas por brevedad

        default:
          return null;
      }
    } catch (error) {
      console.error(`Error al obtener métricas de ${this.credentials.platform}:`, error);
      return null;
    }
  }

  /**
   * Extrae valor de métrica de respuesta de Facebook
   */
  private extractMetricValue(data: any, metricName: string, valueName: string): number | null {
    if (!data || !data.data) return null;
    
    const metric = data.data.find((m: any) => m.name === metricName);
    if (!metric || !metric.values || !metric.values[0] || !metric.values[0].value) {
      return null;
    }
    
    const value = metric.values[0].value;
    return typeof value === 'object' ? value[valueName] || null : value;
  }
}

/**
 * Fábrica de conectores sociales
 */
export class SocialConnectorFactory {
  /**
   * Crea un conector para la plataforma especificada
   */
  static async createConnector(userId: string, platform: SocialPlatform): Promise<SocialConnector | null> {
    const credentials = await SocialConnector.getCredentialsFromSupabase(userId, platform);
    
    if (!credentials) {
      console.error(`No se encontraron credenciales para ${platform}`);
      return null;
    }
    
    const connector = new SocialConnector(credentials);
    const isValid = await connector.verifyCredentials();
    
    if (!isValid) {
      console.error(`Credenciales inválidas para ${platform}`);
      return null;
    }
    
    return connector;
  }
}
