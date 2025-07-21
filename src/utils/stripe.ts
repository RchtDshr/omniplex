/**
 * Stripe Client Utilities
 * 
 * This file only handles Stripe client-side initialization.
 * For subscription logic, pricing plans, and feature access,
 * use the modular subscription system: @/lib/subscription
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';

// Client-side Stripe instance
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};
