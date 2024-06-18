<script setup lang="ts">
import { ref } from "vue";
import Placeholder from "@/components/Placeholder.vue";

const needMargin = ref(false);
</script>

<template>
  <div class="flex flex-col ">
    <!-- <Placeholder message="Header" class="h-24 p-2" /> -->
    <div class="h-24 px-8 mt-1 items-center w-full flex">
      <span class="text-4xl text-title">東方活動記録</span>
    </div>

    <div class="flex px-6">
      <Placeholder message="Sidebar" class="w-[20%] p-2" />
      <div
        :class="{
          'm-2': needMargin,
        }" class="w-[60%] overflow-y-auto flex flex-col m-4 h-[calc(100vh-8rem)]"
      >
        <router-view />
      </div>
      <Placeholder message="Announcements" class="w-[20%] p-2" />
    </div>
  </div>
</template>

<style scoped>
</style>
