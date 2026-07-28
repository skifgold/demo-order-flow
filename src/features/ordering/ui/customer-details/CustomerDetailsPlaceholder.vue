<script setup lang="ts">
import Button from 'primevue/button'

defineEmits<{ back: [] }>()
</script>

<template>
  <section class="checkout-state" aria-labelledby="customer-details-title">
    <p class="typography typography--overline">Checkout / Step 2 of 2</p>
    <h1 id="customer-details-title">Your details</h1>
    <p>
      Print configuration is saved in this checkout session. Customer and delivery fields are the
      next checkout slice.
    </p>
    <Button label="Back to configuration" severity="secondary" @click="$emit('back')" />
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
