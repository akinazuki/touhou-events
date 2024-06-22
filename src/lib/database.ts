import type { EntityTable } from "dexie";
import Dexie from "dexie";

interface Event {
  id?: number;
  title: string;
  start: number;
  end: number;
  location: {
    entity: {
      addressLine1: string;
      addressLine2: string;
      categories: string[];
      id: string;
      provider: string;
    }[];
    text: string;
    type: string;

  };
  platform: number;
  type: string[];
  uniqueId: string;
  url: string;
  color: string;
  desc: string;
  slug: string;
}

const db = new Dexie("TEA") as Dexie & {
  events: EntityTable<Event, "id">;
};

db.version(1).stores({
  events: "++id, title, start, end, location, platform, type, uniqueId, url, color, desc, slug",
});

export { db };

export type { Event };
