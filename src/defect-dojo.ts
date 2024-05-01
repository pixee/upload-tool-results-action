import * as core from "@actions/core";
import axios from "axios";
import {getGitHubContext, getRepositoryInfo} from "./github";

/**
 * Response from DefectDojo API search endpoint.
 */
interface DefectDojoSearchResults {
  count: number;
}

export function retrieveDefectDojoResults(
  defectDojoInputs: DefectDojoInputs
) {
  const { token } = defectDojoInputs;
  const url = buildDefectDojoUrl(defectDojoInputs);
  core.info(`Retrieving DefectDojo results from ${url}`);

  return axios
    .get(url, {
      headers: {
        contentType: "application/json",
        Authorization: `Token ${token}`,
      },
      responseType: "json",
    })
    .then((response) => {
      core.info(
        `Retrieved DefectDojo response: ${JSON.stringify(response)}`
      );
      return response.data as DefectDojoSearchResults;
    });

}

// TODO add missing input information
interface DefectDojoInputs {
  token: string;
  productName: string;
  apiUrl: string;
}

export function getDefectDojoInputs(): DefectDojoInputs {
  const apiUrl = core.getInput("defectdojo-api-url", { required: true });
  const token = core.getInput("defectdojo-token");
  let productName = core.getInput("defectdojo-product-name");
  if (!productName) {
    const { repo } = getRepositoryInfo();
    productName = repo;
  }

  core.info(`apiUrl ${apiUrl} productName ${productName} token ${token}`);
  return { token, productName, apiUrl };
}

function buildDefectDojoUrl({
  apiUrl,
  productName,
}: DefectDojoInputs): string {
  const { sha } = getGitHubContext();
  const url = `${apiUrl}/api/v2/findings/?product_name=${productName}&commit_hash=${sha}&limit=100`;
  core.info(`final url ${url}`);
  return url;
}
