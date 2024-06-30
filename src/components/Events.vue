<script lang="ts" setup>
// import Events from "../server/events.json";
import { computed, nextTick, onMounted, ref, watch } from "vue";
import InfiniteLoading from "v3-infinite-loading";
import { storeToRefs } from "pinia";
import _ from "lodash";
import { useRoute, useRouter } from "vue-router";
import type { Event } from "../lib/database";
import { db } from "../lib/database";
import Loading from "./Loading.vue";
import { useSearchStore } from "./stores/search";
import EventCard from "@/components/EventCard.vue";
import EventsFilter from "@/components/EventsFilter.vue";
import SearchTagsSelector from "@/components/SearchTagsSelector.vue";
import { deepCopy, searchBy, syncEvents } from "@/lib/utils";

const router = useRouter();
const route = useRoute();

const page = ref(1);
const pageSize = ref(12);
const events = ref<Event[]>([]);
const searchStore = useSearchStore();
const { searchInput } = storeToRefs(searchStore);

const searchResultEventsCount = computed(() => events.value.length);
const loading = ref(false);

const searching = computed(() => !(searchInput.value.input.length === 0 && searchInput.value.tags.length === 0));

const sortBy = computed({
  get: () => {
    return route.query.sortBy as string || "asc";
  },
  set: (value: string) => {
    router.push({ query: { sortBy: value } });
  },
});

watch(searchInput, async (value) => {
  console.log(`Search input changed: ${value.input} and ${value.tags}`);
  if (value.input.length > 0 || value.tags.length > 0) {
    loading.value = true;
    console.log(`Searching by ${searchInput.value.input} and ${searchInput.value.tags}`);
    const result = await doSearch(sortBy.value);
    events.value = deepCopy(result);
    loading.value = false;
  }
});

async function doSearch(sortBy = "asc") {
  // searchResultEvents.value = [];
  // searchResultEventsPaged.value = [];
  const res = await searchBy(searchInput.value.input, searchInput.value.tags).then((res) => {
    return res.sort((a, b) => {
      if (sortBy === "asc")
        return b.start - a.start;

      else
        return a.start - b.start;
    });
  });
  console.log(`Search result: ${res.length}`);

  return res;
  // events.value = deepCopy(searchResultEvents.value);
  // searchResultEventsPaged.value = _.chunk(res, pageSize.value);
  // if (searchResultEventsPaged.value.length > 0)
  //   events.value.push(...searchResultEventsPaged.value[page.value - 1]);
}

async function fetchDefaultData(order?: string, page = 1, pageSize = 12) {
  console.log(`Fetching default data with order: ${order}, page: ${page}, pageSize: ${pageSize}`);
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
  const res = await handler.offset((page - 1) * pageSize).limit(pageSize).toArray();
  console.log(res);
  return res;
}

function onFilterSelected(value: string) {
  console.log(`Filter selected: ${value}`);
  sortBy.value = value;
}

watch(sortBy, async (value) => {
  console.log(`Sorting by ${value}`);
  page.value = 1;
  events.value = [];
  if (!searching.value) {
    const res = await fetchDefaultData(value);
    events.value = deepCopy(res);
  }
  else {
    loading.value = true;
    const res = await doSearch(value);
    events.value = deepCopy(res);
    loading.value = false;
  }
});

async function onInfiniteLoading() {
  if (!searching.value) {
    page.value++;
    console.log(`Infinite loading, current page: ${page.value}`);
    console.log(`searching type: ${searching.value ? "searching" : "not searching"}`);
    loading.value = true;
    setTimeout(async () => {
      const res = await fetchDefaultData(sortBy.value, page.value, pageSize.value);
      events.value.push(...res);
      loading.value = false;
    }, 1000);
  }
  // else {
  //   setTimeout(async () => {
  //     const res = await doSearch(sortBy.value);
  //     events.value = deepCopy(res);

  //     loading.value = false;
  //   }, 1000);
  // }
}
onMounted(async () => {
  loading.value = true;
  await syncEvents();
  console.log("Fetching default data via onMounted");
  const res = await fetchDefaultData(sortBy.value);
  events.value.push(...res);
});
</script>

<template>
  <div class="flex flex-col">
    <div class="flex flex-row items-center gap-1 my-2 h-8 xl:max-w-[70%] max-w-[90%]">
      <SearchTagsSelector class="2xl:w-[40%] xl:w-[60%] md:w-[70%]" />
      <EventsFilter class="w-[8rem]" :initial-value="sortBy" @filter-selected="onFilterSelected" />
      <p class="text-gray-600 text-xs font-bold line-clamp-1 w-[10rem] ml-2">
        {{ searching ? `${searchResultEventsCount} 个活动` : '' }}
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
    <div v-if="events.length === 0 && !loading" class="flex flex-col items-center justify-center h-96 mt-32">
      <img src="https://cdn.sa.net/2024/06/23/HGaDtOfh86wXCKx.jpg" alt="404">
      <p class="text-gray-600 text-xl">
        什么都没有找到...
      </p>
    </div>
    <InfiniteLoading v-if="events.length > 0" @infinite="onInfiniteLoading" />
  </div>
</template>
