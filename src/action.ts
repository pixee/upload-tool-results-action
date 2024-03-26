import * as core from "@actions/core";
import fs from "fs";
import { Tool, getTool } from "./inputs";
import { triggerPrAnalysis, uploadInputFile } from "./pixee-platform";
import { getSonarCloudInputs, retrieveSonarCloudResults } from "./sonar";
import { getGitHubContext, getTempDir } from "./github";

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
  const {prNumber} = await getGitHubContext();
  if (prNumber) {
    await triggerPrAnalysis(prNumber);
    core.info(`Hardening PR ${prNumber}`);
  }
}

async function fetchOrLocateResultsFile(tool: Tool) {
  let file = core.getInput("file");
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
    core.info(
      "When the SonarCloud token is incorrect, SonarCloud responds with an empty response indistinguishable from cases where there are no issues. If you expected issues, please check the token."
    );
  }
  const tmp = getTempDir();
  file = core.toPlatformPath(`${tmp}/${FILE_NAME}`);
  fs.writeFileSync(file, JSON.stringify(results));
  core.info(`Saved SonarCloud results to ${file}`);
  return file;
}

const FILE_NAME = "sonar-issues.json";
