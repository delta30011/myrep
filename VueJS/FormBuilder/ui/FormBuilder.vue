<script lang="ts">
import { defineComponent } from 'vue'
import FormGroupWrapper from './FormGroupWrapper.vue'

export default defineComponent({
  name: 'FormBuilder',
  components: { FormGroupWrapper },
  emits: ['form-submit'],
  methods: {
    submitForm(e) {
      console.log(this.obj)
      this.$emit('form-submit', {})
    },
  },
  data(props) {
    return {}
  },
  props: {
    scheme: {type:Object, default:()=>({})  },
    options: {type:Object, default:()=>({})  },
    obj: {type:Object, default:()=>({data:{}})  },
    debug: Boolean,
  },
  mounted() {
    if (this.debug) {
      const fields = this.options.properties
      Object.keys(fields).forEach((key) => {
        fields[key].readonly = false
        fields[key].hidden = false
      })
    }
  },
})
</script>

<template>
  <div>
    <FormGroupWrapper :scheme="scheme" :options="options" :obj="obj"> </FormGroupWrapper>

    <div class="pt-4"><button class="btn btn-primary" @click="submitForm">Отправить</button></div>
  </div>
</template>

<style lang="scss">
[data-required] label:after {
  content: ' *';
  color: rgb(var(--danger-rgb));
}
.form-control[readonly] {
  background: var(--gray-1);
}
.accordion-button {
  background-color: transparent !important;
}

.field-controls {
  font-size: 1rem;
  color: var(--bs-body-color);
  & > div {
    cursor: pointer;
  }
}
</style>
