import OpenAI from 'openai';

class ChatGptClient extends OpenAI {
  constructor(chatGptApiKey: string) {
    super({apiKey: chatGptApiKey});
  }

  async analyzeChanges(diff: string) {
    const response = await this.responses.create({
      model: 'gpt-4o-mini',
      instructions: 'Analyze the git diff and generate a short summary of the changes.',
      input: diff
    }, {
      timeout: 10000
    });

    return response.output_text;
  }

  async analyzeRisks(diff: string) {
    const response = await this.responses.create({
      model: 'gpt-4o-mini',
      instructions: 'Analyze the git diff and generate a short summary of potential problems/risks.',
      input: diff
    }, {
      timeout: 10000
    });

    return response.output_text;
  }
}

export default ChatGptClient;