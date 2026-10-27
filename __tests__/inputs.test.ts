import * as core from "@actions/core";
import { getTool } from "../src/inputs";
import { UserError } from "../src/errors";

let getInputMock: jest.SpiedFunction<typeof core.getInput>;

const SUPPORTED_TOOLS = [
  "sonar",
  "codeql",
  "semgrep",
  "appscan",
  "contrast",
  "checkmarx",
  "polaris",
  "snyk",
];

describe("getTool", () => {
  beforeEach(() => {
    getInputMock = jest.spyOn(core, "getInput").mockImplementation();
  });

  it.each(SUPPORTED_TOOLS)("accepts the supported tool %s", (tool) => {
    getInputMock.mockReturnValue(tool);

    expect(getTool()).toBe(tool);
  });

  // A removed tool must be rejected locally with a message that lists the
  // supported tools, rather than being uploaded to the API.
  it("rejects defectdojo, a tool that is no longer supported", () => {
    getInputMock.mockReturnValue("defectdojo");

    expect(() => getTool()).toThrow(UserError);
    expect(() => getTool()).toThrow(
      'Invalid tool "defectdojo". The tool must be one of:',
    );
  });

  it("rejects an unknown tool", () => {
    getInputMock.mockReturnValue("not-a-tool");

    expect(() => getTool()).toThrow(
      'Invalid tool "not-a-tool". The tool must be one of:',
    );
  });
});
