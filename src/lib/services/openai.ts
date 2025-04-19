/**
 * Integración con la API de OpenAI para GENIA
 * 
 * Este módulo proporciona una interfaz unificada para interactuar con
 * los diferentes servicios de OpenAI, incluyendo generación de texto,
 * análisis de intenciones y generación de imágenes.
 */

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import imageConnector, { ImageConnector, ImageGenerationOptions } from '../connectors/image';

// Modelos disponibles para generación de texto
export enum TextModel {
  GPT_4 = 'gpt-4-turbo-preview',
  GPT_4_VISION = 'gpt-4-vision-preview',
  GPT_3_5_TURBO = 'gpt-3.5-turbo'
}

// Interfaz para opciones de generación de texto
export interface TextGenerationOptions {
  model?: TextModel;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  systemMessage?: string;
  user?: string;
}

// Interfaz para resultado de generación de texto
export interface TextGenerationResult {
  success: boolean;
  text?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model?: string;
  error?: string;
  status?: number;
}

// Interfaz para intención detectada
export interface IntentAnalysisResult {
  success: boolean;
  primaryIntent?: string;
  secondaryIntent?: string;
  entities?: Record<string, string>;
  confidence?: number;
  rawResponse?: any;
  error?: string;
  status?: number;
  fallbackIntent?: {
    primaryIntent: string;
    entities: Record<string, string>;
    confidence: number;
  };
}

/**
 * Clase principal para interactuar con OpenAI
 */
export class OpenAIService {
  private apiKey: string;
  private readonly OPENAI_API_URL = 'https://api.openai.com/v1';
  private imageConnector: ImageConnector;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('Se requiere una API key de OpenAI');
    }
    this.imageConnector = new ImageConnector(this.apiKey);
  }

  /**
   * Genera texto utilizando la API de OpenAI
   */
  async generateText(prompt: string, options: TextGenerationOptions = {}): Promise<TextGenerationResult> {
    try {
      const {
        model = TextModel.GPT_4,
        temperature = 0.7,
        maxTokens = 1000,
        topP = 1,
        frequencyPenalty = 0,
        presencePenalty = 0,
        systemMessage = 'Eres GENIA, un asistente de IA especializado en marketing y negocios.',
        user = uuidv4()
      } = options;

      const messages = [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ];

      const response = await axios.post(
        `${this.OPENAI_API_URL}/chat/completions`,
        {
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          top_p: topP,
          frequency_penalty: frequencyPenalty,
          presence_penalty: presencePenalty,
          user
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return {
        success: true,
        text: response.data.choices[0].message.content,
        usage: response.data.usage,
        model: response.data.model
      };
    } catch (error: any) {
      console.error('Error al generar texto:', error);
      
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        status: error.response?.status
      };
    }
  }

  /**
   * Analiza la intención del usuario utilizando GPT
   */
  async analyzeIntent(message: string): Promise<IntentAnalysisResult> {
    try {
      const systemPrompt = `
        Eres un analizador de intenciones para GENIA, un asistente de IA especializado en marketing y negocios.
        Tu tarea es analizar el mensaje del usuario y determinar su intención principal, intención secundaria (si existe),
        y extraer entidades relevantes. Responde en formato JSON con la siguiente estructura:
        {
          "primaryIntent": "nombre_de_la_intencion",
          "secondaryIntent": "nombre_de_la_intencion_secundaria",
          "entities": { "entidad1": "valor1", "entidad2": "valor2" },
          "confidence": 0.95
        }
        
        Las intenciones posibles son:
        - content_creation: Creación de contenido para blogs, redes sociales, email, etc.
        - advertising: Diseño y gestión de campañas publicitarias
        - business_strategy: Análisis estratégico y recomendaciones empresariales
        - funnel_optimization: Optimización de embudos de conversión
        - voice_communication: Comandos por voz y comunicación verbal
        - time_management: Gestión de productividad y agenda
        - general_query: Consulta general que no encaja en las categorías anteriores
        
        Extrae entidades relevantes como:
        - contentType: blog, social_media, email, etc.
        - adPlatform: facebook, google, instagram, etc.
        - businessSector: ecommerce, saas, education, etc.
        - timeframe: short_term, medium_term, long_term
        
        Asigna un valor de confianza entre 0 y 1 basado en la claridad de la intención.
      `;

      const response = await axios.post(
        `${this.OPENAI_API_URL}/chat/completions`,
        {
          model: TextModel.GPT_4,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature: 0.3,
          max_tokens: 500,
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      const intentData = JSON.parse(response.data.choices[0].message.content);
      
      return {
        success: true,
        ...intentData,
        rawResponse: response.data
      };
    } catch (error: any) {
      console.error('Error al analizar intención:', error);
      
      // Fallback a un análisis básico basado en palabras clave
      const fallbackIntent = this.fallbackIntentAnalysis(message);
      
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        status: error.response?.status,
        fallbackIntent
      };
    }
  }

  /**
   * Análisis de intención de respaldo basado en palabras clave
   */
  private fallbackIntentAnalysis(message: string): { primaryIntent: string; entities: Record<string, string>; confidence: number } {
    const message_lower = message.toLowerCase();
    
    // Detectar intenciones relacionadas con contenido
    if (message_lower.includes('contenido') || 
        message_lower.includes('artículo') || 
        message_lower.includes('blog') ||
        message_lower.includes('post') ||
        message_lower.includes('escribir')) {
      return {
        primaryIntent: 'content_creation',
        entities: { contentType: this.detectContentType(message_lower) },
        confidence: 0.7
      };
    }
    
    // Detectar intenciones relacionadas con publicidad
    if (message_lower.includes('anuncio') || 
        message_lower.includes('publicidad') || 
        message_lower.includes('campaña') ||
        message_lower.includes('ads') ||
        message_lower.includes('promocionar')) {
      return {
        primaryIntent: 'advertising',
        entities: { adPlatform: this.detectAdPlatform(message_lower) },
        confidence: 0.7
      };
    }
    
    // Detectar intenciones relacionadas con estrategia empresarial
    if (message_lower.includes('estrategia') || 
        message_lower.includes('negocio') || 
        message_lower.includes('empresa') ||
        message_lower.includes('crecimiento') ||
        message_lower.includes('plan')) {
      return {
        primaryIntent: 'business_strategy',
        entities: {},
        confidence: 0.7
      };
    }
    
    // Intención por defecto
    return {
      primaryIntent: 'general_query',
      entities: {},
      confidence: 0.5
    };
  }

  /**
   * Detecta el tipo de contenido mencionado en el mensaje
   */
  private detectContentType(message: string): string {
    if (message.includes('blog') || message.includes('artículo')) {
      return 'blog';
    }
    
    if (message.includes('instagram') || message.includes('post')) {
      return 'social_media';
    }
    
    if (message.includes('email') || message.includes('correo')) {
      return 'email';
    }
    
    return 'general';
  }
  
  /**
   * Detecta la plataforma de anuncios mencionada en el mensaje
   */
  private detectAdPlatform(message: string): string {
    if (message.includes('facebook') || message.includes('meta')) {
      return 'facebook';
    }
    
    if (message.includes('google') || message.includes('adwords')) {
      return 'google';
    }
    
    if (message.includes('instagram')) {
      return 'instagram';
    }
    
    if (message.includes('linkedin')) {
      return 'linkedin';
    }
    
    return 'general';
  }

  /**
   * Genera una imagen basada en un prompt
   */
  async generateImage(prompt: string, options: ImageGenerationOptions = {}) {
    return this.imageConnector.generateImage(prompt, options);
  }

  /**
   * Genera y guarda una imagen en un solo paso
   */
  async generateAndSaveImage(prompt: string, userId: string, options: ImageGenerationOptions = {}) {
    return this.imageConnector.generateAndSaveImage(prompt, userId, options);
  }

  /**
   * Obtiene imágenes generadas por un usuario
   */
  async getUserImages(userId: string, limit: number = 10) {
    return this.imageConnector.getUserImages(userId, limit);
  }

  /**
   * Obtiene credenciales de OpenAI desde Supabase
   */
  static async getCredentialsFromSupabase(userId: string): Promise<string | null> {
    return ImageConnector.getCredentialsFromSupabase(userId);
  }
}

// Crear una instancia por defecto para uso en la aplicación
const openAIService = new OpenAIService();
export default openAIService;
