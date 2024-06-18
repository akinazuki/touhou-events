<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { watchDebounced } from "@vueuse/core";
import {
  DateFormatter,
  type DateValue,
  fromAbsolute,
  getLocalTimeZone,
} from "@internationalized/date";
import { Calendar as CalendarIcon } from "lucide-vue-next";
import { useRoute, useRouter } from "vue-router";
import eventsFinal from "../server/eventsFinal.json";
import type { Event } from "../server/src/Event";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
// const hasEvts = (eventsFinal as Event[]).filter((event: Event) => {
//   return !event.location?.entity || !event.location.text;
// });
const router = useRouter();
const route = useRoute();

const hasEvts = ref(eventsFinal as Event[]);
const routeParamsEvtId = computed(() => Number.parseInt(route.params.id as string) || 0);
const evtId = ref(routeParamsEvtId.value);
const event = computed(() => hasEvts.value[evtId.value]);

const entityId = ref(0);
const selectedEntity = computed(() => {
  if (event.value.location?.entity === undefined)
    return [];
  return event.value.location?.entity[entityId.value];
});
const newEvent = ref(JSON.parse(JSON.stringify(event.value)));
const newDate = ref({
  start: fromAbsolute(event.value.start * 1000, getLocalTimeZone()),
  end: fromAbsolute(event.value.end * 1000, getLocalTimeZone()),
}) as unknown as { start: DateValue; end: DateValue };

watch(newDate, (newVal) => {
  event.value.start = newVal.start.toDate(getLocalTimeZone()).getTime() / 1000;
  event.value.end = newVal.end.toDate(getLocalTimeZone()).getTime() / 1000;
}, {
  deep: true,
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
const eventLocationText = computed(() => event.value.location?.text);

const df = new DateFormatter("ja-JP", {
  dateStyle: "long",
});

function saveEvent() {
  console.log("Saving event: ", finalEvent.value);
}
async function searchLocation(location: string): Promise<any[]> {
  console.log(`Searching location: ${location}`);
  const locationSearchResult = await fetch(`https://api.serverless.touhou.events/location/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: location,
      locale: "zh-CN",
    }),
  }).then(r => r.json());
  console.log(`Location ${location} search result: `, locationSearchResult);

  return locationSearchResult;
}
// watch(finalEvent, (newVal) => {
//   console.log(newVal);
// });
watch(entityId, (newVal) => {
  newEvent.value.location.entity = [JSON.parse(JSON.stringify(selectedEntity.value))];
});
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
function getDaysBetweenDates(start: DateValue, end: DateValue): number {
  const compared = end.compare(start);
  return (compared / 86400000) + 1;
}
function nextEvent() {
  window.location.href = `/mnt-event/${evtId.value + 1}`;
}
</script>

<template>
  <div class="p-4 flex flex-col gap-4">
    <b>活动事件 [ {{ evtId }} ] , 共 {{ hasEvts.length }} 个活动</b>
    <div class="flex flex-col gap-2">
      <label for="title" class="text-sm">标题</label>
      <Input v-model="event.title" type="text" />
    </div>
    <div class="flex flex-col gap-2">
      <label for="url" class="text-sm">URL</label>
      <Input v-model="event.url" type="text" />
      <!-- <a :href="event.url" target="_blank" class="text-blue-500 hover:underline font-bold">
        {{ event.title }}
      </a> -->
    </div>
    <div class="flex flex-col gap-2">
      <label for="description" class="text-sm">描述</label>
      <Textarea v-model="event.desc" />
    </div>
    <div class="flex flex-col gap-2">
      <div class="flex flex-row justify-between">
        <div class="flex flex-col items-start gap-2">
          <label for="date" class="text-sm">开始日期</label>
          <Popover>
            <PopoverTrigger as-child>
              <Button
                variant="outline" :class="cn(
                  'w-[280px] justify-start text-left font-normal',
                  !newDate.start && 'text-muted-foreground',
                )"
              >
                <CalendarIcon class="mr-2 h-4 w-4" />
                {{ newDate.start ? df.format(newDate.start.toDate(getLocalTimeZone())) : "Select date" }}
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-auto p-0">
              <Calendar v-model="newDate.start" initial-focus />
            </PopoverContent>
          </Popover>
        </div>

        <div class="flex flex-col items-start gap-2">
          <label for="date" class="text-sm">结束日期</label>
          <Popover>
            <PopoverTrigger as-child>
              <Button
                variant="outline" :class="cn(
                  'w-[280px] justify-start text-left font-normal',
                  !newDate.end && 'text-muted-foreground',
                )"
              >
                <CalendarIcon class="mr-2 h-4 w-4" />
                {{ newDate.end ? df.format(newDate.end.toDate(getLocalTimeZone())) : "Select date" }}
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-auto p-0">
              <Calendar v-model="newDate.end" :min-value="newDate.start" initial-focus />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div class="flex flex-col gap-2 text-sm">
        持续时间: {{ getDaysBetweenDates(newDate.start, newDate.end) }} 天
      </div>
    </div>
    <!-- <option :value="event.id" class="truncate">
      {{ event.location?.text === "" ? "No location" : event.location?.text }}
    </option> -->
    <div class="flex flex-col gap-2">
      <label for="location" class="text-sm">地点</label>
      <Input v-model="event.location.text" type="text" />
      <label class="text-sm">已选择 [ {{ entityId }} ], 备选: {{ event.location.entity?.length || 0 }} 个地址</label>
      <select v-model="entityId" class="border border-gray-500 p-2">
        <option v-for="(entity, index) in event.location.entity" :key="entity.id" :value="index">
          [{{ index }}] {{ entity.addressLine1 }} | {{ entity.addressLine2 }}
        </option>
      </select>
      <div v-show="selectedEntity?.id">
        <label for="location" class="text-sm">完整地址</label>
        <pre>
        {{ selectedEntity?.addressLine1 }}
        {{ selectedEntity?.addressLine2 }}
      </pre>
        <code class="text-xs"># {{ selectedEntity?.id }}</code>
      </div>
    </div>
    <Button class="bg-green-500 text-white hover:bg-green-500/90" @click="saveEvent">
      Save
    </Button>
    <Button @click="nextEvent">
      Next
    </Button>
  </div>
</template>
