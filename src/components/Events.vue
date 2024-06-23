<script lang="ts" setup>
// import Events from "../server/events.json";
import { computed, onMounted, ref, watch } from "vue";
import InfiniteLoading from "v3-infinite-loading";
import { storeToRefs } from "pinia";
import _ from "lodash";
import type { Event } from "../lib/database";
import { db } from "../lib/database";
import EventCard from "./EventCard.vue";
import Loading from "./Loading.vue";
import { useSearchStore } from "./stores/search";
import EventsFilter from "./EventsFilter.vue";
import { deepCopy, searchBy, syncEvents } from "@/lib/utils";

const page = ref(1);
const pageSize = ref(12);
const events = ref<Event[]>([]);

const searchResultEvents = ref<Event[]>([]);
const searchResultEventsPaged = ref<Event[][]>([]);
const searchResultEventsCount = ref(0);
const loading = ref(false);
const sortBy = ref("asc");

const searchStore = useSearchStore();
const { selectors } = storeToRefs(searchStore);

const searching = computed(() => !(selectors.value.input.length === 0 && selectors.value.tags.length === 0));

watch(selectors, async (value) => {
  if (value.input.length > 0 || value.tags.length > 0) {
    loading.value = true;
    console.log(`Searching by ${selectors.value.input} and ${selectors.value.tags}`);
    await doSearch(sortBy.value);

    loading.value = false;
  }
});
async function doSearch(sortBy = "asc") {
  searchResultEvents.value = [];
  searchResultEventsPaged.value = [];
  const res = await searchBy(selectors.value.input, selectors.value.tags);
  console.log(`Search result: ${res.length}`);

  searchResultEvents.value = res.sort((a, b) => {
    if (sortBy === "asc")
      return a.start - b.start;

    else
      return b.start - a.start;
  });
  searchResultEventsPaged.value = _.chunk(res, pageSize.value);
  searchResultEventsCount.value = res.length;
  if (searchResultEventsPaged.value.length > 0)
    events.value.push(...searchResultEventsPaged.value[0]);
}

async function fetchData(order?: string) {
  const today = Math.floor(new Date().getTime() / 1000);
  const handler = db.events.where("start").aboveOrEqual(today);
  switch (order) {
    case "desc":
      handler.reverse().sortBy("start");
      break;
    case "asc":
      handler.sortBy("start");
      break;
    default:
      handler.sortBy("start");
      break;
  }
  const res = await handler.offset((page.value - 1) * pageSize.value).limit(pageSize.value).toArray();
  console.log(res);
  return res;
}

function onFilterSelected(value: string) {
  page.value = 1;
  events.value = [];
  if (searching.value)
    doSearch(value);

  sortBy.value = value;

  onInfiniteLoading(value);
}

async function onInfiniteLoading(sortValue?: string) {
  page.value++;
  loading.value = true;
  if (!searching.value) {
    setTimeout(async () => {
      const res = await fetchData(sortValue);
      events.value.push(...res);
      loading.value = false;
    }, 1000);
  }
  else {
    setTimeout(() => {
      if (searchResultEventsPaged.value.length > page.value) {
        events.value.push(...searchResultEventsPaged.value[page.value - 1]);
        loading.value = false;
      }
      else {
        loading.value = false;
      }
    }, 1000);
  }
}
onMounted(async () => {
  loading.value = true;
  await syncEvents();
  const res = await fetchData();

  events.value.push(...res);
});
</script>

<template>
  <div class="flex flex-col">
    <div class="flex flex-row items-center gap-2 mb-2">
      <EventsFilter class="w-[40%]" @filter-selected="onFilterSelected" />
      <p class="text-gray-600 text-xs font-bold">
        {{ searching ? `搜索到 ${searchResultEventsCount} 个活动` : '' }}
      </p>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 w-[96%]">
      <div v-for="event in events" :key="event.id">
        <EventCard :event="event" />
      </div>
    </div>
    <div v-show="loading" class="fixed flex flex-row justify-center items-center h-48 gap-4 right-32 bottom-0">
      <Loading class="w-12 h-12 animate-spin border-red-500 border-2 rounded-full bg-white" />
      <p class="text-gray-600 text-xl">
        少女{{ parseFloat(Math.random().toFixed(2)) > 0.3 ? "祈祷" : "折寿" }}中...
      </p>
    </div>
    <div v-if="events.length === 0 && !loading" class="flex flex-col items-center justify-center h-96">
      <img src="https://cdn.sa.net/2024/06/23/HGaDtOfh86wXCKx.jpg" alt="404">
      <p class="text-gray-600 text-xl">
        什么都没有找到...
      </p>
    </div>
    <InfiniteLoading v-if="events.length > 0" @infinite="onInfiniteLoading" />
  </div>
</template>
