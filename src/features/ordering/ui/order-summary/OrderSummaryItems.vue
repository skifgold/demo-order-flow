<script setup lang="ts">
import { formatGbp } from '@/shared/money/format-gbp'

import type { OrderConfiguration, OrderSummary } from '../../domain/order-configuration'
import type { CheckoutLine } from '../checkout/checkout-line'

const props = defineProps<{
  lines: readonly CheckoutLine[]
  configuration: OrderConfiguration
  summary: OrderSummary
}>()

function summaryLine(productId: string) {
  return props.summary.lines.find((line) => line.productId === productId)
}

function configurationDetails(productId: string): string[] {
  const configuration = props.configuration.lines[productId]

  if (configuration === undefined || configuration.presentation === undefined) {
    return ['Choose a presentation to see the price.']
  }

  const presentation =
    configuration.presentation === 'framed'
      ? `Framed · ${configuration.size ?? 'Choose size'}`
      : `Print only · ${configuration.size ?? 'Choose size'}`
  const finish = configuration.finish === 'lustre' ? 'Lustre Fine Art' : 'Matte Fine Art'
  const details = [presentation, finish]

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
  <ul class="order-summary-items">
    <li v-for="line in lines" :key="line.product.id">
      <img :src="line.product.imagePath" :alt="`Artwork: ${line.product.name}`" />
      <div>
        <strong>{{ line.product.name }}</strong>
        <span class="typography typography--body-medium">Qty: {{ line.quantity }}</span>
        <span
          v-for="detail in configurationDetails(line.product.id)"
          :key="detail"
          class="typography typography--body-medium"
          >{{ detail }}</span
        >
      </div>
      <strong>{{
        summaryLine(line.product.id)?.lineTotal === undefined
          ? '—'
          : formatGbp(summaryLine(line.product.id)!.lineTotal!)
      }}</strong>
    </li>
  </ul>
</template>

<style scoped>
.order-summary-items {
  display: grid;
  gap: 28px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.order-summary-items li {
  display: grid;
  grid-template-columns: 104px minmax(0, 1fr) auto;
  gap: 24px;
  align-items: start;
  padding-bottom: 28px;
  border-bottom: 1px solid var(--color-border);
}

.order-summary-items img {
  width: 104px;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  border: 1px solid var(--color-border);
  border-radius: 4px;
}

.order-summary-items strong,
.order-summary-items span {
  display: block;
}

.order-summary-items span {
  margin-top: var(--space-1);
}

@media (max-width: 560px) {
  .order-summary-items li {
    grid-template-columns: 72px minmax(0, 1fr) auto;
    gap: var(--space-3);
  }

  .order-summary-items img {
    width: 72px;
  }
}
</style>
