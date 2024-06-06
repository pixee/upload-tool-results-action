import { getGitHubContext } from "../src/github";
import { buildSonarCloudIssuesUrl } from "../src/sonar";
import * as github from "../src/github";

let getGitHubContextMock: jest.SpiedFunction<typeof github.getGitHubContext>;

describe("sonar", () => {
  const sonarHost = "https://sonarcloud.io";
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
      "https://sonarcloud.io/issues/search?componentKeys=myComponent&resolved=false&ps=500&pullRequest=123",
    );
  });

  it("should build the URL without pullRequest parameter if prNumber does not exist", () => {
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
      "https://sonarcloud.io/issues/search?componentKeys=myComponent&resolved=false&ps=500",
    );
  });

  it("should encode the componentKey properly", () => {
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
      "https://sonarcloud.io/issues/search?componentKeys=myComponent%2520with%2520spaces&resolved=false&ps=500&pullRequest=123",
    );
  });

  it("should handle sonarHost with trailing slash correctly", () => {
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
      "https://sonarcloud.io/issues/search?componentKeys=myComponent&resolved=false&ps=500&pullRequest=123",
    );
  });
});
