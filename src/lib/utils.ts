import { useStorage } from "@vueuse/core";
import { type ClassValue, clsx } from "clsx";
import pako from "pako";
import { twMerge } from "tailwind-merge";
import { db } from "./database";

const cachedEtag = useStorage("events-etag", "");

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
export async function cacheEvents() {
  const gziped = await fetch("http://localhost:8787/events", {
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

window.syncEvents = syncEvents;
