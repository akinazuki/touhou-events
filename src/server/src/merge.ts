import process from "node:process";
import crypto from "node:crypto";
import fs from "node:fs";
import _ from "lodash";
import thbEvents from "../thbwiki.json";
import { type Event, EventPlatform } from "./Event";

// import eventManager from "./eventManager";

function processThbWikiEvents() {
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
    .filter(event => event.desc.endsWith("举办"))
    .map((event) => {
      const descExtracted: string = event.desc.split("于").splice(1).join("").split("举办")[0].trim();
      return {
        ...event,
        location: descExtracted,
        platform: EventPlatform.THBWiki,
      };
    });
  return thbEventsFinal;
}

try {
  const thbEventsFinal = processThbWikiEvents();
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
