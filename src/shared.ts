export type GitHubEvent = 'check_run' | 'pull_request';
export type Tool = 'sonar' | 'codeql' | 'semgrep' | 'appscan';

export const AUDIENCE = 'https://app.pixee.ai'
export const FILE_NAME = 'sonar_issues.json';
export const PIXEE_URL = 'https://api.pixee.ai/analysis-input'
export const UTF = 'utf-8'
export const VALID_EVENTS: GitHubEvent[] = ['check_run', 'pull_request'];
export const VALID_TOOLS: Tool[] = ['sonar', 'codeql', 'semgrep', 'appscan'];

export interface GitHubContext {
    owner: string;
    repo: string;
    prNumber: number;
    sha: string;
}

export interface SonarCloudInputs {
    token: string
    componentKey: string
    apiUrl: string
}
