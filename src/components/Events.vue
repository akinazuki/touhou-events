<script lang="ts" setup>
// import Events from "../server/events.json";
import { computed, onMounted, ref, watch } from "vue";
import InfiniteLoading from "v3-infinite-loading";
import type { Event } from "../lib/database";
import { db } from "../lib/database";
import EventCard from "./EventCard.vue";
import Loading from "./Loading.vue";
import { syncEvents } from "@/lib/utils";

const page = ref(1);
const pageSize = ref(24);
const events = ref<Event[]>([]);
const loading = ref(false);

async function fetchData() {
  const res = await db.events.orderBy("start").reverse().offset((page.value - 1) * pageSize.value).limit(pageSize.value).toArray();
  console.log(res);
  return res;
}
async function onInfiniteLoading() {
  page.value++;
  loading.value = true;
  setTimeout(async () => {
    const res = await fetchData();
    events.value.push(...res);
    loading.value = false;
  }, 1000);
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
    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      <div v-for="event in events" :key="event.id">
        <EventCard :event="event" />
      </div>
    </div>
    <div v-show="loading" class="flex flex-row justify-center items-center w-full h-48 gap-4">
      <Loading class="w-12 h-12 animate-spin border-red-500 border-2 rounded-full" />
      <p class="text-gray-600 text-xl">
        少女{{ parseFloat(Math.random().toFixed(2)) > 0.8 ? "祈祷" : "折寿" }}中...
      </p>
    </div>
    <InfiniteLoading v-if="events.length > 0" @infinite="onInfiniteLoading" />
  </div>
</template>
