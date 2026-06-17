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
	<div class="form-check">
		<input class="form-check-input" type="checkbox" value="" id="id{{name}}" :readonly="properties?.readonly||null" :required="required"  v-model="obj.data[name]">
<!--		<label class="form-check-label" >

		</label>-->
	</div>
</template>
