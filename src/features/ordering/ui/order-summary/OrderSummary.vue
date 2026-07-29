<script setup lang="ts">
import type {
  ConfigurationIssue,
  GiftOptions,
  OrderConfiguration,
  OrderSummary as OrderSummaryData,
  ShippingMethod,
} from '../../domain/order-configuration'
import type { CheckoutItem } from '../checkout/checkout-item'

import OrderOptions from './OrderOptions.vue'
import OrderSummaryItems from './OrderSummaryItems.vue'
import OrderSummaryPanel from './OrderSummaryPanel.vue'
import OrderSummaryTotals from './OrderSummaryTotals.vue'

defineProps<{
  items: readonly CheckoutItem[]
  configuration: OrderConfiguration
  summary: OrderSummaryData
  issues: readonly ConfigurationIssue[]
}>()

defineEmits<{
  updateShipping: [shipping: ShippingMethod]
  updateGiftOptions: [giftOptions: GiftOptions]
}>()
</script>

<template>
  <OrderSummaryPanel class="order-summary" label="Order summary">
    <h2 class="order-summary__title typography typography--title typography--title-large">
      Order summary
    </h2>
    <OrderSummaryItems :items="items" :configuration="configuration" :summary="summary" />
    <OrderOptions
      :configuration="configuration"
      :issues="issues"
      @update-shipping="$emit('updateShipping', $event)"
      @update-gift-options="$emit('updateGiftOptions', $event)"
    />
    <OrderSummaryTotals :configuration="configuration" :summary="summary" />
  </OrderSummaryPanel>
</template>

<style scoped>
.order-summary__title {
  padding-bottom: 28px;
  margin: 0 0 28px;
  border-bottom: 1px solid var(--color-border);
}
</style>
