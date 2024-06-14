<script setup>
import { defineProps } from "vue";

defineProps({
  message: String,
});
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <div class="border-2 text-gray-500 border-gray-500 border-dashed w-full h-full rounded-md">
      <div class="flex items-center justify-center h-full">
        {{ message }}
      </div>
    </div>
  </div>
</template>
