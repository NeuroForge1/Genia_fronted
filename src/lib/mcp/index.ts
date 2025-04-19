import { supabase } from '../supabase';
import { CloneType } from '../../hooks/useClone';
import { contentClonePrompt, adsClonePrompt } from '../prompts';

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
 * 
 * El MCP es el cerebro central de GENIA que:
 * 1. Analiza la intención del usuario
 * 2. Determina qué clon debe manejar la solicitud
 * 3. Enruta la petición al clon correspondiente
 * 4. Coordina la ejecución de tareas reales
 */
export class MCP {
  /**
   * Analiza el mensaje del usuario para determinar su intención
   */
  async analyzeIntent(message: string, userId: string): Promise<UserIntent> {
    try {
      // Aquí se implementaría la lógica de análisis de intención
      // Podría utilizar NLP, reglas predefinidas, o una combinación
      
      // Ejemplo simplificado basado en palabras clave
      const message_lower = message.toLowerCase();
      
      // Detectar intenciones relacionadas con contenido
      if (message_lower.includes('contenido') || 
          message_lower.includes('artículo') || 
          message_lower.includes('blog') ||
          message_lower.includes('post') ||
          message_lower.includes('escribir')) {
        return {
          primaryIntent: 'content_creation',
          entities: { contentType: this.detectContentType(message) },
          confidence: 0.85
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
          entities: { adPlatform: this.detectAdPlatform(message) },
          confidence: 0.82
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
          confidence: 0.78
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
          confidence: 0.80
        };
      }
      
      // Intención por defecto si no se detecta ninguna específica
      return {
        primaryIntent: 'general_query',
        entities: {},
        confidence: 0.60
      };
    } catch (error) {
      console.error('Error analyzing intent:', error);
      return {
        primaryIntent: 'error',
        entities: {},
        confidence: 0
      };
    }
  }
  
  /**
   * Detecta el tipo de contenido mencionado en el mensaje
   */
  private detectContentType(message: string): string {
    const message_lower = message.toLowerCase();
    
    if (message_lower.includes('blog') || message_lower.includes('artículo')) {
      return 'blog';
    }
    
    if (message_lower.includes('instagram') || message_lower.includes('post')) {
      return 'social_media';
    }
    
    if (message_lower.includes('email') || message_lower.includes('correo')) {
      return 'email';
    }
    
    return 'general';
  }
  
  /**
   * Detecta la plataforma de anuncios mencionada en el mensaje
   */
  private detectAdPlatform(message: string): string {
    const message_lower = message.toLowerCase();
    
    if (message_lower.includes('facebook') || message_lower.includes('meta')) {
      return 'facebook';
    }
    
    if (message_lower.includes('google') || message_lower.includes('adwords')) {
      return 'google';
    }
    
    if (message_lower.includes('instagram')) {
      return 'instagram';
    }
    
    if (message_lower.includes('linkedin')) {
      return 'linkedin';
    }
    
    return 'general';
  }

  /**
   * Determina qué clon debe manejar la solicitud basado en la intención
   */
  determineClone(intent: UserIntent): CloneType {
    switch (intent.primaryIntent) {
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
      // 1. Analizar la intención del usuario
      const intent = await this.analyzeIntent(message, userId);
      
      // 2. Determinar qué clon debe manejar la solicitud
      const selectedClone = this.determineClone(intent);
      
      // 3. Registrar la tarea en la base de datos
      const taskId = await this.createTask(userId, selectedClone, message);
      
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
   */
  private async createTask(userId: string, cloneType: CloneType, request: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('clones_history')
        .insert([
          {
            user_id: userId,
            clone_type: cloneType,
            request,
            status: 'pending',
            created_at: new Date().toISOString()
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
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

// Exportar una instancia por defecto para uso en la aplicación
export const mcp = new MCP();
export default mcp;
