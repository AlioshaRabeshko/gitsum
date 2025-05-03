import ChatGptService from './ChatGptService';
import ConfigService from './ConfigService';
import GitDiffService from './GitDiffService';

class MainController {
  constructor(
    private configService: ConfigService,
    private chatGptService: ChatGptService,
    private gitDiffService: GitDiffService,
    private onError: (error?: any) => void,
    private onSuccess: (message?: string) => void,
  ) {}

  async setKey(apiKey: string) {
    if (!apiKey) {
      this.onError('❌ Please provide an OpenAI API key.');
      return;
    }

    try {
      await this.configService.saveChatGptApiKey(apiKey);
      this.onSuccess('✅ API key saved to config.');
    } catch (error) {
      this.onError(`Failed to save API key: ${error}`);
    }
  }

  async setModel(model: string) {
    if (!model) {
      this.onError('❌ Please provide a model name.');
      return;
    }

    try {
      await this.configService.updateConfig((currentConfig) => ({...currentConfig, model}));
      this.onSuccess(`✅ Model "${model}" has been set.`);
    } catch (error) {
      this.onError(`Failed to update config: ${error}`);
    }
  }

  async addIgnoreFile(fileToIgnore: string) {
    if (!fileToIgnore) {
      this.onError('❌ Please provide a file to ignore.');
      return;
    }

    try {
      await this.configService.updateConfig((currentConfig) => {
        const newIgnoreFiles = [...new Set([...currentConfig.ignoreFiles, fileToIgnore])];
        return {...currentConfig, ignoreFiles: newIgnoreFiles};
      });
      this.onSuccess(`✅ File ${fileToIgnore} has been added to ignore list.`);
    } catch (error) {
      this.onError(`Failed to update config: ${error}`);
    }
  }

  async removeIgnoreFile(fileToIgnore: string) {
    if (!fileToIgnore) {
      this.onError('❌ Please provide a file to unignore.');
      return;
    }

    try {
      await this.configService.updateConfig((currentConfig) => {
        const newIgnoreFiles = currentConfig.ignoreFiles.filter((file) => file !== fileToIgnore);
        return {...currentConfig, ignoreFiles: newIgnoreFiles};
      });
      this.onSuccess(`✅ File ${fileToIgnore} has been removed from ignore list.`);
    } catch (error) {
      this.onError(`❌ Failed to update config:, ${error}`);
    }
  }

  async getIgnoreList() {
    try {
      const config = await this.configService.getPublicConfig();
      this.onSuccess(`✅ Ignore list: ${config.ignoreFiles.join(', ')}`);
    } catch (error) {
      this.onError(`❌ Failed to retrieve ignore list: ${error}`);
    }
  }

  async setCustomPrompt(customPrompt: string) {
    if (!customPrompt) {
      this.onError('❌ Please provide a custom prompt.');
      return;
    }

    try {
      await this.configService.updateConfig((currentConfig) => ({...currentConfig, customPrompt}));
      this.onSuccess('✅ Custom prompt has been set.');
    } catch (error) {
      this.onError(`Failed to update config: ${error}`);
    }
  }

  async analyzeRisks(commits?: number, branches?: string[]) {
    try {
      const diff = await this.getFilteredDiff(commits, branches);
      if (!diff) {
        this.onError('❌ No changes detected.');
        return;
      }

      const risks = await this.chatGptService.analyzeRisks(diff);
      this.onSuccess(risks);
    } catch (error) {
      this.onError(`❌ Failed to analyze risks: ${error}`);
    }
  }

  async analyzeChanges(commits?: number, branches?: string[]) {
    try {
      const diff = await this.getFilteredDiff(commits, branches);
      if (!diff) {
        this.onError('❌ No changes detected.');
        return;
      }

      const analysis = await this.chatGptService.analyzeChanges(diff);
      this.onSuccess(analysis);
    } catch (error) {
      this.onError(`❌ Failed to analyze changes: ${error}`);
    }
  }

  async customPrompt(commits?: number, branches?: string[]) {
    const config = await this.configService.getPublicConfig();
    const prompt = config.customPrompt;
    if (!prompt) {
      this.onError('❌ Please set custom prompt using --set-custom or add into .gitsumsrc file.');
      return;
    }

    try {
      const diff = await this.getFilteredDiff(commits, branches);
      if (!diff) {
        this.onError('❌ No changes detected.');
        return;
      }

      const customResponse = await this.chatGptService.customPrompt(diff, prompt);
      this.onSuccess(customResponse);
    } catch (error) {
      this.onError(`❌ Failed to analyze changes: ${error}`);
    }
  }

  private async getFilteredDiff(commits?: number, branches?: string[]) {
    if (commits) {
      return this.gitDiffService.getCommitsDiff(commits);
    }

    if (branches) {
      return this.gitDiffService.getBranchesDiff(branches);
    }
  }
}

export default MainController;
