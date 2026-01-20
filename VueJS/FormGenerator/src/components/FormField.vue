<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  type: 'input' | 'select' | 'checkbox' | 'textarea'
  modelValue: string | boolean | number
  label?: string
  options?: Array<{ value: string | number, label: string }>
  placeholder?: string,
  required?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | boolean): void
}>()

const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>

<template>
  <div class="form-field">
    <input
      v-if="type === 'input'"
      v-model="inputValue"
      :type="inputValue === true ? 'checkbox' : 'text'"
      :placeholder="placeholder"
      class="form-control"
    />

    <select
      v-else-if="type === 'select'"
      v-model="inputValue"
      class="form-control"
      :placeholder="placeholder"
    >
      <option v-if="placeholder" disabled value="">{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>

    <input
      v-else-if="type === 'checkbox'"
      type="checkbox"
      v-model="inputValue"
      class="form-checkbox"
    />

    <textarea
      v-else-if="type === 'textarea'"
      v-model="inputValue"
      :placeholder="placeholder"
      class="form-control"
      rows="5"
    />
    <slot></slot>
  </div>
</template>

