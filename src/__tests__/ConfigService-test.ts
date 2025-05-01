import ConfigService, {CONFIG_PATH, DEFAULT_CONFIG} from '../ConfigService';
import {jest} from '@jest/globals';
import {PathLike} from 'fs';

function getInstance() {
  const mockFileSystem = {
    readFile: jest.fn<(path: PathLike, encoding: BufferEncoding) => Promise<string>>(),
    writeFile: jest.fn<(path: PathLike, data: string, encoding: BufferEncoding) => Promise<void>>(),
    mkdir: jest.fn<(path: PathLike, options: { recursive: boolean }) => Promise<void>>(),
    access: jest.fn<(path: PathLike) => Promise<void>>(),
  };

  const configService = new ConfigService(mockFileSystem as any);

  return {configService, mockFileSystem};
}

describe('Config', () => {
  describe('getConfig', () => {
    it('should return the parsed config if the file exists and is valid', async () => {
      const {configService, mockFileSystem} = getInstance();
      const mockConfig = {apiKey: 'test-key', ignoreFiles: ['node_modules'], model: 'gpt-4.1-nano'};
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(mockConfig));

      const result = await configService.getConfig();

      expect(mockFileSystem.readFile).toHaveBeenCalledWith(CONFIG_PATH, 'utf-8');
      expect(result).toEqual(mockConfig);
    });

    it('should return the default config if the file does not exist', async () => {
      const {configService, mockFileSystem} = getInstance();
      mockFileSystem.readFile.mockRejectedValue({code: 'ENOENT'});

      const result = await configService.getConfig();

      expect(mockFileSystem.readFile).toHaveBeenCalledWith(CONFIG_PATH, 'utf-8');
      expect(result).toEqual(DEFAULT_CONFIG);
    });

    it('should return the default config if the file contains invalid JSON', async () => {
      const {configService, mockFileSystem} = getInstance();
      mockFileSystem.readFile.mockResolvedValue('invalid-json');

      const result = await configService.getConfig();

      expect(mockFileSystem.readFile).toHaveBeenCalledWith(CONFIG_PATH, 'utf-8');
      expect(result).toEqual(DEFAULT_CONFIG);
    });
  });

  describe('updateConfig', () => {
    it('should update the config with the provided function', async () => {
      const {configService, mockFileSystem} = getInstance();
      const mockConfig = {apiKey: 'test-key', ignoreFiles: []};
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(mockConfig));
      mockFileSystem.writeFile.mockResolvedValue(undefined);

      const newConfig = {apiKey: 'new-key', ignoreFiles: ['dist'], model: 'gpt-3.5-turbo'};
      await configService.updateConfig(() => newConfig);

      expect(mockFileSystem.writeFile).toHaveBeenCalledWith(
        CONFIG_PATH,
        JSON.stringify(newConfig, null, 2),
        'utf-8'
      );
    });
  });

  describe('saveConfig', () => {
    it('should create the config directory if it does not exist and save the config', async () => {
      const {configService, mockFileSystem} = getInstance();
      mockFileSystem.access.mockRejectedValue({code: 'ENOENT'});
      mockFileSystem.mkdir.mockResolvedValue(undefined);
      mockFileSystem.writeFile.mockResolvedValue(undefined);

      const newConfig = {apiKey: 'test-key', ignoreFiles: [], model: 'gpt-3.5-turbo'};
      await configService.saveConfig(newConfig);

      expect(mockFileSystem.mkdir).toHaveBeenCalledWith(expect.any(String), {recursive: true});
      expect(mockFileSystem.writeFile).toHaveBeenCalledWith(
        CONFIG_PATH,
        JSON.stringify(newConfig, null, 2),
        'utf-8'
      );
    });

    it('should save the config if the directory already exists', async () => {
      const {configService, mockFileSystem} = getInstance();
      mockFileSystem.access.mockResolvedValue(undefined);
      mockFileSystem.writeFile.mockResolvedValue(undefined);

      const newConfig = {apiKey: 'test-key', ignoreFiles: [], model: 'gpt-3.5-turbo'};
      await configService.saveConfig(newConfig);

      expect(mockFileSystem.mkdir).not.toHaveBeenCalled();
      expect(mockFileSystem.writeFile).toHaveBeenCalledWith(
        CONFIG_PATH,
        JSON.stringify(newConfig, null, 2),
        'utf-8'
      );
    });
  });

  describe('getChatGptApiKey', () => {
    it('should return the API key from the environment variable if it exists', async () => {
      const {configService} = getInstance();
      process.env.OPENAI_API_KEY = 'env-key';

      const result = await configService.getChatGptApiKey();

      expect(result).toBe('env-key');
      delete process.env.OPENAI_API_KEY;
    });

    it('should return the API key from the config if the environment variable does not exist', async () => {
      const {configService, mockFileSystem} = getInstance();
      const mockConfig = {apiKey: 'config-key', ignoreFiles: [], model: 'gpt-4.1-nano'};
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(mockConfig));

      const result = await configService.getChatGptApiKey();

      expect(result).toBe('config-key');
    });

    it('should return null if no API key is found', async () => {
      const {configService, mockFileSystem} = getInstance();
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(DEFAULT_CONFIG));

      const result = await configService.getChatGptApiKey();

      expect(result).toBeNull();
    });
  });

  describe('saveChatGptApiKey', () => {
    it('should save the API key to the config', async () => {
      const {configService, mockFileSystem} = getInstance();
      const mockConfig = {apiKey: null, ignoreFiles: [], model: 'gpt-4.1-nano'};
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(mockConfig));
      mockFileSystem.writeFile.mockResolvedValue(undefined);

      await configService.saveChatGptApiKey('new-key');

      expect(mockFileSystem.writeFile).toHaveBeenCalledWith(
        CONFIG_PATH,
        JSON.stringify({apiKey: 'new-key', ignoreFiles: [], model: 'gpt-4.1-nano'}, null, 2),
        'utf-8'
      );
    });
  });
});