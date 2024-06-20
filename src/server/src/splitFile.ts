import fs from "node:fs";
import Evts from "../eventsFinal.json";
import type { Event } from "./Event";

const GENERATE_FOLDER = `/private/tmp/touhou-events-archive`;

for (const event of Evts as Event[]) {
  const {
    start: eventTimeUnix,
  } = event;
  const eventTime = new Date(eventTimeUnix * 1000);
  const eventYear = eventTime.getFullYear();
  const monthDay = formatMonthDay(eventTime);
  const eventFolder = `${GENERATE_FOLDER}/${eventYear}/${monthDay}`;
  makeFolder(eventFolder);
  createEventFile(event, eventFolder);
}
function createEventFile(event: Event, folder: string): void {
  fs.writeFileSync(`${folder}/${event.id.replaceAll("THB_", "").replaceAll("#", "_")}.json`, JSON.stringify({
    ...event,
    id: event.id.replaceAll("THB_", "").replaceAll("#", "_"),
  }, null, 2));
}
function makeFolder(folder: string): void {
  try {
    fs.mkdirSync(folder, { recursive: true });
    console.log(`Folder created: ${folder}`);
  }
  catch (error) {
    console.error(error);
  }
}
function formatMonthDay(date: Date): string {
  return `${paddingZero(date.getMonth() + 1)}-${paddingZero(date.getDate())}`;
}
function paddingZero(num: number): string {
  return num.toString().padStart(2, "0");
}
