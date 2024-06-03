import * as core from "@actions/core";
import axios from "axios";
import { getRepositoryInfo } from "./github";

/**
 * Response from DefectDojo API search endpoint.
 */
interface DefectDojoSearchResults {
  count: number;
}

export async function retrieveDefectDojoResults(
  defectDojoInputs: DefectDojoInputs,
) {
  const { token } = defectDojoInputs;
  const url = buildDefectDojoUrl(defectDojoInputs);
  core.debug(`Retrieving DefectDojo results from ${url}`);

  return axios
    .get(url, {
      headers: {
        contentType: "application/json",
        Authorization: `Token ${token}`,
      },
      responseType: "json",
    })
    .then((response) => {
      core.debug(
        `Retrieved DefectDojo results: ${JSON.stringify(response.data)}`,
      );
      return response.data as DefectDojoSearchResults;
    });
}

interface DefectDojoInputs {
  token: string;
  productName: string;
  apiUrl: string;
}

export function getDefectDojoInputs(): DefectDojoInputs {
  const apiUrl = core.getInput("defectdojo-api-url");
  if (!apiUrl) {
    throw new Error("Require API URL for tool DefectDojo");
  }
  const token = core.getInput("defectdojo-token");
  let productName = core.getInput("defectdojo-product-name");
  if (!productName) {
    const { repo } = getRepositoryInfo();
    productName = repo;
  }
  return { token, productName, apiUrl };
}

function buildDefectDojoUrl({ apiUrl, productName }: DefectDojoInputs): string {
  // TODO define which queries need to be applied
  const url = `${apiUrl}/api/v2/findings/?product_name=${productName}&limit=100`;
  return url;
}
