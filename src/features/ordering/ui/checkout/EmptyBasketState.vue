<script setup lang="ts">
import Button from 'primevue/button'

defineEmits<{ browse: [] }>()
</script>

<template>
  <section class="checkout-state" aria-labelledby="empty-basket-title">
    <h1
      id="empty-basket-title"
      class="checkout-state__title typography typography--title typography--title-x-large"
    >
      Your Basket is empty
    </h1>
    <p>Select an Artwork before configuring an order.</p>
    <Button label="Browse Artworks" @click="$emit('browse')" />
  </section>
</template>

<style scoped>
.checkout-state {
  max-inline-size: var(--layout-checkout-state-max-inline-size);
  margin-inline: auto;
  padding: var(--space-8);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}

.checkout-state__title {
  margin-top: 0;
}
</style>
