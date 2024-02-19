## Analysis Input Pixee Action

This composite action combines the update-file and trigger actions into one comprehensive action that applies Pixee's automated fixes to this repository.

### Inputs

- `file`:
    - **Description:** The file to be uploaded.
    - **Required:** Yes

- `tool`:
    - **Description:** Identifies the tool or service that produced the file being uploaded.
    - **Required:** Yes
    - **Options:**
        - `sonar`
        - `codeql`
        - `semgrep`

- `url`:
    - **Description:** The Pixee service to which the file will be uploaded. (Optional).
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
