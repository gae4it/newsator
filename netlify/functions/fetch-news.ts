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

    // Limit excludeTitles to avoid prompt bloat
    const limitedExcludeTitles = excludeTitles.slice(-20);

    const itemCount = 10;
    let finalData;

    // AI LOGIC
    if (model.includes('Gemini')) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error('GEMINI_API_KEY not found');

      const genAI = new GoogleGenerativeAI(apiKey);
      const geminiModelId = 'gemini-2.0-flash-exp'; // Free tier available model

      const genModel = genAI.getGenerativeModel({
        model: geminiModelId,
        systemInstruction: `You are a professional news aggregator. Output strictly valid JSON. Language: ${language}.`,
        generationConfig: {
          responseMimeType: 'application/json',
        },
      });

      const promptText = `
        Latest news for: Region ${region}, Category ${category}, Mode ${mode}.
        - Language: ${language}
        - Quantity: ${itemCount} items
        ${limitedExcludeTitles.length > 0 ? `- IMPORTANT: DO NOT include these stories (they are already shown): [${limitedExcludeTitles.join(', ')}]` : ''}
        - Format: { "points": [ { "title": "Headline", "summary": "1-2 sentences", "sourceName": "Source", "sourceUrl": "URL" } ] }
      `;

      const result = await genModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: promptText }] }],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tools: [{ googleSearch: {} }] as any,
      });

      finalData = parseJSONResponse(result.response.text(), cacheKey);
    } else {
      // OpenRouter Logic with RSS Bridge
      const orApiKey = process.env.OPENROUTER_API_KEY;
      if (!orApiKey) throw new Error('OPENROUTER_API_KEY not found');

      // 1. Fetch real news from Google News RSS
      const query = `${category} ${region}`;
      const shortLang = language.toLowerCase() === 'italiano' ? 'it' : 'en';
      const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${shortLang}&gl=${shortLang.toUpperCase()}&ceid=${shortLang.toUpperCase()}:${shortLang}`;

      const feed = await Promise.race([
        parser.parseURL(rssUrl),
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('RSS Fetch Timeout')), 5000)
        ),
      ]);

      if (!feed || !feed.items) throw new Error('Unable to fetch RSS feed items');

      // Filter out already shown news
      const filteredFeedItems = feed.items.filter((item) => {
        if (!item.title) return false;
        const cleanTitle = item.title.split(' - ')[0].toLowerCase(); // Basic normalization
        return !excludeTitles.some(
          (ex: string) =>
            ex.toLowerCase().includes(cleanTitle) || cleanTitle.includes(ex.toLowerCase())
        );
      });

      // Take the next 5 items for the AI to summarize
      const realNewsItems = filteredFeedItems.slice(0, 5).map((item) => ({
        title: item.title?.substring(0, 150),
        link: item.link,
      }));

      if (realNewsItems.length === 0 && !isInitialLoad) {
        throw new Error('No more new stories found in this category.');
      }

      const orPrompt = `
        MANDATORY TASK: Summarize and format these ${realNewsItems.length} fresh news items into valid JSON.
        ${excludeTitles.length > 0 ? 'NOTE: These are different from the ones you already summarized.' : ''}
        JSON KEY NAME: Use "points" for the array of news.
        LANGUAGE: All content must be in ${language}.
        
        DATA: ${JSON.stringify(realNewsItems)}

        EXPECTED JSON STRUCTURE (STRICT):
        { "points": [ { "title": "Headline in ${language}", "summary": "1 short sentence in ${language}", "sourceName": "Source", "sourceUrl": "Link" } ] }
        
        FINAL RULE: NO preamble, NO extra text, ONLY the JSON object.
      `;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${orApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model:
            model === 'Mistral'
              ? 'mistralai/mistral-7b-instruct'
              : 'meta-llama/llama-3.1-8b-instruct',
          messages: [
            { role: 'system', content: 'Professional news editor. Output JSON only.' },
            { role: 'user', content: orPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        }),
      });

      if (!response.ok) throw new Error(`OpenRouter error: ${response.status}`);
      const json = await response.json();
      finalData = parseJSONResponse(json.choices[0]?.message?.content || '', cacheKey);
    }

    // Cache and return
    newsCache.set(cacheKey, { data: finalData, timestamp: now });
    return { statusCode: 200, headers, body: JSON.stringify(finalData) };
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number };
    console.error('Function Error:', err);

    // Check if it's a quota error (429)
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
