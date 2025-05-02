```md
# Release Notes - v0.2.2

## Features
- Added GitHub Action workflow to publish package automatically on npm when a release is created.
- Introduced `.gitsumsrc` config file support to override global settings including model, ignore files, and custom AI prompts.
- Added support for custom AI prompts for analyzing git diffs via CLI option `--set-custom` and `-C` flag.
- Enabled risk analysis of code changes using `-r` / `--risks` CLI flag.
- Added commands to manage ignore files: add (`-ia`), remove (`-ir`), and list (`-il`).
- Added CLI command to set OpenAI API key (`-k` / `--set-key`) and model (`-m` / `--set-model`).
- Provided a unified `gitsums` CLI command alongside legacy `gitsum`.
- Enhanced output messages and error handling with success/error callbacks.
- Added `MainController` class to unify logic for configuration, git diff fetching, and AI analysis.
- Enabled advanced changelog generation with a custom prompt and CLI script command.

## Improvements
- Refactored codebase to improve configuration loading, supporting local `.gitsumsrc` and environment variables.
- Improved CLI argument parsing and error feedback.
- Improved README documentation: corrected commands from `gitsum` to `gitsums`, documented new features including custom prompt usage.
- Improved `ConfigService` and `GitDiffService` with callbacks for consistent logging and error handling.
- Added new unit tests for custom prompt feature in `ChatGptService` and enhanced existing tests for config and git diff services.
- Updated release script to automate build, lint, test, changelog generation, git tagging, and pushing steps before publishing.

## Fixes
- Fixed reading and merging configuration from multiple sources and formats.
- Fix bug with ignore files array handling to prevent duplicates.
- Corrected CLI help and options for ignore file management.
- Fixed error handling in Git diff retrieval.

## Miscellaneous
- Renamed package and CLI binary from `gitsum` to `gitsums`.
- Minor lint and style fixes.
```
