import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);
  initializeApp({
    credential: cert(serviceAccount),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
}

const db = getFirestore();

interface CreateDigestRequest {
  userId: string;
  name: string;
  topics: string;
  description: string;
}

export async function POST(request: Request) {
  console.log('📥 Create digest request received');

  try {
    const data: CreateDigestRequest = await request.json();
    const { userId, name, topics, description } = data;

    const digestData = {
      userId,
      name: name.trim(),
      topics,
      description,
      createdAt: Date.now()
    };

    const docRef = await db.collection('digests').add(digestData);

    return NextResponse.json({
      id: docRef.id,
      ...digestData
    });
  } catch (error) {
    console.error('❌ Error creating digest:', error);
    return NextResponse.json(
      { error: 'Failed to create digest' },
      { status: 500 }
    );
  }
}