import fs from "fs";
import * as core from "@actions/core";
import * as tmp from "tmp";
import * as github from "../src/github";
import { uploadInputFile } from "../src/pixee-platform";
import axios from "axios";

let getIDTokenMock: jest.SpiedFunction<typeof core.getIDToken>;
let getGitHubContextMock: jest.SpiedFunction<typeof github.getGitHubContext>;

describe("pixee-platform", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    tmp.setGracefulCleanup();
    getIDTokenMock = jest.spyOn(core, "getIDToken").mockResolvedValue("token");
    getGitHubContextMock = jest
      .spyOn(github, "getGitHubContext")
      .mockReturnValue({
        owner: "owner",
        repo: "repo",
        sha: "sha",
      });
  });

  it("uploads input file", async () => {
    const file = tmp.fileSync();
    fs.writeFileSync(file.name, "{}");
    // mock axios.put to avoid making a real HTTP request
    jest.spyOn(axios, "put").mockResolvedValue(undefined);

    await uploadInputFile("sonar_issues", file.name);

    expect(axios.put).toHaveBeenCalledWith(
      "https://api.pixee.ai/analysis-input/owner/repo/sha/sonar_issues",
      expect.anything(), // cannot assert the form content
      {
        headers: {
          Authorization: "Bearer token", // Assert the authorization header
          "content-type": expect.stringContaining("multipart/form-data"), // Assert the content type header
        },
      }
    );
  });
});
