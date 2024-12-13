import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);
  initializeApp({
    credential: cert(serviceAccount),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
}

const db = getFirestore();

export async function GET(request: Request) {
  console.log('📥 Fetching digests request received');

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Fetching digests for user:', userId);

    const digestsRef = db.collection('digests');
    const snapshot = await digestsRef
      .where('userId', '==', userId)
      .get();

    const digests = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    }));

    console.log(`✅ Found ${digests.length} digests`);
    return NextResponse.json({ digests });
  } catch (error) {
    console.error('❌ Error fetching digests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch digests' },
      { status: 500 }
    );
  }
}