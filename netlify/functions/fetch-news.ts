import type { Handler, HandlerEvent } from '@netlify/functions';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Parser from 'rss-parser';

const parser = new Parser();

// In-memory cache to store results for 30 minutes
const CACHE_DURATION_MS = 30 * 60 * 1000;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const newsCache: Map<string, { data: { points: any[] }; timestamp: number }> = new Map();

/**
 * Helper to clean and parse JSON from AI responses
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseJSONResponse(text: string, cacheKey: string): { points: any[] } {
  let cleanedText = text.trim();

  // Remove markdown code blocks
  if (cleanedText.startsWith('```json')) {
    cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleanedText.startsWith('```')) {
    cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  // Extract JSON if there's text before/after it
  const firstBrace = cleanedText.indexOf('{');
  const lastBrace = cleanedText.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
  }

  cleanedText = cleanedText.trim();

  try {
    const data = JSON.parse(cleanedText);

    // Normalize response structure (handle models that hallucinate keys like 'articles' or 'news')
    const actualPoints = data.points || data.articles || data.news || data.items;

    if (!actualPoints || !Array.isArray(actualPoints)) {
      throw new Error("Invalid structure: missing 'points' array");
    }

    // Ensure it always returns the expected { points: [...] } structure
    return { points: actualPoints };
  } catch {
    console.error(
      '[ERROR] JSON Parse failed for',
      cacheKey,
      'Text snippet:',
      cleanedText.substring(0, 100)
    );
    throw new Error(
      'Failed to parse AI response as valid JSON. Raw: ' + (cleanedText.substring(0, 50) + '...')
    );
  }
}

export const handler: Handler = async (event: HandlerEvent) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST')
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  try {
    const body = JSON.parse(event.body || '{}');
    const {
      region,
      category,
      mode = 'Detailed Report',
      model = 'Gemini 1.5',
      excludeTitles = [],
      language = 'English',
    } = body;

    if (!region || !category) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing region or category' }),
      };
    }

    const isInitialLoad = excludeTitles.length === 0;
    const cacheKey = `${region}-${category}-${mode}-${model}-${language}`;
    const now = Date.now();

    if (isInitialLoad) {
      const cached = newsCache.get(cacheKey);
      if (cached && now - cached.timestamp < CACHE_DURATION_MS) {
        return { statusCode: 200, headers, body: JSON.stringify(cached.data) };
      }
    }

    // AI LOGIC
    const itemCount = 10;
    let finalData;

    // 1. Fetch real news from Google News RSS (always do this first for better context and lower quota usage)
    const query = `${category} ${region} when:7d`;
    const shortLang = language.toLowerCase() === 'italiano' ? 'it' : 'en';
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${shortLang}&gl=${shortLang.toUpperCase()}&ceid=${shortLang.toUpperCase()}:${shortLang}`;

    let feed;
    try {
      feed = await Promise.race([
        parser.parseURL(rssUrl),
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('RSS Fetch Timeout')), 5000)
        ),
      ]);
    } catch (e) {
      console.error('RSS Fetch failed:', e);
      throw new Error('Failed to fetch source news. Please try again later.');
    }

    if (!feed || !feed.items) throw new Error('Unable to fetch news sources');

    // Filter out already shown news - use a safer matching logic
    const filteredFeedItems = feed.items.filter((item) => {
      if (!item.title) return false;
      const cleanTitle = item.title.split(' - ')[0].trim().toLowerCase();

      return !excludeTitles.some((ex: string) => {
        const cleanEx = ex.toLowerCase().trim();
        return (
          cleanEx === cleanTitle ||
          (cleanTitle.length > 20 && cleanEx.includes(cleanTitle)) ||
          (cleanEx.length > 20 && cleanTitle.includes(cleanEx))
        );
      });
    });

    const realNewsItems = filteredFeedItems.slice(0, itemCount).map((item) => ({
      title: item.title?.substring(0, 150),
      link: item.link,
    }));

    if (realNewsItems.length === 0) {
      if (isInitialLoad) {
        throw new Error(`No recent news found for ${category} in ${region} in the last 24h.`);
      } else {
        // For pagination, return an empty set gracefully
        return { statusCode: 200, headers, body: JSON.stringify({ points: [] }) };
      }
    }

    const aiPrompt = `
      MANDATORY TASK: Summarize and format these ${realNewsItems.length} news items into valid JSON.
      LANGUAGE: All content must be in ${language}.
      
      DATA: ${JSON.stringify(realNewsItems)}

      EXPECTED JSON STRUCTURE (STRICT):
      { "points": [ { "title": "Headline in ${language}", "summary": "1 short sentence in ${language}", "sourceName": "Source", "sourceUrl": "Link" } ] }
      
      FINAL RULE: NO preamble, NO extra text, ONLY the JSON object.
    `;

    // 2. AI LOGIC (Gemini Only)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not found');

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const geminiModelId = 'gemini-2.5-flash-lite';

      const genModel = genAI.getGenerativeModel({
        model: geminiModelId,
        systemInstruction: `You are a professional news editor. Output strictly valid JSON. Language: ${language}.`,
        generationConfig: {
          responseMimeType: 'application/json',
        },
      });

      const result = await genModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: aiPrompt }] }],
      });

      finalData = parseJSONResponse(result.response.text(), cacheKey);
    } catch (aiError: any) {
      console.warn('Gemini failed, falling back to raw RSS:', aiError.message);
      // FALLBACK: Return raw RSS data formatted as AI response if quota is hit or error occurs
      finalData = {
        points: realNewsItems.map((item) => ({
          title: item.title || 'News Update',
          summary: 'Click to read the full story from the source.',
          sourceName: 'RSS Feed',
          sourceUrl: item.link || '#',
        })),
      };
    }

    // Cache and return
    newsCache.set(cacheKey, { data: finalData, timestamp: now });
    return { statusCode: 200, headers, body: JSON.stringify(finalData) };
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number };
    console.error('Function Error:', err);

    const isQuotaError =
      err.message?.includes('429') || err.status === 429 || err.message?.includes('quota');
    const statusCode = isQuotaError ? 429 : 500;
    const errorMessage = isQuotaError
      ? 'AI Quota Exceeded. Please wait a few minutes or switch to a different AI model.'
      : err.message || 'Internal server error';

    return {
      statusCode,
      headers,
      body: JSON.stringify({ error: errorMessage }),
    };
  }
};
