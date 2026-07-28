<script setup lang="ts">
import FormField from '@primevue/forms/formfield'
import SelectButton from 'primevue/selectbutton'

import type { SelectFieldOption } from '../form/select-field.types'

defineProps<{
  name: string
  inputId: string
  label: string
  modelValue: string
  options: readonly SelectFieldOption[]
  error?: string
}>()

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <FormField :name="name" :initial-value="modelValue">
    <span
      :id="`${inputId}-label`"
      class="presentation-choice__label typography typography--caption"
      >{{ label }}</span
    >
    <SelectButton
      :id="inputId"
      :model-value="modelValue || null"
      :options="[...options]"
      option-label="label"
      option-value="value"
      :invalid="false"
      :class="{ 'presentation-choice__control--invalid': Boolean(error) }"
      :aria-invalid="Boolean(error)"
      :aria-labelledby="`${inputId}-label`"
      :allow-empty="false"
      @update:model-value="$emit('update:modelValue', $event)"
    />
    <p
      :id="`${inputId}-error`"
      class="presentation-choice__error typography typography--caption"
      :class="{ 'presentation-choice__error--empty': !error }"
    >
      {{ error }}
    </p>
  </FormField>
</template>

<style scoped>
:deep(.p-formfield) {
  display: grid;
  gap: var(--space-1);
  min-width: 0;
}

:deep(.p-selectbutton) {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-2);
}

:deep(.p-selectbutton.presentation-choice__control--invalid) {
  border: 0;
}

:deep(.p-selectbutton .p-togglebutton) {
  min-height: 54px;
  color: var(--color-ink);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  box-shadow: none;
}

:deep(.p-selectbutton .p-togglebutton.p-togglebutton-checked) {
  color: var(--color-ink);
  background: var(--color-selection);
  border-color: var(--color-accent);
  box-shadow: inset 0 0 0 1px var(--color-accent);
}

:deep(.p-selectbutton.presentation-choice__control--invalid .p-togglebutton) {
  border-color: var(--color-error-border);
  box-shadow: inset 0 0 0 1px var(--color-error-border);
}

:deep(.p-selectbutton .p-togglebutton:not(.p-disabled):hover),
:deep(.p-selectbutton .p-togglebutton:not(.p-disabled):focus-visible) {
  color: var(--color-ink);
  border-color: var(--color-ink);
  box-shadow: inset 0 0 0 1px var(--color-ink);
}

.presentation-choice__error {
  min-block-size: 1.25em;
  margin: 0;
  color: var(--color-error-border);
}

.presentation-choice__error--empty {
  visibility: hidden;
}
</style>
