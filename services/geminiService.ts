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
    Find the latest and most significant news for the region: "${region}".
    Focus on events from the last 24 hours.
    
    Group the news into these specific categories if available:
    1. Breaking News
    2. Politics
    3. Business & Economy
    4. Technology
    5. Sport
    6. Culture / Lifestyle

    For each category, provide 3 to 6 distinct news stories.
    Summarize each story in 1-2 neutral English sentences.
    You MUST provide the Source Name and Source URL for every story based on the search results.

    IMPORTANT: Output the result strictly as a valid JSON object matching this structure:
    {
      "topics": [
        {
          "category": "string (e.g. Politics)",
          "points": [
            {
              "summary": "string (1-2 sentence summary)",
              "sourceName": "string (Source Name)",
              "sourceUrl": "string (Source URL)"
            }
          ]
        }
      ]
    }
    
    Do not use Markdown code blocks. Just return the raw JSON string.
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

    // Clean up potential markdown code blocks if the model adds them
    text = text.trim();
    if (text.startsWith("```json")) {
      text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (text.startsWith("```")) {
      text = text.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const data = JSON.parse(text) as NewsResponse;

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