import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';
import * as cheerio from 'cheerio';

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
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Fetch HuggingFace papers
    const hfResponse = await fetchWithRetry(`https://huggingface.co/papers?date=${date}`);
    const html = await hfResponse.text();
    const $ = cheerio.load(html);

    // Extract unique arXiv IDs
    const uniqueArxivIds = new Set<string>();
    const paperLinks = $('a[href^="/papers/"]')
      .map((_, element) => {
        const href = $(element).attr('href') || '';
        const arxivId = href.split('/').pop()?.split('#')[0] || '';
        return {
          title: $(element).text().trim(),
          arxivId,
          arxivUrl: `https://arxiv.org/abs/${arxivId}`
        };
      })
      .get()
      .filter(paper => {
        if (!paper.arxivId || uniqueArxivIds.has(paper.arxivId)) {
          return false;
        }
        uniqueArxivIds.add(paper.arxivId);
        return true;
      });

    // Fetch paper details from arXiv
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });

    const papers = await Promise.all(
      paperLinks.map(async (paper) => {
        try {
          const params = new URLSearchParams({
            id_list: paper.arxivId,
          });

          const arxivResponse = await fetchWithRetry(`${ARXIV_API_URL}?${params}`, {
            headers: {
              'Accept': 'application/xml'
            }
          });

          const xmlData = await arxivResponse.text();

          if (!xmlData || xmlData.trim() === '') {
            throw new Error('Empty response from arXiv API');
          }

          const result = parser.parse(xmlData);
          const entry = result.feed.entry;

          if (!entry) return null;

          return {
            id: paper.arxivId.replace(/v\d+$/, ''),
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
          console.error('Error fetching paper:', error);
          return null;
        }
      })
    );

    const validPapers = papers.filter(paper => paper !== null);
    return NextResponse.json({ papers: validPapers });
  } catch (error) {
    console.error('Error fetching HuggingFace papers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch papers' },
      { status: 500 }
    );
  }
}