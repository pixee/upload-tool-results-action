import * as core from "@actions/core";
import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import { TOOL_PATH } from "./inputs";
import { getGitHubContext, getRepositoryInfo } from "./github";
import { createWriteStream } from 'fs';

export async function uploadInputFiles(tool: TOOL_PATH, files: Array<string>) {
  const path = require('path');
  const archiver = require('archiver');
  const zip = archiver('zip', { zlib: { level: 9 } }); // Compression level
  const zipPath = path.join(__dirname, 'analysis-inputs.zip');
  const output = createWriteStream(zipPath);

  zip.pipe(output);
  files.forEach((file) => {
    zip.append(fs.createReadStream(file), { name: path.basename(file) });
  });
  await zip.finalize();

  const form = new FormData();
  form.append('file', fs.createReadStream(zipPath), { filename: 'analysis-inputs.zip', contentType: 'application/zip' });

  const pixeeUrl = core.getInput("pixee-api-url");
  const token = await core.getIDToken(pixeeUrl);
  const url = buildUploadApiUrl(tool);

  return axios
    .put(url, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`,
      },
    })
    .then(() => {
      // don't return the axios response
      fs.unlinkSync(zipPath);
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
