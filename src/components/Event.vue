<script lang="ts" setup>
import { CalendarDays, MapPin } from "lucide-vue-next";
import Events from "../server/events.json";

function calcDays(end: number, start: number): string {
  const days = new Date(end * 1000).getDate() - new Date(start * 1000).getDate();
  return days > 1 ? `+ (${days}) days` : "";
}
function extractEventLocation(desc: string): string {
  return desc.split("于").splice(1).join("").split("举办")[0].trim();
}
</script>

<template>
  <div class="flex flex-row">
    <div class="grid grid-cols-3">
      <div v-for="event in Events.splice(Events.length - 100).reverse()" :key="event.id">
        <div
          class="flex flex-col h-48 rounded border p-4 mr-2 my-2 border-gray-300 hover:shadow-md hover:border-gray-400 border-opacity-50 gap-2"
        >
          <p class="w-full text-gray-800 font-bold">
            {{ event.title }}
          </p>
          <p class="w-full text-gray-600 text-xs">
            <MapPin class="inline-block w-4 h-4" />
            {{ extractEventLocation(event.desc) }}
          </p>
          <p class="w-full text-gray-600 text-xs">
            <CalendarDays class="inline-block w-4 h-4" />
            {{ new Date(event.start * 1000).toLocaleDateString('ja-JP') }} {{ calcDays(event.end, event.start) }}
          </p>
          <router-link :to="`/event/${event.id}`" class="mt-auto">
            <a>Details</a>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
