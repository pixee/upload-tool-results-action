import * as core from '@actions/core'
import {UserError} from "./util";
import {SonarCloudInputs, Tool, VALID_TOOLS} from "./shared";

/**
 * Helper to get all the inputs for the action
 */
export function getTool(): Tool {
    const tool = core.getInput('tool', {required: true}) as Tool;
    validateTool(tool)

    return tool
}

export function getSonarCloudInputs(): SonarCloudInputs {
    const token = core.getInput('sonar-token');
    const apiUrl = core.getInput('sonar-api-url', {required: true});

    return { token, apiUrl}
}

function validateTool(tool: Tool) {
    if (!VALID_TOOLS.includes(tool)) {
        throw new UserError(`Invalid tool "${tool}". The tool must be one of: ${VALID_TOOLS.join(', ')}.`);
    }
}
