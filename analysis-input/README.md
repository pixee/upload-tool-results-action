## Analysis Input Pixee Action

This composite action combines two key functionalities to simplify and automate analysis in the development workflow.

### Inputs

- `file`:
    - **Description:** The file to be uploaded.
    - **Required:** Yes

- `tool`:
    - **Description:** Identifies the tool or service related to the uploaded file.
    - **Required:** Yes
    - **Options:**
        - `sonar`
        - `codeql`
        - `semgrep`

- `url`:
    - **Description:** The endpoint URL where the file will be uploaded. (Optional)
    - **Required:** No

- `pr-number`:
    - **Description:** The PR number to trigger analysis for. (Optional)
    - **Required:** No

### Outputs

- `status`:
    - **Description:** The status of the analysis.

### Example Usage

For copy/paste usable example workflows, refer to the [examples folder](../examples).

- [Upload file](../examples/upload-file.yml)
