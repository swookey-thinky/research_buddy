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

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const queriesRef = db.collection('arxivQueries');
    const snapshot = await queriesRef.where('userId', '==', userId).get();

    const savedQueries = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    })).sort((a, b) => (b as any).createdAt - (a as any).createdAt);

    return NextResponse.json({ queries: savedQueries });
  } catch (error) {
    console.error('Error fetching ArXiv queries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ArXiv queries' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId, name, queryString } = await request.json();

    if (!userId || !name || !queryString) {
      return NextResponse.json(
        { error: 'User ID, name, and query string are required' },
        { status: 400 }
      );
    }

    const newQuery = {
      name,
      query: queryString,
      userId,
      createdAt: Date.now(),
    };

    const docRef = await db.collection('arxivQueries').add(newQuery);
    return NextResponse.json({ id: docRef.id, ...newQuery });
  } catch (error) {
    console.error('Error saving ArXiv query:', error);
    return NextResponse.json(
      { error: 'Failed to save ArXiv query' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId, queryId } = await request.json();

    if (!userId || !queryId) {
      return NextResponse.json(
        { error: 'User ID and query ID are required' },
        { status: 400 }
      );
    }

    // Verify the query belongs to the user before deleting
    const queryRef = db.collection('arxivQueries').doc(queryId);
    const queryDoc = await queryRef.get();

    if (!queryDoc.exists || queryDoc.data()?.userId !== userId) {
      return NextResponse.json(
        { error: 'Query not found or unauthorized' },
        { status: 404 }
      );
    }

    await queryRef.delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting ArXiv query:', error);
    return NextResponse.json(
      { error: 'Failed to delete ArXiv query' },
      { status: 500 }
    );
  }
}