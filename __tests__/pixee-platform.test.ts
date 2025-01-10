import fs from "fs";
import * as core from "@actions/core";
import * as tmp from "tmp";
import * as github from "../src/github";
import { uploadInputFiles } from "../src/pixee-platform";
import axios from "axios";

let getInputMock: jest.SpiedFunction<typeof core.getInput>;
let getIDTokenMock: jest.SpiedFunction<typeof core.getIDToken>;
let getGitHubContextMock: jest.SpiedFunction<typeof github.getGitHubContext>;

describe("pixee-platform", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getInputMock = jest.spyOn(core, "getInput").mockImplementation();
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
    getInputMock.mockImplementation((name: string) => {
      switch (name) {
        case "pixee-api-url":
          return "https://api.pixee.ai";
        default:
          return "";
      }
    });

    await uploadInputFiles("sonar", new Array(file.name));

    expect(axios.put).toHaveBeenCalledWith(
      "https://api.pixee.ai/analysis-input/owner/repo/sha/sonar",
      expect.anything(), // cannot assert the form content
      {
        headers: {
          Authorization: "Bearer token", // Assert the authorization header
          "content-type": expect.stringContaining("multipart/form-data"), // Assert the content type header
        },
      },
    );
  });

  it("uploads input files", async () => {
    const file1 = tmp.fileSync();
    fs.writeFileSync(file1.name, "{}");
    const file2 = tmp.fileSync();
    fs.writeFileSync(file2.name, "{}");
    // mock axios.put to avoid making a real HTTP request
    jest.spyOn(axios, "put").mockResolvedValue(undefined);
    getInputMock.mockImplementation((name: string) => {
      switch (name) {
        case "pixee-api-url":
          return "https://api.pixee.ai";
        default:
          return "";
      }
    });

    await uploadInputFiles("sonar", new Array(file1.name, file2.name));

    expect(axios.put).toHaveBeenCalledWith(
      "https://api.pixee.ai/analysis-input/owner/repo/sha/sonar",
      expect.anything(), // cannot assert the form content
      {
        headers: {
          Authorization: "Bearer token", // Assert the authorization header
          "content-type": expect.stringContaining("multipart/form-data"), // Assert the content type header
        },
      },
    );
  });
});
