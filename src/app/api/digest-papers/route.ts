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
  page?: number;
}

export async function POST(request: Request) {
  try {
    const data: DigestRequest = await request.json();
    const { userId, digestName, date, page = 1 } = data;
    const pageSize = 20;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const snapshot = await db
      .collection('daily_digest_results')
      .doc(userId)
      .collection(date)
      .doc(digestName)
      .collection('results')
      .get();

    if (snapshot.empty) {
      return NextResponse.json({
        results: [],
        totalPages: 0,
        totalPapers: 0,
        currentPage: page
      });
    }

    const totalPapers = snapshot.size;
    const totalPages = Math.ceil(totalPapers / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    // Get the papers for the current page
    const papers = await Promise.all(
      snapshot.docs
        .slice(startIndex, endIndex)
        .map(async (doc) => {
          const { arxiv_id, reason, relevancy_score } = doc.data();

          try {
            const params = new URLSearchParams({
              id_list: arxiv_id,
            });

            const arxivUrl = `${ARXIV_API_URL}?${params}`;
            const response = await fetchWithRetry(arxivUrl, {
              headers: {
                'Accept': 'application/xml'
              }
            });

            const xmlText = await response.text();
            const parser = new XMLParser({
              ignoreAttributes: false,
              attributeNamePrefix: '@_'
            });
            const result = parser.parse(xmlText);

            if (!result.feed?.entry) {
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
              category: Array.isArray(entry.category)
                ? entry.category[0]['@_term'] || 'Unknown'
                : entry.category['@_term'] || 'Unknown',
              link: Array.isArray(entry.link)
                ? entry.link.find((l: any) => l['@_type'] === 'text/html')?.['@_href'] || entry.id
                : entry.link['@_href'] || entry.id,
              reason,
              relevancy_score
            };
          } catch (error) {
            console.error(`Error processing paper ${arxiv_id}:`, error);
            return null;
          }
        })
    );

    const validPapers = papers.filter((p): p is NonNullable<typeof p> => p !== null);

    return NextResponse.json({
      results: validPapers,
      totalPages,
      totalPapers,
      currentPage: page
    });

  } catch (error) {
    console.error('❌ Error processing digest:', error);
    return NextResponse.json(
      { error: 'Failed to process digest request' },
      { status: 500 }
    );
  }
}