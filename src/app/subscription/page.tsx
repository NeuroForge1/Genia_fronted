import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';

const SubscriptionPage: React.FC = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar planes y suscripción actual
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('genia_token');
        
        // Obtener planes disponibles
        const plansResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/payments/plans`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!plansResponse.ok) {
          throw new Error('Error al cargar los planes de suscripción');
        }
        
        const plansData = await plansResponse.json();
        setPlans(plansData);
        
        // Obtener suscripción actual
        const subscriptionResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/payments/current`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (subscriptionResponse.ok) {
          const subscriptionData = await subscriptionResponse.json();
          setCurrentSubscription(subscriptionData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Función para crear sesión de checkout
  const handleSubscribe = async (planId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('genia_token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/payments/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan_id: planId,
          success_url: `${window.location.origin}/subscription?success=true`,
          cancel_url: `${window.location.origin}/subscription?canceled=true`
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al crear la sesión de checkout');
      }
      
      const { checkout_url } = await response.json();
      
      // Redirigir a la página de checkout de Stripe
      window.location.href = checkout_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setLoading(false);
    }
  };

  // Función para cancelar suscripción
  const handleCancelSubscription = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('genia_token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/payments/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al cancelar la suscripción');
      }
      
      // Actualizar la suscripción actual
      setCurrentSubscription(null);
      
      // Mostrar mensaje de éxito
      alert('Suscripción cancelada correctamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Formatear fecha
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Planes de Suscripción</h1>
        
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
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
        
        {/* Suscripción actual */}
        {currentSubscription && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Tu suscripción actual</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Detalles de tu plan activo.</p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="mb-4">
                <h4 className="text-md font-medium text-gray-900">{currentSubscription.plan.name}</h4>
                <p className="text-sm text-gray-500">{currentSubscription.plan.description}</p>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-sm font-medium text-gray-500">Estado</div>
                  <div className="mt-1 text-sm text-gray-900">
                    {currentSubscription.status === 'active' ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Activa
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        {currentSubscription.status}
                      </span>
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-500">Próxima facturación</div>
                  <div className="mt-1 text-sm text-gray-900">{formatDate(currentSubscription.current_period_end)}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-500">Precio</div>
                  <div className="mt-1 text-sm text-gray-900">${currentSubscription.plan.price}/mes</div>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={handleCancelSubscription}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {loading ? 'Procesando...' : 'Cancelar suscripción'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Planes disponibles */}
        <div className="mt-8 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-x-8">
          {loading ? (
            <div className="col-span-2 flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            plans.map((plan) => (
              <div key={plan.id} className="relative p-8 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                  
                  {plan.name.toLowerCase().includes('premium') && (
                    <p className="absolute top-0 -translate-y-1/2 transform rounded-full bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white">
                      Más popular
                    </p>
                  )}
                  
                  <p className="mt-4 flex items-baseline text-gray-900">
                    <span className="text-5xl font-extrabold tracking-tight">${plan.price}</span>
                    <span className="ml-1 text-xl font-semibold">/{plan.interval}</span>
                  </p>
                  <p className="mt-6 text-gray-500">{plan.description}</p>
                  
                  {/* Lista de características */}
                  <ul role="list" className="mt-6 space-y-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex">
                        <svg className="flex-shrink-0 w-6 h-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="ml-3 text-gray-500">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading || (currentSubscription && currentSubscription.plan.id === plan.id)}
                  className={`mt-8 block w-full py-3 px-6 border border-transparent rounded-md shadow text-center text-sm font-medium ${
                    plan.name.toLowerCase().includes('premium')
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  } ${
                    (currentSubscription && currentSubscription.plan.id === plan.id) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {currentSubscription && currentSubscription.plan.id === plan.id
                    ? 'Plan actual'
                    : loading
                    ? 'Procesando...'
                    : `Suscribirse a ${plan.name}`}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SubscriptionPage;
