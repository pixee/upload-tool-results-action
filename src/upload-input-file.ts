import * as core from "@actions/core";
import {buildError} from "./util";
import * as analysis from "./pixee-service";
import {getSonarCloudInputs, getTool} from "./input-helper";


async function run() {
    const startedAt = (new Date()).toTimeString();
    core.setOutput("start-at", startedAt);

    try {
        const tool = getTool()

        // This is special behavior for SonarCloud that we either don't yet have for other supported tools
        if(tool === 'sonar'){
            const inputs =  getSonarCloudInputs()
            analysis.downloadSonarcloudFile(inputs)
            return
        }

        const file = core.getInput('file', {required: true});
        analysis.uploadInputFile(tool, file);

        core.setOutput("status", "success");
    } catch (error) {
        buildError(error)
    }
}

async function runWrapper() {
    await run();
}

void runWrapper();
