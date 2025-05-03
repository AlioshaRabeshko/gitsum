import OpenAI from 'openai';
import {encoding_for_model, TiktokenModel} from '@dqbd/tiktoken';

export const CHAT_GPT_TIMEOUT = 20000;

const DEFAULT_TOKEN_LIMIT = 4096;
const TOKEN_LIMITS_BY_MODEL: Record<'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4.1-mini', number> = {
  'gpt-3.5-turbo': DEFAULT_TOKEN_LIMIT,
  'gpt-4': 8192,
  'gpt-4.1-mini': 8192,
};

class ChatGptService extends OpenAI {
  constructor(chatGptApiKey: string, private model: string) {
    super({apiKey: chatGptApiKey});
  }

  async analyzeChanges(diff: string) {
    return await this.analyze(diff, 'Analyze the git diff and generate a short summary of the changes.');
  }

  async analyzeRisks(diff: string) {
    return await this.analyze(diff, 'Analyze the git diff and generate a short summary of potential problems/risks.');
  }

  async customPrompt(diff: string, prompt: string) {
    return await this.analyze(diff, prompt);
  }

  private async analyze(diff: string, instructions: string) {
    const responses: string[] = [];
    
    const diffChunks = this.chunkDiff(diff);
    for (const chunk of diffChunks) {
      const response = await this.responses.create({
        model: this.model,
        instructions,
        input: chunk
      }, {
        timeout: CHAT_GPT_TIMEOUT
      });

      responses.push(response.output_text);
    }

    if (responses.length === 1) {
      return responses[0];
    }

    const response = await this.responses.create({
      model: this.model,
      instructions: `The git diff has been split into different openai requests
The prompt for each request was: ${instructions}.
Combine the following responses into a single response, removing any duplicates and irrelevant information.`,
      input: responses.join('\n\n')
    }, {
      timeout: CHAT_GPT_TIMEOUT
    });

    return response.output_text;
  }

  private chunkDiff(diff: string) {
    const tokenLimit = this.getTokenLimit();
    const tokensCount = this.getTokensCount(diff);
    if (tokensCount <= tokenLimit) {
      return [diff];
    }

    const sections = diff.split(/^diff --git /gm).filter(Boolean);
    const chunks: string[] = [];
    let currentChunk = '';
    for (const section of sections) {
      const sectionLength = this.getTokensCount(section);
      if (this.getTokensCount(currentChunk) + sectionLength > tokenLimit) {
        chunks.push(currentChunk);
        currentChunk = '';
      }
      currentChunk += `diff --git ${section}\n`;
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  private getTokenLimit() {
    return TOKEN_LIMITS_BY_MODEL[this.model as keyof typeof TOKEN_LIMITS_BY_MODEL] || DEFAULT_TOKEN_LIMIT;
  }

  private getTokensCount(text: string) {
    const enc = encoding_for_model(this.model as TiktokenModel);
    const tokenCount = enc.encode(text).length;
    enc.free();
    return tokenCount;
  }
}

export default ChatGptService;