import * as core from "@actions/core";
import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import { TOOL_PATH } from "./inputs";
import {getGitHubContext, getRepositoryInfo} from "./github";

export async function uploadInputFile(tool: TOOL_PATH, file: string) {
  const fileContent = fs.readFileSync(file, "utf-8");
  const form = new FormData();
  form.append("file", fileContent);

  const token = await core.getIDToken(AUDIENCE);
  const url = buildUploadApiUrl(tool)

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
  const token = await core.getIDToken(AUDIENCE);

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

  return `${PIXEE_URL}/${owner}/${repo}/${prNumber}`;
}

function buildUploadApiUrl(tool: TOOL_PATH): string {
  const { owner, repo, sha } = getGitHubContext();

  return `${PIXEE_URL}/${owner}/${repo}/${sha}/${tool}`;
}

const AUDIENCE = "https://app.pixee.ai";
// TODO revert
const PIXEE_URL = "https://requestbin.myworkato.com/1k9iolb1";
