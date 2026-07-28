<script setup lang="ts">
import FormField from '@primevue/forms/formfield'
import Checkbox from 'primevue/checkbox'
import Message from 'primevue/message'

import {
  CustomerDetailsFormField,
  customerDetailsFieldErrorId,
  customerDetailsFieldId,
} from './customer-details-form-fields'

defineProps<{
  disabled: boolean
  serverError?: string
}>()
</script>

<template>
  <FormField v-slot="$field" :name="CustomerDetailsFormField.termsAccepted">
    <div class="customer-terms">
      <Checkbox
        v-bind="$field.props"
        :input-id="customerDetailsFieldId(CustomerDetailsFormField.termsAccepted)"
        :name="CustomerDetailsFormField.termsAccepted"
        binary
        :disabled="disabled"
        :invalid="$field.invalid || serverError !== undefined"
      />
      <label
        :for="customerDetailsFieldId(CustomerDetailsFormField.termsAccepted)"
        class="typography typography--body"
      >
        I agree to the terms and confirm these details are correct.
      </label>
    </div>
    <Message
      v-if="$field.invalid || serverError !== undefined"
      :id="customerDetailsFieldErrorId(CustomerDetailsFormField.termsAccepted)"
      severity="error"
      size="small"
      variant="simple"
    >
      {{ serverError ?? $field.error?.message }}
    </Message>
  </FormField>
</template>

<style scoped>
.customer-terms {
  display: flex;
  gap: var(--space-3);
  align-items: flex-start;
}

.customer-terms label {
  cursor: pointer;
}

:deep(.p-checkbox) {
  flex: 0 0 auto;
}

:deep(.p-checkbox-box) {
  width: 22px;
  height: 22px;
  color: var(--color-surface);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 3px;
  box-shadow: none;
}

:deep(.p-checkbox:not(.p-disabled):hover .p-checkbox-box),
:deep(.p-checkbox.p-focus .p-checkbox-box) {
  border-color: var(--color-ink);
  box-shadow: inset 0 0 0 1px var(--color-ink);
}

:deep(.p-checkbox.p-highlight .p-checkbox-box) {
  background: var(--color-ink);
  border-color: var(--color-ink);
}

:deep(.p-checkbox.p-invalid .p-checkbox-box) {
  border-color: var(--color-error-border);
  box-shadow: inset 0 0 0 1px var(--color-error-border);
}
</style>
