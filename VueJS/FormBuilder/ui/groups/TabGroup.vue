<script lang="ts">
import { defineComponent, ref } from 'vue'
import FieldWrapper from '@/components/object/FormFieldWrapper.vue'
export default defineComponent({
	components: { FieldWrapper },
	data() {
		return {}
	},
	setup(props, context) {},
	props: {
		scheme: Object,
		options: Object,
		obj: Object,
	},
})
</script>

<template>
	<div class="pt-4">
		<ul class="nav nav-tabs mb-3" role="tablist">
			<li
				v-for="(group, name, i) in options.groups"
				:key="`tab${name}`"
				class="nav-item"
				role="presentation"
			>
				<a
					:class="{ 'nav-link': true, 'active':i<1 }"
					data-bs-toggle="tab"
					role="tab"
					:href="'#pad' + name"
					aria-selected="true"
					>{{ group.title }}</a
				>
			</li>
		</ul>
		<div class="tab-content">
			<div
				:class="{'tab-pane':true, 'active':i<1}"
				:id="'pad'+name"
				role="tabpanel"
				v-for="(group, name, i) in options.groups"
				:key="name"
			>
				<div v-for="(id, j) in group.ids" :key="j">
					<field-wrapper
						:scheme="scheme"
						:properties="options.properties[id]"
						:required="(scheme?.required || []).includes(id)"
						:obj="obj"
						:name="id"
					/>
				</div>
			</div>
		</div>
	</div>
</template>
