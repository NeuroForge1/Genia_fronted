// Servicio para gestionar el sistema de referidos
import supabaseService from './supabaseService';

/**
 * Servicio para gestionar el sistema de referidos en GENIA
 */
const referralsService = {
  /**
   * Obtener información del programa de referidos del usuario actual
   * @returns {Promise<Object>} - Información del programa de referidos
   */
  async getReferralInfo() {
    try {
      const user = await supabaseService.getCurrentUser();
      if (!user) throw new Error('Usuario no autenticado');
      
      // Generar código de referido basado en el nombre o email del usuario
      const userName = user.user_metadata?.nombre || user.email.split('@')[0];
      const referralCode = userName.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 1000);
      
      // En una implementación real, esto obtendría datos de Supabase
      // Por ahora, devolvemos datos de ejemplo
      return {
        referralCode: referralCode,
        referralLink: `https://genia.app?ref=${referralCode}`,
        activeReferrals: 3,
        totalReferrals: 5,
        rewardsEarned: '+7 días Pro',
        nextReward: '5 referidos = Upgrade a GENIA Pro',
        rewardTiers: [
          { count: 1, reward: '+3 días Pro' },
          { count: 3, reward: '+7 días Pro' },
          { count: 5, reward: 'Upgrade a GENIA Pro' },
          { count: 10, reward: '+50 créditos mensuales' }
        ]
      };
    } catch (error) {
      console.error('Error al obtener información de referidos:', error);
      throw error;
    }
  },
  
  /**
   * Obtener lista de usuarios referidos
   * @returns {Promise<Array>} - Lista de usuarios referidos
   */
  async getReferredUsers() {
    try {
      const user = await supabaseService.getCurrentUser();
      if (!user) throw new Error('Usuario no autenticado');
      
      // En una implementación real, esto obtendría datos de Supabase
      return [
        {
          id: 'ref1',
          name: 'Carlos Mendoza',
          email: 'c****@gmail.com',
          joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          plan: 'Basic'
        },
        {
          id: 'ref2',
          name: 'Laura Sánchez',
          email: 'l****@outlook.com',
          joinDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          plan: 'Pro'
        },
        {
          id: 'ref3',
          name: 'Miguel Ángel',
          email: 'm****@hotmail.com',
          joinDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          plan: 'Basic'
        }
      ];
    } catch (error) {
      console.error('Error al obtener usuarios referidos:', error);
      throw error;
    }
  },
  
  /**
   * Registrar un nuevo usuario referido
   * @param {string} referralCode - Código de referido utilizado
   * @param {Object} userData - Datos del nuevo usuario
   * @returns {Promise<Object>} - Resultado de la operación
   */
  async registerReferral(referralCode, userData) {
    try {
      // En una implementación real, esto verificaría el código y registraría el referido
      console.log(`Registrando referido con código ${referralCode}`);
      console.log('Datos del usuario:', userData);
      
      // Simulamos un retraso de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        message: 'Referido registrado correctamente',
        reward: '+3 días Pro'
      };
    } catch (error) {
      console.error('Error al registrar referido:', error);
      throw error;
    }
  },
  
  /**
   * Reclamar recompensa por referidos
   * @param {string} rewardId - ID de la recompensa a reclamar
   * @returns {Promise<Object>} - Resultado de la operación
   */
  async claimReferralReward(rewardId) {
    try {
      const user = await supabaseService.getCurrentUser();
      if (!user) throw new Error('Usuario no autenticado');
      
      // En una implementación real, esto verificaría elegibilidad y procesaría la recompensa
      console.log(`Reclamando recompensa ${rewardId} para el usuario ${user.id}`);
      
      // Simulamos un retraso de procesamiento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        success: true,
        message: 'Recompensa reclamada correctamente',
        reward: {
          id: rewardId,
          type: 'credits',
          amount: 50,
          description: '+50 créditos por referidos'
        }
      };
    } catch (error) {
      console.error(`Error al reclamar recompensa ${rewardId}:`, error);
      throw error;
    }
  },
  
  /**
   * Compartir enlace de referido en redes sociales
   * @param {string} platform - Plataforma donde compartir (twitter, facebook, whatsapp)
   * @returns {Promise<Object>} - URL para compartir
   */
  async shareReferralLink(platform) {
    try {
      const referralInfo = await this.getReferralInfo();
      const message = encodeURIComponent(`¡Únete a GENIA y potencia tu negocio con IA! Usa mi enlace: ${referralInfo.referralLink}`);
      
      let shareUrl;
      
      switch (platform) {
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${message}`;
          break;
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralInfo.referralLink)}&quote=${message}`;
          break;
        case 'whatsapp':
          shareUrl = `https://wa.me/?text=${message}`;
          break;
        default:
          throw new Error('Plataforma no soportada');
      }
      
      return {
        success: true,
        shareUrl: shareUrl
      };
    } catch (error) {
      console.error(`Error al compartir enlace en ${platform}:`, error);
      throw error;
    }
  }
};

export default referralsService;
