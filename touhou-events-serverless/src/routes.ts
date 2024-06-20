import { Buffer } from "node:buffer";
import router from "./router";
import { GitHub, generateSteamLoginUrl, serializeJSON, validateSteamResponse } from "./utils";

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
    // const gh = new GitHub("TouhouWorks/touhou-events-archive-sandbox");
    // const content = JSON.stringify({ test: "test4" }, null, 2);
    // const res = await gh.writeFile("2024/01-01/東方冴樂凜_ev-a5.json", content, "TestOvO");
    // return serializeJSON(res);
  }
  catch (e: any) {
    return serializeJSON({ error: e.message }, 400);
  }
});

router.get("/steam/callback", async ({ req: request }) => {
  try {
    const res = await validateSteamResponse(new URL(request.url).searchParams);
    return serializeJSON({ res });
  }
  catch (e: any) {
    return new Response(`Steam login verification failed: ${e.message}`, { status: 400 });
  }
});
