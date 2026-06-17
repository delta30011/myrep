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
	<div class="accordion pt-4" id="accordion">
		<div class="accordion-item" v-for="(group, i) in options.groups" :key="i">
			<h2 class="accordion-header" :id="`heading${i}`" type="button" data-bs-toggle="collapse" :data-bs-target="`#collapse${i}`" :aria-controls="`collapse${i}`">
				<button
					class="accordion-button"
					type="button"
					data-bs-toggle="collapse"
					:data-bs-target="`#collapse${i}`"
					aria-expanded="true"
					:aria-controls="`collapse${i}`"
				>
					{{ group.title }}
				</button>
			</h2>
			<div :id="`collapse${i}`" class="accordion-collapse collapse" :aria-labelledby="`heading${i}`" data-bs-parent="#accordion">
				<div class="accordion-body">
					<div v-for="(id, i) in group.ids" :key="i">
						<field-wrapper :scheme="scheme" :properties="options.properties[id]" :required="(scheme?.required || []).includes(id)" :obj="obj" :name="id" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
