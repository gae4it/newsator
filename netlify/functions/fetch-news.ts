import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";

// In-memory cache to store results for 30 minutes
const CACHE_DURATION_MS = 30 * 60 * 1000;
const newsCache: Map<string, { data: any; timestamp: number }> = new Map();

export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    // Parse request body
    const { region, category } = JSON.parse(event.body || "{}");

    if (!region || !category) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing region or category" }),
      };
    }

    // Check cache
    const cacheKey = `${region}-${category}`;
    const cached = newsCache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < CACHE_DURATION_MS) {
      console.log(`[Cache Hit] Returning cached news for ${cacheKey}`);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(cached.data),
      };
    }

    // Get API key from environment variable (server-side only)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("API Key is not configured on server");
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
    You are a professional news aggregator. Fetch the latest news for:
    
    Region: ${region}
    Category: ${category}
    
    REQUIREMENTS:
    - Find 5-7 recent news stories from the last 24-72 hours
    - Focus specifically on "${category}" news for "${region}"
    - Provide neutral, factual summaries (1-2 sentences each)
    - Include REAL source names and URLs from Google Search results
    - NO placeholders or fabricated sources
    
    OUTPUT FORMAT - Return ONLY valid JSON:
    {
      "category": "${category}",
      "points": [
        {
          "summary": "Brief neutral summary of the news",
          "sourceName": "Real source name (e.g., BBC, Reuters)",
          "sourceUrl": "Real URL from search results"
        }
      ]
    }
    
    Return 5-7 items in the "points" array.
  `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // Use Grounding to fetch real news
        systemInstruction:
          "You are a professional news aggregator. Output strictly valid JSON. Ensure all content is in English regardless of the region's native language.",
      },
    });

    let text = response.text;
    if (!text) {
      throw new Error("No response generated from Gemini.");
    }

    console.log(`[DEBUG] Response for ${cacheKey}, length:`, text.length);

    // Clean up potential markdown code blocks
    text = text.trim();

    if (text.startsWith("```json")) {
      text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (text.startsWith("```")) {
      text = text.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    // Extract JSON if there's text before/after it
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      text = text.substring(firstBrace, lastBrace + 1);
    }

    text = text.trim();

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("[ERROR] JSON Parse failed for", cacheKey);
      console.error("[ERROR] Text that failed to parse:", text.substring(0, 500));
      throw new Error("Failed to parse API response");
    }

    // Validate data structure
    if (!data.points || data.points.length === 0) {
      throw new Error("No news points returned from API");
    }

    // Update cache
    newsCache.set(cacheKey, { data, timestamp: now });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
    };
  }
};
