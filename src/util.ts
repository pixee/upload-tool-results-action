import * as core from "@actions/core";
import * as github from '@actions/github';
import {Context} from "node:vm";
import {GitHubContext, GitHubEvent, PIXEE_URL, SonarCloudInputs, VALID_EVENTS} from "./shared";

const eventHandlers: { [eventName: string]: (context: Context) => Pick<GitHubContext, "prNumber" | "sha"> } = {
    'check_run': getCheckRunContext,
    'pull_request': getPullRequestContext
};

export function buildSonarcloudUrl(inputs: SonarCloudInputs): string {
    const {componentKey, urlApi} = inputs
    const context = github.context
    const handler = eventHandlers[context.eventName];

    const { prNumber } = handler(context)
    return `${urlApi}/issues/search?componentKeys=${componentKey}&resolved=false&pullRequest=${prNumber}`
}

export function buildTriggerApiUrl(prNumber: number): string {
    const {owner, repo, sha} = getGitHubContext()

    return `${PIXEE_URL}/${owner}/${repo}/${prNumber}`
}

export function buildUploadApiUrl(tool: string): string {
    const {owner, repo, sha} = getGitHubContext()

    return `${PIXEE_URL}/${owner}/${repo}/${sha}/${tool}`
}

export function isGitHubEventValid(): boolean {
    const eventName = github.context.eventName as GitHubEvent
    return VALID_EVENTS.includes(eventName);
}

export function getGitHubContext(): GitHubContext {
    const { issue: {owner, repo}, eventName } = github.context;
    const handler = eventHandlers[eventName];

    return { owner, repo, ...handler(github.context) };
}

function getPullRequestContext(context: Context): Pick<GitHubContext, 'prNumber' | 'sha'> {
    const number = context.issue.number;
    const sha = context.payload.pull_request?.head.sha;
    return { prNumber: number, sha };
}

function getCheckRunContext(context: Context): Pick<GitHubContext, 'prNumber' | 'sha'> {
    const actionEvent = context.payload.check_run

    const number = actionEvent.pull_requests[0].number;
    const sha = actionEvent.head_sha;
    return { prNumber: number, sha };
}

export function wrapError(error: unknown): Error {
    return error instanceof Error ? error : new Error(String(error));
}

export function buildError(unwrappedError: unknown) {
    const error = wrapError(unwrappedError);
    const message = error.message;
    core.setOutput("status", "error");
    core.setFailed(message);
    return;
}

export class UserError extends Error {
    constructor(message: string) {
        super(message);
    }
}
