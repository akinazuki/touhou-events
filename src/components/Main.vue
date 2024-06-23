<script setup lang="ts">
import { computed, onMounted, provide, ref } from "vue";
import Placeholder from "@/components/Placeholder.vue";
import Header from "@/components/Header.vue";
import EventsFilter from "@/components/EventsFilter.vue";

const needMargin = ref(false);
const leftPanel = ref<HTMLElement | null>(null);
const leftPanelWidth = ref(0);

onMounted(() => {
  watchLeftPanel();
  window.addEventListener("resize", () => {
    watchLeftPanel();
  });
});
function watchLeftPanel() {
  leftPanelWidth.value = leftPanel.value?.offsetWidth ?? 0;
}
provide("leftPanelWidth", leftPanelWidth);
</script>

<template>
  <div class="flex flex-col ">
    <!-- <Placeholder message="Header" class="h-24 p-2" /> -->
    <div class="h-16 px-8 mt-1 items-center w-full flex">
      <Header />
    </div>

    <div class="flex px-6">
      <div ref="leftPanel" class="w-[20%] p-2 flex flex-col">
        <Placeholder message="Announcements" class="h-[20%] w-full p-2" />
        <!-- <Placeholder message="Sidebar" class="h-[80%] w-full p-2" /> -->
      </div>
      <div
        :class="{
          'm-2': needMargin,
        }" class="w-[80%] overflow-y-auto flex flex-col m-4 h-[calc(100vh-8rem-0.25rem)]"
      >
        <router-view />
      </div>
      <!-- <Placeholder message="Announcements" class="w-[20%] p-2" /> -->
    </div>
  </div>
</template>

<style scoped>
</style>
