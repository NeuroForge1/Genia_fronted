/**
 * Módulo Central de Procesos (MCP) Mejorado para GENIA
 * 
 * El MCP es el cerebro central de GENIA que:
 * 1. Analiza la intención del usuario con NLP avanzado
 * 2. Determina qué clon debe manejar la solicitud
 * 3. Enruta la petición al clon correspondiente
 * 4. Coordina la ejecución de tareas reales
 */

const { supabase } = require('../supabase');
const { CloneType } = require('../../hooks/useClone');
const { contentClonePrompt, adsClonePrompt } = require('../prompts');
const { OpenAIService } = require('../../services/openAIService');

// Instancia de OpenAI para análisis avanzado de intenciones
const openAIService = new OpenAIService();

// Tipos para el MCP
export type UserIntent = {
  primaryIntent: string;
  secondaryIntent?: string;
  entities: Record<string, any>;
  confidence: number;
};

export type MCPResponse = {
  success: boolean;
  selectedClone?: CloneType;
  response?: string;
  taskId?: string;
  error?: string;
};

export type TaskExecution = {
  id: string;
  userId: string;
  cloneType: CloneType;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  request: string;
  response?: string;
  result?: any;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Módulo Central de Procesos (MCP)
 */
export class MCP {
  /**
   * Analiza el mensaje del usuario para determinar su intención
   * Utiliza OpenAI para un análisis avanzado con fallback a análisis por palabras clave
   */
  async analyzeIntent(message: string, userId: string): Promise<UserIntent> {
    try {
      // Intentar análisis avanzado con OpenAI
      const openAIResult = await openAIService.analyzeIntent(message);
      
      if (openAIResult.success) {
        return {
          primaryIntent: openAIResult.primaryIntent,
          secondaryIntent: openAIResult.secondaryIntent,
          entities: openAIResult.entities || {},
          confidence: openAIResult.confidence || 0.9
        };
      }
      
      // Si falla OpenAI, usar el análisis de respaldo basado en palabras clave
      console.warn('Fallback a análisis de intención por palabras clave');
      return this.fallbackIntentAnalysis(message);
    } catch (error) {
      console.error('Error analyzing intent:', error);
      // En caso de error, usar el análisis de respaldo
      return this.fallbackIntentAnalysis(message);
    }
  }
  
  /**
   * Análisis de intención de respaldo basado en palabras clave
   * @param {string} message - Mensaje del usuario
   * @returns {UserIntent} - Intención detectada
   */
  private fallbackIntentAnalysis(message: string): UserIntent {
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
    
    // Detectar intenciones relacionadas con embudos de conversión
    if (message_lower.includes('embudo') || 
        message_lower.includes('funnel') || 
        message_lower.includes('conversión') ||
        message_lower.includes('leads') ||
        message_lower.includes('ventas')) {
      return {
        primaryIntent: 'funnel_optimization',
        entities: {},
        confidence: 0.7
      };
    }
    
    // Intención por defecto si no se detecta ninguna específica
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
   * Determina qué clon debe manejar la solicitud basado en la intención
   * Implementa lógica mejorada para considerar intención secundaria y confianza
   */
  determineClone(intent: UserIntent): CloneType {
    // Si la confianza es alta, usar la intención primaria
    if (intent.confidence > 0.8) {
      return this.mapIntentToClone(intent.primaryIntent);
    }
    
    // Si hay una intención secundaria y la confianza primaria no es muy alta,
    // considerar también la intención secundaria
    if (intent.secondaryIntent && intent.confidence < 0.9) {
      const primaryClone = this.mapIntentToClone(intent.primaryIntent);
      const secondaryClone = this.mapIntentToClone(intent.secondaryIntent);
      
      // Lógica para decidir entre clones primario y secundario
      // Por ejemplo, priorizar ciertos clones sobre otros
      if (primaryClone === 'content' && secondaryClone === 'ads') {
        // Si es contenido con publicidad, priorizar ads
        return 'ads';
      }
      
      if (primaryClone === 'general_query' && secondaryClone !== 'general_query') {
        // Si la primaria es general pero la secundaria es específica, usar la secundaria
        return secondaryClone;
      }
    }
    
    // Por defecto, mapear la intención primaria a un clon
    return this.mapIntentToClone(intent.primaryIntent);
  }
  
  /**
   * Mapea una intención a un tipo de clon
   */
  private mapIntentToClone(intent: string): CloneType {
    switch (intent) {
      case 'content_creation':
        return 'content';
      case 'advertising':
        return 'ads';
      case 'business_strategy':
        return 'ceo';
      case 'funnel_optimization':
        return 'funnel';
      case 'voice_communication':
        return 'voice';
      case 'time_management':
        return 'calendar';
      default:
        // Por defecto, enviamos al clon CEO que tiene conocimiento general
        return 'ceo';
    }
  }

  /**
   * Enruta la petición al clon correspondiente
   */
  async routeRequest(message: string, userId: string): Promise<MCPResponse> {
    try {
      // 1. Analizar la intención del usuario con el sistema mejorado
      const intent = await this.analyzeIntent(message, userId);
      
      // 2. Determinar qué clon debe manejar la solicitud
      const selectedClone = this.determineClone(intent);
      
      // 3. Registrar la tarea en la base de datos
      const taskId = await this.createTask(userId, selectedClone, message, intent);
      
      // 4. Enviar la solicitud al clon seleccionado
      // Aquí se implementaría la lógica para enviar la solicitud al clon
      // y recibir su respuesta
      
      return {
        success: true,
        selectedClone,
        taskId
      };
    } catch (error) {
      console.error('Error routing request:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Crea una nueva tarea en la base de datos
   * Versión mejorada que almacena también la información de intención
   */
  private async createTask(userId: string, cloneType: CloneType, request: string, intent: UserIntent): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('clones_history')
        .insert([
          {
            user_id: userId,
            clone_type: cloneType,
            request,
            status: 'pending',
            created_at: new Date().toISOString(),
            metadata: {
              intent: {
                primary: intent.primaryIntent,
                secondary: intent.secondaryIntent,
                confidence: intent.confidence,
                entities: intent.entities
              }
            }
          }
        ])
        .select('id');
      
      if (error) {
        throw new Error(`Error creating task: ${error.message}`);
      }
      
      return data?.[0]?.id || '';
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * Ejecuta una tarea utilizando el clon seleccionado
   */
  async executeTask(taskId: string): Promise<TaskExecution> {
    try {
      // 1. Obtener la información de la tarea
      const { data: task, error } = await supabase
        .from('clones_history')
        .select('*')
        .eq('id', taskId)
        .single();
      
      if (error || !task) {
        throw new Error(`Error fetching task: ${error?.message || 'Task not found'}`);
      }
      
      // 2. Actualizar el estado de la tarea a "processing"
      await supabase
        .from('clones_history')
        .update({ status: 'processing', updated_at: new Date().toISOString() })
        .eq('id', taskId);
      
      // 3. Ejecutar la tarea con el clon correspondiente
      // Aquí se implementaría la lógica para ejecutar la tarea
      // y obtener el resultado
      
      // 4. Actualizar el estado de la tarea a "completed"
      await supabase
        .from('clones_history')
        .update({ 
          status: 'completed', 
          updated_at: new Date().toISOString(),
          response: 'Tarea completada exitosamente' // Aquí iría la respuesta real
        })
        .eq('id', taskId);
      
      return {
        id: task.id,
        userId: task.user_id,
        cloneType: task.clone_type,
        status: 'completed',
        request: task.request,
        response: 'Tarea completada exitosamente', // Aquí iría la respuesta real
        createdAt: new Date(task.created_at),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error executing task:', error);
      
      // Actualizar el estado de la tarea a "failed"
      await supabase
        .from('clones_history')
        .update({ 
          status: 'failed', 
          updated_at: new Date().toISOString(),
          response: error instanceof Error ? error.message : 'Error desconocido'
        })
        .eq('id', taskId);
      
      throw error;
    }
  }

  /**
   * Procesa un mensaje del usuario de principio a fin
   * Versión mejorada con manejo de errores más robusto
   */
  async processMessage(message: string, userId: string): Promise<MCPResponse> {
    try {
      // 1. Enrutar la petición al clon correspondiente
      const routeResponse = await this.routeRequest(message, userId);
      
      if (!routeResponse.success || !routeResponse.taskId) {
        return routeResponse;
      }
      
      // 2. Ejecutar la tarea
      const taskExecution = await this.executeTask(routeResponse.taskId);
      
      return {
        success: true,
        selectedClone: routeResponse.selectedClone,
        response: taskExecution.response,
        taskId: routeResponse.taskId
      };
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Intentar generar una respuesta de fallback con OpenAI
      try {
        const fallbackResponse = await openAIService.generateText(message, {
          systemMessage: 'Eres GENIA, un asistente de IA especializado en marketing y negocios. El usuario ha enviado un mensaje que no se ha podido procesar correctamente. Proporciona una respuesta útil y relevante.'
        });
        
        if (fallbackResponse.success) {
          return {
            success: true,
            response: fallbackResponse.text,
            error: 'Se utilizó respuesta de fallback debido a un error en el procesamiento principal'
          };
        }
      } catch (fallbackError) {
        console.error('Error generating fallback response:', fallbackError);
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
  
  /**
   * Obtiene el historial de tareas de un usuario
   */
  async getUserTaskHistory(userId: string, limit = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('clones_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        throw new Error(`Error fetching task history: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error('Error getting user task history:', error);
      throw error;
    }
  }
  
  /**
   * Analiza patrones en las solicitudes del usuario para mejorar futuras respuestas
   */
  async analyzeUserPatterns(userId: string): Promise<any> {
    try {
      // Obtener historial de tareas del usuario
      const taskHistory = await this.getUserTaskHistory(userId, 50);
      
      // Analizar patrones (implementación simplificada)
      const cloneCounts: Record<string, number> = {};
      const intentCounts: Record<string, number> = {};
      
      taskHistory.forEach(task => {
        // Contar uso de clones
        cloneCounts[task.clone_type] = (cloneCounts[task.clone_type] || 0) + 1;
        
        // Contar intenciones primarias
        const primaryIntent = task.metadata?.intent?.primary;
        if (primaryIntent) {
          intentCounts[primaryIntent] = (intentCounts[primaryIntent] || 0) + 1;
        }
      });
      
      // Determinar clon y intención más frecuentes
      let mostUsedClone = '';
      let maxCloneCount = 0;
      
      for (const [clone, count] of Object.entries(cloneCounts)) {
        if (count > maxCloneCount) {
          mostUsedClone = clone;
          maxCloneCount = count;
        }
      }
      
      let mostCommonIntent = '';
      let maxIntentCount = 0;
      
      for (const [intent, count] of Object.entries(intentCounts)) {
        if (count > maxIntentCount) {
          mostCommonIntent = intent;
          maxIntentCount = count;
        }
      }
      
      return {
        mostUsedClone,
        mostCommonIntent,
        cloneCounts,
        intentCounts,
        totalTasks: taskHistory.length
      };
    } catch (error) {
      console.error('Error analyzing user patterns:', error);
      throw error;
    }
  }
}

// Exportar una instancia por defecto para uso en la aplicación
export const mcp = new MCP();
export default mcp;
