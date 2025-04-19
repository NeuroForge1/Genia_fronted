/**
 * Integración con Stripe para GENIA
 * 
 * Este módulo proporciona funcionalidades para procesar pagos, gestionar
 * suscripciones y manejar eventos de Stripe para el sistema GENIA.
 */

const stripe = require('stripe');
const { supabaseClient } = require('../lib/supabase');

// Configuración de Stripe
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const STRIPE_PRICE_ID_BASIC = process.env.STRIPE_PRICE_ID_BASIC;
const STRIPE_PRICE_ID_PRO = process.env.STRIPE_PRICE_ID_PRO;
const STRIPE_PRICE_ID_ENTERPRISE = process.env.STRIPE_PRICE_ID_ENTERPRISE;

// Planes disponibles
const SUBSCRIPTION_PLANS = {
  BASIC: 'basic',
  PRO: 'pro',
  ENTERPRISE: 'enterprise'
};

// Mapeo de planes a price_ids
const PLAN_TO_PRICE_ID = {
  [SUBSCRIPTION_PLANS.BASIC]: STRIPE_PRICE_ID_BASIC,
  [SUBSCRIPTION_PLANS.PRO]: STRIPE_PRICE_ID_PRO,
  [SUBSCRIPTION_PLANS.ENTERPRISE]: STRIPE_PRICE_ID_ENTERPRISE
};

/**
 * Clase principal para interactuar con Stripe
 */
class StripeService {
  constructor(secretKey = STRIPE_SECRET_KEY) {
    if (!secretKey) {
      throw new Error('Se requiere una API key de Stripe');
    }
    this.stripe = stripe(secretKey);
  }

  /**
   * Crea un cliente en Stripe
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} - Cliente creado en Stripe
   */
  async createCustomer(userData) {
    try {
      const { email, name, metadata = {} } = userData;
      
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: {
          userId: metadata.userId || '',
          ...metadata
        }
      });
      
      // Guardar el ID de cliente en Supabase
      if (metadata.userId) {
        const { error } = await supabaseClient
          .from('user_profiles')
          .update({ 
            stripe_customer_id: customer.id,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', metadata.userId);
        
        if (error) {
          console.error('Error al actualizar perfil de usuario:', error);
        }
      }
      
      return {
        success: true,
        customer
      };
    } catch (error) {
      console.error('Error al crear cliente en Stripe:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtiene un cliente de Stripe
   * @param {string} customerId - ID del cliente en Stripe
   * @returns {Promise<Object>} - Cliente de Stripe
   */
  async getCustomer(customerId) {
    try {
      const customer = await this.stripe.customers.retrieve(customerId);
      
      return {
        success: true,
        customer
      };
    } catch (error) {
      console.error('Error al obtener cliente de Stripe:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Busca un cliente por email
   * @param {string} email - Email del cliente
   * @returns {Promise<Object>} - Cliente de Stripe
   */
  async findCustomerByEmail(email) {
    try {
      const customers = await this.stripe.customers.list({
        email,
        limit: 1
      });
      
      if (customers.data.length === 0) {
        return {
          success: false,
          error: 'Cliente no encontrado'
        };
      }
      
      return {
        success: true,
        customer: customers.data[0]
      };
    } catch (error) {
      console.error('Error al buscar cliente por email:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Crea una sesión de checkout para una suscripción
   * @param {Object} options - Opciones para la sesión
   * @returns {Promise<Object>} - Sesión de checkout
   */
  async createSubscriptionCheckout(options) {
    try {
      const {
        customerId,
        plan = SUBSCRIPTION_PLANS.BASIC,
        successUrl,
        cancelUrl,
        trialDays = 0,
        metadata = {}
      } = options;
      
      // Verificar que el plan sea válido
      if (!Object.values(SUBSCRIPTION_PLANS).includes(plan)) {
        throw new Error(`Plan no válido: ${plan}`);
      }
      
      // Obtener el price_id correspondiente al plan
      const priceId = PLAN_TO_PRICE_ID[plan];
      if (!priceId) {
        throw new Error(`No se encontró price_id para el plan: ${plan}`);
      }
      
      // Crear la sesión de checkout
      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1
          }
        ],
        mode: 'subscription',
        subscription_data: trialDays > 0 ? {
          trial_period_days: trialDays
        } : undefined,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId: metadata.userId || '',
          plan,
          ...metadata
        }
      });
      
      return {
        success: true,
        session
      };
    } catch (error) {
      console.error('Error al crear sesión de checkout:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Crea un portal de cliente para gestionar suscripciones
   * @param {Object} options - Opciones para el portal
   * @returns {Promise<Object>} - URL del portal de cliente
   */
  async createCustomerPortal(options) {
    try {
      const {
        customerId,
        returnUrl
      } = options;
      
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl
      });
      
      return {
        success: true,
        url: session.url
      };
    } catch (error) {
      console.error('Error al crear portal de cliente:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtiene las suscripciones de un cliente
   * @param {string} customerId - ID del cliente en Stripe
   * @returns {Promise<Object>} - Suscripciones del cliente
   */
  async getCustomerSubscriptions(customerId) {
    try {
      const subscriptions = await this.stripe.subscriptions.list({
        customer: customerId,
        status: 'all',
        expand: ['data.default_payment_method']
      });
      
      return {
        success: true,
        subscriptions: subscriptions.data
      };
    } catch (error) {
      console.error('Error al obtener suscripciones:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cancela una suscripción
   * @param {string} subscriptionId - ID de la suscripción
   * @param {boolean} immediate - Si la cancelación debe ser inmediata
   * @returns {Promise<Object>} - Resultado de la cancelación
   */
  async cancelSubscription(subscriptionId, immediate = false) {
    try {
      let subscription;
      
      if (immediate) {
        // Cancelación inmediata
        subscription = await this.stripe.subscriptions.del(subscriptionId);
      } else {
        // Cancelación al final del período
        subscription = await this.stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true
        });
      }
      
      return {
        success: true,
        subscription
      };
    } catch (error) {
      console.error('Error al cancelar suscripción:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cambia el plan de una suscripción
   * @param {string} subscriptionId - ID de la suscripción
   * @param {string} newPlan - Nuevo plan
   * @returns {Promise<Object>} - Resultado del cambio de plan
   */
  async changePlan(subscriptionId, newPlan) {
    try {
      // Verificar que el plan sea válido
      if (!Object.values(SUBSCRIPTION_PLANS).includes(newPlan)) {
        throw new Error(`Plan no válido: ${newPlan}`);
      }
      
      // Obtener el price_id correspondiente al plan
      const priceId = PLAN_TO_PRICE_ID[newPlan];
      if (!priceId) {
        throw new Error(`No se encontró price_id para el plan: ${newPlan}`);
      }
      
      // Obtener la suscripción actual
      const { data: items } = await this.stripe.subscriptionItems.list({
        subscription: subscriptionId
      });
      
      if (items.length === 0) {
        throw new Error(`No se encontraron items para la suscripción: ${subscriptionId}`);
      }
      
      // Actualizar la suscripción
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        items: [
          {
            id: items[0].id,
            price: priceId
          }
        ],
        proration_behavior: 'create_prorations'
      });
      
      return {
        success: true,
        subscription
      };
    } catch (error) {
      console.error('Error al cambiar plan:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Procesa un evento de webhook de Stripe
   * @param {string} payload - Payload del webhook
   * @param {string} signature - Firma del webhook
   * @returns {Promise<Object>} - Evento procesado
   */
  async handleWebhookEvent(payload, signature) {
    try {
      // Verificar la firma del webhook
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
      
      // Procesar el evento según su tipo
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object);
          break;
        
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
        
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object);
          break;
        
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object);
          break;
      }
      
      return {
        success: true,
        event
      };
    } catch (error) {
      console.error('Error al procesar webhook de Stripe:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Maneja el evento de checkout completado
   * @param {Object} session - Sesión de checkout
   */
  async handleCheckoutCompleted(session) {
    try {
      // Extraer el userId de los metadatos
      const userId = session.metadata?.userId;
      
      if (!userId) {
        console.warn('No se encontró userId en los metadatos de la sesión');
        return;
      }
      
      // Actualizar el estado de la suscripción en Supabase
      const { error } = await supabaseClient
        .from('user_subscriptions')
        .upsert({
          user_id: userId,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          status: 'active',
          plan: session.metadata?.plan || 'unknown',
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        throw new Error(`Error al actualizar suscripción: ${error.message}`);
      }
    } catch (error) {
      console.error('Error al manejar checkout completado:', error);
    }
  }

  /**
   * Maneja el evento de suscripción actualizada
   * @param {Object} subscription - Suscripción
   */
  async handleSubscriptionUpdated(subscription) {
    try {
      // Obtener el cliente
      const { customer } = await this.getCustomer(subscription.customer);
      
      // Extraer el userId de los metadatos del cliente
      const userId = customer.metadata?.userId;
      
      if (!userId) {
        console.warn('No se encontró userId en los metadatos del cliente');
        return;
      }
      
      // Determinar el plan basado en el price_id
      let plan = 'unknown';
      for (const [planKey, priceId] of Object.entries(PLAN_TO_PRICE_ID)) {
        if (subscription.items.data.some(item => item.price.id === priceId)) {
          plan = planKey;
          break;
        }
      }
      
      // Actualizar el estado de la suscripción en Supabase
      const { error } = await supabaseClient
        .from('user_subscriptions')
        .upsert({
          user_id: userId,
          stripe_customer_id: subscription.customer,
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          plan,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        throw new Error(`Error al actualizar suscripción: ${error.message}`);
      }
    } catch (error) {
      console.error('Error al manejar suscripción actualizada:', error);
    }
  }

  /**
   * Maneja el evento de suscripción eliminada
   * @param {Object} subscription - Suscripción
   */
  async handleSubscriptionDeleted(subscription) {
    try {
      // Obtener el cliente
      const { customer } = await this.getCustomer(subscription.customer);
      
      // Extraer el userId de los metadatos del cliente
      const userId = customer.metadata?.userId;
      
      if (!userId) {
        console.warn('No se encontró userId en los metadatos del cliente');
        return;
      }
      
      // Actualizar el estado de la suscripción en Supabase
      const { error } = await supabaseClient
        .from('user_subscriptions')
        .upsert({
          user_id: userId,
          stripe_customer_id: subscription.customer,
          stripe_subscription_id: subscription.id,
          status: 'canceled',
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        throw new Error(`Error al actualizar suscripción: ${error.message}`);
      }
    } catch (error) {
      console.error('Error al manejar suscripción eliminada:', error);
    }
  }

  /**
   * Maneja el evento de pago de factura exitoso
   * @param {Object} invoice - Factura
   */
  async handleInvoicePaymentSucceeded(invoice) {
    try {
      // Obtener la suscripción
      if (!invoice.subscription) {
        return; // No es una factura de suscripción
      }
      
      const subscription = await this.stripe.subscriptions.retrieve(invoice.subscription);
      
      // Obtener el cliente
      const { customer } = await this.getCustomer(invoice.customer);
      
      // Extraer el userId de los metadatos del cliente
      const userId = customer.metadata?.userId;
      
      if (!userId) {
        console.warn('No se encontró userId en los metadatos del cliente');
        return;
      }
      
      // Registrar el pago en Supabase
      const { error } = await supabaseClient
        .from('subscription_payments')
        .insert({
          user_id: userId,
          stripe_customer_id: invoice.customer,
          stripe_subscription_id: invoice.subscription,
          stripe_invoice_id: invoice.id,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          status: 'succeeded',
          payment_date: new Date(invoice.created * 1000).toISOString()
        });
      
      if (error) {
        throw new Error(`Error al registrar pago: ${error.message}`);
      }
    } catch (error) {
      console.error('Error al manejar pago exitoso:', error);
    }
  }

  /**
   * Maneja el evento de pago de factura fallido
   * @param {Object} invoice - Factura
   */
  async handleInvoicePaymentFailed(invoice) {
    try {
      // Obtener el cliente
      const { customer } = await this.getCustomer(invoice.customer);
      
      // Extraer el userId de los metadatos del cliente
      const userId = customer.metadata?.userId;
      
      if (!userId) {
        console.warn('No se encontró userId en los metadatos del cliente');
        return;
      }
      
      // Registrar el pago fallido en Supabase
      const { error } = await supabaseClient
        .from('subscription_payments')
        .insert({
          user_id: userId,
          stripe_customer_id: invoice.customer,
          stripe_subscription_id: invoice.subscription,
          stripe_invoice_id: invoice.id,
          amount: invoice.amount_due,
          currency: invoice.currency,
          status: 'failed',
          payment_date: new Date(invoice.created * 1000).toISOString()
        });
      
      if (error) {
        throw new Error(`Error al registrar pago fallido: ${error.message}`);
      }
      
      // Enviar notificación al usuario (implementación simplificada)
      console.log(`Notificación: Pago fallido para el usuario ${userId}`);
    } catch (error) {
      console.error('Error al manejar pago fallido:', error);
    }
  }
}

// Exportar la clase y constantes
module.exports = {
  StripeService,
  SUBSCRIPTION_PLANS
};

// Crear una instancia por defecto para uso en la aplicación
const stripeService = new StripeService();
module.exports.default = stripeService;
