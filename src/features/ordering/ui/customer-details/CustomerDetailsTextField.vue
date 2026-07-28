<script setup lang="ts">
import FormField from '@primevue/forms/formfield'
import InputText from 'primevue/inputtext'

import {
  customerDetailsFieldErrorId,
  customerDetailsFieldId,
  type CustomerDetailsFormFieldName,
} from './customer-details-form-fields'

defineProps<{
  name: CustomerDetailsFormFieldName
  label: string
  autocomplete: string
  type?: 'email' | 'tel' | 'text'
  optional?: boolean
  disabled: boolean
  serverError?: string
}>()
</script>

<template>
  <FormField v-slot="$field" :name="name">
    <label class="customer-details-field" :for="customerDetailsFieldId(name)">
      <span class="customer-details-field__label typography typography--caption">
        {{ label }}
        <span v-if="optional" class="customer-details-field__optional">(optional)</span>
      </span>
      <InputText
        v-bind="$field.props"
        :id="customerDetailsFieldId(name)"
        :name="name"
        :type="type ?? 'text'"
        :autocomplete="autocomplete"
        :disabled="disabled"
        :invalid="$field.invalid || serverError !== undefined"
        class="customer-details-field__input"
      />
    </label>
    <p
      v-if="$field.invalid || serverError !== undefined"
      :id="customerDetailsFieldErrorId(name)"
      class="customer-details-field__error typography typography--caption"
    >
      {{ serverError ?? $field.error?.message }}
    </p>
  </FormField>
</template>

<style scoped>
.customer-details-field {
  display: grid;
  gap: var(--space-1);
}

.customer-details-field__label {
  font-weight: 400;
}

.customer-details-field__optional {
  color: var(--color-muted);
  font-weight: 400;
}

.customer-details-field__input {
  width: 100%;
}

.customer-details-field__error {
  min-block-size: 1.25em;
  margin: 0;
  color: var(--color-error-border);
}

:deep(.p-formfield) {
  display: grid;
  gap: var(--space-1);
  min-width: 0;
}

:deep(.p-inputtext) {
  min-height: 54px;
  padding: var(--space-2);
  color: var(--color-ink);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 3px;
  box-shadow: none;
}

:deep(.p-inputtext:not(:disabled):hover),
:deep(.p-inputtext:enabled:focus) {
  border-color: var(--color-ink);
  box-shadow: inset 0 0 0 1px var(--color-ink);
}

:deep(.p-inputtext.p-invalid) {
  border-color: var(--color-error-border);
  box-shadow: inset 0 0 0 1px var(--color-error-border);
}

:deep(.p-inputtext:disabled) {
  color: var(--color-muted);
  background: var(--color-selection);
  opacity: 1;
}
</style>
