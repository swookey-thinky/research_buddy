import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

export const runtime = 'nodejs';

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
    const rawPaperId = searchParams.get('paperId');
    const type = searchParams.get('type');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (type === 'all') {
      const userDoc = await db.collection('paperTagsByUser').doc(userId).get();
      const data = userDoc.data();
      const uniquePairs = data?.uniqueNameColorPairs || [];

      const tags = uniquePairs.map(pair => pair.name).sort();
      const colors = uniquePairs.reduce((acc, pair) => {
        acc[pair.name] = pair.color;
        return acc;
      }, {} as Record<string, string>);

      return NextResponse.json({ tags, colors });
    }

    if (!rawPaperId) {
      return NextResponse.json(
        { error: 'Paper ID is required for paper-specific tags' },
        { status: 400 }
      );
    }

    const paperId = rawPaperId.replace(/v\d+$/, '');

    const userTagsRef = db.collection('paperTagsByUser').doc(userId).collection('paperTags');
    const tagsQuery = userTagsRef.where('paperId', '==', paperId);
    const snapshot = await tagsQuery.get();
    const tags = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    }));

    return NextResponse.json({ tags: tags.sort((a, b) => (b as any).createdAt - (a as any).createdAt) });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}