import { useSelector } from 'react-redux';
import { selectSubscription } from '@/store/subscriptionSlice';
import { selectAuthState } from '@/store/authSlice';

export const useSubscription = () => {
  const subscription = useSelector(selectSubscription);
  const isLoggedIn = useSelector(selectAuthState);

  const isPro = subscription?.status === 'active' && subscription?.planName === 'Pro';
  const isEnterprise = subscription?.status === 'active' && subscription?.planName === 'Enterprise';
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
    if (isEnterprise) return 'enterprise';
    if (isPro) return 'pro';
    return 'free';
  };

  return {
    subscription,
    isPro,
    isEnterprise,
    isPremium,
    isLoggedIn,
    hasFeatureAccess,
    getCurrentPlan,
  };
};
