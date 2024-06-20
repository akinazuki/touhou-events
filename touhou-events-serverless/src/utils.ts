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

export function generateSteamLoginUrl(returnTo: string, realm: string) {
  const params = new URLSearchParams({
    openid_ns: "http://specs.openid.net/auth/2.0",
    openid_mode: "checkid_setup",
    openid_return_to: returnTo,
    openid_realm: realm,
    openid_identity: "http://specs.openid.net/auth/2.0/identifier_select",
    openid_claimed_id: "http://specs.openid.net/auth/2.0/identifier_select",
  });

  return `https://steamcommunity.com/openid/login?${params.toString()}`;
}

export async function validateSteamResponse(queryParams: URLSearchParams) {
  const params = new URLSearchParams(queryParams);
  params.append("openid.mode", "check_authentication");

  const steamValidationUrlPrefix = "https://steamcommunity.com/openid/login";
  const steamValidationUrl = `${steamValidationUrlPrefix}`;
  console.log("Validating Steam login:", steamValidationUrl);
  console.log("Steam login verification params:", params.toString());
  try {
    const response = await fetch(steamValidationUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const text = await response.text();
    if (text.includes("is_valid:true")) {
      const steamId = params.get("openid.claimed_id");
      if (!steamId) {
        return {
          status: false,
          error: "Steam login verification failed, no Steam ID found in response",
        };
      }

      return {
        status: true,
        steamId: steamId.split("/").pop(),
      };
    }
    else {
      return {
        status: false,
        error: "Steam login verification failed",
      };
    }
  }
  catch (error: any) {
    console.error("Error during Steam login verification:", error);
    return {
      error: error.message,
    };
  }
}

export async function getSteamUserInformation(steamId: string) {
  return fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_APIKEY}&steamids=${steamId}`)
    .then(r => r.json()).then(r => (r as any).response.players).then((r) => {
      if (!r || r.length === 0)
        return null;
      return r[0];
    });
}

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

  public async getFileSHA(path: string) {
    return await this.readFile(path).then((r) => {
      if (!r.ok)
        return false;
      return r.json().then(r => (r as any).sha);
    });
  }

  public async writeFile(path: string, content: string, message: string = `Update ${path}`, committer = defaultGithubCommitter): Promise<boolean> {
    const fileSHA = await this.getFileSHA(path);
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
    }).then((r) => {
      return !!r.ok;
    });
  }

  public async removeFile(path: string, message: string = `Remove ${path}`, committer = defaultGithubCommitter): Promise<boolean> {
    const fileSHA = await this.getFileSHA(path);
    if (!fileSHA)
      return false;
    return fetch(`https://api.github.com/repos/${this.repository}/contents/${path}`, {
      method: "DELETE",
      headers: {
        ...defaultGitHubHeader,
      },
      body: JSON.stringify({
        message,
        committer,
        sha: fileSHA,
      }),
    }).then((r) => {
      return !!r.ok;
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
