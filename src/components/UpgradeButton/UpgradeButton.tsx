'use client';

import Link from 'next/link';
import { useSubscription } from '@/hooks/useSubscription';
import styles from './UpgradeButton.module.css';

// You can use any icon - I'll use a simple crown icon placeholder
const CrownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 16L3 3l5.5 5L12 4l3.5 4L21 3l-2 13H5zm2.7-2h8.6l.9-5.4-2.1 1.4L12 8l-3.1 2L6.8 8.6L7.7 14z"/>
  </svg>
);

interface UpgradeButtonProps {
  isSidebarOpen?: boolean;
}

export default function UpgradeButton({ isSidebarOpen = false }: UpgradeButtonProps) {
  const { isPremium, getCurrentPlan } = useSubscription();
  
  const buttonText = isPremium ? getCurrentPlan().toUpperCase() : 'Upgrade';
  const buttonStyle = isPremium 
    ? { ...baseButtonStyle, background: '#10b981' }
    : { ...baseButtonStyle };

  return (
    <Link 
      href="/pricing" 
      className={styles.upgradeButton}
      style={{ 
        opacity: isSidebarOpen ? 0 : 1,
        ...buttonStyle
      }}
    >
      <CrownIcon />
      <p className={styles.upgradeButtonText}>{buttonText}</p>
    </Link>
  );
}

const baseButtonStyle = {
  // This will be merged with the CSS module styles
};
