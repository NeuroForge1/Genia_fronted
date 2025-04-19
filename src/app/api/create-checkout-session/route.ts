import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Inicializar Stripe con la clave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_your_default_key', {
  apiVersion: '2023-10-16',
});

export async function POST(req: NextRequest) {
  try {
    const { priceId, userId, userEmail } = await req.json();

    // Validar los datos recibidos
    if (!priceId || !userId || !userEmail) {
      return NextResponse.json(
        { message: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Crear la sesión de checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/cancel`,
      client_reference_id: userId,
      customer_email: userEmail,
      metadata: {
        userId,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error al crear la sesión de checkout:', error);
    return NextResponse.json(
      { message: 'Error al crear la sesión de checkout' },
      { status: 500 }
    );
  }
}
