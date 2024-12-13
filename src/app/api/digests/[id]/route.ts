import { NextResponse, NextRequest } from 'next/server';
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

interface UpdateDigestRequest {
  name: string;
  topics: string;
  description: string;
}


export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('🗑️ Delete digest request received');

  try {
    const { id } = await params;

    await db.collection('digests').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error deleting digest:', error);
    return NextResponse.json(
      { error: 'Failed to delete digest' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('📝 Update digest request received');

  try {
    const { id } = await params;
    const data: UpdateDigestRequest = await request.json();
    const { name, topics, description } = data;

    await db.collection('digests').doc(id).update({
      name: name.trim(),
      topics,
      description,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error updating digest:', error);
    return NextResponse.json(
      { error: 'Failed to update digest' },
      { status: 500 }
    );
  }
}