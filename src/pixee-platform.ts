import * as core from "@actions/core";
import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import { TOOL_PATH } from "./inputs";
import {getGitHubContext, getRepositoryInfo} from "./github";

export async function uploadInputFile(tool: TOOL_PATH, files: Array<string>) {
  const form = new FormData();

  const path = require('path');

  // Append each file to the form data
  files.forEach(file => {
    const fileContent = fs.readFileSync(file);
  const baseFilename = path.basename(file);
    form.append("files", fileContent, baseFilename);
  });

  const pixeeUrl = core.getInput("pixee-api-url");
  const token = await core.getIDToken(pixeeUrl);
  const url = buildUploadApiUrl(tool);

  core.info(`Uploading files to url ${url}`);

  return axios
    .put(url, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`,
      },
    })
    .then(() => {
      // don't return the axios response
    });
}

export async function triggerPrAnalysis(prNumber: number) {
  const pixeeUrl = core.getInput("pixee-api-url");
  const token = await core.getIDToken(pixeeUrl);

  return axios
    .post(buildTriggerApiUrl(prNumber), null, {
      headers: {
        contentType: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    .then(() => {
      // don't return the axios response
    });
}

function buildTriggerApiUrl(prNumber: number): string {
  const { owner, repo } = getRepositoryInfo();
  const pixeeUrl = core.getInput("pixee-api-url");

  return `${pixeeUrl}/analysis-input/${owner}/${repo}/${prNumber}`;
}

function buildUploadApiUrl(tool: TOOL_PATH): string {
  const { owner, repo, sha } = getGitHubContext();
  const pixeeUrl = core.getInput("pixee-api-url");

  return `${pixeeUrl}/analysis-input/${owner}/${repo}/${sha}/${tool}`;
}
