# Subscription Module Documentation

## Overview

The subscription module provides a centralized, modular system for managing user subscriptions in the Omniplex application. It follows industry-standard patterns and provides clean separation of concerns.

## Architecture

```
src/lib/subscription/
├── config.ts      # Configuration constants and plan definitions
├── service.ts     # Core business logic service layer
├── utils.ts       # Utility functions and validators
├── hooks.ts       # React hooks for component integration
└── index.ts       # Main module exports
```

## Available Plans

- **Free Plan**: Basic functionality with daily limits
- **Pro Plan**: $10/month - Unlimited access to all features

*Note: Enterprise plan has been removed from the system.*

## Usage

### Basic Subscription Information

```tsx
import { useSubscription } from '@/lib/subscription';

function MyComponent() {
  const { planId, isActive, isPro, isFree } = useSubscription();
  
  return (
    <div>
      <p>Current Plan: {planId}</p>
      <p>Is Active: {isActive ? 'Yes' : 'No'}</p>
      <p>Is Pro: {isPro ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

### Pricing Plans Display

```tsx
import { usePricingPlans } from '@/lib/subscription';

function PricingComponent() {
  const { plans, getButtonText, isPlanDisabled } = usePricingPlans();
  
  return (
    <div>
      {plans.map(plan => (
        <div key={plan.id}>
          <h3>{plan.name}</h3>
          <p>${plan.price}/{plan.interval}</p>
          <button 
            disabled={isPlanDisabled(plan.id)}
            onClick={() => handleUpgrade(plan.id)}
          >
            {getButtonText(plan.id)}
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Feature Access Control

```tsx
import { useFeatureAccess } from '@/lib/subscription';

function FeatureComponent() {
  const { hasFeature, canUploadFiles, hasUnlimitedAccess } = useFeatureAccess();
  
  if (!canUploadFiles) {
    return <UpgradePrompt feature="file upload" />;
  }
  
  return <FileUploadComponent />;
}
```

### Usage Limits

```tsx
import { useUsageLimits } from '@/lib/subscription';

function ChatComponent() {
  const { canSendMessage, getUsagePercentage, isUnlimited } = useUsageLimits();
  
  if (!canSendMessage && !isUnlimited) {
    return <UpgradePrompt feature="unlimited messages" />;
  }
  
  return <ChatInterface />;
}
```

## Migration from Old System

The old `useSubscription` hook from `@/hooks/useSubscription` is deprecated but still works for backwards compatibility. Update your imports:

```tsx
// Old (deprecated)
import { useSubscription } from '@/hooks/useSubscription';

// New (recommended)
import { useSubscription } from '@/lib/subscription';
```

## Configuration

### Plan Configuration

Edit `src/lib/subscription/config.ts` to modify:
- Plan IDs and pricing
- Feature access rules
- Usage limits
- Plan metadata

### Business Logic

Edit `src/lib/subscription/service.ts` to modify:
- Plan filtering logic
- Button text generation
- Subscription validation
- Feature access rules

## Key Features

1. **Type Safety**: Full TypeScript support with proper types
2. **Modular Design**: Clean separation of concerns
3. **Backwards Compatible**: Old hooks still work during migration
4. **Extensible**: Easy to add new features and plans
5. **Testable**: Pure functions and isolated logic
6. **Performance**: Optimized with useMemo and useCallback

## Best Practices

1. Use the specific hook for your needs (don't import everything)
2. Implement loading states for subscription operations
3. Handle edge cases (logged out users, failed subscriptions)
4. Use feature flags instead of plan checks where possible
5. Cache subscription data to reduce API calls

## Support

For questions about the subscription system, refer to:
- Service layer methods in `service.ts`
- Utility functions in `utils.ts`
- Hook documentation in `hooks.ts`
