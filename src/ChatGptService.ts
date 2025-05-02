import OpenAI from 'openai';

export const CHAT_GPT_TIMEOUT = 20000;

class ChatGptService extends OpenAI {
  constructor(chatGptApiKey: string, private model: string) {
    super({apiKey: chatGptApiKey});
  }

  async analyzeChanges(diff: string) {
    const response = await this.analyze(diff, 'Analyze the git diff and generate a short summary of the changes.');
    return response.output_text;
  }

  async analyzeRisks(diff: string) {
    const response = await this.analyze(diff, 'Analyze the git diff and generate a short summary of potential problems/risks.');
    return response.output_text;
  }

  async customPrompt(diff: string, prompt: string) {
    const response = await this.analyze(diff, prompt);
    return response.output_text;
  }

  private async analyze(diff: string, instructions: string) {
    const response = await this.responses.create({
      model: this.model,
      instructions,
      input: diff
    }, {
      timeout: CHAT_GPT_TIMEOUT
    });

    return response;
  }
}

export default ChatGptService;