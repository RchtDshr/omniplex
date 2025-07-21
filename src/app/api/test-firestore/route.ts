import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('Testing Firestore access for user:', userId);
    
    // Try to read user data
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      console.log('User data found:', userDoc.data());
      return NextResponse.json({ 
        success: true, 
        userData: userDoc.data(),
        message: 'Firestore access working!' 
      });
    } else {
      console.log('User document does not exist');
      return NextResponse.json({ 
        success: true, 
        message: 'User document does not exist, but access is working' 
      });
    }
  } catch (error: any) {
    console.error('Firestore test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error?.message || 'Unknown error',
      code: error?.code || 'unknown'
    }, { status: 500 });
  }
}
