import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

export const runtime = 'nodejs';

if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);
  initializeApp({
    credential: cert(serviceAccount),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
}

export async function POST(request: Request) {
  try {
    const { session } = await request.json();

    if (!session) {
      return NextResponse.json(
        { error: 'Session token is required' },
        { status: 400 }
      );
    }

    const auth = getAuth();
    const decodedClaims = await auth.verifySessionCookie(session);

    return NextResponse.json({ uid: decodedClaims.uid });
  } catch (error) {
    console.error('Error verifying session:', error);
    return NextResponse.json(
      { error: 'Invalid session' },
      { status: 401 }
    );
  }
}