import { Buffer } from "node:buffer";
import router from "./router";
import { GitHub, serializeJSON } from "./utils";

router.get("/test", async ({ env: Env }) => {
  try {
    const gh = new GitHub("TouhouWorks/touhou-events-archive-sandbox");
    const content = JSON.stringify({ test: "test4" }, null, 2);
    const res = await gh.writeFile("2024/01-01/東方冴樂凜_ev-a5.json", content, "TestOvO");
    return serializeJSON(res);
  }
  catch (e: any) {
    return serializeJSON({ error: e.message }, 400);
  }
});
