import * as core from "@actions/core";
import axios from "axios";
import fs from "fs";
import { getGitHubContext } from "./inputs";

export async function retrieveSonarCloudResults() {
  const sonarCloudInputs = getSonarCloudInputs();
  const { token } = sonarCloudInputs;
  const url = buildSonarCloudUrl(sonarCloudInputs);
  return axios
    .get(url, {
      headers: {
        contentType: "application/json",
        Authorization: `Bearer ${token}`,
      },
      responseType: "json",
    })
    .then((response) => {
      if (response.data.total === 0) {
        console.warn("No SonarCloud issues found. Is the Sonar token correct?");
      } else {
        console.info(
          `Found ${response.data.total} SonarCloud issues for component ${sonarCloudInputs.componentKey}`
        );
      }
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
  const apiUrl = core.getInput("sonar-api-url", { required: true });
  const token = core.getInput("sonar-token", { required: true });
  let componentKey = core.getInput("sonar-component-key");
  if (!componentKey) {
    const { owner, repo } = getGitHubContext();
    componentKey = `${owner}_${repo}`;
  }
  return { token, componentKey, apiUrl };
}

function buildSonarCloudUrl({
  apiUrl,
  componentKey,
}: SonarCloudInputs): string {
  const { prNumber } = getGitHubContext();
  const url = `${apiUrl}/issues/search?componentKeys=${encodeURIComponent(
    componentKey
  )}&resolved=false`;
  return prNumber ? `${url}&pullRequest=${prNumber}` : url;
}

const FILE_NAME = "sonar_issues.json";
