/**
 * Módulo de generación de imágenes para GENIA
 * 
 * Este módulo proporciona funcionalidades para generar imágenes utilizando
 * la API de OpenAI (DALL-E) y almacenarlas para su uso en contenido.
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { supabaseClient } = require('../lib/supabase');

// Configuración de la API de OpenAI
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/images/generations';

// Modelos disponibles para generación de imágenes
const IMAGE_MODELS = {
  DALLE3: 'dall-e-3',
  DALLE2: 'dall-e-2'
};

// Tamaños disponibles para las imágenes
const IMAGE_SIZES = {
  SMALL: '256x256',    // Solo para DALL-E 2
  MEDIUM: '512x512',   // Solo para DALL-E 2
  LARGE: '1024x1024',  // Disponible para ambos modelos
  WIDE: '1792x1024',   // Solo para DALL-E 3
  TALL: '1024x1792'    // Solo para DALL-E 3
};

// Formatos de salida
const OUTPUT_FORMATS = {
  URL: 'url',
  B64_JSON: 'b64_json'
};

// Estilos disponibles (solo para DALL-E 3)
const STYLES = {
  VIVID: 'vivid',
  NATURAL: 'natural'
};

// Calidad disponible (solo para DALL-E 3)
const QUALITY = {
  STANDARD: 'standard',
  HD: 'hd'
};

/**
 * Clase principal para generación de imágenes
 */
class ImageGenerator {
  constructor(apiKey = OPENAI_API_KEY) {
    if (!apiKey) {
      throw new Error('Se requiere una API key de OpenAI para la generación de imágenes');
    }
    this.apiKey = apiKey;
  }

  /**
   * Genera una imagen basada en un prompt
   * @param {string} prompt - Descripción de la imagen a generar
   * @param {Object} options - Opciones de generación
   * @returns {Promise<Object>} - Objeto con la URL de la imagen generada
   */
  async generateImage(prompt, options = {}) {
    try {
      const {
        model = IMAGE_MODELS.DALLE3,
        size = IMAGE_SIZES.LARGE,
        n = 1,
        quality = QUALITY.STANDARD,
        style = STYLES.VIVID,
        responseFormat = OUTPUT_FORMATS.URL,
        user = uuidv4()
      } = options;

      // Validar el modelo
      if (!Object.values(IMAGE_MODELS).includes(model)) {
        throw new Error(`Modelo no válido: ${model}`);
      }

      // Validar el tamaño según el modelo
      if (model === IMAGE_MODELS.DALLE3) {
        if (![IMAGE_SIZES.LARGE, IMAGE_SIZES.WIDE, IMAGE_SIZES.TALL].includes(size)) {
          throw new Error(`Tamaño no válido para DALL-E 3: ${size}`);
        }
      } else if (model === IMAGE_MODELS.DALLE2) {
        if (![IMAGE_SIZES.SMALL, IMAGE_SIZES.MEDIUM, IMAGE_SIZES.LARGE].includes(size)) {
          throw new Error(`Tamaño no válido para DALL-E 2: ${size}`);
        }
      }

      // Configurar la solicitud
      const requestData = {
        model,
        prompt,
        n,
        size,
        response_format: responseFormat,
        user
      };

      // Añadir opciones específicas de DALL-E 3
      if (model === IMAGE_MODELS.DALLE3) {
        requestData.quality = quality;
        requestData.style = style;
      }

      // Realizar la solicitud a la API
      const response = await axios.post(OPENAI_API_URL, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      // Procesar la respuesta
      const result = {
        success: true,
        data: response.data.data,
        created: response.data.created
      };

      // Si se solicitó formato URL, extraer las URLs
      if (responseFormat === OUTPUT_FORMATS.URL) {
        result.urls = response.data.data.map(item => item.url);
      }

      return result;
    } catch (error) {
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
   * @param {string} imageUrl - URL de la imagen generada
   * @param {string} userId - ID del usuario
   * @param {string} prompt - Prompt utilizado para generar la imagen
   * @returns {Promise<Object>} - Objeto con la URL de la imagen almacenada
   */
  async saveImageToStorage(imageUrl, userId, prompt) {
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
    } catch (error) {
      console.error('Error al guardar imagen:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Genera y guarda una imagen en un solo paso
   * @param {string} prompt - Descripción de la imagen a generar
   * @param {string} userId - ID del usuario
   * @param {Object} options - Opciones de generación
   * @returns {Promise<Object>} - Objeto con la URL de la imagen almacenada
   */
  async generateAndSaveImage(prompt, userId, options = {}) {
    try {
      // Generar la imagen
      const generationResult = await this.generateImage(prompt, options);
      
      if (!generationResult.success) {
        throw new Error(`Error al generar imagen: ${generationResult.error}`);
      }
      
      // Obtener la primera URL (si se generaron múltiples imágenes)
      const imageUrl = generationResult.urls[0];
      
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
    } catch (error) {
      console.error('Error al generar y guardar imagen:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtiene imágenes generadas por un usuario
   * @param {string} userId - ID del usuario
   * @param {number} limit - Número máximo de imágenes a obtener
   * @returns {Promise<Array>} - Array de imágenes generadas
   */
  async getUserImages(userId, limit = 10) {
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
        images: data
      };
    } catch (error) {
      console.error('Error al obtener imágenes del usuario:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Exportar la clase y constantes
module.exports = {
  ImageGenerator,
  IMAGE_MODELS,
  IMAGE_SIZES,
  OUTPUT_FORMATS,
  STYLES,
  QUALITY
};

// Crear una instancia por defecto para uso en la aplicación
const imageGenerator = new ImageGenerator();
module.exports.default = imageGenerator;
