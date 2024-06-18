import process from "node:process";
import crypto from "node:crypto";
import fs from "node:fs";
import _ from "lodash";
import thbEvents from "../events.json";
import type { Event, LocationEntity } from "./Event";
import { EventPlatform, LocationType } from "./Event";
import { sleep } from "./thbwiki";

// import eventManager from "./eventManager";

export async function processThbWikiEvents(thbEvents: Event[]) {
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
        location: {
          type: LocationType.GOOGLE,
          text: descExtracted,
        },
        platform: EventPlatform.THBWiki,
      } as Event;
    });

  for await (const [index, thbEvent] of thbEventsFinal.entries()) {
    if (!thbEvent.location!.text) {
      console.error(`Event ${thbEvent.title} [${thbEvent.uniqueId}] has no location text`);
      continue;
    }

    try {
      const locationEntity = await searchLocation(thbEvent.location!.text);
      if (locationEntity.length === 0) {
        console.error(`Event ${thbEvent.title} [${thbEvent.uniqueId}] has no location entity`);
        thbEventsFinal[index].location!.entity = [];
        continue;
      }
      if (locationEntity.length > 1)
        console.error(`Event ${thbEvent.title} [${thbEvent.uniqueId}] has multiple location entities`);

      thbEventsFinal[index].location!.entity = locationEntity;
    }
    catch (e) {
      console.error(`Failed to search location for event ${thbEvent.title} [${thbEvent.uniqueId}]: `, e);
    }
  }
  return thbEventsFinal;
}
export async function searchLocation(location: string): Promise<LocationEntity[]> {
  console.log(`Searching location: ${location}`);
  const locationSearchResult = await fetch(`https://api.serverless.touhou.events/location/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: location,
    }),
  }).then(r => r.json()) as LocationEntity[];
  console.log(`Location ${location} search result: `, locationSearchResult);

  return locationSearchResult;
}

try {
  const thbEventsFinal = await processThbWikiEvents(thbEvents);
  fs.writeFileSync("eventsFinal.json", JSON.stringify(thbEventsFinal, null, 2));
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
