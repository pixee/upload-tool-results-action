"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInputs = void 0;
const core = __importStar(require("@actions/core"));
const util_1 = require("./util");
const VALID_TOOLS = ['sonar', 'codeql', 'semgrep'];
/**
 * Helper to get all the inputs for the action
 */
function getInputs() {
    const url = core.getInput('url');
    const file = getRequiredInput('file');
    const tool = getRequiredInput('tool');
    validateTool(tool);
    return { file, url, tool };
}
exports.getInputs = getInputs;
function getRequiredInput(name) {
    const value = core.getInput(name);
    if (!value) {
        throw new util_1.UserError(`Input required and not supplied: ${name}`);
    }
    return value;
}
function validateTool(tool) {
    if (!VALID_TOOLS.includes(tool)) {
        throw new util_1.UserError(`Invalid tool "${tool}". The tool must be one of: ${VALID_TOOLS.join(', ')}.`);
    }
}
//# sourceMappingURL=input-helper.js.map