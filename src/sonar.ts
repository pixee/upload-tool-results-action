import * as core from "@actions/core";
import axios from "axios";
import { getGitHubContext, getRepositoryInfo } from "./github";

/**
 * Response from Sonar API search endpoint. Sparse implementation, because we only care about the total number of issues.
 */
export interface SonarSearchIssuesResult {
  total: number;
}

export interface SonarSearchHotspotResult {
  paging: SonarSearchHotspotPaging;
}

interface SonarSearchHotspotPaging {
  total: number;
}

export type SONAR_RESULT = "issues" | "hotspots";
type QUERY_PARAM_KEY = "componentKeys" | "projectKey";

export async function retrieveSonarIssues(
  sonarInputs: SonarInputs,
  pageSize: number,
  page: number,
): Promise<SonarSearchIssuesResult> {
  const path = "api/issues/search";
  const url = buildSonarUrl({
    sonarInputs,
    path,
    queryParamKey: "componentKeys",
    pageSize,
    page,
  });
  return retrieveSonarResults(sonarInputs, url, "issues");
}

export async function retrieveSonarHotspots(
  sonarInputs: SonarInputs,
  pageSize: number,
  page: number,
): Promise<SonarSearchHotspotResult> {
  const path = "api/hotspots/search";
  const url = buildSonarUrl({
    sonarInputs,
    path,
    queryParamKey: "projectKey",
    pageSize,
    page,
  });
  return retrieveSonarResults(sonarInputs, url, "hotspots");
}

export function buildSonarUrl({
  sonarInputs: { sonarHostUrl, componentKey },
  path,
  queryParamKey,
  pageSize,
  page,
}: {
  sonarInputs: SonarInputs;
  path: string;
  queryParamKey: QUERY_PARAM_KEY;
  pageSize: number;
  page: number;
}): string {
  const apiUrl = new URL(path, sonarHostUrl);

  const { prNumber } = getGitHubContext();

  const queryParams = {
    [queryParamKey]: componentKey,
    resolved: "false",
    ps: pageSize,
    p: page,
    ...(prNumber && { pullRequest: prNumber }),
  };

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

export interface SonarInputs {
  token: string;
  componentKey: string;
  sonarHostUrl: string;
}

export function getSonarInputs(): SonarInputs {
  const sonarHostUrl = core.getInput("sonar-host-url", { required: true });
  const token = core.getInput("sonar-token");
  let componentKey = core.getInput("sonar-component-key");
  if (!componentKey) {
    const { owner, repo } = getRepositoryInfo();
    componentKey = `${owner}_${repo}`;
  }
  return { token, componentKey, sonarHostUrl };
}
