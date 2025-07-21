import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, createCheckoutSessionWithProduct } from '@/utils/stripe-server';
import { getPlanById } from '@/utils/stripe';

export async function POST(request: NextRequest) {
  try {
    const { priceId, userId, planId } = await request.json();

    const baseUrl = process.env.NODE_ENV === 'production' 
      ? `https://${request.headers.get('host')}` 
      : `http://${request.headers.get('host')}`;

    const successUrl = `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&plan=${planId}`;
    const cancelUrl = `${baseUrl}/pricing?cancelled=true`;

    let session;

    // If we have a real price ID (not placeholder), use it directly
    if (priceId && priceId !== 'REPLACE_WITH_YOUR_STRIPE_PRICE_ID' && priceId.startsWith('price_')) {
      const plan = getPlanById(planId);
      session = await createCheckoutSession(
        priceId,
        successUrl,
        cancelUrl,
        userId,
        plan?.name || 'Unknown Plan'
      );
    } else {
      // Get plan details for dynamic pricing
      const plan = getPlanById(planId);
      if (!plan || plan.price === 0) {
        return NextResponse.json(
          { error: 'Invalid plan selected' },
          { status: 400 }
        );
      }

      session = await createCheckoutSessionWithProduct(
        plan.name,
        plan.price,
        successUrl,
        cancelUrl,
        userId
      );
    }

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
