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
import { searchBy, syncEvents } from "@/lib/utils";

const page = ref(1);
const pageSize = ref(12);
const events = ref<Event[]>([]);
const searchResultEventsPaged = ref<Event[][]>([]);
const searchResultEventsCount = ref(0);
const loading = ref(false);

const searchStore = useSearchStore();
const { selectors } = storeToRefs(searchStore);

const searching = computed(() => !(selectors.value.input.length === 0 && selectors.value.tags.length === 0));

watch(selectors, async (value) => {
  if (value.input.length > 0 || value.tags.length > 0) {
    events.value = [];
    loading.value = true;
    console.log(`Searching by ${selectors.value.input} and ${selectors.value.tags}`);
    const res = await searchBy(selectors.value.input, selectors.value.tags);
    searchResultEventsPaged.value = _.chunk(res, pageSize.value);
    searchResultEventsCount.value = res.length;
    if (searchResultEventsPaged.value.length > 0)
      events.value.push(...searchResultEventsPaged.value[0]);

    loading.value = false;
  }
});

async function fetchData() {
  const today = Math.floor(new Date().getTime() / 1000);
  const res = await db.events.where("start").aboveOrEqual(today).offset((page.value - 1) * pageSize.value).limit(pageSize.value).toArray();
  console.log(res);
  return res;
}

async function onInfiniteLoading() {
  page.value++;
  loading.value = true;
  if (!searching.value) {
    setTimeout(async () => {
      const res = await fetchData();
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
    <div v-show="searchResultEventsCount > 0" class="flex flex-row items-center justify-between">
      <p class="text-gray-600 text-xl font-bold">
        搜索到 {{ searchResultEventsCount }} 个活动
      </p>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      <div v-for="event in events" :key="event.id">
        <EventCard :event="event" />
      </div>
    </div>
    <div v-show="loading" class="fixed flex flex-row justify-center items-center h-48 gap-4 right-16 bottom-0">
      <Loading class="w-12 h-12 animate-spin border-red-500 border-2 rounded-full bg-white" />
      <p class="text-gray-600 text-xl">
        少女{{ parseFloat(Math.random().toFixed(2)) > 0.3 ? "祈祷" : "折寿" }}中...
      </p>
    </div>
    <div v-if="events.length === 0" class="flex flex-col items-center justify-center h-96">
      <img src="https://cdn.sa.net/2024/06/23/HGaDtOfh86wXCKx.jpg" alt="404">
      <p class="text-gray-600 text-xl">
        什么都没有找到...
      </p>
    </div>
    <InfiniteLoading v-if="events.length > 0" @infinite="onInfiniteLoading" />
  </div>
</template>
