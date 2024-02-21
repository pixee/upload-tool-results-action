export type GithubEvent = 'check_run' | 'pull_request';
export type Tool = 'sonar' | 'codeql' | 'semgrep'

export const AUDIENCE = 'https://app.pixee.ai'
export const FILE_NAME = 'sonar_issues.json';
export const PIXEE_URL = 'https://app.pixee.ai/analysis-input'
export const UTF = 'utf-8'
export const VALID_EVENTS: GithubEvent[] = ['check_run', 'pull_request'];
export const VALID_TOOLS: Tool[] = ['sonar', 'codeql', 'semgrep'];

export interface GitHubContext {
    owner: string;
    repo: string;
    prNumber: number;
    sha: string;
}

export interface SonarcloudInputs {
    token: string
    componentKey: string
    urlApi: string
}
