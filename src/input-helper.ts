import * as core from '@actions/core'
import {UserError} from "./util";
import {SonarcloudInputs, Tool, VALID_TOOLS} from "./shared";

/**
 * Helper to get all the inputs for the action
 */
export function getTool(): Tool {
    const tool = core.getInput('tool', {required: true}) as Tool;
    validateTool(tool)

    return tool
}

export function getSonarcloudInputs(): SonarcloudInputs {
    const token = core.getInput('sonar-token');
    const componentKey = core.getInput('sonar-component-key', {required: true});
    const urlApi = core.getInput('sonar-api', {required: true});

    return { token, componentKey, urlApi}
}

function validateTool(tool: Tool) {
    if (!VALID_TOOLS.includes(tool)) {
        throw new UserError(`Invalid tool "${tool}". The tool must be one of: ${VALID_TOOLS.join(', ')}.`);
    }
}
