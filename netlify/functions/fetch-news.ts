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
    return data;
  } catch (parseError) {
    console.error("[ERROR] JSON Parse failed for", cacheKey, "Text snippet:", cleanedText.substring(0, 100));
    throw new Error("Failed to parse AI response as valid JSON");
  }
}

export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) };

  try {
    const body = JSON.parse(event.body || "{}");
    const { region, category, mode = "Summary", model = "Gemini 1.5", excludeTitles = [], language = "English" } = body;

    if (!region || !category) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing region or category" }) };
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
      - OUTPUT: ${isOverview ? "ONLY Titles and REAL Source Names/URLs" : "Title, neutral Summary, and REAL Source Name/URL."}
      
      JSON FORMAT:
      {
        "points": [
          {
            "summary": "Full summary in ${language}",
            "title": "Story headline in ${language}",
            "sourceName": "Source",
            "sourceUrl": "URL"
          }
        ]
      }
    `;

    let finalData;

    if (model.includes("Gemini")) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY not found");

      const gemini = new GoogleGenAI({ apiKey });
      const geminiModelId = model === "Gemini 2.0" ? "gemini-2.0-flash-lite" : "gemini-1.5-flash-latest";
      const genModel = gemini.models.get(geminiModelId);

      const result = await genModel.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        tools: [{ googleSearch: {} }] as any,
        systemInstruction: `You are a professional news aggregator. Output strictly valid JSON. Always translate EVERYTHING to ${language}.`
      } as any);

      finalData = parseJSONResponse(result.response.text(), cacheKey);
    } else {
      const orApiKey = process.env.OPENROUTER_API_KEY;
      if (!orApiKey) throw new Error("OPENROUTER_API_KEY not found");

      const orModelId = model === "Mistral" 
        ? "mistralai/mistral-7b-instruct" 
        : "meta-llama/llama-3.1-8b-instruct";

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${orApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: orModelId,
          messages: [
            { role: "system", content: `You are a professional news aggregator. Output strictly valid JSON. Always translate EVERYTHING to ${language}.` },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
      }

      const json = await response.json();
      finalData = parseJSONResponse(json.choices[0]?.message?.content || "", cacheKey);
    }

    newsCache.set(cacheKey, { data: finalData, timestamp: now });
    return { statusCode: 200, headers, body: JSON.stringify(finalData) };

  } catch (error: any) {
    console.error("Aggregation Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || "Internal server error" }),
    };
  }
};
