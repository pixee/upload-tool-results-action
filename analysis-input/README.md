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

### Outputs

- `status`:
    - **Description:** Status of the action execution.
    - **Possible values:**
        - `error`: Indicates that the action encountered an error.
        - `success`: Indicates that the action completed successfully.

### Example Usage

For copy/paste usable example workflows, refer to the [examples folder](../examples).

- [Upload file](../examples/upload-file.yml)
