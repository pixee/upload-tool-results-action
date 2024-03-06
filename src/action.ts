import * as core from "@actions/core";
import { Tool, getGitHubContext, getTool } from "./inputs";
import { triggerPrAnalysis, uploadInputFile } from "./pixee-platform";
import { retrieveSonarCloudResults } from "./sonar";

/**
 * Runs the action.
 *
 * Presently only handles the case where the tool is SonarCloud and the file is not provided and therefore must be retrieved as part of a check_run. We will exapnd this to handle other types of GitHub events.
 *
 * If the event is associated with a PR, the action will trigger a PR analysis.
 */
export async function run() {
  const tool = getTool();
  const file = await fetchOrLocateResultsFile(tool);
  await uploadInputFile(tool, file);
  const { prNumber } = getGitHubContext();
  if (prNumber) {
    await triggerPrAnalysis(prNumber);
  }
}

async function fetchOrLocateResultsFile(tool: Tool) {
  var file = core.getInput("file");
  if (file !== "") {
    return file;
  }
  // This is special behavior for SonarCloud that we either don't yet have for other supported tools
  if (tool !== "sonar") {
    throw new Error("missing input tool");
  }
  return await retrieveSonarCloudResults();
}
