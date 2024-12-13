import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

export const runtime = 'nodejs'; // Add this line

const COLORS = [
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800',
  'bg-yellow-100 text-yellow-800',
  'bg-purple-100 text-purple-800',
  'bg-pink-100 text-pink-800',
  'bg-indigo-100 text-indigo-800',
];

function getColorForTag(tagName: string): string {
  const hash = tagName.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return COLORS[Math.abs(hash) % COLORS.length];
}

if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);
  initializeApp({
    credential: cert(serviceAccount),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
}

const db = getFirestore();

export async function POST(request: Request) {
  try {
    const { userId, paperId, name, existingColor } = await request.json();

    if (!userId || !paperId || !name) {
      return NextResponse.json(
        { error: 'User ID, Paper ID, and tag name are required' },
        { status: 400 }
      );
    }

    const cleanPaperId = paperId.replace(/v\d+$/, '');

    const trimmedName = name.trim();
    if (!trimmedName) {
      return NextResponse.json(
        { error: 'Tag name cannot be empty' },
        { status: 400 }
      );
    }

    const userTagsRef = db.collection('paperTagsByUser').doc(userId).collection('paperTags');

    // Check if tag already exists
    const existingQuery = await userTagsRef
      .where('paperId', '==', cleanPaperId)
      .where('name', '==', trimmedName)
      .get();

    if (!existingQuery.empty) {
      return NextResponse.json(
        { error: 'Tag already exists for this paper' },
        { status: 400 }
      );
    }

    const color = existingColor || getColorForTag(trimmedName);
    const newTagRef = userTagsRef.doc();

    const tagData = {
      paperId: cleanPaperId,
      name: trimmedName,
      color,
      createdAt: Date.now(),
    };

    await newTagRef.set(tagData);

    // Update the summary document
    const summaryRef = db.collection('paperTagsByUser').doc(userId);
    const summaryDoc = await summaryRef.get();

    if (summaryDoc.exists) {
      const data = summaryDoc.data();
      const uniquePairs = data?.uniqueNameColorPairs || [];
      const existingPair = uniquePairs.find((pair: any) => pair.name === trimmedName);

      if (!existingPair) {
        uniquePairs.push({ name: trimmedName, color });
        await summaryRef.update({ uniqueNameColorPairs: uniquePairs });
      }
    } else {
      await summaryRef.set({
        uniqueNameColorPairs: [{ name: trimmedName, color }]
      });
    }

    return NextResponse.json({
      success: true,
      tag: {
        id: newTagRef.id,
        paperId: cleanPaperId,
        name: trimmedName,
        color,
        createdAt: Date.now(),
      }
    });
  } catch (error) {
    console.error('Error adding tag:', error);
    return NextResponse.json(
      { error: 'Failed to add tag' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tagId = searchParams.get('tagId');
    const userId = searchParams.get('userId');

    if (!tagId || !userId) {
      return NextResponse.json(
        { error: 'Tag ID and User ID are required' },
        { status: 400 }
      );
    }

    const userTagsRef = db.collection('paperTagsByUser').doc(userId).collection('paperTags');
    const tagDoc = await userTagsRef.doc(tagId).get();

    if (!tagDoc.exists) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    await userTagsRef.doc(tagId).delete();

    // Check if this was the last tag with this name
    const tagData = tagDoc.data();
    const similarTagsQuery = await userTagsRef
      .where('name', '==', tagData?.name)
      .limit(1)
      .get();

    if (similarTagsQuery.empty) {
      // Update the summary document to remove this tag
      const summaryRef = db.collection('paperTagsByUser').doc(userId);
      const summaryDoc = await summaryRef.get();

      if (summaryDoc.exists) {
        const data = summaryDoc.data();
        const uniquePairs = data?.uniqueNameColorPairs || [];
        const updatedPairs = uniquePairs.filter((pair: any) => pair.name !== tagData?.name);
        await summaryRef.update({ uniqueNameColorPairs: updatedPairs });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing tag:', error);
    return NextResponse.json(
      { error: 'Failed to remove tag' },
      { status: 500 }
    );
  }
}