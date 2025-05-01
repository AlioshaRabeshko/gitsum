import ChatGptService, {CHAT_GPT_TIMEOUT} from '../ChatGptService';

const MOCK_MODEL = 'gpt-3.5-turbo';

function getInstance() {
  const mockApiKey = 'test-api-key';
  const chatGptService = new ChatGptService(mockApiKey, MOCK_MODEL);
  const mockCreateResponse = jest.fn();
  // @ts-expect-error
  chatGptService.responses = {create: mockCreateResponse}
  return {chatGptService, mockCreateResponse};
}

describe('ChatGptService', () => {
  describe('analyzeChanges', () => {
    it('should return a summary of changes for a valid diff', async () => {
      const {chatGptService, mockCreateResponse} = getInstance();
      const mockDiff = 'diff --git a/file1.txt b/file1.txt\n--- a/file1.txt\n+++ b/file1.txt\n@@ -1 +1 @@\n-Hello\n+Hi';
      const mockResponse = {output_text: 'Summary of changes: Updated greeting in file1.txt.'};

      mockCreateResponse.mockResolvedValue(mockResponse);

      const result = await chatGptService.analyzeChanges(mockDiff);

      expect(mockCreateResponse).toHaveBeenCalledWith(
        {
          model: MOCK_MODEL,
          instructions: 'Analyze the git diff and generate a short summary of the changes.',
          input: mockDiff,
        },
        {timeout: CHAT_GPT_TIMEOUT}
      );
      expect(result).toBe(mockResponse.output_text);
    });

    it('should return an empty string for an empty diff', async () => {
      const {chatGptService, mockCreateResponse} = getInstance();
      const mockDiff = '';
      const mockResponse = {output_text: ''};

      mockCreateResponse.mockResolvedValue(mockResponse);

      const result = await chatGptService.analyzeChanges(mockDiff);

      expect(mockCreateResponse).toHaveBeenCalledWith(
        {
          model: MOCK_MODEL,
          instructions: 'Analyze the git diff and generate a short summary of the changes.',
          input: mockDiff,
        },
        {timeout: CHAT_GPT_TIMEOUT}
      );
      expect(result).toBe(mockResponse.output_text);
    });
  });

  describe('analyzeRisks', () => {
    it('should return a summary of risks for a valid diff', async () => {
      const {chatGptService, mockCreateResponse} = getInstance();
      const mockDiff = 'diff --git a/file2.txt b/file2.txt\n--- a/file2.txt\n+++ b/file2.txt\n@@ -1 +1 @@\n-World\n+Earth';
      const mockResponse = {output_text: 'Summary of risks: Potential issues with changing terminology in file2.txt.'};

      mockCreateResponse.mockResolvedValue(mockResponse);

      const result = await chatGptService.analyzeRisks(mockDiff);

      expect(mockCreateResponse).toHaveBeenCalledWith(
        {
          model: MOCK_MODEL,
          instructions: 'Analyze the git diff and generate a short summary of potential problems/risks.',
          input: mockDiff,
        },
        {timeout: CHAT_GPT_TIMEOUT}
      );
      expect(result).toBe(mockResponse.output_text);
    });

    it('should return an empty string for an empty diff', async () => {
      const {chatGptService, mockCreateResponse} = getInstance();
      const mockDiff = '';
      const mockResponse = {output_text: ''};

      mockCreateResponse.mockResolvedValue(mockResponse);

      const result = await chatGptService.analyzeRisks(mockDiff);

      expect(mockCreateResponse).toHaveBeenCalledWith(
        {
          model: MOCK_MODEL,
          instructions: 'Analyze the git diff and generate a short summary of potential problems/risks.',
          input: mockDiff,
        },
        {timeout: CHAT_GPT_TIMEOUT}
      );
      expect(result).toBe(mockResponse.output_text);
    });
  });

  describe('Error Handling', () => {
    it('should throw an error if the OpenAI API call fails', async () => {
      const {chatGptService, mockCreateResponse} = getInstance();
      const mockDiff = 'diff --git a/file3.txt b/file3.txt\n--- a/file3.txt\n+++ b/file3.txt\n@@ -1 +1 @@\n-Old\n+New';
      const mockError = new Error('OpenAI API error');

      mockCreateResponse.mockRejectedValue(mockError);

      await expect(chatGptService.analyzeChanges(mockDiff)).rejects.toThrow('OpenAI API error');
      await expect(chatGptService.analyzeRisks(mockDiff)).rejects.toThrow('OpenAI API error');
    });
  });
});