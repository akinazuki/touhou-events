<script lang="ts" setup>
import { computed, defineProps } from "vue";
import { marked } from "marked";
import DOMPurify from "dompurify";

const props = defineProps<{
  content: string;
  height?: string;
}>();

const containerHeight = computed(() => props.height || "24rem");

const compiledMarkdownHTML = computed(() => {
  const html = marked.parse(props.content || "", {
    async: false,
    breaks: false,
    extensions: null,
    gfm: true,
    hooks: null,
    pedantic: false,
    silent: false,
    tokenizer: null,
    walkTokens: null,
  });
  return DOMPurify.sanitize(html);
});
</script>

<template>
  <div
    :style="{
      height: containerHeight,
    }" class="markdown max-h-[24rem] overflow-y-scroll rounded p-4" v-html="compiledMarkdownHTML"
  />
</template>

<style>
.markdown {
  font-size: 1rem;
  line-height: 1.5;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}
.markdown a {
  color: #3182ce;
  text-decoration: none;
  cursor: pointer;
}
.markdown a:hover {
  text-decoration: underline;
}
.markdown img {
  max-width: 100%;
  height: auto;
}
.markdown pre {
  background-color: #f6f8fa;
  border-radius: 0.375rem;
  padding: 1rem;
  overflow-x: auto;
}
.markdown code {
  background-color: #f6f8fa;
  border-radius: 0.375rem;
  padding: 0.25rem 0.5rem;
}
.markdown blockquote {
  border-left: 0.25rem solid #dfe2e5;
  padding: 0.5rem;
  margin: 1rem;
}
.markdown h1,
.markdown h2,
.markdown h3,
.markdown h4,
.markdown h5,
.markdown h6 {
  /* margin-top: 1.5rem; */
  margin-bottom: 0.5rem;
}
.markdown h1 {
  font-size: 2rem;
}
.markdown h2 {
  font-size: 1.5rem;
}
.markdown h3 {
  font-size: 1.25rem;
}
.markdown h4 {
  font-size: 1rem;
}
.markdown h5 {
  font-size: 0.875rem;
}
.markdown h6 {
  font-size: 0.75rem;
}
.markdown ul,
.markdown ol {
  margin-top: 0;
  margin-bottom: 1rem;
}
.markdown ul li,
.markdown ol li {
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
}
.markdown ul ul,
.markdown ul ol,
.markdown ol ul,
.markdown ol ol {
  margin-top: 0;
  margin-bottom: 0;
}
.markdown table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  margin-bottom: 1rem;
}
.markdown th {
  text-align: left;
  padding: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}
.markdown td {
  padding: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}
.markdown th:first-child,
.markdown td:first-child {
  padding-left: 0;
}
.markdown th:last-child,
.markdown td:last-child {
  padding-right: 0;
}
.markdown th:only-child,
.markdown td:only-child {
  padding: 0.5rem;
}
.markdown thead th {
  vertical-align: bottom;
  border-bottom-width: 2px;
}
.markdown tbody + tbody {
  border-top-width: 2px;
}
</style>
