<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'

import { formatGbp } from '@/shared/money/format-gbp'

import type { OrderConfiguration, OrderSummary } from '../../domain/order-configuration'
import type { CheckoutLine } from '../checkout/checkout-line'
import type { FormIssue } from '../form/use-form-issues'
import OrderSummaryItems from '../order-summary/OrderSummaryItems.vue'
import OrderSummaryPanel from '../order-summary/OrderSummaryPanel.vue'
import OrderSummaryTotals from '../order-summary/OrderSummaryTotals.vue'

import { CustomerDetailsFormField } from './customer-details-form-fields'
import CustomerTermsField from './CustomerTermsField.vue'

const props = defineProps<{
  lines: readonly CheckoutLine[]
  configuration: OrderConfiguration
  summary: OrderSummary
  disabled: boolean
  issues: readonly FormIssue[]
}>()

const giftOptionsSummary = computed(() =>
  [
    props.configuration.giftOptions.message
      ? `Message: ${props.configuration.giftOptions.message}`
      : undefined,
    props.configuration.giftOptions.hidePricesOnPackingSlip
      ? 'Hide prices on packing slip'
      : undefined,
  ]
    .filter((option): option is string => option !== undefined)
    .join(' · '),
)
const termsError = computed(
  () =>
    props.issues.find((issue) => issue.field === CustomerDetailsFormField.termsAccepted)?.message,
)
</script>

<template>
  <OrderSummaryPanel class="customer-order-review" label="Order summary">
    <h2
      id="customer-order-review-title"
      class="customer-order-review__title typography typography--title typography--title-large"
    >
      Order summary
    </h2>
    <OrderSummaryItems :lines="lines" :configuration="configuration" :summary="summary" />

    <p
      v-if="giftOptionsSummary.length > 0"
      class="customer-order-review__gift-options typography typography--meta"
    >
      Gift options: {{ giftOptionsSummary }}
    </p>

    <OrderSummaryTotals :configuration="configuration" :summary="summary" :show-hint="false" />
    <CustomerTermsField :disabled="disabled" :server-error="termsError" />
    <Button
      class="customer-order-review__submit typography typography--body-x-large"
      data-testid="submit-order"
      :label="'Place order · ' + formatGbp(summary.total)"
      :disabled="disabled"
      :loading="disabled"
      type="submit"
    />
    <p class="customer-order-review__reassurance typography typography--meta">
      You will receive an email confirmation after placing your order.
    </p>
  </OrderSummaryPanel>
</template>

<style scoped>
.customer-order-review__title {
  padding-bottom: 28px;
  margin: 0 0 28px;
  border-bottom: 1px solid var(--color-border);
}

.customer-order-review__gift-options {
  padding: var(--space-4) 0;
  margin: 0;
  border-bottom: 1px solid var(--color-border);
}

:deep(.p-button.customer-order-review__submit) {
  width: 100%;
  min-height: 72px;
  margin-top: var(--space-6);
  color: var(--color-surface);
  background: var(--color-ink);
  border-color: var(--color-ink);
  border-radius: 6px;
}

:deep(.p-button.customer-order-review__submit:hover) {
  color: var(--color-surface);
  background: var(--color-accent);
  border-color: var(--color-accent);
}

.customer-order-review__reassurance {
  margin: var(--space-3) 0 0;
  text-align: center;
}
</style>
