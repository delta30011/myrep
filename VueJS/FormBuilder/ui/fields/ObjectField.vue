<script lang="ts">
import { defineComponent } from 'vue'
import fieldProps from '../../lib/FieldProps'
import ModalDialog from '@/shared/ui/components/ModalDialog.vue'
import FieldWrapper from '../FormFieldWrapper.vue'

export default defineComponent({
	components: {
		FieldWrapper,
		ModalDialog,
	},
	data(props) {
		return {
			objList: [],
			newEntry: {},
			showDialog: false,
			editObjId: null,
		}
	},
	methods: {
		addItem() {
			this.showDialog = true;
      this.newEntry = {}
		},
		saveItem() {
			this.showDialog = false
			if (this.editObjId !== null) {
        this.objList.splice(this.editObjId,1, {...this.newEntry});
        this.editObjId = null;
      } else {
				this.objList.push({ ...this.newEntry })
			}

			this.obj.data[this.name] = this.objList
		},
		editItem(n:number) {
			this.newEntry = { ...this.objList[n] };
      this.editObjId = n;
			this.showDialog = true
		},
		delItem(n:number) {
			this.objList.splice(n, 1)
		},
	},
	props: fieldProps,
})
</script>

<template>
	<div>
		<ModalDialog v-model="showDialog" :options="{ hideCloseButton: true }">
			<div v-for="(childsScheme, id) in scheme.items" :key="id">
				<field-wrapper
					:scheme="childsScheme"
					:properties="{}"
					:required="(childsScheme?.required || []).includes(id)"
					:obj="{ data: newEntry }"
					:name="id"
				/>
			</div>
			<template #footer
				><button class="btn btn-primary" @click="saveItem">
					Сохранить <i class="bi bi-check"></i></button
			></template>
		</ModalDialog>

		<div class="card">
			<div class="card-body">
				<div style="overflow-y: auto" v-if="objList.length > 0">
					<table class="table table-bordered table-hover">
						<thead>
							<tr>
								<th v-for="(value, key) in objList[0]" :key="'th' + key">{{ key }}</th>
								<th width="1">&nbsp;</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(item, i) in objList" :key="i">
								<td v-for="(value, key) in item" :key="key + i">
									{{ value }}
								</td>
								<td width="1">
									<div class="hstack gap-3 px-2 d-flex">
										<a class="text-info fs-14 lh-1" @click="editItem(i)" role="button"
                    ><i class="ri-edit-line"></i
										></a>
										<a class="text-danger fs-14 lh-1 control" @click="delItem(i)" role="button"
                    ><i class="ri-delete-bin-5-line"></i
										></a>
									</div>
								</td>
							</tr>
						</tbody>
					</table>


				</div>

        <button class="btn btn-secondary-ghost" @click="addItem">
          Добавить &nbsp;<i class="bi bi-plus" title="Добавить"></i>
        </button>
			</div>
		</div>
		<input
			:readonly="properties?.readonly || null"
			:required="required"
			type="hidden"
			v-model="obj.data[name]"
		/>
	</div>
</template>
