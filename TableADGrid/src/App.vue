<template>
  <div class="tree-store-container">
    <div class="controls">
      <button @click="addRandomItem" class="btn btn-primary">
        Добавить случайный элемент
      </button>
      <button @click="removeItem(selectedItemId)" class="btn btn-danger" :disabled="!selectedItemId">
        Удалить выбранный
      </button>
      <p class="info">
        Всего элементов: {{ itemsStore.getAll.length || 0 }}
      </p>
    </div>
    <div class="grid-container">
      <ag-grid-vue
          class="ag-theme-alpine"
          style="height: 500px"
          :columnDefs="columnDefs"
          :rowData="itemsStore.getAll"
          :gridOptions="gridOptions"
          @grid-ready="onGridReady"
          @selection-changed="onSelectionChanged"
      ></ag-grid-vue>

    </div>

  </div>
</template>
<script lang="ts" setup>
import {ref, onMounted} from 'vue';
import {TreeStore, Item} from './TreeStore'
import {AgGridVue} from 'ag-grid-vue3';
import {
  ModuleRegistry,
  AllCommunityModule
} from "ag-grid-community";
import {/*RowGroupingModule, */TreeDataModule} from "ag-grid-enterprise";

ModuleRegistry.registerModules([AllCommunityModule, /*RowGroupingModule, */TreeDataModule]);

const {items} = defineProps<myProps>();

const itemsStore = new TreeStore(items).useStore();

const selectedItemId = ref(null),
    gridApi = ref(null),

    onGridReady = (params) => {
      gridApi.value = params.api;
      params.api.moveColumnByIndex(1,2);
    },
    onSelectionChanged = (params) => {
      const selectedRows = params.api.getSelectedRows();
      selectedItemId.value = (selectedRows.length) ? selectedRows[0].id : null;
    },
    columnDefs = [
      {field: 'id', headerName: '№ п/п', cellDataType: 'text',  cellRenderer: (params) => {return (params.node.rowIndex+1)}, width:50},
      {
        headerName: 'Категория',
        cellRenderer: ({data}) => ((itemsStore.getAllChildren(data?.id).length) ? '<b>Группа</b>' : 'Элемент')
      },
      {field: 'label', headerName: 'Название'}
    ],
    defaultColDef = ref({
      flex: 1,
      minWidth: 100,
    }),
    gridOptions = {
      rowSelection: {
        mode: 'singleRow',
      },
      autoGroupColumnDef: {
        headerName: '',
        minWidth: 300,
        cellRendererParams: {
          //suppressCount: true,
        },
      },
      treeData: true,
      getDataPath: data => {
        return itemsStore.getPath(data.id);
      },
      groupDefaultExpanded: -1
    };


const addRandomItem = function () {
      const parents = itemsStore.getAll.filter(item =>
          item.parent === null || itemsStore.hasChildren(item.id)
      );
      const randomParent = parents.length > 0
          ? parents[Math.floor(Math.random() * parents.length)].id
          : null;

      const newId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newItem = {
        id: newId,
        parent: randomParent,
        label: `Новый элемент ${itemsStore.getAll.length + 1}`,
      };

      try {
        itemsStore.addItem(newItem);

        console.log('Элемент добавлен:', newItem);
      } catch (error) {
        console.error('Ошибка при добавлении элемента:', error);
        alert(error.message);
      }
    },

    removeItem = function (id) {
      if (confirm('Вы уверены, что хотите удалить этот элемент и всех его потомков?')) {
        const success = itemsStore.removeItem(id);
        if (success) {

            this.selectedItemId = null;
          }

          console.log('Элемент удален:', id);
        }
      };


onMounted(() => {

});


interface myProps {
  items: Item[]
}
</script>