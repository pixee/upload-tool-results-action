import * as core from '@actions/core'
import {UploadInputs} from './upload-inputs'
import {UserError} from "./util";

export type Inputs = 'file' | 'url' | 'tool' | 'pr-number'
const VALID_TOOLS = ['sonar', 'codeql', 'semgrep'];

/**
 * Helper to get all the inputs for the action
 */
export function getInputs(): UploadInputs {
    const url = core.getInput('url');
    const file = getRequiredInput('file');
    const tool = getRequiredInput('tool');
    validateTool(tool)

    return {file, url, tool} as UploadInputs
}

function getRequiredInput(name: Inputs): string {
    const value = core.getInput(name);
    if (!value) {
        throw new UserError(`Input required and not supplied: ${name}`);
    }
    return value;
}

function validateTool(tool: string) {
    if (!VALID_TOOLS.includes(tool)) {
        throw new UserError(`Invalid tool "${tool}". The tool must be one of: ${VALID_TOOLS.join(', ')}.`);
    }
}
