import process from "node:process";
import crypto from "node:crypto";
import fs from "node:fs";
import _ from "lodash";
import thbEvents from "../thbwiki.json";
import { type Event, EventPlatform } from "./Event";

// import eventManager from "./eventManager";

export function processThbWikiEvents(thbEvents: Event[]) {
  const thbEventsFinal = thbEvents
    .map((event: Event) => {
      const newId = `THB_${event.id.toString()}`;
      return _.omit({
        ...event,
        id: newId,
        uniqueId: crypto.createHash("sha256").update(newId).digest("hex"),
        desc: event.desc.toString().replaceAll("\n", ""),
      }, ["icon", "startStr", "endStr"]) as Event;
    })
    .filter((event: Event) => event.desc.endsWith("举办"))
    .map((event: Event) => {
      let descExtracted: string = event.desc.split("于").splice(1).join("").split("举办")[0].trim();
      descExtracted = descExtracted.replaceAll("中国台湾地区", "台湾").replaceAll("台湾省", "台湾"); // workaround for location search
      return {
        ...event,
        location: descExtracted,
        platform: EventPlatform.THBWiki,
      };
    });
  return thbEventsFinal;
}
export async function searchLocation(location: string) {
  return fetch(`https://api.serverless.touhou.events/location/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: location,
    }),
  });
}

try {
  const thbEventsFinal = processThbWikiEvents(thbEvents);
  fs.writeFileSync("events.json", JSON.stringify(thbEventsFinal, null, 2));
}
catch (e) {
  console.error(`Failed to create events: `, e);
}
finally {
  process.exit(0);
}
//   const res = await eventManager.createEvents(events);
//   // console.log(res);
// }
// catch (e) {
//   console.error(`Failed to create events: `, e);
// }
// finally {
//   process.exit(0);
// }
