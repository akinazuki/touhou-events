import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { getTypes } from "@/lib/utils";

export const useSearchStore = defineStore("search", () => {
  const tagsTypes = ref([] as { value: string; label: string }[]);

  let typesData = {
    types: [],
    typesCount: new Map(),
  } as { types: string[]; typesCount: Map<string, number> };
  async function init() {
    typesData = await getTypes();
    tagsTypes.value = typesData.types.map((type: string) => {
      return {
        value: type,
        label: `${type}`,
      };
    });
  };

  const tagsList = computed(() => {
    return tagsTypes.value.map((item) => {
      return { value: item.value, label: item.label };
    });
  });
  const selected = ref([]);

  const selectors = computed(() => {
    return {
      input: selected.value.filter((item) => {
        return !tagsTypes.value.map(type => type.value).includes(item);
      }),
      tags: selected.value.filter((item) => {
        return tagsTypes.value.map(type => type.value).includes(item);
      }),
    };
  });

  return {
    tagsTypes,
    tagsList,
    selected,
    selectors,
    init,
  };
});
