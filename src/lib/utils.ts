import { useStorage } from "@vueuse/core";
import { type ClassValue, clsx } from "clsx";
import pako from "pako";
import { twMerge } from "tailwind-merge";
import type { Event } from "./database";
import { db } from "./database";

export const THE_API_HOST = "https://api.touhou.events";
const cachedEtag = useStorage("events-etag", "");
const userJWT = useStorage("userJWT", "");

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
export async function generateSummary(obj: { url: string; title: string }) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${userJWT.value}`);

  const raw = JSON.stringify({
    url: obj.url,
    title: obj.title,
  });

  return await fetch(`${THE_API_HOST}/generative`, {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  }).then(response => response.json());
}
export async function cacheEvents() {
  const gziped = await fetch(`${THE_API_HOST}/events`, {
    headers: {
      "If-None-Match": cachedEtag.value,
    },
  }).then((res) => {
    if (!res.ok && res.status !== 304)
      throw new Error("NETWORK_ERROR");
    const etag = res.headers.get("etag");
    if (etag && etag === cachedEtag.value)
      throw new Error("ETAG_NOT_CHANGED");
    cachedEtag.value = etag;
    return res;
  }).then(res => res.arrayBuffer());
  const unzipped = pako.inflate(gziped);
  const events = JSON.parse(new TextDecoder().decode(unzipped));
  return events;
}

export async function syncEvents() {
  try {
    const events = await cacheEvents();
    console.log(`Fetched ${events.length} events`);
    await db.events.clear();
    await db.events.bulkAdd(events);
    console.log("Cached events");
    return events;
  }
  catch (e: any) {
    switch (e.message) {
      case "NETWORK_ERROR":
        console.error("NETWORK_ERROR");
        break;
      case "ETAG_NOT_CHANGED":
        console.error("ETAG_NOT_CHANGED");
        break;
      default:
        console.error(e);
    }
  }
}

export async function getTypes() {
  const time = Date.now();
  const types = new Set();
  const typesCount = new Map();
  await db.events.each((event) => {
    event.type.forEach((type) => {
      types.add(type);
      typesCount.set(type, (typesCount.get(type) || 0) + 1);
    });
  });
  console.log(`getTypes took ${Date.now() - time}ms`);
  return { types: Array.from(types), typesCount };
}

export async function searchBy(condition: string[] | undefined, types: string[]) {
  console.log("searchBy", condition, types);
  const time = Date.now();
  const results = [] as Event[];

  await db.events.each((event) => {
    if (!condition)
      return;
    if (
      // the search result should match all conditions
      (condition.every(cond => event.title.toLocaleLowerCase().includes(cond) || event.desc.toLocaleLowerCase().includes(cond))
      && types.every(type => event.type.includes(type)))

    )
      return results.push(event);
  });
  console.log(`searchBy took ${Date.now() - time}ms`);
  return scoreSearchResult(results, condition, types);
}
export function getEventBySlug(slug: string) {
  return db.events.get({ slug });
}
export function scoreSearchResult(searchResult: Event[], condition: string[] | undefined, types: string[]) {
  return searchResult.map((event) => {
    return {
      ...event,
      score: calculateMatchScore(event, condition, types),
    };
  }).sort((a, b) => b.score - a.score);
}
export function calculateMatchScore(event: Event, condition: string[] | undefined, types: string[]) {
  let score = 0;
  if (condition) {
    score += condition.reduce((acc, cond) => {
      return acc + (event.title.includes(cond) || event.desc.includes(cond) ? 1 : 0);
    }, 0);
  }
  if (types.length) {
    score += types.reduce((acc, type) => {
      return acc + (event.type.includes(type) ? 1 : 0);
    }, 0);
  }
  return score;
}

window.db = db;
window.syncEvents = syncEvents;
window.searchBy = searchBy;
window.getTypes = getTypes;
