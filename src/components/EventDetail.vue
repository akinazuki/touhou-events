<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ExternalLink, PencilLine } from "lucide-vue-next";
import MarkdownRender from "./MarkdownRender.vue";
import { getEventBySlug } from "@/lib/utils";
import type { Event } from "@/lib/database";

const router = useRouter();
const route = useRoute();
const slug = route.params.slug as string;

const eventDetail = ref<Event>({
  desc: "",
} as Event);
onMounted(async () => {
  try {
    const result = await getEventBySlug(slug);
    if (!result)
      throw new Error("Event not found");

    eventDetail.value = result;
  }
  catch (error) {
    console.error(error);
    router.push("/404");
  }
});
</script>

<template>
  <div class="flex flex-col">
    <div class="flex flex-col gap-2">
      <div class="text-3xl font-light text-gray-800">
        {{ eventDetail.title }}
      </div>
      <div class="flex flex-col gap-2">
        <div class="text-sm text-gray-600">
          {{ new Date(eventDetail.start * 1000).toLocaleDateString("ja-JP") }}
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <div class="text-sm text-gray-600 flex gap-2">
          <span
            v-for="(tag, index) in eventDetail.type" :key="index"
            class="bg-gray-500 text-white rounded-md py-1 px-1.5 text-xs hover:cursor-pointer hover:bg-gray-600 select-none"
          >
            #{{ tag }}
          </span>
        </div>
      </div>
      <div class="text-sm text-gray-600 hover:underline hover:underline-offset-2 hover:cursor-pointer">
        <a
          :href="`https://www.google.com/maps/search/?api=1&query=${eventDetail.location?.text}`" target="_blank"
          rel="noopener noreferrer"
        >
          @{{ eventDetail.location?.text }}
        </a>
      </div>
      <div
        class="text-xs rounded-md w-fit bg-primary p-2 text-white hover:cursor-pointer hover:bg-primary/90 hover:shadow-md"
      >
        <a
          :href="eventDetail.url" target="_blank" rel="noopener noreferrer"
          class="flex items-center gap-1 justify-between"
        >
          <ExternalLink class="w-4 h-4" />
          <span>
            更多信息
          </span>
        </a>
      </div>
      <div class="text-sm text-gray-600">
        <MarkdownRender height="h-full" :content="eventDetail.desc" />
      </div>
    </div>
    <div class="fixed bottom-10 right-10">
      <router-link :to="`/mnt-event/${slug}`">
        <div
          class="flex items-center gap-2 p-3 rounded-full shadow-md cursor-pointer hover:shadow-lg bg-primary text-white hover:bg-primary/90"
        >
          <PencilLine class="w-6 h-6" />
        </div>
      </router-link>
    </div>
  </div>
</template>
