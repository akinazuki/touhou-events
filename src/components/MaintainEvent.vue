<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { watchDebounced } from "@vueuse/core";
import eventsFinal from "../server/eventsFinal.json";
import type { Event } from "../server/src/Event";

// const hasEvts = (eventsFinal as Event[]).filter((event: Event) => {
//   return !event.location?.entity || !event.location.text;
// });
const hasEvts = ref(eventsFinal as Event[]);
const evtId = ref(0);
const event = computed(() => hasEvts.value[evtId.value]);

const entityId = ref(0);
const selectedEntity = computed(() => event.value.location?.entity[entityId.value]);
const newEvent = ref(JSON.parse(JSON.stringify(event.value)));
watch(entityId, (newVal) => {
  newEvent.value.location.entity = [JSON.parse(JSON.stringify(selectedEntity.value))];
});
const finalEvent = computed(() => {
  try {
    const oldEventCopy = JSON.parse(JSON.stringify(event.value));
    if (selectedEntity.value === undefined)
      return oldEventCopy;
    oldEventCopy.location.entity = [JSON.parse(JSON.stringify(selectedEntity.value))];
    return oldEventCopy;
  }
  catch (error) {
    return event.value;
  }
});
async function searchLocation(location: string): Promise<any[]> {
  console.log(`Searching location: ${location}`);
  const locationSearchResult = await fetch(`https://api.serverless.touhou.events/location/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: location,
    }),
  }).then(r => r.json());
  console.log(`Location ${location} search result: `, locationSearchResult);

  return locationSearchResult;
}
// watch(finalEvent, (newVal) => {
//   console.log(newVal);
// });
const eventLocationText = computed(() => event.value.location?.text);
watchDebounced(eventLocationText, async (newVal) => {
  console.log(newVal);
  if (newVal) {
    const locationSearchResult = await searchLocation(newVal);
    // console.log(locationSearchResult);
    event.value.location.entity = locationSearchResult;
  }
}, {
  debounce: 500,
});
</script>

<template>
  <div class="p-4 flex flex-col gap-2">
    <b>Event {{ evtId }} of {{ hasEvts.length }}</b>
    <a :href="event.url" target="_blank" class="text-blue-500 hover:underline font-bold">
      {{ event.title }}
    </a>
    <option :value="event.id" class="truncate">
      {{ event.location?.text === "" ? "No location" : event.location?.text }}
    </option>
    <label for="location" class="text-sm">Location</label>
    <input v-model="event.location.text" type="text" class="border border-gray-500 p-2">
    <label for="entity" class="text-sm">Location Entity</label>
    <p>Selected Entity [ {{ entityId }} ], Entity Count: {{ event.location.entity.length }}</p>
    <select v-model="entityId" class="border border-gray-500 p-2">
      <option v-for="(entity, index) in event.location.entity" :key="entity.id" :value="index">
        {{ entity.addressLine1 }}
      </option>
    </select>
    <pre>
      <code>{{ JSON.stringify(selectedEntity, null, 2) }}</code>
    </pre>
    <!-- <textarea :value="JSON.stringify(event.location?.entity, null, 2)" type="text" class="border border-gray-500 p-2 h-[32rem]" /> -->

    <button class="bg-blue-500 text-white p-2 rounded" @click="evtId++">
      Next
    </button>
  </div>
</template>
