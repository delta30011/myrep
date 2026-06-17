<script lang="ts">
import { defineComponent, computed } from 'vue';
import type { PropType } from 'vue';
import FieldWrapper from './FormFieldWrapper.vue';
import * as GroupTypes from './groups';

export default defineComponent({
	components: { FieldWrapper, ...GroupTypes },
	data: (props:any) => ({
	}),
	methods:{
	}
	,
	props: {
		scheme:Object,
		options:Object,
		obj:Object,
		name:String
	},
})
</script>

<template>
	<component :scheme="scheme" :options="options" :name="name" :obj="obj" :is="options.groupType+'Group'"></component>
</template>

<style>
fieldset {
	border:1px solid; border-radius:0.5em; padding:1em; margin-bottom:1em
}
</style>
