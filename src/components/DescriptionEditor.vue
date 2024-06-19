<script>
import { defineComponent, ref, shallowRef } from "vue";
import { Codemirror } from "vue-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { Button } from "@/components/ui/button";

export default defineComponent({
  components: {
    Codemirror,
  },
  setup() {
    const code = ref(`console.log('Hello, world!')`);
    const extensions = [markdown()];

    // Codemirror EditorView instance ref
    const view = shallowRef();
    const handleReady = (payload) => {
      view.value = payload.view;
    };

    // Status is available at all times via Codemirror EditorView
    const getCodemirrorStates = () => {
      const state = view.value.state;
      const ranges = state.selection.ranges;
      const selected = ranges.reduce((r, range) => r + range.to - range.from, 0);
      const cursor = ranges[0].anchor;
      const length = state.doc.length;
      const lines = state.doc.lines;
      // more state info ...
      // return ...
    };

    return {
      code,
      extensions,
      handleReady,
      log: console.log,
    };
  },
});
</script>

<template>
  <Codemirror
    v-model="code" placeholder="请输入描述, 支持 Markdown 格式" :style="{
      height: '24rem',
    }" :autofocus="true" :indent-with-tab="true" :tab-size="2" :extensions="extensions" @ready="handleReady"
    @change="log('change', $event)" @focus="log('focus', $event)" @blur="log('blur', $event)"
  />
</template>

<style>
.cm-editor {
  background-color: white;
  border-radius: 0.375rem;
  border-color: hsl(var(--input));
  border-width: 1px;

}
.cm-focused {
    outline: 2px solid transparent !important;
    --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
    --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
    box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
    outline-offset: 2px;
    border-radius: 0.375rem;
    --tw-ring-offset-width: 2px;
    --tw-ring-offset-color: #fff;
    --tw-ring-color: hsl(var(--primary))
}
</style>
