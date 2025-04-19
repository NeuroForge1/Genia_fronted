import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EmailConnector, EmailConnectorFactory, EmailPlatform } from '@/lib/connectors/email';
import { supabaseClient } from '@/lib/supabase';

// Mock de axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock de supabaseClient
vi.mock('@/lib/supabase', () => ({
  supabaseClient: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  },
}));

// Mock de crypto para el hash MD5
vi.mock('crypto', () => ({
  createHash: vi.fn().mockReturnValue({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn().mockReturnValue('md5hash'),
  }),
}));

describe('EmailConnector', () => {
  let connector: EmailConnector;
  
  beforeEach(() => {
    // Configurar el conector con credenciales de prueba
    connector = new EmailConnector({
      platform: 'mailchimp',
      apiKey: 'test_api_key',
      serverPrefix: 'us1',
      userId: 'test_user_id',
    });
    
    // Limpiar todos los mocks
    vi.clearAllMocks();
  });
  
  describe('verifyCredentials', () => {
    it('debería verificar correctamente las credenciales de Mailchimp', async () => {
      // Configurar el mock de axios para simular una respuesta exitosa
      const axios = require('axios');
      axios.get.mockResolvedValueOnce({
        status: 200,
        data: { ping: 'pong' },
      });
      
      const result = await connector.verifyCredentials();
      
      expect(result).toBe(true);
      expect(axios.get).toHaveBeenCalledWith(
        'https://us1.api.mailchimp.com/3.0/ping',
        { 
          headers: { 
            'Authorization': expect.stringContaining('Basic') 
          } 
        }
      );
    });
    
    it('debería manejar errores al verificar credenciales', async () => {
      // Configurar el mock de axios para simular un error
      const axios = require('axios');
      axios.get.mockRejectedValueOnce(new Error('API Error'));
      
      const result = await connector.verifyCredentials();
      
      expect(result).toBe(false);
      expect(axios.get).toHaveBeenCalled();
    });
  });
  
  describe('getLists', () => {
    it('debería obtener listas de Mailchimp correctamente', async () => {
      // Configurar el mock de axios para simular una respuesta exitosa
      const axios = require('axios');
      axios.get.mockResolvedValueOnce({
        data: {
          lists: [
            {
              id: 'list1',
              name: 'Test List 1',
              stats: { member_count: 100 },
              date_created: '2023-01-01T00:00:00Z',
            },
            {
              id: 'list2',
              name: 'Test List 2',
              stats: { member_count: 200 },
              date_created: '2023-02-01T00:00:00Z',
            },
          ],
        },
      });
      
      const result = await connector.getLists();
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('list1');
      expect(result[0].name).toBe('Test List 1');
      expect(result[0].subscriberCount).toBe(100);
      expect(result[0].createdAt).toBeInstanceOf(Date);
      expect(axios.get).toHaveBeenCalledWith(
        'https://us1.api.mailchimp.com/3.0/lists',
        { 
          headers: { 
            'Authorization': expect.stringContaining('Basic') 
          } 
        }
      );
    });
    
    it('debería manejar errores al obtener listas', async () => {
      // Configurar el mock de axios para simular un error
      const axios = require('axios');
      axios.get.mockRejectedValueOnce(new Error('API Error'));
      
      const result = await connector.getLists();
      
      expect(result).toEqual([]);
      expect(axios.get).toHaveBeenCalled();
    });
  });
  
  describe('addSubscriber', () => {
    it('debería añadir un suscriptor a Mailchimp correctamente', async () => {
      // Configurar el mock de axios para simular una respuesta exitosa
      const axios = require('axios');
      axios.put.mockResolvedValueOnce({
        status: 200,
        data: { id: 'subscriber1' },
      });
      
      const result = await connector.addSubscriber('list1', {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      });
      
      expect(result).toBe(true);
      expect(axios.put).toHaveBeenCalledWith(
        'https://us1.api.mailchimp.com/3.0/lists/list1/members/md5hash',
        {
          email_address: 'test@example.com',
          status: 'subscribed',
          merge_fields: {
            FNAME: 'Test',
            LNAME: 'User',
          },
        },
        { 
          headers: { 
            'Authorization': expect.stringContaining('Basic') 
          } 
        }
      );
    });
    
    it('debería manejar errores al añadir un suscriptor', async () => {
      // Configurar el mock de axios para simular un error
      const axios = require('axios');
      axios.put.mockRejectedValueOnce(new Error('API Error'));
      
      const result = await connector.addSubscriber('list1', {
        email: 'test@example.com',
      });
      
      expect(result).toBe(false);
      expect(axios.put).toHaveBeenCalled();
    });
  });
  
  describe('createCampaign', () => {
    it('debería crear una campaña en Mailchimp correctamente', async () => {
      // Configurar el mock de axios para simular respuestas exitosas
      const axios = require('axios');
      // Mock para la creación de la campaña
      axios.post.mockResolvedValueOnce({
        data: { id: 'campaign1' },
      });
      // Mock para establecer el contenido
      axios.put.mockResolvedValueOnce({
        status: 200,
      });
      // Mock para enviar la campaña
      axios.post.mockResolvedValueOnce({
        status: 204,
      });
      
      const result = await connector.createCampaign({
        name: 'Test Campaign',
        subject: 'Test Subject',
        fromName: 'Test Sender',
        fromEmail: 'sender@example.com',
        content: '<p>Test content</p>',
        listId: 'list1',
      });
      
      expect(result.success).toBe(true);
      expect(result.campaignId).toBe('campaign1');
      expect(axios.post).toHaveBeenCalledTimes(2);
      expect(axios.put).toHaveBeenCalledTimes(1);
    });
    
    it('debería manejar errores al crear una campaña', async () => {
      // Configurar el mock de axios para simular un error
      const axios = require('axios');
      axios.post.mockRejectedValueOnce(new Error('API Error'));
      
      const result = await connector.createCampaign({
        name: 'Test Campaign',
        subject: 'Test Subject',
        fromName: 'Test Sender',
        fromEmail: 'sender@example.com',
        content: '<p>Test content</p>',
        listId: 'list1',
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('API Error');
      expect(axios.post).toHaveBeenCalledTimes(1);
    });
  });
});

describe('EmailConnectorFactory', () => {
  beforeEach(() => {
    // Limpiar todos los mocks
    vi.clearAllMocks();
  });
  
  describe('createConnector', () => {
    it('debería crear un conector correctamente con credenciales válidas', async () => {
      // Configurar el mock de supabaseClient para simular credenciales encontradas
      supabaseClient.from().select().eq().eq().single.mockResolvedValueOnce({
        data: {
          platform: 'mailchimp',
          api_key: 'test_api_key',
          server_prefix: 'us1',
          platform_user_id: 'test_user_id',
        },
        error: null,
      });
      
      // Mock del método verifyCredentials
      const verifyCredentialsMock = vi.fn().mockResolvedValueOnce(true);
      EmailConnector.prototype.verifyCredentials = verifyCredentialsMock;
      
      const connector = await EmailConnectorFactory.createConnector('test_user_id', 'mailchimp');
      
      expect(connector).toBeInstanceOf(EmailConnector);
      expect(supabaseClient.from).toHaveBeenCalledWith('email_credentials');
      expect(supabaseClient.select).toHaveBeenCalled();
      expect(supabaseClient.eq).toHaveBeenCalledWith('user_id', 'test_user_id');
      expect(supabaseClient.eq).toHaveBeenCalledWith('platform', 'mailchimp');
      expect(verifyCredentialsMock).toHaveBeenCalled();
    });
    
    it('debería retornar null si no se encuentran credenciales', async () => {
      // Configurar el mock de supabaseClient para simular credenciales no encontradas
      supabaseClient.from().select().eq().eq().single.mockResolvedValueOnce({
        data: null,
        error: { message: 'No se encontraron credenciales' },
      });
      
      const connector = await EmailConnectorFactory.createConnector('test_user_id', 'mailchimp');
      
      expect(connector).toBe(null);
      expect(supabaseClient.from).toHaveBeenCalledWith('email_credentials');
    });
    
    it('debería retornar null si las credenciales son inválidas', async () => {
      // Configurar el mock de supabaseClient para simular credenciales encontradas
      supabaseClient.from().select().eq().eq().single.mockResolvedValueOnce({
        data: {
          platform: 'mailchimp',
          api_key: 'test_api_key',
          server_prefix: 'us1',
          platform_user_id: 'test_user_id',
        },
        error: null,
      });
      
      // Mock del método verifyCredentials
      const verifyCredentialsMock = vi.fn().mockResolvedValueOnce(false);
      EmailConnector.prototype.verifyCredentials = verifyCredentialsMock;
      
      const connector = await EmailConnectorFactory.createConnector('test_user_id', 'mailchimp');
      
      expect(connector).toBe(null);
      expect(verifyCredentialsMock).toHaveBeenCalled();
    });
  });
});
