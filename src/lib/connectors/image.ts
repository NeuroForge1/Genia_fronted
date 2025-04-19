/**
 * Conector para generación de imágenes con OpenAI
 * 
 * Este módulo proporciona funcionalidades para generar imágenes utilizando
 * la API de OpenAI (DALL-E) y almacenarlas para su uso en contenido.
 */

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { supabaseClient } from '../supabase';

// Modelos disponibles para generación de imágenes
export enum ImageModel {
  DALLE3 = 'dall-e-3',
  DALLE2 = 'dall-e-2'
}

// Tamaños disponibles para las imágenes
export enum ImageSize {
  SMALL = '256x256',    // Solo para DALL-E 2
  MEDIUM = '512x512',   // Solo para DALL-E 2
  LARGE = '1024x1024',  // Disponible para ambos modelos
  WIDE = '1792x1024',   // Solo para DALL-E 3
  TALL = '1024x1792'    // Solo para DALL-E 3
}

// Formatos de salida
export enum OutputFormat {
  URL = 'url',
  B64_JSON = 'b64_json'
}

// Estilos disponibles (solo para DALL-E 3)
export enum ImageStyle {
  VIVID = 'vivid',
  NATURAL = 'natural'
}

// Calidad disponible (solo para DALL-E 3)
export enum ImageQuality {
  STANDARD = 'standard',
  HD = 'hd'
}

// Interfaz para opciones de generación de imágenes
export interface ImageGenerationOptions {
  model?: ImageModel;
  size?: ImageSize;
  n?: number;
  quality?: ImageQuality;
  style?: ImageStyle;
  responseFormat?: OutputFormat;
  user?: string;
}

// Interfaz para resultado de generación de imagen
export interface ImageGenerationResult {
  success: boolean;
  data?: any[];
  created?: number;
  urls?: string[];
  error?: string;
  status?: number;
}

// Interfaz para resultado de almacenamiento de imagen
export interface ImageStorageResult {
  success: boolean;
  publicUrl?: string;
  storagePath?: string;
  error?: string;
}

// Interfaz para resultado de generación y almacenamiento
export interface GenerateAndSaveResult {
  success: boolean;
  originalUrl?: string;
  storedUrl?: string;
  storagePath?: string;
  prompt?: string;
  error?: string;
}

// Interfaz para imagen generada almacenada
export interface StoredImage {
  id: string;
  user_id: string;
  prompt: string;
  storage_path: string;
  public_url: string;
  created_at: string;
}

/**
 * Clase principal para generación de imágenes
 */
export class ImageConnector {
  private apiKey: string;
  private readonly OPENAI_API_URL = 'https://api.openai.com/v1/images/generations';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('Se requiere una API key de OpenAI para la generación de imágenes');
    }
  }

  /**
   * Genera una imagen basada en un prompt
   */
  async generateImage(prompt: string, options: ImageGenerationOptions = {}): Promise<ImageGenerationResult> {
    try {
      const {
        model = ImageModel.DALLE3,
        size = ImageSize.LARGE,
        n = 1,
        quality = ImageQuality.STANDARD,
        style = ImageStyle.VIVID,
        responseFormat = OutputFormat.URL,
        user = uuidv4()
      } = options;

      // Validar el modelo
      if (!Object.values(ImageModel).includes(model)) {
        throw new Error(`Modelo no válido: ${model}`);
      }

      // Validar el tamaño según el modelo
      if (model === ImageModel.DALLE3) {
        if (![ImageSize.LARGE, ImageSize.WIDE, ImageSize.TALL].includes(size)) {
          throw new Error(`Tamaño no válido para DALL-E 3: ${size}`);
        }
      } else if (model === ImageModel.DALLE2) {
        if (![ImageSize.SMALL, ImageSize.MEDIUM, ImageSize.LARGE].includes(size)) {
          throw new Error(`Tamaño no válido para DALL-E 2: ${size}`);
        }
      }

      // Configurar la solicitud
      const requestData: any = {
        model,
        prompt,
        n,
        size,
        response_format: responseFormat,
        user
      };

      // Añadir opciones específicas de DALL-E 3
      if (model === ImageModel.DALLE3) {
        requestData.quality = quality;
        requestData.style = style;
      }

      // Realizar la solicitud a la API
      const response = await axios.post(this.OPENAI_API_URL, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      // Procesar la respuesta
      const result: ImageGenerationResult = {
        success: true,
        data: response.data.data,
        created: response.data.created
      };

      // Si se solicitó formato URL, extraer las URLs
      if (responseFormat === OutputFormat.URL) {
        result.urls = response.data.data.map((item: any) => item.url);
      }

      return result;
    } catch (error: any) {
      console.error('Error al generar imagen:', error);
      
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        status: error.response?.status
      };
    }
  }

  /**
   * Guarda una imagen generada en Supabase Storage
   */
  async saveImageToStorage(imageUrl: string, userId: string, prompt: string): Promise<ImageStorageResult> {
    try {
      // Descargar la imagen
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(imageResponse.data, 'binary');
      
      // Generar nombre único para la imagen
      const fileName = `${uuidv4()}.png`;
      const filePath = `${userId}/${fileName}`;
      
      // Subir a Supabase Storage
      const { data, error } = await supabaseClient
        .storage
        .from('genia_images')
        .upload(filePath, buffer, {
          contentType: 'image/png',
          upsert: false
        });
      
      if (error) {
        throw new Error(`Error al guardar imagen en Storage: ${error.message}`);
      }
      
      // Obtener URL pública
      const { data: urlData } = supabaseClient
        .storage
        .from('genia_images')
        .getPublicUrl(filePath);
      
      // Registrar en la base de datos
      const { data: dbData, error: dbError } = await supabaseClient
        .from('generated_images')
        .insert([
          {
            user_id: userId,
            prompt,
            storage_path: filePath,
            public_url: urlData.publicUrl,
            created_at: new Date().toISOString()
          }
        ]);
      
      if (dbError) {
        throw new Error(`Error al registrar imagen en base de datos: ${dbError.message}`);
      }
      
      return {
        success: true,
        publicUrl: urlData.publicUrl,
        storagePath: filePath
      };
    } catch (error: any) {
      console.error('Error al guardar imagen:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Genera y guarda una imagen en un solo paso
   */
  async generateAndSaveImage(prompt: string, userId: string, options: ImageGenerationOptions = {}): Promise<GenerateAndSaveResult> {
    try {
      // Generar la imagen
      const generationResult = await this.generateImage(prompt, options);
      
      if (!generationResult.success) {
        throw new Error(`Error al generar imagen: ${generationResult.error}`);
      }
      
      // Obtener la primera URL (si se generaron múltiples imágenes)
      const imageUrl = generationResult.urls?.[0];
      
      if (!imageUrl) {
        throw new Error('No se generó ninguna URL de imagen');
      }
      
      // Guardar la imagen
      const saveResult = await this.saveImageToStorage(imageUrl, userId, prompt);
      
      if (!saveResult.success) {
        throw new Error(`Error al guardar imagen: ${saveResult.error}`);
      }
      
      return {
        success: true,
        originalUrl: imageUrl,
        storedUrl: saveResult.publicUrl,
        storagePath: saveResult.storagePath,
        prompt
      };
    } catch (error: any) {
      console.error('Error al generar y guardar imagen:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtiene imágenes generadas por un usuario
   */
  async getUserImages(userId: string, limit: number = 10): Promise<{ success: boolean, images?: StoredImage[], error?: string }> {
    try {
      const { data, error } = await supabaseClient
        .from('generated_images')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        throw new Error(`Error al obtener imágenes: ${error.message}`);
      }
      
      return {
        success: true,
        images: data as StoredImage[]
      };
    } catch (error: any) {
      console.error('Error al obtener imágenes del usuario:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtiene credenciales de OpenAI desde Supabase
   */
  static async getCredentialsFromSupabase(userId: string): Promise<string | null> {
    const { data, error } = await supabaseClient
      .from('api_credentials')
      .select('api_key')
      .eq('user_id', userId)
      .eq('service', 'openai')
      .single();

    if (error || !data) {
      console.error('Error al obtener credenciales de OpenAI:', error);
      return null;
    }

    return data.api_key;
  }
}

// Crear una instancia por defecto para uso en la aplicación
const imageConnector = new ImageConnector();
export default imageConnector;
