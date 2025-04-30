import OpenAI from 'openai';

class ChatGptClient extends OpenAI {
  constructor(chatGptApiKey: string) {
    super({apiKey: chatGptApiKey});
  }

  async analyzeDiff(diff: string) {
    const response = await this.responses.create({
      model: 'gpt-4o-mini',
      instructions: 'Analyze the git diff and generate a summary of the changes.',
      input: diff
    }, {
      timeout: 10000
    });

    return response.output_text;
  }
}

export default ChatGptClient;