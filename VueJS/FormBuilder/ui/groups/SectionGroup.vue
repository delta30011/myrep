<script lang="ts">
import {defineComponent,ref} from 'vue'
import FieldWrapper from '@/components/object/FormFieldWrapper.vue'
export default defineComponent({
	components: { FieldWrapper },
	data(){
		return ({
		})
	},
	setup(props,context) {
	},
	props:{
		scheme:Object,
		options:Object,
		obj:Object
	}
})
</script>

<template>
	<div class="pt-4">
	<div class="card custom-card"  v-for="(group, i) in options.groups" :key="i">
		<div class="card-header justify-content-between">
			<div class="card-title">
				<p>{{group.title}}</p>
			</div>
		</div>
		<div class="card-body">
			<div v-for="(id, i) in group.ids" :key="i">
				<field-wrapper :scheme="scheme" :properties="options.properties[id]" :required="(scheme?.required || []).includes(id)" :obj="obj" :name="id" />
			</div>
		</div>
	</div>
	</div>

</template>
