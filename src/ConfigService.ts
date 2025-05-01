import asyncFs from 'fs/promises';
import path from 'path';
import os from 'os';
import {constants} from 'fs';

export const CONFIG_PATH = path.join(os.homedir(), '.git-summary-cli', 'config.json');
export const DEFAULT_CONFIG = Object.freeze({
  apiKey: null,
  ignoreFiles: [],
  model: 'gpt-4.1-nano'
});

export type ConfigType = {
  apiKey: string | null;
  ignoreFiles: string[];
  model: string;
};

class ConfigService {
  constructor(private fileSystem = asyncFs) {}

  async getConfig(): Promise<ConfigType> {
    let data: string;
    try {
      data = await this.fileSystem.readFile(CONFIG_PATH, 'utf-8');
    } catch (error) {
      console.warn('⚠️ Failed to read config file. Returning default config.', error);
      return DEFAULT_CONFIG;
    }

    try {
      return {...DEFAULT_CONFIG, ...JSON.parse(data)};
    } catch (error) {
      console.warn('⚠️ Failed to parse config file. Returning default config.', error);
      return DEFAULT_CONFIG;
    }
  }

  async updateConfig(getNewConfig: (currentConfig: ConfigType) => ConfigType): Promise<void> {
    const config = await this.getConfig();
    const newConfig = getNewConfig(config) || DEFAULT_CONFIG;
    await this.saveConfig(newConfig);
  }

  async saveConfig(config: ConfigType): Promise<void> {
    const configFileExists = await this.configFileExists();
    if (!configFileExists) {
      console.warn('⚠️ Config file does not exist. Creating a new one.');
      try {
        await this.fileSystem.mkdir(path.dirname(CONFIG_PATH), {recursive: true});
      } catch (error) {
        console.error('❌ Failed to create config directory.', error);
        return;
      }
    }
  
    try {
      await this.fileSystem.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
      console.info('✅ Config saved.');
    } catch (error) {
      console.error('❌ Failed to save config file.', error);
    }
  }

  async getChatGptApiKey(): Promise<string | null> {
    const envKey = process.env.OPENAI_API_KEY;
    if (envKey) {
      console.info('✅ Using API key from environment variable.');
      return envKey
    };
  
    const config = await this.getConfig();
    return config.apiKey;
  }

  async saveChatGptApiKey(apiKey: string): Promise<void> {
    await this.updateConfig((config) => ({...config, apiKey}))
  }

  private async configFileExists(): Promise<boolean> {
    try {
      await this.fileSystem.access(CONFIG_PATH, constants.F_OK);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default ConfigService;
