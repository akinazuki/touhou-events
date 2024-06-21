import fs from "node:fs";
import Evts from "../eventsFinal.json";
import type { Event } from "./Event";

const GENERATE_FOLDER = `/private/tmp/touhou-events-archive-sandbox`;

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
function slugify(text: string) {
  return text
    .toString() // Cast to string
    .normalize("NFD") // Change diacritics
    .replace(/[\u0300-\u036F]/g, "") // Remove diacritics
    .toLowerCase() // Change to lowercase
    .trim() // Remove spaces at the beginning and end
    .replace(/\s+/g, "-") // Replace spaces with -
    // .replace(/[^\w-]+/g, "") // Remove non-word characters
    .replace(/-{2,}/g, "-"); // Replace multiple - with single -
}
function createEventFile(event: Event, folder: string): void {
  const slug = slugify(event.id.replaceAll("THB_", "").replaceAll(" ", "-").replaceAll("#ev", "-"));
  fs.writeFileSync(`${folder}/${slug}.json`, JSON.stringify({
    ...event,
    id: undefined,
    slug,
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
