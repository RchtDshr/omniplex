/**
 * Subscription Utilities
 * Helper functions and validation utilities for subscription management
 */

import { PLAN_IDS, type PlanId } from './config';
import { SubscriptionService } from './service';

/**
 * Subscription status constants
 */
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  PENDING: 'pending',
  EXPIRED: 'expired',
} as const;

export type SubscriptionStatus = typeof SUBSCRIPTION_STATUS[keyof typeof SUBSCRIPTION_STATUS];

/**
 * Subscription validation utilities
 */
export const SubscriptionValidator = {
  /**
   * Validate subscription data structure
   */
  isValidSubscription(subscription: any): boolean {
    if (!subscription || typeof subscription !== 'object') {
      return false;
    }

    const required = ['id', 'userId', 'planId', 'status'];
    return required.every(field => field in subscription);
  },

  /**
   * Check if subscription is active
   */
  isActiveSubscription(subscription: any): boolean {
    if (!this.isValidSubscription(subscription)) {
      return false;
    }

    return subscription.status === SUBSCRIPTION_STATUS.ACTIVE;
  },

  /**
   * Check if subscription has expired
   */
  hasExpired(subscription: any): boolean {
    if (!this.isValidSubscription(subscription)) {
      return true;
    }

    if (subscription.expiresAt) {
      return new Date(subscription.expiresAt) < new Date();
    }

    return false;
  },
};

/**
 * Subscription transformation utilities
 */
export const SubscriptionTransformer = {
  /**
   * Transform Stripe subscription to internal format
   */
  fromStripe(stripeSubscription: any): any {
    return {
      id: stripeSubscription.id,
      userId: stripeSubscription.metadata?.userId,
      planId: stripeSubscription.items?.data[0]?.price?.metadata?.planId || PLAN_IDS.FREE,
      status: this.mapStripeStatus(stripeSubscription.status),
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      createdAt: new Date(stripeSubscription.created * 1000),
      updatedAt: new Date(),
    };
  },

  /**
   * Map Stripe status to internal status
   */
  mapStripeStatus(stripeStatus: string): SubscriptionStatus {
    const statusMap: Record<string, SubscriptionStatus> = {
      'active': SUBSCRIPTION_STATUS.ACTIVE,
      'canceled': SUBSCRIPTION_STATUS.CANCELLED,
      'incomplete': SUBSCRIPTION_STATUS.PENDING,
      'incomplete_expired': SUBSCRIPTION_STATUS.EXPIRED,
      'past_due': SUBSCRIPTION_STATUS.EXPIRED,
      'unpaid': SUBSCRIPTION_STATUS.EXPIRED,
      'trialing': SUBSCRIPTION_STATUS.ACTIVE,
    };

    return statusMap[stripeStatus] || SUBSCRIPTION_STATUS.EXPIRED;
  },

  /**
   * Transform Firebase user data to subscription format
   */
  fromFirebaseUser(userData: any): any {
    return {
      planId: userData.plan || PLAN_IDS.FREE,
      status: userData.subscriptionStatus || SUBSCRIPTION_STATUS.ACTIVE,
      subscriptionId: userData.subscriptionId || null,
      expiresAt: userData.expiresAt || null,
    };
  },
};

/**
 * Usage tracking utilities
 */
export const UsageTracker = {
  /**
   * Get current usage key for a user and action
   */
  getUserUsageKey(userId: string, action: string, date: Date = new Date()): string {
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    return `usage_${userId}_${action}_${dateStr}`;
  },

  /**
   * Check if usage tracking is enabled for a plan
   */
  isTrackingEnabled(planId: string): boolean {
    return SubscriptionService.isValidPlan(planId) && planId !== PLAN_IDS.PRO;
  },

  /**
   * Calculate usage percentage
   */
  calculateUsagePercentage(current: number, limit: number): number {
    if (limit === -1) return 0; // Unlimited
    if (limit === 0) return 100;
    return Math.min((current / limit) * 100, 100);
  },

  /**
   * Get usage warning level
   */
  getUsageWarningLevel(percentage: number): 'low' | 'medium' | 'high' | 'critical' {
    if (percentage >= 100) return 'critical';
    if (percentage >= 90) return 'high';
    if (percentage >= 75) return 'medium';
    return 'low';
  },
};

/**
 * Feature flag utilities
 */
export const FeatureFlags = {
  /**
   * Check if feature is enabled for user's plan
   */
  isEnabled(planId: string, feature: string): boolean {
    return SubscriptionService.hasFeatureAccess(planId, feature as any);
  },

  /**
   * Get feature configuration for plan
   */
  getConfig(planId: string): Record<string, any> {
    if (!SubscriptionService.isValidPlan(planId)) {
      return {};
    }

    // Return flattened feature configuration
    return Object.entries(PLAN_IDS).reduce((acc, [key, id]) => {
      if (id === planId) {
        return SubscriptionService.hasFeatureAccess(planId, key.toLowerCase() as any) ? { [key.toLowerCase()]: true } : acc;
      }
      return acc;
    }, {});
  },
};

/**
 * Subscription comparison utilities
 */
export const SubscriptionComparator = {
  /**
   * Compare two plans and return upgrade/downgrade status
   */
  comparePlans(currentPlan: string, targetPlan: string): 'upgrade' | 'downgrade' | 'same' {
    const planHierarchy = {
      [PLAN_IDS.FREE]: 0,
      [PLAN_IDS.PRO]: 1,
    };

    const currentLevel = planHierarchy[currentPlan as PlanId] ?? -1;
    const targetLevel = planHierarchy[targetPlan as PlanId] ?? -1;

    if (currentLevel === targetLevel) return 'same';
    return targetLevel > currentLevel ? 'upgrade' : 'downgrade';
  },

  /**
   * Get plan upgrade recommendations
   */
  getUpgradeRecommendations(currentPlan: string, usage: Record<string, number> = {}): string[] {
    const recommendations: string[] = [];

    if (currentPlan === PLAN_IDS.FREE) {
      // Check if user is hitting limits
      const messageUsage = usage.messages || 0;
      const fileUsage = usage.files || 0;

      if (messageUsage > 50 || fileUsage > 5) {
        recommendations.push('Consider upgrading to Pro for unlimited access');
      }
    }

    return recommendations;
  },
};
