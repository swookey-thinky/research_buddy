import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

export const runtime = 'nodejs'; // Add this line

const ARXIV_API_URL = 'https://export.arxiv.org/api/query';
const MAX_RETRIES = 3;
const INITIAL_BACKOFF = 1000; // 1 second

if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);
  initializeApp({
    credential: cert(serviceAccount),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
}

const db = getFirestore();

async function fetchWithRetry(url: string, options: RequestInit, retryCount = 0): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    if (retryCount >= MAX_RETRIES) {
      throw error;
    }

    const backoffTime = INITIAL_BACKOFF * Math.pow(2, retryCount);
    console.error(`❌ Error fetching ${url}, attempt ${retryCount + 1}/${MAX_RETRIES}. Retrying in ${backoffTime}ms...`, error);

    await new Promise(resolve => setTimeout(resolve, backoffTime));
    return fetchWithRetry(url, options, retryCount + 1);
  }
}

export async function GET(request: Request) {
  console.log('📥 Reading list request received');

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Fetching reading list for user:', userId);

    const userTagsRef = db.collection('paperTagsByUser').doc(userId).collection('paperTags');
    const tagsQuery = userTagsRef.where('name', '==', 'Reading List');
    const snapshot = await tagsQuery.get();
    const paperIds = snapshot.docs.map(doc => doc.data().paperId);

    if (paperIds.length === 0) {
      return NextResponse.json({ papers: [] });
    }

    // Fetch paper details from ArXiv
    const paperPromises = paperIds.map(async (id) => {
      try {
        const params = new URLSearchParams({
          id_list: id.split('/').pop() || '',
        });

        const arxivUrl = `${ARXIV_API_URL}?${params}`;
        console.log('🌐 Fetching paper from ArXiv:', arxivUrl);

        const response = await fetchWithRetry(arxivUrl, {
          headers: {
            'Accept': 'application/xml'
          }
        });

        const xmlText = await response.text();
        console.log('📄 Received XML response length:', xmlText.length);

        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: '@_'
        });
        const result = parser.parse(xmlText);

        if (!result.feed?.entry) {
          console.log('ℹ️ No entry found for paper:', id);
          return null;
        }

        const entry = result.feed.entry;

        return {
          id,
          title: entry.title?.replace(/\n/g, ' ').trim() || '',
          authors: Array.isArray(entry.author)
            ? entry.author.map((a: any) => a.name)
            : [entry.author.name],
          summary: entry.summary?.replace(/\n/g, ' ').trim() || '',
          published: entry.published || '',
          category: Array.isArray(entry.category)
            ? entry.category[0]['@_term'] || 'Unknown'
            : entry.category['@_term'] || 'Unknown',
          link: Array.isArray(entry.link)
            ? entry.link.find((l: any) => l['@_type'] === 'text/html')?.['@_href'] || entry.id
            : entry.link['@_href'] || entry.id,
        };
      } catch (error) {
        console.error(`❌ Failed to process paper ${id} after all retries:`, error);
        return null;
      }
    });

    console.log(`✅ Processing ${paperPromises.length} papers`);
    const papers = (await Promise.all(paperPromises))
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());

    return NextResponse.json({ papers });
  } catch (error) {
    console.error('❌ Error processing reading list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reading list' },
      { status: 500 }
    );
  }
}