import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../../firebaseConfig';

export interface UserData {
  uid: string;
  name: string;
  email: string;
  profilePic: string;
  subscription: {
    isActive: boolean;
    plan: 'free' | 'pro';
    subscriptionId: string | null;
    currentPeriodEnd: number | null;
  };
  createdAt: number;
  lastLogin: number;
}

// Sign in with Google
export const signInWithGoogle = async (): Promise<UserData | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    if (user) {
      const userData: UserData = {
        uid: user.uid,
        name: user.displayName || '',
        email: user.email || '',
        profilePic: user.photoURL || '',
        subscription: {
          isActive: false,
          plan: 'free',
          subscriptionId: null,
          currentPeriodEnd: null,
        },
        createdAt: Date.now(),
        lastLogin: Date.now(),
      };

      // Try to save/update user data in Firestore, but don't fail if it doesn't work
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          // User exists, update last login and get existing subscription data
          const existingData = userDoc.data() as UserData;
          await setDoc(userDocRef, {
            ...existingData,
            lastLogin: Date.now(),
            // Update profile info in case it changed
            name: user.displayName || existingData.name,
            email: user.email || existingData.email,
            profilePic: user.photoURL || existingData.profilePic,
          });
          
          return {
            ...existingData,
            name: user.displayName || existingData.name,
            email: user.email || existingData.email,
            profilePic: user.photoURL || existingData.profilePic,
            lastLogin: Date.now(),
          };
        } else {
          // New user, create document
          await setDoc(userDocRef, userData);
          return userData;
        }
      } catch (firestoreError) {
        console.warn('Firestore operation failed, using auth data only:', firestoreError);
        // Return user data from auth even if Firestore fails
        return userData;
      }
    }

    return null;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Sign out
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Update user subscription in Firestore
export const updateUserSubscription = async (
  userId: string,
  subscriptionData: {
    isActive: boolean;
    plan: 'free' | 'pro';
    subscriptionId: string | null;
    currentPeriodEnd: number | null;
  }
): Promise<void> => {
  try {
    console.log('Updating subscription for user:', userId);
    console.log('Subscription data:', subscriptionData);
    
    const userDocRef = doc(db, 'users', userId);
    
    // First check if user document exists
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      // Update existing user document
      await setDoc(userDocRef, {
        subscription: subscriptionData,
        lastLogin: Date.now(),
      }, { merge: true });
      console.log('✅ Updated existing user subscription');
    } else {
      // Create new user document with subscription
      console.log('User document does not exist, creating new one');
      await setDoc(userDocRef, {
        uid: userId,
        name: '',
        email: '',
        profilePic: '',
        subscription: subscriptionData,
        createdAt: Date.now(),
        lastLogin: Date.now(),
      });
      console.log('✅ Created new user document with subscription');
    }
  } catch (error: any) {
    console.error('Error updating user subscription:', error);
    console.error('Error details:', {
      code: error?.code,
      message: error?.message,
      userId,
      subscriptionData
    });
    throw error;
  }
};

// Get user data from Firestore
export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    console.log('Attempting to get user data for:', userId);
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      console.log('User data retrieved successfully');
      return userDoc.data() as UserData;
    } else {
      console.log('User document does not exist');
      return null;
    }
  } catch (error: any) {
    console.error('Error getting user data:', error);
    console.error('Error code:', error?.code);
    console.error('Error message:', error?.message);
    throw error;
  }
};

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
