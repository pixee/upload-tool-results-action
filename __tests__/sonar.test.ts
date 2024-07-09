import * as github from "../src/github";
import { buildSonarUrl, SonarInputs } from "../src/sonar";
import { GitHubContext } from "../src/github";

let getGitHubContextMock: jest.SpiedFunction<typeof github.getGitHubContext>;

describe("sonar", () => {
  const sonarHostUrl = "https://sonar.io/api";
  const path = "api/issues/search";
  const componentKey = "myComponent";

  const sonarInputs = {
    token: "",
    sonarHostUrl,
    componentKey,
  } as SonarInputs;

  const githubContext = {
    owner: "owner",
    repo: "repo",
    sha: "sha",
    prNumber: 123,
  } as GitHubContext;

  beforeEach(() => {
    jest.clearAllMocks();
    getGitHubContextMock = jest
      .spyOn(github, "getGitHubContext")
      .mockImplementation();
  });

  it("should build the URL with pullRequest parameter if prNumber exists", async () => {
    getGitHubContextMock.mockReturnValue(githubContext);

    const result = buildSonarUrl({
      sonarInputs,
      path,
      queryParamKey: "componentKeys",
      pageSize: 500,
      page: 1,
    });

    expect(result).toBe(
      "https://sonar.io/api/issues/search?componentKeys=myComponent&resolved=false&ps=500&p=1&pullRequest=123",
    );
  });

  it("should build the URL without pullRequest parameter if prNumber does not exist", async () => {
    getGitHubContextMock.mockReturnValue({
      owner: "owner",
      repo: "repo",
      sha: "sha",
      prNumber: undefined,
    });

    const result = buildSonarUrl({
      sonarInputs,
      path,
      queryParamKey: "componentKeys",
      pageSize: 500,
      page: 1,
    });

    expect(result).toBe(
      "https://sonar.io/api/issues/search?componentKeys=myComponent&resolved=false&ps=500&p=1",
    );
  });

  it("should build the URL correctly with queryParamKey projectKey", async () => {
    getGitHubContextMock.mockReturnValue(githubContext);

    const result = buildSonarUrl({
      sonarInputs,
      path,
      queryParamKey: "projectKey",
      pageSize: 500,
      page: 1,
    });

    expect(result).toBe(
      "https://sonar.io/api/issues/search?projectKey=myComponent&resolved=false&ps=500&p=1&pullRequest=123",
    );
  });

  it("should encode the componentKey properly", async () => {
    const specialComponentKey = "myComponent with spaces";
    getGitHubContextMock.mockReturnValue(githubContext);

    const sonarInputs = {
      token: "",
      sonarHostUrl,
      componentKey: specialComponentKey,
    } as SonarInputs;

    const result = buildSonarUrl({
      sonarInputs,
      path,
      queryParamKey: "componentKeys",
      pageSize: 500,
      page: 1,
    });

    expect(result).toBe(
      "https://sonar.io/api/issues/search?componentKeys=myComponent+with+spaces&resolved=false&ps=500&p=1&pullRequest=123",
    );
  });

  it("should handle sonarHost with trailing slash correctly", async () => {
    const sonarHostWithSlash = "https://sonar.io/";
    getGitHubContextMock.mockReturnValue(githubContext);

    const sonarInputs = {
      token: "",
      sonarHostUrl: sonarHostWithSlash,
      componentKey,
    } as SonarInputs;

    const result = buildSonarUrl({
      sonarInputs,
      path,
      queryParamKey: "componentKeys",
      pageSize: 500,
      page: 1,
    });

    expect(result).toBe(
      "https://sonar.io/api/issues/search?componentKeys=myComponent&resolved=false&ps=500&p=1&pullRequest=123",
    );
  });

  it("should build the URL correctly with append the path correctly beyond /context/", async () => {
    const sonarHostWithContext = "https://sonar.io/context/";

    getGitHubContextMock.mockReturnValue(githubContext);

    const sonarInputs = {
      token: "",
      sonarHostUrl: sonarHostWithContext,
      componentKey,
    } as SonarInputs;

    const result = buildSonarUrl({
      sonarInputs,
      path,
      queryParamKey: "projectKey",
      pageSize: 500,
      page: 1,
    });

    expect(result).toBe(
      "https://sonar.io/context/api/issues/search?projectKey=myComponent&resolved=false&ps=500&p=1&pullRequest=123",
    );
  });
});
