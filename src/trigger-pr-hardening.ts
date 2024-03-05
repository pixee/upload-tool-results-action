import * as core from "@actions/core";
import { buildError } from "./errors";
import * as analysis from "./pixee-platform";
import { getGitHubContext, isGitHubEventValid } from "./inputs";

async function run() {
  const startedAt = new Date().toTimeString();
  core.setOutput("start-at", startedAt);

  try {
    if (isGitHubEventValid()) {
      const { prNumber } = getGitHubContext();

      if (prNumber) {
        analysis.triggerPrAnalysis(prNumber);
        core.setOutput("status", "success");
        return;
      }
      core.setFailed("PR number not found. Please provide a valid PR number.");
    }

    core.setFailed("Invalid GitHub event");
  } catch (error) {
    buildError(error);
  }
}

async function runWrapper() {
  await run();
}

void runWrapper();
