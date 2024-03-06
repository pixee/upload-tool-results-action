import * as core from "@actions/core";
import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import { Tool, getGitHubContext } from "./inputs";

export async function uploadInputFile(tool: Tool, file: string) {
  const fileContent = fs.readFileSync(file, "utf-8");
  const form = new FormData();
  form.append("file", fileContent);

  const tokenPromise = core.getIDToken(AUDIENCE);

  tokenPromise.then((token) => {
    return axios.put(buildUploadApiUrl(tool), form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`,
      },
    });
  });
}

export async function triggerPrAnalysis(prNumber: number) {
  const token = await core.getIDToken(AUDIENCE);

  return axios
    .post(buildTriggerApiUrl(prNumber), null, {
      headers: {
        contentType: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      // don't return the axios response
    });
}

function buildTriggerApiUrl(prNumber: number): string {
  const { owner, repo } = getGitHubContext();

  return `${PIXEE_URL}/${owner}/${repo}/${prNumber}`;
}

function buildUploadApiUrl(tool: string): string {
  const { owner, repo, sha } = getGitHubContext();

  return `${PIXEE_URL}/${owner}/${repo}/${sha}/${tool}`;
}

const AUDIENCE = "https://app.pixee.ai";
const PIXEE_URL = "https://api.pixee.ai/analysis-input";
