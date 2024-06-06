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

export function buildSonarCloudIssuesUrl({
  sonarHost,
  componentKey,
}: SonarCloudInputs): string {
  const { prNumber } = getGitHubContext();
  const path = "/api/issues/search";

  const queryParams = {
    componentKeys: componentKey,
    resolved: "false",
    ps: MAX_PAGE_SIZE,
    ...(prNumber && { pullRequest: prNumber }),
  };

  return buildSonarCloudUrl({ sonarHost, path, queryParams });
}

export async function retrieveSonarCloudHotspots(
  sonarCloudInputs: SonarCloudInputs,
): Promise<SonarSearchHotspotResult> {
  const url = buildSonarCloudHotspotsUrl(sonarCloudInputs);
  return retrieveSonarCloudResults(sonarCloudInputs, url, "hotspots");
}

export function buildSonarCloudHotspotsUrl({
  sonarHost,
  componentKey,
}: SonarCloudInputs): string {
  const { prNumber } = getGitHubContext();
  const path = "/api/hotspots/search";

  const queryParams = {
    projectKey: componentKey,
    resolved: "false",
    ps: MAX_PAGE_SIZE,
    ...(prNumber && { pullRequest: prNumber }),
  };

  return buildSonarCloudUrl({ sonarHost, path, queryParams });
}

export function buildSonarCloudUrl({
  sonarHost,
  path,
  queryParams,
}: {
  sonarHost: string;
  path: string;
  queryParams: { [key: string]: string | number };
}): string {
  const baseApiUrl = new URL(sonarHost);
  const apiUrl = new URL(path, baseApiUrl);

  Object.entries(queryParams).forEach(([key, value]) => {
    apiUrl.searchParams.append(key, value.toString());
  });

  return apiUrl.href;
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
  sonarHost: string;
}

export function getSonarCloudInputs(): SonarCloudInputs {
  const sonarHost = core.getInput("sonar-host", { required: true });
  const token = core.getInput("sonar-token");
  let componentKey = core.getInput("sonar-component-key");
  if (!componentKey) {
    const { owner, repo } = getRepositoryInfo();
    componentKey = `${owner}_${repo}`;
  }
  return { token, componentKey, sonarHost };
}
