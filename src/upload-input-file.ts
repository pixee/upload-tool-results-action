import * as core from "@actions/core";
import {buildError, wrapError} from "./util";
import * as analysis from "./analysis-input-resource";
import {getInputs} from "./input-helper";


async function run() {
    const startedAt = (new Date()).toTimeString();
    core.setOutput("start-at", startedAt);

    try {
        const inputs = getInputs()
        analysis.uploadInputFile(inputs);

        core.setOutput("status", "success");
    } catch (error) {
        buildError(error)
    }
}

async function runWrapper() {
    await run();
}

void runWrapper();
