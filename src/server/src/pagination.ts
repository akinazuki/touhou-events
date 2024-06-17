import type { Event } from "./Event";

export function pagination(events: Event[], pageSize: number) {
  const pages = Math.ceil(events.length / pageSize);
  return Array.from({ length: pages }, (_, i) => {
    const start = i * pageSize;
    return events.slice(start, start + pageSize);
  });
}

export function getPage(events: Event[], page: number, pageSize: number) {
  return pagination(events, pageSize)[page];
}
