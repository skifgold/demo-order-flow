<script setup lang="ts">
import Button from 'primevue/button'

defineEmits<{ retry: [] }>()
</script>

<template>
  <section class="checkout-state" role="alert" aria-labelledby="checkout-error-title">
    <h1
      id="checkout-error-title"
      class="checkout-state__title typography typography--title typography--title-x-large"
    >
      We could not prepare checkout
    </h1>
    <p>Please retry loading your selected Artworks.</p>
    <Button label="Retry" @click="$emit('retry')" />
  </section>
</template>

<style scoped>
.checkout-state {
  max-inline-size: var(--layout-checkout-state-max-inline-size);
  padding: var(--space-8);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}

.checkout-state__title {
  margin-top: 0;
}
</style>
