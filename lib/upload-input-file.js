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
const core = __importStar(require("@actions/core"));
const util_1 = require("./util");
const analysis = __importStar(require("./analysis-input-resource"));
const input_helper_1 = require("./input-helper");
async function run() {
    const startedAt = (new Date()).toTimeString();
    core.setOutput("start-at", startedAt);
    try {
        const inputs = (0, input_helper_1.getInputs)();
        analysis.uploadInputFile(inputs);
        core.setOutput("status", "success");
    }
    catch (error) {
        (0, util_1.buildError)(error);
    }
}
async function runWrapper() {
    try {
        await run();
    }
    catch (error) {
        core.setFailed(`Action failed: ${(0, util_1.wrapError)(error).message}`);
    }
}
void runWrapper();
//# sourceMappingURL=upload-input-file.js.map