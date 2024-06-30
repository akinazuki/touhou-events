<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import { computedAsync, watchDebounced } from "@vueuse/core";
import { useRoute, useRouter } from "vue-router";
import { marked } from "marked";
import { ElCheckbox } from "element-plus";
import { LoaderCircle, WandSparkles } from "lucide-vue-next";
import MarkdownRender from "./MarkdownRender.vue";
import type { Event, LocationEntity } from "@/lib/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { deepCopy, generateSummary, getEventBySlug } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import LocationSearch from "@/components/LocationSearch.vue";
import TabSwitch from "@/components/TabSwitch.vue";
import DatePicker from "@/components/DatePicker.vue";
import { TagsInput, TagsInputInput, TagsInputItem, TagsInputItemDelete, TagsInputItemText } from "@/components/ui/tags-input";
import DescriptionEditor from "@/components/DescriptionEditor.vue";
// const hasEvts = (eventsFinal as Event[]).filter((event: Event) => {
//   return !event.location?.entity || !event.location.text;
// });
const router = useRouter();
const route = useRoute();

const routeParamsSlug = computed(() => route.params.slug as string);
const eventSlug = ref(routeParamsSlug.value);
const isNewEvent = computed(() => route.path === "/new-event");

const event = ref<Event>({
  uniqueId: "",
  title: "",
  desc: "",
  color: "",
  start: Math.floor(Date.now() / 1000),
  end: Math.floor(Date.now() / 1000),
  type: [],
  url: "",
  location: {
    text: "",
    entity: [],
  },
  onlineEvent: false,
  slug: "",
});
const uniqueId = computedAsync(async () => {
  return await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(`TOUHOU_EVENTS_${event.value.title}_${event.value.start}_${event.value.end}`)).then((buf) => {
    return Array.prototype.map.call(new Uint8Array(buf), x => (`00${x.toString(16)}`).slice(-2)).join("");
  });
});
watch(uniqueId, (value) => {
  event.value.uniqueId = value;
});
onMounted(async () => {
  const evt = await getEventBySlug(eventSlug.value);
  if (!evt)
    throw new Error("Event not found");
  event.value = evt;
});
const selectedEntity = ref<LocationEntity | undefined>(undefined);

const finalEvent = computed(() => {
  try {
    const oldEventCopy = deepCopy(event.value);
    if (selectedEntity.value === undefined)
      return oldEventCopy;
    oldEventCopy.location.entity = [deepCopy(selectedEntity.value)];
    return oldEventCopy;
  }
  catch (error) {
    return event.value;
  }
});

function saveEvent() {
  console.log("Saving event: ", finalEvent.value);
}

function locationEntitySelected(entity: LocationEntity) {
  selectedEntity.value = entity;
}
function datePicked(date: { start: number; end: number }) {
  event.value.start = date.start;
  event.value.end = date.end;
}
const isOnlineEvent = computed({
  get: () => {
    console.log("isOnlineEvent: ", event.value.onlineEvent);
    return event.value.onlineEvent;
  },
  set: (value: boolean) => {
    console.log("isOnlineEvent set: ", value);
    event.value.onlineEvent = value;
    event.value.location.text = "";
    event.value.location.entity = [];
  },
});
const generativeSummaryRunning = ref(false);
async function generateSummaryClicked() {
  generativeSummaryRunning.value = true;
  const res = await generateSummary({
    title: event.value.title,
    url: event.value.url,
  });
  generativeSummaryRunning.value = false;
  event.value.desc = res.content;
}
</script>

<template>
  <div class="p-4 flex flex-col gap-2">
    <div class="flex flex-col gap-2 w-full">
      <label for="title" class="text-sm">活动 Slug</label>
      <Input v-model="event.slug" type="text" :disabled="!isNewEvent" />
    </div>

    <div class="grid grid-cols-2 gap-4 justify-between">
      <div class="flex flex-col gap-2 w-full">
        <label for="title" class="text-sm">标题</label>
        <Input v-model="event.title" type="text" />
      </div>
      <div class="flex flex-col gap-2 w-full">
        <label for="url" class="text-sm">URL</label>
        <div class="flex flex-row gap-2">
          <Input v-model="event.url" type="text" />
          <Button class="flex flex-row gap-2" @click="generateSummaryClicked">
            <WandSparkles v-show="!generativeSummaryRunning" class="h-4 w-4" />
            <LoaderCircle v-show="generativeSummaryRunning" class="h-4 w-4 animate-spin" stroke-width="3" />
            <span>生成描述</span>
          </Button>
        </div>
        <!-- <a :href="event.url" target="_blank" class="text-blue-500 hover:underline font-bold">
        {{ event.title }}
      </a> -->
      </div>
    </div>
    <DatePicker :date="{ start: event.start, end: event.end }" @update:date="datePicked" />
    <div class="flex flex-col gap-2">
      <label for="location" class="text-sm">地点</label>
      <ElCheckbox v-model="isOnlineEvent" label="线上活动" />
      <div v-show="!isOnlineEvent" class="flex flex-row gap-1">
        <Input v-model="event.location.text" class="w-[50%]" type="text" placeholder="地点" />
        <LocationSearch
          v-if="event.location.text" class="w-[50%]" :location-entity="event.location?.entity"
          @update:location-entity-selected="locationEntitySelected"
        />
      </div>
    </div>
    <div class="flex flex-col gap-2">
      <label for="description" class="text-sm">描述</label>
      <TabSwitch>
        <template #editor>
          <DescriptionEditor v-model="event.desc" />
        </template>
        <template #preview>
          <MarkdownRender :content="event.desc" />
        </template>
      </TabSwitch>
    </div>
    <div class="flex flex-col gap-2">
      <label for="type" class="text-sm">标签</label>
      <TagsInput v-model="event.type">
        <TagsInputItem v-for="item in event.type" :key="item" :value="item">
          <TagsInputItemText />
          <TagsInputItemDelete />
        </TagsInputItem>

        <TagsInputInput placeholder="活动类型" />
      </TagsInput>
    </div>
    <div class="mt-4 flex flex-col gap-2">
      <Button class="bg-green-500 text-white hover:bg-green-500/90" @click="saveEvent">
        Save
      </Button>
      <!-- <Button @click="nextEvent">
        Next
      </Button> -->
    </div>
  </div>
</template>

<style>
.md-body {
  width: 50%;
  margin-left: 20px;
}
</style>
