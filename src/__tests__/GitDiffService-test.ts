import GitDiffService from '../GitDiffService';

function getInstance(ignoreFiles = ['ignored-file.txt', 'node_modules/some-file.js']) {
  const mockExec = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();
  const gitDiffService = new GitDiffService(ignoreFiles, mockOnSuccess, mockOnError, mockExec);
  return {gitDiffService, mockExec};
}

describe('GitDiffService', () => {
  describe('getCommitsDiff', () => {
    it('should return the diff for the specified number of commits', async () => {
      const {gitDiffService, mockExec} = getInstance();
      const mockDiff = 'diff --git a/file1.txt b/file1.txt\n--- a/file1.txt\n+++ b/file1.txt\n@@ -1 +1 @@\n-Hello\n+Hi';
      mockExec.mockImplementation(async () => ({stdout: mockDiff}));

      const result = await gitDiffService.getCommitsDiff(2);

      expect(mockExec).toHaveBeenCalledWith('git diff HEAD~2 HEAD');
      expect(result).toBe(mockDiff);
    });

    it('should return an empty string if commits are not specified', async () => {
      const {gitDiffService, mockExec} = getInstance();
      const result = await gitDiffService.getCommitsDiff(0);

      expect(result).toBe('');
      expect(mockExec).not.toHaveBeenCalled();
    });

    it('should return an empty string if git diff fails', async () => {
      const {gitDiffService, mockExec} = getInstance();
      mockExec.mockImplementation(async () => {
        throw new Error('git error')
      });

      const result = await gitDiffService.getCommitsDiff(2);

      expect(mockExec).toHaveBeenCalledWith('git diff HEAD~2 HEAD');
      expect(result).toBe('');
    });
  });

  describe('getBranchesDiff', () => {
    it('should return the diff between the specified branches', async () => {
      const {gitDiffService, mockExec} = getInstance();
      const mockDiff = 'diff --git a/file2.txt b/file2.txt\n--- a/file2.txt\n+++ b/file2.txt\n@@ -1 +1 @@\n-World\n+Earth';
      mockExec.mockImplementation(async () => ({stdout: mockDiff}));

      const result = await gitDiffService.getBranchesDiff(['branch1', 'branch2']);

      expect(mockExec).toHaveBeenCalledWith('git diff branch1..branch2');
      expect(result).toBe(mockDiff);
    });

    it('should return an empty string if branches are not specified or invalid', async () => {
      const {gitDiffService, mockExec} = getInstance();
      const result = await gitDiffService.getBranchesDiff([]);

      expect(result).toBe('');
      expect(mockExec).not.toHaveBeenCalled();
    });

    it('should return an empty string if git diff fails', async () => {
      const {gitDiffService, mockExec} = getInstance();
      mockExec.mockImplementation(async () => {
        throw new Error('git error');
      });

      const result = await gitDiffService.getBranchesDiff(['branch1', 'branch2']);

      expect(mockExec).toHaveBeenCalledWith('git diff branch1..branch2');
      expect(result).toBe('');
    });
  });

  describe('filterIgnoredFiles', () => {
    it('should filter out ignored files from the diff output', async () => {
      const {gitDiffService, mockExec} = getInstance();
      const mockDiff = `
diff --git a/file1.txt b/file1.txt
--- a/file1.txt
+++ b/file1.txt
@@ -1 +1 @@
-Hello
+Hi
diff --git a/ignored-file.txt b/ignored-file.txt
--- a/ignored-file.txt
+++ b/ignored-file.txt
@@ -1 +1 @@
-Ignore this
+Still ignored
diff --git a/file2.txt b/file2.txt
--- a/file2.txt
+++ b/file2.txt
@@ -1 +1 @@
-World
+Earth`;

      mockExec.mockImplementation(async () => ({stdout: mockDiff}));

      const result = await gitDiffService.getCommitsDiff(1);

      expect(result).toContain('diff --git a/file1.txt b/file1.txt');
      expect(result).toContain('diff --git a/file2.txt b/file2.txt');
      expect(result).not.toContain('diff --git a/ignored-file.txt b/ignored-file.txt');
    });

    it('should return the full diff if no files are ignored', async () => {
      const {gitDiffService, mockExec} = getInstance([]);
      const mockDiff = `
diff --git a/file1.txt b/file1.txt
--- a/file1.txt
+++ b/file1.txt
@@ -1 +1 @@
-Hello
+Hi`;

      mockExec.mockImplementation(async () => ({stdout: mockDiff}));

      const result = await gitDiffService.getCommitsDiff(1);

      expect(result).toBe(mockDiff);
    });
  });
});