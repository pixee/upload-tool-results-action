import { buildSonarCloudIssuesUrl } from "../src/sonar";
import * as github from "../src/github";

let getGitHubContextMock: jest.SpiedFunction<typeof github.getGitHubContext>;

describe("sonar", () => {
  const sonarHost = "https://sonarcloud.io/api/";
  const componentKey = "myComponent";

  beforeEach(() => {
    jest.clearAllMocks();
    getGitHubContextMock = jest
      .spyOn(github, "getGitHubContext")
      .mockImplementation();
  });

  it("should build the URL with pullRequest parameter if prNumber exists", async () => {
    getGitHubContextMock.mockReturnValue({
      owner: "owner",
      repo: "repo",
      sha: "sha",
      prNumber: 123,
    });

    const result = buildSonarCloudIssuesUrl({
      token: "",
      sonarHost,
      componentKey,
    });

    expect(result).toBe(
      "https://sonarcloud.io/api/issues/search?componentKeys=myComponent&resolved=false&ps=500&pullRequest=123",
    );
  });

  it("should build the URL without pullRequest parameter if prNumber does not exist", async () => {
    getGitHubContextMock.mockReturnValue({
      owner: "owner",
      repo: "repo",
      sha: "sha",
      prNumber: undefined,
    });

    const result = buildSonarCloudIssuesUrl({
      token: "",
      sonarHost,
      componentKey,
    });

    expect(result).toBe(
      "https://sonarcloud.io/api/issues/search?componentKeys=myComponent&resolved=false&ps=500",
    );
  });

  it("should encode the componentKey properly", async () => {
    const specialComponentKey = "myComponent with spaces";
    getGitHubContextMock.mockReturnValue({
      owner: "owner",
      repo: "repo",
      sha: "sha",
      prNumber: 123,
    });

    const result = buildSonarCloudIssuesUrl({
      token: "",
      sonarHost,
      componentKey: specialComponentKey,
    });

    expect(result).toBe(
      "https://sonarcloud.io/api/issues/search?componentKeys=myComponent+with+spaces&resolved=false&ps=500&pullRequest=123",
    );
  });

  it("should handle sonarHost with trailing slash correctly", async () => {
    const sonarHostWithSlash = "https://sonarcloud.io/";
    getGitHubContextMock.mockReturnValue({
      owner: "owner",
      repo: "repo",
      sha: "sha",
      prNumber: 123,
    });

    const result = buildSonarCloudIssuesUrl({
      token: "",
      sonarHost: sonarHostWithSlash,
      componentKey,
    });

    expect(result).toBe(
      "https://sonarcloud.io/api/issues/search?componentKeys=myComponent&resolved=false&ps=500&pullRequest=123",
    );
  });
});
