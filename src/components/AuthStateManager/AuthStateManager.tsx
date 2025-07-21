'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setAuthState, setUserDetailsState, setSubscriptionState, resetAuth } from '@/store/authSlice';
import { onAuthStateChange, getUserData } from '@/utils/auth';

export default function AuthStateManager({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      if (user) {
        // User is signed in - first set basic auth state
        dispatch(setAuthState(true));
        dispatch(setUserDetailsState({
          uid: user.uid,
          name: user.displayName || '',
          email: user.email || '',
          profilePic: user.photoURL || '',
        }));

        // Wait a bit for auth token to propagate, then try to fetch user data
        setTimeout(async () => {
          try {
            const userData = await getUserData(user.uid);
            
            if (userData && userData.subscription) {
              // Update with Firestore data if available
              dispatch(setUserDetailsState({
                uid: userData.uid,
                name: userData.name,
                email: userData.email,
                profilePic: userData.profilePic,
              }));
              dispatch(setSubscriptionState(userData.subscription));
              console.log('Loaded subscription from Firestore:', userData.subscription);
            } else {
              // Set default subscription if no Firestore data
              const defaultSubscription = {
                isActive: false,
                plan: 'free' as const,
                subscriptionId: null,
                currentPeriodEnd: null,
              };
              dispatch(setSubscriptionState(defaultSubscription));
              console.log('Set default subscription:', defaultSubscription);
            }
          } catch (error) {
            console.error('Error loading user data:', error);
            // Still keep user logged in with default subscription
            const defaultSubscription = {
              isActive: false,
              plan: 'free' as const,
              subscriptionId: null,
              currentPeriodEnd: null,
            };
            dispatch(setSubscriptionState(defaultSubscription));
            console.log('Error occurred, set default subscription');
          }
        }, 1000); // Wait 1 second for auth token to propagate
      } else {
        // User is signed out
        dispatch(resetAuth());
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [dispatch]);

  return <>{children}</>;
}
