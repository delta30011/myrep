<script lang="ts">
import { defineComponent, onMounted,ref  } from 'vue';
import fieldProps from '../../lib/FieldProps';
import '@/../public/assets/libs/flatpickr/flatpickr.min'



export default defineComponent({
	data() {
		return {}
	},
	props: fieldProps,
	setup() {
		const dateInput = ref([]),
			setRef = (el)=>{ if (el) dateInput.value.push(el) };

		onMounted(() => {
			window.flatpickr && flatpickr(dateInput.value[0])
		});

		return {setRef}
	}

})
</script>

<template>
	<input :readonly="properties?.readonly || false" :ref="setRef" :required="required" type="date" class="form-control flatpickr-input">
</template>
