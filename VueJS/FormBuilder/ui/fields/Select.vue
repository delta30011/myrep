<script lang="ts">
import { defineComponent } from 'vue'
import fieldProps from '../../lib/FieldProps'
export default defineComponent({
	data() {
		return {}
	},
	props: fieldProps,
})
</script>
<template>
	<select :readonly="!!properties?.readonly" :required="required" class="form-control" v-model="obj.data[name]">
		<option value="-1" v-if="!properties?.noEmptyValue" selected>----</option>
		<option :value="value" v-for="(title,value,i) in properties?.enum" :key="i">{{title}}</option>
	</select>
</template>
