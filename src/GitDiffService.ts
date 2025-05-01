import {exec} from 'child_process';
import {promisify} from 'util';

const execPromise = promisify(exec);

class GitDiffService {
  constructor(private readonly ignoreFiles: string[], private exec = execPromise) {}
  
  async getCommitsDiff(commits: number): Promise<string> {
    if (!commits) {
      console.error('❌ Please specify --commits N');
      return '';
    }

    let diff: string;
    try {
      const {stdout} = await this.exec(`git diff HEAD~${commits} HEAD`);
      diff = stdout;
    } catch (error) {
      console.error('❌ Failed to get git diff:', error);
      return '';
    }
    
    return this.filterIgnoredFiles(diff);
  }
  
  async getBranchesDiff(branches: string[]): Promise<string> {
    if (!branches || branches.length !== 2) {
      console.error('❌ Please specify --branches a b');
      return '';
    }
  
    let diff: string;
    try {
      const {stdout} = await this.exec(`git diff ${branches[0]}..${branches[1]}`);
      diff = stdout;
    } catch (error) {
      console.error('❌ Failed to get git diff:', error);
      return '';
    }
    
    return this.filterIgnoredFiles(diff);
  }
  
  private filterIgnoredFiles(diffOutput: string): string {
    if (!this.ignoreFiles.length) {
      return diffOutput;
    }

    const sections = diffOutput.split(/^diff --git /gm).filter(Boolean);
    
    const filteredSections = sections.filter(section => {
      const firstLine = section.split('\n')[0];
      const fileName = firstLine.match(/b\/(.+)$/)?.[1];
      if (!fileName) {
        return true;
      }
  
      return !this.ignoreFiles.includes(fileName);
    });
  
    return filteredSections.map(s => `diff --git ${s}`).join('\n');
  }
}

export default GitDiffService;
