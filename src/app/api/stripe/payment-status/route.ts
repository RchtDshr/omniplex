import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      status: session.payment_status,
      customerEmail: session.customer_details?.email,
      amountTotal: session.amount_total,
      currency: session.currency,
      subscriptionId: session.subscription,
    });
  } catch (error) {
    console.error('Payment status error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve payment status' },
      { status: 500 }
    );
  }
}
