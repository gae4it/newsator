import { GoogleGenAI } from "@google/genai";
import { NewsResponse, Region } from "../types";

// In-memory cache to store results for 15 minutes
const CACHE_DURATION_MS = 15 * 60 * 1000;
const newsCache: Map<string, { data: NewsResponse; timestamp: number }> = new Map();

export const fetchNewsSummary = async (region: Region): Promise<NewsResponse> => {
  // Check Cache
  const cached = newsCache.get(region);
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_DURATION_MS) {
    console.log(`[Cache Hit] Returning cached news for ${region}`);
    return cached.data;
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are a comprehensive news aggregator. Your task is to perform EXTENSIVE Google Search queries to gather the latest and most significant news for the region: "${region}".
    
    Focus strictly on events published within the last 24–72 hours.
    
    SEARCH STRATEGY:
    - Perform MULTIPLE separate Google searches for each category below
    - Search broadly and deeply within each category
    - Aggregate ALL relevant results you find
    - Do NOT limit yourself to just the top few results
    
    CATEGORIES TO SEARCH:
    
    1. Breaking News / Latest Updates
    2. Politics (Domestic Politics, Foreign Politics, Elections, Government & Parliaments, Public Policy)
    3. Economy & Finance (Financial Markets, Companies, Labor & Employment, International Trade, Inflation, GDP, Macro Indicators)
    4. Business & Industry (Corporate News, Startups, Retail, Energy, Automotive, Real Estate)
    5. Technology & Innovation (Digital, AI & Robotics, Cybersecurity, Gadgets & Hardware)
    6. Crime / Local News (Crime News, Judicial News, Accidents & Disasters, Criminal Activity)
    7. World / International (Geopolitics, Conflicts, International Diplomacy)
    8. Climate & Environment
    9. Health (Public Health, Epidemics, Medical Research, Wellness, Nutrition)
    10. Culture (Music, Festivals)

    ⚠️ CRITICAL QUANTITY REQUIREMENTS ⚠️
    
    YOU MUST PROVIDE A MINIMUM OF 5-8 NEWS STORIES PER CATEGORY.
    
    This is NOT optional. Each category must have substantial coverage.
    - If you find only 1-2 stories for a category, you have NOT searched thoroughly enough
    - Perform additional searches with different keywords for that category
    - Look for news from multiple sources and perspectives
    - Include both major headlines AND important secondary stories
    
    EXAMPLE: For "Politics" category, search for:
    - "${region} politics news today"
    - "${region} government latest"
    - "${region} elections"
    - "${region} parliament"
    - "${region} political parties"
    - etc.
    
    Then combine ALL results into the Politics category with 5-8 distinct stories.

    FOR EACH STORY YOU MUST INCLUDE:
    - A 1–2 sentence neutral English summary
    - The REAL sourceName from Google Search results (e.g., "BBC News", "Reuters", "The Guardian")
    - The REAL sourceUrl (the exact URL from the search result)

    CRITICAL SOURCE RULES:
    - All sources MUST come directly from Google Search results
    - NO placeholders like "example.com"
    - NO fabricated URLs or outlet names
    - If a story has no verifiable real source, exclude it entirely

    OUTPUT FORMAT - Return ONLY valid JSON (no Markdown, no comments):

    {
      "topics": [
        {
          "category": "Politics",
          "points": [
            {
              "summary": "1–2 sentence neutral summary",
              "sourceName": "REAL source name from search results",
              "sourceUrl": "REAL URL from search results"
            },
            ... (repeat for 10-20 stories)
          ]
        },
        ... (repeat for each category with news)
      ]
    }
    
    FINAL REMINDER: 
    - Each category MUST have 10-20 items in the "points" array
    - Returning only 1-3 stories per category is UNACCEPTABLE
    - Search thoroughly and aggregate extensively
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // Use Grounding to fetch real news
        // Note: responseMimeType: "application/json" and responseSchema are NOT supported 
        // when using tools/grounding in the current API version.
        systemInstruction: "You are a professional news aggregator. Output strictly valid JSON. Ensure all content is in English regardless of the region's native language.",
      },
    });

    let text = response.text;
    if (!text) {
      throw new Error("No response generated from Gemini.");
    }

    console.log("[DEBUG] Raw response length:", text.length);
    console.log("[DEBUG] First 200 chars:", text.substring(0, 200));

    // Clean up potential markdown code blocks if the model adds them
    text = text.trim();
    
    // Remove markdown code blocks
    if (text.startsWith("```json")) {
      text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (text.startsWith("```")) {
      text = text.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }
    
    // Try to extract JSON if there's text before/after it
    // Look for the first { and last }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      text = text.substring(firstBrace, lastBrace + 1);
      console.log("[DEBUG] Extracted JSON from position", firstBrace, "to", lastBrace);
    }
    
    text = text.trim();
    console.log("[DEBUG] Cleaned text length:", text.length);
    console.log("[DEBUG] First 200 chars after cleaning:", text.substring(0, 200));

    let data: NewsResponse;
    try {
      data = JSON.parse(text) as NewsResponse;
    } catch (parseError) {
      console.error("[ERROR] JSON Parse failed");
      console.error("[ERROR] Text that failed to parse (first 500 chars):", text.substring(0, 500));
      console.error("[ERROR] Parse error:", parseError);
      throw parseError;
    }

    // Filter out empty topics just in case
    data.topics = data.topics.filter(topic => topic.points && topic.points.length > 0);

    // Update Cache
    newsCache.set(region, { data, timestamp: now });

    return data;
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Re-throw the error so the UI can show it, or throw a user-friendly message
    if (error instanceof Error) {
        throw new Error(`Failed to fetch news: ${error.message}`);
    }
    throw new Error("Failed to fetch and summarize news. Please try again.");
  }
};