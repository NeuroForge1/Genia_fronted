/**
 * Integración con Stripe para GENIA
 * 
 * Este módulo proporciona funcionalidades para procesar pagos, gestionar
 * suscripciones y manejar eventos de Stripe para el sistema GENIA.
 */

import Stripe from 'stripe';
import { supabaseClient } from '../supabase';

// Planes disponibles
export enum SubscriptionPlan {
  BASIC = 'basic',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

// Interfaces para los datos de usuario
export interface UserData {
  email: string;
  name: string;
  metadata?: Record<string, string>;
}

// Interfaces para opciones de checkout
export interface SubscriptionCheckoutOptions {
  customerId: string;
  plan?: SubscriptionPlan;
  successUrl: string;
  cancelUrl: string;
  trialDays?: number;
  metadata?: Record<string, string>;
}

// Interfaces para opciones de portal de cliente
export interface CustomerPortalOptions {
  customerId: string;
  returnUrl: string;
}

// Interfaces para resultados
export interface StripeResult<T> {
  success: boolean;
  error?: string;
  [key: string]: any;
}

export interface CustomerResult extends StripeResult<Stripe.Customer> {
  customer?: Stripe.Customer;
}

export interface SessionResult extends StripeResult<Stripe.Checkout.Session> {
  session?: Stripe.Checkout.Session;
}

export interface PortalResult extends StripeResult<string> {
  url?: string;
}

export interface SubscriptionsResult extends StripeResult<Stripe.Subscription[]> {
  subscriptions?: Stripe.Subscription[];
}

export interface SubscriptionResult extends StripeResult<Stripe.Subscription> {
  subscription?: Stripe.Subscription;
}

export interface WebhookResult extends StripeResult<Stripe.Event> {
  event?: Stripe.Event;
}

/**
 * Clase principal para interactuar con Stripe
 */
export class StripeService {
  private stripe: Stripe;
  private readonly PLAN_TO_PRICE_ID: Record<SubscriptionPlan, string>;

  constructor(secretKey?: string) {
    const STRIPE_SECRET_KEY = secretKey || process.env.STRIPE_SECRET_KEY || '';
    if (!STRIPE_SECRET_KEY) {
      throw new Error('Se requiere una API key de Stripe');
    }
    
    this.stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16'
    });
    
    // Mapeo de planes a price_ids
    this.PLAN_TO_PRICE_ID = {
      [SubscriptionPlan.BASIC]: process.env.STRIPE_PRICE_ID_BASIC || '',
      [SubscriptionPlan.PRO]: process.env.STRIPE_PRICE_ID_PRO || '',
      [SubscriptionPlan.ENTERPRISE]: process.env.STRIPE_PRICE_ID_ENTERPRISE || ''
    };
  }

  /**
   * Crea un cliente en Stripe
   */
  async createCustomer(userData: UserData): Promise<CustomerResult> {
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
    } catch (error: any) {
      console.error('Error al crear cliente en Stripe:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtiene un cliente de Stripe
   */
  async getCustomer(customerId: string): Promise<CustomerResult> {
    try {
      const customer = await this.stripe.customers.retrieve(customerId);
      
      if (customer.deleted) {
        return {
          success: false,
          error: 'Cliente eliminado'
        };
      }
      
      return {
        success: true,
        customer: customer as Stripe.Customer
      };
    } catch (error: any) {
      console.error('Error al obtener cliente de Stripe:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Busca un cliente por email
   */
  async findCustomerByEmail(email: string): Promise<CustomerResult> {
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
    } catch (error: any) {
      console.error('Error al buscar cliente por email:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Crea una sesión de checkout para una suscripción
   */
  async createSubscriptionCheckout(options: SubscriptionCheckoutOptions): Promise<SessionResult> {
    try {
      const {
        customerId,
        plan = SubscriptionPlan.BASIC,
        successUrl,
        cancelUrl,
        trialDays = 0,
        metadata = {}
      } = options;
      
      // Verificar que el plan sea válido
      if (!Object.values(SubscriptionPlan).includes(plan)) {
        throw new Error(`Plan no válido: ${plan}`);
      }
      
      // Obtener el price_id correspondiente al plan
      const priceId = this.PLAN_TO_PRICE_ID[plan];
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
    } catch (error: any) {
      console.error('Error al crear sesión de checkout:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Crea un portal de cliente para gestionar suscripciones
   */
  async createCustomerPortal(options: CustomerPortalOptions): Promise<PortalResult> {
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
    } catch (error: any) {
      console.error('Error al crear portal de cliente:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtiene las suscripciones de un cliente
   */
  async getCustomerSubscriptions(customerId: string): Promise<SubscriptionsResult> {
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
    } catch (error: any) {
      console.error('Error al obtener suscripciones:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cancela una suscripción
   */
  async cancelSubscription(subscriptionId: string, immediate: boolean = false): Promise<SubscriptionResult> {
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
    } catch (error: any) {
      console.error('Error al cancelar suscripción:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cambia el plan de una suscripción
   */
  async changePlan(subscriptionId: string, newPlan: SubscriptionPlan): Promise<SubscriptionResult> {
    try {
      // Verificar que el plan sea válido
      if (!Object.values(SubscriptionPlan).includes(newPlan)) {
        throw new Error(`Plan no válido: ${newPlan}`);
      }
      
      // Obtener el price_id correspondiente al plan
      const priceId = this.PLAN_TO_PRICE_ID[newPlan];
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
    } catch (error: any) {
      console.error('Error al cambiar plan:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Procesa un evento de webhook de Stripe
   */
  async handleWebhookEvent(payload: string, signature: string): Promise<WebhookResult> {
    try {
      // Verificar la firma del webhook
      const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
      if (!STRIPE_WEBHOOK_SECRET) {
        throw new Error('Se requiere STRIPE_WEBHOOK_SECRET para verificar webhooks');
      }
      
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
      
      // Procesar el evento según su tipo
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;
        
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
        
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
        
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;
      }
      
      return {
        success: true,
        event
      };
    } catch (error: any) {
      console.error('Error al procesar webhook de Stripe:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Maneja el evento de checkout completado
   */
  private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
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
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          status: 'active',
          plan: session.metadata?.plan || 'unknown',
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        throw new Error(`Error al actualizar suscripción: ${error.message}`);
      }
    } catch (error: any) {
      console.error('Error al manejar checkout completado:', error);
    }
  }

  /**
   * Maneja el evento de suscripción actualizada
   */
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    try {
      // Obtener el cliente
      const customerResult = await this.getCustomer(subscription.customer as string);
      
      if (!customerResult.success || !customerResult.customer) {
        throw new Error('No se pudo obtener el cliente');
      }
      
      const customer = customerResult.customer;
      
      // Extraer el userId de los metadatos del cliente
      const userId = customer.metadata?.userId;
      
      if (!userId) {
        console.warn('No se encontró userId en los metadatos del cliente');
        return;
      }
      
      // Determinar el plan basado en el price_id
      let plan = 'unknown';
      for (const [planKey, priceId] of Object.entries(this.PLAN_TO_PRICE_ID)) {
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
          stripe_customer_id: subscription.customer as string,
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
    } catch (error: any) {
      console.error('Error al manejar suscripción actualizada:', error);
    }
  }

  /**
   * Maneja el evento de suscripción eliminada
   */
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    try {
      // Obtener el cliente
      const customerResult = await this.getCustomer(subscription.customer as string);
      
      if (!customerResult.success || !customerResult.customer) {
        throw new Error('No se pudo obtener el cliente');
      }
      
      const customer = customerResult.customer;
      
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
          stripe_customer_id: subscription.customer as string,
          stripe_subscription_id: subscription.id,
          status: 'canceled',
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        throw new Error(`Error al actualizar suscripción: ${error.message}`);
      }
    } catch (error: any) {
      console.error('Error al manejar suscripción eliminada:', error);
    }
  }

  /**
   * Maneja el evento de pago de factura exitoso
   */
  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    try {
      // Obtener la suscripción
      if (!invoice.subscription) {
        return; // No es una factura de suscripción
      }
      
      const subscription = await this.stripe.subscriptions.retrieve(invoice.subscription as string);
      
      // Obtener el cliente
      const customerResult = await this.getCustomer(invoice.customer as string);
      
      if (!customerResult.success || !customerResult.customer) {
        throw new Error('No se pudo obtener el cliente');
      }
      
      const customer = customerResult.customer;
      
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
          stripe_customer_id: invoice.customer as string,
          stripe_subscription_id: invoice.subscription as string,
          stripe_invoice_id: invoice.id,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          status: 'succeeded',
          payment_date: new Date(invoice.created * 1000).toISOString()
        });
      
      if (error) {
        throw new Error(`Error al registrar pago: ${error.message}`);
      }
    } catch (error: any) {
      console.error('Error al manejar pago exitoso:', error);
    }
  }

  /**
   * Maneja el evento de pago de factura fallido
   */
  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    try {
      // Obtener el cliente
      const customerResult = await this.getCustomer(invoice.customer as string);
      
      if (!customerResult.success || !customerResult.customer) {
        throw new Error('No se pudo obtener el cliente');
      }
      
      const customer = customerResult.customer;
      
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
          stripe_customer_id: invoice.customer as string,
          stripe_subscription_id: invoice.subscription as string,
          stripe_invoice_id: invoice.id,
          amount: invoice.amount_due,
          currency: invoice.currency,
          status: 'failed',
          payment_date: new Date(invoice.created * 1000).toISOString()
        });
      
      if (error) {
        throw new Error(`Error al registrar pago fallido: ${error.message}`);
      }
      
      // Notificar al usuario del pago fallido
      // Aquí se podría implementar el envío de un email o notificación
    } catch (error: any) {
      console.error('Error al manejar pago fallido:', error);
    }
  }
}

// Crear una instancia por defecto para uso en la aplicación
const stripeService = new StripeService();
export default stripeService;
