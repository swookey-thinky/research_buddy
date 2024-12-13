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
    const paperId = searchParams.get('paperId');

    if (!userId || !paperId) {
      return NextResponse.json(
        { error: 'User ID and Paper ID are required' },
        { status: 400 }
      );
    }

    const cleanPaperId = paperId.replace(/v\d+$/, '');

    const userTagsRef = db.collection('paperTagsByUser').doc(userId).collection('paperTags');
    const tagsQuery = userTagsRef.where('paperId', '==', cleanPaperId).where('name', '==', 'Reading List');
    const snapshot = await tagsQuery.get();

    return NextResponse.json({ isInReadingList: !snapshot.empty });
  } catch (error) {
    console.error('Error checking reading list status:', error);
    return NextResponse.json(
      { error: 'Failed to check reading list status' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId, paperId, action } = await request.json();

    if (!userId || !paperId || !action) {
      return NextResponse.json(
        { error: 'User ID, Paper ID, and action are required' },
        { status: 400 }
      );
    }

    const cleanPaperId = paperId.replace(/v\d+$/, '');

    const userTagsRef = db.collection('paperTagsByUser').doc(userId).collection('paperTags');
    const tagsQuery = userTagsRef.where('paperId', '==', cleanPaperId).where('name', '==', 'Reading List');
    const snapshot = await tagsQuery.get();

    if (action === 'add' && snapshot.empty) {
      // Check if Reading List tag exists in uniqueNameColorPairs
      const userDoc = await db.collection('paperTagsByUser').doc(userId).get();
      const data = userDoc.data();
      const uniquePairs = data?.uniqueNameColorPairs || [];
      const existingPair = uniquePairs.find(pair => pair.name === 'Reading List');
      const color = existingPair?.color || 'bg-blue-100 text-blue-800';

      // Add to uniqueNameColorPairs if not exists
      if (!existingPair) {
        await userDoc.ref.update({
          uniqueNameColorPairs: [...uniquePairs, { name: 'Reading List', color }]
        });
      }

      // Add the tag
      await userTagsRef.add({
        paperId: cleanPaperId,
        name: 'Reading List',
        color,
        createdAt: Date.now()
      });

      return NextResponse.json({ success: true, added: true });
    } else if (action === 'remove' && !snapshot.empty) {
      await Promise.all(snapshot.docs.map(doc => doc.ref.delete()));
      return NextResponse.json({ success: true, removed: true });
    }

    return NextResponse.json({ success: true, unchanged: true });
  } catch (error) {
    console.error('Error toggling reading list:', error);
    return NextResponse.json(
      { error: 'Failed to toggle reading list' },
      { status: 500 }
    );
  }
}