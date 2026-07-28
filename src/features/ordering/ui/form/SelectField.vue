<script setup lang="ts">
import FormField from '@primevue/forms/formfield'
import Select from 'primevue/select'

import type { SelectFieldOption } from './select-field.types'

const props = withDefaults(
  defineProps<{
    name: string
    inputId: string
    label: string
    modelValue: string
    options: readonly SelectFieldOption[]
    placeholder?: string
    disabled?: boolean
    compact?: boolean
    large?: boolean
    error?: string
    hint?: string
  }>(),
  {
    placeholder: undefined,
    disabled: false,
    compact: false,
    large: false,
    error: undefined,
    hint: undefined,
  },
)

defineEmits<{ 'update:modelValue': [value: string] }>()

function optionFor(value: unknown): SelectFieldOption | undefined {
  return props.options.find((option) => option.value === value)
}
</script>

<template>
  <FormField :name="name" :initial-value="modelValue" :class="{ 'select-field--compact': compact }">
    <label
      v-if="!compact"
      class="select-field__label typography typography--caption"
      :for="inputId"
      >{{ label }}</label
    >
    <Select
      :input-id="inputId"
      :model-value="modelValue || null"
      :options="[...options]"
      option-label="label"
      option-value="value"
      option-disabled="disabled"
      :placeholder="placeholder"
      :disabled="disabled"
      :invalid="Boolean(error)"
      :class="[
        'typography',
        'typography--body',
        {
          'typography--body-large': large,
          'typography--compact': large,
          'select-field__control--compact': compact,
          'select-field__control--large': large,
        },
      ]"
      :aria-label="compact ? label : undefined"
      fluid
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <template #value="slotProps">
        <span class="select-field__value">
          <img
            v-if="optionFor(slotProps.value)?.imagePath"
            :src="optionFor(slotProps.value)?.imagePath"
            alt=""
          />
          <span :class="{ 'select-field__placeholder': !optionFor(slotProps.value) }">
            {{ optionFor(slotProps.value)?.label ?? slotProps.placeholder }}
          </span>
        </span>
      </template>
      <template #option="slotProps">
        <span class="select-field__option">
          <img v-if="slotProps.option.imagePath" :src="slotProps.option.imagePath" alt="" />
          <span>{{ slotProps.option.label }}</span>
        </span>
      </template>
    </Select>
    <p v-if="hint" class="select-field__hint typography typography--meta">{{ hint }}</p>
    <p
      v-if="!compact || error"
      :id="`${inputId}-error`"
      class="select-field__error typography typography--caption"
      :class="{ 'select-field__error--empty': !error }"
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

.select-field__hint,
.select-field__error {
  margin: 0;
}

.select-field__error {
  min-block-size: 1.25em;
  color: var(--color-error-border);
}

.select-field__error--empty {
  visibility: hidden;
}

.select-field__value,
.select-field__option {
  display: inline-flex;
  gap: var(--space-2);
  align-items: center;
}

.select-field__value img,
.select-field__option img {
  width: 32px;
  height: 22px;
  object-fit: cover;
  border: 1px solid var(--color-border);
  border-radius: 2px;
}

.select-field__placeholder {
  color: var(--color-muted);
}

:deep(.p-select) {
  min-height: 54px;
  color: var(--color-ink);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 3px;
  box-shadow: none;
}

:deep(.p-select-label) {
  display: flex;
  align-items: center;
  padding: var(--space-2);
  color: var(--color-ink);
}

:deep(.p-select-label.p-placeholder) {
  color: var(--color-muted);
}

:deep(.p-select-dropdown) {
  width: 2.5rem;
  color: var(--color-muted);
}

:deep(.p-select:not(.p-disabled).p-focus),
:deep(.p-select:not(.p-disabled):hover) {
  border-color: var(--color-ink);
  box-shadow: inset 0 0 0 1px var(--color-ink);
}

:deep(.p-select.p-invalid) {
  border-color: var(--color-error-border);
  box-shadow: inset 0 0 0 1px var(--color-error-border);
}

:deep(.p-select.p-disabled) {
  color: var(--color-muted);
  background: var(--color-selection);
  opacity: 1;
}

:deep(.p-select-overlay) {
  color: var(--color-ink);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}

:deep(.p-formfield.select-field--compact) {
  display: block;
}

:deep(.p-select.select-field__control--compact) {
  min-height: auto;
  background: transparent;
  border: 0;
}

:deep(.p-select.select-field__control--compact .p-select-label) {
  padding: 0;
  text-align: right;
  justify-content: flex-end;
}

:deep(.p-select.select-field__control--compact .p-select-dropdown) {
  width: 1.5rem;
}

:deep(.p-select.select-field__control--compact:not(.p-disabled):hover) {
  border: 0;
  box-shadow: none;
}

:deep(.p-select.select-field__control--compact:not(.p-disabled).p-focus) {
  border: 0;
  outline: 2px solid var(--color-ink);
  outline-offset: 3px;
  box-shadow: none;
}

:deep(.p-select.select-field__control--large .p-select-label) {
  font: inherit;
}

:deep(.p-select.select-field__control--large .p-select-dropdown) {
  color: var(--color-ink);
}

:deep(.p-select-option.p-select-option-selected) {
  color: var(--color-ink);
  background: var(--color-selection);
}
</style>
