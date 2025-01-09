import * as core from "@actions/core";
import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import { Tool } from "./inputs";
import { getGitHubContext, getRepositoryInfo } from "./github";

export async function uploadInputFiles(tool: Tool, files: Array<string>) {
  const path = require("path");
  const pixeeUrl = core.getInput("pixee-api-url");
  const token = await core.getIDToken(pixeeUrl);
  const url = buildUploadApiUrl(tool);

  // Send each file in a separate request
  const uploads = files.map(async (file) => {
    const form = new FormData();
    form.append("files", fs.readFileSync(file), path.basename(file));

    return axios
      .put(url, form, {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        // don't return the axios response
        console.log(`Uploaded ${file} to ${url}`);
      })
      .catch((error) => {
        console.error(`Failed to upload ${file} to ${url}`, error);
        throw new Error(`Failed to upload ${file} to ${url}`);
      });
  });

  return Promise.all(uploads);
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

function buildUploadApiUrl(tool: Tool): string {
  const { owner, repo, sha } = getGitHubContext();
  const pixeeUrl = core.getInput("pixee-api-url");

  return `${pixeeUrl}/analysis-input/${owner}/${repo}/${sha}/${tool}`;
}
