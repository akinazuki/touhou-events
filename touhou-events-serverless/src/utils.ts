import { Buffer } from "node:buffer";
import { GITHUB_APIKEY } from "../.env";

export function serializeJSON(data: any, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    status,
  });
}
export const defaultGitHubHeader = {
  "Accept": "application/vnd.github+json",
  "Authorization": `Bearer ${GITHUB_APIKEY}`,
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "touhou-events-archive-sandbox",
};
export const defaultGithubCommitter = {
  name: "Touhou Events Archive Bot",
  email: "mnt@touhou.events",
};

export class GitHub {
  repository: string;
  constructor(repository: string) {
    this.repository = repository;
  }

  public async readFile(path: string) {
    return fetch(`https://api.github.com/repos/${this.repository}/contents/${path}`, {
      headers: defaultGitHubHeader,
    });
  }

  public async writeFile(path: string, content: string, message: string = `Update ${path}`, committer = defaultGithubCommitter) {
    const fileSHA = await this.readFile(path).then((r) => {
      if (!r.ok)
        return false;
      return r.json().then(r => (r as any).sha);
    });
    console.log(`File SHA: ${fileSHA}`);

    return fetch(`https://api.github.com/repos/${this.repository}/contents/${path}`, {
      method: "PUT",
      headers: {
        ...defaultGitHubHeader,
      },
      body: JSON.stringify({
        message,
        content: Buffer.from(content).toString("base64"),
        committer,
        sha: fileSHA,
      }),
    });
  }

  public async readJSONFile(path: string) {
    return await this.readFile(path).then(async (r) => {
      if (!r.ok)
        throw new Error(`Failed to fetch file: File: [ ${path} ] ${r.statusText}`);
      return await r.json().then(r => JSON.parse(Buffer.from((r as any).content, "base64").toString()));
    });
  }
}
