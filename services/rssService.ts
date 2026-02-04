import { RSSHeadline } from '../types';

const RSS_FUNCTION_URL =
  process.env.NODE_ENV === 'production'
    ? '/.netlify/functions/fetch-rss'
    : 'http://localhost:8888/.netlify/functions/fetch-rss';

/**
 * Fetches RSS headlines from a given RSS feed URL
 * Uses Netlify Function to avoid CORS issues
 */
export async function fetchRSSHeadlines(rssUrl: string): Promise<RSSHeadline[]> {
  try {
    const response = await fetch(RSS_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rssUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.headlines || [];
  } catch (error) {
    console.error('Error fetching RSS headlines:', error);
    throw error;
  }
}
