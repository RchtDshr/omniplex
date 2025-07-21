/**
 * Subscription Service
 * Core business logic for subscription management
 */

import { PLAN_IDS, PLAN_FEATURES, PLAN_LIMITS, PRICING_PLANS, type PlanId } from './config';
import type { PricingPlan } from '../../utils/types';

export class SubscriptionService {
  /**
   * Get all available pricing plans
   */
  static getPlans(): PricingPlan[] {
    return PRICING_PLANS;
  }

  /**
   * Get a specific plan by ID
   */
  static getPlanById(planId: string): PricingPlan | null {
    return PRICING_PLANS.find(plan => plan.id === planId) || null;
  }

  /**
   * Check if a plan ID is valid
   */
  static isValidPlan(planId: string): planId is PlanId {
    return Object.values(PLAN_IDS).includes(planId as PlanId);
  }

  /**
   * Get plans visible to user based on their current subscription
   */
  static getVisiblePlans(currentPlan?: string, isLoggedIn: boolean = false): PricingPlan[] {
    if (!isLoggedIn) {
      return PRICING_PLANS; // Show all plans for non-logged-in users
    }

    if (currentPlan === PLAN_IDS.PRO) {
      // Pro users only see their current plan
      return PRICING_PLANS.filter(plan => plan.id === PLAN_IDS.PRO);
    }

    // Free users see all plans
    return PRICING_PLANS;
  }

  /**
   * Check if user has access to a specific feature
   */
  static hasFeatureAccess(userPlan: string, feature: keyof typeof PLAN_FEATURES[typeof PLAN_IDS.FREE]): boolean {
    if (!this.isValidPlan(userPlan)) {
      return false;
    }

    return PLAN_FEATURES[userPlan as PlanId][feature] as boolean;
  }

  /**
   * Check if user can perform an action based on limits
   */
  static canPerformAction(userPlan: string, action: 'sendMessage' | 'uploadFile', currentUsage: number = 0): boolean {
    if (!this.isValidPlan(userPlan)) {
      return false;
    }

    const limits = PLAN_LIMITS[userPlan as PlanId];

    switch (action) {
      case 'sendMessage':
        return limits.dailyMessageLimit === -1 || currentUsage < limits.dailyMessageLimit;
      case 'uploadFile':
        return limits.fileUploadLimit === -1 || currentUsage < limits.fileUploadLimit;
      default:
        return false;
    }
  }

  /**
   * Get the display text for a plan button
   */
  static getButtonText(planId: string, currentPlan?: string, isLoggedIn: boolean = false): string {
    if (!isLoggedIn && planId !== PLAN_IDS.FREE) {
      return 'Sign in to Upgrade';
    }

    if (planId === PLAN_IDS.FREE) {
      return isLoggedIn ? 'Current Plan' : 'Get Started';
    }

    if (currentPlan === planId) {
      return 'Current Plan';
    }

    if (planId === PLAN_IDS.PRO) {
      return 'Upgrade to Pro';
    }

    return 'Upgrade';
  }

  /**
   * Check if a plan button should be disabled
   */
  static isPlanButtonDisabled(planId: string, currentPlan?: string, isLoggedIn: boolean = false, isLoading: boolean = false): boolean {
    if (!isLoggedIn) {
      return false; // Allow clicking to trigger sign-in
    }

    return currentPlan === planId || isLoading;
  }

  /**
   * Format price for display
   */
  static formatPrice(price: number, currency: string = 'usd'): string {
    if (price === 0) return 'Free';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
    }).format(price);
  }

  /**
   * Get upgrade path for a plan
   */
  static getUpgradePath(currentPlan: string): string[] {
    if (!this.isValidPlan(currentPlan)) {
      return [];
    }

    if (currentPlan === PLAN_IDS.FREE) {
      return [PLAN_IDS.PRO];
    }

    return []; // No upgrades available for Pro plan
  }

  /**
   * Check if plan requires payment
   */
  static requiresPayment(planId: string): boolean {
    const plan = this.getPlanById(planId);
    return plan ? plan.price > 0 : false;
  }
}
