import * as core from "@actions/core";
import * as github from '@actions/github';

type EndpointType = 'upload' | 'trigger'
const PIXEE_SAMBOX_URL = 'https://d22balbl18.execute-api.us-east-1.amazonaws.com/prod'

interface GitHubContext {
    owner: string;
    repo: string;
    number: number;
    sha: string;
}

export function buildApiUrl(type: EndpointType, url: string, prNumber: number | null, tool?: string): string {
    const customUrl = url ? url : PIXEE_SAMBOX_URL
    const {owner, repo, number, sha} = getGithubContext()

    if (type === 'upload') {
        return `${customUrl}/analysis-input/${owner}/${repo}/${sha}/${tool}`
    }

    return `${customUrl}/analysis-input/${owner}/${repo}/${prNumber ?? number}`
}

export function getGithubContext(): GitHubContext {
    const { sha, issue: { owner, repo, number } } = github.context;
    return { owner, repo, number, sha };
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
