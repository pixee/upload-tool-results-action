import axios from "axios";
import fs from "fs";
import { getGitHubContext } from "./inputs";
import { uploadInputFile } from "./pixee-platform";
import { buildError } from "./errors";

export function retrieveSonarCloudResults(inputs: SonarCloudInputs) {
  axios
    .get(buildSonarCloudUrl(inputs), {
      headers: {
        contentType: "application/json",
        Authorization: `Bearer ${inputs.token}`,
      },
      responseType: "json",
    })
    .then((response) => {
      fs.writeFileSync(FILE_NAME, JSON.stringify(response.data));
      uploadInputFile("sonar", FILE_NAME);
    })
    .catch((error) => buildError(error));
}

export interface SonarCloudInputs {
  token: string;
  componentKey: string;
  apiUrl: string;
}

function buildSonarCloudUrl(inputs: SonarCloudInputs): string {
  const { apiUrl, componentKey } = inputs;
  const { owner, repo, prNumber } = getGitHubContext();
  const defaultComponentKey = componentKey ? componentKey : `${owner}_${repo}`;

  return `${apiUrl}/issues/search?componentKeys=${defaultComponentKey}&resolved=false&pullRequest=${prNumber}`;
}

const FILE_NAME = "sonar_issues.json";
