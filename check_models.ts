import fs from 'fs';
import path from 'path';

// Simple .env parser
const parseEnv = () => {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    const content = fs.readFileSync(envPath, 'utf-8');
    const env: Record<string, string> = {};
    content.split('\n').forEach((line) => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        env[match[1].trim()] = match[2].trim();
      }
    });
    return env;
  } catch {
    console.error('Could not read .env.local');
    return {};
  }
};

const main = async () => {
  const env = parseEnv();
  const apiKey = env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('No GEMINI_API_KEY found in .env.local');
    process.exit(1);
  }

  console.log('Checking models with API Key starting with:', apiKey.substring(0, 8) + '...');

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error('API Error:', JSON.stringify(data.error, null, 2));
    } else {
      console.log('Available Models:');
      data.models?.forEach(
        (m: { name: string; version?: string; supportedGenerationMethods?: string[] }) => {
          if (m.name.includes('flash') || m.name.includes('gemini')) {
            console.log(
              `- ${m.name} (${m.version || 'unknown'}) [Methods: ${m.supportedGenerationMethods?.join(', ') || 'N/A'}]`
            );
          }
        }
      );
    }
  } catch (e) {
    console.error('Fetch error:', e);
  }
};

main();
