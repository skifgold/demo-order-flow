<script setup lang="ts">
import { computed } from 'vue'

import { formatGbp } from '@/shared/money/format-gbp'

import type {
  ConfigurationIssue,
  GiftOptions,
  OrderConfiguration,
  OrderSummary as OrderSummaryData,
  ShippingMethod,
} from '../../domain/order-configuration'
import OrderOptions from './OrderOptions.vue'
import type { ConfiguredBasketLine } from '../configuration/configuration-form'

const props = defineProps<{
  lines: readonly ConfiguredBasketLine[]
  configuration: OrderConfiguration
  summary: OrderSummaryData
  issues: readonly ConfigurationIssue[]
}>()

defineEmits<{
  updateShipping: [shipping: ShippingMethod]
  updateGiftOptions: [giftOptions: GiftOptions]
}>()

const hasIncompleteLine = computed(() =>
  props.summary.lines.some((line) => line.lineTotal === undefined),
)

function summaryLine(productId: string) {
  return props.summary.lines.find((line) => line.productId === productId)
}

function configurationLabel(productId: string): string {
  const configuration = props.configuration.lines[productId]

  if (configuration?.presentation === 'framed') {
    return `Framed${configuration.size ? ` · ${configuration.size}` : ''}`
  }

  if (configuration?.presentation === 'print-only') {
    return `Print only${configuration.size ? ` · ${configuration.size}` : ''}`
  }

  return 'Choose finish'
}

function configurationDetails(productId: string): string[] {
  const configuration = props.configuration.lines[productId]

  if (configuration === undefined || configuration.presentation === undefined) {
    return ['Choose a presentation to see the price.']
  }

  const finish = configuration.finish === 'lustre' ? 'Lustre Fine Art' : 'Matte Fine Art'
  const details = [configurationLabel(productId), finish]

  if (configuration.presentation === 'framed') {
    details.push(
      configuration.frame === 'natural-oak'
        ? 'Natural Oak'
        : (configuration.frame ?? 'Choose frame'),
    )
    details.push(
      configuration.glazing === 'acrylic' ? 'Acrylic' : (configuration.glazing ?? 'Choose glazing'),
    )
  }

  return details
}
</script>

<template>
  <aside class="order-summary" aria-label="Order summary">
    <h2>Order summary</h2>
    <ul class="order-summary__lines">
      <li v-for="line in lines" :key="line.product.id">
        <img :src="line.product.imagePath" alt="" />
        <div>
          <strong>{{ line.product.name }}</strong>
          <span>Qty: {{ line.quantity }}</span>
          <span v-for="detail in configurationDetails(line.product.id)" :key="detail">{{
            detail
          }}</span>
        </div>
        <strong>{{
          summaryLine(line.product.id)?.lineTotal === undefined
            ? '—'
            : formatGbp(summaryLine(line.product.id)!.lineTotal!)
        }}</strong>
      </li>
    </ul>

    <OrderOptions
      :configuration="configuration"
      :issues="issues"
      @update-shipping="$emit('updateShipping', $event)"
      @update-gift-options="$emit('updateGiftOptions', $event)"
    />

    <dl class="order-summary__details">
      <div>
        <dt>Subtotal</dt>
        <dd>{{ hasIncompleteLine ? '—' : formatGbp(summary.subtotal) }}</dd>
      </div>
      <div>
        <dt>Shipping</dt>
        <dd>
          {{ configuration.shipping === 'express' ? 'Express' : 'Standard' }} ·
          {{ formatGbp(summary.shippingCost) }}
        </dd>
      </div>
    </dl>
    <div class="order-summary__total">
      <span>Total</span>
      <strong>{{ hasIncompleteLine ? '—' : formatGbp(summary.total) }}</strong>
    </div>
    <p class="order-summary__incomplete">
      {{
        hasIncompleteLine
          ? 'Complete every print to see the final total.'
          : 'Includes VAT where applicable'
      }}
    </p>
  </aside>
</template>

<style scoped>
.order-summary {
  position: sticky;
  top: var(--space-4);
  padding: 48px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

.order-summary h2,
.order-summary__total {
  font-family: var(--font-display);
  letter-spacing: var(--letter-spacing-heading);
}

.order-summary h2 {
  padding-bottom: 28px;
  margin: 0 0 28px;
  font-size: 38px;
  font-weight: 500;
  border-bottom: 1px solid var(--color-border);
}

.order-summary__lines {
  display: grid;
  gap: 28px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.order-summary__lines li {
  display: grid;
  grid-template-columns: 104px minmax(0, 1fr) auto;
  gap: 24px;
  align-items: start;
  padding-bottom: 28px;
  border-bottom: 1px solid var(--color-border);
}

.order-summary__lines img {
  width: 104px;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  border: 1px solid var(--color-border);
  border-radius: 4px;
}

.order-summary__lines strong,
.order-summary__lines span {
  display: block;
}

.order-summary__lines span,
.order-summary__details,
.order-summary__incomplete {
  color: var(--color-ink);
  font-size: 16px;
}

.order-summary__lines span {
  margin-top: var(--space-1);
}

.order-summary__details {
  display: grid;
  gap: 20px;
  padding: 28px 0;
  margin: 0 0 0;
  border-bottom: 1px solid var(--color-border);
}

.order-summary__details div,
.order-summary__total {
  display: flex;
  gap: var(--space-2);
  justify-content: space-between;
}

.order-summary__details dd {
  margin: 0;
  text-align: right;
}

.order-summary__total {
  padding-top: 28px;
  margin-top: 0;
  font-size: 36px;
}

.order-summary__total strong {
  font-size: 42px;
}

.order-summary__incomplete {
  margin: var(--space-2) 0 0;
  color: var(--color-muted);
  font-size: var(--font-size-meta);
}

@media (max-width: 800px) {
  .order-summary {
    position: static;
    order: 2;
  }
}
</style>
