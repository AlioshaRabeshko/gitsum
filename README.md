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
npm install -g gitsum
```

## Usage

### Commands

#### Analyze Recent Commits
Generate a summary of changes for the last `N` commits:
```bash
gitsum --commits <N>
```

#### Compare Branches
Generate a summary of changes between two branches:
```bash
gitsum --branches <branch1> <branch2>
```

#### Analyze Risks
Analyze potential risks in the changes:
```bash
gitsum --commits <N> --risks
```

#### Manage Ignored Files
Add a file to the ignore list:
```bash
gitsum --add-ignore <file>
```

Remove a file from the ignore list:
```bash
gitsum --remove-ignore <file>
```

View the ignore list:
```bash
gitsum --ignore-list
```

#### Set OpenAI API Key
Save your OpenAI API key for authentication:
```bash
gitsum --set-key <api_key>
```

### Example
Analyze the last 3 commits and summarize the changes:
```bash
gitsum --commits 3
```

Compare changes between `main` and `feature` branches:
```bash
gitsum --branches main feature
```

## Configuration

The tool stores its configuration in a file located at:
```
~/.git-summary-cli/config.json
```

You can manually edit this file to update settings like the API key or ignored files.

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

## License

This project is licensed under the [MIT License](LICENSE).

## Author

Created by [Oleksiy Rabeshko](https://github.com/AlioshaRabeshko).  
Feel free to contribute or open issues on the [GitHub repository](https://github.com/AlioshaRabeshko/gitsum).
