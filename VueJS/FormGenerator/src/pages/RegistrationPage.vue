<template>
 <div><FormGenerator :fields="fields" :model="model" @on-submit="onsubmit" @on-reset="oncancel"/></div>
</template>

<script setup lang="ts">
import FormGenerator from '../components/FormGenerator.vue';
import {ref} from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const model = ref(store.getters.formById('registration') || {})

const fields=[
  {name:'fio', type:'input', title:'ФИО', required:true},
  {name:'sex', type:'select', title:'Пол', options:[{label:'M', value:0},{label:'Ж', value:1}], required:true},
  {name:'comment', type:'textarea', title:'Комменарий'}
];

const onsubmit = ()=>{alert('Submit!'); store.commit('save_form', {id:'registration', data:model.value})},
      oncancel = ()=>{alert('Cancelled !'); }
</script>
