import fs from 'fs';
import path from 'path';
import os from 'os';

// Define config path
export const CONFIG_PATH = path.join(os.homedir(), '.git-summary-cli', 'config.json');

export function getConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
    try {
      const parsed = JSON.parse(data);
      return parsed || {};
    } catch {
      return {};
    }
  }

  return {};
}

export function getChatGptApiKey(): string | null {
  const envKey = process.env.OPENAI_API_KEY;
  if (envKey) {
    return envKey
  };

  return getConfig().apiKey;
}

export function saveChatGptApiKey(apiKey: string): void {
  const config = getConfig();
  config.apiKey = apiKey;
  saveConfig(config);
}

export function saveConfig(config: Record<string, any>): void {
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {recursive: true})
  };

  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
  console.info('✅ Config saved.');
}

export default getChatGptApiKey;
