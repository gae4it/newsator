import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";

// In-memory cache to store results for 30 minutes
const CACHE_DURATION_MS = 30 * 60 * 1000;
const newsCache: Map<string, { data: any; timestamp: number }> = new Map();

/**
 * Helper to clean and parse JSON from AI responses
 */
function parseJSONResponse(text: string, cacheKey: string): any {
  let cleanedText = text.trim();

  // Remove markdown code blocks
  if (cleanedText.startsWith("```json")) {
    cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleanedText.startsWith("```")) {
    cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  // Extract JSON if there's text before/after it
  const firstBrace = cleanedText.indexOf("{");
  const lastBrace = cleanedText.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
  }

  cleanedText = cleanedText.trim();

  try {
    const data = JSON.parse(cleanedText);
    // Validate data structure
    if (!data.points || !Array.isArray(data.points)) {
      throw new Error("Invalid structure: missing 'points' array");
    }
    if (data.points.length === 0) {
      throw new Error("No news points returned from API");
    }
    return data;
  } catch (parseError) {
    console.error("[ERROR] JSON Parse failed for", cacheKey, "Text snippet:", cleanedText.substring(0, 100));
    throw new Error("Failed to parse API response as valid JSON");
  }
}

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
    return { statusCode: 200, headers, body: "" };
  }

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  try {
    // Parse request body
    const { region, category, mode = "Summary", model = "Gemini 1.5", excludeTitles = [], language = "English" } = JSON.parse(event.body || "{}");

    if (!region || !category) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing region or category" }) };
    }

    // Check cache (only for initial loads)
    const isInitialLoad = excludeTitles.length === 0;
    const cacheKey = `${region}-${category}-${mode}-${model}-${language}`;
    const now = Date.now();

    if (isInitialLoad) {
      const cached = newsCache.get(cacheKey);
      if (cached && now - cached.timestamp < CACHE_DURATION_MS) {
        console.log(`[Cache Hit] Returning cached news for ${cacheKey}`);
        return { statusCode: 200, headers, body: JSON.stringify(cached.data) };
      }
    }

    // AI Setup
    const apiKey = process.env.GEMINI_API_KEY;
    const orApiKey = process.env.OPENROUTER_API_KEY;

    const isOverview = mode === "Overview";
    const itemCount = 10;
    const prompt = `
      Fetch the latest news for:
      Region: ${region}
      Category: ${category}
      Mode: ${mode}
      Batch: ${isInitialLoad ? "Initial" : "Additional"}
      
      REQUIREMENTS:
      - LANGUAGE: EVERYTHING (titles and summaries) MUST BE IN ${language.toUpperCase()}.
      - QUANTITY: Return exactly ${itemCount} items.
      - NO-REPEAT: DO NOT include any of these stories: [${excludeTitles.join(", ")}].
      - PRIORITY: National News Agencies / Wires.
      - OUTPUT: ${isOverview ? "ONLY Titles and REAL Source Names/URLs. No descriptions." : "Title, neutral Summary (max 2 sentences), and REAL Source Name/URL."}
      
      JSON FORMAT:
      {
        "points": [
          {
            "summary": "${isOverview ? "Title in " + language : "Summary in " + language}",
            "title": "Story headline in " + language,
            "sourceName": "Source",
            "sourceUrl": "URL"
          }
        ]
      }
    `;

    let finalData;

    // Route based on model selection
    if (model.includes("Gemini")) {
      if (!apiKey) throw new Error("Gemini API Key is not configured.");
      
      const ai = new GoogleGenAI({ apiKey });
      const modelMapping: Record<string, string> = {
        "Gemini 1.5": "gemini-1.5-flash-latest",
        "Gemini 2.0": "gemini-2.0-flash-lite",
      };
      const targetModel = modelMapping[model] || "gemini-1.5-flash-latest";

      const response = await ai.models.generateContent({
        model: targetModel,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        tools: [{ googleSearch: {} }],
        systemInstruction: `You are a professional news aggregator. Output strictly valid JSON. Always translate EVERYTHING to ${language}.`,
      });

      const rawText = response.response.text();
      finalData = parseJSONResponse(rawText, cacheKey);

    } else {
      // OpenRouter Branch
      if (!orApiKey) throw new Error("OpenRouter API Key is not configured.");

      const orModelMapping: Record<string, string> = {
        "Llama 3": "meta-llama/llama-3.1-8b-instruct:free",
        "Mistral": "mistralai/mistral-7b-instruct:free"
      };
      const orModel = orModelMapping[model] || orModelMapping["Llama 3"];

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${orApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: orModel,
          messages: [
            { role: "system", content: `You are a professional news aggregator. Output strictly valid JSON. Always translate EVERYTHING to ${language}.` },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`OpenRouter Error: ${res.status} ${errorBody}`);
      }

      const result = await res.json();
      const rawText = result.choices[0]?.message?.content;
      if (!rawText) throw new Error("Empty response from OpenRouter");
      finalData = parseJSONResponse(rawText, cacheKey);
    }

    // Final cache and return
    newsCache.set(cacheKey, { data: finalData, timestamp: now });
    return { statusCode: 200, headers, body: JSON.stringify(finalData) };

  } catch (error) {
    console.error("API Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
    };
  }
};
