import * as core from "@actions/core";
import * as github from "@actions/github";
import { Context } from "node:vm";
import { UserError } from "./errors";

export type Tool = "sonar" | "codeql" | "semgrep" | "appscan";

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
 * Helper function to get the selected tool from the action's inputs.
 * @returns The selected tool.
 * @throws {UserError} If the selected tool is invalid.
 */
export function getTool(): Tool {
  const tool = core.getInput("tool", { required: true }) as Tool;
  validateTool(tool);
  return tool;
}

function validateTool(tool: Tool) {
  if (!VALID_TOOLS.includes(tool)) {
    throw new UserError(
      `Invalid tool "${tool}". The tool must be one of: ${VALID_TOOLS.join(
        ", "
      )}.`
    );
  }
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
    issue: { owner, repo },
    eventName,
  } = github.context;
  const handler = eventHandlers[eventName];

  return { owner, repo, ...handler(github.context) };
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

const VALID_TOOLS: Tool[] = ["sonar", "codeql", "semgrep", "appscan"];
