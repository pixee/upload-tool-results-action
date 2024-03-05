import * as core from "@actions/core";

export function wrapError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

export function buildError(unwrappedError: unknown) {
  const error = wrapError(unwrappedError);
  const message = error.message;
  core.setOutput("status", "error");
  core.setFailed(message);
  return;
}

export class UserError extends Error {
  constructor(message: string) {
    super(message);
  }
}
