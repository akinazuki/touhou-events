<script setup lang="ts">
import {
  DateFormatter,
  type DateValue,
  fromAbsolute,
  getLocalTimeZone,
} from "@internationalized/date";
import { Calendar as CalendarIcon, MapPinIcon } from "lucide-vue-next";
import { defineProps, ref, watch } from "vue";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn, deepCopy } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const props = defineProps<{
  date: {
    start: number;
    end: number;
  };
}>();
const emit = defineEmits(["update:date"]);

const newDate = ref({
  start: fromAbsolute(props.date.start * 1000, getLocalTimeZone()),
  end: fromAbsolute(props.date.end * 1000, getLocalTimeZone()),
}) as unknown as { start: DateValue; end: DateValue };

watch(newDate, (newVal) => {
  emit("update:date", {
    start: newVal.start.toDate(getLocalTimeZone()).getTime() / 1000,
    end: newVal.end.toDate(getLocalTimeZone()).getTime() / 1000,
  });
  // props.date.start = newVal.start.toDate(getLocalTimeZone()).getTime() / 1000;
  // props.date.end = newVal.end.toDate(getLocalTimeZone()).getTime() / 1000;
}, {
  deep: true,
});

const df = new DateFormatter("ja-JP", {
  dateStyle: "long",
});
function getDaysBetweenDates(start: DateValue, end: DateValue): number {
  const compared = end.compare(start);
  return (compared / 86400000) + 1;
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex flex-row justify-between gap-4">
      <div class="flex flex-col w-[50%] gap-2">
        <label for="date" class="text-sm">开始日期</label>
        <Popover>
          <PopoverTrigger as-child>
            <Button
              variant="outline" :class="cn(
                'w-full justify-start text-left font-normal',
                !newDate.start && 'text-muted-foreground',
              )"
            >
              <CalendarIcon class="mr-2 h-4 w-4" />
              {{ newDate.start ? df.format(newDate.start.toDate(getLocalTimeZone())) : "Select date" }}
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-auto p-0">
            <Calendar v-model="newDate.start" initial-focus />
          </PopoverContent>
        </Popover>
      </div>

      <div class="flex flex-col w-[50%] gap-2">
        <label for="date" class="text-sm">结束日期</label>
        <Popover>
          <PopoverTrigger as-child>
            <Button
              variant="outline" :class="cn(
                'w-full justify-start text-left font-normal',
                !newDate.end && 'text-muted-foreground',
              )"
            >
              <CalendarIcon class="mr-2 h-4 w-4" />
              {{ newDate.end ? df.format(newDate.end.toDate(getLocalTimeZone())) : "Select date" }}
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-auto p-0">
            <Calendar v-model="newDate.end" :min-value="newDate.start" initial-focus />
          </PopoverContent>
        </Popover>
      </div>
    </div>
    <div class="flex flex-col gap-2 text-sm">
      持续时间: {{ getDaysBetweenDates(newDate.start, newDate.end) }} 天
    </div>
  </div>
</template>
