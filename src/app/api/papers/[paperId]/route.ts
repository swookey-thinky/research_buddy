import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';

export const runtime = 'nodejs';

const ARXIV_API_URL = 'https://export.arxiv.org/api/query';
const MAX_RETRIES = 3;
const INITIAL_BACKOFF = 1000;

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
    console.log(`❌ Error fetching ${url}, attempt ${retryCount + 1}/${MAX_RETRIES}. Retrying in ${backoffTime}ms...`);

    await new Promise(resolve => setTimeout(resolve, backoffTime));
    return fetchWithRetry(url, options, retryCount + 1);
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ paperId: string }> }
) {
  try {
    const { paperId } = await context.params;
    console.log('🌐 Fetching Id from ArXiv:', paperId);

    const queryParams = new URLSearchParams({
      id_list: paperId.split('/').pop() || '',
    });

    const arxivUrl = `${ARXIV_API_URL}?${queryParams}`;
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
      return NextResponse.json(
        { error: 'Paper not found' },
        { status: 404 }
      );
    }

    const entry = result.feed.entry;
    const category = Array.isArray(entry.category)
      ? entry.category[0]['@_term']
      : entry.category['@_term'];

    return NextResponse.json({
      id: paperId,
      title: entry.title?.replace(/\n/g, ' ').trim() || '',
      authors: Array.isArray(entry.author)
        ? entry.author.map((a: any) => a.name)
        : [entry.author.name],
      summary: entry.summary?.replace(/\n/g, ' ').trim() || '',
      published: entry.published || '',
      category: category || 'Unknown',
      link: Array.isArray(entry.link)
        ? entry.link.find((l: any) => l['@_type'] === 'text/html')?.['@_href'] || entry.id
        : entry.link['@_href'] || entry.id,
    });
  } catch (error) {
    const { paperId } = await context.params;

    console.error('Error fetching paper from ArXiv:', paperId, error);
    return NextResponse.json(
      { error: 'Failed to fetch paper' },
      { status: 500 }
    );
  }
}