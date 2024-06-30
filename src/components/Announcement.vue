<script setup lang="ts">
import { defineProps, ref } from "vue";
import { ElScrollbar } from "element-plus";
import MarkdownRender from "./MarkdownRender.vue";

const content = ref(`
# h1 Heading 8-)
## h2 Heading
### h3 Heading
#### h4 Heading
##### h5 Heading
###### h6 Heading


## Horizontal Rules

___

---

***


## Typographic replacements

Enable typographer option to see result.

(c) (C) (r) (R) (tm) (TM) (p) (P) +-

test.. test... test..... test?..... test!....

!!!!!! ???? ,,  -- ---

"Smartypants, double quotes" and 'single quotes'


## Emphasis

**This is bold text**

__This is bold text__

*This is italic text*

_This is italic text_

~~Strikethrough~~


## Blockquotes


> Blockquotes can also be nested...
>> ...by using additional greater-than signs right next to each other...
> > > ...or with spaces between arrows.`);
</script>

<template>
  <div class="h-full announcement">
    <h1 class="text-2xl font-semibold">
      公告板
    </h1>
    <ElScrollbar max-height="calc(100vh - 8rem - 2rem)">
      <MarkdownRender
        :style="{
        }" :content="content"
        height="100%"
        max-height="100%"
      />
    </ElScrollbar>
  </div>
</template>

<style scoped>
/*
unset the default scrollbar style
*/
.announcement ::-webkit-scrollbar-thumb {
  background:unset

}
.announcement ::-webkit-scrollbar-thumb:hover {
  background:unset;
  border-radius:unset
}
.announcement ::-webkit-scrollbar-track {
  background:unset
}
</style>
