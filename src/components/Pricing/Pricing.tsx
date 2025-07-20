'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getStripe, pricingPlans, formatPrice } from '@/utils/stripe';
import styles from './Pricing.module.css';

interface PricingProps {
  currentPlan?: string;
  userId?: string;
}

export default function Pricing({ currentPlan = 'free', userId }: PricingProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [showCancelMessage, setShowCancelMessage] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if user was redirected back from cancelled checkout
    if (searchParams.get('cancelled') === 'true') {
      setShowCancelMessage(true);
      // Hide the message after 5 seconds
      setTimeout(() => setShowCancelMessage(false), 5000);
    }
  }, [searchParams]);

  const handleSubscribe = async (priceId: string, planId: string) => {
    if (planId === 'free') return;
    
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
          userId,
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

  const getButtonText = (planId: string) => {
    if (planId === 'free') return 'Current Plan';
    if (currentPlan === planId) return 'Current Plan';
    if (planId === 'pro') return 'Upgrade to Pro';
    return 'Upgrade to Enterprise';
  };

  const isCurrentPlan = (planId: string) => currentPlan === planId;
  const isDisabled = (planId: string) => isCurrentPlan(planId) || loading !== null;

  return (
    <div className={styles.pricingContainer}>
      {/* Cancellation Message */}
      {showCancelMessage && (
        <div style={cancelMessageStyles}>
          <span style={{ marginRight: '0.5rem' }}>ℹ️</span>
          Payment was cancelled. You can try again anytime!
        </div>
      )}

      <div className={styles.pricingHeader}>
        <h1 className={styles.pricingTitle}>Choose Your Plan</h1>
        <p className={styles.pricingSubtitle}>
          Unlock the full potential of Omniplex with our flexible pricing plans. 
          Start free and upgrade as you grow.
        </p>
      </div>

      <div className={styles.pricingGrid}>
        {pricingPlans.map((plan) => (
          <div
            key={plan.id}
            className={`${styles.pricingCard} ${
              plan.popular ? styles.popular : ''
            }`}
          >
            <div className={styles.planName}>{plan.name}</div>
            <div className={styles.planPrice}>
              <span className={styles.priceAmount}>
                {plan.price === 0 ? 'Free' : formatPrice(plan.price)}
              </span>
              {plan.price > 0 && (
                <>
                  <span className={styles.priceCurrency}></span>
                  <span className={styles.priceInterval}>/{plan.interval}</span>
                </>
              )}
            </div>

            <ul className={styles.featuresList}>
              {plan.features.map((feature, index) => (
                <li key={index} className={styles.featureItem}>
                  
                  {feature}
                </li>
              ))}
            </ul>

            <button
              className={`${styles.ctaButton} ${
                plan.popular || plan.id === 'enterprise'
                  ? styles.primary
                  : styles.secondary
              }`}
              onClick={() => handleSubscribe(plan.stripePriceId, plan.id)}
              disabled={isDisabled(plan.id)}
            >
              {loading === plan.id ? 'Processing...' : getButtonText(plan.id)}
            </button>
          </div>
        ))}
      </div>

      {/* Test Card Information */}
      <div className={styles.testCardInfo}>
        <h3 className={styles.testCardTitle}>
          🧪 Test Mode - Use Test Card Number
        </h3>
        <div className={styles.testCardNumber}>
          4242 4242 4242 4242
        </div>
        <p style={{ margin: '0.5rem 0 0 0', color: '#92400e', fontSize: '0.875rem' }}>
          Use any valid expiry date, CVC, and postal code for testing.
        </p>
      </div>
    </div>
  );
}

// Styles for cancel message
const cancelMessageStyles = {
  background: '#e0f2fe',
  border: '1px solid #0284c7',
  borderRadius: '8px',
  padding: '1rem',
  marginBottom: '2rem',
  color: '#0369a1',
  textAlign: 'center' as const,
  fontSize: '0.95rem',
  fontWeight: '500',
};
