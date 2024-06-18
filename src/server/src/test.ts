import Evts from "../eventsFinal.json";
import type { Event } from "./Event";

const hasEvts = (Evts as Event[]).filter((event: Event) => {
  return !event.location?.entity || !event.location.text;
});

console.log(hasEvts);
