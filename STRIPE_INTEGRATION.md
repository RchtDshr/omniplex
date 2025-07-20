# Stripe Integration for Omniplex

This document outlines the Stripe integration implemented in Omniplex for handling payments and subscriptions.

## Overview

The Stripe integration is built with a clean, modular architecture that supports:

- **Test Mode Only**: All payments use Stripe test keys for safe development
- **Multiple Plans**: Free, Pro ($10/month), and Enterprise ($25/month) tiers
- **Subscription Management**: Automatic billing and subscription status tracking
- **Feature Gating**: Different access levels based on subscription tier

## Architecture

### 1. Core Files

#### **Utils**
- `src/utils/stripe.ts` - Client-side Stripe utilities and plan definitions
- `src/utils/stripe-server.ts` - Server-side Stripe SDK configuration
- `src/utils/types.ts` - TypeScript types for Stripe-related data

#### **API Routes**
- `src/app/api/stripe/checkout/route.ts` - Creates Stripe Checkout sessions
- `src/app/api/stripe/webhook/route.ts` - Handles Stripe webhooks
- `src/app/api/stripe/payment-status/route.ts` - Checks payment status

#### **Components**
- `src/components/Pricing/` - Pricing page with plan selection
- `src/components/UpgradeButton/` - Upgrade button in navigation
- `src/components/UpgradePrompt/` - Feature restriction prompts

#### **State Management**
- `src/store/subscriptionSlice.ts` - Redux slice for subscription state
- `src/hooks/useSubscription.ts` - Custom hook for subscription logic

### 2. Pages

- `/pricing` - Main pricing page with plan selection
- `/payment/success` - Payment confirmation page

## Usage

### Testing Payments

1. **Navigate to `/pricing`**
2. **Select a paid plan** (Pro or Enterprise)
3. **Use test card number**: `4242 4242 4242 4242`
4. **Use any valid expiry date, CVC, and postal code**
5. **Complete checkout** to test the full flow

### Integration Examples

#### Check User's Plan Status
```tsx
import { useSubscription } from '@/hooks/useSubscription';

function MyComponent() {
  const { isPremium, getCurrentPlan, hasFeatureAccess } = useSubscription();
  
  if (!hasFeatureAccess('unlimited_chat')) {
    return <UpgradePrompt feature="unlimited_chat" />;
  }
  
  return <div>Premium content here</div>;
}
```

#### Feature Gating
```tsx
import { useSubscription } from '@/hooks/useSubscription';
import UpgradePrompt from '@/components/UpgradePrompt/UpgradePrompt';

function FileUpload() {
  const { hasFeatureAccess } = useSubscription();
  
  if (!hasFeatureAccess('file_upload')) {
    return (
      <UpgradePrompt 
        feature="file_upload"
        title="File Upload - Pro Feature"
        description="Upload and analyze files with Omniplex Pro"
      />
    );
  }
  
  return <FileUploadComponent />;
}
```

## Plan Features

### Free Plan
- 10 chat messages per day
- Basic search functionality
- Standard response speed
- Email support

### Pro Plan ($10/month)
- Unlimited chat messages
- Advanced search & analysis
- Priority response speed
- File upload & analysis
- Stock & weather data
- Priority email support
- Export chat history

### Enterprise Plan ($25/month)
- Everything in Pro
- API access
- Custom integrations
- Dedicated support
- Advanced analytics
- Team collaboration
- Custom branding

## Environment Variables

Add these to your `.env.local`:

```bash
# Stripe Keys (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
```

## Setup Instructions

### 1. Stripe Dashboard Setup

1. **Create a Stripe account** at https://dashboard.stripe.com/register
2. **Enable test mode** in your dashboard
3. **Create products and prices**:
   - Pro Plan: $10/month (set price ID in `stripe.ts`)
   - Enterprise Plan: $25/month (set price ID in `stripe.ts`)

### 2. Webhook Configuration

1. **Add webhook endpoint**: `https://yourdomain.com/api/stripe/webhook`
2. **Select events**:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

### 3. Price IDs

Update the price IDs in `src/utils/stripe.ts`:
```typescript
stripePriceId: 'price_test_pro_monthly', // Replace with actual price ID
```

## Security Notes

- **Test Mode Only**: This implementation uses test keys only
- **Webhook Verification**: All webhooks are verified with signatures
- **Environment Variables**: Sensitive keys are stored in environment variables
- **No Real Charges**: All payments are simulated in test mode

## Next Steps

For production deployment:

1. **Replace test keys** with live Stripe keys
2. **Configure live webhook endpoints**
3. **Set up proper database integration** for subscription tracking
4. **Add email notifications** for subscription events
5. **Implement customer portal** for subscription management

## Test Card Numbers

Use these test card numbers for different scenarios:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Insufficient Funds**: `4000 0000 0000 9995`
- **3D Secure**: `4000 0027 6000 3184`

All test cards accept any valid expiry date, CVC, and postal code.
