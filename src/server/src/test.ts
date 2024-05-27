import Events from "../events.json";

for (const event of Events) {
  const desc = event.desc.toString().replaceAll("\n", "");
  if (!desc.endsWith("举办"))
    console.log(event);
}
