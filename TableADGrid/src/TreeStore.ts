import {defineStore} from "pinia";
import {ref, computed} from 'vue';

class TreeStore {
    public useStore;

    constructor(items?: Item[]) {
        this.useStore = defineStore('items', () => {

            const storedItems = ref<Item[]>(items || []);

            const getAll = computed(() => {
                return [...storedItems.value];
            })

            const getItem = ((id) => {
                return storedItems.value.find(i => i.id == id) || null;
            })

            const getChildren = ((id) => {
                return storedItems.value.filter(i => i.parent == id) || [];
            })

            const getAllChildren = ((id) => {
                const result = [];
                const stack = [...getChildren(id)];

                while (stack.length > 0) {
                    const current = stack.pop();
                    if (current) {
                        result.push(current);
                        const children = getChildren(current.id);
                        stack.push(...children);
                    }
                }

                return result;
            });

            const getAllParents = (id) => {
                const result = [];
                let current = getItem(id);

                while (current && current.parent !== null && current.parent !== undefined) {
                    const parent = getItem(current.parent);
                    if (parent) {
                        result.push(parent);
                        current = parent;
                    } else {
                        break;
                    }
                }
                return result;
            }

            const getPath = (id) => {
                const result = [id+''];
                let current = getItem(id);

                while (current && current.parent !== null && current.parent !== undefined) {
                    const parent = getItem(current.parent);
                    if (parent) {
                        result.push(parent.id+'');
                        current = parent;
                    } else {
                        break;
                    }
                }

                //console.log('---',id,result.reverse());
                return result.reverse();
            }

            const addItem = (item) => {
                if (item.id && getItem(item.id)) {
                    throw new Error(`Элемент с id ${item.id} уже существует`);
                }

                if (item.parent !== null && item.parent !== undefined && !getItem(item.parent)) {
                    throw new Error(`Родитель с id ${item.parent} не существует`);
                }

                storedItems.value.push(item);

                return item;
            }

            const removeItem = (id) => {
                const itemToRemove = getItem(id);
                if (!itemToRemove) return false;

                const allChildren = getAllChildren(id);
                const idsToRemove = [id, ...allChildren.map(child => child.id)];

                storedItems.value = storedItems.value.filter(item => !idsToRemove.includes(item.id));

                return true;
            }

            const updateItem = (updatedItem) => {
                const existingItem = getItem(updatedItem.id);
                if (!existingItem) {
                    throw new Error(`Элемент с id ${updatedItem.id} не найден`);
                }

                if (updatedItem.parent !== existingItem.parent) {
                    if (updatedItem.parent !== null && updatedItem.parent !== undefined && !getItem(updatedItem.parent)) {
                        throw new Error(`Родитель с id ${updatedItem.parent} не существует`);
                    }
                }

                const index = storedItems.value.findIndex(i => i.id === updatedItem.id);
                storedItems.value[index] = {...existingItem, ...updatedItem};

                return storedItems.value[index];
            }

            const hasChildren = (id) => {
                return storedItems.value.filter(i => i.parent === id).length;
            }


            return {
                storedItems,
                getAll,
                getItem,
                getChildren,
                getAllChildren,
                getAllParents,
                getPath,
                addItem,
                removeItem,
                updateItem,
                hasChildren
            };
        });


    }


}


interface Item {
    id: string | number,
    parent: string | number,
    label: string
}

export {TreeStore, Item}