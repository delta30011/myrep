<template>
  <q-list class="draggable" bordered separator @drop="onDrop" @dragover="(e:MouseEvent)=>e.preventDefault()">
    <q-item v-for="(item,i) in items" data-id="i" :key="i" bordered ref="listItems" @dragover="onDragOver(i)">
      <strong> {{item.title}} </strong>
      <q-btn icon="reorder" flat densed size="xs" @mousedown="toggleDrag(i,true)" @mouseup="toggleDrag(i,false)"/>
      <q-btn icon="close" flat densed size="xs" @click="removeItem(i)"/>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import {ref, useTemplateRef} from 'vue';

const refs = useTemplateRef('listItems');
const activeItem = ref<number>(-1);
const overItem = ref<number>(-1);

const {items} = defineProps<{items:any[]}>();

function toggleDrag (num:number, flag:boolean) {
  const item = refs.value && refs.value[num];
  if (!item) return;
  (item as any).$el.draggable=flag;
  activeItem.value = (flag) ? num : -1;
}


function onDrop() {

  let arr = items,
    from = activeItem.value || 0,
    to = overItem.value || from,
    where = to+((from<to)?0:-1);

  if (to != from) arr.splice(where,0, arr.splice(from, 1)[0]);
  overItem.value = activeItem.value = -1;
}

function onDragOver(num:number) {
  if (activeItem.value >= 0) overItem.value = num;
}

function removeItem(num:number) {
  items.splice(num, 1);
}


</script>
