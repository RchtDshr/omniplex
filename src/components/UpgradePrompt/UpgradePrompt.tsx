'use client';

import Link from 'next/link';
import { useSubscription } from '@/hooks/useSubscription';
import styles from './UpgradePrompt.module.css';

interface UpgradePromptProps {
  feature: string;
  title?: string;
  description?: string;
  showFeatures?: boolean;
}

export default function UpgradePrompt({ 
  feature, 
  title,
  description,
  showFeatures = true 
}: UpgradePromptProps) {
  const { hasFeatureAccess, isPremium } = useSubscription();

  // Don't show if user has access to the feature
  if (hasFeatureAccess(feature)) {
    return null;
  }

  const defaultTitle = "Unlock Premium Features";
  const defaultDescription = "Upgrade to Pro to access unlimited features and priority support.";

  const features = [
    "Unlimited chat messages",
    "File upload & analysis", 
    "Priority response speed",
    "Export chat history",
    "Advanced search capabilities"
  ];

  return (
    <div className={styles.upgradePrompt}>
      <h3 className={styles.upgradeTitle}>
        {title || defaultTitle}
      </h3>
      
      <p className={styles.upgradeDescription}>
        {description || defaultDescription}
      </p>

      {showFeatures && (
        <ul className={styles.featuresList}>
          {features.slice(0, 3).map((feature, index) => (
            <li key={index} className={styles.featureItem}>
              ✨ {feature}
            </li>
          ))}
        </ul>
      )}

      <div className={styles.upgradeActions}>
        <Link 
          href="/pricing" 
          className={`${styles.upgradeButton} ${styles.primaryButton}`}
        >
          Upgrade to Pro
        </Link>
        <Link 
          href="/pricing" 
          className={styles.upgradeButton}
        >
          View All Plans
        </Link>
      </div>
    </div>
  );
}
