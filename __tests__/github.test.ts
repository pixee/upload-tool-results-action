const fakeContext = {
  sha: "workflow-sha",
  repo: {
    owner: "owner",
    repo: "repo",
  },
};
describe("github", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("creates GitHubContext from push event", () => {
    jest.doMock("@actions/github", () => ({
      context: {
        ...fakeContext,
        eventName: "push",
      },
    }));
    const github = require("../src/github");

    const result = github.getGitHubContext();
    expect(result).toEqual({
      owner: "owner",
      repo: "repo",
      sha: "workflow-sha",
    });
  });

  it("creates GitHubContext from pull_request event", () => {
    jest.doMock("@actions/github", () => ({
      context: {
        ...fakeContext,
        eventName: "pull_request",
        issue: { number: 42 },
        payload: {
          pull_request: {
            head: { sha: "pr-sha" },
          },
        },
      },
    }));
    const github = require("../src/github");

    const result = github.getGitHubContext();
    expect(result).toEqual({
      owner: "owner",
      repo: "repo",
      sha: "pr-sha",
      prNumber: 42,
    });
  });

  it("creates GitHubContext from check_run event", () => {
    jest.doMock("@actions/github", () => ({
      context: {
        ...fakeContext,
        eventName: "check_run",
        payload: {
          check_run: {
            pull_requests: [{ number: 42 }],
            head_sha: "check-run-sha",
          },
        },
      },
    }));
    const github = require("../src/github");

    const result = github.getGitHubContext();
    expect(result).toEqual({
      owner: "owner",
      repo: "repo",
      sha: "check-run-sha",
      prNumber: 42,
    });
  });

  it("throws an error for unsupported event", () => {
    jest.doMock("@actions/github", () => ({
      context: {
        ...fakeContext,
        eventName: "unsupported",
      },
    }));
    const github = require("../src/github");

    expect(() => github.getGitHubContext()).toThrow(
      "Unsupported event: unsupported",
    );
  });
});
