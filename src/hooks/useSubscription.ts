/**
 * @deprecated This hook is deprecated. Please use the new modular subscription hooks instead.
 * Import from '@/lib/subscription' instead:
 * - useSubscription
 * - usePricingPlans 
 * - useFeatureAccess
 * - useUsageLimits
 * - useSubscriptionActions
 */

// Re-export the new hooks for backwards compatibility
export {
  useSubscription,
  usePricingPlans,
  useFeatureAccess,
  useUsageLimits,
  useSubscriptionActions,
  useSubscriptionLoading,
} from '@/lib/subscription';
