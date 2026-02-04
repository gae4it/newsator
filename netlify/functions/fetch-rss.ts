import type { Handler } from '@netlify/functions';
import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; NewsatorBot/1.0)',
  },
});

export const handler: Handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { rssUrl } = JSON.parse(event.body || '{}');

    if (!rssUrl) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'RSS URL is required' }),
      };
    }

    console.log(`Fetching RSS from: ${rssUrl}`);

    // Fetch and parse RSS feed
    const feed = await parser.parseURL(rssUrl);

    // Extract titles and links (limit to 50)
    const headlines = feed.items.slice(0, 50).map((item) => ({
      title: item.title || 'No title',
      link: item.link || undefined,
    }));

    console.log(`Successfully fetched ${headlines.length} headlines`);

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        // Cache for 30 minutes (1800 seconds)
        'Cache-Control': 'public, max-age=1800, s-maxage=1800',
      },
      body: JSON.stringify({ headlines }),
    };
  } catch (error) {
    console.error('RSS fetch error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to fetch RSS feed',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
