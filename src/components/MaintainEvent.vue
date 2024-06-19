<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { watchDebounced } from "@vueuse/core";

import { useRoute, useRouter } from "vue-router";
import eventsFinal from "../server/eventsFinal.json";
import type { Event, LocationEntity } from "../server/src/Event";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { deepCopy } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import LocationSearch from "@/components/LocationSearch.vue";
import DatePicker from "@/components/DatePicker.vue";
import { TagsInput, TagsInputInput, TagsInputItem, TagsInputItemDelete, TagsInputItemText } from "@/components/ui/tags-input";
// const hasEvts = (eventsFinal as Event[]).filter((event: Event) => {
//   return !event.location?.entity || !event.location.text;
// });
const router = useRouter();
const route = useRoute();

const hasEvts = ref(eventsFinal as Event[]);
const routeParamsEvtId = computed(() => Number.parseInt(route.params.id as string) || 0);
const evtId = ref(routeParamsEvtId.value);
const event = computed(() => hasEvts.value[evtId.value]);
const selectedEntity = ref<LocationEntity | undefined>(undefined);

const finalEvent = computed(() => {
  try {
    const oldEventCopy = JSON.parse(JSON.stringify(event.value));
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

function nextEvent() {
  window.location.href = `/mnt-event/${evtId.value + 1}`;
}
</script>

<template>
  <div class="p-4 flex flex-col gap-2">
    <b>活动事件 [ {{ evtId }} ] , 共 {{ hasEvts.length }} 个活动</b>
    <div class="grid grid-cols-2 gap-4">
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
    </div>
    <div class="flex flex-col gap-2">
      <DatePicker :date="{ start: event.start, end: event.end }" @update:date="datePicked" />
    </div>
    <div class="flex flex-col gap-2">
      <label for="location" class="text-sm">地点</label>
      <LocationSearch
        :location-entity="event.location?.entity"
        @update:location-entity-selected="locationEntitySelected"
      />
    </div>
    <div class="flex flex-col gap-2">
      <label for="description" class="text-sm">描述</label>
      <Textarea v-model="event.desc" />
    </div>
    <!-- <option :value="event.id" class="truncate">
      {{ event.location?.text === "" ? "No location" : event.location?.text }}
    </option> -->
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
      <Button @click="nextEvent">
        Next
      </Button>
    </div>
  </div>
</template>
