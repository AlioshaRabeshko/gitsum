```md
# Release Notes v0.2.1

## New Features
- Added GitHub Actions workflow to publish package to npm on release creation.
- Introduced `.gitsumsrc` file support for local project-specific configuration (model, ignored files, custom prompt).
- Added support for custom AI prompts to analyze git diffs with ChatGPT.
- New CLI flags:
  - `-r, --risks`: Analyze risks of changes.
  - `-C, --custom`: Use custom ChatGPT prompt.
  - `--set-custom`: Set a custom prompt for ChatGPT.
- Multiple CLI improvements:
  - Added `gitsums` alias alongside `gitsum`.
  - Consistent option aliases (`ia`, `ir`, `il`) for ignore list management.
  - Enhanced commands to add/remove files from ignore list and manage custom prompts.
- New `MainController` to centralize CLI actions and improve error/success handling.
- ConfigService enhancements:
  - Supports loading both global and local config (`.gitsumsrc`).
  - Emits success and error messages via callbacks.
  - Throws error if no API key found instead of returning null.
- GitDiffService now provides success/error callbacks.
- ChatGptService supports custom prompt handling.
- Improved `release.sh` script to:
  - Check for existing tags before creating new one.
  - Run lint, tests, build, changelog generation before tagging and pushing.
  - Use git reset to roll back to previous HEAD after release tag.
- Updated README with:
  - Corrected CLI command to `gitsums`.
  - Instructions for custom prompt usage.
  - Expanded config and usage details.

## Bug Fixes & Improvements
- Refactored CLI argument parsing and command handling into async `main()` function.
- Fixed ignore list update logic for adding files.
- Tests added for new ChatGptService custom prompt method.
- Minor lint changes and examples cleanup in docs.

## Breaking Changes
- CLI command changed to `gitsums` (from `gitsum`) - old command still available as alias.
- Config API changed so getChatGptApiKey throws error if no key provided.
- Config file structure now includes `customPrompt` field.
- Manual calls to npm publish removed from release script (handled by CI).
```
