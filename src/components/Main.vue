<script setup lang="ts">
import { ref } from "vue";
import Placeholder from "@/components/Placeholder.vue";
import Header from "@/components/Header.vue";

const needMargin = ref(false);
</script>

<template>
  <div class="flex flex-col ">
    <!-- <Placeholder message="Header" class="h-24 p-2" /> -->
    <div class="h-16 px-8 mt-1 items-center w-full flex">
      <Header />
    </div>

    <div class="flex px-6">
      <Placeholder message="Sidebar" class="w-[20%] p-2" />
      <div
        :class="{
          'm-2': needMargin,
        }" class="w-[60%] overflow-y-auto flex flex-col m-4 h-[calc(100vh-8rem-0.25rem)]"
      >
        <router-view />
      </div>
      <Placeholder message="Announcements" class="w-[20%] p-2" />
    </div>
  </div>
</template>

<style scoped>
</style>
