'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function PaymentFailedPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'Payment was cancelled or failed';

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.errorIcon}>❌</div>
        <h1 style={styles.title}>Payment Failed</h1>
        <p style={styles.description}>
          {error}
        </p>

        <div style={styles.details}>
          <h3 style={styles.detailsTitle}>What happened?</h3>
          <ul style={styles.errorList}>
            <li>Your payment was declined or cancelled</li>
            <li>No charges were made to your account</li>
            <li>You can try again with a different payment method</li>
          </ul>
        </div>

        <div style={styles.actions}>
          <Link href="/pricing" style={styles.button}>
            Try Again
          </Link>
          <Link href="/" style={styles.secondaryButton}>
            Return Home
          </Link>
        </div>

        <div style={styles.testNotice}>
          <p>
            <strong>💡 Using test mode?</strong> Make sure you're using the test card number: <code>4242 4242 4242 4242</code>
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
  errorIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#dc2626',
    marginBottom: '1rem',
  },
  description: {
    fontSize: '1.125rem',
    color: '#6b7280',
    marginBottom: '2rem',
    lineHeight: '1.6',
  },
  details: {
    backgroundColor: '#fef2f2',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    marginBottom: '2rem',
    textAlign: 'left' as const,
  },
  detailsTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: '1rem',
  },
  errorList: {
    listStyle: 'none',
    padding: '0',
    margin: '0',
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
    backgroundColor: '#dc2626',
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
    color: '#dc2626',
    border: '2px solid #dc2626',
    padding: '0.875rem 1.5rem',
    borderRadius: '0.5rem',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  },
  testNotice: {
    backgroundColor: '#fffbeb',
    border: '1px solid #f59e0b',
    borderRadius: '0.5rem',
    padding: '1rem',
    color: '#92400e',
    fontSize: '0.875rem',
  },
};
