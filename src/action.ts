import * as core from "@actions/core";
import fs from "fs";
import { Tool, getTool } from "./inputs";
import { triggerPrAnalysis, uploadInputFile } from "./pixee-platform";
import { getSonarCloudInputs, retrieveSonarCloudResults } from "./sonar";
import { getGitHubContext } from "./github";

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
  core.info(`Uploaded ${file} to Pixeebot for analysis`);
  const { prNumber } = getGitHubContext();
  if (prNumber) {
    await triggerPrAnalysis(prNumber);
    core.info(`Hardening PR ${prNumber}`);
  }
}

async function fetchOrLocateResultsFile(tool: Tool) {
  const file = core.getInput("file");
  if (file !== "") {
    return file;
  }
  // This is special behavior for SonarCloud that we either don't yet have for other supported tools
  if (tool !== "sonar") {
    throw new Error("missing input tool");
  }
  const sonarCloudInputs = getSonarCloudInputs();
  const results = await retrieveSonarCloudResults(sonarCloudInputs);
  core.info(
    `Found ${results.total} SonarCloud issues for component ${sonarCloudInputs.componentKey}`
  );
  if (results.total === 0) {
    core.warning(
      "When the SonarCloud token is incorrect, the response will be empty. If you expected issues, please check the token."
    );
  }
  fs.writeFileSync(FILE_NAME, JSON.stringify(results));
  core.info(`Saved SonarCloud results to ${FILE_NAME}`);
  return FILE_NAME;
}

const FILE_NAME = "sonar_issues.json";
