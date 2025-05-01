# gitsum

`gitsum` is a small utility that uses AI to generate summaries and analyze risks for Git changes. It helps developers quickly understand the impact of their commits or branch differences.

## Features

- Generate a concise summary of Git changes using OpenAI's GPT models.
- Analyze potential risks or problems in code changes.
- Manage ignored files for analysis.
- Compare changes between branches or recent commits.
- Save and manage OpenAI API keys securely.

## Installation

```bash
npm install -g gitsums
```

## Usage

### Commands

#### Analyze Recent Commits
Generate a summary of changes for the last `N` commits:
```bash
gitsum -c <N>
```

#### Compare Branches
Generate a summary of changes between two branches:
```bash
gitsum -b <branch1> <branch2>
```

#### Analyze Risks
Analyze potential risks in the changes:
```bash
gitsum -c <N> -r
```

#### Manage Ignored Files
Add a file to the ignore list:
```bash
gitsum -ia <file>
```

Remove a file from the ignore list:
```bash
gitsum -ir <file>
```

View the ignore list:
```bash
gitsum -il
```
Ignored files are excluded from the diff analysis. You can add or remove files from the ignore list using the commands below or by editing the configuration file directly.

#### OpenAI API settings
Save your OpenAI API key for authentication:
```bash
gitsum -k <api_key>

```
Save your Chat GPT model (gpt-4.1-nano by default):
```bash
gitsum -m <model>

```

Alternatively, you can set the API key using the `OPENAI_API_KEY` environment variable:
```bash
export OPENAI_API_KEY=<api_key>
```

### Example
Analyze the last 3 commits and summarize the changes:
```bash
gitsum -c 3
```

Compare changes between `main` and `feature` branches:
```bash
gitsum -b main feature
```

Analyze risks for the last 5 commits:
```bash
gitsum -c 5 -r
```

### Error Handling
The tool provides detailed error messages for common issues, such as:
- Missing OpenAI API key
- Invalid or missing configuration file
- Git command failures
Ensure you follow the instructions provided in the error messages to resolve issues.

## Configuration

The tool stores its configuration in a file located at:
```
~/.git-summary-cli/config.json
```

This file is automatically created if it does not exist. You can manually edit this file to update settings like the API key or ignored files.

## Requirements

- Node.js >= 14
- OpenAI API key

## Development

### Install Dependencies
```bash
npm install
```

### Run Locally
```bash
npm start
```

### Lint Code
```bash
npm run lint
```

### Unit tests
```bash
npm run test
```

## License

This project is licensed under the [MIT License](LICENSE).

## Author

Created by [Oleksiy Rabeshko](https://github.com/AlioshaRabeshko).  
Feel free to contribute or open issues on the [GitHub repository](https://github.com/AlioshaRabeshko/gitsum).
