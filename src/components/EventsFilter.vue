<script setup lang="ts">
import type { Ref } from "vue";
import { computed, inject, ref, watch } from "vue";
import { Check, ChevronsUpDown } from "lucide-vue-next";

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

const frameworks = [
  { value: "next.js", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt", label: "Nuxt" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
];

const open = ref(false);
const value = ref("");
const panelWidth = inject("leftPanelWidth") as Ref<number>;
const panelWidthFinal = computed(() => {
  return `calc(${panelWidth.value}px - 1rem)`;
});
</script>

<template>
  <div
    :style="{
      width: panelWidthFinal,
    }"
  >
    <Popover v-model:open="open">
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
    </Popover>
  </div>
</template>
