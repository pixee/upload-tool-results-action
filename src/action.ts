import * as core from "@actions/core";
import fs from "fs";
import { Tool, getTool } from "./inputs";
import { triggerPrAnalysis, uploadInputFile } from "./pixee-platform";
import { SONAR_RESULT, getSonarCloudInputs, retrieveSonarCloudHotspots, retrieveSonarCloudIssues } from "./sonar";
import { getDefectDojoInputs, retrieveDefectDojoResults } from "./defect-dojo";
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

  switch(tool){
    case "contrast":
      const contrastFile = await fetchOrLocateContrastResultsFile();
      await uploadInputFile(tool, new Array(contrastFile));
      core.info(`Uploaded ${contrastFile} to Pixeebot for analysis`);
      break;
    case "defectdojo":
      const file = await fetchOrLocateDefectDojoResultsFile();
      await uploadInputFile(tool, new Array(file));
      core.info(`Uploaded ${file} to Pixeebot for analysis`);
      break;
    case "sonar":
      const issuesfile  = await fetchOrLocateSonarResultsFile("issues");
      await uploadInputFile("sonar_issues", new Array(issuesfile));
      core.info(`Uploaded ${issuesfile} to Pixeebot for analysis`);

      const hotspotFile  = await fetchOrLocateSonarResultsFile("hotspots");
      await uploadInputFile("sonar_hotspots", new Array(hotspotFile));
      core.info(`Uploaded ${hotspotFile} to Pixeebot for analysis`);
      break;
    default:
      if (!core.getInput("file")) {
        throw new Error(`Tool "${tool}" requires a file input`);
      }

      const resultFile = await fetchOrLocateResultsFile(tool, null, "");
      await uploadInputFile(tool, new Array(resultFile));
      core.info(`Uploaded ${resultFile} for ${tool} to Pixeebot for analysis`);
  }

  const { prNumber } = getGitHubContext();
  if (prNumber) {
    await triggerPrAnalysis(prNumber);
    core.info(`Hardening PR ${prNumber}`);
  }
}

async function fetchOrLocateDefectDojoResultsFile() {

  let results = await fetchDefectDojoFindings();
  let fileName = "defectdojo.findings.json";


  return fetchOrLocateResultsFile("defectdojo", results, fileName);
}

async function fetchOrLocateContrastResultsFile() {
  let file = core.getInput("file");
  if (file !== "") {
    return file;
  }

  throw new Error("Contrast requires a file to be provided");
}

async function fetchOrLocateSonarResultsFile(resultType : SONAR_RESULT) {
  let results = resultType == "issues" ? await fetchSonarCloudIssues() : await fetchSonarCloudHotspots();
  let fileName = `sonar-${resultType}.json`;

  return fetchOrLocateResultsFile("sonar", results, fileName);
}

async function fetchOrLocateResultsFile(tool: Tool, results: any, fileName: string) {
  let file = core.getInput("file");
  if (file !== "") {
    return file;
  }

  const tmp = getTempDir();
  file = core.toPlatformPath(`${tmp}/${fileName}`);
  fs.writeFileSync(file, JSON.stringify(results));
  core.info(`Saved ${tool} results to ${file}`);
  return file;
}

async function fetchSonarCloudIssues(){
  const sonarCloudInputs = getSonarCloudInputs();
  const results = await retrieveSonarCloudIssues(sonarCloudInputs);

  core.info(
    `Found ${results.total} SonarCloud issues for component ${sonarCloudInputs.componentKey}`
  );
  if (results.total === 0) {
    core.info(
      `When the SonarCloud token is incorrect, SonarCloud responds with an empty response indistinguishable from cases where there are no issues. If you expected issues, please check the token.`
    );
  }

  return results;
}

async function fetchSonarCloudHotspots(){
  const sonarCloudInputs = getSonarCloudInputs();
  const results = await retrieveSonarCloudHotspots(sonarCloudInputs);
  core.info(
    `Found ${results.paging.total} SonarCloud hotspots for component ${sonarCloudInputs.componentKey}`
  );

  return results;
}

async function fetchDefectDojoFindings(){
  const inputs = getDefectDojoInputs();
  const findings =  await retrieveDefectDojoResults(inputs);
  core.info(
    `Found ${findings.count} DefectDojo findings for component ${inputs.productName}`
  );

  return findings;
}
