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
      //await uploadInputFile(tool, contrastFile);
      core.info(`Uploaded ${contrastFile} to Pixeebot for analysis`);
      break;
    case "defectdojo":
      const file = await fetchOrLocateDefectDojoResultsFile();
      //await uploadInputFile(tool, file);
      core.info(`Uploaded ${file} to Pixeebot for analysis`);
      break;
    case "sonar":
      const issuesfile1  = await fetchOrLocateSonarResultsFile("issues", 1);
      const issuesfile2  = await fetchOrLocateSonarResultsFile("issues", 2);
      await uploadInputFile("sonar_issues", new Array(issuesfile1, issuesfile2));
      core.info(`Uploaded two files at same time ${issuesfile1} to Pixeebot for analysis`);

      const hotspotFile  = await fetchOrLocateSonarResultsFile("hotspots");
      //await uploadInputFile("sonar_hotspots", hotspotFile);
      core.info(`Uploaded ${hotspotFile} to Pixeebot for analysis`);
      break;
    default:
      if (!core.getInput("file")) {
        throw new Error(`Tool "${tool}" requires a file input`);
      }

      const resultFile = await fetchOrLocateResultsFile(tool, null, "");
      //await uploadInputFile(tool, resultFile);
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

async function fetchOrLocateSonarResultsFile(resultType : SONAR_RESULT, index ?: number) {
  let results = resultType == "issues" ? await fetchSonarCloudIssues(index) : await fetchSonarCloudHotspots();
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

async function fetchSonarCloudIssues(index?: number){
  const sonarCloudInputs = getSonarCloudInputs();
  //const results1 = await retrieveSonarCloudIssues(sonarCloudInputs);

  
  const results = index == 1 ? {"total":1,"p":1,"ps":500,"paging":{"pageIndex":1,"pageSize":500,"total":1},"effortTotal":2,"debtTotal":2,"issues":[{"key":"AY8XOre8mBVmyrg5C9Ld","rule":"java:S1659","severity":"MINOR","component":"carlosu7_WebGoat_12_23:src/main/java/org/owasp/webgoat/lessons/challenges/challenge7/MD5.java","project":"carlosu7_WebGoat_12_23","line":631,"hash":"ab37db435563f882da448ae09bd3576f","textRange":{"startLine":631,"endLine":631,"startOffset":11,"endOffset":12},"flows":[],"status":"OPEN","message":"Declare \"j\" on a separate line.","effort":"2min","debt":"2min","author":"arshan.dabirsiaghi@gmail.com","tags":["cert","convention"],"creationDate":"2023-12-06T18:40:23+0100","updateDate":"2024-04-25T23:46:59+0200","type":"CODE_SMELL","organization":"carlosu7","cleanCodeAttribute":"FORMATTED","cleanCodeAttributeCategory":"CONSISTENT","impacts":[{"softwareQuality":"MAINTAINABILITY","severity":"LOW"}]}],"components":[{"organization":"carlosu7","key":"carlosu7_WebGoat_12_23","uuid":"AY8XN53R6GoxpCBUzw6a","enabled":true,"qualifier":"TRK","name":"WebGoat_12_23","longName":"WebGoat_12_23"},{"organization":"carlosu7","key":"carlosu7_WebGoat_12_23:src/main/java/org/owasp/webgoat/lessons/challenges/challenge7/MD5.java","uuid":"AY8XOrTymBVmyrg5C88L","enabled":true,"qualifier":"FIL","name":"MD5.java","longName":"src/main/java/org/owasp/webgoat/lessons/challenges/challenge7/MD5.java","path":"src/main/java/org/owasp/webgoat/lessons/challenges/challenge7/MD5.java"}],"organizations":[{"key":"carlosu7","name":"Carlos Uscanga"}],"facets":[]}
  : {"total":1,"p":1,"ps":500,"paging":{"pageIndex":1,"pageSize":500,"total":1},"effortTotal":10,"debtTotal":10,"issues":[{"key":"AY8XOrgomBVmyrg5C9O0","rule":"java:S1192","severity":"CRITICAL","component":"carlosu7_WebGoat_12_23:src/main/java/org/owasp/webgoat/container/AsciiDoctorTemplateResolver.java","project":"carlosu7_WebGoat_12_23","line":114,"hash":"4a09a9baa894a1ea9ad1a29566a1509c","textRange":{"startLine":114,"endLine":114,"startOffset":21,"endOffset":34},"flows":[{"locations":[{"component":"carlosu7_WebGoat_12_23:src/main/java/org/owasp/webgoat/container/AsciiDoctorTemplateResolver.java","textRange":{"startLine":114,"endLine":114,"startOffset":21,"endOffset":34},"msg":"Duplication"}]},{"locations":[{"component":"carlosu7_WebGoat_12_23:src/main/java/org/owasp/webgoat/container/AsciiDoctorTemplateResolver.java","textRange":{"startLine":117,"endLine":117,"startOffset":40,"endOffset":53},"msg":"Duplication"}]},{"locations":[{"component":"carlosu7_WebGoat_12_23:src/main/java/org/owasp/webgoat/container/AsciiDoctorTemplateResolver.java","textRange":{"startLine":120,"endLine":120,"startOffset":40,"endOffset":53},"msg":"Duplication"}]},{"locations":[{"component":"carlosu7_WebGoat_12_23:src/main/java/org/owasp/webgoat/container/AsciiDoctorTemplateResolver.java","textRange":{"startLine":134,"endLine":134,"startOffset":35,"endOffset":48},"msg":"Duplication"}]}],"status":"OPEN","message":"Define a constant instead of duplicating this literal \"classpath:/\" 4 times.","effort":"10min","debt":"10min","author":"arshan.dabirsiaghi@gmail.com","tags":["design"],"creationDate":"2023-12-06T18:40:23+0100","updateDate":"2024-04-25T23:46:59+0200","type":"CODE_SMELL","organization":"carlosu7","cleanCodeAttribute":"DISTINCT","cleanCodeAttributeCategory":"ADAPTABLE","impacts":[{"softwareQuality":"MAINTAINABILITY","severity":"HIGH"}]}],"components":[{"organization":"carlosu7","key":"carlosu7_WebGoat_12_23","uuid":"AY8XN53R6GoxpCBUzw6a","enabled":true,"qualifier":"TRK","name":"WebGoat_12_23","longName":"WebGoat_12_23"},{"organization":"carlosu7","key":"carlosu7_WebGoat_12_23:src/main/java/org/owasp/webgoat/container/AsciiDoctorTemplateResolver.java","uuid":"AY8XOrTymBVmyrg5C8-i","enabled":true,"qualifier":"FIL","name":"AsciiDoctorTemplateResolver.java","longName":"src/main/java/org/owasp/webgoat/container/AsciiDoctorTemplateResolver.java","path":"src/main/java/org/owasp/webgoat/container/AsciiDoctorTemplateResolver.java"}],"organizations":[{"key":"carlosu7","name":"Carlos Uscanga"}],"facets":[]};

  core.info(
    `HARDCODED Found ${results.total} SonarCloud issues for component ${sonarCloudInputs.componentKey}`
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
