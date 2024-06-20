import type { Event } from "../../src/server/src/Event";

export function pagination(events: Event[], pageSize: number) {
  const pages = Math.ceil(events.length / pageSize);
  return Array.from({ length: pages }, (_, i) => {
    const start = i * pageSize;
    return events.slice(start, start + pageSize);
  });
}

export function getPage(events: Event[], page: number, pageSize: number, inverted = true) {
  if (pageSize > 100)
    throw new Error("pageSize must be less than 100");
  if (page < 0 || pageSize < 0 || page * pageSize > events.length)
    throw new Error("Invalid pageNumber or pageSize");
  if (inverted)
    events = events.reverse();
  const pages = pagination(events, pageSize);
  return {
    page: pages[page],
    total: pages.length,
  };
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const events = await env.BUCKET.get("events.json").then(async (r) => {
      if (!r)
        return [] as Event[];
      return (await r.json()) as Event[];
    });
    const page = Number(new URL(request.url).searchParams.get("page") || 0);
    const pageSize = Number(new URL(request.url).searchParams.get("limit") || 10);
    const inverted = new URL(request.url).searchParams.get("inverted") === "true";
    try {
      return serializeJSON(getPage(events, page, pageSize, inverted));
    }
    catch (e: any) {
      return serializeJSON({ error: e.message }, 400);
    }
  },
} satisfies ExportedHandler<Env>;
