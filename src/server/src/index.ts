import fs from "node:fs";
import { fetchMonthBetween, paddingMonth, sleep } from "./thbwiki";

const finalEvents = [];

for (let year = 1997; year <= 2024; year++) {
  for (const i of Array(12).keys()) {
    const startDate = new Date(year, i, 1);
    const endDate = new Date(year, i + 1, 1);
    try {
      const result = await fetchMonthBetween(startDate, endDate);
      if (!result) {
        console.log(`No events for ${year}-${paddingMonth(i + 1)}`);
        continue;
      }
      finalEvents.push(...result);
    }
    catch (e) {
      console.error(e);
    }
    finally {
      await sleep(1000);
    }
  }
}

fs.writeFileSync("thbwiki.json", JSON.stringify(finalEvents, null, 2));
