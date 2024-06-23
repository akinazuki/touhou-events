<script setup lang="ts">
import { computed, onMounted, provide, ref, watch } from "vue";
import { ComboboxAnchor, ComboboxInput, ComboboxPortal, ComboboxRoot } from "radix-vue";
import { ElSelectV2 } from "element-plus";
import { SearchIcon } from "lucide-vue-next";
import { useSearchStore } from "./stores/search";
import { CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { TagsInput, TagsInputInput, TagsInputItem, TagsInputItemDelete, TagsInputItemText } from "@/components/ui/tags-input";
import { getTypes } from "@/lib/utils";

const searchStore = useSearchStore();

onMounted(async () => {
  await searchStore.init();
});

// function remoteMethod(query: string) {
//   if (query !== "") {
//     loading.value = true;
//     setTimeout(() => {
//       loading.value = false;
//       options.value = list.value.filter((item) => {
//         return item.label.toLowerCase().includes(query.toLowerCase());
//       });
//     }, 200);
//   }
//   else {
//     options.value = [];
//   }
// }
</script>

<template>
  <ElSelectV2
    v-model="searchStore.selected" :options="searchStore.tagsList" placeholder="搜索" style="
    width: 100%;
    margin-right: 16px;
    vertical-align: middle;
    " size="large" allow-create filterable multiple clearable :collapse-tags="true" :max-collapse-tags="4"
  >
    <template #header>
      <p class="px-2 text-gray-500">
        TIPS: 可同时搜索关键词和选择标签, 不选择标签则搜索全部
      </p>
    </template>
    <template #footer>
      <p class="px-2 text-gray-500">
        搜索关键词: {{ searchStore.selectors }}
      </p>
    </template>
    <template #prefix>
      <SearchIcon class="w-4 h-4" />
    </template>
  </ElSelectV2>
  <!-- <ElSelectV2
    v-model="value" class="w-full h-full" multiple filterable remote :remote-method="remoteMethod" clearable
    :options="options" :loading="loading" placeholder="Please enter a keyword"
  /> -->
</template>

<style>
:root {
  --el-color-primary: hsl(var(--primary))
}
</style>
