import * as core from "@actions/core";
import * as github from "@actions/github";
import { Context } from "node:vm";
import { UserError } from "./errors";
import { SonarCloudInputs } from "./sonar";

export type Tool = "sonar" | "codeql" | "semgrep" | "appscan";
export type GitHubEvent = "check_run" | "pull_request";
export interface GitHubContext {
  owner: string;
  repo: string;
  prNumber: number;
  sha: string;
}

/**
 * Helper to get all the inputs for the action
 */
export function getTool(): Tool {
  const tool = core.getInput("tool", { required: true }) as Tool;
  validateTool(tool);

  return tool;
}

export function getSonarCloudInputs(): SonarCloudInputs {
  const token = core.getInput("sonar-token");
  const componentKey = core.getInput("sonar-component-key");
  const apiUrl = core.getInput("sonar-api-url", { required: true });

  return { token, componentKey, apiUrl };
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

export function isGitHubEventValid(): boolean {
  const eventName = github.context.eventName as GitHubEvent;
  return VALID_EVENTS.includes(eventName);
}

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

  const number = actionEvent.pull_requests[0].number;
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
const VALID_EVENTS: GitHubEvent[] = ["check_run", "pull_request"];
