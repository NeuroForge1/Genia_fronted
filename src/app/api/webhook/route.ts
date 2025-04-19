import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

// Inicializar Stripe con la clave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_your_default_key', {
  apiVersion: '2023-10-16',
});

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('stripe-signature') as string;
    const body = await req.text();

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { message: 'Falta la firma de Stripe o el secreto del webhook' },
        { status: 400 }
      );
    }

    // Verificar la firma del webhook
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Error al verificar la firma del webhook:', err);
      return NextResponse.json(
        { message: 'Error al verificar la firma del webhook' },
        { status: 400 }
      );
    }

    // Manejar los eventos de Stripe
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }
      default:
        console.log(`Evento no manejado: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error al procesar el webhook de Stripe:', error);
    return NextResponse.json(
      { message: 'Error al procesar el webhook de Stripe' },
      { status: 500 }
    );
  }
}

// Función para manejar el evento checkout.session.completed
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const subscriptionId = session.subscription as string;

  if (!userId || !subscriptionId) {
    console.error('Falta userId o subscriptionId en la sesión de checkout');
    return;
  }

  try {
    // Obtener los detalles de la suscripción
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items.data[0].price.id;
    const productId = subscription.items.data[0].price.product as string;
    const product = await stripe.products.retrieve(productId);

    // Determinar el plan basado en el producto
    let plan = 'free';
    if (product.name.toLowerCase().includes('básico') || product.name.toLowerCase().includes('basic')) {
      plan = 'basic';
    } else if (product.name.toLowerCase().includes('pro') || product.name.toLowerCase().includes('profesional')) {
      plan = 'pro';
    } else if (product.name.toLowerCase().includes('enterprise') || product.name.toLowerCase().includes('empresarial')) {
      plan = 'enterprise';
    }

    // Actualizar la tabla de suscripciones en Supabase
    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        stripe_subscription_id: subscriptionId,
        stripe_customer_id: subscription.customer as string,
        stripe_price_id: priceId,
        status: subscription.status,
        plan: plan,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
      });

    if (error) {
      console.error('Error al actualizar la suscripción en Supabase:', error);
    }

    // Actualizar el plan en el perfil del usuario
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ plan: plan })
      .eq('user_id', userId);

    if (profileError) {
      console.error('Error al actualizar el plan en el perfil del usuario:', profileError);
    }
  } catch (error) {
    console.error('Error al procesar la suscripción completada:', error);
  }
}

// Función para manejar el evento customer.subscription.updated
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    // Buscar la suscripción en Supabase
    const { data, error } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    if (error || !data) {
      console.error('Error al buscar la suscripción en Supabase:', error);
      return;
    }

    const userId = data.user_id;
    const priceId = subscription.items.data[0].price.id;
    const productId = subscription.items.data[0].price.product as string;
    const product = await stripe.products.retrieve(productId);

    // Determinar el plan basado en el producto
    let plan = 'free';
    if (product.name.toLowerCase().includes('básico') || product.name.toLowerCase().includes('basic')) {
      plan = 'basic';
    } else if (product.name.toLowerCase().includes('pro') || product.name.toLowerCase().includes('profesional')) {
      plan = 'pro';
    } else if (product.name.toLowerCase().includes('enterprise') || product.name.toLowerCase().includes('empresarial')) {
      plan = 'enterprise';
    }

    // Actualizar la tabla de suscripciones en Supabase
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        stripe_price_id: priceId,
        status: subscription.status,
        plan: plan,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
      })
      .eq('stripe_subscription_id', subscription.id);

    if (updateError) {
      console.error('Error al actualizar la suscripción en Supabase:', updateError);
    }

    // Actualizar el plan en el perfil del usuario
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ plan: plan })
      .eq('user_id', userId);

    if (profileError) {
      console.error('Error al actualizar el plan en el perfil del usuario:', profileError);
    }
  } catch (error) {
    console.error('Error al procesar la actualización de la suscripción:', error);
  }
}

// Función para manejar el evento customer.subscription.deleted
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    // Buscar la suscripción en Supabase
    const { data, error } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    if (error || !data) {
      console.error('Error al buscar la suscripción en Supabase:', error);
      return;
    }

    const userId = data.user_id;

    // Actualizar la tabla de suscripciones en Supabase
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        cancel_at_period_end: subscription.cancel_at_period_end,
      })
      .eq('stripe_subscription_id', subscription.id);

    if (updateError) {
      console.error('Error al actualizar la suscripción en Supabase:', updateError);
    }

    // Si la suscripción ha terminado, actualizar el plan del usuario a 'free'
    if (subscription.status === 'canceled') {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ plan: 'free' })
        .eq('user_id', userId);

      if (profileError) {
        console.error('Error al actualizar el plan en el perfil del usuario:', profileError);
      }
    }
  } catch (error) {
    console.error('Error al procesar la eliminación de la suscripción:', error);
  }
}
