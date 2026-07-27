<script setup lang="ts">
import Button from 'primevue/button'

import { useBasketStore } from '../basket.store'

defineEmits<{ checkout: [] }>()

const basket = useBasketStore()
</script>

<template>
  <aside class="basket-summary" aria-label="Basket summary">
    <p class="basket-summary__count typography typography--body">
      {{ basket.itemCount }} {{ basket.itemCount === 1 ? 'Artwork' : 'Artworks' }} selected
    </p>
    <Button label="Checkout" :disabled="basket.isEmpty" @click="$emit('checkout')" />
  </aside>
</template>

<style scoped>
.basket-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4);
  margin-bottom: var(--space-6);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
}

.basket-summary__count {
  margin: 0;
}
</style>
