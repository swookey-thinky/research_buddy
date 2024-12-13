import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

export const runtime = 'nodejs'; // Add this line

if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);
  initializeApp({
    credential: cert(serviceAccount),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
}

const db = getFirestore();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const tagName = searchParams.get('tagName');

    if (!userId || !tagName) {
      return NextResponse.json(
        { error: 'User ID and tag name are required' },
        { status: 400 }
      );
    }

    const userTagsRef = db.collection('paperTagsByUser').doc(userId).collection('paperTags');
    const tagsQuery = userTagsRef.where('name', '==', tagName);
    const snapshot = await tagsQuery.get();

    const paperIds = snapshot.docs.map(doc => doc.data().paperId);
    console.log("Querying paper ids for tag: " + tagName)
    console.log("Retrieved paper ids for tag: " + paperIds)

    return NextResponse.json({ paperIds });
  } catch (error) {
    console.error('Error fetching papers by tag:', error);
    return NextResponse.json(
      { error: 'Failed to fetch papers by tag' },
      { status: 500 }
    );
  }
}