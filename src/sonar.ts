import * as core from "@actions/core";
import axios from "axios";
import {getGitHubContext, getRepositoryInfo} from "./github";

/**
 * Response from SonarCloud API search endpoint. Sparse implementation, because we only care about the total number of issues.
 */
interface SonarSearchResults {
  total: number;
}

export type SONAR_OUTPUT = "issues" | "hotspots"

export async function retrieveSonarCloudResults(
  sonarCloudInputs: SonarCloudInputs,
  output: SONAR_OUTPUT
) {
  const { token } = sonarCloudInputs;
  const url = buildSonarCloudUrl(sonarCloudInputs, output);
  core.debug(`Retrieving SonarCloud ${output} from ${url}`);
  return axios
    .get(url, {
      headers: {
        contentType: "application/json",
        Authorization: `Bearer ${token}`,
      },
      responseType: "json",
    })
    .then((response) => {
      if (core.isDebug()) {
        core.debug(
          `Retrieved SonarCloud ${output}: ${JSON.stringify(response.data)}`
        );
      }
      return response.data as SonarSearchResults;
    });
}

interface SonarCloudInputs {
  token: string;
  componentKey: string;
  apiUrl: string;
}

export function getSonarCloudInputs(): SonarCloudInputs {
  const apiUrl = core.getInput("sonar-api-url", { required: true });
  const token = core.getInput("sonar-token");
  let componentKey = core.getInput("sonar-component-key");
  if (!componentKey) {
    const { owner, repo } = getRepositoryInfo();
    componentKey = `${owner}_${repo}`;
  }
  return { token, componentKey, apiUrl };
}

function buildSonarCloudUrl({
  apiUrl,
  componentKey,
}: SonarCloudInputs,
  output: SONAR_OUTPUT
): string {
  const { prNumber } = getGitHubContext();
  const url = `${apiUrl}/${output}/search?componentKeys=${encodeURIComponent(
    componentKey
  )}&resolved=false`;
  return prNumber ? `${url}&pullRequest=${prNumber}` : url;
}
