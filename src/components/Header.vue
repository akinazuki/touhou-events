<script setup lang="ts">
import { defineProps, ref } from "vue";
import { userUserStore } from "./stores/maintainer";
import { Input } from "@/components/ui/input";
import SearchTagsSelector from "@/components/SearchTagsSelector.vue";

const { maintainer, defaultAvatar } = userUserStore();
</script>

<template>
  <div class="flex flex-row w-full justify-between">
    <div class="flex flex-row items-baseline gap-1 w-1/3 zen-maru-gothic-regular">
      <router-link to="/">
        <span class="text-4xl text-title">東方活動記録</span>
      </router-link>
      <span class="text-lg text-muted-foreground ml-2">by
        <a href="https://touhou.works" target="_blank" class="text-gray-600">幻夢結社</a>
      </span>
    </div>
    <!-- <div class="flex flex-row w-1/3 gap-2">
      <SearchTagsSelector class="h-10" />
    </div> -->
    <div class="flex flex-row items-center gap-2 w-1/3 justify-end">
      <div class="flex flex-row items-center gap-2">
        <router-link to="/login">
          <img
            :src="maintainer?.avatarfull || defaultAvatar"
            class="w-8 h-8 rounded-full hover:text-gray-600 hover:cursor-pointer shadow-md hover:shadow-lg"
          >
        </router-link>
      </div>
    </div>
  </div>
</template>
