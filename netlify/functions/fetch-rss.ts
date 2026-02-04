import type { Handler } from '@netlify/functions';
import Parser from 'rss-parser';
import * as cheerio from 'cheerio';

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
    const { rssUrl, fetchingMethod = 'rss', selectors = [] } = JSON.parse(event.body || '{}');

    if (!rssUrl) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'URL is required' }),
      };
    }

    let headlines: { title: string; link?: string }[] = [];

    if (fetchingMethod === 'scraping') {
      console.log(`Scraping HTML from: ${rssUrl} using selectors: ${selectors.join(', ')}`);

      const response = await fetch(rssUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'en-US,en;q=0.9,it;q=0.8',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          'Upgrade-Insecure-Requests': '1',
        },
        redirect: 'follow',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch HTML: ${response.status} ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      const titleSet = new Set<string>();

      selectors.forEach((selector) => {
        $(selector).each((_, element) => {
          const title = $(element).text().trim();
          if (title && title.length > 10 && !titleSet.has(title)) {
            titleSet.add(title);
            headlines.push({
              title,
              link: $(element).attr('href') || rssUrl, // Fallback to base URL if href missing
            });
          }
        });
      });

      // Limit to 50 and unique
      headlines = headlines.slice(0, 50);
      console.log(`Successfully scraped ${headlines.length} headlines`);
    } else {
      console.log(`Fetching RSS from: ${rssUrl}`);
      const feed = await parser.parseURL(rssUrl);
      headlines = feed.items.slice(0, 50).map((item) => ({
        title: item.title || 'No title',
        link: item.link || undefined,
      }));
      console.log(`Successfully fetched ${headlines.length} headlines via RSS`);
    }

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=1800, s-maxage=1800',
      },
      body: JSON.stringify({ headlines }),
    };
  } catch (error) {
    console.error('Fetch/Scrape error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to fetch news',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
