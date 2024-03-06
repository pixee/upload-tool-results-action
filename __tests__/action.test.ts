import * as core from "@actions/core";
import { run } from "../src/action";
import * as inputs from "../src/inputs";
import * as pixee from "../src/pixee-platform";
import * as sonar from "../src/sonar";

let getInputMock: jest.SpiedFunction<typeof core.getInput>;
let getGitHubContextMock: jest.SpiedFunction<typeof inputs.getGitHubContext>;
let uploadInputFileMock: jest.SpiedFunction<typeof pixee.uploadInputFile>;
let retrieveSonarCloudResultsMock: jest.SpiedFunction<
  typeof sonar.retrieveSonarCloudResults
>;
let triggerPrAnalysisMock: jest.SpiedFunction<typeof pixee.triggerPrAnalysis>;

describe("action", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getInputMock = jest.spyOn(core, "getInput").mockImplementation();
    getGitHubContextMock = jest
      .spyOn(inputs, "getGitHubContext")
      .mockImplementation();
    uploadInputFileMock = jest
      .spyOn(pixee, "uploadInputFile")
      .mockImplementation();
    triggerPrAnalysisMock = jest
      .spyOn(pixee, "triggerPrAnalysis")
      .mockImplementation();
    retrieveSonarCloudResultsMock = jest
      .spyOn(sonar, "retrieveSonarCloudResults")
      .mockImplementation();
    retrieveSonarCloudResultsMock.mockResolvedValue("file.json");
  });

  it("triggers PR analysis when the PR number is available", async () => {
    getGitHubContextMock.mockReturnValue({
      owner: "owner",
      repo: "repo",
      sha: "sha",
      prNumber: 42,
    });
    getInputMock.mockImplementation((name: string) => {
      switch (name) {
        case "tool":
          return "sonar";
        case "file":
          return "file.json";
        default:
          return "";
      }
    });
    triggerPrAnalysisMock.mockResolvedValue(undefined);

    await run();

    expect(triggerPrAnalysisMock).toHaveBeenCalledWith(42);
  });

  describe("when the file input is not empty", () => {
    it("should upload the given file", async () => {
      getInputMock.mockImplementation((name: string) => {
        switch (name) {
          case "tool":
            return "sonar";
          case "file":
            return "file.json";
          default:
            return "";
        }
      });
      getGitHubContextMock.mockReturnValue({
        owner: "owner",
        repo: "repo",
        sha: "sha",
      });

      await run();

      expect(uploadInputFileMock).toHaveBeenCalledWith("sonar", "file.json");
    });
  });

  describe("when the file input is empty", () => {
    it("should throw an error, when the tool is not Sonar", async () => {
      // TODO
      getInputMock.mockImplementation((name: string) => {
        switch (name) {
          case "tool":
            return "semgrep";
          default:
            return "";
        }
      });
      getGitHubContextMock.mockReturnValue({
        owner: "owner",
        repo: "repo",
        sha: "sha",
      });

      expect(run()).rejects.toThrow("missing input tool");
    });

    it("should retrieve the SonarCloud results, when the tool is Sonar", async () => {
      getInputMock.mockImplementation((name: string) => {
        switch (name) {
          case "tool":
            return "sonar";
          default:
            return "";
        }
      });
      getGitHubContextMock.mockReturnValue({
        owner: "owner",
        repo: "repo",
        sha: "sha",
      });

      await run();

      expect(retrieveSonarCloudResultsMock).toHaveBeenCalled();
      expect(uploadInputFileMock).toHaveBeenCalledWith("sonar", "file.json");
    });
  });
});
