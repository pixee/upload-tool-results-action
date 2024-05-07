import * as os from "os";
import * as core from "@actions/core";
import { run } from "../src/action";
import * as pixee from "../src/pixee-platform";
import * as sonar from "../src/sonar";
import * as github from "../src/github";

let getInputMock: jest.SpiedFunction<typeof core.getInput>;
let getGitHubContextMock: jest.SpiedFunction<typeof github.getGitHubContext>;
let getTempDir: jest.SpiedFunction<typeof github.getTempDir>;
let uploadInputFileMock: jest.SpiedFunction<typeof pixee.uploadInputFile>;
let retrieveSonarCloudIssuesMock: jest.SpiedFunction<
  typeof sonar.retrieveSonarCloudIssues
>;
let triggerPrAnalysisMock: jest.SpiedFunction<typeof pixee.triggerPrAnalysis>;
let getRepositoryInfoMock: jest.SpiedFunction<typeof github.getRepositoryInfo>;

describe("action", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getInputMock = jest.spyOn(core, "getInput").mockImplementation();
    getGitHubContextMock = jest
      .spyOn(github, "getGitHubContext")
      .mockImplementation();
    getTempDir = jest
      .spyOn(github, "getTempDir")
      .mockImplementation()
      .mockReturnValue(os.tmpdir());
    uploadInputFileMock = jest
      .spyOn(pixee, "uploadInputFile")
      .mockImplementation();
    triggerPrAnalysisMock = jest
      .spyOn(pixee, "triggerPrAnalysis")
      .mockImplementation();
    retrieveSonarCloudIssuesMock = jest
      .spyOn(sonar, "retrieveSonarCloudIssues")
      .mockImplementation();
    getRepositoryInfoMock = jest
      .spyOn(github, "getRepositoryInfo")
      .mockImplementation();
    retrieveSonarCloudIssuesMock.mockResolvedValue({ total: 1 });
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

      expect(run()).rejects.toThrow("Action not implemented for tool: semgrep");
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

      getRepositoryInfoMock.mockReturnValue({
        owner: "owner",
        repo: "repo"
      });

      await run();

      expect(retrieveSonarCloudIssuesMock).toHaveBeenCalled();
      expect(uploadInputFileMock).toHaveBeenCalledWith(
        "sonar",
        expect.stringMatching(/sonar-issues.json$/)
      );
    });
  });
});
