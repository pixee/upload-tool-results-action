## Upload File Pixee Action

This action facilitates the process of uploading files to an AWS S3 bucket for further processing or reference.

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

### Outputs

- `status`:
    - **Description:** Status of the action execution.
    - **Possible values:**
        - `error`: Indicates that the action encountered an error.
        - `success`: Indicates that the action completed successfully.

### Example Usage

For copy/paste usable example workflows, refer to the [examples folder](../examples).

- [Upload file](../examples/upload-file.yml)
