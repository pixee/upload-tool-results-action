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

- `url`:
    - **Description:** The endpoint URL where the file will be uploaded. (Optional)
    - **Required:** No

### Outputs

- `status`:
    - **Description:** The status of the upload process.

### Example Usage

For copy/paste usable example workflows, refer to the [examples folder](../examples).

- [Upload file](../examples/upload-file.yml)
