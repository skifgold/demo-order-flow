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
    summary?: boolean
    error?: string
    hint?: string
  }>(),
  {
    placeholder: undefined,
    disabled: false,
    compact: false,
    summary: false,
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
  <FormField
    :name="name"
    :initial-value="modelValue"
    :class="{ 'configuration-select--compact': compact }"
  >
    <label v-if="!compact" class="configuration-select__label" :for="inputId">{{ label }}</label>
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
      :class="{
        'configuration-select__control--compact': compact,
        'configuration-select__control--summary': summary,
      }"
      :aria-label="compact ? label : undefined"
      fluid
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <template #value="slotProps">
        <span class="configuration-select__value">
          <img
            v-if="optionFor(slotProps.value)?.imagePath"
            :src="optionFor(slotProps.value)?.imagePath"
            alt=""
          />
          <span :class="{ 'configuration-select__placeholder': !optionFor(slotProps.value) }">
            {{ optionFor(slotProps.value)?.label ?? slotProps.placeholder }}
          </span>
        </span>
      </template>
      <template #option="slotProps">
        <span class="configuration-select__option">
          <img v-if="slotProps.option.imagePath" :src="slotProps.option.imagePath" alt="" />
          <span>{{ slotProps.option.label }}</span>
        </span>
      </template>
    </Select>
    <p v-if="hint" class="configuration-select__hint">{{ hint }}</p>
    <p
      v-if="!compact || error"
      :id="`${inputId}-error`"
      class="configuration-select__error"
      :class="{ 'configuration-select__error--empty': !error }"
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

.configuration-select__label {
  font-size: var(--font-size-meta);
}

.configuration-select__hint,
.configuration-select__error {
  margin: 0;
  font-size: var(--font-size-meta);
}

.configuration-select__hint {
  color: var(--color-muted);
}

.configuration-select__error {
  min-block-size: 1.25em;
  color: var(--color-error-border);
}

.configuration-select__error--empty {
  visibility: hidden;
}

.configuration-select__value,
.configuration-select__option {
  display: inline-flex;
  gap: var(--space-2);
  align-items: center;
}

.configuration-select__value img,
.configuration-select__option img {
  width: 32px;
  height: 22px;
  object-fit: cover;
  border: 1px solid var(--color-border);
  border-radius: 2px;
}

.configuration-select__placeholder {
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
  font-size: var(--font-size-body);
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

:deep(.p-formfield.configuration-select--compact) {
  display: block;
}

:deep(.p-select.configuration-select__control--compact) {
  min-height: auto;
  background: transparent;
  border: 0;
}

:deep(.p-select.configuration-select__control--compact .p-select-label) {
  padding: 0;
  text-align: right;
  justify-content: flex-end;
}

:deep(.p-select.configuration-select__control--compact .p-select-dropdown) {
  width: 1.5rem;
}

:deep(.p-select.configuration-select__control--compact:not(.p-disabled):hover) {
  border: 0;
  box-shadow: none;
}

:deep(.p-select.configuration-select__control--compact:not(.p-disabled).p-focus) {
  border: 0;
  outline: 2px solid var(--color-ink);
  outline-offset: 3px;
  box-shadow: none;
}

:deep(.p-select.configuration-select__control--summary .p-select-label) {
  font-size: 18px;
  line-height: 1.25;
}

:deep(.p-select.configuration-select__control--summary .p-select-dropdown) {
  color: var(--color-ink);
}

:deep(.p-select-option.p-select-option-selected) {
  color: var(--color-ink);
  background: var(--color-selection);
}
</style>
