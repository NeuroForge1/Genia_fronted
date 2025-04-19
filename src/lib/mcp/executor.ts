/**
 * Integración del MCP con los conectores de redes sociales y email marketing
 * 
 * Este módulo extiende el MCP para permitir la delegación de tareas a los
 * conectores de redes sociales y email marketing, permitiendo que GENIA
 * pueda ejecutar tareas reales a través de sus clones.
 */

import { MCP, UserIntent, CloneType } from '../mcp';
import { SocialConnector, SocialConnectorFactory, SocialPlatform, SocialContent } from '../connectors/social';
import { EmailConnector, EmailConnectorFactory, EmailPlatform, EmailCampaign } from '../connectors/email';

// Tipos de tareas ejecutables
export enum ExecutableTaskType {
  SOCIAL_POST = 'social_post',
  SOCIAL_SCHEDULE = 'social_schedule',
  SOCIAL_METRICS = 'social_metrics',
  EMAIL_CAMPAIGN = 'email_campaign',
  EMAIL_SUBSCRIBER = 'email_subscriber',
  EMAIL_METRICS = 'email_metrics'
}

// Interfaz para tareas ejecutables
export interface ExecutableTask {
  type: ExecutableTaskType;
  userId: string;
  parameters: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

/**
 * Extensión del MCP para integrar conectores
 */
export class ExecutorMCP extends MCP {
  
  /**
   * Analiza la intención y determina si es una tarea ejecutable
   */
  async analyzeExecutableIntent(userInput: string, userId: string): Promise<ExecutableTask | null> {
    const intent = await this.analyzeIntent(userInput, userId);
    
    // Si no es una intención ejecutable, retornar null
    if (!this.isExecutableIntent(intent.primaryIntent)) {
      return null;
    }
    
    // Determinar el tipo de tarea ejecutable
    const taskType = this.mapIntentToTaskType(intent.primaryIntent);
    if (!taskType) {
      return null;
    }
    
    // Extraer parámetros según el tipo de tarea
    const parameters = this.extractTaskParameters(userInput, taskType);
    
    return {
      type: taskType,
      userId: userId,
      parameters,
      status: 'pending'
    };
  }
  
  /**
   * Determina si una intención es ejecutable
   */
  private isExecutableIntent(intentType: string): boolean {
    const executableIntents = [
      'social_media_post',
      'social_media_schedule',
      'social_media_analytics',
      'email_campaign_create',
      'email_list_manage',
      'email_campaign_analytics'
    ];
    
    return executableIntents.includes(intentType);
  }
  
  /**
   * Mapea un tipo de intención a un tipo de tarea ejecutable
   */
  private mapIntentToTaskType(intentType: string): ExecutableTaskType | null {
    const intentToTaskMap: Record<string, ExecutableTaskType> = {
      'social_media_post': ExecutableTaskType.SOCIAL_POST,
      'social_media_schedule': ExecutableTaskType.SOCIAL_SCHEDULE,
      'social_media_analytics': ExecutableTaskType.SOCIAL_METRICS,
      'email_campaign_create': ExecutableTaskType.EMAIL_CAMPAIGN,
      'email_list_manage': ExecutableTaskType.EMAIL_SUBSCRIBER,
      'email_campaign_analytics': ExecutableTaskType.EMAIL_METRICS
    };
    
    return intentToTaskMap[intentType] || null;
  }
  
  /**
   * Extrae parámetros para una tarea ejecutable
   */
  private extractTaskParameters(userInput: string, taskType: ExecutableTaskType): Record<string, any> {
    // Implementación simplificada - en producción se usaría NLP más avanzado
    const parameters: Record<string, any> = {};
    
    switch (taskType) {
      case ExecutableTaskType.SOCIAL_POST:
        // Extraer plataforma
        if (userInput.toLowerCase().includes('facebook')) {
          parameters.platform = 'facebook';
        } else if (userInput.toLowerCase().includes('twitter')) {
          parameters.platform = 'twitter';
        } else if (userInput.toLowerCase().includes('instagram')) {
          parameters.platform = 'instagram';
        } else if (userInput.toLowerCase().includes('linkedin')) {
          parameters.platform = 'linkedin';
        } else {
          parameters.platform = 'facebook'; // Default
        }
        
        // Extraer contenido - simplificado
        const contentMatch = userInput.match(/publicar[:\s]+["'](.+?)["']/i);
        if (contentMatch && contentMatch[1]) {
          parameters.content = contentMatch[1];
        } else {
          parameters.content = userInput.split('publicar')[1]?.trim() || '';
        }
        
        // Determinar tipo de contenido
        if (userInput.toLowerCase().includes('imagen') || userInput.toLowerCase().includes('foto')) {
          parameters.contentType = 'image';
          
          // Extraer URL de imagen - simplificado
          const imageMatch = userInput.match(/imagen[:\s]+["'](.+?)["']/i) || userInput.match(/foto[:\s]+["'](.+?)["']/i);
          if (imageMatch && imageMatch[1]) {
            parameters.mediaUrl = imageMatch[1];
          }
        } else if (userInput.toLowerCase().includes('video')) {
          parameters.contentType = 'video';
          
          // Extraer URL de video - simplificado
          const videoMatch = userInput.match(/video[:\s]+["'](.+?)["']/i);
          if (videoMatch && videoMatch[1]) {
            parameters.mediaUrl = videoMatch[1];
          }
        } else if (userInput.toLowerCase().includes('enlace') || userInput.toLowerCase().includes('link')) {
          parameters.contentType = 'link';
          
          // Extraer URL - simplificado
          const linkMatch = userInput.match(/enlace[:\s]+["'](.+?)["']/i) || userInput.match(/link[:\s]+["'](.+?)["']/i);
          if (linkMatch && linkMatch[1]) {
            parameters.linkUrl = linkMatch[1];
          }
        } else {
          parameters.contentType = 'text';
        }
        break;
        
      case ExecutableTaskType.EMAIL_CAMPAIGN:
        // Extraer plataforma
        if (userInput.toLowerCase().includes('mailchimp')) {
          parameters.platform = 'mailchimp';
        } else if (userInput.toLowerCase().includes('sendgrid')) {
          parameters.platform = 'sendgrid';
        } else if (userInput.toLowerCase().includes('convertkit')) {
          parameters.platform = 'convertkit';
        } else if (userInput.toLowerCase().includes('mailerlite')) {
          parameters.platform = 'mailerlite';
        } else {
          parameters.platform = 'mailchimp'; // Default
        }
        
        // Extraer asunto - simplificado
        const subjectMatch = userInput.match(/asunto[:\s]+["'](.+?)["']/i);
        if (subjectMatch && subjectMatch[1]) {
          parameters.subject = subjectMatch[1];
        } else {
          parameters.subject = 'Campaña de GENIA';
        }
        
        // Extraer nombre de campaña - simplificado
        const nameMatch = userInput.match(/nombre[:\s]+["'](.+?)["']/i) || userInput.match(/campaña[:\s]+["'](.+?)["']/i);
        if (nameMatch && nameMatch[1]) {
          parameters.name = nameMatch[1];
        } else {
          parameters.name = `Campaña ${new Date().toLocaleDateString()}`;
        }
        
        // Extraer contenido - simplificado
        const emailContentMatch = userInput.match(/contenido[:\s]+["'](.+?)["']/i);
        if (emailContentMatch && emailContentMatch[1]) {
          parameters.content = emailContentMatch[1];
        } else {
          parameters.content = userInput.split('contenido')[1]?.trim() || '';
        }
        
        // Extraer lista/audiencia - simplificado
        const listMatch = userInput.match(/lista[:\s]+["'](.+?)["']/i) || userInput.match(/audiencia[:\s]+["'](.+?)["']/i);
        if (listMatch && listMatch[1]) {
          parameters.listName = listMatch[1];
        }
        break;
        
      // Otros casos similares para los demás tipos de tareas
      // Omitidos por brevedad
    }
    
    return parameters;
  }
  
  /**
   * Ejecuta una tarea
   */
  async executeTask(task: ExecutableTask): Promise<ExecutableTask> {
    try {
      // Actualizar estado
      task.status = 'processing';
      
      switch (task.type) {
        case ExecutableTaskType.SOCIAL_POST:
          return await this.executeSocialPost(task);
        case ExecutableTaskType.EMAIL_CAMPAIGN:
          return await this.executeEmailCampaign(task);
        // Otros casos para los demás tipos de tareas
        // Omitidos por brevedad
        default:
          throw new Error(`Tipo de tarea no soportado: ${task.type}`);
      }
    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : 'Error desconocido';
      return task;
    }
  }
  
  /**
   * Ejecuta una tarea de publicación en redes sociales
   */
  private async executeSocialPost(task: ExecutableTask): Promise<ExecutableTask> {
    const { platform, content, contentType, mediaUrl, linkUrl } = task.parameters;
    
    // Obtener conector para la plataforma
    const connector = await SocialConnectorFactory.createConnector(
      task.userId, 
      platform as SocialPlatform
    );
    
    if (!connector) {
      throw new Error(`No se pudo crear conector para ${platform}`);
    }
    
    // Crear contenido para publicar
    const socialContent: SocialContent = {
      type: contentType,
      text: content
    };
    
    if (mediaUrl) {
      socialContent.mediaUrl = mediaUrl;
    }
    
    if (linkUrl) {
      socialContent.linkUrl = linkUrl;
    }
    
    // Publicar contenido
    const result = await connector.publishContent(socialContent);
    
    if (!result.success) {
      throw new Error(result.error || 'Error al publicar contenido');
    }
    
    // Actualizar tarea con resultado
    task.status = 'completed';
    task.result = {
      postId: result.postId,
      url: result.url
    };
    
    return task;
  }
  
  /**
   * Ejecuta una tarea de creación de campaña de email
   */
  private async executeEmailCampaign(task: ExecutableTask): Promise<ExecutableTask> {
    const { platform, name, subject, content, listName } = task.parameters;
    
    // Obtener conector para la plataforma
    const connector = await EmailConnectorFactory.createConnector(
      task.userId, 
      platform as EmailPlatform
    );
    
    if (!connector) {
      throw new Error(`No se pudo crear conector para ${platform}`);
    }
    
    // Obtener listas disponibles
    const lists = await connector.getLists();
    
    if (lists.length === 0) {
      throw new Error('No se encontraron listas disponibles');
    }
    
    // Encontrar lista por nombre o usar la primera
    let listId = lists[0].id;
    if (listName) {
      const matchedList = lists.find(list => 
        list.name.toLowerCase().includes(listName.toLowerCase())
      );
      if (matchedList) {
        listId = matchedList.id;
      }
    }
    
    // Crear campaña
    const campaign: EmailCampaign = {
      name: name,
      subject: subject,
      fromName: 'GENIA', // Esto debería venir de la configuración del usuario
      fromEmail: 'noreply@genia.ai', // Esto debería venir de la configuración del usuario
      content: content,
      listId: listId,
      isHtml: true
    };
    
    // Enviar campaña
    const result = await connector.createCampaign(campaign);
    
    if (!result.success) {
      throw new Error(result.error || 'Error al crear campaña');
    }
    
    // Actualizar tarea con resultado
    task.status = 'completed';
    task.result = {
      campaignId: result.campaignId
    };
    
    return task;
  }
  
  /**
   * Integra la ejecución de tareas con los clones
   */
  async processWithClones(userInput: string, userId: string): Promise<any> {
    // Analizar intención
    const intent = await this.analyzeIntent(userInput, userId);
    
    // Determinar clon
    const cloneType = this.determineClone(intent);
    
    // Verificar si es una tarea ejecutable
    const executableTask = await this.analyzeExecutableIntent(userInput, userId);
    
    if (executableTask) {
      // Es una tarea ejecutable, procesarla directamente
      const result = await this.executeTask(executableTask);
      
      // Generar respuesta basada en el resultado
      return {
        cloneType,
        response: this.generateResponseFromTaskResult(result),
        executedTask: result
      };
    } else {
      // No es una tarea ejecutable, procesar normalmente con el clon
      const response = await this.routeRequest(userInput, userId);
      
      return {
        cloneType: response.selectedClone,
        response: response.response
      };
    }
  }
  
  /**
   * Genera una respuesta basada en el resultado de una tarea
   */
  private generateResponseFromTaskResult(task: ExecutableTask): string {
    if (task.status === 'failed') {
      return `Lo siento, no pude completar la tarea. Error: ${task.error}`;
    }
    
    switch (task.type) {
      case ExecutableTaskType.SOCIAL_POST:
        return `¡Publicación realizada con éxito en ${task.parameters.platform}! Puedes verla en: ${task.result.url}`;
        
      case ExecutableTaskType.EMAIL_CAMPAIGN:
        return `¡Campaña de email "${task.parameters.name}" creada y enviada con éxito en ${task.parameters.platform}!`;
        
      // Otros casos para los demás tipos de tareas
      // Omitidos por brevedad
        
      default:
        return `Tarea completada con éxito.`;
    }
  }
}

// Exportar instancia única
export const executorMCP = new ExecutorMCP();
