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
exports.UserError = exports.buildError = exports.wrapError = exports.getGithubContext = exports.buildApiUrl = void 0;
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const PIXEE_SAMBOX_URL = 'https://d22balbl18.execute-api.us-east-1.amazonaws.com/prod';
function buildApiUrl(type, url, prNumber, tool) {
    const customUrl = url ? url : PIXEE_SAMBOX_URL;
    const { owner, repo, number, sha } = getGithubContext();
    if (type === 'upload') {
        return `${customUrl}/analysis-input/${owner}/${repo}/${sha}/${tool}`;
    }
    return `${customUrl}/analysis-input/${owner}/${repo}/${prNumber ?? number}`;
}
exports.buildApiUrl = buildApiUrl;
function getGithubContext() {
    const { sha, issue: { owner, repo, number } } = github.context;
    return { owner, repo, number, sha };
}
exports.getGithubContext = getGithubContext;
function wrapError(error) {
    return error instanceof Error ? error : new Error(String(error));
}
exports.wrapError = wrapError;
function buildError(unwrappedError) {
    const error = wrapError(unwrappedError);
    const message = error.message;
    core.setFailed(message);
    return;
}
exports.buildError = buildError;
class UserError extends Error {
    constructor(message) {
        super(message);
    }
}
exports.UserError = UserError;
//# sourceMappingURL=util.js.map