import process from "node:process";
import crypto from "node:crypto";
import _ from "lodash";
import Events from "../events.json";
import eventManager from "./eventManager";

try {
  const events = Events.map((event) => {
    const newId = `THB_${event.id.toString()}`;
    return _.omit({
      ...event,
      id: newId,
      uniqueId: crypto.createHash("sha256").update(newId).digest("hex"),
      desc: event.desc.toString().replaceAll("\n", ""),
    }, ["icon", "startStr", "endStr"]);
  }).filter(event => event.desc.endsWith("举办"));

  const res = await eventManager.createEvents(events);
  // console.log(res);
}
catch (e) {
  console.error(`Failed to create events: `, e);
}
finally {
  process.exit(0);
}
