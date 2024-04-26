import * as core from "@actions/core";
import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import { Tool } from "./inputs";
import {getGitHubContext, getRepositoryInfo} from "./github";

export async function uploadInputFile(tool: Tool, file: string) {
  try {
    const fileContent = fs.readFileSync(file, 'utf-8');
    const form = new FormData();
    form.append('file', fileContent);

    const token = await core.getIDToken(AUDIENCE);
    const url = buildUploadApiUrl(tool);

    await axios.put(url, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    // Log the error here
    console.error('Error occurred during uploadInputFile:', error);
    throw error; // rethrow the error to propagate it further if necessary
  }
}

export async function triggerPrAnalysis(prNumber: number) {
  try {
    const token = await core.getIDToken(AUDIENCE);

    await axios.post(buildTriggerApiUrl(prNumber), null, {
      headers: {
        'Content-Type': 'application/json', // corrected contentType to Content-Type
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    // Log the error here
    console.error('Error occurred during triggerPrAnalysis:', error);
    throw error; // rethrow the error to propagate it further if necessary
  }
}

function buildTriggerApiUrl(prNumber: number): string {
  const { owner, repo } = getRepositoryInfo();

  return `${PIXEE_URL}/${owner}/${repo}/${prNumber}`;
}

function buildUploadApiUrl(tool: string): string {
  const { owner, repo, sha } = getGitHubContext();

  return `${PIXEE_URL}/${owner}/${repo}/${sha}/${tool}`;
}

const AUDIENCE = "https://app.pixee.ai";
const PIXEE_URL = "https://lfqk75ktn4.execute-api.us-east-1.amazonaws.com/prod/analysis-input";
