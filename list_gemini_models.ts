import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY not found in .env.local');
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    const result = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const data = await result.json();
    console.log('Available models:');
    if (data.models) {
      data.models.forEach((m: any) => {
        console.log(`- ${m.name} (Supported actions: ${m.supportedGenerationMethods.join(', ')})`);
      });
    } else {
      console.log('No models found or error:', data);
    }
  } catch (error) {
    console.error('Error listing models:', error);
  }
}

listModels();
