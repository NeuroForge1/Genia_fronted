import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ExecutorMCP, ExecutableTaskType } from '@/lib/mcp/executor';
import { SocialConnectorFactory } from '@/lib/connectors/social';
import { EmailConnectorFactory } from '@/lib/connectors/email';

// Mock de los factory de conectores
vi.mock('@/lib/connectors/social', () => ({
  SocialConnectorFactory: {
    createConnector: vi.fn(),
  },
}));

vi.mock('@/lib/connectors/email', () => ({
  EmailConnectorFactory: {
    createConnector: vi.fn(),
  },
}));

// Mock de la clase MCP base
vi.mock('@/lib/mcp', () => ({
  MCP: class MockMCP {
    analyzeIntent = vi.fn();
    routeRequest = vi.fn();
    determineClone = vi.fn();
  },
  CloneType: {
    CONTENT: 'content',
    ADS: 'ads',
    CEO: 'ceo',
    VOICE: 'voice',
    FUNNEL: 'funnel',
    CALENDAR: 'calendar',
  },
}));

describe('ExecutorMCP', () => {
  let executorMCP: ExecutorMCP;
  
  beforeEach(() => {
    executorMCP = new ExecutorMCP();
    
    // Limpiar todos los mocks
    vi.clearAllMocks();
  });
  
  describe('analyzeExecutableIntent', () => {
    it('debería identificar correctamente una intención de publicación en redes sociales', async () => {
      // Mock del método analyzeIntent
      executorMCP.analyzeIntent = vi.fn().mockResolvedValueOnce({
        primaryIntent: 'social_media_post',
        secondaryIntents: [],
        entities: {
          platform: 'facebook',
          content: 'Contenido de prueba',
        },
      });
      
      const result = await executorMCP.analyzeExecutableIntent(
        'Publica en Facebook: Contenido de prueba',
        'user123'
      );
      
      expect(result).not.toBeNull();
      expect(result?.type).toBe(ExecutableTaskType.SOCIAL_POST);
      expect(result?.userId).toBe('user123');
      expect(result?.parameters.platform).toBe('facebook');
      expect(result?.parameters.content).toContain('Contenido de prueba');
      expect(result?.status).toBe('pending');
    });
    
    it('debería identificar correctamente una intención de creación de campaña de email', async () => {
      // Mock del método analyzeIntent
      executorMCP.analyzeIntent = vi.fn().mockResolvedValueOnce({
        primaryIntent: 'email_campaign_create',
        secondaryIntents: [],
        entities: {
          platform: 'mailchimp',
          subject: 'Asunto de prueba',
          content: 'Contenido de prueba',
        },
      });
      
      const result = await executorMCP.analyzeExecutableIntent(
        'Crea una campaña en Mailchimp con asunto: Asunto de prueba y contenido: Contenido de prueba',
        'user123'
      );
      
      expect(result).not.toBeNull();
      expect(result?.type).toBe(ExecutableTaskType.EMAIL_CAMPAIGN);
      expect(result?.userId).toBe('user123');
      expect(result?.parameters.platform).toBe('mailchimp');
      expect(result?.parameters.subject).toBe('Asunto de prueba');
      expect(result?.parameters.content).toContain('Contenido de prueba');
      expect(result?.status).toBe('pending');
    });
    
    it('debería retornar null para intenciones no ejecutables', async () => {
      // Mock del método analyzeIntent
      executorMCP.analyzeIntent = vi.fn().mockResolvedValueOnce({
        primaryIntent: 'general_question',
        secondaryIntents: [],
        entities: {},
      });
      
      const result = await executorMCP.analyzeExecutableIntent(
        '¿Cuál es la capital de Francia?',
        'user123'
      );
      
      expect(result).toBeNull();
    });
  });
  
  describe('executeTask', () => {
    it('debería ejecutar correctamente una tarea de publicación en redes sociales', async () => {
      // Mock del conector de redes sociales
      const mockSocialConnector = {
        publishContent: vi.fn().mockResolvedValueOnce({
          success: true,
          postId: 'post123',
          url: 'https://facebook.com/post123',
        }),
      };
      
      // Mock del factory para retornar el conector mock
      SocialConnectorFactory.createConnector = vi.fn().mockResolvedValueOnce(mockSocialConnector);
      
      const task = {
        type: ExecutableTaskType.SOCIAL_POST,
        userId: 'user123',
        parameters: {
          platform: 'facebook',
          content: 'Contenido de prueba',
          contentType: 'text',
        },
        status: 'pending',
      };
      
      const result = await executorMCP.executeTask(task);
      
      expect(result.status).toBe('completed');
      expect(result.result.postId).toBe('post123');
      expect(result.result.url).toBe('https://facebook.com/post123');
      expect(SocialConnectorFactory.createConnector).toHaveBeenCalledWith('user123', 'facebook');
      expect(mockSocialConnector.publishContent).toHaveBeenCalledWith({
        type: 'text',
        text: 'Contenido de prueba',
      });
    });
    
    it('debería ejecutar correctamente una tarea de creación de campaña de email', async () => {
      // Mock del conector de email
      const mockEmailConnector = {
        getLists: vi.fn().mockResolvedValueOnce([
          { id: 'list123', name: 'Lista de prueba' },
        ]),
        createCampaign: vi.fn().mockResolvedValueOnce({
          success: true,
          campaignId: 'campaign123',
        }),
      };
      
      // Mock del factory para retornar el conector mock
      EmailConnectorFactory.createConnector = vi.fn().mockResolvedValueOnce(mockEmailConnector);
      
      const task = {
        type: ExecutableTaskType.EMAIL_CAMPAIGN,
        userId: 'user123',
        parameters: {
          platform: 'mailchimp',
          name: 'Campaña de prueba',
          subject: 'Asunto de prueba',
          content: 'Contenido de prueba',
          listName: 'Lista de prueba',
        },
        status: 'pending',
      };
      
      const result = await executorMCP.executeTask(task);
      
      expect(result.status).toBe('completed');
      expect(result.result.campaignId).toBe('campaign123');
      expect(EmailConnectorFactory.createConnector).toHaveBeenCalledWith('user123', 'mailchimp');
      expect(mockEmailConnector.getLists).toHaveBeenCalled();
      expect(mockEmailConnector.createCampaign).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Campaña de prueba',
        subject: 'Asunto de prueba',
        content: 'Contenido de prueba',
        listId: 'list123',
      }));
    });
    
    it('debería manejar errores durante la ejecución de tareas', async () => {
      // Mock del factory para retornar null (error al crear conector)
      SocialConnectorFactory.createConnector = vi.fn().mockResolvedValueOnce(null);
      
      const task = {
        type: ExecutableTaskType.SOCIAL_POST,
        userId: 'user123',
        parameters: {
          platform: 'facebook',
          content: 'Contenido de prueba',
          contentType: 'text',
        },
        status: 'pending',
      };
      
      const result = await executorMCP.executeTask(task);
      
      expect(result.status).toBe('failed');
      expect(result.error).toContain('No se pudo crear conector');
    });
  });
  
  describe('processWithClones', () => {
    it('debería procesar tareas ejecutables directamente', async () => {
      // Mock del método analyzeExecutableIntent
      executorMCP.analyzeExecutableIntent = vi.fn().mockResolvedValueOnce({
        type: ExecutableTaskType.SOCIAL_POST,
        userId: 'user123',
        parameters: {
          platform: 'facebook',
          content: 'Contenido de prueba',
        },
        status: 'pending',
      });
      
      // Mock del método executeTask
      executorMCP.executeTask = vi.fn().mockResolvedValueOnce({
        type: ExecutableTaskType.SOCIAL_POST,
        userId: 'user123',
        parameters: {
          platform: 'facebook',
          content: 'Contenido de prueba',
        },
        status: 'completed',
        result: {
          postId: 'post123',
          url: 'https://facebook.com/post123',
        },
      });
      
      // Mock del método determineClone
      executorMCP.determineClone = vi.fn().mockReturnValueOnce('content');
      
      const result = await executorMCP.processWithClones(
        'Publica en Facebook: Contenido de prueba',
        'user123'
      );
      
      expect(result.cloneType).toBe('content');
      expect(result.response).toContain('¡Publicación realizada con éxito');
      expect(result.executedTask).toBeDefined();
      expect(executorMCP.analyzeExecutableIntent).toHaveBeenCalled();
      expect(executorMCP.executeTask).toHaveBeenCalled();
    });
    
    it('debería delegar a clones para intenciones no ejecutables', async () => {
      // Mock del método analyzeExecutableIntent
      executorMCP.analyzeExecutableIntent = vi.fn().mockResolvedValueOnce(null);
      
      // Mock del método routeRequest
      executorMCP.routeRequest = vi.fn().mockResolvedValueOnce({
        selectedClone: 'content',
        response: 'Respuesta del clon de contenido',
      });
      
      const result = await executorMCP.processWithClones(
        '¿Cuál es la capital de Francia?',
        'user123'
      );
      
      expect(result.cloneType).toBe('content');
      expect(result.response).toBe('Respuesta del clon de contenido');
      expect(result.executedTask).toBeUndefined();
      expect(executorMCP.analyzeExecutableIntent).toHaveBeenCalled();
      expect(executorMCP.routeRequest).toHaveBeenCalled();
    });
  });
});
