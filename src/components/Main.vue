<script setup lang="ts">
import { computed, h, onMounted, provide, ref } from "vue";
import { ElDivider } from "element-plus";
import Placeholder from "@/components/Placeholder.vue";
import Header from "@/components/Header.vue";
import Announcement from "@/components/Announcement.vue";

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
    <div class="h-16 px-8 mt-1 items-center w-full flex">
      <Header />
    </div>

    <div class="flex px-6">
      <div ref="leftPanel" class="w-[15%] p-2 flex flex-col">
        <!-- <Placeholder message="Announcements" class="h-[20%] w-full p-2" /> -->
        <Announcement class="w-full" />
      </div>
      <ElDivider
        :style="{
          height: 'auto',
        }" direction="vertical"
      />
      <div
        :class="{
          'm-2': needMargin,
        }" class="w-[85%] overflow-y-auto flex flex-col m-4 h-[calc(100vh-8rem-0.25rem)]"
      >
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
