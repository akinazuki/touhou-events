import type { EntityTable } from "dexie";
import Dexie from "dexie";

export interface Event {
  id?: number;
  title: string;
  onlineEvent: boolean;
  start: number;
  end: number;
  location: EventLocation;
  type: string[];
  uniqueId: string;
  url: string;
  color: string;
  desc: string;
  slug: string;
}

export interface LocationEntity {
  addressLine1?: string;
  addressLine2?: string;
  categories?: string[];
  id?: string;
  provider?: string;
}

export interface EventLocation {
  text: string;
  desc?: string;
  entity?: LocationEntity[];
}

const db = new Dexie("TEA") as Dexie & {
  events: EntityTable<Event, "id">;
};

db.version(1).stores({
  events: "++id, title, start, end, location, platform, type, uniqueId, url, color, desc, slug",
});

export { db };

export type { Event };
