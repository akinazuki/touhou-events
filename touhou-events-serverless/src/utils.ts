import { Buffer } from "node:buffer";
import { SignJWT, jwtVerify } from "jose";
import { GITHUB_APIKEY, JWT_SECRET, STEAM_APIKEY } from "../.env";
import type { AuthUser } from "./routers/steamLogin";

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
export interface Player {
  steamid: string;
  communityvisibilitystate: number;
  profilestate: number;
  personaname: string;
  commentpermission: number;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  avatarhash: string;
  lastlogoff: number;
  personastate: number;
  primaryclanid: string;
  timecreated: number;
  personastateflags: number;
  loccountrycode: string;
  locstatecode: string;
  loccityid: number;
}
export async function getSteamUserInformation(steamIds: string[]): Promise<Player[]> {
  return fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_APIKEY}&steamids=${steamIds.join(",")}`)
    .then(r => r.json()).then(r => (r as any).response.players as Player[]);
  // .then((r) => {

  // if (!r || r.length === 0)
  // return [];
  //   return null;
  // return r.length === 1 ? r[0] : r;
  // });
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

  public async search(query: string, page = 1, perPage = 10) {
    // no escape for query
    const queryBuild = decodeURIComponent(new URLSearchParams({
      q: `${query}+in:file+language:json+repo:${this.repository}+fork:true`,
      per_page: perPage.toString(),
      page: page.toString(),
    }).toString());
    const searchResult = await fetch(`https://api.github.com/search/code?${queryBuild}`, {
      headers: {
        ...defaultGitHubHeader,
        Accept: "application/vnd.github.v3.text-match+json",
      },
    }).then(r => r.json()).then((r: any) => {
      return {
        total_count: r.total_count,
        items: r.items,
      };
    });
    const items = searchResult.items.map((i: any) => {
      return {
        ...i,
        html_url: undefined,
        git_url: undefined,
        repository: i.repository.full_name,
        text_matches: i.text_matches.map((m: any) => {
          return {
            fragment: m.fragment,
            matches: m.matches,
          };
        }),
      };
    });
    return {
      total_count: searchResult.total_count,
      items,
    };
  }

  public async readJSONFile(path: string) {
    return await this.readFile(path).then(async (r) => {
      if (!r.ok)
        throw new Error(`Failed to fetch file: File: [ ${path} ] ${r.statusText}`);
      return await r.json().then(r => JSON.parse(Buffer.from((r as any).content, "base64").toString()));
    });
  }
}

export async function signJWTByPlayerData(player: Player) {
  const { avatarfull, steamid, personaname, loccountrycode } = player;
  const payload = { avatarfull, steamid, personaname, loccountrycode };
  return await new SignJWT({ payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("90d")
    .sign(JWT_SECRET);
}

export async function validateJWT({ req }) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token)
    return serializeJSON({ error: "Unauthorized" }, 401);

  const { payload: jwtVerified } = await jwtVerify(token, JWT_SECRET);
  req.auth = jwtVerified.payload as AuthUser;
}

export function sanitizeFileName(fileName: string, replacement = "_") {
  function truncate(sanitized: string, length: number) {
    const uint8Array = new TextEncoder().encode(sanitized);
    const truncated = uint8Array.slice(0, length);
    return new TextDecoder().decode(truncated);
  };
  const illegalRe = /[/?<>\\:*|"]/g;
  const controlRe = /[\x00-\x1F\x80-\x9F]/g;
  const reservedRe = /^\.+$/;
  const windowsReservedRe = /^(con|prn|aux|nul|com\d|lpt\d)(\..*)?$/i;

  function sanitize(input: string, replacement: string) {
    const sanitized = input
      .replace(illegalRe, replacement)
      .replace(controlRe, replacement)
      .replace(reservedRe, replacement)
      .replace(windowsReservedRe, replacement);
    return truncate(sanitized, 255);
  }
  return sanitize(fileName, replacement);
}

export function formatMonthDay(date: Date): string {
  function paddingZero(num: number): string {
    return num.toString().padStart(2, "0");
  }
  return `${paddingZero(date.getMonth() + 1)}-${paddingZero(date.getDate())}`;
}
