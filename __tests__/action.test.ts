import * as os from "os";
import * as core from "@actions/core";
import { run } from "../src/action";
import * as pixee from "../src/pixee-platform";
import * as sonar from "../src/sonar";
import * as github from "../src/github";
import * as contrast from "../src/contrast";
import * as defectdojo from "../src/defect-dojo";

let getInputMock: jest.SpiedFunction<typeof core.getInput>;
let getGitHubContextMock: jest.SpiedFunction<typeof github.getGitHubContext>;
let getTempDir: jest.SpiedFunction<typeof github.getTempDir>;
let uploadInputFileMock: jest.SpiedFunction<typeof pixee.uploadInputFiles>;
let retrieveContrastResultsMock: jest.SpiedFunction<
  typeof contrast.retrieveContrastResults
>;
let retrieveDefectDojoResultsMock: jest.SpiedFunction<
  typeof defectdojo.retrieveDefectDojoResults
>;
let retrieveSonarIssuesMock: jest.SpiedFunction<
  typeof sonar.retrieveSonarIssues
>;
let retrieveSonarHotspotsMock: jest.SpiedFunction<
  typeof sonar.retrieveSonarHotspots
>;
let triggerPrAnalysisMock: jest.SpiedFunction<typeof pixee.triggerPrAnalysis>;
let getRepositoryInfoMock: jest.SpiedFunction<typeof github.getRepositoryInfo>;

const FILE_ONLY_TOOLS = ["semgrep", "snyk", "appscan", "checkmarx"];

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
      .spyOn(pixee, "uploadInputFiles")
      .mockImplementation();
    triggerPrAnalysisMock = jest
      .spyOn(pixee, "triggerPrAnalysis")
      .mockImplementation();
    retrieveContrastResultsMock = jest
      .spyOn(contrast, "retrieveContrastResults")
      .mockImplementation();
    retrieveDefectDojoResultsMock = jest
      .spyOn(defectdojo, "retrieveDefectDojoResults")
      .mockImplementation();
    retrieveSonarIssuesMock = jest
      .spyOn(sonar, "retrieveSonarIssues")
      .mockImplementation();
    retrieveSonarHotspotsMock = jest
      .spyOn(sonar, "retrieveSonarHotspots")
      .mockImplementation();
    getRepositoryInfoMock = jest
      .spyOn(github, "getRepositoryInfo")
      .mockImplementation();
    retrieveSonarIssuesMock.mockResolvedValue({ total: 1 });
    retrieveSonarHotspotsMock.mockResolvedValue({ paging: { total: 1 } });
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
    getRepositoryInfoMock.mockReturnValue({
      owner: "owner",
      repo: "repo",
    });
    triggerPrAnalysisMock.mockResolvedValue(undefined);

    await run();

    expect(triggerPrAnalysisMock).toHaveBeenCalledWith(42);
  });

  describe("when the file input is not empty", () => {
    beforeEach(() => {
      getGitHubContextMock.mockReturnValue({
        owner: "owner",
        repo: "repo",
        sha: "sha",
      });
      getRepositoryInfoMock.mockReturnValue({
        owner: "owner",
        repo: "repo",
      });
    });

    it("should upload the given file instead of automatically fetching Sonar results", async () => {
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

      await run();

      expect(uploadInputFileMock).toHaveBeenCalledWith(
        "sonar",
        new Array("file.json"),
      );
      expect(retrieveSonarIssuesMock).not.toHaveBeenCalled();
      expect(retrieveSonarHotspotsMock).not.toHaveBeenCalled();
    });

    it("should upload the given file instead of automatically fetching Contrast results", async () => {
      getInputMock.mockImplementation((name: string) => {
        switch (name) {
          case "tool":
            return "contrast";
          case "file":
            return "file.json";
          default:
            return "";
        }
      });

      await run();

      expect(uploadInputFileMock).toHaveBeenCalledWith(
        "contrast",
        new Array("file.json"),
      );
      expect(retrieveContrastResultsMock).not.toHaveBeenCalled();
    });

    it("should upload the given file instead of automatically fetching DefectDojo results", async () => {
      getInputMock.mockImplementation((name: string) => {
        switch (name) {
          case "tool":
            return "defectdojo";
          case "file":
            return "file.json";
          default:
            return "";
        }
      });

      await run();

      expect(uploadInputFileMock).toHaveBeenCalledWith(
        "defectdojo",
        new Array("file.json"),
      );
      expect(retrieveDefectDojoResultsMock).not.toHaveBeenCalled();
    });

    it.each(FILE_ONLY_TOOLS)(
      "should upload the given file for the tool",
      async (tool) => {
        getInputMock.mockImplementation((name: string) => {
          switch (name) {
            case "tool":
              return tool;
            case "file":
              return "file.json";
            default:
              return "";
          }
        });

        await run();

        expect(uploadInputFileMock).toHaveBeenCalledWith(
          tool,
          new Array("file.json"),
        );
      },
    );
  });

  describe("when the file input is empty", () => {
    it.each(FILE_ONLY_TOOLS)(
      "should throw an error, when the tool does not support automatic fetching of results",
      async (tool) => {
        // TODO
        getInputMock.mockImplementation((name: string) => {
          switch (name) {
            case "tool":
              return tool;
            default:
              return "";
          }
        });
        getGitHubContextMock.mockReturnValue({
          owner: "owner",
          repo: "repo",
          sha: "sha",
        });

        expect(run()).rejects.toThrow(`Tool "${tool}" requires a file input`);
      },
    );

    it("should retrieve the Sonar results, when the tool is Sonar", async () => {
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
        repo: "repo",
      });

      await run();

      expect(retrieveSonarIssuesMock).toHaveBeenCalled();
      expect(retrieveSonarHotspotsMock).toHaveBeenCalled();
      expect(uploadInputFileMock).toHaveBeenCalled();
    });
  });
});
