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
    const { region, category, mode = "Summary", model = "Gemini 1.5" } = JSON.parse(event.body || "{}");

    if (!region || !category) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing region or category" }),
      };
    }

    // Check cache
    const cacheKey = `${region}-${category}-${mode}-${model}`;
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

    // Get API key from environment variable
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("API Key is not configured on server");
    }

    const ai = new GoogleGenAI({ apiKey });

    // Map user-friendly model names to technical model names available in this environment
    const modelMapping: Record<string, string> = {
      "Gemini 1.5": "gemini-flash-latest",     // Stable alias, usually points to 1.5 or newest flash
      "Gemini 2.0": "gemini-2.0-flash-lite",   // Lite version often has more stable free quota
    };
    
    const targetModel = modelMapping[model] || "gemini-2.5-flash";

    const isOverview = mode === "Overview";
    const itemCount = isOverview ? "30-50" : "5-10";
    
    const prompt = `
    You are a professional news aggregator with access to Google Search. Fetch the latest news for:
    
    Region: ${region}
    Category: ${category}
    Mode: ${mode}
    
    REQUIREMENTS:
    - MODE: ${isOverview ? "OVERVIEW (Headline list)" : "SUMMARY (Detailed stories)"}
    - COUNT: Find and return ${itemCount} distinct news items from the last 24-100 hours.
    - PRIORITIZATION: 1. International/National News Agencies (Wire services like Reuters, AP, AFP, ANSA, DPA, EFE, Bloomberg). 2. Major Newspapers and Broadcasters.
    - TRANSLATION: Ensure all content is in English. Translate local headlines from "${region}" to English.
    - QUALITY: Provide the most relevant and high-profile stories first.
    
    ${isOverview 
      ? "- OUTPUT: For each item, provide ONLY a concise TITLE and the REAL Source Name/URL." 
      : "- OUTPUT: For each item, provide a TITLE, a 1-2 sentence neutral SUMMARY, and the REAL Source Name/URL."}
    
    OUTPUT FORMAT - Return ONLY valid JSON:
    {
      "category": "${category}",
      "mode": "${mode}",
      "points": [
        {
          "summary": "${isOverview ? "Just the headline title here" : "Brief neutral summary here"}",
          "title": "Headline title",
          "sourceName": "Real source name (e.g., Reuters, AP)",
          "sourceUrl": "Real URL"
        }
      ]
    }
    
    Return exactly ${itemCount} items in the "points" array. Ensure the "summary" field is used as requested.
  `;

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction:
          "You are a professional news aggregator. Output strictly valid JSON. Prioritize wire services (Reuters, AP, ANSA, etc.). Always translate to English.",
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
