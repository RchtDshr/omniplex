'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface PaymentData {
  status: string;
  customerEmail: string;
  amountTotal: number;
  currency: string;
  subscriptionId: string;
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const planName = searchParams.get('plan') || 'Pro';
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Add CSS for spinner animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    if (sessionId) {
      fetchPaymentStatus();
    } else {
      setError('No session ID found');
      setLoading(false);
    }

    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, [sessionId]);

  const fetchPaymentStatus = async () => {
    try {
      const response = await fetch(`/api/stripe/payment-status?session_id=${sessionId}`);
      const data = await response.json();
      
      if (response.ok) {
        setPaymentData(data);
      } else {
        setError(data.error || 'Failed to fetch payment status');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.spinner}></div>
          <h1 style={styles.title}>Processing...</h1>
          <p style={styles.description}>Please wait while we confirm your payment.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.errorIcon}>❌</div>
          <h1 style={styles.title}>Payment Verification Failed</h1>
          <p style={styles.description}>{error}</p>
          <Link href="/pricing" style={styles.button}>
            Return to Pricing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.successIcon}>🎉</div>
        <h1 style={styles.title}>Payment Successful!</h1>
        <p style={styles.description}>
          Welcome to Omniplex {planName}! Your subscription is now active and you have access to all premium features.
        </p>

        {paymentData && (
          <div style={styles.details}>
            <div style={styles.detailItem}>
              <span style={styles.label}>Email:</span>
              <span>{paymentData.customerEmail}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.label}>Amount:</span>
              <span>
                ${((paymentData.amountTotal || 0) / 100).toFixed(2)} {paymentData.currency?.toUpperCase()}
              </span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.label}>Status:</span>
              <span style={styles.statusBadge}>{paymentData.status}</span>
            </div>
          </div>
        )}

        <div style={styles.actions}>
          <Link href="/" style={styles.button}>
            Start Using Omniplex
          </Link>
          <Link href="/pricing" style={styles.secondaryButton}>
            View Plans
          </Link>
        </div>

        <div style={styles.testNotice}>
          <p>
            <strong>🧪 Test Mode:</strong> This was a test payment. No real money was charged.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    padding: '1rem',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    padding: '3rem 2rem',
    textAlign: 'center' as const,
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  successIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  errorIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  spinner: {
    width: '3rem',
    height: '3rem',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 1rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '1rem',
  },
  description: {
    fontSize: '1.125rem',
    color: '#6b7280',
    marginBottom: '2rem',
    lineHeight: '1.6',
  },
  details: {
    backgroundColor: '#f9fafb',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    marginBottom: '2rem',
    textAlign: 'left' as const,
  },
  detailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  label: {
    fontWeight: '600',
    color: '#374151',
  },
  statusBadge: {
    backgroundColor: '#10b981',
    color: 'white',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: '600',
    textTransform: 'capitalize' as const,
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
    marginBottom: '2rem',
  },
  button: {
    display: 'inline-block',
    backgroundColor: '#667eea',
    color: 'white',
    padding: '0.875rem 1.5rem',
    borderRadius: '0.5rem',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  },
  secondaryButton: {
    display: 'inline-block',
    backgroundColor: 'transparent',
    color: '#667eea',
    border: '2px solid #667eea',
    padding: '0.875rem 1.5rem',
    borderRadius: '0.5rem',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  },
  testNotice: {
    backgroundColor: '#fef3c7',
    border: '1px solid #f59e0b',
    borderRadius: '0.5rem',
    padding: '1rem',
    color: '#92400e',
    fontSize: '0.875rem',
  },
};
