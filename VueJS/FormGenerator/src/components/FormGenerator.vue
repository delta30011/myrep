<template>
  <form>
    <div v-for="(item, i) in fields" :key="i" class="row"  :data-required="item?.required || null">
      <label>{{item.title}}</label>
      <FormField :type="item.type" :options="item.options" :required="item.required || false" v-model="model[item.name]" />
    </div>
    <button type="button" @click="reset">Отмена</button>
    <button type="button" @click="emit('onSubmit')">Сохранить</button>
  </form>
</template>
<script setup lang="ts">
import FormField from "./FormField.vue";
const emit = defineEmits(['onReset', 'onSubmit']);
const reset = function() {Object.keys(model).forEach(k => {
  model[k] = '';
}); emit('onReset')};
const {fields, model = {}} = defineProps<{fields:any[], model?:any}>();
</script>
