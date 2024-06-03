import * as core from "@actions/core";
import axios from "axios";
import { getGitHubContext, getRepositoryInfo } from "./github";

/**
 * Response from SonarCloud API search endpoint. Sparse implementation, because we only care about the total number of issues.
 */
interface SonarSearchIssuesResult {
  total: number;
}

interface SonarSearchHotspotResult {
  paging: SonarSearchHotspotPaging;
}

interface SonarSearchHotspotPaging {
  total: number;
}

export type SONAR_RESULT = "issues" | "hotspots";

const MAX_PAGE_SIZE = 500;

export async function retrieveSonarCloudIssues(
  sonarCloudInputs: SonarCloudInputs,
): Promise<SonarSearchIssuesResult> {
  const url = buildSonarCloudIssuesUrl(sonarCloudInputs);
  return retrieveSonarCloudResults(sonarCloudInputs, url, "issues");
}

export async function retrieveSonarCloudHotspots(
  sonarCloudInputs: SonarCloudInputs,
): Promise<SonarSearchHotspotResult> {
  const url = buildSonarCloudHotspotsUrl(sonarCloudInputs);
  return retrieveSonarCloudResults(sonarCloudInputs, url, "hotspots");
}

async function retrieveSonarCloudResults(
  { token }: SonarCloudInputs,
  url: string,
  resultType: SONAR_RESULT,
) {
  core.info(`Retrieving SonarCloud ${resultType} from ${url}`);
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
        core.info(
          `Retrieved SonarCloud ${resultType}: ${JSON.stringify(response.data)}`,
        );
      }
      return response.data;
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

function buildSonarCloudIssuesUrl({
  apiUrl,
  componentKey,
}: SonarCloudInputs): string {
  const { prNumber } = getGitHubContext();
  const url = `${apiUrl}/issues/search?componentKeys=${encodeURIComponent(
    componentKey,
  )}&resolved=false&ps=${MAX_PAGE_SIZE}`;
  return prNumber ? `${url}&pullRequest=${prNumber}` : url;
}

function buildSonarCloudHotspotsUrl({
  apiUrl,
  componentKey,
}: SonarCloudInputs): string {
  const { prNumber } = getGitHubContext();
  const url = `${apiUrl}/hotspots/search?projectKey=${encodeURIComponent(
    componentKey,
  )}&resolved=false&ps=${MAX_PAGE_SIZE}`;
  return prNumber ? `${url}&pullRequest=${prNumber}` : url;
}
