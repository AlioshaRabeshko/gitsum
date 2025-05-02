import asyncFs from 'fs/promises';
import path from 'path';
import os from 'os';
import {constants} from 'fs';

export const CONFIG_PATH = path.join(os.homedir(), '.git-summary-cli', 'config.json');
export const DEFAULT_CONFIG = Object.freeze({
  apiKey: null,
  ignoreFiles: [],
  model: 'gpt-4.1-nano',
  customPrompt: ''
});
export const LOCAL_CONFIG_NAME = '.gitsumsrc';

export type ConfigType = {
  apiKey: string | null;
  ignoreFiles: string[];
  model: string;
  customPrompt: string;
};

class ConfigService {
  constructor(
    private onSuccess: (message: string) => void,
    private onError: (error: string) => void,
    private fileSystem = asyncFs
  ) {}

  async getPublicConfig(): Promise<ConfigType> {
    const config = await this.getConfig();
    const gitsumsRcConfig = await this.getGitsumsRcConfig();
    return {...DEFAULT_CONFIG, ...config, ...gitsumsRcConfig};
  }

  async updateConfig(getNewConfig: (currentConfig: ConfigType) => ConfigType): Promise<void> {
    const config = await this.getConfig();
    const newConfig = getNewConfig(config) || DEFAULT_CONFIG;
    await this.saveConfig(newConfig);
  }

  async saveConfig(config: ConfigType): Promise<void> {
    const configFileExists = await this.fileExists(CONFIG_PATH);
    if (!configFileExists) {
      try {
        await this.fileSystem.mkdir(path.dirname(CONFIG_PATH), {recursive: true});
      } catch (error) {
        this.onError(`❌ Failed to create config directory: ${error}`);
        return;
      }
    }
  
    try {
      await this.fileSystem.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
      this.onSuccess('✅ Config saved successfully.');
    } catch (error) {
      this.onError(`Failed to save config: ${error}`);
    }
  }

  async getChatGptApiKey(): Promise<string> {
    const envKey = process.env.OPENAI_API_KEY;
    if (envKey) {
      this.onSuccess('✅ Using API key from environment variable.');
      return envKey
    };
  
    const config = await this.getConfig();
    if (!config.apiKey) {
      this.onError('❌ No API key found. Please set it using the --set-key option.');
      throw new Error('API key is required.');
    }

    return config.apiKey;
  }

  async saveChatGptApiKey(apiKey: string): Promise<void> {
    await this.updateConfig((config) => ({...config, apiKey}))
  }

  private async getConfig(): Promise<ConfigType> {
    let data: string;
    try {
      data = await this.fileSystem.readFile(CONFIG_PATH, 'utf-8');
    } catch (error) {
      this.onError(`❌ Failed to read config file. Returning default config. ${error}`);
      return DEFAULT_CONFIG;
    }


    try {
      return {...DEFAULT_CONFIG, ...JSON.parse(data)};
    } catch (error) {
      this.onError(`❌ Failed to parse config file. Returning default config. ${error}`);
      return DEFAULT_CONFIG;
    }
  }

  private async fileExists(path: string): Promise<boolean> {
    try {
      await this.fileSystem.access(path, constants.F_OK);
      return true;
    } catch (error) {
      return false;
    }
  }

  private async getGitsumsRcConfig(): Promise<Partial<ConfigType>> {
    if (!(await this.fileExists(LOCAL_CONFIG_NAME))) {
      return {};
    }

    const gitsumsRcPath = path.join(process.cwd(), LOCAL_CONFIG_NAME);
    try {
      const data = await this.fileSystem.readFile(gitsumsRcPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      this.onError(`❌ Failed to read .gitsumsrc file. Returning default config. ${error}`);
      return {};
    }
  } 
}

export default ConfigService;
