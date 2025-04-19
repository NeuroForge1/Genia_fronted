import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import stripePromise, { subscriptionPlans, SubscriptionPlan } from '../../lib/stripe';
import { supabase } from '../../lib/supabase';

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubscription = async (plan: SubscriptionPlan) => {
    if (!user) {
      setError('Debes iniciar sesión para suscribirte');
      return;
    }

    setLoading(plan.id);
    setError(null);

    try {
      // 1. Crear una sesión de checkout en el servidor
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          userId: user.id,
          userEmail: user.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la sesión de checkout');
      }

      const { sessionId } = await response.json();

      // 2. Redirigir al checkout de Stripe
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Error al cargar Stripe');
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (stripeError) {
        throw new Error(stripeError.message || 'Error al redirigir al checkout');
      }
    } catch (err) {
      console.error('Error al procesar la suscripción:', err);
      setError(err instanceof Error ? err.message : 'Error al procesar la suscripción');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Planes de Suscripción
        </h2>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
          Elige el plan que mejor se adapte a tus necesidades
        </p>
      </div>

      {error && (
        <div className="mt-6 max-w-md mx-auto bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-12 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
        {subscriptionPlans.map((plan) => (
          <div key={plan.id} className="relative p-8 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
              <p className="mt-4 flex items-baseline text-gray-900">
                <span className="text-5xl font-extrabold tracking-tight">${plan.price}</span>
                <span className="ml-1 text-xl font-semibold">/{plan.interval}</span>
              </p>
              <p className="mt-6 text-gray-500">{plan.description}</p>

              <ul className="mt-6 space-y-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex">
                    <svg className="flex-shrink-0 w-6 h-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleSubscription(plan)}
              disabled={loading === plan.id}
              className="mt-8 block w-full bg-blue-600 border border-transparent rounded-md py-3 px-6 text-center font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading === plan.id ? 'Procesando...' : `Suscribirse al ${plan.name}`}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-base text-gray-500">
          Todos los planes incluyen una prueba gratuita de 7 días. Puedes cancelar en cualquier momento.
        </p>
      </div>
    </div>
  );
}
