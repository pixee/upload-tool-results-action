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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerPrAnalysis = exports.uploadInputFile = void 0;
const core = __importStar(require("@actions/core"));
const util_1 = require("./util");
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const form_data_1 = __importDefault(require("form-data"));
const UTF = 'utf-8';
const AUDIENCE = 'https://app.pixee.ai';
function uploadInputFile(inputs) {
    const fileContent = fs_1.default.readFileSync(inputs.file, UTF);
    const form = new form_data_1.default();
    form.append('file', fileContent);
    const tokenPromise = core.getIDToken(AUDIENCE);
    tokenPromise.then(token => {
        try {
            const { url, tool } = inputs;
            axios_1.default.put((0, util_1.buildApiUrl)('upload', url, null, tool), form, {
                headers: {
                    ...form.getHeaders(),
                    Authorization: `Bearer ${token}`,
                },
            })
                .then(response => {
                if (response.status != 204) {
                    core.setFailed(`Failed response status: ${response.status}`);
                    return;
                }
            })
                .catch(error => (0, util_1.buildError)(error));
        }
        catch (error) {
            (0, util_1.buildError)(error);
        }
    });
}
exports.uploadInputFile = uploadInputFile;
function triggerPrAnalysis(url, prNumber) {
    const tokenPromise = core.getIDToken(AUDIENCE);
    tokenPromise.then(token => {
        try {
            axios_1.default.post((0, util_1.buildApiUrl)('trigger', url, prNumber), null, {
                headers: {
                    contentType: 'application/json',
                    Authorization: `Bearer ${token}`
                }
            })
                .then(response => {
                if (response.status != 204) {
                    core.setFailed(`Failed response status: ${response.status}`);
                    return;
                }
            })
                .catch(error => (0, util_1.buildError)(error));
        }
        catch (error) {
            (0, util_1.buildError)(error);
        }
    });
}
exports.triggerPrAnalysis = triggerPrAnalysis;
//# sourceMappingURL=analysis-input-resource.js.map