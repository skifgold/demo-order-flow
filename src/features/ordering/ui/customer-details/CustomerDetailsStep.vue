<script setup lang="ts">
import { ref } from 'vue'
import Form from '@primevue/forms/form'
import type { FormInstance, FormSubmitEvent } from '@primevue/forms/form'
import Button from 'primevue/button'
import Message from 'primevue/message'

import type {
  CustomerDetails,
  OrderConfiguration,
  OrderSummary,
} from '../../domain/order-configuration'
import CheckoutProgress from '../checkout/CheckoutProgress.vue'
import type { CheckoutLine } from '../checkout/checkout-line'
import type { FormIssue } from '../form/use-form-issues'

import CustomerDetailsFields from './CustomerDetailsFields.vue'
import CustomerOrderReview from './CustomerOrderReview.vue'
import { customerDetailsResolver, toCustomerDetails } from './customer-details-form'

const props = defineProps<{
  customerDetails: CustomerDetails
  lines: readonly CheckoutLine[]
  configuration: OrderConfiguration
  summary: OrderSummary
  isSubmitting: boolean
  serverIssues: readonly FormIssue[]
  submissionMessage?: string
}>()

const emit = defineEmits<{
  submit: [customerDetails: CustomerDetails]
  checkpoint: [customerDetails: CustomerDetails]
  back: [customerDetails: CustomerDetails]
}>()

const form = ref<FormInstance>()

function currentCustomerDetails(): CustomerDetails {
  const states = form.value?.states ?? {}
  const values = Object.fromEntries(
    Object.entries(states).map(([field, state]) => [field, state.value]),
  )

  return toCustomerDetails({ ...props.customerDetails, ...values })
}

function onSubmit(event: FormSubmitEvent): void {
  const formStateValues = Object.fromEntries(
    Object.entries(event.states).map(([field, state]) => [field, state.value]),
  )
  const customerDetails = toCustomerDetails({ ...formStateValues, ...event.values })
  emit('checkpoint', customerDetails)

  if (!event.valid) {
    return
  }

  emit('submit', customerDetails)
}
</script>

<template>
  <section class="customer-details-step" aria-labelledby="customer-details-title">
    <header class="customer-details-step__header">
      <p class="customer-details-step__eyebrow typography typography--overline">
        Checkout / Step 2 of 2
      </p>
      <h1
        id="customer-details-title"
        class="customer-details-step__title typography typography--title typography--title-2x-large"
      >
        Your details
      </h1>
      <p
        class="customer-details-step__description typography typography--body-large typography--relaxed"
      >
        Add your delivery details, then review and place your order.
      </p>
      <CheckoutProgress :active-step="2" />
    </header>

    <Form
      ref="form"
      class="customer-details-step__form"
      :initial-values="customerDetails"
      :resolver="customerDetailsResolver"
      @submit="onSubmit"
    >
      <div class="customer-details-step__layout">
        <div class="customer-details-step__content">
          <Message v-if="submissionMessage !== undefined" severity="error" role="alert">
            {{ submissionMessage }}
          </Message>
          <CustomerDetailsFields :disabled="isSubmitting" :issues="serverIssues" />
          <footer class="customer-details-step__actions">
            <Button
              class="customer-details-step__back"
              data-testid="back-to-configuration"
              label="Back to configuration"
              severity="secondary"
              outlined
              type="button"
              :disabled="isSubmitting"
              @click="$emit('back', currentCustomerDetails())"
            />
          </footer>
        </div>
        <CustomerOrderReview
          :lines="lines"
          :configuration="configuration"
          :summary="summary"
          :disabled="isSubmitting"
          :issues="serverIssues"
        />
      </div>
    </Form>
  </section>
</template>

<style scoped>
.customer-details-step__header {
  max-width: var(--layout-checkout-header-max-inline-size);
  margin-bottom: var(--space-8);
}

.customer-details-step__eyebrow,
.customer-details-step__title {
  margin: 0;
}

.customer-details-step__title {
  margin-top: var(--space-3);
}

.customer-details-step__description {
  max-width: 560px;
  margin-top: var(--space-4) !important;
  color: var(--color-muted);
}

.customer-details-step__header :deep(.checkout-progress) {
  padding-top: var(--space-6);
  margin-top: var(--space-6);
  border-top: 1px solid var(--color-border);
}

.customer-details-step__layout {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(var(--layout-summary-min-inline-size), 0.95fr);
  gap: 40px;
  align-items: start;
}

.customer-details-step__content {
  display: grid;
  gap: var(--space-6);
}

.customer-details-step__actions {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  justify-content: space-between;
}

.customer-details-step__actions :deep(.p-button-text) {
  color: var(--color-ink);
  text-decoration: underline;
}

:deep(.p-button.customer-details-step__back) {
  min-height: 48px;
  color: var(--color-ink);
  border-color: var(--color-ink);
  border-radius: 3px;
}

:deep(.p-button.customer-details-step__back:not(:disabled):hover) {
  color: var(--color-surface);
  background: var(--color-ink);
  border-color: var(--color-ink);
}

@media (max-width: 800px) {
  .customer-details-step__layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .customer-details-step__actions {
    flex-direction: column-reverse;
    align-items: stretch;
  }
}
</style>
