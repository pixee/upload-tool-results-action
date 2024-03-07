import * as github from "@actions/github";
import { Context } from "@actions/github/lib/context";

/**
 * Normalized GitHub event context.
 */
export interface GitHubContext {
  owner: string;
  repo: string;
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
  const {
    repo: { owner, repo },
    eventName,
  } = github.context;
  const handler = eventHandlers[eventName];

  return { owner, repo, ...handler(github.context) };
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

function getPullRequestContext(
  context: Context
): Pick<GitHubContext, "prNumber" | "sha"> {
  const number = context.issue.number;
  const sha = context.payload.pull_request?.head.sha;
  return { prNumber: number, sha };
}

function getCheckRunContext(
  context: Context
): Pick<GitHubContext, "prNumber" | "sha"> {
  const actionEvent = context.payload.check_run;
  const number = actionEvent.pull_requests?.[0]?.number;
  const sha = actionEvent.head_sha;
  return { prNumber: number, sha };
}

const eventHandlers: {
  [eventName: string]: (
    context: Context
  ) => Pick<GitHubContext, "prNumber" | "sha">;
} = {
  check_run: getCheckRunContext,
  pull_request: getPullRequestContext,
};
