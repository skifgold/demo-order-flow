<script setup lang="ts">
import Button from 'primevue/button'

import { formatGbp } from '@/shared/money/format-gbp'

import type { AcceptedOrder } from '../../api/post-order.contract'

defineProps<{ order: AcceptedOrder }>()

defineEmits<{ continueShopping: [] }>()
</script>

<template>
  <section class="order-confirmation" aria-labelledby="order-confirmation-title">
    <p class="order-confirmation__eyebrow typography typography--overline">Order accepted</p>
    <h1
      id="order-confirmation-title"
      class="order-confirmation__title typography typography--title typography--title-2x-large"
    >
      Thank you for your order
    </h1>
    <p class="order-confirmation__lead typography typography--body-large typography--relaxed">
      We have emailed your order confirmation and will send delivery updates to you.
    </p>
    <dl class="order-confirmation__details typography typography--body">
      <div>
        <dt>Order number</dt>
        <dd>{{ order.orderNumber }}</dd>
      </div>
      <div>
        <dt>Estimated delivery</dt>
        <dd>{{ order.estimatedDeliveryDate }}</dd>
      </div>
      <div>
        <dt>Total</dt>
        <dd>{{ formatGbp(order.total) }}</dd>
      </div>
    </dl>
    <Button label="Continue shopping" @click="$emit('continueShopping')" />
  </section>
</template>

<style scoped>
.order-confirmation {
  max-width: var(--layout-checkout-state-max-inline-size);
  padding: var(--space-8);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}

.order-confirmation__eyebrow,
.order-confirmation__title {
  margin: 0;
}

.order-confirmation__title {
  margin-top: var(--space-3);
}

.order-confirmation__lead {
  margin-top: var(--space-4) !important;
  color: var(--color-muted);
}

.order-confirmation__details {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-6) 0;
  margin: var(--space-6) 0;
  border-block: 1px solid var(--color-border);
}

.order-confirmation__details div {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
}

.order-confirmation__details dd {
  margin: 0;
  font-weight: 700;
  text-align: right;
}
</style>
