import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
  typescript: true,
});

// Create a product and price for testing
export const createTestProduct = async (name: string, amount: number) => {
  try {
    // Create product
    const product = await stripe.products.create({
      name: name,
      description: `${name} subscription plan`,
    });

    // Create price
    const price = await stripe.prices.create({
      unit_amount: amount * 100, // Convert to cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      product: product.id,
    });

    return price;
  } catch (error) {
    console.error('Error creating test product:', error);
    throw error;
  }
};

// Create checkout session with dynamic price creation
export const createCheckoutSessionWithProduct = async (
  planName: string,
  amount: number,
  successUrl: string,
  cancelUrl: string,
  userId?: string
) => {
  try {
    // Create or get existing price
    const price = await createTestProduct(planName, amount);
    
    console.log('Creating checkout session with product:', {
      planName,
      amount,
      userId
    });
    
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      metadata: {
        userId: userId || '',
        planName: planName,
        planType: planName.toLowerCase().includes('pro') ? 'pro' : 'free',
      },
    });

    console.log('Checkout session created with metadata:', session.metadata);
    return session;
  } catch (error) {
    console.error('Error creating checkout session with product:', error);
    throw error;
  }
};

export const createCheckoutSession = async (
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  userId?: string,
  planName?: string
) => {
  try {
    console.log('Creating checkout session with existing price:', {
      priceId,
      planName,
      userId
    });
    
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      metadata: {
        userId: userId || '',
        planName: planName || 'Unknown Plan',
        planType: planName?.toLowerCase().includes('pro') ? 'pro' : 'free',
      },
    });

    console.log('Checkout session created with metadata:', session.metadata);
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

export const createPaymentIntent = async (
  amount: number,
  currency: string = 'usd',
  userId?: string
) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: userId || '',
      },
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

export const retrieveSubscription = async (subscriptionId: string) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    throw error;
  }
};

export const cancelSubscription = async (subscriptionId: string) => {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
    return subscription;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};
