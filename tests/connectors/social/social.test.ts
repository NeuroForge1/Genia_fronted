import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SocialConnector, SocialConnectorFactory, SocialPlatform } from '@/lib/connectors/social';
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

describe('SocialConnector', () => {
  let connector: SocialConnector;
  
  beforeEach(() => {
    // Configurar el conector con credenciales de prueba
    connector = new SocialConnector({
      platform: 'facebook',
      accessToken: 'test_access_token',
      refreshToken: 'test_refresh_token',
      userId: 'test_user_id',
      pageId: 'test_page_id',
    });
    
    // Limpiar todos los mocks
    vi.clearAllMocks();
  });
  
  describe('verifyCredentials', () => {
    it('debería verificar correctamente las credenciales de Facebook', async () => {
      // Configurar el mock de axios para simular una respuesta exitosa
      const axios = require('axios');
      axios.get.mockResolvedValueOnce({
        data: { id: 'test_user_id' },
      });
      
      const result = await connector.verifyCredentials();
      
      expect(result).toBe(true);
      expect(axios.get).toHaveBeenCalledWith(
        'https://graph.facebook.com/v16.0/me',
        { params: { access_token: 'test_access_token' } }
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
  
  describe('publishContent', () => {
    it('debería publicar contenido de texto en Facebook correctamente', async () => {
      // Configurar el mock de axios para simular una respuesta exitosa
      const axios = require('axios');
      axios.post.mockResolvedValueOnce({
        data: { id: 'test_post_id' },
      });
      
      const result = await connector.publishContent({
        type: 'text',
        text: 'Test post content',
      });
      
      expect(result.success).toBe(true);
      expect(result.postId).toBe('test_post_id');
      expect(result.url).toBe('https://facebook.com/test_post_id');
      expect(axios.post).toHaveBeenCalledWith(
        'https://graph.facebook.com/v16.0/test_page_id/feed',
        null,
        { params: { access_token: 'test_access_token', message: 'Test post content' } }
      );
    });
    
    it('debería manejar errores al publicar contenido', async () => {
      // Configurar el mock de axios para simular un error
      const axios = require('axios');
      axios.post.mockRejectedValueOnce(new Error('API Error'));
      
      const result = await connector.publishContent({
        type: 'text',
        text: 'Test post content',
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('API Error');
      expect(axios.post).toHaveBeenCalled();
    });
  });
  
  describe('getPostMetrics', () => {
    it('debería obtener métricas de una publicación correctamente', async () => {
      // Configurar el mock de axios para simular una respuesta exitosa
      const axios = require('axios');
      axios.get.mockResolvedValueOnce({
        data: {
          data: [
            {
              name: 'post_reactions_by_type_total',
              values: [{ value: { like: 10, share: 5, comment: 3 } }],
            },
            {
              name: 'post_impressions',
              values: [{ value: { unique: 100 } }],
            },
            {
              name: 'post_engagements',
              values: [{ value: { total: 18 } }],
            },
          ],
        },
      });
      
      const result = await connector.getPostMetrics('test_post_id');
      
      expect(result).toEqual({
        likes: 10,
        shares: 5,
        comments: 3,
        reach: 100,
        engagement: 18,
      });
      expect(axios.get).toHaveBeenCalledWith(
        'https://graph.facebook.com/v16.0/test_post_id/insights',
        { 
          params: { 
            access_token: 'test_access_token',
            metric: 'post_impressions,post_engagements,post_reactions_by_type_total,post_clicks'
          } 
        }
      );
    });
    
    it('debería manejar errores al obtener métricas', async () => {
      // Configurar el mock de axios para simular un error
      const axios = require('axios');
      axios.get.mockRejectedValueOnce(new Error('API Error'));
      
      const result = await connector.getPostMetrics('test_post_id');
      
      expect(result).toBe(null);
      expect(axios.get).toHaveBeenCalled();
    });
  });
});

describe('SocialConnectorFactory', () => {
  beforeEach(() => {
    // Limpiar todos los mocks
    vi.clearAllMocks();
  });
  
  describe('createConnector', () => {
    it('debería crear un conector correctamente con credenciales válidas', async () => {
      // Configurar el mock de supabaseClient para simular credenciales encontradas
      supabaseClient.from().select().eq().eq().single.mockResolvedValueOnce({
        data: {
          platform: 'facebook',
          access_token: 'test_access_token',
          refresh_token: 'test_refresh_token',
          platform_user_id: 'test_user_id',
          page_id: 'test_page_id',
        },
        error: null,
      });
      
      // Mock del método verifyCredentials
      const verifyCredentialsMock = vi.fn().mockResolvedValueOnce(true);
      SocialConnector.prototype.verifyCredentials = verifyCredentialsMock;
      
      const connector = await SocialConnectorFactory.createConnector('test_user_id', 'facebook');
      
      expect(connector).toBeInstanceOf(SocialConnector);
      expect(supabaseClient.from).toHaveBeenCalledWith('social_credentials');
      expect(supabaseClient.select).toHaveBeenCalled();
      expect(supabaseClient.eq).toHaveBeenCalledWith('user_id', 'test_user_id');
      expect(supabaseClient.eq).toHaveBeenCalledWith('platform', 'facebook');
      expect(verifyCredentialsMock).toHaveBeenCalled();
    });
    
    it('debería retornar null si no se encuentran credenciales', async () => {
      // Configurar el mock de supabaseClient para simular credenciales no encontradas
      supabaseClient.from().select().eq().eq().single.mockResolvedValueOnce({
        data: null,
        error: { message: 'No se encontraron credenciales' },
      });
      
      const connector = await SocialConnectorFactory.createConnector('test_user_id', 'facebook');
      
      expect(connector).toBe(null);
      expect(supabaseClient.from).toHaveBeenCalledWith('social_credentials');
    });
    
    it('debería retornar null si las credenciales son inválidas', async () => {
      // Configurar el mock de supabaseClient para simular credenciales encontradas
      supabaseClient.from().select().eq().eq().single.mockResolvedValueOnce({
        data: {
          platform: 'facebook',
          access_token: 'test_access_token',
          refresh_token: 'test_refresh_token',
          platform_user_id: 'test_user_id',
          page_id: 'test_page_id',
        },
        error: null,
      });
      
      // Mock del método verifyCredentials
      const verifyCredentialsMock = vi.fn().mockResolvedValueOnce(false);
      SocialConnector.prototype.verifyCredentials = verifyCredentialsMock;
      
      const connector = await SocialConnectorFactory.createConnector('test_user_id', 'facebook');
      
      expect(connector).toBe(null);
      expect(verifyCredentialsMock).toHaveBeenCalled();
    });
  });
});
