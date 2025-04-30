import fs from 'fs';
import path from 'path';
import os from 'os';

// Define config path
export const CONFIG_PATH = path.join(os.homedir(), '.git-summary-cli', 'config.json');

export function getChatGptApiKey(): string | null {
  const envKey = process.env.OPENAI_API_KEY;
  if (envKey) {
    return envKey
  };

  if (fs.existsSync(CONFIG_PATH)) {
    const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
    try {
      const parsed = JSON.parse(data);
      return parsed.apiKey || null;
    } catch {
      return null;
    }
  }

  return null;
}

export function saveChatGptApiKey(apiKey: string): void {
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});

  const config = {apiKey};
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
  console.info('✅ OpenAI API key saved.');
}

export default getChatGptApiKey;
