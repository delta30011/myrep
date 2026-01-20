<template>
 <div><FormGenerator :fields="fields" :model="model" @on-submit="onsubmit"/></div>
</template>

<script setup lang="ts">
import FormGenerator from '../components/FormGenerator.vue';
import { useStore } from 'vuex';
import {ref} from "vue";

const store = useStore()

const model = ref(store.getters.formById('login') || {})

const fields=[
  {name:'Login', type:'input', title:'Логин', required:true},
  {name:'Pass', type:'input', title:'Пароль', required:true}
]

const onsubmit = ()=>{alert('Submit!'); store.commit('save_form', {id:'login', data:model.value})}

</script>
