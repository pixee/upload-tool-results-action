import * as github from "@actions/github";
import { Context } from "@actions/github/lib/context";
import * as core from "@actions/core";

/**
 * Normalized GitHub event context.
 */
export type GitHubContext = RepositoryInfo & PullRequestInfo;

export interface RepositoryInfo {
  owner: string;
  repo: string;
}

export interface PullRequestInfo {
  sha: string;
  prNumber?: number;
}

/**
 * Maps the GitHub context from supported event types to the normalized GitHub context.
 *
 * This strategy assumes that the action is only triggered by supported events and that those events have common properties. However, we know that there are use cases where we need to handle events that do not have a pull request associated with them. Furthermore, the check_run event may be associated with multiple pull requests. Fixing this is the subject of a future change.
 *
 * @returns The normalized GitHub context.
 */
export function getGitHubContext(): GitHubContext {
  const context = github.context;
  const { eventName } = context;

  const handler = eventHandlers[eventName];
  if (!handler) {
    throw new Error(`Unsupported event: ${eventName}`);
  }
  const commitInfo = handler(context);

  return { ...getRepositoryInfo(), ...commitInfo };
}

/**
 * Retrieves information about the current repository from the GitHub context.
 * @returns The information about the current repository
 */
export function getRepositoryInfo(): RepositoryInfo {
  const { owner, repo } = github.context.repo;
  return { owner, repo };
}

/**
 * @returns The path to the temporary directory.
 */
export function getTempDir(): string {
  const temp = process.env.RUNNER_TEMP;
  if (temp === undefined) {
    throw new Error("RUNNER_TEMP not set");
  }
  return temp;
}

function getPullRequestContext(context: Context): PullRequestInfo {
  const prNumber = context.issue.number;
  const sha = context.payload.pull_request?.head.sha;

  return { prNumber, sha };
}

function getCheckRunContext(context: Context): PullRequestInfo {
  const actionEvent = context.payload.check_run;
  const prNumber = actionEvent.pull_requests?.[0]?.number;
  const sha = actionEvent.head_sha;

  return { prNumber, sha };
}

function getShaFromContext(context: Context): PullRequestInfo {
  return { sha: context.sha };
}

const eventHandlers: {
  [eventName: string]: (context: Context) => PullRequestInfo;
} = {
  check_run: getCheckRunContext,
  pull_request: getPullRequestContext,
  push: getShaFromContext,
  workflow_dispatch: getShaFromContext,
};
