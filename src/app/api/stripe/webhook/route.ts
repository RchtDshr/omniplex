import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe-server';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature found' },
      { status: 400 }
    );
  }

  let event;

  try {
    // For development, you can use a test webhook secret
    // In production, use your actual webhook secret from Stripe Dashboard
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_webhook_secret';
    
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Payment successful:', session.id);
        
        // Here you would typically:
        // 1. Update user's subscription status in your database
        // 2. Send confirmation email
        // 3. Grant access to premium features
        
        break;

      case 'customer.subscription.updated':
        const subscription = event.data.object;
        console.log('Subscription updated:', subscription.id);
        
        // Handle subscription updates
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        console.log('Subscription canceled:', deletedSubscription.id);
        
        // Handle subscription cancellation
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        console.log('Payment failed:', failedInvoice.id);
        
        // Handle failed payments
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
