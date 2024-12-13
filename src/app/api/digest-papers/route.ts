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

interface DigestRequest {
  userId: string;
  digestName: string;
  date: string;
}

export async function POST(request: Request) {
  console.log('📥 Digest papers request received');

  try {
    const data: DigestRequest = await request.json();
    const { userId, digestName, date } = data;

    console.log('🔍 Request parameters:', {
      userId,
      digestName,
      date
    });

    const digestResultsRef = db
      .collection('daily_digest_results')
      .doc(userId)
      .collection(date)
      .doc(digestName)
      .collection('results');

    console.log('📚 Fetching digest results from Firebase');
    const snapshot = await digestResultsRef.get();
    const paperPromises = snapshot.docs.map(async (doc) => {
      const { arxiv_id, reason, relevancy_score } = doc.data();

      try {
        const params = new URLSearchParams({
          id_list: arxiv_id,
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
          console.log('ℹ️ No entry found for paper:', arxiv_id);
          return null;
        }

        const entry = result.feed.entry;

        return {
          id: arxiv_id,
          title: entry.title?.replace(/\n/g, ' ').trim() || '',
          authors: Array.isArray(entry.author)
            ? entry.author.map((a: any) => a.name)
            : [entry.author.name],
          summary: entry.summary?.replace(/\n/g, ' ').trim() || '',
          published: entry.published || '',
          category: entry.category['@_term'] || 'Unknown',
          link: Array.isArray(entry.link)
            ? entry.link.find((l: any) => l['@_type'] === 'text/html')?.['@_href'] || entry.id
            : entry.link['@_href'] || entry.id,
          reason,
          relevancy_score
        };
      } catch (error) {
        console.error(`❌ Failed to process paper ${arxiv_id} after all retries:`, error);
        return null;
      }
    });

    console.log(`✅ Processing ${paperPromises.length} papers`);
    const papers = (await Promise.all(paperPromises)).filter((p): p is NonNullable<typeof p> => p !== null);
    papers.sort((a, b) => b.relevancy_score - a.relevancy_score);

    return NextResponse.json({ results: papers });
  } catch (error) {
    console.error('❌ Error processing digest:', error);
    return NextResponse.json(
      { error: 'Failed to process digest request' },
      { status: 500 }
    );
  }
}