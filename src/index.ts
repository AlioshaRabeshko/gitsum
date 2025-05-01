import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import ConfigService from './ConfigService';
import ChatGptService from './ChatGptService';
import GitDiffService from './GitDiffService';

const configService = new ConfigService();

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
  .option('add-ignore', {
    alias: 'ia',
    type: 'string',
    describe: 'Add file to ignore list',
  })
  .option('remove-ignore', {
    alias: 'ir',
    type: 'string',
    describe: 'Remove file from ignore list',
  })
  .option('ignore-list', {
    alias: 'il',
    type: 'array',
    describe: 'List of files to ignore',
  })
  .options('risks', {
    alias: 'r',
    type: 'boolean',
    describe: 'Analyze risks of changes',
  })
  .demandCommand(0)
  .help().argv as any;

if (argv['set-key']) {
  const apiKey = argv['set-key'];
  if (!apiKey) {
    console.error('❌ Please provide an OpenAI API key.');
    process.exit(ExitCodes.ERROR);
  }

  configService.saveChatGptApiKey(apiKey)
    .then(() => {
      console.info('✅ API key saved to config.');
      process.exit(ExitCodes.SUCCESS);
    })
    .catch((error) => {
      console.error('❌ Failed to save API key:', error);
      process.exit(ExitCodes.ERROR);
    })
}

if (argv['set-model']) {
  const model = argv['set-model'];
  if (!model) {
    console.error('❌ Please provide a model name.');
    process.exit(ExitCodes.ERROR);
  }

  configService.updateConfig((currentConfig) => {
    return {...currentConfig, model};
  })
    .then(() => {
      console.info(`✅ Model ${model} has been set.`);
      process.exit(ExitCodes.SUCCESS);
    })
    .catch((error) => {
      console.error('❌ Failed to update config:', error);
      process.exit(ExitCodes.ERROR);
    })
}

if (argv['add-ignore']) {
  const fileToIgnore = argv['add-ignore'];
  configService.updateConfig((currentConfig) => {
    const newIgnoreFiles = [...new Set(...(currentConfig.ignoreFiles || []))];
    return {...currentConfig, ignoreFiles: newIgnoreFiles};
  })
    .then(() => {
      console.info(`✅ File ${fileToIgnore} has been added to ignore list.`);
      process.exit(ExitCodes.SUCCESS);
    })
    .catch((error) => {
      console.error('❌ Failed to update config:', error);
      process.exit(ExitCodes.ERROR);
    })
}

if (argv['remove-ignore']) {
  const fileToRemove = argv['remove-ignore'];
  configService.updateConfig((currentConfig) => {
    const ignoreFiles = currentConfig.ignoreFiles || [];
    const newIgnoreList = ignoreFiles.filter((file) => file !== fileToRemove);
    return {...currentConfig, ignoreFiles: newIgnoreList};
  })
    .then(() => {
      console.info(`✅ File ${fileToRemove} has been removed from ignore list.`);
      process.exit(ExitCodes.SUCCESS);
    })
    .catch((error) => {
      console.error('❌ Failed to update config:', error);
      process.exit(ExitCodes.ERROR);
    })
}

if (argv['ignore-list']) {
  configService.getConfig()
    .then((config) => {;
      console.info(`✅ Files [${(config.ignoreFiles || []).join(', ')}] are in the ignore list.`);
      process.exit(ExitCodes.SUCCESS);
    })
    .catch((error) => {
      console.error('❌ Failed to read config:', error);
      process.exit(ExitCodes.ERROR);
    })
}

async function main() {
  const {apiKey, ignoreFiles, model} = await configService.getConfig();
  if (!apiKey) {
    console.error('❌ API key is not found. Use --set-key <api_key> or set OPENAI_API_KEY env');
    process.exit(ExitCodes.ERROR);
  }

  const gitDiffService = new GitDiffService(ignoreFiles);
  const filteredDiff = await (() => {
    if (argv['commits']) {
      return gitDiffService.getCommitsDiff(argv['commits']);
    }
    if (argv['branches']) {
      return gitDiffService.getBranchesDiff(argv['branches']);
    }
  })();
  if (!filteredDiff) {
    console.info('✅ No changes to analyze.');
    process.exit(ExitCodes.SUCCESS);
  }

  const chatGptService = new ChatGptService(apiKey, model);
  if (argv.risks) {
    console.info('🔍 Analyzing risks...');
    const risks = await chatGptService.analyzeRisks(filteredDiff);
    console.info('⚠️ Potential problems:');
    console.info(risks);
    process.exit(ExitCodes.SUCCESS);
  }

  console.info('🔍 Analyzing git diff...');
  const summary = await chatGptService.analyzeChanges(filteredDiff);
  console.info('📝 Summary of changes:');
  console.info(summary);
}

main().catch((error) => {
  console.error('❌ An error occurred:', error);
  process.exit(ExitCodes.ERROR);
})