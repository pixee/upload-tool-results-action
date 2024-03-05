import * as core from "@actions/core";
import { buildError } from "./errors";
import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import { getGitHubContext, Tool } from "./inputs";

export function uploadInputFile(tool: Tool, file: string) {
  const fileContent = fs.readFileSync(file, "utf-8");
  const form = new FormData();
  form.append("file", fileContent);

  const tokenPromise = core.getIDToken(AUDIENCE);

  tokenPromise.then((token) => {
    try {
      axios
        .put(buildUploadApiUrl(tool), form, {
          headers: {
            ...form.getHeaders(),
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          if (response.status != 204) {
            core.setFailed(`Failed response status: ${response.status}`);
            return;
          }
        })
        .catch((error) => buildError(error));
    } catch (error) {
      buildError(error);
    }
  });
}

export function triggerPrAnalysis(prNumber: number) {
  const tokenPromise = core.getIDToken(AUDIENCE);

  tokenPromise.then((token) => {
    try {
      axios
        .post(buildTriggerApiUrl(prNumber), null, {
          headers: {
            contentType: "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          if (response.status != 204) {
            core.setFailed(`Failed response status: ${response.status}`);
            return;
          }
        })
        .catch((error) => buildError(error));
    } catch (error) {
      buildError(error);
    }
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
