import * as core from "@actions/core";
import axios from "axios";
import { getGitHubContext, getRepositoryInfo } from "./github";

/**
 * Response from Sonar API search endpoint. Sparse implementation, because we only care about the total number of issues.
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

export async function retrieveSonarIssues(
  sonarInputs: SonarInputs,
): Promise<SonarSearchIssuesResult> {
  const url = buildSonarIssuesUrl(sonarInputs);
  return retrieveSonarResults(sonarInputs, url, "issues");
}

export function buildSonarIssuesUrl({
  sonarHost,
  componentKey,
}: SonarInputs): string {
  const { prNumber } = getGitHubContext();
  const path = "/api/issues/search";

  const queryParams = {
    componentKeys: componentKey,
    resolved: "false",
    ps: MAX_PAGE_SIZE,
    ...(prNumber && { pullRequest: prNumber }),
  };

  return buildSonarUrl({ sonarHost, path, queryParams });
}

export async function retrieveSonarHotspots(
  sonarInputs: SonarInputs,
): Promise<SonarSearchHotspotResult> {
  const url = buildSonarHotspotsUrl(sonarInputs);
  return retrieveSonarResults(sonarInputs, url, "hotspots");
}

export function buildSonarHotspotsUrl({
  sonarHost,
  componentKey,
}: SonarInputs): string {
  const { prNumber } = getGitHubContext();
  const path = "/api/hotspots/search";

  const queryParams = {
    projectKey: componentKey,
    resolved: "false",
    ps: MAX_PAGE_SIZE,
    ...(prNumber && { pullRequest: prNumber }),
  };

  return buildSonarUrl({ sonarHost, path, queryParams });
}

export function buildSonarUrl({
  sonarHost,
  path,
  queryParams,
}: {
  sonarHost: string;
  path: string;
  queryParams: { [key: string]: string | number };
}): string {
  const apiUrl = new URL(path, sonarHost);

  Object.entries(queryParams).forEach(([key, value]) => {
    apiUrl.searchParams.append(key, value.toString());
  });

  return apiUrl.href;
}

async function retrieveSonarResults(
  { token }: SonarInputs,
  url: string,
  resultType: SONAR_RESULT,
) {
  core.info(`Retrieving Sonar ${resultType} from ${url}`);
  return axios
    .get(url, {
      headers: {
        contentType: "application/json",
        Authorization: `Bearer ${token}`,
      },
      responseType: "json",
    })
    .then((response) => {
      core.debug(
        `Retrieved Sonar ${resultType}: ${JSON.stringify(response.data)}`,
      );
      return response.data;
    });
}

interface SonarInputs {
  token: string;
  componentKey: string;
  sonarHost: string;
}

export function getSonarInputs(): SonarInputs {
  const sonarHost = core.getInput("sonar-host", { required: true });
  const token = core.getInput("sonar-token");
  let componentKey = core.getInput("sonar-component-key");
  if (!componentKey) {
    const { owner, repo } = getRepositoryInfo();
    componentKey = `${owner}_${repo}`;
  }
  return { token, componentKey, sonarHost };
}
