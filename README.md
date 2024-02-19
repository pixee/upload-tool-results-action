# GitHub Actions for Pixee

GitHub Actions for interacting with [Pixee](https://pixee.ai/), providing seamless integration for code analysis in your GitHub workflows.

## Actions

### 1. Analysis Input

This action analysis input combines the file upload and analysis trigger functionalities into one, streamlining and automating the analysis process within your development workflow.

### 2. Upload File

This action uploads a file to an AWS S3 bucket, simplifying the process of uploading relevant files for further processing or reference.

### 3. Trigger

This action triggers an analysis of pull requests on GitHub using Pixee. By automatically initiating the analysis in response to specific events, such as the opening of a pull request, this action seamlessly integrates the analysis process into your development workflow.

## Examples

For easy integration, check out the examples folder for ready-to-use workflow configurations:

- [Analysis input](examples/analysis-input.yml)
- [Upload file](examples/upload-file.yml)
- [Trigger](examples/trigger.yml)
