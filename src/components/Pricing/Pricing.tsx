'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDisclosure } from '@nextui-org/modal';
import { getStripe } from '@/utils/stripe';
import { useSubscription, usePricingPlans, useSubscriptionActions } from '@/lib/subscription';
import { selectAuthState, selectUserDetailsState } from '@/store/authSlice';
import { useSelector } from 'react-redux';
import Auth from '../Auth/Auth';
import styles from './Pricing.module.css';

interface PricingProps {
  currentPlan?: string;
  userId?: string;
}

export default function Pricing({ currentPlan, userId }: PricingProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [showCancelMessage, setShowCancelMessage] = useState(false);
  const [serverSubscription, setServerSubscription] = useState(null);
  const searchParams = useSearchParams();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Use modular subscription hooks
  const subscription = useSubscription();
  const { plans, getButtonText, isPlanDisabled } = usePricingPlans();
  const { formatPrice } = useSubscriptionActions();
  
  // Get auth state from Redux
  const isLoggedIn = useSelector(selectAuthState);
  const userDetails = useSelector(selectUserDetailsState);

  useEffect(() => {
    // Check if user was redirected back from cancelled checkout
    if (searchParams.get('cancelled') === 'true') {
      setShowCancelMessage(true);
      // Hide the message after 5 seconds
      setTimeout(() => setShowCancelMessage(false), 5000);
    }
  }, [searchParams]);

  // Check subscription status from server when user is logged in
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (isLoggedIn && userDetails.uid) {
        try {
          const response = await fetch(`/api/stripe/check-subscription?userId=${userDetails.uid}`);
          if (response.ok) {
            const data = await response.json();
            setServerSubscription(data.subscription);
          }
        } catch (error) {
          console.error('Failed to check subscription status:', error);
        }
      }
    };

    checkSubscriptionStatus();
  }, [isLoggedIn, userDetails.uid]);

  const handleSubscribe = async (priceId: string, planId: string) => {
    if (planId === 'free') return;
    
    // Open auth modal if user is not logged in
    if (!isLoggedIn) {
      onOpen();
      return;
    }

    // Check current subscription status
    const currentSubscription = serverSubscription || subscription;
    
    // Prevent multiple subscriptions for the same plan
    if (currentSubscription?.isActive && currentSubscription?.planId === planId) {
      alert('You are already subscribed to this plan!');
      return;
    }
    
    // Prevent downgrading (optional)
    if (currentSubscription?.isActive && currentSubscription?.planId === 'pro' && planId === 'free') {
      alert('Please cancel your current subscription first.');
      return;
    }
    
    setLoading(planId);
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          planId,
          userId: userDetails.uid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const { sessionId, url } = data;

      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else if (sessionId) {
        // Use Stripe.js for embedded checkout (alternative approach)
        const stripe = await getStripe();
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({
            sessionId,
          });
          
          if (error) {
            console.error('Stripe error:', error);
            // Redirect to failure page
            window.location.href = `/payment/failed?error=${encodeURIComponent(error.message || 'Payment failed')}`;
          }
        }
      } else {
        throw new Error('No checkout URL or session ID received');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      // Redirect to failure page with error message
      const errorMessage = error instanceof Error ? error.message : 'Payment failed. Please try again.';
      window.location.href = `/payment/failed?error=${encodeURIComponent(errorMessage)}`;
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          Choose Your <span className={styles.highlight}>Plan</span>
        </h1>
        <p className={styles.subtitle}>
          Unlock the full potential of Omniplex with our flexible pricing plans. 
          Start free and upgrade as you grow.
        </p>
      </div>

      {/* Login Required Message */}
      {!isLoggedIn && (
        <button 
          className={styles.loginMessage}
          onClick={onOpen}
          style={{ cursor: 'pointer', border: 'none' }}
        >
          🔐 Sign in with Google to upgrade your plan
        </button>
      )}

      {/* Cancellation Message */}
      {showCancelMessage && (
        <div className={styles.loginMessage}>
          ℹ️ Payment was cancelled. You can try again anytime!
        </div>
      )}

      {/* Pricing Cards */}
      <div className={styles.pricingWrapper}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`${styles.card} ${plan.popular ? styles.popular : ''}`}
          >
            {plan.popular && (
              <div className={styles.badge}>Most Popular</div>
            )}
            
            <div className={styles.cardHeader}>
              <h3 className={styles.planName}>{plan.name}</h3>
              <div className={styles.price}>
                <span className={styles.amount}>
                  {formatPrice(plan.price)}
                </span>
                {plan.price > 0 && (
                  <span className={styles.interval}>/{plan.interval}</span>
                )}
              </div>
            </div>

            <ul className={styles.features}>
              {plan.features.map((feature, index) => (
                <li key={index} className={styles.feature}>
                  <span className={styles.checkmark}>✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              className={`${styles.button} ${
                plan.popular 
                  ? styles.primaryButton
                  : styles.secondaryButton
              }`}
              onClick={() => handleSubscribe(plan.stripePriceId, plan.id)}
              disabled={isPlanDisabled(plan.id, loading !== null)}
            >
              {loading === plan.id ? (
                <span className={styles.spinner}></span>
              ) : (
                getButtonText(plan.id)
              )}
            </button>
          </div>
        ))}
      </div>

      
      {/* Auth Modal */}
      <Auth isOpen={isOpen} onClose={onClose} />
    </div>
  );
}
