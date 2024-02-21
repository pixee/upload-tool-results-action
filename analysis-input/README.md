## Analysis Input Pixee Action

This composite action combines the update-file and trigger actions into one comprehensive action that applies Pixee's automated fixes to this repository.

### Inputs

- `tool`:
    - **Description:** Identifies the tool or service that produced the file being uploaded.
    - **Required:** Yes
    - **Options:**
        - `sonar`
        - `codeql`
        - `semgrep`

**Note:** Please be aware that the properties related to SonarCloud (`sonar-token`, `sonar-component-key`, `sonar-api`) are only necessary if you are configuring the Sonar tool. If you are not using SonarCloud for analysis, you can safely omit these properties from your configuration.

- `file`:
    - **Description:** The file to be uploaded.
    - **Required:** No

- `sonar-token`:
    - **Description:** Access token for authenticating requests to SonarCloud.
    - **Required:** No

- `sonar-component-key`:
    - **Description:** Key identifying the SonarCloud component to be analyzed.
    - **Required:** No

- `sonar-api`:
    - **Description:** Base URL of the SonarCloud API.
    - **Required:** No

### Outputs

- `status`:
    - **Description:** Status of the action execution.
    - **Possible values:**
        - `error`: Indicates that the action encountered an error.
        - `success`: Indicates that the action completed successfully.

### Example Usage

For copy/paste usable example workflows, refer to the [examples folder](../examples).

- [Upload file](../examples/upload-file.yml)
