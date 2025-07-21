/**
 * Subscription Configuration
 * Centralized configuration for all subscription plans and features
 */

import { PricingPlan } from '../../utils/types';

// Plan IDs - Centralized constants
export const PLAN_IDS = {
  FREE: 'free',
  PRO: 'pro',
} as const;

export type PlanId = typeof PLAN_IDS[keyof typeof PLAN_IDS];

// Feature flags for different plans
export const PLAN_FEATURES = {
  [PLAN_IDS.FREE]: {
    maxMessagesPerDay: 10,
    hasAdvancedSearch: false,
    hasFileUpload: false,
    hasStockData: false,
    hasWeatherData: false,
    hasPrioritySupport: false,
    hasExportHistory: false,
    responseSpeed: 'standard',
  },
  [PLAN_IDS.PRO]: {
    maxMessagesPerDay: -1, // Unlimited
    hasAdvancedSearch: true,
    hasFileUpload: true,
    hasStockData: true,
    hasWeatherData: true,
    hasPrioritySupport: true,
    hasExportHistory: true,
    responseSpeed: 'priority',
  },
} as const;

// Pricing plans configuration
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: PLAN_IDS.FREE,
    name: 'Free',
    price: 0,
    currency: 'usd',
    interval: 'month',
    stripePriceId: '', // No Stripe price ID for free plan
    features: [
      '10 chat messages per day',
      'Basic search functionality',
      'Standard response speed',
      'Email support'
    ]
  },
  {
    id: PLAN_IDS.PRO,
    name: 'Pro Plan',
    price: 10,
    currency: 'usd',
    interval: 'month',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_1Rn2RyGaIR4CtU5otpjHbeiF',
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

// Plan limits and restrictions
export const PLAN_LIMITS = {
  [PLAN_IDS.FREE]: {
    dailyMessageLimit: 10,
    fileUploadLimit: 0,
    maxFileSize: 0,
  },
  [PLAN_IDS.PRO]: {
    dailyMessageLimit: -1, // Unlimited
    fileUploadLimit: -1, // Unlimited
    maxFileSize: 50 * 1024 * 1024, // 50MB
  },
} as const;

// Default plan for new users
export const DEFAULT_PLAN = PLAN_IDS.FREE;

// Plan upgrade paths
export const UPGRADE_PATHS = {
  [PLAN_IDS.FREE]: [PLAN_IDS.PRO],
  [PLAN_IDS.PRO]: [], // No upgrades available
} as const;
