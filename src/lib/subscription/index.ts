/**
 * Subscription Module
 * Centralized subscription management system
 * 
 * This module provides:
 * - Configuration and constants
 * - Service layer for business logic
 * - Utility functions and validators
 * - React hooks for component integration
 */

// Core configuration
export { PLAN_IDS, PLAN_FEATURES, PLAN_LIMITS, PRICING_PLANS } from './config';
export type { PlanId } from './config';

// Service layer
export { SubscriptionService } from './service';

// Utilities
export {
  SUBSCRIPTION_STATUS,
  SubscriptionValidator,
  SubscriptionTransformer,
  UsageTracker,
  FeatureFlags,
  SubscriptionComparator,
} from './utils';
export type { SubscriptionStatus } from './utils';

// React hooks
export {
  useSubscription,
  usePricingPlans,
  useFeatureAccess,
  useUsageLimits,
  useSubscriptionActions,
  useSubscriptionLoading,
} from './hooks';

// Re-export types from utils/types for convenience
export type { PricingPlan } from '../../utils/types';
