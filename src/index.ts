import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import ConfigService from './ConfigService';
import ChatGptService from './ChatGptService';
import GitDiffService from './GitDiffService';
import MainController from './MainController';

enum ExitCodes {
  SUCCESS = 0,
  ERROR = 1
}

const argv = yargs(hideBin(process.argv))
  .option('commits', {
    alias: 'c',
    type: 'number',
    describe: 'Number of recent commits to include in diff',
  })
  .option('branches', {
    alias: 'b',
    type: 'array',
    describe: 'Compare two branches: --branches main feature',
  })
  .options('risks', {
    alias: 'r',
    type: 'boolean',
    describe: 'Analyze risks of changes (as an extra flag)',
  })
  .option('custom', {
    alias: 'C',
    type: 'boolean',
    describe: 'Custom ChatGPT prompt',
  })
  .option('from', {
    alias: 'f',
    type: 'string',
    describe: 'Get diff from a specific commit hash or branch',
  })
  .option('to', {
    alias: 't',
    type: 'string',
    describe: 'Get diff to a specific commit hash or branch',
  })
  .option('set-key', {
    alias: 'k',
    type: 'string',
    describe: 'Save OpenAI API key to config',
  })
  .option('set-model', {
    alias: 'm',
    type: 'string',
    describe: 'Set OpenAI model to use',
  })
  .option('ia', {
    type: 'string',
    describe: 'Add file to ignore list',
  })
  .option('ir', {
    type: 'string',
    describe: 'Remove file from ignore list',
  })
  .option('il', {
    type: 'array',
    describe: 'List of files to ignore',
  })
  .option('set-custom', {
    type: 'string',
    describe: 'Set custom prompt for ChatGPT',
  })
  .demandCommand(0)
  .help().argv as any;

async function main() {
  const configService = new ConfigService(console.info, console.error);
  const {ignoreFiles, model} = await configService.getPublicConfig();
  const apiKey = await configService.getChatGptApiKey();

  const gitDiffService = new GitDiffService(ignoreFiles, console.info, console.error);
  const chatGptService = new ChatGptService(apiKey, model);
  const mainController = new MainController(
    configService,
    chatGptService,
    gitDiffService,
    (error) => {
      console.error(error);
      process.exit(ExitCodes.ERROR);
    },
    (message) => {
      console.info(message);
      process.exit(ExitCodes.SUCCESS);
    }
  );

  if (argv.hasOwnProperty('set-key')) {
    return await mainController.setKey(argv['set-key']);
  }
  if (argv.hasOwnProperty('set-model')) {
    return await mainController.setModel(argv['set-model']);
  }
  if (argv.hasOwnProperty('ia')) {
    return await mainController.addIgnoreFile(argv['ia']);
  }
  if (argv.hasOwnProperty('ir')) {
    return await mainController.removeIgnoreFile(argv['ir']);
  }
  if (argv.hasOwnProperty('il')) {
    return await mainController.getIgnoreList();
  }
  if (argv.hasOwnProperty('set-custom')) {
    return await mainController.setCustomPrompt(argv['set-custom']);
  }

  const branches = argv['branches'] || [argv['from'], argv['to']];
  if (argv['custom']) {
    return await mainController.customPrompt(argv['commits'], branches);
  }
  if (argv['risks']) {
    return await mainController.analyzeRisks(argv['commits'], branches);
  }

  return await mainController.analyzeChanges(argv['commits'], branches);
}

main().catch((error) => {
  console.error('❌ An error occurred:', error);
  process.exit(ExitCodes.ERROR);
})