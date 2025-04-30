import {execSync} from 'child_process';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import getChatGptApiKey, {getConfig, saveChatGptApiKey, saveConfig} from './handleConfig';
import ChatGptClient from './ChatGptClient';

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
    type: 'string',
    describe: 'Save OpenAI API key to config',
  })
  .option('add-ignore', {
    type: 'string',
    describe: 'Add file to ignore list',
  })
  .option('remove-ignore', {
    type: 'string',
    describe: 'Remove file from ignore list',
  })
  .option('ignore-list', {
    type: 'array',
    describe: 'List of files to ignore',
  })
  .options('risks', {
    type: 'boolean',
    describe: 'Analyze risks of changes',
  })
  .demandCommand(0)
  .help().argv as any;

if (argv['set-key']) {
  const apiKey = argv['set-key'];
  if (!apiKey) {
    console.error('❌ Please provide an OpenAI API key.');
    process.exit(1);
  }

  saveChatGptApiKey(apiKey);
  process.exit(0);
}

if (argv['add-ignore']) {
  const fileToIgnore = argv['add-ignore'];
  const config = getConfig();
  config.ignoreFiles = [...new Set([...(config.ignoreFiles || []), fileToIgnore])];
  saveConfig(config);
  console.info(`✅ File ${fileToIgnore} added to ignore list.`);
  process.exit(0);
}

if (argv['remove-ignore']) {
  const fileToRemove = argv['remove-ignore'];
  const config = getConfig();
  config.ignoreFiles = (config.ignoreFiles || []).filter((file: string) => file !== fileToRemove);
  saveConfig(config);
  console.info(`✅ File ${fileToRemove} removed from ignore list.`);
  process.exit(0);
}

if (argv['ignore-list']) {
  const config = getConfig();
  console.info(`✅ Files [${(config.ignoreFiles || []).join(', ')}] are in the ignore list.`);
  process.exit(0);
}

function getGitDiff(): string {
  if (argv.commits) {
    return execSync(`git diff HEAD~${argv.commits} HEAD`, {
      encoding: 'utf-8',
    });
  }

  if (argv.branches?.length === 2) {
    return execSync(`git diff ${argv.branches[0]}..${argv.branches[1]}`, {
      encoding: 'utf-8',
    });
  }

  console.error('❌ Please specify --commits N or --branches a b');
  process.exit(1);
}

function filterIgnoredFiles(diffOutput: string, ignoreFiles: string[]): string {
  const sections = diffOutput.split(/^diff --git /gm).filter(Boolean);
  
  const filteredSections = sections.filter(section => {
    const firstLine = section.split('\n')[0];
    const fileName = firstLine.match(/b\/(.+)$/)?.[1];
    if (!fileName) {
      return true;
    }

    return !ignoreFiles.includes(fileName);
  });

  return filteredSections.map(s => `diff --git ${s}`).join('\n');
}

async function main() {
  const chatGptApiKey = getChatGptApiKey();
  if (!chatGptApiKey) {
    console.error('❌ API key is not found. Use --set-key <api_key> or set OPENAI_API_KEY env');
    process.exit(1);
  }

  const config = getConfig();
  const diff = getGitDiff();
  const filteredDiff = filterIgnoredFiles(diff, config.ignoreFiles || []);
  if (!filteredDiff) {
    console.info('✅ No changes to analyze.');
    process.exit(0);
  }

  if (argv.risks) {
    console.info('🔍 Analyzing risks...');
    const chatGptClient = new ChatGptClient(chatGptApiKey);
    const risks = await chatGptClient.analyzeRisks(filteredDiff);
    console.info('⚠️ Potential problems:');
    console.info(risks);
    process.exit(0);
  }

  console.info('🔍 Analyzing git diff...');
  const chatGptClient = new ChatGptClient(chatGptApiKey);
  const summary = await chatGptClient.analyzeChanges(filteredDiff);
  console.info('📝 Summary of changes:');
  console.info(summary);
}

main().catch((error) => {
  console.error('❌ An error occurred:', error);
  process.exit(1);
})