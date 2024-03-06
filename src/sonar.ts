import * as core from "@actions/core";
import axios from "axios";
import fs from "fs";
import { getGitHubContext } from "./inputs";

export async function retrieveSonarCloudResults() {
  const { token } = getSonarCloudInputs();
  const url = buildSonarCloudUrl();
  return axios
    .get(url, {
      headers: {
        contentType: "application/json",
        Authorization: `Bearer ${token}`,
      },
      responseType: "json",
    })
    .then((response) => {
      fs.writeFileSync(FILE_NAME, JSON.stringify(response.data));
      return FILE_NAME;
    });
}

interface SonarCloudInputs {
  token: string;
  componentKey: string;
  apiUrl: string;
}

function getSonarCloudInputs(): SonarCloudInputs {
  const token = core.getInput("sonar-token", { required: true });
  const componentKey = core.getInput("sonar-component-key");
  const apiUrl = core.getInput("sonar-api-url", { required: true });

  return { token, componentKey, apiUrl };
}

function buildSonarCloudUrl(): string {
  const { apiUrl, componentKey } = getSonarCloudInputs();
  const { owner, repo, prNumber } = getGitHubContext();
  const defaultComponentKey = componentKey ? componentKey : `${owner}_${repo}`;
  const url = `${apiUrl}/issues/search?componentKeys=${defaultComponentKey}&resolved=false`;
  return prNumber ? `${url}&pullRequest=${prNumber}` : url;
}

const FILE_NAME = "sonar_issues.json";
