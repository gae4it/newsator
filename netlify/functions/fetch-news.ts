import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";
import Parser from "rss-parser";

const parser = new Parser();

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
    let finalData;

    if (model.includes("Gemini")) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY not found");

      const gemini = new GoogleGenAI({ apiKey });
      const geminiModelId = model === "Gemini 2.0" ? "gemini-2.0-flash-lite" : "gemini-1.5-flash-latest";
      // Bypassing TS error with 'any' cast as the method exists at runtime but not in the currently inferred types
      const genModel = (gemini as any).getGenerativeModel({ 
        model: geminiModelId,
        systemInstruction: `You are a professional news aggregator. Output strictly valid JSON. Always translate EVERYTHING to ${language}.`
      });

      const prompt = `
        Fetch the latest news for:
        Region: ${region}
        Category: ${category}
        Mode: ${mode}
        
        REQUIREMENTS:
        - LANGUAGE: EVERYTHING MUST BE IN ${language.toUpperCase()}.
        - NO-REPEAT: DO NOT include: [${excludeTitles.join(", ")}].
        - OUTPUT: ${isOverview ? "ONLY Titles and Sources" : "Title, neutral Summary, and REAL Source Name/URL."}
        
        JSON FORMAT:
        { "points": [ { "summary": "...", "title": "...", "sourceName": "...", "sourceUrl": "..." } ] }
      `;

      const result = await genModel.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        tools: [{ googleSearch: {} }] as any
      } as any);

      finalData = parseJSONResponse(result.response.text(), cacheKey);
    } else {
      // RSS BRIDGE for OpenRouter models
      const orApiKey = process.env.OPENROUTER_API_KEY;
      if (!orApiKey) throw new Error("OPENROUTER_API_KEY not found");

      // 1. Fetch real news from Google News RSS
      const query = `${category} ${region}`;
      const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${language.toLowerCase()}`;
      const feed = await parser.parseURL(rssUrl);
      
      const realNewsItems = feed.items.slice(0, 15).map(item => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        contentSnippet: item.contentSnippet
      }));

      // 2. Use AI as editor
      const orModelId = model === "Mistral" 
        ? "mistralai/mistral-7b-instruct" 
        : "meta-llama/llama-3.1-8b-instruct";

      const orPrompt = `
        You are a professional news editor. I have provided raw news items from an RSS feed.
        Your task is to:
        1. Select the top ${itemCount} most relevant items.
        2. Summarize each news item into 1-2 clean sentences.
        3. Translate EVERYTHING to ${language}.
        4. Exclude these titles: [${excludeTitles.join(", ")}].
        
        RAW RSS DATA:
        ${JSON.stringify(realNewsItems)}

        JSON FORMAT:
        { "points": [ { "summary": "Full summary in ${language}", "title": "Headline in ${language}", "sourceName": "Actual Source Name", "sourceUrl": "Actual Link" } ] }
      `;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${orApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: orModelId,
          messages: [
            { role: "system", content: `You are a reliable news editor. Output strictly valid JSON and translate to ${language}.` },
            { role: "user", content: orPrompt }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) throw new Error(`OpenRouter API error: ${response.status}`);
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
