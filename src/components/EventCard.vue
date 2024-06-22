<script setup lang="ts">
import { CalendarDays, MapPin, Tags } from "lucide-vue-next";

import { computed, onMounted, ref } from "vue";
import type { Event } from "@/lib/database";

const props = defineProps<{ event: Event }>();
const specialEvents = ["线上", "未知地点"];
const eventLocation = computed(() => extractEventLocation(props.event));

function extractEventLocation(event: Event): string {
  const desc = event.desc;
  let descExtracted: string = desc.split("于").splice(1).join("").split("举办")[0].trim();
  if (descExtracted === "")
    descExtracted = "未知地点";

  return descExtracted;
}
function calcDays(end: number, start: number): string {
  const days = new Date(end * 1000).getDate() - new Date(start * 1000).getDate();
  return days > 1 ? `+ (${days}) days` : "";
}
</script>

<template>
  <div
    class="flex flex-col h-48 max-h-48 rounded border p-4 mr-2 my-2 border-gray-300 hover:shadow-md hover:border-gray-400 border-opacity-50 gap-2 justify-between"
  >
    <div class="w-full text-gray-800 font-bold line-clamp-2 text-sm">
      <p>{{ event.title }}</p>
    </div>
    <div class="w-full text-gray-600 text-xs flex items-center gap-1">
      <div class="w-4 flex items-center gap-1">
        <MapPin class="w-4 h-8" />
      </div>
      <p
        v-if="!specialEvents.includes(eventLocation)"
        class="whitespace-break-spaces line-clamp-2 hover:underline hover:underline-offset-2 hover:text-blue-500 hover:cursor-pointer"
      >
        <a
          :href="`https://www.google.com/maps/search/?api=1&query=${eventLocation}`" target="_blank"
          rel="noopener noreferrer"
        >{{ extractEventLocation(event) }}</a>
      </p>
      <p v-else>
        {{ eventLocation }}
      </p>
    </div>
    <div class="w-full text-gray-600 text-xs flex items-center gap-1">
      <CalendarDays class="w-4 h-4" />
      {{ new Date(event.start * 1000).toLocaleDateString('ja-JP') }} {{ calcDays(event.end, event.start) }}
    </div>
    <div class="w-full text-gray-600 text-xs flex items-center gap-1">
      <div class="w-4 flex items-center gap-1">
        <Tags class="w-4 h-4" />
      </div>
      <span
        v-for="type in event.type" :key="type"
        class="bg-gray-400 text-gray-100 px-1 rounded text-xs max-w-[6rem] line-clamp-1 hover:bg-gray-500 hover:text-gray-100 hover:cursor-pointer"
      >
        #{{ type }}
      </span>
    </div>
    <div class="w-full flex">
      <router-link :to="`/event/${event.slug}`">
        <a class="text-blue-500 text-xs">Details</a>
      </router-link>
    </div>
  </div>
</template>
