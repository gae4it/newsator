import { NewsTopic, Region, NewsCategory, ViewMode, AIModel, Language } from '../types';

// Client-side cache to avoid redundant requests
const CACHE_DURATION_MS = 30 * 60 * 1000;
const newsCache: Map<string, { data: NewsTopic; timestamp: number }> = new Map();

export const fetchNewsSummary = async (
  region: Region,
  category: NewsCategory,
  mode: ViewMode = ViewMode.SUMMARY,
  model: AIModel = AIModel.GEMINI,
  excludeTitles: string[] = [],
  language: Language = Language.EN
): Promise<NewsTopic> => {
  // Check client-side cache (only for initial loads)
  const isInitialLoad = excludeTitles.length === 0;
  const cacheKey = `${region}-${category}-${mode}-${model}-${language}`;

  const now = Date.now();
  if (isInitialLoad) {
    const cached = newsCache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_DURATION_MS) {
      console.log(`[Cache Hit] Returning cached news for ${cacheKey}`);
      return cached.data;
    }
  }

  try {
    // Call Netlify Function
    const response = await fetch('/.netlify/functions/fetch-news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ region, category, mode, model, excludeTitles, language }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data: NewsTopic = await response.json();

    // Validate data structure
    if (!data.points || (isInitialLoad && data.points.length === 0)) {
      throw new Error('No news points returned from server');
    }

    // Update client-side cache
    newsCache.set(cacheKey, { data, timestamp: now });

    return data;
  } catch (error) {
    console.error('Error fetching news:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch news: ${error.message}`);
    }
    throw new Error('Failed to fetch and summarize news. Please try again.');
  }
};
