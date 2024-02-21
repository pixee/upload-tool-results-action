import * as core from "@actions/core";
import {buildError} from "./util";
import * as analysis from "./pixee-service";
import {getRequiredInput, getSonarcloudInputs, getTool} from "./input-helper";


async function run() {
    const startedAt = (new Date()).toTimeString();
    core.setOutput("start-at", startedAt);

    try {
        const tool = getTool()

        if(tool === 'sonar'){
            const inputs =  getSonarcloudInputs()
            analysis.downloadSonarcloudFile(inputs)
            return
        }

        const file = getRequiredInput('file');
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
