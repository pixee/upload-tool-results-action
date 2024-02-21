type GithubEvent = 'check_run' | 'pull_request';
type Tool = 'sonar' | 'codeql' | 'semgrep'

const VALID_TOOLS: Tool[] = ['sonar', 'codeql', 'semgrep'];
const UTF = 'utf-8'
const AUDIENCE = 'https://app.pixee.ai'
const FILE_NAME = 'sonar_issues.json';

const VALID_EVENTS: GithubEvent[] = ['check_run', 'pull_request'];
const PIXEE_URL = 'https://app.pixee.ai/analysis-input'

interface SonarcloudInputs {
    token: string
    componentKey: string
    urlApi: string
}

interface GitHubContext {
    owner: string;
    repo: string;
    prNumber: number;
    sha: string;
}
