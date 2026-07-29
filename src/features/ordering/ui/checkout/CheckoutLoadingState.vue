<template>
  <section class="checkout-state" aria-busy="true">
    <p>Preparing your selected Artworks…</p>
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
</style>
