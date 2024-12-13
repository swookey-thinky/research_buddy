import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';

export const runtime = 'nodejs';

const ARXIV_API_URL = 'https://export.arxiv.org/api/query';
const MAX_RETRIES = 3;
const INITIAL_BACKOFF = 1000;

async function fetchWithRetry(url: string, options?: RequestInit, retryCount = 0): Promise<Response> {
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
  try {
    const { searchParams } = new URL(request.url);
    const keywords = searchParams.getAll('keywords');
    const start = searchParams.get('start') || '0';
    const maxResults = searchParams.get('max_results') || '100';

    if (!keywords.length) {
      return NextResponse.json(
        { error: 'Keywords are required' },
        { status: 400 }
      );
    }

    const keywordQuery = keywords
      .map(k => `all:${encodeURIComponent(k)}`)
      .join(' AND ');

    const params = new URLSearchParams({
      search_query: keywordQuery,
      start,
      max_results: maxResults,
      sortBy: 'submittedDate',
      sortOrder: 'descending',
    });

    const response = await fetchWithRetry(`${ARXIV_API_URL}?${params}`);
    const xmlData = await response.text();

    if (!xmlData || xmlData.trim() === '') {
      throw new Error('Empty response from arXiv API');
    }

    if (xmlData.includes('<error>')) {
      const errorMatch = xmlData.match(/<error>(.*?)<\/error>/);
      throw new Error(errorMatch ? errorMatch[1] : 'ArXiv API error');
    }

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });
    const result = parser.parse(xmlData);
    const entries = result.feed.entry || [];

    const papers = Array.isArray(entries) ? entries : [entries];
    const parsedPapers = papers.map(entry => {
      const rawId = entry.id.split('/abs/')[1];
      const id = rawId.replace(/v\d+$/, '');

      return {
        id,
        title: entry.title,
        authors: Array.isArray(entry.author)
          ? entry.author.map((a: any) => a.name)
          : [entry.author.name],
        summary: entry.summary?.replace(/\n/g, ' ').trim() || '',
        published: entry.published || '',
        category: entry.category['@_term'] || 'Unknown',
        link: Array.isArray(entry.link)
          ? entry.link.find((l: any) => l['@_type'] === 'text/html')?.['@_href'] || entry.id
          : entry.link['@_href'] || entry.id,
      };
    });

    return NextResponse.json({ papers: parsedPapers });
  } catch (error) {
    console.error('Error searching papers:', error);
    return NextResponse.json(
      { error: 'Failed to search papers' },
      { status: 500 }
    );
  }
}