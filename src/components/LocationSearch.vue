<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Check, ChevronsUpDown } from "lucide-vue-next";
import { watchDebounced } from "@vueuse/core";
import { cn, deepCopy } from "@/lib/utils";
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
import type { LocationEntity } from "@/lib/database";

const props = defineProps<{
  locationEntity?: LocationEntity[];
}>();

const emit = defineEmits(["update:locationEntitySelected"]);

const locationEntities = ref(deepCopy(props.locationEntity || []));

async function searchLocation(location: string): Promise<any[]> {
  if (!location)
    return [];
  console.log(`Searching location: ${location}`);
  const locationSearchResult = await fetch(`https://api.serverless.touhou.events/location/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: location,
      locale: "zh-CN",
    }),
  }).then(r => r.json());
  console.log(`Location ${location} search result: `, locationSearchResult);

  return locationSearchResult;
}

const open = ref(false);
const searchLocationText = ref("");
const displayLocationText = ref("");
const displayLocationID = ref("");
const selectedEntity = ref<LocationEntity | null>(null);
onMounted(() => {
  if (locationEntities.value.length === 1) {
    displayLocationText.value = locationEntities.value[0].addressLine1;
    displayLocationID.value = locationEntities.value[0].id;
  }
});
watchDebounced(searchLocationText, async (newValue) => {
  console.log(`Searching location: ${newValue}`);
  locationEntities.value = await searchLocation(newValue);
}, {
  debounce: 500,
});
function valueChanged(event: InputEvent): void {
  const target = event.target as HTMLInputElement;
  searchLocationText.value = target.value;
}
function locationSelected(entity: LocationEntity): void {
  console.log(`Selected location: ${entity.addressLine1}`, entity);
  selectedEntity.value = entity;
  displayLocationText.value = entity.addressLine1;
  displayLocationID.value = entity.id;
  emit("update:locationEntitySelected", entity);
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex flex-row gap-4 justify-between">
      <div class="w-[50%]">
        <Popover v-model:open="open">
          <PopoverTrigger as-child>
            <Button variant="outline" role="combobox" :aria-expanded="open" class="w-full justify-between truncate">
              <span class="truncate">
                {{ displayLocationText
                  ? displayLocationText
                  : "选择 Poi 位置" }}
              </span>
              <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-fit p-0">
            <Command>
              <CommandInput class="h-9" placeholder="搜索 Poi 位置..." :oninput="valueChanged" />
              <CommandEmpty>
                {{ searchLocationText !== '' ? `找不到位置 「　${searchLocationText}　」` : '请输入位置以搜索' }}
              </CommandEmpty>
              <CommandList>
                <CommandGroup>
                  <CommandItem
                    v-for="entity in locationEntities" :key="entity.id" :value="entity" @select="(ev) => {
                      // console.log(ev.detail.value);
                      locationSelected(ev.detail.value as LocationEntity);
                      open = false
                    }"
                  >
                    {{ entity.addressLine1 }} {{ entity.addressLine2 ? ` | ${entity.addressLine2}` : '' }}
                    <Check
                      :class="cn(
                        'ml-2 h-4 w-4',
                        displayLocationID === entity.id ? 'opacity-100' : 'opacity-0',
                      )"
                    />
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <div class="w-[50%] flex flex-col text-xs truncate justify-center">
        <p>{{ selectedEntity?.addressLine2 }}</p>
      </div>
    </div>
  </div>
</template>
