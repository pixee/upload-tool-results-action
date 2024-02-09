export interface UploadInputs {
    /**
     * File to be uploaded.
     */
    file: string

    /**
     * Endpoint URL where the file will be uploaded.
     */
    url: string

    /**
     * Specific property identifying the tool or service related to the uploaded file.
     */
    tool: string
}
