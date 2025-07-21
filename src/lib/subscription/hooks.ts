/**
 * Subscription Hooks
 * Custom React hooks for subscription management
 */

import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { SubscriptionService } from './service';
import { SubscriptionValidator, UsageTracker, FeatureFlags } from './utils';
import { PLAN_IDS } from './config';

/**
 * Hook to get current subscription information
 */
export const useSubscription = () => {
  const authState = useSelector((state: RootState) => state.auth.authState);
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);
  const subscription = useSelector((state: RootState) => state.auth.subscription);
  
  const subscriptionInfo = useMemo(() => {
    if (!authState) {
      return {
        planId: PLAN_IDS.FREE,
        isActive: false,
        isPro: false,
        isFree: true,
      };
    }

    // Map the old plan names to new ones, removing enterprise
    const planMapping = {
      'free': PLAN_IDS.FREE,
      'pro': PLAN_IDS.PRO,
      'enterprise': PLAN_IDS.PRO, // Map enterprise to pro since we're removing it
    };

    const planId = planMapping[subscription.plan] || PLAN_IDS.FREE;
    const isActive = subscription.isActive;

    return {
      planId,
      isActive,
      isPro: planId === PLAN_IDS.PRO && isActive,
      isFree: planId === PLAN_IDS.FREE || !isActive,
      subscriptionId: subscription.subscriptionId,
      currentPeriodEnd: subscription.currentPeriodEnd,
    };
  }, [authState, subscription]);

  return subscriptionInfo;
};

/**
 * Hook to get available pricing plans
 */
export const usePricingPlans = () => {
  const { planId: currentPlan } = useSubscription();
  const authState = useSelector((state: RootState) => state.auth.authState);

  const plans = useMemo(() => {
    return SubscriptionService.getVisiblePlans(currentPlan, authState);
  }, [currentPlan, authState]);

  const getButtonText = useCallback((planId: string) => {
    return SubscriptionService.getButtonText(planId, currentPlan, authState);
  }, [currentPlan, authState]);

  const isPlanDisabled = useCallback((planId: string, isLoading: boolean = false) => {
    return SubscriptionService.isPlanButtonDisabled(planId, currentPlan, authState, isLoading);
  }, [currentPlan, authState]);

  return {
    plans,
    getButtonText,
    isPlanDisabled,
  };
};

/**
 * Hook to check feature access
 */
export const useFeatureAccess = () => {
  const { planId, isActive } = useSubscription();

  const hasFeature = useCallback((feature: string): boolean => {
    if (!isActive) return false;
    return FeatureFlags.isEnabled(planId, feature);
  }, [planId, isActive]);

  const features = useMemo(() => {
    return FeatureFlags.getConfig(planId);
  }, [planId]);

  return {
    hasFeature,
    features,
    canUploadFiles: hasFeature('fileUpload'),
    canAccessPriority: hasFeature('prioritySupport'),
    canAccessAdvanced: hasFeature('advancedFeatures'),
    hasUnlimitedAccess: planId === PLAN_IDS.PRO && isActive,
  };
};

/**
 * Hook to track and check usage limits
 */
export const useUsageLimits = () => {
  const { planId, isActive } = useSubscription();
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);

  const canPerformAction = useCallback((action: 'sendMessage' | 'uploadFile', currentUsage: number = 0): boolean => {
    if (!isActive) return false;
    return SubscriptionService.canPerformAction(planId, action, currentUsage);
  }, [planId, isActive]);

  const usage = useMemo(() => {
    // For now, we'll use mock usage data since it's not in the auth state
    // This can be extended to track real usage in the future
    const dailyMessages = 0;
    const filesUploaded = 0;

    return {
      dailyMessages,
      filesUploaded,
      canSendMessage: canPerformAction('sendMessage', dailyMessages),
      canUploadFile: canPerformAction('uploadFile', filesUploaded),
    };
  }, [canPerformAction]);

  const getUsagePercentage = useCallback((type: 'messages' | 'files'): number => {
    if (planId === PLAN_IDS.PRO) return 0; // Unlimited

    const limits = {
      messages: 100, // Daily limit for free plan
      files: 10,     // Daily limit for free plan
    };

    const current = type === 'messages' ? usage.dailyMessages : usage.filesUploaded;
    return UsageTracker.calculateUsagePercentage(current, limits[type]);
  }, [planId, usage]);

  return {
    ...usage,
    getUsagePercentage,
    isUnlimited: planId === PLAN_IDS.PRO && isActive,
  };
};

/**
 * Hook for subscription actions
 */
export const useSubscriptionActions = () => {
  const { planId: currentPlan } = useSubscription();

  const getUpgradePath = useCallback(() => {
    return SubscriptionService.getUpgradePath(currentPlan);
  }, [currentPlan]);

  const requiresPayment = useCallback((planId: string): boolean => {
    return SubscriptionService.requiresPayment(planId);
  }, []);

  const formatPrice = useCallback((price: number, currency?: string): string => {
    return SubscriptionService.formatPrice(price, currency);
  }, []);

  return {
    getUpgradePath,
    requiresPayment,
    formatPrice,
    canUpgrade: currentPlan === PLAN_IDS.FREE,
    isProUser: currentPlan === PLAN_IDS.PRO,
  };
};

/**
 * Hook for subscription loading states
 */
export const useSubscriptionLoading = () => {
  // Since there's no loading state in the auth slice, we'll use a simple implementation
  // This can be extended when proper loading states are added
  return {
    isLoading: false,
    isAuthLoading: false,
  };
};
