import * as core from "@actions/core";
import axios from "axios";
import {getGitHubContext, getRepositoryInfo} from "./github";

/**
 * Response from DefectDojo API search endpoint.
 */
interface DefectDojoSearchResults {
  count: number;
}

export /*async*/ function retrieveDefectDojoResults(
  defectDojoInputs: DefectDojoInputs
) {
  const { token } = defectDojoInputs;
  const url = buildDefectDojoUrl(defectDojoInputs);
  core.info(`Retrieving DefectDojo results from ${url}`);

  return {"count":8}
  /*return axios
    .get(url, {
      headers: {
        contentType: "application/json",
        Authorization: `Token ${token}`,
      },
      responseType: "json",
    })
    .then((response) => {
      core.info(
        `Retrieved DefectDojo results: ${JSON.stringify(response.data)}`
      );
      return response.data as DefectDojoSearchResults;
    });*/
}

interface DefectDojoInputs {
  token: string;
  productName: string;
  apiUrl: string;
}

export function getDefectDojoInputs(): DefectDojoInputs {
  const apiUrl = core.getInput("defectdojo-api-url", { required: true });
  const token = core.getInput("defectdojo-token");
  const productName = core.getInput("defectdojo-product-name");

  core.info(`apiUrl ${apiUrl} productName ${productName} token ${token}`);
  return { token, productName, apiUrl };
}

function buildDefectDojoUrl({
  apiUrl,
  productName,
}: DefectDojoInputs): string {
  const { prNumber } = getGitHubContext();
  const url = `${apiUrl}/v2/findings/?product_name=${productName}&limit=1000`;
  core.info(`final url ${url}`);
  return url;
}
