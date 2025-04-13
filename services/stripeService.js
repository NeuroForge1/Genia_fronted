/**
 * Servicio para integración con Stripe (Pagos)
 */
const stripeService = {
  /**
   * Inicializar checkout de Stripe
   * @param {string} planId - ID del plan a comprar
   * @param {string} successUrl - URL de redirección en caso de éxito
   * @param {string} cancelUrl - URL de redirección en caso de cancelación
   * @returns {Promise} - Promesa con la URL de checkout
   */
  async createCheckoutSession(planId, successUrl, cancelUrl) {
    try {
      const response = await fetch('https://genia-backend.onrender.com/api/payments/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('genia_token')}`
        },
        body: JSON.stringify({
          planId,
          successUrl,
          cancelUrl
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear sesión de checkout');
      }
      
      const data = await response.json();
      return {
        status: 'success',
        message: 'Sesión de checkout creada correctamente',
        checkoutUrl: data.url,
        sessionId: data.sessionId
      };
    } catch (error) {
      console.error('Error al crear sesión de checkout:', error);
      return {
        status: 'error',
        message: 'No se pudo crear la sesión de checkout',
        error: error.message
      };
    }
  },
  
  /**
   * Obtener información de la suscripción del usuario
   * @returns {Promise} - Promesa con la información de la suscripción
   */
  async getSubscriptionInfo() {
    try {
      const response = await fetch('https://genia-backend.onrender.com/api/payments/subscription', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('genia_token')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener información de suscripción');
      }
      
      const data = await response.json();
      return {
        status: 'success',
        message: 'Información de suscripción obtenida correctamente',
        data
      };
    } catch (error) {
      console.error('Error al obtener información de suscripción:', error);
      return {
        status: 'error',
        message: 'No se pudo obtener la información de suscripción',
        error: error.message
      };
    }
  },
  
  /**
   * Cancelar suscripción
   * @returns {Promise} - Promesa con el resultado de la cancelación
   */
  async cancelSubscription() {
    try {
      const response = await fetch('https://genia-backend.onrender.com/api/payments/cancel-subscription', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('genia_token')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cancelar suscripción');
      }
      
      const data = await response.json();
      return {
        status: 'success',
        message: 'Suscripción cancelada correctamente',
        data
      };
    } catch (error) {
      console.error('Error al cancelar suscripción:', error);
      return {
        status: 'error',
        message: 'No se pudo cancelar la suscripción',
        error: error.message
      };
    }
  },
  
  /**
   * Obtener historial de facturas
   * @returns {Promise} - Promesa con el historial de facturas
   */
  async getInvoiceHistory() {
    try {
      const response = await fetch('https://genia-backend.onrender.com/api/payments/invoices', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('genia_token')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener historial de facturas');
      }
      
      const data = await response.json();
      return {
        status: 'success',
        message: 'Historial de facturas obtenido correctamente',
        data
      };
    } catch (error) {
      console.error('Error al obtener historial de facturas:', error);
      return {
        status: 'error',
        message: 'No se pudo obtener el historial de facturas',
        error: error.message
      };
    }
  },
  
  /**
   * Verificar estado de la integración con Stripe
   * @returns {Promise} - Promesa con el estado de la integración
   */
  async checkStatus() {
    try {
      const response = await fetch('https://genia-backend.onrender.com/api/payments/status', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('genia_token')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al verificar estado de Stripe');
      }
      
      const data = await response.json();
      return {
        status: 'success',
        message: 'Estado de Stripe verificado correctamente',
        data
      };
    } catch (error) {
      console.error('Error al verificar estado de Stripe:', error);
      return {
        status: 'error',
        message: 'No se pudo verificar el estado de Stripe',
        error: error.message
      };
    }
  }
};

export default stripeService;
