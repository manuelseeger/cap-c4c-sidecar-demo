
<template>
  <div class="flex-small">
      <label :for="id">{{ title }}</label>
      <input  ref="inputRef" type="text" :id="id" :value="modelValue" />
  </div>
</template>

<script>
import { useCurrencyInput } from 'vue-currency-input'
import { watch } from 'vue'
export default {
  name: 'C4CCurrencyInput',
  props: {
    modelValue: Number,
    title: String,
    options: Object,
    id: String
  },
  setup(props) {
    const { inputRef, setValue } = useCurrencyInput(props.options)
    
    watch(
      () => props.modelValue,
      (value) => {
        setValue(value)
      }
    )
    return { inputRef }
  },
  
  emits: ['update:modelValue'] //@input="$emit('update:modelValue', $event.target.value)"
}
</script>

<style scoped>
  input,
  input:focus {
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
      -webkit-text-size-adjust: none;
      background: transparent;
      font-style: normal;
      font-size: 0.875rem;
      font-family: "72", "72full", Arial, Helvetica, sans-serif;
      line-height: normal;
      box-sizing: border-box;
      min-width: 3rem;
      overflow: hidden;
      text-overflow: ellipsis;
      vertical-align: inherit;
      border-radius: 0.5rem;
      font-weight: 400;
      margin: 0;
      color: #30435a !important;
      padding: 0.625rem 1rem;
      border-color: #dedede;
      border-width: 1px;
      border-style: solid;
      width: 187px;
  }

  label {
      font-family: Arial, Helvetica, sans-serif;
      white-space: nowrap;
      cursor: text;
      color: #92a1ae;
      line-height: 1rem;
      font-size: 0.875rem;
      font-weight: 700;
      text-align: left;
      display: block;
      letter-spacing: 0.5px;
      font-size: 14px;
      padding-bottom: 4px;
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
      -webkit-text-size-adjust: none;
  }
</style>
