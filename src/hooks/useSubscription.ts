import { useSelector } from 'react-redux';
import { selectAuthState, selectSubscriptionState } from '@/store/authSlice';

export const useSubscription = () => {
  const isLoggedIn = useSelector(selectAuthState);
  const subscription = useSelector(selectSubscriptionState);

  // Provide default values if subscription is undefined
  const safeSubscription = subscription || {
    isActive: false,
    plan: 'free' as const,
    subscriptionId: null,
    currentPeriodEnd: null,
  };

  const isPro = safeSubscription.isActive && safeSubscription.plan === 'pro';
  const isEnterprise = safeSubscription.isActive && safeSubscription.plan === 'enterprise';
  const isPremium = isPro || isEnterprise;

  const hasFeatureAccess = (feature: string): boolean => {
    if (!isLoggedIn) return false;

    // Free tier restrictions
    if (!isPremium) {
      const restrictedFeatures = [
        'unlimited_chat',
        'file_upload',
        'priority_support',
        'export_history',
        'advanced_search'
      ];
      return !restrictedFeatures.includes(feature);
    }

    // Enterprise exclusive features
    if (feature === 'api_access' || feature === 'custom_branding') {
      return isEnterprise;
    }

    return true;
  };

  const getCurrentPlan = (): string => {
    if (!isLoggedIn) return 'free';
    return safeSubscription.plan;
  };

  return {
    subscription: safeSubscription,
    isPro,
    isEnterprise,
    isPremium,
    isLoggedIn,
    hasFeatureAccess,
    getCurrentPlan,
  };
};
