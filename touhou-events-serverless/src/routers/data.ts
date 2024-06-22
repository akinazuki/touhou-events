import _ from "lodash";
import { GITHUB_REPOSITORY } from "../../.env";
import router from "../router";
import { GitHub, serializeJSON } from "../utils";

router.get("/sync", async ({ env, req }) => {
  const body = await getFile();
  await env.BUCKET.put("indexes.json.gz", body);
  return serializeJSON({ status: "ok", size: body.byteLength });
});

async function getFile() {
  const STATIC_FILE = `https://github.com/${GITHUB_REPOSITORY}/releases/download/latest/indexes.json.gz`;
  const response = await fetch(STATIC_FILE);
  const body = await response.arrayBuffer();
  return body;
}

router.get("/events", async ({ env, req }) => {
  const events = await env.BUCKET.get("indexes.json.gz");
  if (!events)
    return serializeJSON({ status: "error", message: "No events found" });

  const blobdata = await events.blob();

  if (req.headers.get("If-None-Match") === events.etag) {
    return new Response(null, {
      status: 304,
      headers: {
        "Etag": events.etag,
        "Access-Control-Expose-Headers": "Etag",
      },
    });
  }

  return new Response(blobdata, {
    headers: {
      "Content-Type": "application/x-gzip",
      "Etag": events.etag,
      "Content-Disposition": `attachment; filename="indexes.json.gz"`,
      "Access-Control-Expose-Headers": "Content-Disposition, Etag",
    },
  });
});
