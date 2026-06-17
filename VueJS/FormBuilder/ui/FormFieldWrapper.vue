<script lang="ts">
import { computed, defineComponent, defineAsyncComponent } from 'vue'
import FieldDictionary from '../lib/FormFieldDictionary'
import fieldProps from '../lib/FieldProps'

const path = './fields/'

export default defineComponent({
	data(props) {
		return {
			contentComponent: computed(() =>
				defineAsyncComponent(() => import(/* @vite-ignore */ `${path}${props.getTemplate()}.vue`)),
			),
			fieldMeta: props?.getMeta()
		}
	},
	methods: {
		getMeta() {
			return (this.scheme?.properties) ? this.scheme?.properties[this?.name] : this.scheme
		},

		getTemplate() {
			const type = this.fieldMeta?.type || 'other',
				format = this.fieldMeta?.format || 'default'
			return FieldDictionary[type]?.[format] || 'StringInput'
		},
	},
	props: fieldProps,
})
</script>
<template>
	<div class="form-group" v-show="!properties?.hidden" :data-required="required||null">

		<label class="form-label">{{ fieldMeta?.title }}</label>
		<component
			:scheme="getMeta()"
			:properties="properties"
			:obj="obj"
			:name="name"
			:required="required"
			:is="contentComponent"
		></component>
	</div>
</template>
