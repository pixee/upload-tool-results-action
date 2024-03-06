import * as core from "@actions/core";
import * as action from "./action";

/**
 * Entry point of the Pixee Actions.
 * Executes the `run` function from the `action` module.
 * Catches any errors thrown and sets the failure message using `core.setFailed`.
 */
export async function run() {
  try {
    await action.run();
  } catch (error) {
    core.setFailed(`${(error as any)?.message ?? error}`);
  }
}
