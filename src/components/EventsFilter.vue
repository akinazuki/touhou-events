<script setup lang="ts">
import type { Ref } from "vue";
import { computed, inject, onMounted, ref, watch } from "vue";
import { Check, ChevronsUpDown } from "lucide-vue-next";

import { ElRadioButton, ElRadioGroup } from "element-plus";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const props = defineProps<{
  initialValue: string;
}>();

const emit = defineEmits(["filterSelected"]);
const selected = ref(props.initialValue);
// const panelWidth = inject("leftPanelWidth") as Ref<number>;
// const panelWidthFinal = computed(() => {
//   return `calc(${panelWidth.value}px - 1rem)`;
// });
const filterButtons = ref([
  { label: "热门", value: "hot" },
  { label: "最近", value: "future" },
  { label: "时间倒序", value: "desc" },
  { label: "时间顺序", value: "asc" },
]);
watch(filterButtons, () => {
  document.documentElement.style.setProperty(
    "--el-radio-button-group-length",
    filterButtons.value.length.toString(),
  );
}, { immediate: true });
watch(selected, () => {
  emit("filterSelected", selected.value);
});
</script>

<template>
  <div
    class="flex flex-row items-center w-full"
  >
    <ElRadioGroup v-model="selected" class="filter-selector w-full">
      <!-- <ElRadioButton label="热门" value="hot" />
      <ElRadioButton label="最近的" value="future" />
      <ElRadioButton label="时间倒序" value="desc" /> -->
      <ElRadioButton
        v-for="button in filterButtons" :key="button.value" :label="button.label" :value="button.value"
      />
    </ElRadioGroup>
    <!-- <Popover v-model:open="open">
      <PopoverTrigger as-child>
        <div class="w-full">
          <Button variant="outline" role="combobox" :aria-expanded="open" class="w-full justify-between">
            {{ value
              ? frameworks.find((framework) => framework.value === value)?.label
              : "Select framework..." }}
            <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent
        :style="{
          width: panelWidthFinal,
        }" class="p-0"
      >
        <Command>
          <CommandInput class="h-9" placeholder="Search framework..." />
          <CommandEmpty>No framework found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              <CommandItem
                v-for="framework in frameworks" :key="framework.value" :value="framework.value" @select="(ev) => {
                  if (typeof ev.detail.value === 'string') {
                    value = ev.detail.value
                  }
                  open = false
                }"
              >
                {{ framework.label }}
                <Check
                  :class="cn(
                    'ml-auto h-4 w-4',
                    value === framework.value ? 'opacity-100' : 'opacity-0',
                  )"
                />
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover> -->
  </div>
</template>

<style>
.filter-selector .el-radio-button {
  width: calc(100% / var(--el-radio-button-group-length,2)) !important;
}
.filter-selector .el-radio-button__inner {
  width: 100% !important;
}
</style>
