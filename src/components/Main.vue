<script setup lang="ts">
import { ref } from "vue";
import Placeholder from "@/components/Placeholder.vue";

const needMargin = ref(false);
</script>

<template>
  <div class="flex flex-col ">
    <Placeholder message="Header" class="h-24 p-2" />

    <div class="flex">
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

<style>
html {
  scroll-behavior: smooth;
  background-color: #f8f8f8;
}
</style>
