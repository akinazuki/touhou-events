import { Buffer } from "node:buffer";
import { SignJWT, jwtVerify } from "jose";
import type { Player } from "../utils";
import { GitHub, generateSteamLoginUrl, getSteamUserInformation, serializeJSON, signJWTByPlayerData, validateSteamResponse } from "../utils";
import router from "../router";
import { JWT_SECRET } from "../../.env";

export interface AuthUser {
  avatarfull: string;
  steamid: string;
  personaname: string;
  loccountrycode: string;
}

function redirectToSteam() {
  const returnTo = "https://touhou.events/steam/callback";
  const loginUrl = generateSteamLoginUrl(returnTo, returnTo);
  return loginUrl;
}

router.get("/steam/login", async ({ env: Env }) => {
  try {
    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectToSteam(),
      },
    });
  }
  catch (e: any) {
    return serializeJSON({ error: e.message }, 400);
  }
});

router.get("/steam/callback", async ({ req: request }) => {
  try {
    const authResponse = await validateSteamResponse(new URL(request.url).searchParams);
    // const res = { steamId: "76561198382909655" };
    if (authResponse.steamId) {
      const [steamIdData] = await getSteamUserInformation([authResponse.steamId]);
      const signed = await signJWTByPlayerData(steamIdData);
      return serializeJSON({ accessToken: signed });
    }
    return serializeJSON({ authResponse });
  }
  catch (e: any) {
    return new Response(`Steam login verification failed: ${e.message}`, { status: 400 });
  }
});
