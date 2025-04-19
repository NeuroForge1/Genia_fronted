import { loadStripe } from '@stripe/stripe-js';

// Cargar Stripe con la clave pública
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_live_51QTIgK00gy6Lj7ju9M89ksAeF5PjacmE98vQzO4PQ7bz2XLfokSJHf5Qm5Xar11wHoinS6N4wMS4hyVv3i5gcIpz00IgMP572L');

export default stripePromise;

// Tipos para los planes de suscripción
export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
};

// Definición de los planes disponibles
export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Plan Básico',
    description: 'Ideal para emprendedores y pequeñas empresas',
    price: 29,
    interval: 'month',
    features: [
      'Acceso a 2 clones de IA',
      '100 mensajes por mes',
      'Soporte por email',
    ],
    stripePriceId: 'price_basic_monthly',
  },
  {
    id: 'pro',
    name: 'Plan Profesional',
    description: 'Perfecto para negocios en crecimiento',
    price: 79,
    interval: 'month',
    features: [
      'Acceso a 4 clones de IA',
      '500 mensajes por mes',
      'Soporte prioritario',
      'Integración con WhatsApp',
    ],
    stripePriceId: 'price_pro_monthly',
  },
  {
    id: 'enterprise',
    name: 'Plan Empresarial',
    description: 'Solución completa para empresas',
    price: 199,
    interval: 'month',
    features: [
      'Acceso a todos los clones de IA',
      'Mensajes ilimitados',
      'Soporte 24/7',
      'Integración con WhatsApp',
      'API personalizada',
      'Onboarding dedicado',
    ],
    stripePriceId: 'price_enterprise_monthly',
  },
];

// Función para obtener un plan por su ID
export const getPlanById = (planId: string): SubscriptionPlan | undefined => {
  return subscriptionPlans.find(plan => plan.id === planId);
};

// Función para crear una sesión de checkout
export const createCheckoutSession = async (planId: string, userId: string): Promise<string | null> => {
  try {
    const plan = getPlanById(planId);
    if (!plan) {
      throw new Error('Plan no encontrado');
    }

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId: plan.id,
        priceId: plan.stripePriceId,
        userId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear la sesión de checkout');
    }

    const data = await response.json();
    return data.sessionId;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return null;
  }
};

// Función para obtener la suscripción actual del usuario
export const getCurrentSubscription = async (userId: string): Promise<any> => {
  try {
    const response = await fetch(`/api/subscriptions/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener la suscripción');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
};
