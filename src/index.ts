import {execSync} from 'child_process';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import getChatGptApiKey, {saveChatGptApiKey} from './handleConfig';
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

async function main() {
  const chatGptApiKey = getChatGptApiKey();
  if (!chatGptApiKey) {
    console.error('❌ API key is not found. Use --set-key <api_key> or set OPENAI_API_KEY env');
    process.exit(1);
  }
  const chatGptClient = new ChatGptClient(chatGptApiKey);

  const diff = getGitDiff();
  console.info('🔍 Analyzing git diff...');
  const summary = await chatGptClient.analyzeDiff(diff);

  console.info('📝 Summary of changes:');
  console.info(summary);
}

main().catch((error) => {
  console.error('❌ An error occurred:', error);
  process.exit(1);
})