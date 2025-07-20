import { loadStripe, Stripe } from '@stripe/stripe-js';
import { PricingPlan } from './types';

// Client-side Stripe instance
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

// Test pricing plans - Only Pro Plan
export const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'usd',
    interval: 'month',
    stripePriceId: '', // No price ID for free plan
    features: [
      '10 chat messages per day',
      'Basic search functionality',
      'Standard response speed',
      'Email support'
    ]
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: 10,
    currency: 'usd',
    interval: 'month',
    stripePriceId: 'price_1Rn2RyGaIR4CtU5otpjHbeiF', // You need the price ID (starts with 'price_'), not product ID
    popular: true,
    features: [
      'Unlimited chat messages',
      'Advanced search & analysis',
      'Priority response speed',
      'File upload & analysis',
      'Stock & weather data',
      'Priority email support',
      'Export chat history'
    ]
  }
];

// Format price for display
export const formatPrice = (price: number, currency: string = 'usd'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(price);
};

// Get plan by ID
export const getPlanById = (planId: string): PricingPlan | undefined => {
  return pricingPlans.find(plan => plan.id === planId);
};

// Check if user has access to feature based on plan
export const hasFeatureAccess = (userPlan: string, feature: string): boolean => {
  const plan = getPlanById(userPlan);
  if (!plan) return false;
  
  // Free plan restrictions
  if (userPlan === 'free') {
    const restrictedFeatures = ['unlimited_chat', 'file_upload', 'priority_support'];
    return !restrictedFeatures.includes(feature);
  }
  
  return true;
};
