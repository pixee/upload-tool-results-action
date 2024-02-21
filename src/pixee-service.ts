import * as core from "@actions/core";
import {buildError, buildSonarcloudUrl, buildTriggerApiUrl, buildUploadApiUrl} from "./util";
import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import {AUDIENCE, FILE_NAME, SonarCloudInputs, Tool, UTF} from "./shared";

export function downloadSonarcloudFile(inputs: SonarCloudInputs) {
    const {apiUrl, token} = inputs

    axios.get(buildSonarcloudUrl(apiUrl), {
        headers: {
            contentType: 'application/json',
            Authorization: `Bearer ${token}`
        },
        responseType: 'json'
    })
        .then(response => {
            fs.writeFileSync(FILE_NAME, JSON.stringify(response.data));
            uploadInputFile('sonar', FILE_NAME)
        })
        .catch(error => buildError(error));
}

export function uploadInputFile(tool: Tool, file: string) {
    const fileContent = fs.readFileSync(file, UTF);
    const form = new FormData();
    form.append('file', fileContent);

    const tokenPromise = core.getIDToken(AUDIENCE)

    tokenPromise.then(token => {
            try {
                axios.put(buildUploadApiUrl(tool), form, {
                    headers: {
                        ...form.getHeaders(),
                        Authorization: `Bearer ${token}`,
                    },
                })
                    .then(response => {
                        if (response.status != 204) {
                            core.setFailed(`Failed response status: ${response.status}`);
                            return
                        }
                    })
                    .catch(error => buildError(error));
            } catch (error) {
                buildError(error);
            }
        }
    )
}

export function triggerPrAnalysis(prNumber: number) {
    const tokenPromise = core.getIDToken(AUDIENCE)

    tokenPromise.then(token => {
        try {
            axios.post(buildTriggerApiUrl(prNumber), null, {
                headers: {
                    contentType: 'application/json',
                    Authorization: `Bearer ${token}`
                }
            })
                .then(response => {
                    if (response.status != 204) {
                        core.setFailed(`Failed response status: ${response.status}`);
                        return
                    }
                })
                .catch(error => buildError(error));
        } catch (error) {
            buildError(error)
        }
    })
}
