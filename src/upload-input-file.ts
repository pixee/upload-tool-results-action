import * as core from "@actions/core";
import { buildError } from "./errors";
import { getSonarCloudInputs, getTool } from "./inputs";
import { retrieveSonarCloudResults } from "./sonar";
import { uploadInputFile } from "./pixee-platform";

async function run() {
  try {
    const tool = getTool();

    // This is special behavior for SonarCloud that we either don't yet have for other supported tools
    if (tool === "sonar") {
      const inputs = getSonarCloudInputs();
      retrieveSonarCloudResults(inputs);
      return;
    }

    const file = core.getInput("file", { required: true });
    uploadInputFile(tool, file);

    core.setOutput("status", "success");
  } catch (error) {
    buildError(error);
  }
}

async function runWrapper() {
  await run();
}

void runWrapper();
