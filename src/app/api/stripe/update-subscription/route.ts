import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe-server';
import { updateUserSubscription } from '@/utils/auth';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, userId } = await request.json();

    console.log('Update subscription called with:', { sessionId, userId });

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: 'Session ID and User ID are required' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'line_items']
    });

    console.log('Stripe session retrieved:', {
      paymentStatus: session.payment_status,
      subscriptionId: session.subscription,
      metadata: session.metadata,
      lineItems: session.line_items
    });

    if (session.payment_status === 'paid' && session.subscription) {
      const subscription = session.subscription as any;
      
      console.log('Subscription details:', {
        status: subscription.status,
        id: subscription.id,
        currentPeriodEnd: subscription.current_period_end,
        rawSubscription: subscription
      });

      // Determine plan from metadata or line items
      let planName = 'free';
      
      // First try to get plan from planType metadata
      if (session.metadata?.planType) {
        planName = session.metadata.planType;
        console.log('Plan determined from planType metadata:', planName);
      }
      // Then try planName metadata
      else if (session.metadata?.planName) {
        planName = session.metadata.planName.toLowerCase().includes('pro') ? 'pro' : 'free';
        console.log('Plan determined from planName metadata:', planName);
      }
      // Finally try line items description
      else if (session.line_items?.data?.[0]?.description) {
        const description = session.line_items.data[0].description.toLowerCase();
        planName = description.includes('pro') ? 'pro' : 'free';
        console.log('Plan determined from line item description:', planName);
      }
      
      console.log('Final determined plan:', planName);
      
      // Handle currentPeriodEnd - convert to number or use null
      let currentPeriodEnd = null;
      if (subscription.current_period_end) {
        currentPeriodEnd = typeof subscription.current_period_end === 'number' 
          ? subscription.current_period_end 
          : parseInt(subscription.current_period_end.toString());
      }
      
      console.log('Processed currentPeriodEnd:', currentPeriodEnd);
      
      const subscriptionData = {
        isActive: subscription.status === 'active',
        plan: planName as 'free' | 'pro',
        subscriptionId: subscription.id,
        currentPeriodEnd: currentPeriodEnd,
      };

      console.log('Subscription data to save:', subscriptionData);

      // Save subscription to Firestore
      try {
        await updateUserSubscription(userId, subscriptionData);
        console.log('✅ Subscription saved to Firestore successfully for user:', userId);
      } catch (firestoreError: any) {
        console.error('❌ Failed to save subscription to Firestore:', firestoreError);
        console.error('Firestore error details:', {
          code: firestoreError?.code,
          message: firestoreError?.message
        });
        // Continue even if Firestore fails - user still has valid subscription
      }

      return NextResponse.json({
        success: true,
        subscription: subscriptionData,
        session: {
          customerEmail: session.customer_details?.email,
          amountTotal: session.amount_total,
          currency: session.currency,
        }
      });
    }

    console.log('❌ Payment not completed or no subscription found');
    return NextResponse.json(
      { error: 'Payment not completed or no subscription found' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('❌ Update subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}
