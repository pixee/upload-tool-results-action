import * as core from "@actions/core";
import fs from "fs";
import { Tool, getTool } from "./inputs";
import { triggerPrAnalysis, uploadInputFiles } from "./pixee-platform";
import {
  SONAR_RESULT,
  getSonarInputs,
  retrieveSonarHotspots,
  retrieveSonarIssues,
} from "./sonar";
import { getDefectDojoInputs, retrieveDefectDojoResults } from "./defect-dojo";
import { getGitHubContext, getTempDir } from "./github";
import { getContrastInputs, retrieveContrastResults } from "./contrast";

interface SonarResults {
  totalResults: number;
  results: any;
}

const MAX_PAGE_SIZE = 500;

/**
 * Runs the action.
 *
 * Presently only handles the case where the tool is Sonar and the file is not provided and therefore must be retrieved as part of a check_run. We will exapnd this to handle other types of GitHub events.
 *
 * If the event is associated with a PR, the action will trigger a PR analysis.
 */
export async function run() {
  const tool = getTool();

  // if the file input is provided, upload the file
  const inputFile = core.getInput("file");
  if (inputFile) {
    await uploadInputFiles(tool, new Array(inputFile));
    core.info(`Uploaded ${inputFile} for ${tool} to Pixeebot for analysis`);
  } else {
    // if the file input is not provided, automatically fetch the results and upload them, if supported
    switch (tool) {
      case "contrast":
        const contrastFile = await fetchOrLocateContrastResultsFile();
        await uploadInputFiles(tool, new Array(contrastFile));
        core.info(`Uploaded ${contrastFile} to Pixeebot for analysis`);
        break;
      case "defectdojo":
        const file = await fetchOrLocateDefectDojoResultsFile();
        await uploadInputFiles(tool, new Array(file));
        core.info(`Uploaded ${file} to Pixeebot for analysis`);
        break;
      case "sonar":
        const issuesfiles = await fetchOrLocateSonarResultsFile("issues");
        await uploadInputFiles("sonar", issuesfiles);
        core.info(`Uploaded ${issuesfiles} to Pixeebot for analysis`);

        const hotspotFiles = await fetchOrLocateSonarResultsFile("hotspots");
        await uploadInputFiles("sonar", hotspotFiles);
        core.info(`Uploaded ${hotspotFiles} to Pixeebot for analysis`);
        break;
      default:
        throw new Error(`Tool "${tool}" requires a file input`);
    }
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
  let results = await fetchContrastFindings();
  let fileName = "contrast-findings.xml";

  return fetchOrLocateResultsFile("contrast", results, fileName, false);
}

async function fetchOrLocateSonarResultsFile(
  resultType: SONAR_RESULT,
): Promise<Array<string>> {
  let page = 1;
  const files = new Array();
  let isAllResults = false;

  while (!isAllResults) {
    let sonarResults =
      resultType == "issues"
        ? await fetchSonarIssues(MAX_PAGE_SIZE, page)
        : await fetchSonarHotspots(MAX_PAGE_SIZE, page);
    let fileName = `sonar-${resultType}-${page}.json`;

    let file = await fetchOrLocateResultsFile(
      "sonar",
      sonarResults.results,
      fileName,
    );

    let total = sonarResults.totalResults;

    files.push(file);

    isAllResults = page * MAX_PAGE_SIZE >= total;
    page++;
  }

  return files;
}

async function fetchOrLocateResultsFile(
  tool: Tool,
  results: any,
  fileName: string,
  stringifyResults: boolean = true,
) {
  let file = core.getInput("file");
  if (file !== "") {
    return file;
  }

  const tmp = getTempDir();
  file = core.toPlatformPath(`${tmp}/${fileName}`);

  const fileContent = stringifyResults ? JSON.stringify(results) : results;
  fs.writeFileSync(file, fileContent);

  const logMessage = `Saved ${tool} results to ${file}`;
  core.info(logMessage);

  return file;
}

async function fetchSonarIssues(
  pageSize: number,
  page: number,
): Promise<SonarResults> {
  const sonarInputs = getSonarInputs();
  const results = await retrieveSonarIssues(sonarInputs, pageSize, page);

  core.info(
    `Found ${results.total} Sonar issues for component ${sonarInputs.componentKey}`,
  );
  if (results.total === 0) {
    core.info(
      `When the Sonar token is incorrect, Sonar responds with an empty response indistinguishable from cases where there are no issues. If you expected issues, please check the token.`,
    );
  }

  return { results, totalResults: results.total };
}

async function fetchSonarHotspots(
  pageSize: number,
  page: number,
): Promise<SonarResults> {
  const sonarInputs = getSonarInputs();
  const results = await retrieveSonarHotspots(sonarInputs, pageSize, page);
  core.info(
    `Found ${results.paging.total} Sonar hotspots for component ${sonarInputs.componentKey}`,
  );

  return { results, totalResults: results.paging.total };
}

async function fetchDefectDojoFindings() {
  const inputs = getDefectDojoInputs();
  const findings = await retrieveDefectDojoResults(inputs);
  core.info(
    `Found ${findings.count} DefectDojo findings for component ${inputs.productName}`,
  );

  return findings;
}

async function fetchContrastFindings(): Promise<any> {
  const inputs = getContrastInputs();
  const results = await retrieveContrastResults(inputs);

  core.info(`Found Contrast findings`);
  return results;
}
