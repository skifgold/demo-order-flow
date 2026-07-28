<script setup lang="ts">
import Button from 'primevue/button'

defineEmits<{ browse: [] }>()
</script>

<template>
  <section class="checkout-state" aria-labelledby="empty-basket-title">
    <h1 id="empty-basket-title">Your Basket is empty</h1>
    <p>Select an Artwork before configuring an order.</p>
    <Button label="Browse Artworks" @click="$emit('browse')" />
  </section>
</template>

<style scoped>
.checkout-state {
  max-inline-size: var(--layout-checkout-state-max-inline-size);
  padding: var(--space-8);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}

.checkout-state h1 {
  margin-top: 0;
  font-family: var(--font-display);
  font-size: var(--font-size-checkout-state-heading);
}
</style>
