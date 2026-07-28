<script setup lang="ts">
import type { FormIssue } from '../form/use-form-issues'

import {
  CustomerDetailsFormField,
  type CustomerDetailsFormFieldName,
} from './customer-details-form-fields'
import CustomerDetailsTextField from './CustomerDetailsTextField.vue'

defineProps<{
  disabled: boolean
  issues: readonly FormIssue[]
}>()

function issueFor(
  issues: readonly FormIssue[],
  field: CustomerDetailsFormFieldName,
): string | undefined {
  return issues.find((issue) => issue.field === field)?.message
}
</script>

<template>
  <div class="customer-details-fields">
    <section class="customer-details-fields__section" aria-labelledby="customer-contact-title">
      <div class="customer-details-fields__heading">
        <span class="customer-details-fields__number typography typography--title">01</span>
        <div>
          <h2
            id="customer-contact-title"
            class="customer-details-fields__section-title typography typography--title typography--title-small"
          >
            Contact
          </h2>
          <p class="customer-details-fields__section-description typography typography--meta">
            For your order confirmation and delivery updates.
          </p>
        </div>
      </div>
      <div class="customer-details-fields__stack">
        <CustomerDetailsTextField
          :name="CustomerDetailsFormField.fullName"
          label="Full name"
          autocomplete="name"
          :disabled="disabled"
          :server-error="issueFor(issues, CustomerDetailsFormField.fullName)"
        />
        <CustomerDetailsTextField
          :name="CustomerDetailsFormField.email"
          label="Email address"
          autocomplete="email"
          type="email"
          :disabled="disabled"
          :server-error="issueFor(issues, CustomerDetailsFormField.email)"
        />
        <CustomerDetailsTextField
          :name="CustomerDetailsFormField.phone"
          label="Phone number"
          autocomplete="tel"
          type="tel"
          optional
          :disabled="disabled"
          :server-error="issueFor(issues, CustomerDetailsFormField.phone)"
        />
      </div>
    </section>

    <section class="customer-details-fields__section" aria-labelledby="customer-delivery-title">
      <div class="customer-details-fields__heading">
        <span class="customer-details-fields__number typography typography--title">02</span>
        <div>
          <h2
            id="customer-delivery-title"
            class="customer-details-fields__section-title typography typography--title typography--title-small"
          >
            Delivery
          </h2>
          <p class="customer-details-fields__section-description typography typography--meta">
            Standard delivery arrives in 3–5 working days.
          </p>
        </div>
      </div>
      <div class="customer-details-fields__stack">
        <CustomerDetailsTextField
          :name="CustomerDetailsFormField.addressLine1"
          label="Address"
          autocomplete="street-address"
          :disabled="disabled"
          :server-error="issueFor(issues, CustomerDetailsFormField.addressLine1)"
        />
        <div class="customer-details-fields__location">
          <CustomerDetailsTextField
            :name="CustomerDetailsFormField.city"
            label="City"
            autocomplete="address-level2"
            :disabled="disabled"
            :server-error="issueFor(issues, CustomerDetailsFormField.city)"
          />
          <CustomerDetailsTextField
            :name="CustomerDetailsFormField.postcode"
            label="Postcode"
            autocomplete="postal-code"
            :disabled="disabled"
            :server-error="issueFor(issues, CustomerDetailsFormField.postcode)"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.customer-details-fields {
  display: grid;
  gap: var(--space-8);
}

.customer-details-fields__section {
  padding-bottom: var(--space-8);
  border-bottom: 1px solid var(--color-border);
}

.customer-details-fields__heading {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  gap: var(--space-3);
  align-items: start;
}

.customer-details-fields__number {
  color: var(--color-muted);
}

.customer-details-fields__section-title,
.customer-details-fields__section-description {
  margin: 0;
}

.customer-details-fields__section-description {
  margin-top: var(--space-1);
}

.customer-details-fields__stack {
  display: grid;
  gap: var(--space-4);
  margin-top: var(--space-6);
  margin-left: 52px;
}

.customer-details-fields__location {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

@media (max-width: 560px) {
  .customer-details-fields__stack {
    margin-left: 0;
  }

  .customer-details-fields__location {
    grid-template-columns: 1fr;
  }
}
</style>
