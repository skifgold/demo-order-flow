<script setup lang="ts">
import { computed } from 'vue'

import { formatGbp } from '@/shared/money/format-gbp'

import type { OrderConfiguration, OrderSummary } from '../../domain/order-configuration'

const props = withDefaults(
  defineProps<{
    configuration: OrderConfiguration
    summary: OrderSummary
    showHint?: boolean
  }>(),
  { showHint: true },
)

const hasIncompleteLine = computed(() =>
  props.summary.lines.some((line) => line.lineTotal === undefined),
)
</script>

<template>
  <dl class="order-summary-totals typography typography--body-medium">
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
  <div class="order-summary-totals__total typography typography--title typography--title-medium">
    <span>Total</span>
    <strong class="typography typography--title typography--title-x-large">{{
      hasIncompleteLine ? '—' : formatGbp(summary.total)
    }}</strong>
  </div>
  <p v-if="showHint" class="order-summary-totals__hint typography typography--meta">
    {{
      hasIncompleteLine
        ? 'Complete every print to see the final total.'
        : 'Includes VAT where applicable'
    }}
  </p>
</template>

<style scoped>
.order-summary-totals {
  display: grid;
  gap: 20px;
  padding: 28px 0;
  margin: 0;
  border-bottom: 1px solid var(--color-border);
}

.order-summary-totals div,
.order-summary-totals__total {
  display: flex;
  gap: var(--space-2);
  justify-content: space-between;
}

.order-summary-totals dd {
  margin: 0;
  text-align: right;
}

.order-summary-totals__total {
  padding-top: 28px;
}

.order-summary-totals__hint {
  margin: var(--space-2) 0 0;
}
</style>
