import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const ARCHIVE_URL = 'https://buttondown.com/ainews/archive/';
const MAX_RETRIES = 3;
const INITIAL_BACKOFF = 1000;

async function fetchWithRetry(url: string, retryCount = 0): Promise<Response> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    if (retryCount >= MAX_RETRIES) {
      throw error;
    }
    const backoffTime = INITIAL_BACKOFF * Math.pow(2, retryCount);
    await new Promise(resolve => setTimeout(resolve, backoffTime));
    return fetchWithRetry(url, retryCount + 1);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');

  if (!dateParam) {
    return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
  }

  try {
    const inputDate = new Date(dateParam);
    const formattedInputDate = inputDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const response = await fetchWithRetry(ARCHIVE_URL);
    const html = await response.text();
    const $ = cheerio.load(html);

    let matchingUrl = 'none';

    $('.email-list a').each((_, element) => {
      const metadata = $(element).find('.email-metadata');
      const dateText = metadata.text().trim();

      if (dateText === formattedInputDate) {
        matchingUrl = $(element).attr('href') || 'none';
        return false; // Break the loop
      }
    });

    return NextResponse.json({ url: matchingUrl });
  } catch (error) {
    console.error('Error fetching AI news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI news' },
      { status: 500 }
    );
  }
}