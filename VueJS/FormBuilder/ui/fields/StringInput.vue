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
	<input :readonly="properties?.readonly||null"
				 :minlength="scheme?.minLength||null"
				 :maxlength="scheme?.maxLength||null"
				 :required="required"
				 type="text"
				 class="form-control"
				 v-model="obj.data[name]" />
</template>
