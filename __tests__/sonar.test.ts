import * as github from "../src/github";
import { buildSonarUrl, SonarInputs } from "../src/sonar";

let getGitHubContextMock: jest.SpiedFunction<typeof github.getGitHubContext>;

describe("sonar", () => {
  const sonarHostUrl = "https://sonar.io/api";
  const path = "api/issues/search";
  const componentKey = "myComponent";
  const sonarInputs = {
    token: "",
    sonarHostUrl,
    componentKey,
  };

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

    const result = buildSonarUrl({
      sonarInputs,
      path,
      queryParamKey: "componentKeys",
    });

    expect(result).toBe(
      "https://sonar.io/api/issues/search?componentKeys=myComponent&resolved=false&ps=500&pullRequest=123",
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
    });

    expect(result).toBe(
      "https://sonar.io/api/issues/search?componentKeys=myComponent&resolved=false&ps=500",
    );
  });

  it("should build the URL correctly with queryParamKey projectKey", async () => {
    getGitHubContextMock.mockReturnValue({
      owner: "owner",
      repo: "repo",
      sha: "sha",
      prNumber: 123,
    });

    const result = buildSonarUrl({
      sonarInputs,
      path,
      queryParamKey: "projectKey",
    });

    expect(result).toBe(
      "https://sonar.io/api/issues/search?projectKey=myComponent&resolved=false&ps=500&pullRequest=123",
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

    const sonarInputs = {
      token: "",
      sonarHostUrl,
      componentKey: specialComponentKey,
    } as SonarInputs;

    const result = buildSonarUrl({
      sonarInputs,
      path,
      queryParamKey: "componentKeys",
    });

    expect(result).toBe(
      "https://sonar.io/api/issues/search?componentKeys=myComponent+with+spaces&resolved=false&ps=500&pullRequest=123",
    );
  });

  it("should handle sonarHost with trailing slash correctly", async () => {
    const sonarHostWithSlash = "https://sonar.io/";
    getGitHubContextMock.mockReturnValue({
      owner: "owner",
      repo: "repo",
      sha: "sha",
      prNumber: 123,
    });

    const sonarInputs = {
      token: "",
      sonarHostUrl: sonarHostWithSlash,
      componentKey,
    } as SonarInputs;

    const result = buildSonarUrl({
      sonarInputs,
      path,
      queryParamKey: "componentKeys",
    });

    expect(result).toBe(
      "https://sonar.io/api/issues/search?componentKeys=myComponent&resolved=false&ps=500&pullRequest=123",
    );
  });
});
