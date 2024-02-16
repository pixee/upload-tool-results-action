import * as core from "@actions/core";
import * as github from '@actions/github';
import {Context} from "node:vm";

type EndpointType = 'upload' | 'trigger'
type GithubEvent = 'check_run' | 'pull_request';

const validEvents: GithubEvent[] = ['check_run', 'pull_request'];
const PIXEE_URL = 'https://app.pixee.ai'

interface GitHubContext {
    owner: string;
    repo: string;
    number: number;
    sha: string;
}

export function buildApiUrl(type: EndpointType, url: string, prNumber: number | null, tool?: string): string {
    const customUrl = url ? url : PIXEE_URL
    const {owner, repo, number, sha} = getGithubContext()

    if (type === 'upload') {
        return `${customUrl}/analysis-input/${owner}/${repo}/${sha}/${tool}`
    }

    return `${customUrl}/analysis-input/${owner}/${repo}/${prNumber ?? number}`
}

export function isGithubEventValid(): boolean {
    const eventName = github.context.eventName as GithubEvent
    return validEvents.includes(eventName);
}

export function getGithubContext(): GitHubContext {
    const { issue: {owner, repo}, eventName } = github.context;

    const eventHandlers: { [eventName: string]: (context: Context) => Pick<GitHubContext, "number" | "sha"> } = {
        'check_run': getCheckRunContext,
        'pull_request': getPullRequestContext
    };

    const handler = eventHandlers[eventName];
    return { owner, repo, ...handler(github.context) };
}

function getPullRequestContext(context: Context): Pick<GitHubContext, 'number' | 'sha'> {
    const number = context.issue.number;
    const sha = context.payload.pull_request?.head.sha;
    return { number, sha };
}

function getCheckRunContext(context: Context): Pick<GitHubContext, 'number' | 'sha'> {
    const actionEvent = context.payload.check_run

    const number = actionEvent.pull_requests[0].number;
    const sha = actionEvent.head_sha;
    return { number, sha };
}

export function wrapError(error: unknown): Error {
    return error instanceof Error ? error : new Error(String(error));
}

export function buildError(unwrappedError: unknown) {
    const error = wrapError(unwrappedError);
    const message = error.message;
    core.setFailed(message);
    return;
}

export class UserError extends Error {
    constructor(message: string) {
        super(message);
    }
}
